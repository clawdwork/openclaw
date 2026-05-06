# Phase Orchestration (Patch O — Production Hardening)

> **Why this exists**: The first grounded run of `/social_strategy` (celavii × instagram, 2026-05-06) revealed that an LLM agent in a single session ignores spec patches that landed mid-session — its skill cache is stale, and self-enforced patches (J-3, J-4) are interpretive, not mechanical. This document specifies the production architecture: each phase runs in a freshly-spawned subagent, state writes are gated by a non-bypassable schema-validator hook, and a separate auditor subagent verifies every phase exit.

## The four enforcement layers

| Layer                            | Mechanism                                                                                                                                                                                                                            | Where it lives                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| L1 — subagent-per-phase          | `sessions_spawn` with fresh context per phase; defeats skill-cache staleness                                                                                                                                                         | This document + `commands/social-strategy.md` Phase Templates section                     |
| L2 — schema validator hook       | `before_tool_call` hook intercepts Write/Edit on `state.json`, validates against `state-schema.json`, blocks invalid writes. **Status: designed, not installed (openclaw 2026.4.25 lacks tool-call hook surface)** — see § L2 status | Plugin scaffold at `.system/features/social-strategy/plugin/state-validator/`             |
| L3 — automatic audit-phase spawn | Orchestrator main loop spawns `social-phase-auditor` after every phase; phase advancement blocks on audit fail                                                                                                                       | `commands/social-strategy.md` Phase Templates § How the orchestrator uses these templates |
| L4 — literal phase templates     | `commands/social-strategy.md` § Phase Templates: each phase's `artifacts_promised[]` and `patches_honored[]` are frozen JSON blocks the agent serializes verbatim, not paraphrases                                                   | `commands/social-strategy.md` Phase Templates section                                     |

## The orchestrator → phase-executor → auditor loop

```
                                    ┌─────────────────────────────────┐
                                    │  ORCHESTRATOR (social-writer)   │
                                    │  - Reads Template[N] verbatim   │
                                    │  - Spawns phase-executor        │
                                    │  - Schema-validates state writes │
                                    │  - Spawns auditor at phase exit │
                                    │  - Halts on audit fail          │
                                    └─────────┬───────────────────────┘
                                              │
                                              │ sessions_spawn(social-phase-executor, task)
                                              ▼
                       ┌─────────────────────────────────────┐
                       │  PHASE EXECUTOR (one per phase)     │
                       │  - Fresh skill cache                │
                       │  - Re-reads SKILL.md / commands     │
                       │  - Executes phase steps             │
                       │  - Writes state.phases.{n} block    │   <── L2 hook fires here:
                       │  - Returns structured payload       │       schema validates
                       └─────────┬───────────────────────────┘
                                 │ returns { status, state_block, banner_md }
                                 ▼
                  ┌──────────────────────────────────────┐
                  │  ORCHESTRATOR resumes                │
                  │  - Merges state_block into state.json│
                  │  - sessions_spawn(social-phase-auditor, "Audit Phase N")
                  └─────────┬────────────────────────────┘
                            │
                            ▼
            ┌──────────────────────────────────────────┐
            │  AUDITOR (social-phase-auditor)          │
            │  - Different model (DeepSeek, not Gemini)│
            │  - Reads Template[N] + state.phases.{n}  │
            │  - Diffs artifacts_promised vs actual    │
            │  - Verifies patches_honored evidence     │
            │  - Returns { status: pass|warn|fail }    │
            └─────────┬────────────────────────────────┘
                      │
                      ▼
              audit pass → advance to phase N+1
              audit warn → log, advance
              audit fail → halt, surface to user, NEVER auto-iterate
```

## Why each layer is non-bypassable

### L1 — subagent-per-phase

Every `sessions_spawn` creates a **new session** with a **fresh context**. The phase executor cannot inherit the orchestrator's "I already read SKILL.md, I know what it says" cached belief. It receives `AGENTS.md + TOOLS.md` only (per `SUBAGENT_BOOTSTRAP_ALLOWLIST`); SKILL.md content must be Read'd explicitly. This forces re-reads to land in fresh context, defeating Patch I-5's chicken-and-egg.

### L2 — schema validator hook

The `before_tool_call` hook for `Write`/`Edit` runs in non-LLM code (TypeScript handler). When the target path matches `*/state.json`, the handler:

1. Parses the proposed `params.content` as JSON
2. Validates against `~/dev/workspace/skills/social-orchestrator/references/state-schema.json`
3. If invalid: returns `{ block: true, blockReason: "Schema violation: <path>: <detail>" }`
4. The Write/Edit tool sees the block and surfaces the reason to the agent
5. The agent MUST fix the data shape; there's no "skip validation" path

