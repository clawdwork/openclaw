# F3 Smoke Test Fixture — Agentic Shift Fan-Out Spec

> Defines the expected output of `social-repurpose blog --source agentic-shift-final.mdx --target-channels elioth,celavii,cutmaster`. Hardens the F2.1 implementation: when `scripts/repurpose_blog.py` ships, its output must satisfy this spec.

## Source

**File**: [`workspace/projects/celavii/content/blog/published/agentic-shift-final.mdx`](file:///Users/operator/dev/workspace/projects/celavii/content/blog/published/agentic-shift-final.mdx)

| Field      | Value                                                                  |
| ---------- | ---------------------------------------------------------------------- |
| Title      | The Agentic Shift: Why the Era of the Influencer Dashboard is Over     |
| Slug       | agentic-shift-authority-anchor                                         |
| Author     | elioth-fraijo                                                          |
| Silo       | ai-workflows                                                           |
| Word count | ~2200                                                                  |
| Date       | 2026-03-29                                                             |
| Pillar ID  | `p-001-agentic-marketing` (assigned by Phase 4 PLAN at fixture import) |

## H2 sections (8 total)

1. What is the Agentic Shift in Marketing?
2. Why Must We Escape the "Dashboard Prison"?
3. How is Community Density Replacing Traditional Reach?
4. What is Creator Intelligence (And Why is it Essential)?
5. What is the Actual ROI of Agentic AI in 2026?
6. How Do You Transition to an Agentic Marketing Workflow?
7. What is the Future of Human-in-the-Loop Marketing?
8. FAQ: The Future of Agentic AI and Creator Intelligence

## Stat-bearing claims (anchor for hooks)

| Claim                                           | Source                  | Use                                |
| ----------------------------------------------- | ----------------------- | ---------------------------------- |
| 171% average ROI from agentic AI                | Landbase/Arcade, 2026   | Authority hook (Celavii)           |
| $18 return per $1 spent                         | Landbase/Arcade, 2026   | Authority hook (Celavii)           |
| Creator economy = $500B by 2030                 | Goldman Sachs, 2024     | Curiosity gap hook (Elioth)        |
| 40% of enterprise apps include AI agents (2026) | Gartner, 2025           | Pattern interrupt hook (CutMaster) |
| 44.6% CAGR through 2032                         | MarketsandMarkets, 2026 | Authority hook (Celavii)           |

## Expected fan-out (12 atomic outputs, ≥3 platforms, ≥3 formats)

| #   | post_id (planned)               | Channel   | Platform  | Format   | Hook archetype    | Anchor stat / angle                        | E-tags             |
| --- | ------------------------------- | --------- | --------- | -------- | ----------------- | ------------------------------------------ | ------------------ |
| 1   | celavii-ig-carousel-agshift-001 | celavii   | instagram | carousel | authority         | 171% ROI; 8 slides = 8 H2s + cover + CTA   | educate, empower   |
| 2   | celavii-ig-reel-agshift-002     | celavii   | instagram | reel     | authority         | $18-per-$1 hook (data viz cold open)       | educate, empower   |
| 3   | celavii-tt-video-agshift-003    | celavii   | tiktok    | video    | curiosity_gap     | "Dashboard Prison" framing                 | educate            |
| 4   | celavii-x-thread-agshift-004    | celavii   | x         | thread   | authority         | 8-tweet thread, one tweet per H2; pin 171% | educate            |
| 5   | celavii-yt-short-agshift-005    | celavii   | youtube   | short    | authority         | Creator Intelligence Matrix demo           | educate            |
| 6   | elioth-ig-reel-agshift-006      | elioth    | instagram | reel     | story             | Founder POV: "Why I left dashboards"       | empower, engage    |
| 7   | elioth-tt-video-agshift-007     | elioth    | tiktok    | video    | story             | Story version of the toggle tax pain       | engage, empower    |
| 8   | elioth-x-thread-agshift-008     | elioth    | x         | thread   | story             | First-person rant version                  | engage             |
| 9   | cutmaster-tt-video-agshift-009  | cutmaster | tiktok    | video    | pattern_interrupt | "Wait — your dashboard is a prison"        | educate, entertain |
| 10  | cutmaster-tt-video-agshift-010  | cutmaster | tiktok    | video    | contrarian        | "Stop using 5 dashboards" demo             | educate, entertain |
| 11  | cutmaster-yt-short-agshift-011  | cutmaster | youtube   | short    | pattern_interrupt | Speed-run demo of agentic workflow         | educate            |
| 12  | celavii-ig-carousel-agshift-012 | celavii   | instagram | carousel | curiosity_gap     | "What is Community Density?" 6-slide       | educate, engage    |

### Coverage assertions

| Axis                   | Required        | Achieved                                                             |
| ---------------------- | --------------- | -------------------------------------------------------------------- |
| Atomic outputs (D21)   | ≥ 8             | 12 ✓                                                                 |
| Distinct platforms     | ≥ 3             | 4 (IG, TT, X, YT) ✓                                                  |
| Distinct formats       | ≥ 3             | 5 (carousel, reel, video, thread, short) ✓                           |
| Distinct channels      | (none required) | 3 (celavii, elioth, cutmaster)                                       |
| Hook archetype variety | ≥ 3 archetypes  | 5 (Authority, Curiosity Gap, Story, Contrarian, Pattern Interrupt) ✓ |
| 4E coverage            | each E hit ≥ 1× | educate ×9, empower ×3, engage ×3, entertain ×2 ✓                    |

### Cannibalization check

Pairwise cosine across all 12 hook+brief stubs must yield zero clusters at ≥ 0.85. The Celavii items 1 + 2 (both authority + 171% ROI angle) come closest — fixture target keeps them at cosine ≤ 0.78 by separating angles (carousel = full overview; reel = single-stat punch).

## Lineage tracking (per-spawn)

Every post entry gets:

```json
{
  "post_id": "celavii-ig-carousel-agshift-001",
  "repurpose_lineage": [
    "blog/agentic-shift-final.mdx",
    "p-001-agentic-marketing",
    "celavii-ig-carousel-agshift-001"
  ],
  "source_pillar_long_form": "blog/agentic-shift-final.mdx",
  "spawn_format": "carousel",
  "channel_route": "celavii"
}
```

## Sequencing target

Per [`gary-vee-fan-out.md` § Sequencing](../../social-orchestrator/references/gary-vee-fan-out.md): spread the 12 spawns across 4 weeks.

| Week of pillar     | Spawns                                                       | Rationale                         |
| ------------------ | ------------------------------------------------------------ | --------------------------------- |
| Week 1 (cold open) | #1, #3, #6 (cross-channel hero stat + tension + founder POV) | mass-recognition launch           |
| Week 2 (deep)      | #2, #4, #9                                                   | data-viz + thread + interrupt     |
| Week 3 (demo)      | #5, #10, #11                                                 | matrix + contrarian + speed-run   |
| Week 4 (close)     | #7, #8, #12                                                  | community density framing + close |

Three pillar-related spawns per week aligns with TikTok 2–5/wk + IG 3–5/wk + X 3–5/day cadence targets without saturating any single platform.

## Smoke-test assertions (when scripts ship)

`scripts/repurpose_blog.py --source agentic-shift-final.mdx --target-channels celavii,elioth,cutmaster` must produce output where:

1. Spawn count ≥ 8 (D21 floor)
2. Platforms ≥ 3, formats ≥ 3
3. Hook archetypes cover ≥ 3 of the 5 categories
4. Every E surfaces ≥ once
5. Every spawn has populated `repurpose_lineage`
6. Pairwise cosine on `(hook + first 200 chars of body)` < 0.85 for all pairs (no hard-fail cannibalization)
7. Every spawn cites at least one stat from the source (Tier 1/2/3 traceable)
8. Every spawn passes `social-sxo` Mode A `format-fit` for its target platform

Failures on any axis → fixture is the contract; the script is wrong (not the fixture). Update the script to match.
