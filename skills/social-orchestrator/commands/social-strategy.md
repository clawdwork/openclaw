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

**Output**: `~/dev/workspace/projects/{project}/research/social/` populated with `social-strategy-state.json`, `aggregate-report-{date}.{md,json}`, `publication-calendar.md`, `briefs/*.md`, plus a Next.js print-ready PDF in `deliverables/social-report-v1/`.

**Cost**: ~$8–14 + Apify scrape costs (Tier-1 ops only). See [§ Cost Estimate](#cost-estimate).

---

## Trigger

User says any of: `/social_strategy`, "build social strategy", "plan our social calendar end-to-end". For a single channel/platform see `/social_post` (Phase F1) or `/social_curate week=...` (Phase E).

---

## Intake Flow (REQUIRED — run before any phase)

### Step 1: Check for existing state

```bash
ls ~/dev/workspace/projects/*/research/social/social-strategy-state.json 2>/dev/null
```

If found and `state.intake.locked=true`: ask user "Resume {project} or start new?" Default to resume.

### Step 2: Five Questions (one at a time, Telegram-friendly)

Per [`references/intake-questions.md`](../references/intake-questions.md). Ask each in isolation; wait for answer before proceeding.

1. **Channels** — "Which brand/persona channels are we planning for? (e.g. `elioth, celavii, cutmaster`)"
2. **Identities** — "For each channel: handle per platform (IG/TT/X/YT) + 1-line identity."
3. **Goal** — "Single sentence: what should this strategy accomplish in the next 90 days?"
4. **Competitors** — "Top 3 competitors per channel (handles, any platform)."
5. **Voice rules** — "Forbidden phrases + required terms. (Pulls defaults from `~/dev/workspace/.styles/celavii/voice.json`; this layers project-specific overrides on top.)"

After Q5: write `state.intake = { channels, identities, goal, competitors_per_channel, voice_rules, channel_e_mix_targets, locked: true }`.

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

## Output

```
~/dev/workspace/projects/{project}/research/social/
├── social-strategy-state.json
├── raw/                                          ← all scraped JSONs (social-discover, competitor-scrape)
├── aggregate-report-{date}.md                    ← LLM-readable summary (Phase 3)
├── aggregate-report-{date}.json                  ← full structured payload
├── publication-calendar.md                       ← Phase 4 output
├── briefs/{channel}-{post-id}-brief.md           ← Phase 5 output (one per planned post)
├── briefs/{channel}-{post-id}-hooks.md           ← hook variants (5+, archetype-tagged)
└── deliverables/social-report-v1/                ← Phase 6 Next.js print-ready PDF project
```

## Data Persistence

State file is the single source of truth. Every phase writes to it; every phase reads its inputs from it (not from disk-search). Schema: `social-strategy-state.json` per [v3 spec](file:///Users/operator/dev/workspace/projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md).

```jsonc
{
  "version": 3,
  "project": "celavii",
  "intake": { ... },
  "phases": {
    "acquire":   { "status": "complete", "raw_files": [...] },
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

Generator and critic MUST be different models. Hard fail if same. Default: Sonnet generates, Opus critiques. Per [social-constitution Article 7](../../../.claude/rules/social-constitution.md).

### Iteration cap (D19)

Each gate caps at **3 iterations**. After third fail → escalate to human review; do not auto-iterate. Per [Article 8](../../../.claude/rules/social-constitution.md). Iteration counter lives in `state.gates.{A,B}.iteration`.

---

## Phase 0: ACQUIRE — Data Acquisition (15–25 min)

### Steps

1. **Resolve handles** — call `social-discover resolve --platform {p} --handles {...}` for each (channel × platform)
2. **Profile baseline** — `social-discover profile` for each handle → `raw/celavii-{handle}-{platform}-profile-{ts}.json`
3. **Last-N posts** — `social-discover` Mode A continued; default N=50, configurable
4. **Hashtag seeds** — for each `intake.differentiators[]` → `social-discover hashtag --tags ...` Tier-0 only at this phase
5. **Competitor profiles** — `social-competitor-scrape baseline --handles {competitors_per_channel[ch]}` per channel

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

Per [`references/parallel-subagent-spawn.md`](../references/parallel-subagent-spawn.md). Spawn one subagent per (channel × platform) — up to 15 parallel. Each subagent:

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

```jsonc
state.phases.discover = {
  status: "complete",
  baselines: {
    celavii: {
      instagram: { followers: 8400, er_pct: 0.62, posts_per_week: 3.5, format_mix: {...} },
      tiktok:    { followers: 12400, er_pct: 4.1, ... }
    }
  },
  trend_signals_seed: [...]
}
```

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

```bash
python3 ~/dev/workspace/skills/social-aggregate/scripts/aggregate.py \
  --social-dir ~/dev/workspace/projects/{project}/research/social \
  --top-n 50 --cannibalization-window 30
```

Reads everything in `raw/`, outputs:

- `aggregate-report-{date}.md` (~2K tokens, LLM-readable)
- `aggregate-report-{date}.json` (full payload)

### Write state

```jsonc
state.phases.aggregate = {
  status: "complete",
  report_path_md:   "...",
  report_path_json: "...",
  scored_topics_count: 73,
  cannibalization_warnings: 4,
  trend_signals_exploding: 2,
  ran_at: "<iso>",
  runtime_sec: 3.1
}
```

### Checkpoint

LLM reads only `aggregate-report-{date}.md` (not the raw JSONs). State + report drive Gate A.

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
- [`.claude/rules/social-constitution.md`](file:///Users/operator/dev/openclaw/.claude/rules/social-constitution.md) (10 articles)
- [SOCIAL-STRATEGY-STATE-SPEC.md](file:///Users/operator/dev/workspace/projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md) (state schema v3)
