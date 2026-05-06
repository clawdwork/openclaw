---
name: social-trend-detect
description: >
  Detect trending hashtags, audio, and topics per platform. Computes velocity
  (1st derivative) + acceleration (2nd derivative) + baseline-normalized
  z-score (>2σ = "exploding") rather than raw volume. Treats platform-native
  trend lists as LAGGING signals; surfaces leading indicators via outlier
  detection over time-series data.
user-invocable: true
metadata:
  {
    "openclaw":
      {
        "emoji": "📈",
        "requires": { "env": ["CELAVII_API_KEY", "BRAVE_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# social-trend-detect

> **Phase B10.** Math + integrations from [`docs/repos.md § 3`](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/repos.md), [`docs/frameworks.md § 6`](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/frameworks.md), and [`docs/integration-recommendations.md § Phase 1`](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/integration-recommendations.md).

## Critical Rule

**Don't trust platform-native trend lists as leading indicators.** TikTok Creative Center, IG Explore, X "What's happening" all surface what's _already peaked_. For early detection, run outlier detection over hashtag/sound view-count time series.

## Modes

### Mode A — Hashtag velocity

**Data source**: `raw/celavii-hashtag-*-{platform}-*.json` files written by `social-discover` Mode B (which calls `mcp__claude_ai_Celavii__scrape_hashtags`). Trend detection consumes these scrape outputs — does NOT call Celavii directly.

If insufficient hashtag scrape history exists for the niche (< 7 days), trigger `social-discover` Mode B first to seed the time series.

Process:

1. Pull last 7 days of hashtag scrapes from `raw/celavii-hashtag-*-{platform}-*.json` (multiple snapshots per hashtag = the time series)
2. For each hashtag, build view-count time series at hour buckets
3. Compute velocity (Δ views / Δ time), acceleration (ΔΔ views), z-score vs same-cohort baseline — via `scripts/trend_math.py`
4. Rank by z-score; flag any > 2σ as "exploding"

**Output**: `raw/trend-{platform}-{topic}-{ts}.json` matching the schema in § Output Schema below + a summary markdown for human review.

Optional accelerator: `mcp__claude_ai_Celavii__get_shared_hashtags` with `{ profile_ids, limit }` returns hashtags shared across a creator cohort — useful for niche-scoped trend detection without doing platform-wide scrapes.

### Mode B — Audio trends (TikTok / Reels)

When [`trendsmcp/tiktok-trends-mcp`](file:///Users/operator/dev/openclaw/.system/features/social-strategy/decisions/0002-trendsmcp-wire.md) is wired (A17 follow-up), pull live trending sounds with growth-rate metadata. Until then, fallback to manual extraction from competitor post analysis (`social-competitor-scrape`).

```bash
social-trend-detect audio --platform tiktok --window 7d
```

### Mode C — Topic trends (cross-platform)

Combines three signals:

1. **Celavii content corpus** — `mcp__claude_ai_Celavii__semantic_search_content` with `{ query: "<topic>", platform, since: "<7d-ago>", limit: 100 }` to surface posts mentioning the topic across the org's tracked content. **1 credit per call.** Frequency = post velocity proxy.
2. **Web search velocity** — `web_search` with freshness filter (last 7 days vs last 30 days) to gauge mainstream attention growth.
3. **Reddit/HN topic mentions** — `web_search` with `site:reddit.com` / `site:news.ycombinator.com` filters for niche discussion velocity.

Cross-reference the three: a topic trending on web but absent from `semantic_search_content` is an early-detection opportunity (the platform corpus hasn't caught up yet). A topic trending in the corpus but not on web is platform-internal hype.

### Mode D — Platform-native (lagging) snapshot

When you explicitly want the "what's trending right now" list (not leading indicators):

```bash
social-trend-detect snapshot --platform tiktok --region us
```

Backed by trendsmcp once wired; returns a flagged-as-lagging dataset.

## Math Reference

Z-score over rolling buckets (port of [`readikus/ramekin`](https://github.com/readikus/ramekin)):

```python
def z_score(value, baseline_mean, baseline_std):
    if baseline_std == 0:
        return 0.0
    return (value - baseline_mean) / baseline_std

# Exploding threshold: |z| > 2.0 over 7d window
# Velocity = Δ views / Δ time (hour buckets)
# Acceleration = Δ velocity / Δ time (compare day-over-day velocity)
```

`scripts/trend_math.py` (Phase B10.1) implements:

- `compute_velocity(time_series)` → series of velocity per bucket
- `compute_acceleration(velocity_series)` → series of acceleration
- `z_score_outliers(series, window, threshold=2.0)` → indices flagged

## Cluster (hashtag co-occurrence)

After velocity ranking, cluster surfaced hashtags by co-occurrence (port of [`bellingcat/tiktok-hashtag-analysis`](https://github.com/bellingcat/tiktok-hashtag-analysis)):

- For each pair of trending hashtags, compute Jaccard similarity over post-set
- Build co-occurrence matrix; surface clusters via connected components

This feeds Phase 3 aggregator's pillar clustering.

## Output Schema

```json
"phases.discover.trend_signals": [
  {
    "platform": "tiktok",
    "topic": "agentic-marketing",
    "type": "hashtag",
    "velocity": 145.2,
    "acceleration": 28.7,
    "z_score": 2.8,
    "is_exploding": true,
    "co_occurring": ["#aimarketing", "#creatortools"],
    "raw_file": "raw/trend-tiktok-agentic-marketing-{ts}.json",
    "captured_at": "2026-04-28T12:00:00Z"
  }
]
```

## YouTube Stub

`--platform youtube` returns "not yet enabled" until Phase H-YT. YouTube Data API will provide native trending feed; we'll combine with our own velocity math.

## Fallback Chain

| Tier        | Source                                                    | Status                       |
| ----------- | --------------------------------------------------------- | ---------------------------- |
| Primary     | trendsmcp (TikTok)                                        | ⏸ awaiting A17 wire approval |
| Secondary   | Apify TikTok actor + own velocity math                    | ✅ available                 |
| Tertiary    | Manual extraction from `social-competitor-scrape` outputs | ✅ available                 |
| Cross-check | Brave Search freshness + Google Trends Apify              | ✅ available                 |

## Integration

- Reads niche/topic seeds from `state.intake` + `state.phases.acquire.themes`
- Reads hashtag scrape outputs from `social-discover` Mode B (which calls `mcp__claude_ai_Celavii__scrape_hashtags`)
- Calls Celavii MCP tools directly only for Mode C cross-platform topic detection: `mcp__claude_ai_Celavii__semantic_search_content`, `mcp__claude_ai_Celavii__get_shared_hashtags` (optional accelerator)
- Outputs to `state.phases.discover.trend_signals[]` matching § Output Schema + raw files
- Feeds `social-aggregate` (Phase 3) and `social-plan` (Phase 4 calendar reactive slots)

## References

- `references/velocity-math.md` — full derivative + z-score math (Phase B10.1)
- `references/trendsmcp-tools.md` — tool surface once wired (Phase B10.1)
- `references/cluster-jaccard.md` — co-occurrence clustering (Phase B10.1)

## Status

- [x] SKILL.md scaffold (this file) — Phase B10 contract
- [ ] `scripts/trend_math.py` — velocity/acceleration/z-score (Phase B10.1)
- [ ] trendsmcp gateway wire (Phase A17 follow-up — gateway settings.json patch)
- [ ] Apify TikTok actor fallback wired (Phase B10.1)
- [ ] Smoke test on a known-trending hashtag (Phase B10.2)
