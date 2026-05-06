# social-strategy-state-validator

Hook plugin that intercepts Write/Edit tools targeting `*/research/social/{run_id}/state.json` and validates the proposed content against `state-schema.json`. Implements Patch J-3a (state schema validation) and Patch O Layer 2 (non-bypassable state-write enforcement).

## What it does

- Listens on the openclaw `before_tool_call` hook
- Filters for `toolName ∈ {Write, Edit}` AND `params.target` matching `/research/social/[^/]+/state\.json$`
- Skips `_superseded/` paths (legacy archive writes pass through)
- Parses the proposed content (Write: `params.content`; Edit: current file with `old_string → new_string` applied)
- Validates against `~/dev/workspace/skills/social-orchestrator/references/state-schema.json`
- On schema violation: returns `{ block: true, blockReason: "<details>" }` — Write tool surfaces this to the agent; agent must fix the data shape and retry

## Why it's non-bypassable

The hook runs in the openclaw runtime (TypeScript handler executing in the gateway process), not in the LLM reasoning loop. The agent calling Write doesn't see the validator at all — it just sees the Write tool either succeed or report a block. There's no "skip validation" path the agent can reason its way to.

## Custom checks beyond JSON Schema

The handler also enforces one runtime-only invariant that pure JSON Schema can't express:

- **No-mtime-backfill (Patch K-2)**: for every phase block, every entry in `skill_versions_at_read[file].mtime` MUST be ≤ `ran_at`. Backfilled fields (mtime > ran_at) indicate the agent populated `skill_versions_at_read` after the phase ran with current mtimes, not phase-time mtimes. The check is hardcoded in `handler.ts` because it needs comparison logic.

## Install

After `pnpm install` and openclaw build:

```bash
# Copy plugin scaffold into the runtime plugins directory
mkdir -p ~/.openclaw/plugins/social-strategy-state-validator
cp -r ~/dev/openclaw/.system/features/social-strategy/plugin/state-validator/* \
      ~/.openclaw/plugins/social-strategy-state-validator/

# Reload plugin registry
openclaw plugin reload

# Verify the hook is registered
openclaw hooks list | grep social-strategy-state-validator
```

## Test

```bash
# Negative test: write a state.json with status="full" (invalid enum) — expect block
echo '{"version_counter":1,"intake":{},"phases":{"acquire":{"status":"full"}}, ...}' > /tmp/bad-state.json
# Through openclaw Write tool — should fail with blockReason
```

## Integration with Patch O architecture

This plugin is **L2** of the production hardening architecture. The other layers:

- L1 — subagent-per-phase (in `commands/social-strategy.md` § Phase Templates + `references/phase-orchestration.md`)
- L3 — automatic audit-phase spawn (in orchestrator main loop)
- L4 — literal phase templates (in `commands/social-strategy.md` § Phase Templates)

Without L2 wired, the agent can write any shape it wants to state.json and the runtime won't catch the schema violation until the audit fires. With L2, malformed writes are blocked at the seam, agent gets immediate feedback, and the audit only catches semantic drift (e.g., did the phase actually do what its template promised), not structural drift.

## Schema source-of-truth

The validator reads `~/dev/workspace/skills/social-orchestrator/references/state-schema.json`. To version-lock the schema with the orchestrator skill, this plugin's `handler.ts` resolves the path at load time. If the schema file is updated, the handler picks up the new version on next file mtime change (cached with mtime-key invalidation).

## Future work

- Add `requireApproval` flow for "soft" warnings (currently only `block` for hard fails)
- Extend custom checks beyond no-mtime-backfill (e.g., version_counter monotonicity across writes)
- Wire to `subagent_spawning` hook so the auditor subagent's task contract gets schema-validated too
