---
name: social-strategy
description: >
  /social_strategy — 7-phase social-media strategy pipeline (ACQUIRE → DISCOVER →
  ANALYZE → AGGREGATE → PLAN → DELIVER → REPORT) with critic gates A and B.
  Mirrors /seo_strategy. Cross-model critic + 3-iteration cap enforced at every
  gate. Outputs publication calendar + per-post briefs + print-ready PDF.
---

# /social_strategy

> **Phase D contract.** Mirrors [`workspace/skills/seo/commands/seo-strategy.md`](file:///Users/operator/dev/workspace/skills/seo/commands/seo-strategy.md) (1232 lines). 7 phases + 2 gates + remediation loop. Atomic skills (Phase B) handle the work; this command is the wiring.

---

## Help

```
/social_strategy                          → run end-to-end (intake first)
/social_strategy resume                   → continue from checkpoint
/social_strategy phase=N                  → run specific phase only (0–6)
/social_strategy gate=a|b                 → re-run a gate against current state
/social_strategy remediate                → Phase 2B targeted remediation
/social_strategy refresh                  → quarterly refresh (skips intake)
/social_strategy dry-run                  → cost/credit estimate without execution
/social_strategy help                     → this block
```

**Output**: `~/dev/workspace/projects/{project}/research/social/{run_id}/` populated with `state.json`, `aggregate-report.{md,json}`, `calendar.{md,json}`, `briefs/*.md`, `phase-audits/*.md`, `preflight-banners/*.md`, plus the print-ready HTML deliverable in `deliverables/social-report.html`. The project's `research/social/INDEX.md` gets a row for this run. See [`references/run-id-derivation.md`](../references/run-id-derivation.md) for the `run_id` derivation rule (Patch N).

**Cost**: ~$8–14 + Apify scrape costs (Tier-1 ops only). See [§ Cost Estimate](#cost-estimate).

---

## Trigger

User says any of: `/social_strategy`, "build social strategy", "plan our social calendar end-to-end". For a single channel/platform see `/social_post` (Phase F1) or `/social_curate week=...` (Phase E).

---

## Intake Flow (REQUIRED — run before any phase)

### Step 1: Check for existing state (Patch N — read INDEX.md, NOT file-glob)

```bash
cat ~/dev/workspace/projects/{project}/research/social/INDEX.md 2>/dev/null
```

INDEX.md is the per-project run manifest (see [`references/INDEX-template.md`](../references/INDEX-template.md)). Surface rows where `status ∈ {running, awaiting_user, failed}` as resume candidates; default to most-recently-started.

If INDEX.md doesn't exist: the project has never run `/social_strategy` under Patch N. Check for legacy `social-strategy-state.json` at the un-scoped path; if present, prompt the user to mark it `legacy_pre_patch_n` in a new INDEX.md before starting fresh (do not delete; archive to `_superseded/`).

A user-confirmed resume reads `state.json` from the matching run's folder (`research/social/{run_id}/state.json`), NOT the legacy un-scoped path.

### Step 2: Five Questions (one at a time, Telegram-friendly)

Per [`references/intake-questions.md`](../references/intake-questions.md). Ask each in isolation; wait for answer before proceeding.

1. **Channels** — "Which brand/persona channels are we planning for? (e.g. `elioth, celavii, cutmaster`)"
2. **Identities** — "For each channel: handle per platform (IG/TT/X/YT) + 1-line identity."
3. **Goal** — "Single sentence: what should this strategy accomplish in the next 90 days?"
4. **Competitors** — "Top 3 competitors per channel (handles, any platform)."
5. **Voice rules** — "Forbidden phrases + required terms. (Pulls defaults from `~/dev/workspace/.styles/celavii/voice.json`; this layers project-specific overrides on top.)"

After the final question (Q5 for founder channels, Q5 with Q2.5 also asked for product/utility channels): write `state.intake = { channels, identities, product_description?, goal, competitors_per_channel, voice_rules, channel_e_mix_targets, differentiators, business_concept, banned_language, channel_types, locked: true }`.

### Step 3: Auto-derive

Auto-fill from intake without asking:

- `intake.channel_types[]` — derived per channel: founder | product | utility (drives D16 industry-aware delegation)
- `intake.business_concept` — synthesized from identities + goal (used by Gate A; **no gate may score without reading this**)
- `intake.banned_language` — merged from voice.json + Q5

---

## Inputs

- `~/dev/workspace/.styles/{project}/voice.json` (NN/g 4-D + tone-by-context)
- `~/dev/workspace/.styles/{project}/brand.json` (colors, taglines)
- `intake` block built by Step 2 above

## Output (Patch N — per-run scoping)

```
~/dev/workspace/projects/{project}/research/social/
├── INDEX.md                                              ← cross-run manifest (Patch N)
└── {run_id}/                                             ← e.g. celavii-instagram-2026-05-06
    ├── state.json                                        ← single source of truth (was social-strategy-state.json)
    ├── preflight-banners/                                ← Patch J-3b artifacts (one per phase)
    │   ├── 0-acquire.md ... 6-report.md
    ├── phase-audits/                                     ← Patch J-4 artifacts (one per phase exit)
    │   ├── 0-acquire.md ... 6-report.md
    ├── raw/                                              ← all scraped JSONs (social-discover, competitor-scrape)
    ├── aggregate-report.md, aggregate-report.json        ← Phase 3 outputs (no date suffix — folder is dated)
    ├── calendar.md, calendar.json                        ← Phase 4 outputs
    ├── gate-a-report.md, gate-b-report.md                ← critic verdicts
    ├── briefs/                                           ← Phase 5 outputs
    │   ├── {channel}-{platform}-001-brief.md ... NNN
    │   └── {channel}-{platform}-001-hooks.md ...
    └── deliverables/
        └── social-report.html                            ← Phase 6 print-ready single-file
```

`run_id` is computed at Phase 0 entry per [`references/run-id-derivation.md`](../references/run-id-derivation.md). Format: `{channel-list}-{platform-list}-{YYYY-MM-DD}[-r{N}]`.

## Data Persistence

State file is the single source of truth. Every phase writes to it; every phase reads its inputs from it (not from disk-search). Schema: `social-strategy-state.json` per [v3 spec](file:///Users/operator/dev/workspace/projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md).

```jsonc
{
  "version": 3,                            // schema version (only changes when state shape changes)
  "version_counter": 47,                   // increments by 1 on EVERY write — see § State Versioning below
  "project": "celavii",
  "intake": {
    // ...
    "competitors_per_channel": {
      "{channel}": {
        "handles": [],                  // confirmed competitor handles; empty until research_complete
        "status": "research_needed",    // user_provided | research_needed | research_needed_partial | research_complete
        "confirmed_at": null,           // iso when status flipped to research_complete
        "hypotheses": []                // optional priors from intake; not authoritative
      }
    }
  },
  "phases": {
    "acquire": {
      "status": "complete",                 // see § Status Semantics below
      "state_version_at_read": 12,          // version_counter when this phase started reading state (Patch I-1)
      "state_version_at_write": 15,         // version_counter immediately after this phase finished writing (Patch I-1)
      "skill_versions_at_read": {           // file mtimes captured at phase entry (Patch I-5)
        "social-orchestrator/SKILL.md":      { "mtime": "2026-05-04T22:13:00Z", "size_bytes": 8421 },
        "references/social-constitution.md": { "mtime": "2026-05-04T22:14:00Z", "size_bytes": 5102 },
        "commands/social-strategy.md":       { "mtime": "2026-05-04T23:50:00Z", "size_bytes": 32014 },
        "references/intake-questions.md":    { "mtime": "2026-05-04T22:30:00Z", "size_bytes": 4200 }
      },
      "raw_files": [],
      "pre_launch": {                       // map of (channel × platform) booleans
        "{channel}": { "{platform}": false }
      },
      "competitor_discovery": {             // present only if Phase 0.5a ran
        "status": "research_complete",      // pending | research_in_progress | research_complete (user-confirmed)
        "candidates_surveyed": 20,
        "candidates_surfaced": 5,
        "candidates_confirmed": ["@h1", "@h2", "@h3"],   // populated ONLY after user confirms
        "off_platform_competitors": [       // see Patch B — competitors that don't live on the target platform
          {
            "name": "davinci-resolve-mcp",
            "platform": "github",
            "url": "https://github.com/...",
            "threat_level": "high",
            "youtube_channel": null,
            "monitor": true,                // re-check next refresh cycle
            "rationale": "..."
          }
        ]
      }
    },
    "discover":  { "status": "complete", "baselines": {...} },
    "analyze":   { "status": "complete", "patterns": {...} },
    "aggregate": { "status": "complete", "report_path_md": "...", "scored_topics_count": 73 },
    "plan":      { "status": "complete", "publication_calendar": [...] },
    "deliver":   { "status": "complete", "briefs": [...] },
    "report":    { "status": "complete", "pdf_path": "..." }
  },
  "gates": {
    "A": { "iteration": 1, "status": "pass", "critic_model": "opus", "generator_model": "sonnet", "score": 8.2 },
    "B": { "iteration": 1, "status": "pass" }
  },
  "weekly_cycles": []
}
```

---

## Execution Model

### Per-phase agent + thinking levels

| Phase            | Generator     | Critic             | Thinking | Notes                                              |
| ---------------- | ------------- | ------------------ | -------- | -------------------------------------------------- |
| 0 — ACQUIRE      | Sonnet        | (none)             | low      | Mostly tool calls (`social-discover`)              |
| 1 — DISCOVER     | 15× parallel  | (none)             | low      | One subagent per (channel × platform), see D15     |
| 2 — ANALYZE      | Sonnet        | (none)             | medium   | Pattern extraction; deterministic where possible   |
| 3 — AGGREGATE    | **Python**    | (none)             | n/a      | `social-aggregate` — no LLM in aggregation         |
| Gate A           | Sonnet        | **Opus**           | medium   | Cross-model required (D18); reads state.intake     |
| 2B — REMEDIATION | Sonnet        | (none)             | low      | Targeted re-scrapes only; loops back through 3+A   |
| 4 — PLAN         | Sonnet        | (none)             | medium   | Calendar + Gary Vee fan-out (D21)                  |
| Gate B           | Sonnet        | **Opus**           | medium   | Cannibalization + cadence + repurposing-loop check |
| 5 — DELIVER      | Sonnet (loop) | (per-brief Gate C) | medium   | Loops `social-brief` over top N planned posts      |
| 6 — REPORT       | Sonnet        | Opus (PDF QA)      | low      | Next.js scaffold + populate; manual print to PDF   |

### Cross-model critic rule (D18)

Generator and critic MUST be different models. Hard fail if same. Default: Sonnet generates, Opus critiques. Per [social-constitution Article 7](../references/social-constitution.md).

### Iteration cap (D19)

Each gate caps at **3 iterations**. After third fail → escalate to human review; do not auto-iterate. Per [Article 8](../references/social-constitution.md). Iteration counter lives in `state.gates.{A,B}.iteration`.

---

## Advisory Re-Surfacing (Patch M, added 2026-05-05 from cutmasterai dry-run F47/F56)

`state.advisories[]` accumulates contract surface that needs human attention but doesn't block phase execution (e.g., "register this handle before going live", "API quota approaching limit"). Advisories with `user_response == "deferred"` MUST be re-surfaced at every output-generation phase until either the user response changes to `acknowledged` / `resolved` OR the advisory's `re_surface_until` timestamp passes.

### When to re-surface (mandatory)

Every output-generation phase scans `state.advisories[]` at phase entry and re-surfaces matching advisories in its output:

| Phase               | Re-surface mechanism                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| 4 PLAN              | Top-of-file banner in `calendar-{date}.md` AND a "Pending Advisories" section listing all deferred ones |
| 5 DELIVER           | `briefs/README.md` banner; each brief frontmatter gets `pending_advisories: [...]` array                |
| 6 REPORT            | Executive-summary banner section; report PDF first-page callout; report's "Open Items" appendix         |
| Telegram completion | Final summary message lists deferred advisories: "⚠️ N advisories pending: 1) {advisory text} ..."      |

### Selection criteria

Filter `state.advisories[]` for entries where:

- `user_response == "deferred"` OR `user_response == null`
- AND (`re_surface_until` is absent OR `re_surface_until > now()`)
- AND `re_surface_at_phases[]` includes the current phase (default: all output-generation phases)

### Banner format

Markdown re-surface banner template (used in calendar.md, briefs/README.md, report executive summary):

```markdown
> ⚠️ **Pending Advisory**: {advisory.message}
> _Severity: {advisory.severity} · Raised: {advisory.raised_at} · Last user response: {user_response} ({user_response_at})_
```

Multiple advisories stack; each gets its own block.

### State capture

Each output-generation phase records into its phase block:

```jsonc
state.phases.{name}.advisories_resurfaced = [
  { "advisory_index": 0, "where": "calendar.md top banner" },
  { "advisory_index": 0, "where": "briefs/README.md" }
]
```

This lets retroactive audits verify the advisory mechanism actually fired (vs the cutmasterai bug where advisories sat untouched in state across multiple phases).

### Anti-patterns

- ❌ Sitting on advisories in state without surfacing them — defeats the entire feature
- ❌ Surfacing only at Phase 6 REPORT — calendar generation is where users still have time to act
- ❌ Modifying the advisory entry itself (e.g., setting `acknowledged` without user input) — only user response can flip status
- ❌ Cross-channel pollution — advisory tagged for `channel: cutmaster` should only surface in cutmaster outputs, not other channel outputs in the same project
- ❌ Skipping `state.phases.{name}.advisories_resurfaced` capture — without this field, audits can't prove the advisory mechanism worked

### cutmasterai dry-run gap

The handle-squat advisory raised at 2026-05-05T02:25 was deferred by user at 02:55 with note "Re-surface advisory at Phase 5 DELIVER (calendar generation) and Phase B brief delivery." Phase 4 v2 calendar did not surface it. Phase 5 briefs did not surface it. The advisory feature was effectively non-functional. Patch M makes re-surface mandatory and auditable.

---

## Skill Versioning (Patch I-5, added 2026-05-04 from cutmasterai dry-run F45)

State versioning (Patch I-1) catches changes to the _data_ the agent operates on. Skill versioning catches changes to the _rules_ the agent operates by — SKILL.md, references/, commands/. When skill files are edited mid-session (e.g., a spec hardening pass while a dry-run is in progress), the agent's working memory has the pre-edit content cached from session start. Re-reading state doesn't help — state.json doesn't track skill changes.

### The rule

At every phase entry, the orchestrator MUST re-read (via the Read tool, not implicit skill cache) the skill files this phase depends on. This refreshes their content in working memory and captures their current state for audit.

Mandatory phase-entry skill re-reads:

| Phase               | Files to re-read                                                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All phases (always) | `social-orchestrator/SKILL.md` + `references/social-constitution.md` + `references/critic-intake-rule.md` + `references/status-semantics.md` + `references/research-mode.md` (when `run_mode=research`) |
| 0 ACQUIRE           | + `references/intake-questions.md` + `references/tiered-credentials.md` + `commands/social-strategy.md` § Phase 0                                                                                       |
| 0.5a Comp Discovery | + `social-discover/SKILL.md` Mode F                                                                                                                                                                     |
| 1 DISCOVER          | + `references/parallel-subagent-spawn.md` + `references/industry-aware-delegation.md` + `commands/social-strategy.md` § Phase 1                                                                         |
| 2 ANALYZE           | + `social-aggregate/references/scoring-rubric.md` + `commands/social-strategy.md` § Phase 2                                                                                                             |
| 3 AGGREGATE         | + `social-aggregate/SKILL.md` + `commands/social-strategy.md` § Phase 3                                                                                                                                 |
| Gate A              | + `social-quality/SKILL.md` § gate-a + `references/critic-intake-rule.md`                                                                                                                               |
| 4 PLAN              | + `references/format-as-channel.md` + `references/gary-vee-fan-out.md` + `commands/social-strategy.md` § Phase 4                                                                                        |
| Gate B              | + `social-quality/SKILL.md` § gate-b + `social-cannibalization/SKILL.md`                                                                                                                                |
| 5 DELIVER           | + `social-brief/SKILL.md` + `social-script/SKILL.md` + `commands/social-strategy.md` § Phase 5                                                                                                          |
| Gate C (per-post)   | + `social-quality/SKILL.md` § gate-c                                                                                                                                                                    |
| 6 REPORT            | + `commands/social-strategy.md` § Phase 6                                                                                                                                                               |

### State capture

Each phase records into its phase block:

```jsonc
state.phases.{name}.skill_versions_at_read = {
  "social-orchestrator/SKILL.md":            { "mtime": "<iso>", "size_bytes": 8421 },
  "references/social-constitution.md":       { "mtime": "<iso>", "size_bytes": 5102 },
  "commands/social-strategy.md":             { "mtime": "<iso>", "size_bytes": 32014 },
  // ... per the phase's mandatory list
}
```

`mtime` from filesystem stat or git blob hash if available — either suffices to detect change. `size_bytes` is a cheap secondary signal (catches mtime-touched files with no content change).

### Audit invariant

A retroactive audit can detect skill-staleness incidents by comparing `state.phases.{n}.skill_versions_at_read[file].mtime` against `state.phases.{n+1}.skill_versions_at_read[file].mtime`. If `n+1 > n`, a skill file changed between phases — the audit can correlate that against any subsequent gate-fail to identify "Patch X landed mid-run between phase A and phase B."

### Anti-patterns

- ❌ Reading skills once at session start and trusting them across multiple phases — this is exactly the bug F45 surfaced
- ❌ Re-reading only when the user explicitly says "the spec changed" — relies on the user knowing the spec changed, which they often won't
- ❌ Skipping skill re-read because "I just read these last phase" — phases are independent contexts; the rule is uniform
- ❌ Re-reading skills but not capturing `skill_versions_at_read` — the audit invariant only works if every phase records what it read
- ❌ Trusting the harness skill cache to invalidate — in openclaw, skills load once per agent invocation; mid-session reloads aren't automatic. The `Read` tool is the only reliable refresh mechanism.

---

## State Versioning (Patch I-1, added 2026-05-04 from cutmasterai dry-run F35a)

State files carry a `version_counter` integer that increments by 1 on **every write** — including manual edits, agent writes, and parallel-subagent merges. This is the canonical "did the state change since I last read it" signal.

### Three rules

1. **Increment-on-write**: any actor (orchestrator, subagent, user, linter) writing to the state file MUST `version_counter += 1` AND update `updated` timestamp. No exceptions.

2. **Read-then-pin at phase entry**: every phase MUST re-read the state file at phase start and capture `state_version_at_read` into its phase block. The orchestrator does NOT trust cached values from prior phase contexts.

3. **Write-checkpoint at phase exit**: every phase records `state_version_at_write` after its final state write. This lets retroactive audits detect interleaved external edits (`state_version_at_write - state_version_at_read > {edits the phase itself made}` = something else wrote between read and write).

### Why this matters

cutmasterai dry-run, 2026-05-04: intake.voice_rules.4e_mix_targets was manually revised between Phase 2 and Phase 3 (70/10/10/10 → 60/20/10/10). Phase 3 generated the aggregate report from cached Phase 2 outputs and never re-read intake. Gate A then scored against the stale aggregate report. The inconsistency went undetected because no mechanism flagged "state changed under your feet."

Version counter solves this: at Gate A entry, the agent sees `state.phases.aggregate.state_version_at_read = 24` but `state.version_counter = 31` — meaning 7 writes happened between Phase 3 reading state and now. The agent MUST re-read everything that's not stable (intake is one such thing), or explicitly justify why cached values are still valid.

### Mandatory re-read list at phase entry

Every phase re-reads at minimum:

- `state.intake` (entire block)
- `state.run_mode` + run-mode metadata
- `state.advisories[]`
- `state.phases.{n-1}.*` for any prior phases this phase consumes outputs from
- `state.gates.*` for prior gate verdicts

The phase MAY cache its own write-target sub-tree mid-phase (to avoid re-reading what it just wrote), but at phase exit the cache is dropped and the next phase re-reads from disk.

### Anti-patterns

- ❌ Reading state once at session start and assuming it stays valid across phases — manual edits, parallel writes, and refresh runs all break this assumption
- ❌ Bumping `updated` without bumping `version_counter` — the timestamp drifts with linter saves and isn't reliable for change detection
- ❌ Skipping `state_version_at_read` recording because "nothing changed" — the whole point is to record it BEFORE you know whether things changed
- ❌ Relying on `state_version_at_read` to be monotonic per phase: parallel subagents may have different read-versions for the same phase. Use the orchestrator's read-version as the canonical one.

---

## Run Mode Detection (pre-flight)

Before Phase 0 starts, the orchestrator detects whether to run in **live** or **research** mode. Per [`references/research-mode.md`](../references/research-mode.md):

- Live: `CELAVII_API_KEY` set + relevant platform adapters enabled
- Research: API unavailable / quota_exceeded / adapter gated → fallback to web search + manual reasoning

On research-mode entry: emit Telegram banner, set `state.run_mode = "research"`, and apply per-phase behavior changes documented in `research-mode.md`. Every phase write under research mode adds a `research_mode_metadata` block with `confidence: "qualitative"`. Gate A reads this block to scope its scoring.

---

## Instruction-Following Enforcement (Patches J-3 / J-4, added 2026-05-06)

The cutmasterai dry-run surfaced a class of bug where agents emitted spec-violating outputs (backfilled `skill_versions_at_read` with current mtimes; brief tiers chosen without spec authorization; advisories never re-surfaced despite Patch M's mandate). The pattern: spec is correct, agent doesn't follow it. Three enforcement layers close this:

### J-3a — State write schema validation

Every `phases.{n}` block written to `social-strategy-state.json` MUST pass JSON schema validation BEFORE the write lands. Schema lives at [`references/state-schema.json`](state-schema.json) (authored alongside this section).

Required fields per phase block (enforced as schema `required: [...]`):

| Phase       | Required fields                                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `acquire`   | `status`, `ran_at`, `state_version_at_read`, `state_version_at_write`, `skill_versions_at_read`, `intake_complete`, `competitor_discovery.status`, `raw_files[]`                   |
| `discover`  | `status`, `ran_at`, `state_version_at_*`, `skill_versions_at_read`, `data_source[ch][p]`, `baselines` ⊕ `projections` (per `data_source` discriminator), `spawn_path`              |
| `analyze`   | `status`, `ran_at`, `state_version_at_*`, `skill_versions_at_read`, `patterns`, `competitive_format_analysis`                                                                      |
| `aggregate` | `status`, `ran_at`, `state_version_at_*`, `skill_versions_at_read`, `pillars[]`, `cannibalization`, `trend_signals`, `output_path`, `run_metadata.{generator_model, critic_model}` |
| `plan`      | `status`, `ran_at`, `state_version_at_*`, `skill_versions_at_read`, `calendar_path`, `cadence_per_channel`, `advisories_resurfaced[]`                                              |
| `deliver`   | `status`, `ran_at`, `state_version_at_*`, `skill_versions_at_read`, `briefs[].brief_type`, `briefs[].path`, `advisories_resurfaced[]`                                              |
| `report`    | `status`, `ran_at`, `state_version_at_*`, `skill_versions_at_read`, `deliverable_path`, `advisories_resurfaced[]`                                                                  |

Schema additionally enforces:

- `skill_versions_at_read[file].mtime` cannot exceed `ran_at` (catches Patch K-2 backfill at write time, not gate time)
- `state_version_at_write > state_version_at_read` (the phase must have written at least once)
- `data_source` discriminator: if `data_source[ch][p] == "projections_only"`, `baselines.{ch}.{p}` MUST be absent or empty (Patch F)
- `briefs[].brief_type ∈ {"full", "skeletal"}` (Patch L) — schema rejects null or other strings

Implementation: orchestrator wraps every state-mutating step in a small validator (`scripts/validate-state-write.py` reading `references/state-schema.json`). A failed schema check halts the phase with the specific violation message; agent is told to fix the field, not the whole phase.

### J-3b — Phase pre-flight banner

BEFORE entering any phase, the orchestrator emits a structured banner to Telegram (and stdout). The banner names the phase, lists every patch the phase honors, and enumerates the artifacts the phase will produce. Format:

```
═══════════════════════════════════════════════════════════
PHASE 4 PRE-FLIGHT — PLAN
═══════════════════════════════════════════════════════════
Run mode: research
State version at entry: 27
Skills loaded (mtime):
  - social-orchestrator/SKILL.md           2026-05-06T12:00:00Z
  - social-orchestrator/commands/...md     2026-05-06T13:30:00Z
  - social-plan/SKILL.md                   2026-05-04T09:00:00Z
  - social-quality/SKILL.md                2026-05-06T15:00:00Z

Patches honored this phase:
  ✓ Patch A — Pre-launch path branch
  ✓ Patch E — Single-channel fast path
  ✓ Patch F — Baselines vs projections discriminator
  ✓ Patch G — Research mode
  ✓ Patch I-1 — State versioning
  ✓ Patch I-5 — Skill versioning
  ✓ Patch K-1 — No research-mode versioning exception
  ✓ Patch K-2 — Backfill detection
  ✓ Patch L — Brief tier definition (forwarded to Phase 5)
  ✓ Patch M — Advisory re-surfacing

Artifacts I will produce:
  - calendar-{date}.md + calendar-{date}.json
  - state.phases.plan.{calendar_path, cadence_per_channel, advisories_resurfaced[]}
  - state.advisories[].surfaced_in_phase = "plan" (for any deferred advisory matching surface criteria)

Open advisories at entry (Patch M):
  - handle-squat-cutmasterai (status: deferred, re-surface_until: 2026-05-15)

Beginning Phase 4 in 0s — say STOP to abort.
═══════════════════════════════════════════════════════════
```

Why this works: the banner forces the agent to _commit_ to specific artifacts before producing them. Mid-phase drift (e.g., "I'll just skip the advisory re-surface because the brief is taking too long") becomes auditable — the post-phase auditor (J-4) compares actual state writes against banner promises.

The orchestrator MUST emit this banner. Skipping it is a hard fail at Gate A `phase_preflight_present` check (Patch J-3b enforcement, added below).

### J-4 — Post-phase auditor

After every phase exits, before the next phase begins, the orchestrator runs `social-quality audit-phase --phase {n}`. This is a new sub-mode of `social-quality` (see [`social-quality/SKILL.md § Mode audit-phase`](../../social-quality/SKILL.md)). The auditor:

1. Loads the phase pre-flight banner from `state.phases.{n}.preflight_banner` (orchestrator must persist the banner alongside the phase block)
2. Diffs banner promises vs actual state writes in `state.phases.{n}`:
   - Every artifact path the banner listed must exist on disk
   - Every state field the banner enumerated must be present and non-null
   - Every patch the banner claimed to honor must show evidence (e.g., Patch I-1 evidence = `state_version_at_*` fields populated; Patch M evidence = at least one entry in `advisories_resurfaced[]` if deferred advisories were open at entry)
3. Emits `state.phases.{n}.audit = {status: "pass|warn|fail", findings: [...]}` and writes a markdown audit log to `phase-audit-{date}-{n}.md`
4. On `fail`: orchestrator MUST NOT advance to phase {n+1} until the discrepancy is resolved (rebuild phase or document the deliberate deviation)

The auditor catches every cutmasterai-class bug pre-emptively: backfilled fields, missed advisory re-surfaces, brief tier omissions, schema violations that slipped through J-3a, etc.

### Banner-promise schema (state.phases.{n}.preflight_banner)

```json
"preflight_banner": {
  "phase": "plan",
  "emitted_at": "2026-05-06T15:30:00Z",
  "run_mode": "research",
  "state_version_at_entry": 27,
  "skill_versions_at_read_snapshot": { ... },
  "patches_honored": ["A","E","F","G","I-1","I-5","K-1","K-2","L","M"],
  "artifacts_promised": [
    {"type": "file", "path": "calendar-{date}.md"},
    {"type": "file", "path": "calendar-{date}.json"},
    {"type": "state_field", "path": "phases.plan.calendar_path"},
    {"type": "state_field", "path": "phases.plan.cadence_per_channel"},
    {"type": "state_field", "path": "phases.plan.advisories_resurfaced[]", "min_count": 1, "condition": "open_deferred_advisories_at_entry > 0"}
  ],
  "open_advisories_at_entry": [
    {"id": "handle-squat-cutmasterai", "status": "deferred"}
  ]
}
```

### Anti-patterns

- ❌ Emitting the banner but not persisting it to state — auditor has no ground truth to diff against
- ❌ Auditor running but writing no audit log — auditor must produce `phase-audit-{date}-{n}.md` for forensic trail
- ❌ Skipping audit on "small" phases (Phase 6 REPORT) — every phase audits; Phase 6 audit catches REPORT-time omissions like missing advisory banner
- ❌ Treating audit fail as advisory — auditor fail blocks phase transition, no exceptions

---

## Phase 0: ACQUIRE — Data Acquisition (15–25 min)

### Steps

0. **Compute run_id + initialize run folder (Patch N)** — once intake is locked:
   - Derive `run_id` per [`references/run-id-derivation.md`](../references/run-id-derivation.md) from `intake.channels` keys + union of platforms in `intake.identities[ch].handles`
   - Create `projects/{project}/research/social/{run_id}/` and subfolders `raw/`, `briefs/`, `phase-audits/`, `preflight-banners/`, `deliverables/`
   - Write `state.json` to `{run_id}/state.json` (this is the only state file going forward; `state.intake.run_id = "{run_id}"` is set as the canonical record of what folder this state belongs to)
   - Initialize / append to `projects/{project}/research/social/INDEX.md` per [`references/INDEX-template.md`](../references/INDEX-template.md). Append a row: `| {run_id} | {channels} | {platforms} | {now ET} | acquire | running | {run_mode} | yes |`
   - Emit Phase 0 pre-flight banner (Patch J-3b) to `{run_id}/preflight-banners/0-acquire.md` AND persist a copy to `state.phases.acquire.preflight_banner`
1. **Resolve handles** — call `social-discover resolve --platform {p} --handles {...}` for each (channel × platform). The resolver returns `{handle, channel_exists: bool, handle_available: bool, channel_id?}`. If `channel_exists=false`, set `state.phases.acquire.pre_launch[ch][p] = true` and proceed to **pre-launch branch** (below). Otherwise continue to Step 2.
2. **Profile baseline** — `social-discover profile` for each handle → `raw/celavii-{handle}-{platform}-profile-{ts}.json`. SKIPPED on pre-launch branch.
3. **Last-N posts** — `social-discover` Mode A continued; default N=50, configurable. SKIPPED on pre-launch branch.
4. **Hashtag seeds** — for each `intake.differentiators[]` → `social-discover hashtag --tags ...` Tier-0 only at this phase

### Pre-launch branch

When `pre_launch[ch][p] = true`, Phase 0 short-circuits to:

- Skip Steps 2 (profile) + 3 (posts) — there's nothing to scrape
- Skip self-baseline metrics in Phase 1 DISCOVER for that (channel × platform) pair — the subagent has no source data
- Run Steps 4 (hashtag seeds) and 5 (competitor flow) as normal — those depend on intake.differentiators, not on the channel's own posts
- Phase 1 DISCOVER and Phase 2 ANALYZE for pre-launch channels lean entirely on competitor + hashtag-seed data; Gate A scoring weights shift to favor "competitor-pattern coverage" over "self-pattern divergence"
- The Phase 5 DELIVER calendar must include a launch sequence (first 10 posts) tagged `phase=launch` before steady-state cadence

Pre-launch channels also surface a one-time advisory: register the handle on the platform before Phase B brief delivery to prevent squatting. The orchestrator must emit this to Telegram if `pre_launch=true`.

5. **Competitor profiles** — branch on `intake.competitors_per_channel[ch].status`:
   - `user_provided` or `research_complete` → `social-competitor-scrape baseline --handles {competitors_per_channel[ch].handles}`
   - `research_needed` or `research_needed_partial` → run **Phase 0.5a Competitor Discovery** (below) FIRST, then loop back to baseline scrape

### Phase 0.5a — Competitor Discovery (conditional)

Runs only when `intake.competitors_per_channel[ch].status ∈ {research_needed, research_needed_partial}`. Cannot be skipped — Gate A will fail if `competitors_per_channel[ch].handles` is empty AND status is not `research_complete`.

#### Steps

1. **Build search inputs** — assemble from intake:
   - Differentiators (`intake.differentiators[]`)
   - Identity line (`intake.identities[ch].identity_line`)
   - Goal verb+noun (`intake.goal`)
   - Channel type (`intake.channel_types[ch]` — utility/founder/product)
   - Existing hypotheses (`intake.competitors_per_channel[ch].hypotheses[]`) as priors, if any
2. **Run discovery search** — `social-discover competitor-discover --channel {ch} --platform {p}` (Mode F, see [`../../social-discover/SKILL.md` § Mode F](../../social-discover/SKILL.md))
   - Tier 0 only (no follower/affinity calls at this stage)
   - Returns top 20 candidates ranked by `relevance × audience_size × recency`
3. **Score and shortlist** — apply 4-factor heuristic per candidate:
   - Topic overlap with differentiators (0–1.0)
   - Audience size proxy (subs / followers, log-scaled)
   - Posting recency (last post ≤30 days)
   - Channel-type match (utility-vs-utility scores higher than utility-vs-founder)
4. **Surface top 5 to user** — Telegram message format:
   > "Found 5 competitor candidates for {channel} on {platform}:
   >
   > 1. @handle1 — {short why}
   > 2. @handle2 — ...
   >    Reply with 3 you want to track, or paste your own."
5. **Lock confirmed list** — on user reply:
   - Update `intake.competitors_per_channel[ch].handles = [confirmed]`
   - Update `intake.competitors_per_channel[ch].status = "research_complete"`
   - Update `intake.competitors_per_channel[ch].confirmed_at = <iso>`
6. **Resume Step 0.5** — baseline scrape on confirmed handles

#### Anti-patterns

- ❌ Auto-locking the top 3 without user confirmation — the search heuristic is good but not infallible; the human is cheap insurance
- ❌ Running Phase 0.5a before Steps 0.1–0.4 — differentiators and hashtag seeds inform the search; skipping them yields generic candidates
- ❌ Treating `hypotheses[]` as confirmed — they're priors, not answers; Phase 0.5a still runs its own search
- ❌ Skipping Phase 0.5a entirely when status is `research_needed` — Gate A will catch this and the pipeline rolls back; better to run it correctly the first time

#### State write

```jsonc
state.phases.acquire.competitor_discovery = {
  status: "complete",
  channel: "{ch}",
  platform: "{p}",
  ran_at: "<iso>",
  candidates_surveyed: 20,
  candidates_surfaced: 5,
  candidates_confirmed: ["@h1", "@h2", "@h3"],
  raw_files: ["raw/{ch}-competitor-candidates-{platform}-{ts}.json"]
}
```

### Tiered credentials (D17)

Per [`references/tiered-credentials.md`](../references/tiered-credentials.md):

| Tier | What works                                 | When to use                                     |
| ---- | ------------------------------------------ | ----------------------------------------------- |
| 0    | `/api/v1/scrape/{hashtags,locations,urls}` | Always — public, low-cost                       |
| 1    | `/api/v1/scrape/{followers,following}`     | Phase 1 cohort analysis only; 2 credits + Apify |
| 2    | `/api/v1/refine/profiles`                  | Phase 2 enrichment; gated on `refine:trigger`   |

ACQUIRE uses **Tier 0 only**. Phase 1 may escalate to Tier 1 with explicit user consent.

### Write state

```jsonc
state.phases.acquire = {
  status: "complete",
  raw_files: ["raw/...", ...],
  ran_at: "<iso>",
  next_phase: "discover"
}
```

### Checkpoint

Pause for user confirmation before Phase 1 if cumulative Apify cost estimate >$2.

---

## Phase 1: DISCOVER (10–15 min)

Goal: build channel baselines + competitor patterns + trend signals.

### Parallel-subagent spawn (D15)

Per [`references/parallel-subagent-spawn.md`](../references/parallel-subagent-spawn.md). Spawn one subagent per (channel × platform) — up to 15 parallel.

**Fast path (D15.1)**: if the post-D16-prune spawn matrix is `≤2 tuples`, skip the parallel infrastructure and run inline in the orchestrator's main context. Same logic, same state writes, no spawn/merge ceremony. Per `references/parallel-subagent-spawn.md` § Single-channel fast path.

Each subagent (or inline iteration):

1. Reads its profile + posts JSONs (already on disk from ACQUIRE)
2. Calls `social-trend-detect` on its own platform's hashtag/topic feeds
3. Writes its slice to `state.phases.discover.baselines.{channel}.{platform}`

### Industry-aware delegation (D16)

Per [`references/industry-aware-delegation.md`](../references/industry-aware-delegation.md). Detect channel type from `intake.channel_types[ch]` and route:

- **founder** (Elioth) → first-person hook archetypes (Story + Authority); IG/X/TT primary
- **product** (Celavii) → educate-heavy 4E mix; IG/TT/YT primary; deck-style carousels
- **utility** (CutMaster) → demo-heavy short-form; TikTok/Reels primary; Pattern Interrupt hooks

A founder channel skips long-form-video subagents; a utility channel skips X-thread subagents. Saves ~30% credits and avoids surfacing irrelevant patterns.

### Write state

The discover state splits **measured baselines** (from live scrapes) from **planned projections** (from intake, for pre-launch channels). They are NEVER mixed in the same field. Gate A reads `baselines` as ground truth and `projections` as targets — conflating them poisons scoring.

```jsonc
state.phases.discover = {
  status: "complete",
  baselines: {                            // ONLY measured data — fields null/absent for pre-launch
    celavii: {
      instagram: { followers: 8400, er_pct: 0.62, posts_per_week: 3.5, format_mix: {...} },
      tiktok:    { followers: 12400, er_pct: 4.1, ... }
    }
  },
  projections: {                          // ONLY planned/target values, used for pre-launch channels
    cutmaster: {
      youtube: {
        target_posts_per_week: 3,
        target_format_mix: { shorts: 1.0, long_form: 0.0 },
        hook_archetype_targets: { pattern_interrupt: 0.60, curiosity_gap: 0.25, authority_claim: 0.10, contrarian_take: 0.05 },
        target_4e_mix: { educate: 0.70, entertain: 0.10, engage: 0.10, empower: 0.10 },
        source: "intake.differentiators + intake.4e_mix_targets",
        derivation_method: "intake_synthesis"   // never "scrape" or "measurement"
      }
    }
  },
  data_source: {                          // per (channel × platform), did baseline come from real scrape?
    cutmaster: { youtube: "projections_only" },        // pre-launch: nothing measured
    celavii:   { instagram: "measured", tiktok: "measured" }
  },
  trend_signals_seed: [...]
}
```

**Rules**:

1. Pre-launch channels (per Patch A `pre_launch[ch][p]=true`) write only to `projections`, never to `baselines`. The corresponding `baselines.{ch}.{p}` field is omitted entirely (NOT set to zeros — zeros would imply "we measured zero followers" which is a true-but-misleading data point).
2. Live channels write only to `baselines`, never to `projections`. Targets for live channels are computed downstream in Phase 4 PLAN, not in DISCOVER.
3. `data_source[ch][p]` is one of: `measured` | `projections_only` | `partial` (if some metrics measured + some projected — rare, used only for live channels missing specific data).
4. Gate A reads BOTH and treats them differently — see `references/critic-intake-rule.md` § Baselines vs Projections.

### Checkpoint

Display baselines table; user approves before Phase 2.

---

## Phase 2: ANALYZE (20–30 min)

Goal: extract patterns from raw data — competitor format mix, hook archetype frequency, common themes.

### Steps

1. For each competitor: `social-competitor-scrape top-posts` → top 25 posts by engagement, last 60 days
2. Tag each top-post hook by archetype (deterministic, via `social-aggregate.tag_archetype()`)
3. Tag each by 4E (deterministic, via `social-aggregate.tag_4e()`)
4. Build `repurposing-map seed`: for each pillar topic candidate, list which platforms/formats it could spawn

### Write state

```jsonc
state.phases.analyze = {
  status: "complete",
  patterns: {
    modaberlin: { format_mix: {...}, top_archetypes: [...], common_themes: [...] }
  },
  repurposing_map_seed: [...]
}
```

---

## Phase 3: AGGREGATE — Deterministic (<5s)

Branches on `state.run_mode`:

### Live mode

```bash
python3 ~/dev/workspace/skills/social-aggregate/scripts/aggregate.py \
  --social-dir ~/dev/workspace/projects/{project}/research/social \
  --top-n 50 --cannibalization-window 30
```

Reads everything in `raw/`, outputs:

- `aggregate-report-{date}.md` (~2K tokens, LLM-readable)
- `aggregate-report-{date}.json` (full payload)

### Research mode (added 2026-05-04 from cutmasterai dry-run, Patch H)

When `state.run_mode == "research"` and `raw/` is empty (or contains only research-mode artifacts), aggregate.py is NOT called — there's no scrape data to aggregate. Instead, the orchestrator runs an **inline qualitative-aggregation pass**:

```python
# Pseudo-code — actual implementation lives in scripts/aggregate.py --research-mode flag (Phase B12.1)
def aggregate_research_mode(state):
    inputs = {
        "competitive_format_analysis": state.phases.discover.competitive_format_analysis,
        "trend_signals_seed": state.phases.discover.trend_signals_seed,
        "format_best_practices": state.phases.discover.format_best_practices,
        "repurposing_map_seed": state.phases.discover.repurposing_map_seed,
        "analyze_findings": state.phases.analyze,
        "intake_differentiators": state.intake.differentiators,
        "intake_business_concept": state.intake.business_concept,
        "projections": state.phases.discover.projections,
    }
    # Synthesize content pillars from differentiators + 4E targets + competitive whitespace
    pillars = derive_pillars(inputs)
    # Score each pillar by: differentiator coverage (0.4) + whitespace strength (0.3) + format fit (0.3)
    scored_pillars = score_pillars(pillars, inputs)
    # No cannibalization analysis (no real cadence data); flag as N/A
    # No trend explosion detection (no z-scores in research mode); use trend_signals_seed strength values directly
    return {
        "scored_pillars": scored_pillars,        # 5–10 pillars, deterministic from inputs
        "scored_topics_count": len(scored_pillars),
        "cannibalization_warnings": "N/A",       # explicit N/A, not 0
        "trend_signals_qualitative": inputs.trend_signals_seed,
        "competitive_whitespace": derive_whitespace(inputs),
        "format_constraints": derive_format_constraints(inputs),
        "report_md": render_research_mode_report(...)
    }
```

Outputs:

- `aggregate-report-{date}.md` (research-mode template — clearly labeled `## Research Mode — Qualitative Aggregation`)
- `aggregate-report-{date}.json` (research-mode payload, includes `research_mode_metadata` block)

The research-mode report template MUST include a top-of-page banner:

> **⚠️ Research-mode aggregation.** This report synthesizes qualitative inputs (competitor format research, trend signals from web search, intake-derived projections) — NOT live scrape data. Pillar scores reflect strategic fit, not measured performance. Re-run with API access for quantitative aggregation.

### Write state (both modes)

```jsonc
state.phases.aggregate = {
  status: "complete",
  report_path_md:   "...",
  report_path_json: "...",
  scored_topics_count: 73,
  cannibalization_warnings: 4,         // integer in live mode; "N/A" in research mode
  trend_signals_exploding: 2,          // integer in live mode; null in research mode (no z-scores)
  ran_at: "<iso>",
  runtime_sec: 3.1,
  research_mode_metadata: { ... }      // present only when run_mode=research
}
```

### Gate A reads the research-mode report differently

When `state.phases.aggregate.research_mode_metadata` is present, Gate A's prompt MUST explicitly:

- Score pillar consistency vs intake (NOT pillar performance)
- Cite `competitors_per_channel.handles[]` for competitive whitespace claims (handles, not hypotheses, not off_platform)
- Flag any quantitative claim in the pillar set as a violation of qualitative-only rule
- Apply Article 6 verification with the projection-mode citations rule (per `critic-intake-rule.md` § Baselines vs Projections)

### Checkpoint

LLM reads only `aggregate-report-{date}.md` (not the raw JSONs). State + report drive Gate A.

### Anti-patterns

- ❌ Calling aggregate.py without --research-mode flag when `run_mode=research` — script will produce empty output (no raw/ files) and may crash or write a misleading "0 topics scored" report
- ❌ Mixing live + research-mode aggregation in the same report — pillar scores from different methodologies can't be compared
- ❌ Skipping Phase 3 entirely under research mode — Gate A needs SOME scored input to score against. The qualitative pass produces real input; skipping defers the spec gap rather than closing it.

---

## ⚠️ GATE A: Strategic Alignment Review (Critic)

Per [`social-quality` mode=gate-a](../../social-quality/SKILL.md). **Critic must read `state.intake` first** (Article 6 + [`references/critic-intake-rule.md`](../references/critic-intake-rule.md)).

### Inputs to critic

- `state.intake` (full block) — channels, goal, competitors, voice
- `aggregate-report-{date}.md`
- `social-constitution.md` (10 articles)

### Verification (post-score)

Critic output MUST cite at least 2 of:

- A phrase from `intake.channel_identities`
- A name from `intake.competitors_per_channel`
- The verb/noun from `intake.goal`
- A banned-language item from `intake.banned_language`

If 0 citations → contaminated → discard, re-run with explicit reminder. Counts as iteration.

### Pass/Fail

| Criterion                                                      | Threshold |
| -------------------------------------------------------------- | --------- |
| Composite alignment score                                      | ≥ 7.5     |
| Article 1 (Specificity) — ≥7 specifics per 100 words in topics | yes       |
| Article 5 (No banned language) — zero hits                     | yes       |
| Article 6 (Critic read intake) — verified by citation rule     | yes       |

Fail → Phase 2B remediation. After 3 fails → escalate.

---

## Phase 2B: Targeted Remediation (5–10 min — only if Gate A fails)

Goal: minimal-cost loop to address Gate A's specific findings.

### Steps

1. Parse Gate A failure list — typically 1–3 issues (e.g. "competitor coverage gap on TikTok", "no founder-channel patterns")
2. For each issue: a targeted scrape (not full re-acquire) — e.g. `social-discover hashtag --tags X` or `social-competitor-scrape top-posts --handle Y`
3. Re-run Phase 3 (AGGREGATE) — fast, deterministic
4. Re-run Gate A

### Write state

```jsonc
state.phases.remediation_2b = {
  iteration: 1,
  triggered_by_gate_a_iteration: 1,
  targeted_actions: ["..."],
  ran_at: "<iso>"
}
```

If Gate A still fails after 3 iterations → halt; surface escalation message.

---

## Phase 4: PLAN — Calendar + Briefs Outline (20–30 min)

Per [`social-plan/SKILL.md`](../../social-plan/SKILL.md).

### Inputs

- `aggregate-report-{date}.md` (top scored topics)
- `state.phases.discover.baselines` (cadence + format mix per channel)
- `state.intake.channel_e_mix_targets` (from intake step 5 default seed)

### Steps

1. Pick top N topics (default N=12 per channel for a 90-day plan)
2. **Format-as-channel rule (D20)** per [`references/format-as-channel.md`](../references/format-as-channel.md): each topic gets per-platform format assignment, never a "post once everywhere" plan
3. **Gary Vee Reverse Pyramid (D21)** per [`references/gary-vee-fan-out.md`](../references/gary-vee-fan-out.md): each long-form pillar must spawn ≥8 atomic outputs across channels with explicit per-channel formatting
4. Build `publication_calendar[]` — one entry per planned post: `{post_id, channel, platform, format, scheduled_for, pillar_id, e_tags, hook_archetype_target}`
5. Cadence sanity check vs 2026 medians (TikTok 2–5/week, IG 3–5/week, YT ≥12/month, X 3–5/day)

### Write state

```jsonc
state.phases.plan = {
  status: "complete",
  publication_calendar: [
    { post_id: "celavii-ig-001", channel: "celavii", platform: "instagram", format: "carousel",
      scheduled_for: "2026-05-04T14:00:00-05:00", pillar_id: "p-001-agentic-marketing",
      e_tags: ["educate","empower"], hook_archetype_target: "authority" },
    ...
  ]
}
```

---

## ⚠️ GATE B: Content Plan Quality Review (Critic)

Per [`social-quality` mode=gate-b](../../social-quality/SKILL.md). Cross-model critic (D18); 3-iter cap (D19).

### Checks

| Check                                                                          | Source                               |
| ------------------------------------------------------------------------------ | ------------------------------------ |
| Cannibalization — no two planned posts within 30d at cosine ≥ 0.85             | `social-cannibalization` (Phase B15) |
| Cadence — within 2026 medians per platform                                     | this command                         |
| Repurposing-loop validity — every pillar has ≥8 atomic spawns (D21)            | this command                         |
| Format-as-channel — no "post once everywhere" entries (D20)                    | this command                         |
| 4E balance — Celavii channel calendar has ≥2 E's per planned post (C8)         | `social-aggregate` already-tagged    |
| Channel E-mix vs target — actual within ±15% of `intake.channel_e_mix_targets` | this command                         |

Fail → loop back to Phase 4 with specific remediation prompt. 3-iter cap applies.

---

## Phase 5: DELIVER — Per-Post Briefs (15–20 min)

Goal: one `social-brief` artifact per planned post.

### Steps

```pseudocode
for post in state.phases.plan.publication_calendar[:N]:
  research_packet = social-research generate --topic post.pillar_id --channel post.channel
  social-brief --research <packet> --post-id post.post_id \
               --platform post.platform --channel post.channel
  # social-brief auto-calls: social-hooks → social-persona enforce → social-sxo format-fit → social-research citations
  if post.format in ("reel","tiktok","yt-short","yt-long"):
    social-script --brief <brief>      # 8-pass humanizer included
    social-shotlist --script <script>  # ClipsAI backbone
  social-quality mode=silo-check --brief <brief>
  social-quality mode=gate-c --brief <brief>     # per-post critic, 8-axis Gate C
```

Top-N default = 25 (covers ~2 weeks of cadence across channels). Configurable via `state.phases.plan.deliver_top_n`.

### Write state

```jsonc
state.phases.deliver = {
  status: "complete",
  briefs: [
    { post_id: "celavii-ig-001", brief_path: "briefs/celavii-ig-001-brief.md",
      hooks_path: "briefs/celavii-ig-001-hooks.md",
      script_path: null, shotlist_path: null,
      gate_c: { score: 8.4, status: "pass" } },
    ...
  ]
}
```

### Checkpoint

Surface a table: post_id × Gate C score. User approves before Phase 6 PDF generation.

---

## Phase 6: REPORT — Print-Ready PDF (15–20 min)

Mirrors [`deliverables/seo-report-v3/`](file:///Users/operator/dev/workspace/projects/celavii/deliverables/seo-report-v3/) — Next.js + static export → manual Cmd+P → PDF.

### Steps

1. **Scaffold** — copy `seo-report-v3/` template to `deliverables/social-report-v1/` and rename (one-time per project)
2. **Populate `data/`** — JSON constants: intake, scored_topics, publication_calendar, gate scores
3. **Populate `analysis/`** — markdown: executive summary, methodology, channel deep-dives, calendar overview
4. **`npm run dev`** — local preview
5. **PDF QA** — Opus reads rendered HTML; checks visual consistency, section coverage, brand application
6. **Cmd+P → Save as PDF** (8.5" × 11", 0.5" margins)
7. **Optional Vercel deploy** for web access

### Write state

```jsonc
state.phases.report = {
  status: "complete",
  pdf_path: "deliverables/social-report-v1/celavii-social-strategy-2026Q2.pdf",
  web_url: null
}
```

### Final Output

User receives:

- PDF (the deliverable)
- Live state.json (for `/social_curate week=...` weekly cycles)
- 25 ready-to-execute briefs

---

## Resume from Checkpoint

```bash
/social_strategy resume
```

Reads `state.phases.{x}.status` for each phase; resumes at the first `!= "complete"`. If a gate failed mid-iteration, resumes inside that gate's loop with iteration counter intact.

---

## Quarterly Refresh

```bash
/social_strategy refresh
```

Skips intake (uses locked intake). Re-runs ACQUIRE through PLAN with fresh raw data. Briefs regenerated; old PDF archived. Use every ~90 days or when channel ER drifts >20% (`social-drift` flag).

---

## Cost Estimate

Per-run cost (D14 — refined empirically on first dry run):

| Phase                   | LLM cost                          | Apify cost      | Wall time   |
| ----------------------- | --------------------------------- | --------------- | ----------- |
| 0 — ACQUIRE             | ~$0.20                            | ~$0.40          | 15–25 min   |
| 1 — DISCOVER            | ~$1.50 (15 parallel low-thinking) | ~$0.30          | 10–15 min   |
| 2 — ANALYZE             | ~$1.20                            | nil             | 20–30 min   |
| 3 — AGGREGATE           | $0                                | nil             | <5s         |
| Gate A                  | ~$0.80 (Opus critique)            | nil             | 2–3 min     |
| 2B (if needed)          | ~$0.40 + Apify                    | up to $0.60     | 5–10 min    |
| 4 — PLAN                | ~$1.00                            | nil             | 20–30 min   |
| Gate B                  | ~$0.60                            | nil             | 2–3 min     |
| 5 — DELIVER (25 briefs) | ~$5.00                            | nil             | 15–20 min   |
| 6 — REPORT              | ~$1.00                            | nil             | 15–20 min   |
| **TOTAL**               | **~$11.70**                       | **~$0.70–1.30** | **~2–3 hr** |

Without Phase 5 + 6 (strategy only, no per-post briefs): ~$5.30. Per-week curation runs (`/social_curate`) re-use the strategy state and cost ~$2/week.

---

## Autonomous Continuation

After Phase 5 completes, the command can autonomously continue to Phase 6 if `state.gates.B.status == "pass"` AND no Gate C failed in DELIVER. Otherwise: pause for human review.

---

## References

- [`references/intake-questions.md`](../references/intake-questions.md) (D2)
- [`references/parallel-subagent-spawn.md`](../references/parallel-subagent-spawn.md) (D15)
- [`references/industry-aware-delegation.md`](../references/industry-aware-delegation.md) (D16)
- [`references/tiered-credentials.md`](../references/tiered-credentials.md) (D17)
- [`references/format-as-channel.md`](../references/format-as-channel.md) (D20)
- [`references/gary-vee-fan-out.md`](../references/gary-vee-fan-out.md) (D21)
- [`references/critic-intake-rule.md`](../references/critic-intake-rule.md) (Article 6)
- [`references/social-constitution.md`](../references/social-constitution.md) (10 articles)
- [SOCIAL-STRATEGY-STATE-SPEC.md](file:///Users/operator/dev/workspace/projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md) (state schema v3)
