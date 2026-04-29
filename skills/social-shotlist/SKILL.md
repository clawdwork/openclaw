---
name: social-shotlist
description: >
  Convert a script into a shot list — camera angles, b-roll cues, on-screen
  text per beat, transition directives, and per-shot duration. Inputs script;
  outputs production-ready shot list for editor / AI editor / camera op.
  Backbone: ClipsAI for transcript-aware timing.
user-invocable: true
metadata: { "openclaw": { "emoji": "🎥", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-shotlist

> **Phase B7.** Backbone: [`ClipsAI/clipsai`](https://github.com/ClipsAI/clipsai) (Apache 2.0) — transcript-aware shot timing. Used as Phase B19 dependency.

## Input

- `--script` (required): script file from `social-script`

## Output Schema

`content/social/shotlists/{channel}-{post-id}-shots.md`:

```markdown
---
post_id: celavii-tt-005
channel: celavii
platform: tiktok
format: short-video
target_length: 45s
total_shots: 14
---

# Shot List: 5,000 profiles agent demo

## Shot 1 — Hook (0:00–0:03, 3s)

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Camera         | Direct-to-camera, eye-level, head-and-shoulders        |
| Lens           | 35mm equiv, soft background blur                       |
| Lighting       | Key + soft fill, golden hour or warm 3200K             |
| On-screen text | "5,000 PROFILES SCORED" — bold, sans, white, top-third |
| Audio          | Voiceover delivers hook in matter-of-fact tone         |
| B-roll         | (none — talking head)                                  |
| Transition out | Hard cut                                               |
| Notes          | Hand gesture optional but minimal — let words land     |

## Shot 2 — B-roll setup (0:03–0:05, 2s)

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Camera         | Top-down                                                   |
| Subject        | Hands typing on keyboard, screen reflection visible        |
| On-screen text | (none — let visual breathe)                                |
| Audio          | VO continues "Most agencies are still doing this manually" |
| Transition out | Whip pan                                                   |

## Shot 3 — Spreadsheet shot (0:05–0:08, 3s)

| Field          | Value                                         |
| -------------- | --------------------------------------------- |
| Camera         | Screen recording or over-shoulder             |
| Subject        | Excel sheet with creator names being scrolled |
| On-screen text | "Excel + 6 dashboards"                        |
| Effects        | Subtle zoom-in on chaos                       |

[...11 more shots...]

## Production Notes

- Total run: 45s
- Cut density: 1 cut every 3.2s avg (good for TT/Reels hook retention)
- Music: instrumental, build under VO; sync hits at 0:08, 0:25, 0:40
- Captions: auto-generated SRT included for accessibility (alt-text per shot below)
- Aspect: 9:16 vertical
```

## Modes

### Mode A — From script (default)

```bash
social-shotlist generate --script content/social/scripts/celavii-tt-005-script.md
```

### Mode B — From transcript (raw video repurpose)

For `social-repurpose` lane: given an existing long-form video transcript + timestamps, identify the best 30–60s extract and shotlist it.

```bash
social-shotlist from-transcript --transcript path/to/transcript.vtt \
  --target-length 45s --hook-archetype authority
```

Wraps ClipsAI's transcript-aware cut detection.

### Mode C — Carousel shotlist

For IG/LinkedIn carousels (no video), output a per-slide shotlist (visual + on-slide text + sequence).

```bash
social-shotlist carousel --script content/social/scripts/celavii-ig-001-script.md \
  --max-slides 10
```

## Per-Format Defaults

| Format       | Avg shots   | Cut density         | Aspect          |
| ------------ | ----------- | ------------------- | --------------- |
| TikTok       | 12–18       | 3–5s avg            | 9:16            |
| IG Reel      | 10–14       | 4–5s avg            | 9:16            |
| YT Short     | 10–14       | 3–5s avg            | 9:16            |
| YT Long-form | varies      | conversational pace | 16:9            |
| Carousel     | 5–10 slides | n/a                 | 4:5 (1080×1350) |

## Accessibility

Every shot must include:

- Alt-text for the visual element
- Captions/SRT for spoken content
- High-contrast on-screen text (Celavii brand: white on dark ≥4.5:1)

## Integration

- Reads script from `social-script`
- For Mode B (transcript), calls ClipsAI via Python wrapper (Phase B19)
- Output consumed by `celavii-social` (Step 4 media generation prompts)
- Updates `state.weekly_cycles[].posts[].shotlist_path`
- Pairs with media-prompt generation in `celavii-social`

## Brand Constraints (from voice.json + design system)

Reads `~/dev/workspace/.styles/celavii/brand.json` (existing) for:

- Color palette (`#0066FF`, `#00D4FF`, hero gradient orange→pink→purple)
- Typography (Inter, bold headers)
- Allowed dark backgrounds (`#0f172a`, `#1e293b`)
- Brand watermark placement rules

## References

- `references/shot-template.md` — full markdown template per format
- `references/clipsai-integration.md` — Mode B transcript→shots wrapping (Phase B19)
- `references/accessibility-rules.md` — alt-text + caption requirements

## Status

- [x] SKILL.md scaffold (this file) — Phase B7 contract
- [ ] `scripts/shotlist.py` — Mode A generator (Phase B7.1)
- [ ] ClipsAI Python wrapper (Phase B19, parallel)
- [ ] Carousel sub-mode (Phase B7.1)
- [ ] Smoke test against existing video script (Phase B7.2)
