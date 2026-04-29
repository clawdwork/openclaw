# Social Strategy Suite — v1 Implementation Plan

> **Status**: Phase A COMPLETE 2026-04-28 — Phase B next
> **Created**: 2026-04-28
> **Owner**: social-orchestrator
> **Dependencies**: social-orchestrator, all social sub-skills, Celavii API, Apify, MCP gateway

---

## 1. Goal

Mirror the SEO 3-layer suite for social. Three use cases:

1. **Quick answers** (Layer 1: Tools) — standalone, fast, no dependencies
2. **Client deliverables** (Layer 2: Workflows) — multi-step, produce zips/PDFs
3. **Full engagement strategy** (Layer 3: Strategy) — chained pipeline, each phase feeds the next

The suite eliminates fragmented tooling and delivers a top-to-bottom social strategy from a single command.

---

## 2. Architecture: 3 Layers

```
Layer 3: STRATEGY (full engagement)
  └─ /social_strategy — complete top-to-bottom 7-phase pipeline (Acquire→Discover→Analyze→Aggregate→Plan→Deliver→Report)

Layer 2: WORKFLOWS (multi-step, focused deliverables)
  ├─ /social_curate week=YYYY-Wnn — weekly production cycle (research → brief → script → shotlist → silo check → handoff zip)
  └─ /social_post post_id={id} — single-post production cycle

Layer 1: TOOLS (single-use, fast answers)
  ├─ /social_trend — what's trending on platform X this week
  ├─ /social_competitor — competitor profile + recent posts
  ├─ /social_brief — one-shot brief from a topic
  ├─ /social_persona enforce — voice lint
  ├─ /social_drift compare — engagement regression check
  ├─ /social_factcheck — claim verification
  └─ /social_cannibalization — overlap check across recent posts
```

### Layer Properties

| Layer         | Input                  | Output                    | Time       | Dependencies                            |
| ------------- | ---------------------- | ------------------------- | ---------- | --------------------------------------- |
| **Tools**     | platform/topic/post-id | Markdown report or JSON   | 5–15 min   | None (standalone)                       |
| **Workflows** | week or post-id        | Bundle (zip) of artifacts | 20–40 min  | Tools run internally                    |
| **Strategy**  | channel set + intake   | Strategy package + PDF    | 90–120 min | Chains Tools + Workflows via state file |

---

## 3. Current State (What Exists After Phase A)

### Layer 3: Strategy

| Command            | Status             | File                                                               |
| ------------------ | ------------------ | ------------------------------------------------------------------ |
| `/social_strategy` | 🚧 Phase D pending | `skills/social-orchestrator/commands/social-strategy.md` (planned) |

### Layer 2: Workflows

| Command          | Status             | File                                                             |
| ---------------- | ------------------ | ---------------------------------------------------------------- |
| `/social_curate` | 🚧 Phase E pending | `skills/social-orchestrator/commands/social-curate.md` (planned) |
| `/social_post`   | 🚧 Phase F pending | `skills/social-orchestrator/commands/social-post.md` (planned)   |

### Layer 1: Tools

