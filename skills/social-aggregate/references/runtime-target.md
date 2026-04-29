# Runtime Target (C6)

**Target: <5 seconds on 1000 posts × 8 competitors.**

## Precedent

[`workspace/skills/seo/scripts/seo-aggregate.py`](file:///Users/operator/dev/workspace/skills/seo/scripts/seo-aggregate.py) — 1009 LOC, 30+ raw JSON files, observed **~2.8s** on the Celavii v3 SEO project. Same architectural pattern: stdlib only, no numpy/pandas, hashed-token cosine.

## Complexity

| Step                           | Worst-case complexity                      | Mitigation                              |
| ------------------------------ | ------------------------------------------ | --------------------------------------- |
| Load + flatten raw JSON        | O(N) where N = total post count            | Single-pass json.load per file          |
| Topic extraction (n-grams 1–3) | O(N · L) where L = avg tokens per post     | Counter, no nested loops                |
| Topic scoring                  | O(T · N) where T = candidate topics (≤200) | Bounded T at 200 before scoring         |
| Cannibalization clustering     | **O(N²)** pairwise within window           | Window-bounded; skip-list short-circuit |
| Trend math (per n-gram, 30d)   | O(M · 30) where M = unique n-grams         | Floor at freq ≥5 cuts M by 80%          |
| Channel mix                    | O(N)                                       | Single-pass Counter                     |

The O(N²) cannibalization is the runtime hot path. At N=1000 own posts, that's 500K pairwise cosines × ~50 tokens each = ~25M token compares. Empirically: ~2s on M2 Pro.

## Benchmarks (to be filled after Phase B11.1 ships real raw data)

| Posts | Competitors | Wall time | Notes                        |
| ----- | ----------- | --------- | ---------------------------- |
| 12    | 0           | 0.04s     | Bundled fixture (smoke test) |
| _TBD_ | _TBD_       | _TBD_     | Real Celavii v3 first run    |

## When to add numpy

If wall time exceeds 8s on real data, the cannibalization step is the place to vectorize. A `scipy.sparse` TF matrix + `sklearn.metrics.pairwise.cosine_similarity` cuts that step ~20×. Defer until measurement justifies the dependency.
