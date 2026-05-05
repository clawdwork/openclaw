---
name: social-aggregate
description: >
  Deterministic Phase 3 aggregator for the social-agents pipeline. Reads raw/*.json
  (profiles, posts, hashtags, competitors), scores topics, clusters posts by cosine
  similarity, tags hooks by archetype + 4E, computes velocity/acceleration/z-score
  trend signals, and emits a single LLM-readable markdown report (~2K tokens).
  No LLM in aggregation — this is the cost unlock.
user-invocable: true
metadata: { "openclaw": { "emoji": "📊", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-aggregate

> **Phase C.** Mirrors [`workspace/skills/seo/scripts/seo-aggregate.py`](file:///Users/operator/dev/workspace/skills/seo/scripts/seo-aggregate.py) (1009 lines, deterministic). Same contract: many raw JSONs in → one structured report out. The LLM never reads raw files.

## Why deterministic?

| Approach              | Cost (per run) | Determinism | Failure mode                                |
| --------------------- | -------------- | ----------- | ------------------------------------------- |
| LLM reads every raw   | ~$2–5          | low         | Hallucinated stats, missed posts            |
| **Python aggregator** | **<$0.001**    | **high**    | **Logged, traceable, fixable in one place** |

5–10× cost reduction per [v2/eval-findings.md § E](../../.system/features/social-strategy/v2/eval-findings.md). Per-aggregation runtime target: **<5 sec on 1000 posts**.

## CLI

```bash
social-aggregate run --social-dir projects/celavii/research/social
# → aggregate-report-{date}.md  (LLM-consumable summary)
# → aggregate-report-{date}.json (full structured payload)
```

Optional flags:

```bash
--output PATH            # override default output path
--cannibalization-window 30  # days for temporal de-dup window
--top-n 50                # top-N scored topics surfaced in markdown
--fixture                # use bundled fixtures/raw/ instead of --social-dir
```

## Inputs

Reads from `{social-dir}/raw/`:

| Pattern                                         | Source skill               |
| ----------------------------------------------- | -------------------------- |
| `celavii-{handle}-{platform}-profile-{ts}.json` | `social-discover` Mode A   |
| `celavii-{handle}-{platform}-posts-{ts}.json`   | `social-discover` Mode A   |
| `celavii-hashtag-{tag}-{platform}-{ts}.json`    | `social-discover` Mode B   |
| `celavii-location-{id}-{platform}-{ts}.json`    | `social-discover` Mode C   |
| `celavii-{competitor}-{platform}-*.json`        | `social-competitor-scrape` |

Plus `{social-dir}/social-strategy-state.json` for intake (channels, voice, competitors, banned language).

## Outputs

### Structured: `aggregate-report-{date}.json`

```json
{
  "version": 1,
  "generated_at": "2026-04-28T14:00:00Z",
  "social_dir": "projects/celavii/research/social",
  "stats": { "raw_files": 47, "posts_processed": 1342, "competitors": 8 },
  "scored_topics": [
    {
      "topic": "agentic creator outreach",
      "score": 8.4,
      "relevance": 9, "differentiation": 8, "cross_pollination": 7, "effort": 3,
      "supporting_post_ids": ["tt:7234...", "ig:Cabc..."],
      "channel_fit": ["celavii", "elioth"]
    }
  ],
  "cannibalization_clusters": [
    { "cluster_id": "cn-001", "posts": [...], "max_cosine": 0.92, "window_days": 7 }
  ],
  "hook_archetype_distribution": {
    "celavii": { "authority": 0.42, "curiosity_gap": 0.30, "story": 0.12, "contrarian": 0.10, "pattern_interrupt": 0.06 }
  },
  "e_mix": { "celavii": { "educate": 0.55, "empower": 0.25, "entertain": 0.15, "engage": 0.05 } },
  "trend_signals": [
    { "term": "agentic", "platform": "tiktok", "velocity": 0.42, "acceleration": 0.18, "z_score": 2.7, "status": "exploding" }
  ],
  "channel_baselines": { "celavii": { "instagram": { "er_pct": 0.62, "posts_per_week": 3.8 } } }
}
```

### Markdown: `aggregate-report-{date}.md`

LLM-readable summary capped at ~2K tokens. Structure:

1. **Header** — date, dir, stats line
2. **Top 25 Scored Topics** — table (topic, score, relevance, diff, cross-poll, effort)
3. **Hook Archetype Mix per Channel** — proves the constitution Article 4 (Distinctive POV)
4. **4E Distribution per Channel** — proves Article 1 + Article 9 (Specificity > Volume)
5. **Trend Signals (z>2)** — exploding terms only
6. **Cannibalization Warnings** — clusters where max_cosine ≥ 0.85
7. **Channel Baselines** — followers, ER%, posts/week per platform per channel
8. **State delta** — fields written to `state.phases.aggregate.*`

## Scoring rubric

| Field             | Range | Weight          | Source                                                                                       |
| ----------------- | ----- | --------------- | -------------------------------------------------------------------------------------------- |
| Relevance         | 0–10  | 0.35            | Match to channel `intake.differentiators[]` + `intake.content_silos[]`                       |
| Differentiation   | 0–10  | 0.30            | Inverse cosine vs competitors' top posts (high = no one else is talking about it)            |
| Cross-pollination | 0–10  | 0.20            | Repurpose breadth — how many channels/formats can this fan out to (Gary Vee Reverse Pyramid) |
| Effort            | 1–5   | 0.15 (inverted) | Production cost: static < carousel < short-video < long-video < interactive                  |

Composite formula (full detail in [`references/scoring-rubric.md`](references/scoring-rubric.md)):

```
score = (0.35 × relevance) + (0.30 × differentiation) + (0.20 × cross_pollination) + (0.15 × (6 - effort) × 2)
```

Anything <5.0 is dropped from `scored_topics[]` (not surfaced to LLM).

## Cannibalization detection (C7)

- TF-IDF over (hook + first 200 chars of body), L2-normalized cosine.
- 30-day temporal window (configurable via `--cannibalization-window`).
- Threshold table per [`references/cannibalization-thresholds.md`](references/cannibalization-thresholds.md):

| Cosine    | Status    | Action                                             |
| --------- | --------- | -------------------------------------------------- |
| ≥ 0.85    | hard fail | block at Gate B; force differentiate or reschedule |
| 0.70–0.85 | warn      | annotate brief with "near-duplicate of {post_id}"  |
| < 0.70    | pass      | no flag                                            |

## 4E + 5-archetype taggers (C8)

Hook archetype regex bank lives in [`references/archetype-patterns.md`](references/archetype-patterns.md). 4E classifier uses keyword + intent heuristics in [`references/4e-classifier.md`](references/4e-classifier.md).

Constraint encoded for Celavii product channel: **≥2 distinct E's per planned post**. Aggregator flags posts that resolve to a single E.

## Trend math (C9)

Per [readikus/ramekin](https://github.com/readikus/ramekin) algorithm, per [`references/trend-math.md`](references/trend-math.md):

- Build daily frequency series for every n-gram (n=1,2) in last 30d of posts.
- `velocity` = mean(daily_count[7d]) / mean(daily_count[30d])
- `acceleration` = velocity[7d] − velocity[14d]
- `z_score` = (today_count − μ_30d) / σ_30d
- Status: `z ≥ 2.5` → exploding; `1.5 ≤ z < 2.5` → rising; else baseline.

Platform-native trend lists are treated as **lagging signals** — z-score on first-party scraped data is the leading signal.

## State writes

```json
state.phases.aggregate = {
  "report_path_md":   "projects/celavii/research/social/aggregate-report-2026-04-28.md",
  "report_path_json": "projects/celavii/research/social/aggregate-report-2026-04-28.json",
  "scored_topics_count": 73,
  "cannibalization_warnings": 4,
  "trend_signals_exploding": 2,
  "ran_at": "2026-04-28T14:00:00Z",
  "runtime_sec": 3.1
}
```

## Runtime target

**<5 seconds** on 1000 posts × 8 competitors (per SEO aggregator precedent — 1009 LOC, 30+ raw files, ~3s observed). Pure stdlib + `math` + `re`; no numpy/pandas. Cosine via hashed-token L2 norm to keep it lean.

## Integration

- Called by `/social_strategy` Phase 3 (AGGREGATE) — never by humans during normal flow
- Outputs feed Gate A (`social-quality` mode=gate-a)
- Drives `social-cannibalization` skill (which reads this output, not raw)
- Drives `social-plan` (Phase 4) — `scored_topics[]` is its input
- Read-only consumer: `social-drift` snapshots `channel_baselines` for ER trend tracking

## References

- [`references/scoring-rubric.md`](references/scoring-rubric.md) — full weights + worked example
- [`references/cannibalization-thresholds.md`](references/cannibalization-thresholds.md) — cosine bands + actions
- [`references/archetype-patterns.md`](references/archetype-patterns.md) — 5 hook archetype regexes
- [`references/4e-classifier.md`](references/4e-classifier.md) — Educate/Entertain/Engage/Empower heuristics
- [`references/trend-math.md`](references/trend-math.md) — ramekin algorithm port
- [`fixtures/raw/`](fixtures/) — minimal smoke-test fixtures (3 profiles + 12 posts)

## Status

- [x] SKILL.md scaffold (this file) — Phase C contract
- [x] `scripts/aggregate.py` — deterministic aggregator (Phase C2)
- [x] Reference docs — scoring rubric, thresholds, taggers, trend math (Phase C1, C7, C8, C9)
- [x] Fixture set + smoke test (Phase C5)
- [ ] Empirical runtime benchmark on real Celavii v2 raw data (Phase C6 — runs once social-discover B11.1 ships)
- [ ] `--research-mode` flag — Phase B12.1 (added 2026-05-04 from cutmasterai dry-run, Patch H). Reads `state.phases.discover.{competitive_format_analysis, trend_signals_seed, format_best_practices, repurposing_map_seed, projections}` + `state.phases.analyze` + `state.intake.{differentiators, business_concept}` instead of raw/ JSONs. Outputs same report shape with research-mode banner and `research_mode_metadata` block. Cannibalization analysis returns `"N/A"`; trend explosion detection returns `null` (no z-scores). Pillar scoring uses 3-factor heuristic: differentiator coverage 0.4 + whitespace strength 0.3 + format fit 0.3. See `commands/social-strategy.md` § Phase 3 Research mode for full pseudo-code.
