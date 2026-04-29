---
name: social-competitor-scrape
description: >
  Scrape competitor profiles + recent posts across IG / TikTok / X
  (YouTube on H-YT activation). Wraps Celavii's public scrape API + adapter
  layer to pull competitor baselines, top-performing posts, posting cadence,
  and format inventory. Feeds Phase 1 (Discover) and Phase 2 (Analyze).
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

```bash
social-competitor-scrape baseline --platform tiktok \
  --handles modaberlin,grin,upfluence \
  --posts 50
# → raw/celavii-{handle}-{platform}-profile-{ts}.json
# → raw/celavii-{handle}-{platform}-posts-{ts}.json
```

### Mode B — Top-performer extraction

Pull a competitor's top-N posts by engagement over a window. Uses `/content/search?author={handle}&sort=engagement&since={date}`.

```bash
social-competitor-scrape top-posts --handle modaberlin --platform x \
  --since 2026-03-01 --limit 25
```

### Mode C — Followers (cohort analysis seed)

Tier-1 op (2 credits + Apify). Always dry-run first. Useful for audience-overlap analysis (Three Circles).

```bash
social-competitor-scrape followers --handle leomessi --platform instagram \
  --max 5000 --dry-run
```

### Mode D — Cross-platform link extraction

TikTok adapter exposes IG / YouTube / X username extractions with ≥0.95 confidence (per [eval-findings.md § B](file:///Users/operator/dev/openclaw/.system/features/social-strategy/v2/eval-findings.md)). Use this to enrich a single-platform competitor list into a cross-platform map.

```bash
social-competitor-scrape cross-platform --seed-platform tiktok \
  --handles modaberlin,celaviihq,grinco
# Returns: { tiktok: handle, instagram: handle, x: handle, youtube: handle (if found) }
```

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

- Reads competitor handles from `state.intake.competitors_per_channel`
- Calls `social-discover` Mode A internally for each competitor
- Outputs feed `social-aggregate` (Phase 3 cosine cannibalization across competitors + own posts) and `social-sxo` (platform-fit analysis)

## References

- `references/competitor-rotation.md` — guidance on how often to re-scrape (target: weekly for top 3 competitors per channel, monthly for the rest)
- `references/cohort-overlap.md` — Three Circles audience-overlap protocol (for Mode C)

## Status

- [x] SKILL.md scaffold (this file) — Phase B11 contract
- [ ] `scripts/competitor.py` — wrapper CLI (Phase B11.1)
- [ ] Mode A smoke test against 3 competitors (Phase B11.2)
- [ ] Mode D cross-platform extraction test (Phase B11.2)
