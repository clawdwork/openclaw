---
name: social-competitor-scrape
description: >
  Scrape competitor profiles + recent posts across IG / TikTok / X
  (YouTube on H-YT activation). Calls Celavii MCP tools (search_profiles,
  get_profiles_bulk, get_profile_posts, search_content, scrape_followers_bulk)
  to pull competitor baselines, top-performing posts, posting cadence, and
  format inventory. Feeds Phase 1 (Discover) and Phase 2 (Analyze).
user-invocable: true
metadata:
  {
    "openclaw":
      {
        "emoji": "🥷",
        "requires": { "env": ["CELAVII_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# social-competitor-scrape

> **Phase B11 (sibling of `social-discover`).** Same wrapping pattern; different intent. Where `social-discover` resolves the brand's own handles + seeds, this skill targets **competitors** for pattern extraction.

## Auth

```
Authorization: Bearer $CELAVII_API_KEY
```

## Modes

### Mode A — Competitor baseline

For each competitor handle, pull canonical profile + last N posts.

**MCP tools called:**

1. `mcp__claude_ai_Celavii__get_profiles_bulk` with `{ profile_ids: ["ig:123", "tt:456", ...] }` if IDs are known, OR sequential `mcp__claude_ai_Celavii__search_profiles` per handle if starting from usernames. **0 credits (bulk) / 1 per handle (search).**
2. For each resolved competitor: `mcp__claude_ai_Celavii__get_profile_posts` with `{ profile_id, limit: 50 }`. **0 credits (cached posts).**
3. Optional: `mcp__claude_ai_Celavii__get_profile_affinities` per competitor for downstream audience-overlap analysis. **0 credits.**
4. If a handle returns empty from `search_profiles`, queue `mcp__claude_ai_Celavii__enhance_profiles` with `{ profiles: [<unresolved>], dry_run: true }` to ingest into Max Kick org DB, then re-resolve.

**Output**:

- `raw/celavii-{handle}-{platform}-profile-{ts}.json` — merged profile + affinities response
- `raw/celavii-{handle}-{platform}-posts-{ts}.json` — last 50 posts

### Mode B — Top-performer extraction

Pull a competitor's top-N posts by engagement over a window.

**MCP tool called:**

`mcp__claude_ai_Celavii__search_content` with `{ author: "<handle>", platform, sort: "engagement", since: "2026-03-01", limit: 25 }`. **1 credit per call.**

For semantic top-post discovery (e.g. "top posts about open-source video editing"), use `mcp__claude_ai_Celavii__semantic_search_content` with `{ query, author, limit }` — same cost.

**Output**: `raw/celavii-{handle}-{platform}-top-posts-{ts}.json`

### Mode C — Followers (cohort analysis seed)

Tier-1 op. Always dry-run first. Useful for audience-overlap analysis (Three Circles).

**MCP tools called:**

1. `mcp__claude_ai_Celavii__scrape_followers_bulk` with `{ usernames: [...], max_results_per_profile: 5000, dry_run: true }` → cost estimate. **For TikTok use `platform: "tiktok"` in same call.**
2. Confirm with user, then re-call with `dry_run: false` → `{ job_id }`.
3. Poll `mcp__claude_ai_Celavii__get_scrape_status` with `{ job_id }` until complete.
4. (Optional follow-up) `mcp__claude_ai_Celavii__get_network_overlap` to compare follower sets across competitors. **1 credit.**

**Credits**: 2 + Apify cost per profile.

### Mode D — Cross-platform link extraction

TikTok adapter exposes IG / YouTube / X username extractions with ≥0.95 confidence (per [eval-findings.md § B](file:///Users/operator/dev/openclaw/.system/features/social-strategy/v2/eval-findings.md)). Use this to enrich a single-platform competitor list into a cross-platform map.

**MCP tool called:**

`mcp__claude_ai_Celavii__get_profile_social_links` with `{ profile_id }` for each competitor. **0 credits.** Returns the cross-platform handle map directly:

```json
{
  "tiktok": "modaberlin",
  "instagram": "moda_berlin_ig",
  "x": "modaberlin_official",
  "youtube": null
}
```

For TikTok-seeded discovery (where the TikTok adapter already extracts cross-platform mentions from bio + recent posts), the bio field of `get_profile` contains the same data. Use `social_links` for the structured result.

## Output Schema (drives Phase 2 Analyze)

For each competitor, `state.phases.analyze.patterns.{competitor}` gets:

```json
{
  "platform": "tiktok",
  "handle": "modaberlin",
  "baseline": { "followers": 45000, "engagement_rate": 4.2, "posts_per_week": 5.5 },
  "top_posts": [{ "post_id": "...", "hook": "...", "format": "tutorial", "er": 12.3 }],
  "format_mix": { "tutorial": 0.40, "demo": 0.30, "trend": 0.30 },
  "common_hooks": [
    { "text": "Stop using {tool}", "archetype": "contrarian", "occurrences": 7 }
  ],
  "raw_files": ["raw/celavii-modaberlin-tiktok-profile-{ts}.json", ...]
}
```

## Hook Archetype Tagging

After post extraction, hooks get tagged with the 5 canonical archetypes (Curiosity Gap / Contrarian / Story / Authority / Pattern Interrupt — per [`social-orchestrator/SKILL.md`](file:///Users/operator/dev/openclaw/skills/social-orchestrator/SKILL.md)). This feeds the Phase 3 deterministic aggregator's hook clustering.

Tagging happens in the deterministic aggregator (Phase 3), not here — this skill just stores raw hook strings.

## Cost Notes (per [eval-findings.md § C](file:///Users/operator/dev/openclaw/.system/features/social-strategy/v2/eval-findings.md))

| Operation                      | Credits | Apify cost                                 |
| ------------------------------ | ------- | ------------------------------------------ |
| Baseline (profile + N posts)   | 2       | low                                        |
| Top-posts (content search)     | 1       | nil (already in DB)                        |
| Followers scrape               | 2       | medium-high                                |
| Cross-platform link extraction | 1       | nil (extracted from TikTok adapter output) |

## YouTube Stub

Same pattern as `social-discover` — `--platform youtube` returns "not yet enabled" until Phase H-YT activation.

## Integration

- Reads competitor handles from `state.intake.competitors_per_channel[ch].handles[]`
- Calls Celavii MCP tools directly: `get_profiles_bulk`, `search_profiles`, `get_profile_posts`, `get_profile_affinities`, `enhance_profiles`, `search_content`, `semantic_search_content`, `scrape_followers_bulk`, `get_scrape_status`, `get_network_overlap`, `get_profile_social_links`
- Outputs feed `social-aggregate` (Phase 3 cosine cannibalization across competitors + own posts) and `social-sxo` (platform-fit analysis)

## Implementation note (post-grounding 2026-05-06)

The originally-planned Phase B11.1 wrapper script (`scripts/competitor.py`) is **obsolete**. The Celavii MCP tools provide schema-validated structured I/O, so an LLM agent invokes them directly and emits Mode A–D outputs as structured JSON matching this skill's schemas.

For OpenClaw runtime agents calling REST directly (no MCP context), the equivalent endpoints are documented in `~/dev/workspace/skills/celavii-data-ops/SKILL.md` and `~/dev/workspace/skills/celavii-profiles/SKILL.md`. Auth via `CELAVII_API_KEY` from `~/.openclaw/.env`.

## References

- `references/competitor-rotation.md` — guidance on how often to re-scrape (target: weekly for top 3 competitors per channel, monthly for the rest)
- `references/cohort-overlap.md` — Three Circles audience-overlap protocol (for Mode C)
- `~/dev/workspace/skills/celavii-data-ops/SKILL.md` — full scrape endpoint reference
- `~/dev/workspace/skills/celavii-profiles/SKILL.md` — full profile/posts/affinities/social-links reference

## Status

- [x] SKILL.md grounded against upstream MCP tools (2026-05-06)
- [ ] Mode A smoke test against 3 competitors
- [ ] Mode D cross-platform extraction test (`get_profile_social_links`)
- [ ] YouTube dispatch (H-YT activation)
