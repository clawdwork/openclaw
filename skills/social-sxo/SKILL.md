---
name: social-sxo
description: >
  Social Experience Optimization. Reads platform-native ranking signals
  backwards to answer "does this post deserve to engage?" Detects format /
  audience / cadence mismatches before publish. Adapted from claude-seo
  seo-sxo. Operates as a pre-publish "deserve to rank" critic — separate
  from voice/factcheck.
user-invocable: true
metadata: { "openclaw": { "emoji": "🎚️", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-sxo

> **Phase B17.** Adapted from [`claude-seo/skills/seo-sxo/`](file:///Users/operator/dev/research/claude-seo/skills/seo-sxo/). SEO version asks "does this page deserve to rank?" — social version asks "does this post deserve to engage?"

## What SXO Catches That Voice + Factcheck Don't

| Skill                    | Catches                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `social-persona enforce` | Off-voice phrasing                                                                            |
| `social-factcheck`       | Bad facts                                                                                     |
| `social-quality` Gate C  | Slop tells, banned language, novelty                                                          |
| **`social-sxo`**         | **Wrong format for the platform / wrong post for the audience / wrong moment in the cadence** |

Examples SXO catches:

- 8-min YouTube video script repurposed verbatim as IG carousel (wrong format)
- Authority Claim hook on a CutMaster post (CutMaster voice favors Pattern Interrupt)
- 3000-word X thread targeting a TikTok audience (wrong density)
- "Education" post pushed to a follower base that mainly engages with "Entertainment" (wrong E-mix)

## Modes

### Mode A — Pre-publish SXO scan

```bash
social-sxo scan --brief content/social/briefs/celavii-ig-001-brief.md
```

Returns:

```json
{
  "post_id": "celavii-ig-001",
  "channel": "celavii",
  "platform": "instagram",
  "format": "carousel",
  "checks": {
    "format_fit": { "status": "pass", "score": 8 },
    "audience_fit": {
      "status": "warn",
      "score": 6,
      "note": "Channel ER for educate-only posts is 0.31% (vs 0.62% educate+empower mix)"
    },
    "cadence_fit": { "status": "pass", "score": 9 },
    "hook_archetype_fit": { "status": "pass", "score": 8 },
    "platform_signals": { "status": "pass", "score": 7 }
  },
  "overall": "warn"
}
```

### Mode B — Format-fit checker (lightweight)

```bash
social-sxo format-fit --platform tiktok --format carousel --length 1500
# Carousels don't exist on TikTok — fail
```

### Mode C — Audience-fit (Channel E-mix history)

For a planned post, check whether its `e_tags` match the dominant E-mix that drives engagement on this channel historically.

```bash
social-sxo audience-fit --channel celavii --e-tags educate
# Returns: warn — 78% of top-decile celavii posts are educate+empower mix
```

## Checks

### 1. Format Fit (per-platform constraint)

| Platform | Allowed formats                                   | Length caps                                          |
| -------- | ------------------------------------------------- | ---------------------------------------------------- |
| TikTok   | short-video (vertical, ≤60s for hooks; longer ok) | n/a (no carousel)                                    |
| IG       | reel, carousel, single, story                     | reels ≤90s, carousel ≤10 slides, caption ≤2200 chars |
| X        | thread, single, image, video                      | tweet ≤280 chars, video ≤2:20                        |
| YouTube  | long-form, short (vertical ≤60s)                  | shorts ≤60s, long-form 8–15min sweet spot            |

### 2. Audience Fit

For each channel, maintain rolling stats (managed by `social-drift`):

- Top-decile posts' E-mix (educate / entertain / engage / empower)
- Top-decile hook archetype distribution
- Engagement rate per format

Flag a post that strays from the channel's high-performing pattern unless intentional (intentional flagged in brief notes).

### 3. Cadence Fit

Reads `state.phases.plan.publication_calendar`. Flags:

- Same-channel post within 24h on same platform (pacing warning)
- Channel quiet for >7 days then a posting burst (algorithm-unfriendly)
- Every-day posts on the same archetype/format (audience fatigue)

Targets per [docs/frameworks.md § 3](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/frameworks.md):

| Platform | Sustainable cadence target                           |
| -------- | ---------------------------------------------------- |
| TikTok   | 2–5x/week (highest sustainable without quality drop) |
| YouTube  | ≥12 uploads/month                                    |
| IG       | 3–5/week, Reels 3–5/week                             |
| X        | 3–5/day                                              |

### 4. Hook Archetype Fit (per channel voice)

Pulls from `~/dev/workspace/.styles/celavii/voice.json#channel_overrides` to determine archetype affinity:

- Elioth: prefers Story + Authority
- Celavii: prefers Authority + Curiosity Gap
- CutMaster: prefers Pattern Interrupt + Contrarian

If a CutMaster post leads with Authority Claim, flag warn (off-archetype).

### 5. Platform Signals

Lightweight per-platform best-practice checks:

- TikTok: hook in first 3s? sound used? trending audio if available?
- IG: alt-text? saved-recipe affordance for educational content?
- X: thread vs single? quote tweet for context?
- YouTube: end-screen cue? chapter markers if >2min?

## Output

Reports inline in brief comments + writes to:

```
content/social/briefs/{post-id}-sxo.md
```

State write:

- `state.gates.C.per_post[].sxo` ← `pass | warn | fail`

## Integration

- Called by `/social_curate` after `social-brief`, before `social-quality` Gate C
- Channel E-mix stats managed by `social-drift` (queried as a read)
- Reads channel voice from `voice.json` via `social-persona enforce`
- Output feeds Gate C alongside factcheck + quality scores

## References

- `references/format-fit-rules.md` — full per-platform constraint matrix
- `references/cadence-targets.md` — 2026 empirical cadence data (Buffer/vidIQ/Sprout)
- `references/audience-fit-method.md` — top-decile derivation methodology

## Status

- [x] SKILL.md scaffold (this file) — Phase B17 contract
- [ ] `scripts/sxo.py` — 5-check scanner (Phase B17.1)
- [ ] Channel E-mix historical computation (depends on social-drift Phase B16) — Phase B17.1
- [ ] Smoke test against 5 historical Celavii blog posts repurposed to social (Phase B17.2)
