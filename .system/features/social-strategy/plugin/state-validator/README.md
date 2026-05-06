# social-strategy-state-validator

> **Status (2026-05-06): designed, NOT installable on openclaw 2026.4.25.**
>
> The runtime in this version exposes only 4 hook events (`command`, `command:new`, `command:reset`, `agent:bootstrap`, `gateway:startup`) — there is **no** `before_tool_call` event surface. The handler in this directory is correct against the spec; it just has no event to bind to until openclaw core grows a tool-call hook seam.
>
> Tracked as L2 of Patch O. See `phase-orchestration.md` § "L2 status" for the gap and the upstream-PR path. Until then, L1 (subagent-per-phase), L3 (audit-phase auto-spawn), and L4 (literal templates) carry enforcement.

Hook plugin that intercepts Write/Edit tools targeting `research/social/{run_id}/state.json` (under any project root) and validates the proposed content against `state-schema.json`. Implements Patch J-3a (state schema validation) and Patch O Layer 2 (non-bypassable state-write enforcement).

## What it would do once the hook surface lands

- Listen on the openclaw `before_tool_call` hook (event name TBD by upstream)
- Filter for `toolName ∈ {Write, Edit}` AND `params.target` matching `/research/social/[^/]+/state\.json$`
- Skip `_superseded/` paths (legacy archive writes pass through)
- Parse the proposed content (Write: `params.content`; Edit: current file with `old_string → new_string` applied)
- Validate against `~/dev/workspace/skills/social-orchestrator/references/state-schema.json`
- On schema violation: return `{ block: true, blockReason: "<details>" }` — Write tool surfaces this to the agent; agent must fix the data shape and retry

## Why it would be non-bypassable (once installed)

The hook would run in the openclaw runtime (TypeScript handler executing in the gateway process), not in the LLM reasoning loop. The agent calling Write doesn't see the validator at all — it just sees the Write tool either succeed or report a block. There's no "skip validation" path the agent can reason its way to.

## Custom checks beyond JSON Schema

The handler also enforces one runtime-only invariant that pure JSON Schema can't express:

- **No-mtime-backfill (Patch K-2)**: for every phase block, every entry in `skill_versions_at_read[file].mtime` MUST be ≤ `ran_at`. Backfilled fields (mtime > ran_at) indicate the agent populated `skill_versions_at_read` after the phase ran with current mtimes, not phase-time mtimes. The check is hardcoded in `handler.ts` because it needs comparison logic.

## Format gap

The current openclaw plugin/hook installer expects:

- `HOOK.md` (frontmatter manifest) instead of `plugin.json`
- `handler.js` (compiled JavaScript with bundled openclaw runtime imports) instead of `handler.ts`
- `metadata.openclaw.events: [...]` listing supported event names

Reformatting `plugin.json` → `HOOK.md` is mechanical. Compiling `handler.ts` → `handler.js` against the openclaw runtime barrel imports is also mechanical. Neither is worth doing until the `before_tool_call` event itself exists in openclaw — they would just produce a hook that registers but never fires.

## Path to activation

1. **Upstream PR to openclaw**: add a `tool:before` (or equivalent) hook event. Wire it into the gateway tool-call dispatcher so registered hooks can return `{ block, blockReason }` and short-circuit the call. Surface the block reason to the LLM as a tool error.
2. **Reformat this plugin** to the openclaw hook-pack convention (`HOOK.md` + `handler.js` + bundled runtime imports).
3. **Install via** `openclaw plugins install ~/dev/openclaw/.system/features/social-strategy/plugin/state-validator/`.
4. **Verify** with `openclaw hooks list | grep social-strategy-state-validator`.
5. **Negative test**: write a state.json with `status="full"` (invalid enum) — expect block with the schema violation surfaced as the tool error.

## Integration with Patch O architecture

This plugin is **L2** of the production hardening architecture. The other layers ship today:

- L1 — subagent-per-phase (in `commands/social-strategy.md` § Phase Templates + `references/phase-orchestration.md`)
- L3 — automatic audit-phase spawn (in orchestrator main loop)
- L4 — literal phase templates (in `commands/social-strategy.md` § Phase Templates)

Without L2 wired, the agent can in theory write any shape it wants to state.json and the runtime won't catch the schema violation until the audit fires. The auditor (L3) does catch this — it just catches it on the next loop iteration rather than at the seam. Acceptable until the upstream hook surface lands.

## Schema source-of-truth

The validator reads `~/dev/workspace/skills/social-orchestrator/references/state-schema.json`. To version-lock the schema with the orchestrator skill, this plugin's `handler.ts` resolves the path at load time. If the schema file is updated, the handler picks up the new version on next file mtime change (cached with mtime-key invalidation).

## Future work

- Add `requireApproval` flow for "soft" warnings (currently only `block` for hard fails)
- Extend custom checks beyond no-mtime-backfill (e.g., version_counter monotonicity across writes)
- Wire to `subagent_spawning` hook so the auditor subagent's task contract gets schema-validated too
