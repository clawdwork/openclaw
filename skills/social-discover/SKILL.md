---
name: social-discover
description: >
  Discover social-media profiles, hashtags, and locations across IG / TikTok / X
  (YouTube on H-YT activation). Calls Celavii MCP tools directly
  (search_profiles, scrape_hashtags, scrape_locations, scrape_urls, etc.)
  — never re-implements scraping. Use for handle resolution, baseline metric
  pulls, hashtag/location seed expansion, and follower-cohort intake. Always
  dry-run first.
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

Resolve a handle on a platform → canonical profile (`ig:{id}` / `tt:{id}` / `x:{id}`) with full baseline metrics (followers, ER, posts/week, format mix).

**MCP tools called (in order):**

1. `mcp__claude_ai_Celavii__search_profiles` with `{ query: "<handle>", platform: "<platform>", limit: 1 }` → resolves handle to canonical `profile_id`. **1 credit.**
2. `mcp__claude_ai_Celavii__get_profile` with `{ profile_id }` → full bio, metrics, demographics, creator_tier. **0 credits** (cached for known profiles).
3. `mcp__claude_ai_Celavii__get_profile_affinities` with `{ profile_id }` → topics, brands, audience overlap. **0 credits.**
4. `mcp__claude_ai_Celavii__get_profile_posts` with `{ profile_id, limit: 30 }` → recent posts for cadence + format-mix calc. **0 credits.**

If `search_profiles` returns empty (`data: []`), the handle isn't yet in this org's database. Fall back to `mcp__claude_ai_Celavii__enhance_profiles` with `{ profiles: ["<handle>"], platform, dry_run: true }` to ingest, then re-run from step 1.

**Output**: `raw/celavii-{handle}-{platform}-profile-{ts}.json` containing the merged response from steps 2–4. State write: `phases.discover.baselines.{channel}.{platform}` populated with `{followers, engagement_rate, posts_per_week, format_mix, creator_tier, affinities}`.

### Mode B — Hashtag scrape (seed expansion)

**MCP tools called:**

1. `mcp__claude_ai_Celavii__scrape_hashtags` with `{ hashtags: [...], max_items, dry_run: true }` → cost estimate. Show user, await confirmation.
2. Same call with `dry_run: false` → returns `{ job_id }`.
3. Poll `mcp__claude_ai_Celavii__get_scrape_status` with `{ job_id }` every 30s (exponential backoff after 5 min) until `status: "completed"`.
4. Final response contains the scraped posts → write to `raw/celavii-hashtag-{tag}-{platform}-{ts}.json`.

**Credits**: 0 dry-run, then 1 + Apify cost on real run.

### Mode C — Location scrape

**MCP tools called:**

1. `mcp__claude_ai_Celavii__scrape_locations` with `{ location_ids: [...], max_items, dry_run: true }` → estimate.
2. Same with `dry_run: false` → `{ job_id }`.
3. Poll `mcp__claude_ai_Celavii__get_scrape_status` until complete → write to `raw/celavii-location-{id}-{platform}-{ts}.json`.

**Credits**: 1 + Apify cost.

### Mode D — URL scrape (one-shot, multi-URL)

**MCP tool called:**

`mcp__claude_ai_Celavii__scrape_urls` with `{ urls: ["https://www.tiktok.com/@example/video/123", "https://www.instagram.com/p/abc"], dry_run: true }` → estimate, then real call. Synchronous response (no polling) for small batches.

**Credits**: 1 per URL.

### Mode E — Bulk handle resolution (intake helper)

**MCP tools called:**

For each handle in the input list, call `mcp__claude_ai_Celavii__search_profiles` with `{ query: "<handle>", platform, limit: 1 }`. Or — preferred for 5+ handles — single `mcp__claude_ai_Celavii__get_profiles_bulk` call with `{ profile_ids: ["ig:123", "tt:456", ...] }` once IDs are known.

For unresolved handles, queue `mcp__claude_ai_Celavii__enhance_profiles` (bulk) to ingest into the org DB, then re-resolve.

**Output**: `raw/celavii-bulk-resolve-{ts}.json` mapping `{ handle → profile_id | null }` plus state hydration of `intake.competitors_per_channel[ch].handles[]` with canonical `profile_id`s.

**Credits**: 1 per resolved handle (search) or 0 if `get_profiles_bulk` against known IDs.

### Mode F — Competitor discovery (intake-driven)

Used when `intake.competitors_per_channel[ch].status ∈ {research_needed, research_needed_partial}`. Searches for candidate competitor handles based on the user's differentiators + identity + goal, scores them, returns top 20.

**MCP tools called (multi-step search):**

1. **Seed expansion** — derive 3-5 search seeds from `intake.differentiators[]` (e.g. "AI video editing", "open-source video tools"). For each seed:
   - `mcp__claude_ai_Celavii__search_content` with `{ query: "<seed>", platform, sort: "engagement", limit: 25 }` → surfaces posts mentioning the topic; extract author handles.
   - `mcp__claude_ai_Celavii__get_hashtag_creators` with `{ hashtag: "<seed-as-tag>", platform, limit: 25 }` → top creators using the hashtag.