This is the only layer that's _physically_ impossible for the agent to bypass — hooks run in the openclaw runtime, not in the LLM's reasoning loop.

#### L2 status (2026-05-06): designed, not installed

The handler at `.system/features/social-strategy/plugin/state-validator/handler.ts` is correct against the spec, but **openclaw 2026.4.25 does not expose a `before_tool_call` hook event**. Available hook events in this runtime are limited to: `command`, `command:new`, `command:reset`, `agent:bootstrap`, `gateway:startup`. The L2 layer therefore cannot fire on Write/Edit calls until openclaw core grows a tool-call hook surface.

Until L2 lands:

- L1 (fresh subagent per phase) prevents stale-skill-cache drift — handles the failure mode Phase 0 of celavii-instagram-2026-05-06 actually hit.
- L3 (auditor subagent) catches the schema violations L2 would catch — just one loop iteration later (after the executor returns) instead of at the seam (mid-write).
- The agent can in theory write malformed state.json. The auditor will flag it as `fail` and the orchestrator will halt phase advancement before the malformed state contaminates downstream phases.

The architecture works without L2; it just has a wider window between violation-introduced and violation-caught. To close the window, see "Path to activation" in the plugin scaffold's README.

Tracked as: openclaw upstream PR (add `tool:before` event), then reformat plugin to `HOOK.md` + `handler.js` openclaw hook-pack convention, then `openclaw plugins install ...`. ~1-2 days upstream + ~1 hour reformat.

### L3 — automatic audit-phase spawn

Audit-phase is currently a SKILL.md exhortation. Patch O moves it from "the agent should run this" to "the orchestrator's main loop spawns this as a side-effect of phase status flipping to complete." The orchestrator code path _unconditionally_ spawns the auditor; the auditor's verdict is read; if `fail`, the orchestrator halts.

The agent doing the orchestration can't choose to skip the auditor any more than it can choose to skip its own next instruction — the orchestrator is a deterministic state machine, not an LLM judgment call. (In the current architecture this is enforced by writing the orchestration logic into `commands/social-strategy.md` as imperative steps the orchestrator-agent must execute. Future Phase O+1: lift this to non-LLM TypeScript code in openclaw-side orchestrator.)

### L4 — literal phase templates

Spec drift comes from agents _interpreting_ what a phase needs. Templates eliminate the interpretation surface: every phase's `artifacts_promised[]` is a frozen list of state-field paths and file paths. The agent's only job is to populate them. Missing entry = audit catches it. No paraphrasing allowed.

## Subagent definitions

Two new agents required in `~/dev/config/openclaw.json#agents.list`:

Add these two entries to `~/dev/config/openclaw.json#agents.list` (placement: alongside `social-research` and `social-writer`). The exact JSON pattern matches the existing social-\* agents:

### `social-phase-executor`

```json
{
  "id": "social-phase-executor",
  "name": "Social Phase Executor",
  "workspace": "/Users/operator/dev/workspace",
  "model": "google/gemini-3.1-pro-preview",
  "thinkingDefault": "medium",
  "skills": [
    "social-orchestrator",
    "social-discover",
    "social-competitor-scrape",
    "social-research",
    "social-aggregate",
    "social-plan",
    "social-brief",
    "social-trend-detect",
    "social-cannibalization",
    "social-persona",
    "social-hooks",
    "social-script",
    "social-shotlist",
    "social-sxo",
    "social-factcheck",
    "social-drift",
    "social-repurpose",
    "celavii-discover",
    "celavii-profiles",
    "celavii-data-ops",
    "celavii-jobs",
    "celavii-platforms",
    "celavii-analytics",
    "celavii-knowledge",
    "celavii-campaigns",
    "celavii-crm",
    "celavii-social"
  ],
  "identity": { "name": "PhaseExecutor", "emoji": "⚙️" },
  "subagents": { "thinking": "medium" },
  "tools": { "exec": { "backgroundMs": 600000, "timeoutSec": 1200 } }
}
```

**Task contract** (informational, not in JSON config):

- Input: `{ phase: "<phase_id>", run_id: "<id>", state_path: "<abs path>", template: "<verbatim Template[N] from commands/social-strategy.md>" }`
- Output: `{ status: "ok"|"fail", state_block: <full phases.{n} block>, banner_md: <rendered banner>, raw_files_written: [<paths>] }`

### `social-phase-auditor`

