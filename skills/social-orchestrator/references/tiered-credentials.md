# Tiered Credentials (D17)

Mirrors the blog-google Tier-0/1/2 pattern. Per [docs/integration-recommendations.md § 1](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/integration-recommendations.md). Auth via single `CELAVII_API_KEY` (Bearer); tier is determined by which endpoint is called and which scopes the key has.

## Tiers

| Tier | Endpoints                                  | Scope required   | Cost                    | Phase usage               |
| ---- | ------------------------------------------ | ---------------- | ----------------------- | ------------------------- |
| 0    | `/api/v1/scrape/{hashtags,locations,urls}` | _public_         | 0 credits, low Apify    | Phase 0 always            |
| 1    | `/api/v1/scrape/{followers,following}`     | `scrape:trigger` | 2 credits + Apify (med) | Phase 1 cohort opt-in     |
| 2    | `/api/v1/refine/profiles`                  | `refine:trigger` | 1 credit per profile    | Phase 2 enrichment opt-in |

## Tier-0 — Public scrape

Always available. Used by:

- `social-discover hashtag` — seed expansion
- `social-discover location` — geo-tagged trend pulls
- `social-discover urls` — one-shot URL bundles
- `social-competitor-scrape baseline` — competitor profile + last-N posts

Default in Phase 0 ACQUIRE. No user prompt; runs on every `/social_strategy` invocation.

## Tier-1 — Followers / cohort

Triggers a Tier-1 op only when:

1. Phase 1 industry-aware delegation says cohort overlap is necessary (Three Circles Method seed)
2. User has explicitly approved `--enable-tier1` flag, OR
3. Cumulative Apify cost projection ≤ $5

Always **dry-run first** (per `celavii-data-ops` convention). Show estimate to user; require explicit confirmation before running.

```bash
# Dry-run pattern
social-discover followers --handle leomessi --platform instagram \
  --max 5000 --dry-run
# → returns cost estimate JSON
# → user approves
# → real run drops --dry-run
```

## Tier-2 — Profile refinement

Adds AI-enhanced fields (niche prediction, audience demographics inference, content scoring) per profile. Used selectively in Phase 2 ANALYZE for the **top 5 competitors per channel** — not the full competitor set.

```bash
social-discover refine --handles modaberlin,grin,upfluence --platform tiktok
```

## Cost projection

Surface in Phase 0 checkpoint:

```
Phase 0 ACQUIRE estimate:
  - Tier 0 (5 channels × 4 platforms × profile + 50 posts): ~$0.40 Apify, 0 credits
  - Tier 0 (3 hashtag seeds × 100 posts each): ~$0.15 Apify, 0 credits
  - SUBTOTAL: ~$0.55 Apify, 0 credits

Phase 1 DISCOVER estimate (Tier 0 only): ~$0.30 Apify
  → Tier 1 (followers): NOT ENABLED (use --enable-tier1 to activate)

Continue? [y/N]
```

If user says no at this checkpoint, the run halts cleanly (state persists; can resume).

## Why tiered

- Cost containment — Tier 1/2 ops are expensive; require explicit opt-in
- Auditability — `state.phases.acquire.tier_usage = {tier_0: 47, tier_1: 0, tier_2: 0}` makes spend traceable
- Scope hygiene — a Celavii API key without `scrape:trigger` scope cleanly fails Tier 1; doesn't degrade silently

## Integration with `social-discover`

The skill checks `intake.tier_consent = {tier_1: bool, tier_2: bool}` (defaults `false`). If a Tier-1 endpoint is called without consent → returns the error "Tier 1 not authorized for this run; pass --enable-tier1 or set intake.tier_consent.tier_1=true". Never silently downgrades or skips.