2. **Candidate hydration** — dedupe handle list (max 50). Single `mcp__claude_ai_Celavii__get_profiles_bulk` call with `{ profile_ids: [...] }` to pull bio + follower count + last_post timestamp for all candidates in one round-trip.
3. **Affinity overlap** (optional, for top 10 by audience_proxy) — `mcp__claude_ai_Celavii__search_profiles_by_affinities` with `{ topics: [<differentiator-derived>], min_followers, limit: 10 }` to widen the net to creators with matching topic affinities even if they don't post under the seed hashtags.
4. **LLM scoring** — for each candidate, compute the 4-factor score (table below) inline as structured output. Topic-overlap factor uses Claude's reasoning on bio/description text (no external embedding API needed for this version).
5. **Off-platform sweep** — for `target_platform_channel: null` candidates (GitHub, podcasts, newsletters), use `web_search` outside the Celavii API.

For YouTube channels (when H-YT activates), substitute `mcp__claude_ai_Celavii__search_content` with the YouTube adapter equivalent. Until then, Mode F on `--platform youtube` returns a clean "YouTube adapter pending" error and falls back to web_search-only mode.

**Credits**: ~5–10 for full Mode F run (seed expansion + bulk hydration + optional affinity widening).

**Output**: `raw/{channel}-competitor-candidates-{platform}-{ts}.json` matching the schema below.

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

```
mcp__claude_ai_Celavii__scrape_hashtags({
  hashtags: ["agentic"],
  max_items: 100,
  dry_run: true
})
# → returns { estimated_credits, estimated_apify_cost, ... }
# Surface the estimate to the user, await confirmation, then re-call with dry_run: false
```

For agents running outside the Claude Code MCP context (e.g. OpenClaw runtime via REST), use the equivalent curl call against the same endpoint — `~/.openclaw/.env` provides `CELAVII_API_KEY`.

## Tiered Credentials (per [docs/integration-recommendations.md § 1](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/integration-recommendations.md))

| Tier                    | What works                                 | What needs upgrade                                    |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------- |
| 0 — public scrape       | `/api/v1/scrape/{hashtags,locations,urls}` | OK for trend seeds + competitor posts                 |
| 1 — followers/following | `/api/v1/scrape/{followers,following}`     | 2 credits + Apify cost — needs `scrape:trigger` scope |
| 2 — refinement (AI)     | `/api/v1/refine/profiles`                  | enhanced profiles only; gated on `refine:trigger`     |

## Job Polling

All scrape ops are async (BullMQ + Redis backed, per [eval-findings.md § D](file:///Users/operator/dev/openclaw/.system/features/social-strategy/v2/eval-findings.md)). Poll `mcp__claude_ai_Celavii__get_scrape_status` with `{ job_id }` at 30s intervals (exponential backoff after 5 min). Status checks are 0 credits.

For org-wide job visibility (e.g. before re-scraping, check if a job already ran), use the celavii-jobs skill's `mcp__claude_ai_Celavii__list_jobs` with `{ type, status }` filters.

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

- Calls Celavii MCP tools directly: `search_profiles`, `get_profile`, `get_profile_affinities`, `get_profile_posts`, `get_profiles_bulk`, `scrape_hashtags`, `scrape_locations`, `scrape_urls`, `search_content`, `get_hashtag_creators`, `search_profiles_by_affinities`, `enhance_profiles`, `get_scrape_status`, `list_jobs`
- Updates state.phases.acquire / state.phases.discover
- Outputs feed `social-aggregate` (Phase 3) and `social-trend-detect` (consumes hashtag scrape outputs)

## Implementation note (post-grounding 2026-05-06)

The original Phase B11.1 plan called for a Python wrapper script (`scripts/discover.py`) to wrap the curl/REST calls. After grounding the celavii skills against upstream and validating the live API, that wrapper is **obsolete**:

- The 74 Celavii MCP tools already provide schema-validated structured input/output, so an LLM agent can call them directly — no Python adapter needed.
- The orchestrator emits Mode A–F outputs as structured JSON matching the schemas in this file; downstream phases (aggregate, plan) consume them directly.
- Determinism for compute-heavy steps (cosine similarity for cannibalization, mtime checks) belongs in dedicated utilities, not in this skill.

For agents running outside the MCP context (e.g. OpenClaw runtime calling REST directly), the same endpoints are reachable via curl — see `celavii-data-ops/SKILL.md` for the auth pattern. No skill-specific wrapper required.

## References

- `references/handle-normalization.md` — `ig:`/`tt:`/`x:`/`yt:` ID prefixes
- `~/dev/workspace/skills/celavii-discover/SKILL.md` — full search/discover endpoint docs
- `~/dev/workspace/skills/celavii-data-ops/SKILL.md` — full scrape endpoint docs
- `~/dev/workspace/skills/celavii-jobs/SKILL.md` — list_jobs + get_job_coverage

## Status

- [x] SKILL.md grounded against upstream MCP tools (2026-05-06)
- [x] Tier-0 smoke test passed (account_info, usage, jobs, search_profiles, get_profile — see CHANGELOG 2026-05-06)
- [ ] Tier-1 followers test against a sample creator
- [ ] YouTube dispatch (`--platform youtube` clean error or H-YT live)
- [ ] Mode F end-to-end run on a real channel (cutmaster YouTube once H-YT lives)