| Command                   | Status               | File                                                                                                   |
| ------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------ |
| `/social_trend`           | 🚧 Phase B10 pending | `skills/social-trend-detect/SKILL.md`                                                                  |
| `/social_competitor`      | 🚧 Phase B11 pending | `skills/social-competitor-scrape/SKILL.md`                                                             |
| `/social_brief`           | 🚧 Phase B4 pending  | `skills/social-brief/SKILL.md`                                                                         |
| `/social_persona`         | ✅ Phase A scaffold  | [`skills/social-persona/SKILL.md`](file:///Users/operator/dev/openclaw/skills/social-persona/SKILL.md) |
| `/social_drift`           | ✅ Phase A scaffold  | [`skills/social-drift/SKILL.md`](file:///Users/operator/dev/openclaw/skills/social-drift/SKILL.md)     |
| `/social_factcheck`       | 🚧 Phase B14 pending | `skills/social-factcheck/SKILL.md`                                                                     |
| `/social_cannibalization` | 🚧 Phase B15 pending | `skills/social-cannibalization/SKILL.md`                                                               |

### Supporting Infrastructure

| Item                            | Status                                    | File                                                                                                                                                                    |
| ------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Master proposal                 | ✅ Live                                   | [../social-agents-implementation-proposal.md](../social-agents-implementation-proposal.md) — 154 tracker items                                                          |
| Research docs                   | ✅ Live                                   | [../docs/](../docs/) — repos.md, frameworks.md, integration-recommendations.md                                                                                          |
| Community-repo extraction notes | ✅ Live                                   | [../community-repos-extraction-notes.md](../community-repos-extraction-notes.md)                                                                                        |
| Plugin manifest                 | ✅ Live                                   | [../plugin/plugin.json](../plugin/plugin.json)                                                                                                                          |
| Hooks config + validator stub   | ✅ Live                                   | [../hooks/hooks.json](../hooks/hooks.json) + [../hooks/validate-social-content.py](../hooks/validate-social-content.py)                                                 |
| PDF stack decision              | ✅ Live (weasyprint)                      | [../decisions/0001-pdf-stack.md](../decisions/0001-pdf-stack.md)                                                                                                        |
| trendsmcp wire spec             | ✅ Live (pending gateway-config approval) | [../decisions/0002-trendsmcp-wire.md](../decisions/0002-trendsmcp-wire.md)                                                                                              |
| Voice spec (NN/g 4-D)           | ✅ Live                                   | [`~/dev/workspace/.styles/celavii/voice.json`](file:///Users/operator/dev/workspace/.styles/celavii/voice.json)                                                         |
| Social Constitution             | ✅ Live                                   | [`openclaw/.claude/rules/social-constitution.md`](file:///Users/operator/dev/openclaw/.claude/rules/social-constitution.md)                                             |
| State spec v3 (appended)        | ✅ Live                                   | [`projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md`](file:///Users/operator/dev/workspace/projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md) |
| Dir skeleton                    | ✅ Live                                   | `projects/celavii/{research/social/raw, content/social/{research,briefs,scripts,shotlists}, deliverables/handoffs}`                                                     |

---

## 4. Build Plan

See full phase breakdown in the master proposal: [../social-agents-implementation-proposal.md § 5](../social-agents-implementation-proposal.md). 154 tracker items across phases A–K + H-YT.

### Phase A — Foundation (DONE 2026-04-28)

See [TRACKER.md](TRACKER.md) for the full Phase A checklist with status.

Highlights:

- v3 state schema appended
- 3 skills scaffolded (social-orchestrator, social-persona, social-drift) + symlinked into managed dir
- Plugin manifest + hooks + validator stub
- Voice JSON + Constitution
- PDF stack decision (weasyprint)
- trendsmcp wire spec (pending gateway approval)
- arch-verify down to 1 pre-existing failure (Phase I cleanup)

### Phase B — Atomic Sub-Skills (NEXT)

Build 13 independent skills before the orchestrator command. See master proposal Phase B (B1–B21) for full list. Top priorities:

1. B11 `social-discover` + `social-competitor-scrape` (with EVAL-1 + EVAL-2 first)
2. B13 `social-persona` discover/enforce CLI (vendor Anthropic brand-voice)
3. B16 `social-drift` SQLite + 17 rules
4. B14 `social-factcheck` (Loki skeleton fork)
5. B15 `social-cannibalization` (cosine + 30d window)
6. B18 `social-hooks` (5 archetypes)

### Phase C — Aggregator (deterministic script)

Phase 3 script. No LLM in aggregation. Cosine cannibalization + 4E + hook archetype tags + velocity z-score.

### Phase D — Strategy Pipeline

`/social_strategy` 7-phase command. Cross-model critic (Sonnet ⊥ Opus) + 3-iteration cap.

### Phase E — Weekly Curate

`/social_curate week=YYYY-Wnn`. Loops the per-post production cycle; outputs zip handoff.

### Phase F — Single-Post + Repurpose

`/social_post`. ClipsAI integration for video lane.

### Phase G — Pilot

Dry-run + benchmark vs 2026 ER medians + anti-slop self-review.

### Phase H — Multi-Platform + H-YT — YouTube Activation

Wrap existing Celavii social_listener adapters; H-YT activates YouTube once adapter ships.

### Phases I, J, K — Drift cleanup, Extensions, Social Score (stretch)

---

## 5. Reference

- Master proposal: [../social-agents-implementation-proposal.md](../social-agents-implementation-proposal.md)
- Research: [../docs/](../docs/)
- Phase A tracker: [TRACKER.md](TRACKER.md)
- SEO precedent: [../../seo-strategy/v1/IMPLEMENTATION.md](../../seo-strategy/v1/IMPLEMENTATION.md)
