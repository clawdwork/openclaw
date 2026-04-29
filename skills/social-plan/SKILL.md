---
name: social-plan
description: >
  Build the publication calendar, cross-channel repurposing loops, and per-post
  scheduling slots. Implements Gary Vee Reverse Pyramid (1 pillar → 30+ atomic
  outputs) + 2026 sustainable-cadence rules + hub-vs-pillar separation. Phase 4
  (Plan) of /social_strategy. Reads from state.phases.aggregate; writes to
  state.phases.plan.
user-invocable: true
metadata: { "openclaw": { "emoji": "🗓️", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-plan

> **Phase B12.** Models on Gary Vee Reverse Pyramid ([GV Content Model PDF](https://s3.amazonaws.com/gv2016wp/wp-content/uploads/20180725172810/GV-Content-Model-1.pdf)) + Animalz hub-vs-pillar ([docs/frameworks.md § 1](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/frameworks.md)) + 2026 cadence empirical data ([docs/frameworks.md § 3](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/frameworks.md)).

## Modes

### Mode A — Full calendar (Phase 4 of /social_strategy)

```bash
social-plan calendar --weeks 8 --start 2026-W19
```

Reads `state.phases.aggregate.{pillars, scored_topics}`, applies cadence rules per channel/platform, builds 8-week publication calendar.

Output:

- `research/social/calendar-{date}.md` — human-readable
- `state.phases.plan.publication_calendar[]` — machine-readable

### Mode B — Repurposing loops

For each pillar, define the 1→N atomic spawn (Gary Vee Reverse Pyramid).

```bash
social-plan repurpose --pillar p-001-agentic-marketing
```

Output: `research/social/repurposing-map-{date}.md` + `state.phases.plan.repurposing_loops[]`

Default 1-pillar fan-out (channel-aware):

```
1 long-form pillar (30-60min keynote, vlog, podcast)
  ├─ Elioth:    1 X thread + 1 IG carousel + 1 YouTube long-form excerpt
  ├─ Celavii:   1 blog post + 1 IG reel demo + 1 X infographic + 1 LinkedIn article
  └─ CutMaster: 3-5 TikTok shorts + 2 YouTube shorts + 1 IG reel
TOTAL: 12-15 atomic outputs per pillar
```

### Mode C — Hub vs Pillar tagging

For each planned post, classify as hub (linker / round-up) or pillar (deep authority).

```bash
social-plan classify --calendar state.phases.plan.publication_calendar
```

- **Hub posts**: list-based, link-heavy, navigational. ~20% of mix.
- **Pillar posts**: deep authority pieces. ~30% of mix.
- **Atomic**: short tactical posts spawned from pillars. ~50% of mix.

### Mode D — Calendar revision

Triggered by Gate B failures (cannibalization, cadence violation, missing pillar coverage).

```bash
social-plan revise --gate-b-report state.gates.B.last_run
```

## Cadence Rules (per-platform)

Sustainable cadence targets (Article 9 of Constitution — quality > volume):

| Platform       | Default  | Floor     | Ceiling                          |
| -------------- | -------- | --------- | -------------------------------- |
| TikTok         | 3–5/week | 2/week    | 11+/week (only if quality holds) |
| YouTube long   | 1–2/week | 1/2 weeks | 3/week                           |
| YouTube shorts | 3–5/week | 2/week    | daily                            |
| IG feed        | 3–5/week | 3/week    | 7/week                           |
| IG Reels       | 3–5/week | 2/week    | daily                            |
| X              | 3–5/day  | 2/day     | 10/day                           |

Per-channel override allowed in `state.intake.channels.{channel}.cadence_overrides`.

## Posting-Time Heuristics

Reads `state.cohort_insights.recommended_posting_times_et` if populated by `social-discover` cohort analysis. Default fallback (Sprout Social 2026 medians):

| Platform | Best windows (ET)        |
| -------- | ------------------------ |
| TikTok   | 14:00–17:00, 19:00–22:00 |
| IG       | 11:00, 14:00, 19:00      |
| X        | 09:00, 12:00, 17:00      |
| LinkedIn | 08:00, 12:00 (Tue–Thu)   |
| YouTube  | 14:00–16:00 (Tue–Thu)    |

## Cross-Channel Distinctiveness Rules

Enforced before calendar finalizes (drives Gate B):

1. **No same-pillar across channels in same week** (unless intentional repurposing loop)
2. **Channel voice maintained** — calendar carries `channel_overrides` from voice.json
3. **E-tag distribution** — Celavii channel must have ≥2 E-tags per post (Educate + Empower mandatory)
4. **Format-as-channel respected** — CutMaster never gets long-form essay; Elioth never gets TikTok dance; Celavii leans tutorial

## Output Schema

```json
"phases.plan.publication_calendar": [
  {
    "post_id": "celavii-ig-001",
    "channel": "celavii",
    "platform": "instagram",
    "format": "reel",
    "scheduled_for": "2026-05-04T14:00:00-05:00",
    "pillar_id": "p-001-agentic-marketing",
    "hub_or_pillar": "atomic",
    "e_tags": ["educate", "empower"],
    "hook_archetype_target": "authority",
    "source_pillar_long_form": "blog/agentic-shift-final.mdx",
    "repurpose_lineage": ["blog→ig-reel"],
    "cadence_slot": "tue-evening"
  }
],
"phases.plan.repurposing_loops": [
  {
    "pillar_id": "p-001-agentic-marketing",
    "long_form_source": "blog/agentic-shift-final.mdx",
    "spawned_posts": ["celavii-ig-001", "celavii-tt-005", "elioth-x-012", "cutmaster-tt-008"],
    "completion": 0.75
  }
]
```

## Integration

- Reads `state.phases.aggregate.{pillars, scored_topics}` (Phase 3 output)
- Reads `state.intake.channels` for cadence overrides + platform map
- Reads `.styles/celavii/voice.json` for channel voice + format affinity
- Writes `state.phases.plan.{publication_calendar, repurposing_loops}`
- Output gated by Gate B (cannibalization + cadence + repurposing-loops-wired)
- Consumed by `/social_curate` weekly cycle

## References

- `references/cadence-rules.md` — full per-platform table with empirical sources
- `references/repurpose-pyramid.md` — Gary Vee 1-to-30 with channel routing
- `references/posting-times.md` — Sprout 2026 medians + cohort overrides
- `references/distinctiveness-rules.md` — cross-channel separation enforcement

## Status

- [x] SKILL.md scaffold (this file) — Phase B12 contract
- [ ] `scripts/calendar.py` — 8-week calendar generator (Phase B12.1)
- [ ] `scripts/repurpose.py` — Reverse Pyramid expander (Phase B12.1)
- [ ] Hub/Pillar/Atomic classifier (Phase B12.1)
- [ ] Smoke test on existing v2 state content_queue (Phase B12.2)
