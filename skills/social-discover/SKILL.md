---
name: social-discover
description: >
  Discover social-media profiles, hashtags, and locations across IG / TikTok / X
  (YouTube on H-YT activation). Wraps the Celavii public scrape API
  (/api/v1/scrape/*) — never re-implements scraping. Use for handle resolution,
  baseline metric pulls, hashtag/location seed expansion, and follower-cohort
  intake. Always dry-run first.
user-invocable: true
metadata:
  {
    "openclaw":
      {
        "emoji": "🔭",
        "requires": { "env": ["CELAVII_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# social-discover

> **Phase B11.** Wraps existing Celavii infrastructure — see [v2/eval-findings.md](file:///Users/operator/dev/openclaw/.system/features/social-strategy/v2/eval-findings.md) for the audit that mapped `social_listener/src/lib/platform-adapters/` and the public `/api/v1/scrape/*` family. **Never reimplement** the platform-adapter logic.

## Auth

```
Authorization: Bearer $CELAVII_API_KEY
Base URL:      https://www.celavii.com/api/v1
```

## Modes

### Mode A — Profile baseline

Resolve a handle on a platform → canonical profile (`ig:{id}` / `tt:{id}` / `x:{id}`) with full baseline metrics (followers, ER, posts/week, format mix). Backed by `celavii-discover` skill (`/profiles/search` + `/profiles/affinities`) — already in our skill set.

```bash
social-discover profile --platform tiktok --handle celaviihq
# → raw/celavii-celaviihq-tiktok-profile-{ts}.json
```

### Mode B — Hashtag scrape (seed expansion)

```bash
social-discover hashtag --platform tiktok --tags agentic,creatorintelligence --max 100
# POSTs /api/v1/scrape/hashtags  →  job_id  →  poll status  →  raw/...
```

### Mode C — Location scrape

```bash
social-discover location --platform instagram --location-ids 213385402 --max 50
# POSTs /api/v1/scrape/locations
```

### Mode D — URL scrape (one-shot, multi-URL)

```bash
social-discover urls --urls https://www.tiktok.com/@example/video/123,https://www.instagram.com/p/abc
# POSTs /api/v1/scrape/urls
```

### Mode E — Bulk handle resolution (intake helper)

```bash
social-discover resolve --platform x --handles celaviihq,grin,modaberlin
# Sequential /profiles/search calls + state hydration
```

## Always Dry-Run First

Mirrors [`celavii-data-ops`](file:///Users/operator/dev/workspace/skills/celavii-data-ops/SKILL.md) convention. Every mutating call sends `dry_run: true` first → cost estimate → user confirmation → real run.

```bash
# Dry run
curl -s -X POST https://www.celavii.com/api/v1/scrape/hashtags \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"hashtags":["agentic"],"max_items":100,"dry_run":true}'
```

## Tiered Credentials (per [docs/integration-recommendations.md § 1](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/integration-recommendations.md))

| Tier                    | What works                                 | What needs upgrade                                    |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------- |
| 0 — public scrape       | `/api/v1/scrape/{hashtags,locations,urls}` | OK for trend seeds + competitor posts                 |
| 1 — followers/following | `/api/v1/scrape/{followers,following}`     | 2 credits + Apify cost — needs `scrape:trigger` scope |
| 2 — refinement (AI)     | `/api/v1/refine/profiles`                  | enhanced profiles only; gated on `refine:trigger`     |

## Job Polling

All scrape ops are async (BullMQ + Redis backed, per [eval-findings.md § D](file:///Users/operator/dev/openclaw/.system/features/social-strategy/v2/eval-findings.md)). Poll `/scrape/{job_id}/status` at 30s intervals (exponential backoff after 5 min).

`celavii-jobs` MCP can be used directly when wired (zero credits for status checks).

## Outputs (state.phases.acquire.raw_files[] + state.phases.discover.baselines)

| Path                                                | Contents            |
| --------------------------------------------------- | ------------------- |
| `raw/celavii-{handle}-{platform}-profile-{ts}.json` | Canonical profile   |
| `raw/celavii-{handle}-{platform}-posts-{ts}.json`   | Last N posts        |
| `raw/celavii-hashtag-{tag}-{platform}-{ts}.json`    | Posts under hashtag |
| `raw/celavii-location-{id}-{platform}-{ts}.json`    | Geo-tagged posts    |

State writes:

- `state.phases.acquire.raw_files[]` — append paths
- `state.phases.discover.baselines.{channel}.{platform}` — populate followers/ER/cadence/format mix

## Platform Dispatch (YouTube-Ready Stub)

```js
const PLATFORMS = ["instagram", "tiktok", "x", "youtube"];
function resolveAdapter(p) {
  if (p === "youtube") {
    // H-YT placeholder until adapter ships
    throw new Error("YouTube adapter not yet enabled (Phase H-YT).");
  }
  // Wraps social_listener resolveAdapter() pattern
}
```

H2a–H2d items already wire `'youtube'` as a valid platform string everywhere. `social-discover` accepts `--platform youtube` from day one and returns a clean "not yet enabled" error.

## Integration

- Calls Celavii public `/api/v1/scrape/*` (hashtag, location, URL, followers, following)
- Calls `celavii-discover` (`/profiles/search`, `/profiles/affinities`) for handle resolution
- Calls `celavii-jobs` MCP for status polling (when wired)
- Updates state.phases.acquire / state.phases.discover
- Outputs feed `social-aggregate` (Phase 3) deterministic script

## CLI (Phase B11 implementation)

Implementation lives at `scripts/discover.py` (Phase B11.1). For now this scaffolds the contract; the script wraps existing skills.

## References

- `references/celavii-public-api-map.md` — every endpoint with curl examples (Phase B11.1)
- `references/platform-dispatch.md` — resolveAdapter pattern (Phase B11.1)
- `references/handle-normalization.md` — `ig:`/`tt:`/`x:`/`yt:` ID prefixes

## Status

- [x] SKILL.md scaffold (this file) — Phase B11 contract
- [ ] `scripts/discover.py` — wrapper CLI calling celavii-discover + celavii-data-ops + celavii-jobs (Phase B11.1)
- [ ] Tier-0 smoke test against celaviihq TikTok (Phase B11.2)
- [ ] Tier-1 followers test against a sample creator (Phase B11.2)
- [ ] YouTube dispatch stub returns clean error (Phase H-YT activation flips this)