```json
{
  "id": "social-phase-auditor",
  "name": "Social Phase Auditor",
  "workspace": "/Users/operator/dev/workspace",
  "model": {
    "primary": "openrouter/deepseek/deepseek-v4-pro",
    "fallbacks": ["google/gemini-3.1-pro-preview"]
  },
  "thinkingDefault": "low",
  "skills": ["social-quality", "social-orchestrator"],
  "identity": { "name": "PhaseAuditor", "emoji": "🛂" },
  "subagents": { "thinking": "low" },
  "tools": { "exec": { "backgroundMs": 120000, "timeoutSec": 300 } }
}
```

**Task contract** (informational):

- Input: `{ phase: "<phase_id>", run_id: "<id>", state_path: "<abs path>", template: "<verbatim Template[N]>" }`
- Output: `{ status: "pass"|"warn"|"fail", checks_run: <int>, findings: [{check: <id>, severity: <level>, message: <text>}] }`

The model split (Gemini-3.1-Pro executor on Google, DeepSeek-V4-Pro auditor on OpenRouter with Gemini-3.1-Pro fallback) honors Article 7's cross-model critic boundary in normal operation. Under fallback both end up Gemini — Article 7 violated as documented degraded mode (the auditor's independence collapses but the pipeline continues; flag in logs for review). Models are swappable: any pair from `{Anthropic, OpenRouter (DeepSeek/Kimi/GLM), Google}` works as long as `executor.model ≠ auditor.model.primary`.

### Install steps (after editing openclaw.json)

```bash
# 1. Validate config
openclaw doctor

# 2. Restart gateway to pick up new agents
launchctl stop ai.openclaw.gateway && sleep 2 && launchctl start ai.openclaw.gateway

# 3. Verify agents are registered
openclaw agents list 2>&1 | grep "social-phase-"
# expect:
#   social-phase-executor    Social Phase Executor    ⚙️
#   social-phase-auditor     Social Phase Auditor     🛂
```

## Validator plugin (L2) install

**Not installable on openclaw 2026.4.25** — see § L2 status above. The plugin scaffold lives at `~/dev/openclaw/.system/features/social-strategy/plugin/state-validator/` (manifest + TypeScript handler) but cannot be wired until openclaw core exposes a tool-call hook event. The plugin's README documents the upstream-PR path to activation.

## Failure semantics

| Layer fires                                             | Result                                                                                                                 | Recovery                                                                                                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| L2 schema validator blocks a Write                      | Phase executor receives block reason; must fix data shape and retry. **Currently inactive** — fall through to L3 catch | Phase executor's next attempt; iteration counted toward Article 8 cap                                                                           |
| L3 audit returns `fail`                                 | Orchestrator halts phase advancement                                                                                   | User reviews findings; either remediates (re-spawn phase executor) or accepts deviation with documented `cross_model_exception` / similar field |
| L1 subagent fails to spawn                              | Orchestrator falls back to inline execution with prominent warning                                                     | Logged as `phase_orchestration_degraded`; auditor still runs                                                                                    |
| L4 template lookup fails (template missing for a phase) | Hard fail at orchestrator startup                                                                                      | Spec bug; cannot proceed                                                                                                                        |

## Migration path from current single-agent execution

The current `/social_strategy` runs all 7 phases inline in the orchestrator. Patch O transitions to subagent-per-phase. Two-step migration:

1. **Step 1** (this patch): document the architecture; add agent definitions to openclaw.json; install validator plugin; update SKILL.md and commands. Agent behavior changes immediately on next run.
2. **Step 2** (future, optional): lift orchestration logic from SKILL.md prose to TypeScript code in `openclaw/src/agents/social-orchestrator/*.ts`. Removes the last self-enforcement gap (currently the orchestrator-agent could in theory skip the spawn loop). Not required for Patch O — the architecture works even with prose-driven orchestration as long as the orchestrator-agent's spec is unambiguous.

## Anti-patterns

- ❌ Calling phase steps inline in the orchestrator and then spawning a "fake" auditor — defeats L1's purpose; subagent must do real work
- ❌ Skipping the auditor when the phase "obviously" succeeded — auditor is unconditional
- ❌ Catching the audit `fail` and re-running the phase 3+ times before surfacing — Article 8 caps at 3, but auditor results SHOULD surface to user before the 3rd retry
- ❌ Pre-populating `state.phases.{n}` from the orchestrator before spawning the executor — every phase's state block is written by its executor, not by the orchestrator
- ❌ Validator plugin reading the schema from a path that isn't versioned with the orchestrator skill — the schema must be the same one referenced in `commands/social-strategy.md`; a symlink keeps them aligned
