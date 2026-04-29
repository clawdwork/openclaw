# Social Agents Implementation Proposal

> **Status**: Proposal — Awaiting Approval (revised 2026-04-28 with research findings)
> **Author**: Operator + Claude
> **Date**: 2026-04-28
> **Supersedes**: [content-strategy-pipeline-proposal.md](file:///Users/operator/dev/workspace/projects/celavii/research/social/content-strategy-pipeline-proposal.md) (64 lines, lacked depth — see § Gap Analysis below)
> **Models on**: SEO 7-phase pipeline ([seo-strategy.md](file:///Users/operator/dev/workspace/skills/seo/commands/seo-strategy.md)), Blogger sub-skill model ([skills/blogger/](file:///Users/operator/dev/workspace/skills/blogger/))
> **Research backing**: [docs/repos.md](docs/repos.md), [docs/frameworks.md](docs/frameworks.md), [docs/integration-recommendations.md](docs/integration-recommendations.md), [community-repos-extraction-notes.md](community-repos-extraction-notes.md)
> **Celavii capability source-of-truth**: `/Users/operator/code/celavii/social_listener/` — see § 11

---

## 1. Goal

Build a **complete social-media team** equivalent in depth to the existing SEO team — a `/social_strategy` autonomous pipeline plus atomic sub-skills that can be invoked independently for week-to-week production work (research → brief → script → shot list → citations → silo check → handoff).

The lift target: match what [seo-strategy.md](file:///Users/operator/dev/workspace/skills/seo/commands/seo-strategy.md) (1,232 lines, 7 phases, 2 critic gates, deterministic aggregator, raw archive) does for SEO, applied to multi-channel social (Elioth / Celavii / CutMaster × IG / TikTok / X / YouTube).

## 2. References & Why They Matter

| Reference                                                                                                                                                                                                            | What we borrow                                                                                                                          | Why                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [skills/seo/commands/seo-strategy.md](file:///Users/operator/dev/workspace/skills/seo/commands/seo-strategy.md)                                                                                                      | 7-phase shape, intake flow, state file pattern, raw archive, 2 critic gates, Phase 2B remediation loop                                  | Proven end-to-end on celavii.com (DR 0 → 105-article plan, 532-keyword arsenal). The structure WORKS.                    |
| [skills/seo/seo-orchestrator/SKILL.md](file:///Users/operator/dev/workspace/skills/seo/seo-orchestrator/SKILL.md)                                                                                                    | Task-routing table, "Minimum Tools Per Task Type", evidence rules, citation requirements                                                | The orchestrator pattern is what makes SEO feel like a team — single entry, routes by task.                              |
| [.system/features/seo-strategy/DRY-RUN-TEST-FINDINGS.md](file:///Users/operator/dev/workspace/.system/features/seo-strategy/DRY-RUN-TEST-FINDINGS.md)                                                                | "Critic must read intake before scoring" lesson                                                                                         | Gate A in SEO initially failed because critics ran context-free. Don't repeat it.                                        |
| [skills/blogger/](file:///Users/operator/dev/workspace/skills/blogger/) (16 sub-skills)                                                                                                                              | Atomic-skill independence pattern: `blog-brief`, `blog-outline`, `blog-write`, `blog-audio`, `blog-repurpose` etc. each invocable alone | This is what the user asked for explicitly: weekly curation skills must work without re-running the full strategy.       |
| [skills/celavii-social/SKILL.md](file:///Users/operator/dev/workspace/skills/celavii-social/SKILL.md)                                                                                                                | Existing per-post execution skill (copy + media prompts + state update)                                                                 | Already built — slots in as the post-strategy execution layer. Don't rebuild.                                            |
| [skills/celavii-data-ops/SKILL.md](file:///Users/operator/dev/workspace/skills/celavii-data-ops/SKILL.md), [skills/celavii-discover/SKILL.md](file:///Users/operator/dev/workspace/skills/celavii-discover/SKILL.md) | Celavii API endpoints (Instagram), `/scrape/*` family, dry-run + status-poll pattern, credit accounting                                 | API access is verified (Pro tier, scrape:trigger scope). Multi-platform extension comes later — IG is enough to ship v1. |
| [WORKSPACE.md](file:///Users/operator/dev/workspace/WORKSPACE.md)                                                                                                                                                    | Path routing rules, project alias map, "absolute paths required" rule                                                                   | Every artifact must land in the right place; agents must register files in PROJECT.md.                                   |
| [projects/celavii/PROJECT.md](file:///Users/operator/dev/workspace/projects/celavii/PROJECT.md)                                                                                                                      | File Index pattern, blog content layout, social state file already at v2                                                                | New skills must update File Index after every save. State v2 file already exists — we'll version to v3.                  |
| [.claude/rules/celavii-design-system.md](file:///Users/operator/dev/.claude/rules/celavii-design-system.md)                                                                                                          | Brand voice, color system, banned language ("toggle tax", prefer "agentic" over "AI-powered")                                           | Gate A and `social-quality` must enforce these.                                                                          |

## 3. Gap Analysis (vs. existing proposal)

The original [content-strategy-pipeline-proposal.md](file:///Users/operator/dev/workspace/projects/celavii/research/social/content-strategy-pipeline-proposal.md) is 64 lines, 6 phases. It's directionally correct but missing what makes the SEO team a "team":

| Asset                    | Original proposal                                             | This proposal                                                                                                                                               | Why required                                                        |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Intake flow              | None                                                          | 5 structured Qs stored in `state.meta.intake`                                                                                                               | SEO Gate A failure root cause was missing intake context for critic |
| State schema             | "social-strategy-state.json" mentioned                        | Versioned schema in [SOCIAL-STRATEGY-STATE-SPEC.md](file:///Users/operator/dev/workspace/projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md) v3 | v2 already exists; need explicit v3 schema for new pipeline         |
| Raw archive              | Not mentioned                                                 | `raw/{tool}-{target}-{ts}.json` mandatory                                                                                                                   | Cross-run reuse, never overwrite                                    |
| Deterministic aggregator | Not mentioned                                                 | Phase 3 script, no LLM                                                                                                                                      | 5–10× token cost reduction (proven in SEO Phase 3)                  |
| Critic gates             | One gate (Phase 5, score ≥80)                                 | Gate A (strategy) + Gate B (calendar) + Gate C (per-post) + Phase 2B remediation                                                                            | Two-gate pattern catches strategy drift early                       |
| Atomic sub-skills        | Routes to `marketing`, `blogger`, `media-content` generalists | 11 social-specific skills, each independently invocable                                                                                                     | User-requested: weekly curation must work without strategy re-run   |
| Tooling inventory        | None                                                          | Celavii API + Apify + Brave + web_fetch + minimums per task                                                                                                 | Evidence rules require citations                                    |
| Cost/time                | "1–2 days"                                                    | Phase-by-phase estimates, ~$3–6 / ~90–120 min                                                                                                               | Match SEO precision                                                 |

## 4. Architecture

### 4.1 Directory Layout (final)

```
projects/celavii/research/social/
├── social-strategy-state.json                 # v3 master state (versioned from existing v2)
├── SOCIAL-STRATEGY-STATE-SPEC.md              # v3 schema (extend existing)
├── raw/                                        # accumulated tool outputs, never overwritten
│   ├── celavii-{handle}-{platform}-profile-{YYYYMMDD-HHmm}.json
│   ├── celavii-{handle}-{platform}-posts-{ts}.json
│   ├── celavii-hashtag-{tag}-{platform}-{ts}.json
│   ├── apify-{actor}-{target}-{ts}.json
│   └── trend-{platform}-{topic}-{ts}.json
├── discovery-{date}.md                         # Phase 1 output
├── competitor-analysis-{date}.md               # Phase 2 output
├── aggregate-report-{date}.md                  # Phase 3 output (deterministic)
├── 3-channel-blueprint-{date}.md               # post-Gate A
├── pillars-{channel}-{date}.md                 # one per channel
├── calendar-Qx-{date}.md                       # post-Gate B
├── repurposing-map-{date}.md
└── voice-playbook-{channel}.md                 # one per channel

projects/celavii/deliverables/
├── social-strategy-{date}/                     # mirrors deliverables/seo-report-v3/
│   ├── strategy.md                             # markdown companion
│   ├── briefs/                                 # ready-to-create briefs
│   └── pdf/                                    # Next.js print-ready app
└── handoffs/social-week-{YYYYWW}.zip           # weekly bundles

projects/celavii/content/social/
├── research/{week}-{channel}-research.md       # per-week research packets
├── research/{post-id}-citations.md             # citation docs
├── briefs/{channel}-{post-id}-brief.md
├── scripts/{channel}-{post-id}-script.md       # video scripts
├── shotlists/{channel}-{post-id}-shots.md
└── {channel}/{platform}-{post-id}-{type}.md    # final copy (existing celavii-social pattern)

projects/celavii/media/generated/social/{channel}/{post-id}/
```

### 4.2 Skill Catalog (11 new + 1 existing)

| #   | Skill                       | Type       | Independent? | Owns                                                 |
| --- | --------------------------- | ---------- | ------------ | ---------------------------------------------------- |
| 1   | `social-orchestrator`       | router     | n/a          | Task routing, minimum-tool table per task type       |
| 2   | `social-discover`           | sub-skill  | ✅           | Phase 0/1: handle resolution, baseline pull          |
| 3   | `social-competitor-scrape`  | sub-skill  | ✅           | Phase 1: competitor profiles + posts via Celavii API |
| 4   | `social-trend-detect`       | sub-skill  | ✅           | Trending audio/format/hashtag per platform           |
| 5   | `social-aggregate`          | **script** | n/a          | Phase 3: deterministic scoring + clustering, no LLM  |
| 6   | `social-plan`               | sub-skill  | ✅           | Phase 4: calendar + repurposing loops                |
| 7   | `social-research`           | sub-skill  | ✅           | Weekly research packet for given pillar/post         |
| 8   | `social-brief`              | sub-skill  | ✅           | Per-post brief from research                         |
| 9   | `social-script`             | sub-skill  | ✅           | Long-form video script                               |
| 10  | `social-shotlist`           | sub-skill  | ✅           | Shot list from script                                |
| 11  | `social-quality`            | sub-skill  | ✅           | Gate A/B/C critic checklists; banned-language; voice |
| 12  | `celavii-social` (existing) | execution  | ✅           | Per-post copy + media prompts + state update         |

Plus three orchestrator commands:

- `/social_strategy` — full 7-phase pipeline (mirrors `/seo_strategy`)
- `/social_curate week=YYYY-Wnn` — weekly production cycle
- `/social_post post_id={id}` — single-post production (any pipeline phase)

### 4.3 Phase Pipeline (the 7 phases)

```
INTAKE → PHASE 0 ACQUIRE → PHASE 1 DISCOVER → PHASE 2 ANALYZE
   → PHASE 3 AGGREGATE (script) → ★ GATE A → [Phase 2B if fail]
   → PHASE 4 PLAN → ★ GATE B → PHASE 5 DELIVER → PHASE 6 REPORT
```

(Detail in § 6 of prior conversation; not repeated here.)

### 4.4 State File v3 Schema (sketch)

```json
{
  "version": "3.0",
  "meta": {
    "intake": {
      "channels": { "elioth": {...}, "celavii": {...}, "cutmaster": {...} },
      "platforms_per_channel": { "elioth": ["x","ig"], ... },
      "goal": "...",
      "competitors_per_channel": {...},
      "voice_rules": [...],
      "banned_language": ["toggle tax", "AI-powered"]
    },
    "started_at": "...",
    "credit_budget": { "celavii": 2000, "apify": 5.00 }
  },
  "phases": {
    "acquire":   { "themes": [...], "competitors": {...}, "hashtags": {...}, "raw_files": [...] },
    "discover":  { "baselines": {...}, "format_inventory": {...}, "raw_files": [...] },
    "analyze":   { "patterns": {...}, "gaps": [...], "raw_files": [...] },
    "aggregate": { "pillars": [...], "scored_topics": [...], "report_path": "..." },
    "plan":      { "publication_calendar": [...], "repurposing_loops": [...], "calendar_path": "..." },
    "deliver":   { "briefs": [...], "playbooks": {...} },
    "report":    { "pdf_path": "..." }
  },
  "gates": {
    "A": { "status": "pending|pass|fail", "iteration": 0, "critic_notes": "...", "fail_remediation": [...] },
    "B": { "status": "pending|pass|fail", "iteration": 0 }
  },
  "weekly_cycles": [
    { "week": "2026-W18", "channel": "celavii", "posts": [...], "status": "..." }
  ]
}
```

---

## 5. Implementation Phases — Tracker

> Each box = `[ ]` pending, `[~]` in progress, `[x]` complete, `[!]` blocked.

### Phase A — Foundation (Week 1) ✅ COMPLETE 2026-04-28

**Status**: Done. arch-verify 4 fails → 1 (pre-existing Phase I). Detailed audit trail in [v1/TRACKER.md](v1/TRACKER.md).
**Goal**: Schema, scaffolding, and state-file contract. Nothing dependent on agent work yet.

- [x] **A1** Read & catalog existing v2 state at [research/social/social-strategy-state.json](file:///Users/operator/dev/workspace/projects/celavii/research/social/social-strategy-state.json) — captured 13 reusable field groups (meta, phases.research/plan, platforms, content_queue, hashtag_strategy, competitor_presence, cohort_insights, metrics, seo_sync)
- [x] **A2** Read existing [SOCIAL-STRATEGY-STATE-SPEC.md](file:///Users/operator/dev/workspace/projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md) — sections 1–9 (567 lines, v1.0)
- [x] **A3** v3 schema appended — `intake`, `phases.acquire/discover/analyze/aggregate/deliver/report`, `gates` (A/B/C cross-model + iter cap), `weekly_cycles[]`, YouTube placeholder, per-platform ER formulas, raw-file convention, v2→v3 migration
- [x] **A4** Directory skeleton created — `raw/`, `content/social/{research,briefs,scripts,shotlists}/`, `media/generated/social/`, `deliverables/handoffs/`, plus openclaw skills + features dirs
- [x] **A5** [`openclaw/skills/social-orchestrator/SKILL.md`](file:///Users/operator/dev/openclaw/skills/social-orchestrator/SKILL.md) authored — full router + 3-channel map + ER math + 5 hook archetypes + 4E framework + anti-slop rubric + cross-model critic config + `references/critic-intake-rule.md`
- [x] **A6** Symlinked `social-orchestrator`, `social-persona`, `social-drift` → `~/.openclaw/skills/` (verified via `ls`)
- [x] **A7** [PROJECT.md](../../../../workspace/projects/celavii/PROJECT.md) File Index updated — Research-Social section + cross-link to master proposal
- [x] **A8** [skills.md](../../architecture/skills.md) count 39 → 42; 3 new social-agents rows; [VALUES.md](../../architecture/VALUES.md) updated (managed 39→42, social 2→5, last-verified 2026-04-28)
- [x] **A9** `arch-verify.sh` from openclaw root — **4 failures → 1** (remaining `CELAVII_API_KEY missing from SHELL_ENV_EXPECTED_KEYS` is pre-existing Phase I work)
- [x] **A10** Commit checkpoint to both repos (workspace + openclaw)
- [x] **A11** [`plugin/plugin.json`](plugin/plugin.json) — `social-agents` v0.1.0, MIT, 18 skills + 3 commands + env/MCP requires
- [x] **A12** [`hooks/hooks.json`](hooks/hooks.json) + [`validate-social-content.py`](hooks/validate-social-content.py) stub — 3 PostToolUse hooks (content lint / state schema / brief structure), exit-code-2 blocking
- [x] **A13** PDF stack decided in [`decisions/0001-pdf-stack.md`](decisions/0001-pdf-stack.md) — **weasyprint+matplotlib** for v0; Next.js deferred to first client deliverable
- [~] **A14** social-persona + social-drift scaffolded with NOTICE.md attribution placeholders — **full vendoring rolls into Phase B13/B16** (defer SKILL.md content until paired with implementation)
- [x] **A15** [`.styles/celavii/voice.json`](file:///Users/operator/dev/workspace/.styles/celavii/voice.json) — NN/g 4-D + 3-channel overrides + 6 tone-by-context + 14 forbidden phrases + 9 AI-slop tells + structural rules
- [x] **A16** [`openclaw/.claude/rules/social-constitution.md`](file:///Users/operator/dev/openclaw/.claude/rules/social-constitution.md) — 10 articles (Specificity, Novelty, Sourced Claims, Distinctive POV, No Banned Language, Critic-Reads-Intake, Cross-Model Critic, Iter Cap=3, Specificity>Volume, Save Rate>Like Rate)
- [~] **A17** trendsmcp wire fully spec'd in [`decisions/0002-trendsmcp-wire.md`](decisions/0002-trendsmcp-wire.md) — **gateway settings.json patch deferred pending user approval** (gateway-config changes need explicit OK)

**Exit criteria**: Schema documented, orchestrator skeleton present, all paths exist on disk, arch-verify passes, voice schema + constitution authored.

### Phase B — Atomic Sub-Skills (Week 1–2)

**Goal**: Build the independent skills first. Strategy pipeline assembles them later. Order chosen so each skill can be tested standalone.

- [x] **B1** `social-research` SKILL.md — reads pillars from state, produces research packet for {week, channel, pillar}. Uses Celavii content search + web_search + Brave.
  - References: [celavii-discover/SKILL.md](file:///Users/operator/dev/workspace/skills/celavii-discover/SKILL.md) `/content/search` endpoint
  - Output path: `content/social/research/{week}-{channel}-research.md`
- [~] **B2** Test `social-research` standalone with one pillar from existing v2 state
- [x] **B3** `social-citations` SKILL.md (or fold into research) — extracts URL+claim pairs into citation doc
  - Output: `content/social/research/{post-id}-citations.md`
- [x] **B4** `social-brief` SKILL.md — reads research packet, produces brief with hook, beats, CTA, hashtags, success metric
  - Mirrors structure of [skills/blogger/blog-brief/](file:///Users/operator/dev/workspace/skills/blogger/blog-brief/)
  - Output: `content/social/briefs/{channel}-{post-id}-brief.md`
- [~] **B5** Test `social-brief` against one existing pillar
- [x] **B6** `social-script` SKILL.md — long-form video script (TT/YT/Reels)
  - Output: `content/social/scripts/{channel}-{post-id}-script.md`
- [x] **B7** `social-shotlist` SKILL.md — shot list from script (camera angle, b-roll cues, on-screen text, duration)
  - Output: `content/social/shotlists/{channel}-{post-id}-shots.md`
- [x] **B8** `social-quality` SKILL.md — single skill, three checklists (gate-a, gate-b, gate-c-per-post)
  - References: [.claude/rules/celavii-design-system.md](file:///Users/operator/dev/.claude/rules/celavii-design-system.md), [skills/quality-critic/](file:///Users/operator/dev/workspace/skills/quality-critic/) (steal Gate A pattern + intake-context lesson from [DRY-RUN-TEST-FINDINGS.md](file:///Users/operator/dev/workspace/.system/features/seo-strategy/DRY-RUN-TEST-FINDINGS.md))
  - Sub-references: `references/social-quality-checklist.md`, `references/banned-language.md`
- [x] **B9** Silo-check sub-mode in `social-quality` — given a brief, verify pillar alignment with state.phases.aggregate.pillars
- [x] **B10** `social-trend-detect` SKILL.md — per-platform trend gathering (Apify TT trending, X explore, IG hashtag growth, YT trending)
  - Output: `raw/trend-{platform}-{topic}-{ts}.json` + summary md
- [x] **B11** `social-discover` + `social-competitor-scrape` SKILL.md (combined, since both lean on Celavii API)
  - References: [celavii-data-ops/SKILL.md](file:///Users/operator/dev/workspace/skills/celavii-data-ops/SKILL.md) `/scrape/*` family
  - Always dry-run first (per data-ops convention)
  - ⚠️ **CELAVII EVAL**: before authoring, evaluate `/Users/operator/code/celavii/social_listener/src/lib/platform-adapters/` (instagram.ts, tiktok.ts, x.ts) and `scripts/adapters/` validators — wrap, don't reimplement
  - ⚠️ **CELAVII EVAL**: review `social_listener/Implementation/pipelines/scrape-dispatch-queue/` — their BullMQ queue model may already cover Phase 0 ACQUIRE
- [x] **B12** `social-plan` SKILL.md — calendar generation, repurposing loops
  - Output: `research/social/calendar-Qx-{date}.md`
  - Adopt Gary Vee Reverse Pyramid (1 pillar → 30+ atomic). Reference: [docs/frameworks.md § 8](docs/frameworks.md)
  - Use 2026 cadence rules per platform (Buffer/Sprout data). Reference: [docs/frameworks.md § 3](docs/frameworks.md)
- [x] **B13** `social-persona` SKILL.md — structured 4D voice JSON (NNGroup model). Replaces ad-hoc voice_rules in state.meta.intake. Built on A14 vendored Anthropic skill.
- [x] **B14** `social-factcheck` SKILL.md — fork [Libr-AI/OpenFactVerification (Loki)](https://github.com/Libr-AI/OpenFactVerification) graph topology: claim decomposition → check-worthiness → query gen → evidence retrieval → verdict. Pair with [BharathxD/ClaimeAI](https://github.com/BharathxD/ClaimeAI) LangGraph reference and [amazon-science/RefChecker](https://github.com/amazon-science/RefChecker) for AI-fabricated stat detection.
- [x] **B15** `social-cannibalization` SKILL.md — cosine-similarity (text-embedding-ada-002 or Voyage) + 30-day temporal window per channel. Threshold 0.85. Replaces Gate B manual check. Reference: [docs/frameworks.md § 10](docs/frameworks.md)
- [x] **B16** `social-drift` SKILL.md — SQLite baseline + 17-rule comparator (claude-seo `seo-drift` pattern). Cache at `~/.cache/claude-social/drift/`. Tracks engagement regressions, deleted posts, caption edits.
- [x] **B17** `social-sxo` SKILL.md — platform-fit analyzer ("does this post deserve to engage?"). Reads native ranking signals backwards to detect format/audience mismatches. Adapted from claude-seo `seo-sxo`.
- [x] **B18** `social-hooks` SKILL.md — generate 5+ hook variants per post tagged by 5 archetypes (Curiosity Gap, Contrarian, Story, Authority, Pattern Interrupt). Score each on specificity + gap-size + archetype clarity + predicted 3s-retention. Reference: [docs/frameworks.md § 7](docs/frameworks.md)
- [~] **B19** Integrate [ClipsAI/clipsai](https://github.com/ClipsAI/clipsai) (Apache 2.0) as backbone for `social-repurpose` video lane (transcript-aware cuts) + [Shaarav4795/ClippedAI](https://github.com/Shaarav4795/ClippedAI) viral-title prompt patterns
- [x] **B20** Adversarial 8-pass humanizer loop in `social-quality` (OpenClaudia Humanizer pattern) — anti-slop defense
- [x] **B21** Claim-extraction step in `social-quality` Gate C using RefChecker (catches AI-fabricated stats before publish)

**Exit criteria**: Each sub-skill independently invocable. Test invocation: `"run social-brief for fake-test-post"` produces a real artifact. Voice schema enforced by `social-persona`. Cross-skill dependencies (B13 ← A14, B19 ← B12) wired.

### Phase C — Deterministic Aggregator (Week 2)

**Goal**: The Phase 3 script. LLMs never read raw JSON. This is the cost unlock.

- [x] **C1** Spec the scoring rubric: relevance (0–10), differentiation (0–10), cross-pollination (0–10), effort (1–5). Document weights. → [`references/scoring-rubric.md`](file:///Users/operator/dev/openclaw/skills/social-aggregate/references/scoring-rubric.md)
- [x] **C2** Write `~/dev/workspace/skills/social-aggregate/scripts/aggregate.py` — reads `raw/*.json`, scores, clusters, outputs report
  - Reference pattern: [skills/seo/scripts/](file:///Users/operator/dev/workspace/skills/seo/scripts/) (the SEO Phase 3 aggregator)
- [x] **C3** Output: `aggregate-report-{date}.md` (LLM-readable consolidated report, ~2K tokens) — template renders 8 sections incl. cannibalization warnings + state delta
- [x] **C4** Update state.phases.aggregate.{pillars, scored_topics, report_path} — encoded as `state_delta` in payload
- [x] **C5** Test against a fixture set of raw JSON — bundled fixtures + `scripts/smoke-test.sh` with contract assertions; passes 12 posts / 50 scored / 1 cannib hard_fail / 0.01s
- [x] **C6** Document expected runtime (<5 sec target, per SEO precedent) → [`references/runtime-target.md`](file:///Users/operator/dev/openclaw/skills/social-aggregate/references/runtime-target.md). Empirical benchmark on real Celavii v3 raw data deferred until B11.1 (`scripts/discover.py`) ships.
- [x] **C7** Implement cosine-similarity + 30-day temporal cannibalization detection (powers B15). Reference: [docs/frameworks.md § 10](docs/frameworks.md) → [`references/cannibalization-thresholds.md`](file:///Users/operator/dev/openclaw/skills/social-aggregate/references/cannibalization-thresholds.md)
- [x] **C8** Encode 4E framework (Educate/Entertain/Engage/Empower) + 5 hook archetypes as content-type taggers. Require ≥2 E's per planned post on Celavii product channel. → [`references/4e-classifier.md`](file:///Users/operator/dev/openclaw/skills/social-aggregate/references/4e-classifier.md), [`references/archetype-patterns.md`](file:///Users/operator/dev/openclaw/skills/social-aggregate/references/archetype-patterns.md)
- [x] **C9** Compute velocity + acceleration + z-score (not raw volume) for trend signals per [readikus/ramekin](https://github.com/readikus/ramekin) algorithm. Treat platform-native trend lists as lagging, not leading. → [`references/trend-math.md`](file:///Users/operator/dev/openclaw/skills/social-aggregate/references/trend-math.md)

**Exit criteria**: Running aggregator on fixture raw/ produces deterministic, LLM-readable report. Cannibalization matrix + hook archetype tags + velocity z-scores all present.

### Phase D — Strategy Pipeline Command (Week 2–3)

**Goal**: Wire atomic skills into `/social_strategy` 7-phase command.

- [ ] **D1** Write `~/dev/openclaw/skills/social-orchestrator/commands/social-strategy.md` — mirror structure of [seo-strategy.md](file:///Users/operator/dev/workspace/skills/seo/commands/seo-strategy.md)
- [ ] **D2** Intake flow (5 Qs, one at a time, Telegram-friendly) — channels, identities, goal, competitors, voice rules
- [ ] **D3** Phase 0 ACQUIRE spec — calls `social-discover` + seed expansion
- [ ] **D4** Phase 1 DISCOVER spec — calls `social-discover` + `social-competitor-scrape` + `social-trend-detect`
- [ ] **D5** Phase 2 ANALYZE spec — pattern extraction, repurposing-map seed
- [ ] **D6** Phase 3 AGGREGATE — `social-aggregate` script
- [ ] **D7** Gate A spec — `social-quality` mode=gate-a; **MUST read intake.business_concept + voice_rules before scoring** (the SEO lesson)
- [ ] **D8** Phase 2B remediation flow — targeted scripts only, then re-aggregate, then re-Gate A
- [ ] **D9** Phase 4 PLAN — `social-plan`
- [ ] **D10** Gate B spec — `social-quality` mode=gate-b; cannibalization + cadence + repurposing-loop validity
- [ ] **D11** Phase 5 DELIVER — generate per-post briefs (loop `social-brief` over top N)
- [ ] **D12** Phase 6 REPORT — Next.js print-ready PDF (clone [deliverables/seo-report-v3/](file:///Users/operator/dev/workspace/projects/celavii/deliverables/seo-report-v3/) template)
- [ ] **D13** Help block (matches `/seo_strategy help` format)
- [ ] **D14** Cost/time estimates verified empirically on first dry run
- [ ] **D15** Adopt 15-parallel-subagent spawn pattern from claude-seo `/seo audit` for Phase 1 (DISCOVER) — one subagent per platform per channel
- [ ] **D16** Industry-aware delegation: detect channel type (founder/product/utility) → activate relevant subagents only
- [ ] **D17** Tiered credentials in `social-discover` (Tier 0/1/2 per blog-google pattern): public → API token → Business account
- [ ] **D18** Cross-model critic at all gates (Sonnet generates, Opus critiques) — defense against same-model false agreement. Reference: [docs/frameworks.md § 11](docs/frameworks.md)
- [ ] **D19** Hard-cap refinement loops at 3 iterations (Reflexion finding: diminishing returns after 3–5)
- [ ] **D20** Format-as-channel rule for channel splits (Linus Media Group pattern). Reference: [docs/frameworks.md § 2](docs/frameworks.md)
- [ ] **D21** Gary Vee Reverse Pyramid as repurposing planning rule — every long-form pillar must spawn N atomic outputs with explicit per-channel formatting

**Exit criteria**: `/social_strategy` callable end-to-end. Dry-run produces all phase artifacts in correct paths. Gates respect cross-model + iteration cap rules.

### Phase E — Weekly Curation Command (Week 3)

**Goal**: The user's stated use case — "based on this strategy, for this week we have to curate the topics, research, prepare script, citations, shot list, silo check."

- [ ] **E1** Write `~/dev/openclaw/skills/social-orchestrator/commands/social-curate.md`
- [ ] **E2** Reads `state.weekly_cycles[]` for target week, or generates a slice from `state.phases.plan.publication_calendar`
- [ ] **E3** For each scheduled post: call `social-research` → `social-citations` → `social-brief` → (if video) `social-script` → (if video) `social-shotlist` → `social-quality` mode=silo-check → `social-quality` mode=gate-c
- [ ] **E4** Failure handling: if silo-check fails, re-brief with explicit pillar reminder; max 1 retry per post
- [ ] **E5** Output bundle: `deliverables/handoffs/social-week-{YYYYWW}.zip` containing all artifacts for the week + an index README
- [ ] **E6** Append to `state.weekly_cycles[]` with status, post_count, paths
- [ ] **E7** Help block + dry-run mode (estimates credits before executing)
- [ ] **E8** Hook variant generation: 5+ per post, archetype-tagged (calls `social-hooks` skill from B18)

**Exit criteria**: `/social_curate week=2026-W18` produces zipped weekly bundle ready for human handoff or `celavii-social` execution.

### Phase F — Single-Post Command + Repurpose (Week 3)

- [ ] **F1** `/social_post post_id={id}` — runs all production skills for a single post
- [ ] **F2** `social-repurpose` SKILL.md — given a published blog or post, produce variants for each channel/platform
  - Mirror [skills/blogger/blog-repurpose/](file:///Users/operator/dev/workspace/skills/blogger/blog-repurpose/)
- [ ] **F3** Test repurpose against an existing published article (e.g., `agentic-shift-final.mdx`)

### Phase G — Dry-Run + Real Pilot (Week 3–4)

**Goal**: Run the same kind of dry-run that earned [DRY-RUN-TEST-FINDINGS.md](file:///Users/operator/dev/workspace/.system/features/seo-strategy/DRY-RUN-TEST-FINDINGS.md) for SEO. Find the equivalent of "Gate A had no intake context" before production use.

- [ ] **G1** Pick test target: Celavii channel, IG only (Phase 1 — narrow scope)
- [ ] **G2** Run `/social_strategy` end-to-end with verbose logging
- [ ] **G3** Document failures, gate-A fail modes, edge cases — save to `.system/features/social-strategy/DRY-RUN-TEST-FINDINGS.md`
- [ ] **G4** Iterate: fix the 2–3 highest-impact issues
- [ ] **G5** Run `/social_curate week=2026-Wxx` for one week of real production
- [ ] **G6** Compare cost/time to estimates; update command spec
- [ ] **G7** Decide: roll out to all 3 channels, or hold
- [ ] **G8** Set up `tests/social/` with `evaluations.json` + `conftest.py` (claude-blog test pattern)
- [ ] **G9** Test `social-aggregate` deterministic script against fixture data
- [ ] **G10** Add `validate-schema.py`-style hook for social-meta files
- [ ] **G11** Benchmark dry-run output against 2026 ER medians (TikTok 3.70%, Reels 7.5%, IG 0.48%, X 0.12%). Reference: [docs/frameworks.md § 4](docs/frameworks.md)
- [ ] **G12** Anti-slop self-review on first dry-run output (specificity, novelty, sourced claims, distinctive POV)

### Phase H — Multi-Platform Extension (Week 4+, gated on Phase G)

**Goal**: Enable TikTok/X/YouTube scraping. **Status updated 2026-04-28**: IG/TikTok/X adapters EXIST in [social_listener/src/lib/platform-adapters/](file:///Users/operator/code/celavii/social_listener/src/lib/platform-adapters/). YouTube adapter does NOT exist yet — confirm scope.

**YouTube status (2026-04-28)**: User confirmed YouTube adapter is shipping this week. Build the platform-dispatch layer **YouTube-ready** now (interface + registry slot + adapter shape) so integration is a drop-in once the adapter lands — defer only the actual `youtube.ts` wiring + smoke tests until enabled.

- [ ] **H1** ⚠️ **CELAVII EVAL**: Audit `social_listener/src/lib/platform-adapters/{instagram,tiktok,x}.ts` to map adapter contracts → public API endpoints. Verify which scrape endpoints these adapters back.
- [ ] **H2** Build platform-dispatch layer with `youtube` slot reserved in `resolveAdapter()` (returns "not yet enabled" sentinel until adapter lands). All downstream code paths must accept `'youtube'` as a valid platform string from day one.
- [ ] **H2a** Add `'youtube'` to platform enum/union types in `social-discover`, `social-competitor-scrape`, `social-trend-detect`, state-file schema, and intake Q4 (competitors per channel)
- [ ] **H2b** YouTube-specific adapter contract stub: define expected fields (channel_id, video_id, view_count, watch_time, retention curve, subscriber count, shorts vs long-form flag) so brief/script/shotlist skills can already reason about YT
- [ ] **H2c** YouTube-specific cadence + ER rule entries (≥12 uploads/month threshold from vidIQ data, `ER = engagements / views`) — wire into `social-aggregate` rules now
- [ ] **H2d** Add YouTube to actor-registry placeholder — note "awaiting Celavii adapter" with link to the in-flight adapter PR/spec when available
- [ ] **H3** Extend [celavii-data-ops/SKILL.md](file:///Users/operator/dev/workspace/skills/celavii-data-ops/SKILL.md) with platform-aware endpoints based on H1 audit findings (include YouTube as documented-but-disabled)
- [ ] **H4** Update `social-discover` + `social-competitor-scrape` to platform-dispatch via the existing [actor-registry](file:///Users/operator/code/celavii/social_listener/src/lib/platform-adapters/actor-registry/) (apidojo-tiktok-location, apify-instagram-hashtag, sociavault-tiktok-follower, etc.)
- [ ] **H5** Re-run dry-run with IG/TT/X; update findings doc
- [ ] **H6** Update [PROJECT.md](file:///Users/operator/dev/workspace/projects/celavii/PROJECT.md) project capabilities note ("Celavii Platforms" memory) — currently states "IG/TikTok/X coming soon" → revise to "IG/TT/X live; YouTube imminent"
- [ ] **H7** Wrap Apify SEO/Social scripts as `extensions/apify-social/` (claude-seo extension pattern)
- [ ] **H8** Wrap Celavii API as `extensions/celavii/` with install.sh + MCP merge into settings.json
- [ ] **H9** Sync our local `~/dev/workspace/skills/celavii-*` with [social_listener/packages/mcp/skills/](file:///Users/operator/code/celavii/social_listener/packages/mcp/skills/) — they have `celavii-platforms` and `celavii-jobs` we don't have

### Phase H-YT — YouTube Activation (deferred ~1 week, gated on adapter ship)

**Goal**: Light-up sequence once the `youtube.ts` adapter ships. Should be a small, mechanical merge if H2a–H2d were done correctly.

- [ ] **HYT1** Confirm `youtube.ts` adapter present in `social_listener/src/lib/platform-adapters/` + actor-registry entry filed
- [ ] **HYT2** Replace `'not yet enabled'` sentinel in `resolveAdapter('youtube')` with live wiring
- [ ] **HYT3** Smoke-test `social-discover --platform youtube` against Celavii's MaxKick or Celavii channel
- [ ] **HYT4** Run `social-trend-detect --platform youtube` (YouTube trending API or Celavii equivalent)
- [ ] **HYT5** Run `social-competitor-scrape --platform youtube` for one competitor channel
- [ ] **HYT6** Verify `social-aggregate` produces YT entries with cadence/ER scoring
- [ ] **HYT7** Generate one full YT brief + script + shotlist via `/social_post post_id={yt-test}`
- [ ] **HYT8** Update [PROJECT.md](file:///Users/operator/dev/workspace/projects/celavii/PROJECT.md) Celavii Platforms memory to "IG/TT/X/YT live"
- [ ] **HYT9** Close Q11

### Phase I — Architecture Drift Cleanup (parallelizable, anytime)

**Goal**: Address the 4 failures from `arch-verify.sh` flagged in this conversation. Not blocking but should ride along.

- [ ] **I1** Update [openclaw/.system/architecture/README.md](../../architecture/README.md) — gateway port `49152`
- [ ] **I2** Update [openclaw/.system/architecture/channels.md](../../architecture/channels.md) — gateway port `49152`
- [ ] **I3** Update [openclaw/.system/architecture/skills.md](../../architecture/skills.md) — current count 39 (+ 11 new social skills = 50 after this work)
- [ ] **I4** Add `CELAVII_API_KEY` to `SHELL_ENV_EXPECTED_KEYS` in [openclaw/src/config/io.ts](../../../src/config/io.ts)
- [ ] **I5** Create [openclaw/.system/architecture/VALUES.md](../../architecture/VALUES.md) — single source of truth for tracked values
- [ ] **I6** Append CHANGELOG entry: "Added social-agents skill family"
- [ ] **I7** Re-run `arch-verify.sh` — expect 0 failures

### Phase J — Extension Wrapping (parallelizable, anytime)

**Goal**: Wrap external integrations as proper extensions (claude-seo pattern), not just symlinked skills.

- [ ] **J1** `extensions/apify-social/` — wrap Apify TT/IG/YT actors with install.sh + MCP merge
- [ ] **J2** `extensions/celavii/` — wrap Celavii API key onboarding + MCP merge into settings.json
- [ ] **J3** `extensions/banana/` — port from claude-seo verbatim (image gen)
- [ ] **J4** Document extension manifest format in [openclaw/.system/architecture/](../../architecture/)

### Phase K — Celavii Social Score (Stretch goal, post-pilot)

**Goal**: Publish a Lighthouse-equivalent for social media. Identified as a real market gap in [docs/frameworks.md § 4](docs/frameworks.md) — no public reproducible composite social-health score exists.

- [ ] **K1** Define Celavii Social Score formula (composite: ER + save-rate + follow-conversion + retention, weighted)
- [ ] **K2** Validate against 2026 benchmarks per platform
- [ ] **K3** Document publicly + open-source the scoring methodology
- [ ] **K4** Wire as Phase 6 (Report) headline metric in PDF deliverable

---

## 6. Critical Design Rules (Non-Negotiable)

These come from SEO post-mortem lessons. Skipping them re-creates known failure modes.

1. **Critic reads intake before scoring.** Gate A's checklist must explicitly require loading `state.meta.intake.business_concept`, `voice_rules`, `banned_language`, `competitors_per_channel`. Reference: [DRY-RUN-TEST-FINDINGS.md § Finding 1](file:///Users/operator/dev/workspace/.system/features/seo-strategy/DRY-RUN-TEST-FINDINGS.md).
2. **Phase 3 is deterministic.** No LLM in aggregation. The script consolidates raw → report. The LLM only reads the report.
3. **Raw archive accumulates.** Every tool output saved to `raw/{tool}-{target}-{ts}.json`. Never `/tmp/`. Never overwrite. Cross-run reuse via timestamp check.
4. **Evidence rules.** Every finding cites a tool. Every score has a source. Reports below minimum tool count are rejected (mirror [seo-orchestrator/SKILL.md § Quality Self-Check](file:///Users/operator/dev/workspace/skills/seo/seo-orchestrator/SKILL.md)).
5. **Atomic skills are independently invocable.** No skill may require the orchestrator. Each skill takes the state file path as arg, defaults to canonical path, and updates state on success.
6. **Files registered in PROJECT.md.** Every save updates the File Index per [WORKSPACE.md routing](file:///Users/operator/dev/workspace/WORKSPACE.md).
7. **Absolute paths only.** No relative paths in any skill. (WORKSPACE.md rule.)
8. **Project alias map respected.** "social", "social media", "social-agents" all → `projects/celavii/research/social/` (or whichever project context — never create new project dir).
9. **Always dry-run first** for scrape operations. Mirror [celavii-data-ops](file:///Users/operator/dev/workspace/skills/celavii-data-ops/SKILL.md) convention.
10. **Banned language enforced** per [.claude/rules/celavii-design-system.md](file:///Users/operator/dev/.claude/rules/celavii-design-system.md).

---

## 7. Open Questions / Blockers

- [x] **Q1** ~~Multi-platform Celavii API endpoint paths~~ — **PARTLY ANSWERED 2026-04-28**: IG/TikTok/X adapters exist in [social_listener/src/lib/platform-adapters/](file:///Users/operator/code/celavii/social_listener/src/lib/platform-adapters/). Public API exposure requires Phase H1 audit. **No YouTube adapter** — needs scoping decision.
- [ ] **Q2** Channel identities — confirm Elioth / Celavii / CutMaster final channel-by-platform map (does Elioth post on TikTok? Does CutMaster have a YouTube?)
- [ ] **Q3** Pillar count target per channel — 3, 5, or "let aggregator decide"?
- [ ] **Q4** PDF report template — clone seo-report-v3 or design new? **Recommend weasyprint+matplotlib** per [docs/integration-recommendations.md](docs/integration-recommendations.md) (no Next.js build step)
- [ ] **Q5** Trend detection tooling — **Recommend** [trendsmcp/tiktok-trends-mcp](https://github.com/trendsmcp/tiktok-trends-mcp) MCP server + ramekin z-score math; rely on Celavii API for IG/X once multi-platform exposed
- [ ] **Q6** Quality threshold — port SEO's "≥80 / hard stop" or use a different cutoff?
- [ ] **Q7** Approval — green-light Phases A–G + new B13–B21, A11–A17, C7–C9, D15–D21, E8, G8–G12 as scoped?
- [ ] **Q8** ⚠️ Adopt cross-model critic config (Sonnet generates, Opus critiques) at all gates? Recommend yes — defense against same-model false agreement
- [ ] **Q9** Adopt extensions/ pattern (Phase J)? Recommend yes
- [ ] **Q10** Build & publish Celavii Social Score (Phase K stretch)? Real market gap
- [x] **Q11** ~~YouTube scope~~ — **ANSWERED 2026-04-28**: User confirmed YouTube adapter ships this week. Build YT-ready dispatch layer now (H2a–H2d); execute Phase H-YT activation steps when adapter lands.
- [ ] **Q12** ⚠️ Sync local `celavii-*` skills with [social_listener/packages/mcp/skills/](file:///Users/operator/code/celavii/social_listener/packages/mcp/skills/) — they have `celavii-platforms` + `celavii-jobs` we don't?

---

## 8. Cost & Time Estimate

| Phase                       | Dev time                 | Runtime/run    | Cost/run    |
| --------------------------- | ------------------------ | -------------- | ----------- |
| A — Foundation              | 0.5 day                  | —              | —           |
| B — Atomic skills (×11)     | 3 days                   | —              | —           |
| C — Aggregator script       | 0.5 day                  | <5 sec         | $0          |
| D — Strategy pipeline       | 1 day                    | 90–120 min     | ~$3–6       |
| E — Curate command          | 0.5 day                  | 20–40 min/week | ~$1–2/week  |
| F — Single-post + repurpose | 0.5 day                  | 5–15 min/post  | ~$0.20/post |
| G — Dry-run + pilot         | 1 day                    | (uses D & E)   | ~$10 total  |
| H — Multi-platform          | 0.5 day (when unblocked) | —              | —           |
| I — Arch cleanup            | 0.5 day                  | —              | —           |
| **Total dev**               | **~8 days**              |                |             |

Compare to SEO pipeline: ~$5–8/run, 90–130 min — same order of magnitude.

---

## 9. Sequencing Summary

```
Week 1 →  A (Foundation) + start B (atomic skills)
Week 2 →  finish B + C (aggregator) + start D (pipeline)
Week 3 →  finish D + E (curate) + F (single-post)
Week 4 →  G (dry-run pilot) → decide rollout
Week 4+ → H (multi-platform, when unblocked) + I (arch cleanup, parallel)
```

Atomic skills (Phase B) ship before the orchestrator (Phase D) — this means weekly curation usability arrives in **Week 2** even before the full strategy pipeline lands. That's the user's stated priority.

---

## 10. Approval

- [ ] User reviews & approves scope (now includes 21 research-driven additions)
- [ ] User answers Open Questions Q2, Q3, Q6, Q7, Q8, Q9, Q10, Q11, Q12
- [x] Q1 partly answered (adapters exist; H1 audit needed)
- [x] Q4 answered with recommendation (weasyprint)
- [x] Q5 answered with recommendation (trendsmcp + ramekin)
- [ ] Begin Phase A

---

## 11. Celavii social_listener Repo — Capabilities to Evaluate

> Source-of-truth for actual platform capabilities: `/Users/operator/code/celavii/social_listener/`
> Audited 2026-04-28. **Several Celavii capabilities appear to overlap with what we're planning to build — these need explicit evaluation when phases hit them so we wrap (not reimplement).**

### 11.1 Platform Adapter Layer — EXISTS

Location: [`src/lib/platform-adapters/`](file:///Users/operator/code/celavii/social_listener/src/lib/platform-adapters/)

| Adapter   | File           | Status         |
| --------- | -------------- | -------------- |
| Instagram | `instagram.ts` | ✅ Wired       |
| TikTok    | `tiktok.ts`    | ✅ Wired       |
| X         | `x.ts`         | ✅ Wired       |
| YouTube   | `youtube.ts`   | ❌ NOT PRESENT |

Adapter resolves via `resolveAdapter(platform)` with normalization. Both Node.js (`src/lib/`) and Deno Edge Function (`supabase/functions/_shared/`) variants implement same `PlatformAdapter` contract.

**Validators**: [`scripts/adapters/validate-{instagram,tiktok}.ts`](file:///Users/operator/code/celavii/social_listener/scripts/adapters/) + `audit-comment-actors.ts` + `schema-manifest.json`.

**Affects**: B11, B16, H1–H9 — wrap, don't reimplement.

### 11.2 Apify Actor Registry — DOCUMENTED

Location: [`src/lib/platform-adapters/actor-registry/`](file:///Users/operator/code/celavii/social_listener/src/lib/platform-adapters/actor-registry/)

Documented Apify actors:

- `apidojo-instagram-location`
- `apidojo-tiktok-location`
- `apify-instagram-hashtag`
- `apify-instagram-profile-scraper`
- `sociavault-tiktok-follower`
- `sociavault-tiktok-following`

Plus a `TODO-adapter-consolidation.md` indicating active work.

**Affects**: B10 (`social-trend-detect`), B11. Reuse this registry instead of guessing actor IDs.

### 11.3 MCP Package — RICHER THAN OUR LOCAL SKILLS

Location: [`packages/mcp/skills/`](file:///Users/operator/code/celavii/social_listener/packages/mcp/skills/)

12 skills present:

- `celavii-analytics`, `celavii-campaigns`, `celavii-crm`, `celavii-data-ops`, `celavii-discover`, `celavii-jobs`, `celavii-knowledge`, `celavii-outreach`, `celavii-platforms`, `celavii-profiles`, `celavii-reporting`, `celavii-strategy`

**Our local set has 10** — missing `celavii-jobs` and `celavii-platforms`. Likely tracks long-running scrape jobs and platform discovery.

**Affects**: Q12, H9. Sync needed.

### 11.4 Pipeline Architecture — ALREADY ASYNC + QUEUED

Location: [`Implementation/pipelines/`](file:///Users/operator/code/celavii/social_listener/Implementation/pipelines/)

Documented pipelines:

- `scrape-dispatch-queue` — BullMQ job dispatch
- `processing-dispatch-queue` — post-scrape processing
- `queue-architecture` — overall queue model
- `follower-following-collection` — network expansion
- `location-collection` — geo-tagged content
- `reels-collection` — IG Reels-specific
- `profile-search-linking` — entity resolution
- `post-processing` — canonical transform
- `media-storage` — image/video archival
- `data-refinement` — AI enrichment
- `ingestion-migration-tracker`

**Implication**: Phase 0 ACQUIRE may be partially solvable by triggering existing Celavii scrape-dispatch-queue jobs rather than building parallel scraping.

**Affects**: B11, D3, D4. Evaluate before authoring.

### 11.5 Python Backend + LangGraph Agent — EXISTS

Location: [`python-backend/`](file:///Users/operator/code/celavii/social_listener/python-backend/)

- FastAPI app with `/health` + `/suggest` endpoints
- `agent.py` — LangGraph agent (commented out in `main.py`, indicating WIP)
- `models.py`, `database.py`, `tools.py` — agent infrastructure

**Implication**: There's an existing LangGraph runtime we could potentially extend rather than building parallel orchestration. Or it's experimental and we should ignore it. Needs evaluation.

**Affects**: D-phase architecture decisions.

### 11.6 Implementation Documentation — DEEP

Location: [`Implementation/`](file:///Users/operator/code/celavii/social_listener/Implementation/) and [`Docs/`](file:///Users/operator/code/celavii/social_listener/Docs/)

Subdirs of note:

- `Implementation/social-platforms/{instagram,tiktok,x-twitter}/` — per-platform feature specs
- `Implementation/platforms/x-twitter/` — X-specific work
- `Docs/system-architecture/`, `Docs/database-schema-workflow.md` — schema source-of-truth
- `Docs/ENGAGEMENT-CALCULATOR-PIPELINE.md` — already a documented engagement calc

**Affects**: K1 (Social Score formula) — there may already be an engagement calculator we should build on instead of reinvent.

### 11.7 Eval Tasks (insert at start of relevant phases)

Add these to the implementation phase trackers as **explicit eval gates**:

- [ ] **EVAL-1** (before B11): Read `social_listener/src/lib/platform-adapters/index.ts` + `instagram.ts` + `tiktok.ts` + `x.ts` to map adapter contracts. Decide: wrap as MCP tool, or replicate.
- [ ] **EVAL-2** (before B11): Read `social_listener/Implementation/pipelines/scrape-dispatch-queue/` + `queue-architecture/` to determine if Phase 0 ACQUIRE can dispatch existing jobs rather than build new scrapers.
- [ ] **EVAL-3** (before D-phase): Read `social_listener/python-backend/agent.py` to determine if existing LangGraph runtime is a fit or should be ignored.
- [ ] **EVAL-4** (before K1): Read `social_listener/Docs/ENGAGEMENT-CALCULATOR-PIPELINE.md` — extend their engagement formula instead of inventing one.
- [ ] **EVAL-5** (anytime): Sync our 10 local `celavii-*` skills against `social_listener/packages/mcp/skills/` (12 skills); pull in `celavii-jobs` and `celavii-platforms` if applicable.
- [ ] **EVAL-6** (before H1): Confirm public-API exposure for each adapter — adapters being internal to the Next.js app doesn't mean they're surfaced through the public API. May need API endpoint additions on Celavii side.
- [x] **EVAL-7** ~~Confirm YouTube scope~~ — confirmed 2026-04-28: YT shipping this week, build dispatch YT-ready (H2a–H2d), activate via Phase H-YT

### 11.8 Risks This Audit Surfaced

1. **Reimplementation risk** — building `social-discover` parallel to `social_listener/scrape-dispatch-queue` would duplicate effort. Evaluate first.
2. **Skill drift** — our local 10 `celavii-*` skills diverge from the in-repo MCP set of 12.
3. ~~**YouTube scope creep**~~ — resolved 2026-04-28: adapter ships this week. Risk reframed: ensure H2a–H2d (dispatch slot, types, cadence rules, registry placeholder) land before Phase H-YT so YT activation is mechanical, not architectural.
4. **API exposure gap** — internal adapters ≠ public API endpoints. Phase H may require Celavii repo PRs to expose new endpoints.
