# Cannibalization Thresholds (C7)

## Method

1. Tokenize `(hook + first 200 chars of body)` per post.
2. Drop stopwords + tokens ≤2 chars.
3. Build TF (term-frequency) vector per post; L2-normalized cosine.
4. Compare every pair within the 30-day temporal window (configurable).
5. Group hits at threshold ≥ 0.70 into clusters.

## Bands

| Cosine    | Status    | Action                                                       |
| --------- | --------- | ------------------------------------------------------------ |
| ≥ 0.85    | hard_fail | Block at Gate B; force differentiate or reschedule           |
| 0.70–0.85 | warn      | Annotate brief with "near-duplicate of {post_id} (cosine X)" |
| < 0.70    | pass      | No flag                                                      |

## Why cosine not exact-match

Exact-match dedup misses paraphrase. Cosine on TF vectors catches the long tail: same hook archetype + same supporting evidence + cosmetic phrase shuffle = 0.78 cosine, identifiable as cannibalization. Tested against the SEO equivalent ([`workspace/skills/seo/scripts/seo-aggregate.py`](file:///Users/operator/dev/workspace/skills/seo/scripts/seo-aggregate.py) similar pattern in URL/heading dedup).

## Why 30-day window

Per [docs/frameworks.md § 10](../../../.system/features/social-strategy/docs/frameworks.md): cannibalization beyond 30 days is recovery territory, not duplication — the algorithm has fully cycled audience exposure. Within 30d, two near-duplicate posts split engagement signals and both lose ranking lift.

## Output shape

```json
{
  "cluster_id": "cn-007",
  "posts": ["ig:Cabc...", "ig:Cdef...", "tt:7234..."],
  "max_cosine": 0.91,
  "window_days": 30,
  "status": "hard_fail"
}
```

Single-post entries are never reported (no cluster of size 1).
