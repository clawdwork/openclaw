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

### Mode F — Competitor discovery (intake-driven)

Used when `intake.competitors_per_channel[ch].status ∈ {research_needed, research_needed_partial}`. Searches for candidate competitor handles based on the user's differentiators + identity + goal, scores them, returns top 20.

```bash
social-discover competitor-discover --channel cutmaster --platform youtube
# Reads state.intake.differentiators, identities, goal, channel_types
# Tier 0 search across hashtag/topic seeds derived from differentiators
# Returns: raw/{channel}-competitor-candidates-{platform}-{ts}.json
```

#### Inputs (from state.intake)

- `differentiators[]` → search seeds (e.g., "AI video editing", "open-source video tools")
- `identities[ch].identity_line` → semantic anchor for relevance scoring
- `goal` (verb + noun) → de-prioritises candidates whose goal mismatch is high
- `channel_types[ch]` → utility/founder/product → tunes scoring (utility prefers utility peers)
- `competitors_per_channel[ch].hypotheses[]` (optional) → priors merged into candidate pool but not auto-confirmed

#### Scoring (4-factor)

| Factor              | Weight | Source                                                    |
| ------------------- | ------ | --------------------------------------------------------- |
| Topic overlap       | 0.40   | Embedding cosine: candidate description ↔ differentiators |
| Audience size proxy | 0.20   | log10(subs or followers); platform-normalised             |
| Posting recency     | 0.20   | 1.0 if last post ≤30 days; linear decay to 0 at 180 days  |
| Channel-type match  | 0.20   | utility↔utility = 1.0; cross-type ≤ 0.5                   |

#### Off-platform competitors

Mode F also surfaces strategically-relevant competitors that don't live on the target platform — typically GitHub projects, newsletters, podcasts, or Discord communities operating in the same problem space. Two cases:

- A GitHub project that's a direct product competitor but has no YouTube channel (e.g., davinci-resolve-mcp for cutmaster.ai)
- A podcast or newsletter that owns the audience attention the target channel wants to capture

These are returned in a separate `off_platform_competitors[]` array in the output, NOT in the main `candidates[]` list (which is for on-platform peers only). The user confirmation step (Phase 0.5a Step 4) does NOT require off-platform competitors to be confirmed individually — they're carried into state automatically with `monitor: true` so they get re-checked at every refresh cycle.

Off-platform competitors do NOT count toward the 3-handle minimum that Gate A's Article 6 verification requires — those handles must be on-platform, scrapeable, and citeable in the critic's verification step.

#### Output

```json
{
  "channel": "cutmaster",
  "platform": "youtube",
  "ran_at": "<iso>",
  "search_seeds": ["AI video editing", "AI shorts editor", ...],
  "candidates": [
    {
      "handle": "@CapCutOfficial",
      "channel_id": "UCxxx",
      "subscribers": 1200000,
      "last_post_days_ago": 2,
      "description_excerpt": "...",
      "channel_type_inferred": "utility",
      "scores": { "topic": 0.78, "audience": 0.91, "recency": 1.0, "type_match": 1.0, "total": 0.85 },
      "rank": 1
    }
  ],
  "top_5_for_user_review": ["@h1", "@h2", "@h3", "@h4", "@h5"],
  "off_platform_competitors": [
    {
      "name": "davinci-resolve-mcp",
      "platform": "github",
      "url": "https://github.com/samuelgursky/davinci-resolve-mcp",
      "target_platform_channel": null,
      "threat_level": "high",
      "monitor": true,
      "rationale": "Direct product competitor (Resolve MCP); no YouTube channel today; created 3+ months ago"
    }
  ]
}
```

#### Anti-patterns

- ❌ Calling Mode F without intake.differentiators populated — produces generic results
- ❌ Tier 1+ calls (followers/affinities) at discovery stage — defer to Phase 1 after user confirms shortlist
- ❌ Auto-confirming top 3 — Mode F surfaces candidates; user confirmation lives in the orchestrator (Phase 0.5a step 5)

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
- [ ] Mode F (competitor-discover) implementation — Phase B11.3 (added 2026-05-04 from cutmasterai dry-run)
