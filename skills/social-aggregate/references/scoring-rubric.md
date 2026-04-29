# Scoring Rubric (C1)

## Composite formula

```
score = (0.35 × relevance)
      + (0.30 × differentiation)
      + (0.20 × cross_pollination)
      + (0.15 × (6 − effort) × 2)
```

`relevance`, `differentiation`, `cross_pollination` ∈ [0, 10]. `effort` ∈ [1, 5]. The effort term inverts (lower effort → higher contribution) and rescales to keep all four contributions in [0, 10] before weighting.

A topic with relevance=10, differentiation=10, cross_pollination=10, effort=1 scores **9.5** (cap). Floor for `scored_topics[]` inclusion: **5.0**. Anything below is dropped before the LLM sees it.

## Component definitions

### Relevance (0–10)

- +3 per `intake.differentiators[]` term hit
- +2 per `intake.content_silos[]` term hit
- Floor of 4 if any post in raw set already mentions the topic verbatim (proves audience-on-platform fit)
- Hard cap: 10

### Differentiation (0–10)

- 10 if topic is **not** in competitor topic set
- −2 per competitor whose topic-set contains it
- Floor: 2

### Cross-pollination (0–10)

- +2 per distinct platform where supporting posts exist (max 4 platforms = +8)
- - min(distinct_handles, 5) for breadth across own channels

This rewards Gary Vee Reverse Pyramid fan-out: a topic that already lives on 3 platforms is cheaper to spawn 12 atomic outputs from.

### Effort (1–5, inverted)

- 1 — static text/single image
- 2 — carousel
- 3 — short-form video (Reel/TikTok/Short)
- 4 — long-form video, no edit-heavy cuts
- 5 — long-form video, edit-heavy / multi-cam / interactive

## Worked example

Topic: `"agentic creator outreach"`

| Field             | Value | Reasoning                                                  |
| ----------------- | ----- | ---------------------------------------------------------- |
| relevance         | 9     | +3 (matches "Agentic Marketing" diff) +6 (silo + verbatim) |
| differentiation   | 8     | one competitor (Modash) tangentially mentions outreach     |
| cross_pollination | 7     | shows up on TikTok + IG already (+4) + 3 own handles (+3)  |
| effort            | 3     | best as Reel/TikTok with split-screen demo                 |

```
score = 0.35×9 + 0.30×8 + 0.20×7 + 0.15×(6−3)×2
      = 3.15  + 2.40  + 1.40  + 0.90
      = 7.85
```

Above the 5.0 floor → surfaced to LLM in markdown report.
