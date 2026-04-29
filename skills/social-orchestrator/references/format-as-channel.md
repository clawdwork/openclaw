# Format-as-Channel (D20)

Linus Media Group pattern. Each format on each platform is its own channel — never a single "post" cross-posted everywhere. Phase 4 PLAN enforces this; Gate B fails any calendar entry that violates it.

## The rule

> Every entry in `publication_calendar[]` is `(channel, platform, format)` — never `(channel, platform)`.

If a topic ships to IG carousel + IG reel + TikTok video, that's **3 calendar entries**, each with its own brief, hook variants, and format-specific copy. Not one entry with three "destinations".

## Why

A 90-second IG Reel and a 90-second TikTok have:

- different optimal hooks (IG rewards "save bait" curiosity; TT rewards Pattern Interrupt)
- different visible-area framing (IG safe-zone smaller)
- different sound usage (TT trending audio mandatory; IG often muted)
- different captions (IG ≤2200 chars + hashtags-in-comment convention; TT ≤300 chars + native captioning)
- different cadence sweet spots (TT 2–5/wk; IG 3–5/wk)
- different first-3-second metrics (TT for-you-page; IG home-feed)

Treating them as one post produces generic copy that underperforms on both.

## Calendar entry shape

```jsonc
{
  "post_id": "celavii-ig-carousel-001", // includes format
  "channel": "celavii",
  "platform": "instagram",
  "format": "carousel", // never absent
  "scheduled_for": "2026-05-04T14:00:00-05:00",
  "pillar_id": "p-001-agentic-marketing", // links sister entries from same pillar
  "e_tags": ["educate", "empower"],
  "hook_archetype_target": "authority",
}
```

Sister entries (same `pillar_id`, different format) are explicit:

```jsonc
[
  {
    "post_id": "celavii-ig-carousel-001",
    "platform": "instagram",
    "format": "carousel",
    "pillar_id": "p-001",
  },
  {
    "post_id": "celavii-ig-reel-001",
    "platform": "instagram",
    "format": "reel",
    "pillar_id": "p-001",
  },
  {
    "post_id": "celavii-tt-video-001",
    "platform": "tiktok",
    "format": "video",
    "pillar_id": "p-001",
  },
  { "post_id": "celavii-x-thread-001", "platform": "x", "format": "thread", "pillar_id": "p-001" },
  {
    "post_id": "celavii-yt-short-001",
    "platform": "youtube",
    "format": "short",
    "pillar_id": "p-001",
  },
]
```

## Gate B fail conditions

Gate B rejects:

- Any calendar entry where `format` is null/missing → fail with "format-as-channel rule violated"
- Any pair of entries where `(channel, platform, scheduled_for_day)` collides with `format` mismatched against `social-sxo` Mode A `format_fit` rules (e.g. format=carousel + platform=tiktok — carousels don't exist on TT)
- Any pillar with <8 atomic spawns (D21 fan-out rule)

## Why not just one "master copy"?

Because the brief format is different per entry — see [`social-brief/SKILL.md` § Format-Specific Briefs](file:///Users/operator/dev/openclaw/skills/social-brief/SKILL.md):

| Format               | Brief shape                                               |
| -------------------- | --------------------------------------------------------- |
| Reel/TikTok/YT short | beats, on-screen text per beat, b-roll cues               |
| Carousel             | per-slide content, slide count (max 10), cover-slide copy |
| X thread             | tweet-by-tweet outline, char count per tweet              |
| Long-form video      | full script outline (handoff to social-script)            |
| Static IG / X single | single-line hook + caption                                |

A "master copy" would have to be re-authored per format anyway. Better to plan per-format from the start.

## Refresh rule

On `/social_strategy refresh`: each pillar's spawn list gets re-evaluated against current platform best-practices. Formats that have aged out (e.g. IGTV deprecated) get dropped; new formats (e.g. IG longer-form video if/when launched) get considered.
