# Trend Math (C9)

Port of [readikus/ramekin](https://github.com/readikus/ramekin) algorithm. Native trend lists (TikTok For You hashtag list, X trending) are **lagging signals** — by the time something hits a public trend list, the algorithmic boost is half-spent. First-party scraped data, computed daily, is the leading signal.

## Algorithm

For every n-gram `term` in last 30 days of own + competitor posts where `n ∈ {1, 2}` and total occurrences ≥ 5:

```
days_30 = [count_on_day(d) for d in last_30_days]
days_7  = days_30[:7]
days_14 = days_30[:14]

μ_30  = mean(days_30)
σ_30  = stddev(days_30) or 1.0    # avoid divide-by-zero on flat series
v_7   = mean(days_7)
v_14  = mean(days_14)

velocity     = v_7 / max(μ_30, 0.1)
acceleration = v_7 − v_14
z_score      = (count_today − μ_30) / σ_30
```

## Status bands

| z_score | Status    | Interpretation                                         |
| ------- | --------- | ------------------------------------------------------ |
| ≥ 2.5   | exploding | Hard signal — calendar should reserve a slot this week |
| 1.5–2.5 | rising    | Soft signal — eligible for opportunistic insertion     |
| < 1.5   | baseline  | No trend signal; do not surface                        |

A term is also surfaced (status=`rising`) if velocity ≥ 1.6 even when z < 1.5 — catches the "rapidly growing from low base" case the z-score on its own under-weights.

## Why min frequency 5

n-grams with <5 total occurrences in 30 days are noise. The 5-floor matches ramekin's default and avoids surfacing one-off jokes.

## Why σ floor 1.0

A perfectly flat series has σ=0 → division by zero. We floor at 1.0 to keep z-scores finite. The cost is that flat-then-spike series get realistic z-scores instead of `inf`.

## Output cap

Top 50 by z-score, sorted descending. The markdown report further filters to **z ≥ 2.5** (exploding only) — anything weaker is in the JSON for `social-plan` to consume but isn't surfaced for Gate A scrutiny.

## Integration with platform-native trends

`social-trend-detect` (Phase B10) layers platform-native trend feeds **on top of** this z-score. When both signals agree (z≥2.5 AND on platform trending list) → confidence is high. When platform list says trending but z<1.5 → likely a paid push or geo-restricted bubble; downgrade.
