---
name: social-repurpose
description: >
  Cross-channel content adaptation. Spawns N atomic outputs from one long-form
  pillar (Gary Vee Reverse Pyramid). Video lane uses ClipsAI for transcript-
  aware long→short cuts. Text lane adapts blog post → X thread / IG carousel
  / TikTok script. Driven by repurposing_loops in state.phases.plan.
user-invocable: true
metadata: { "openclaw": { "emoji": "♻️", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-repurpose

> **Phase F2 + B19.** Backbone for video lane: [`ClipsAI/clipsai`](https://github.com/ClipsAI/clipsai) (Apache 2.0) — transcript-aware cut detection. Hook prompt patterns from [`Shaarav4795/ClippedAI`](https://github.com/Shaarav4795/ClippedAI). Channel routing from [docs/integration-recommendations.md § Phase 5](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/integration-recommendations.md).

## Gary Vee Reverse Pyramid (Channel-Aware)

```
1 long-form pillar (30–60min keynote / vlog / podcast / blog post)
  ├─ Elioth:    1 X thread (8-15 tweets) + 1 IG carousel (6-10 slides) + 1 YT long-form excerpt
  ├─ Celavii:   1 blog post + 1 IG reel demo + 1 X infographic + 1 LinkedIn article
  └─ CutMaster: 3-5 TikTok shorts + 2 YT shorts + 1 IG reel
TOTAL: 12-15 atomic outputs per pillar
```

## Modes

### Mode A — From long-form video (transcript-aware)

```bash
social-repurpose video --source path/to/keynote.mp4 \
  --transcript path/to/keynote.vtt \
  --target-channels celavii,cutmaster \
  --output-formats tiktok-short,yt-short,ig-reel
```

Process:

1. Load transcript → ClipsAI identifies high-engagement chunks (sentence boundaries, hook density, audio energy)
2. For each chunk → propose target format + duration
3. Generate brief (via `social-brief`) + script (via `social-script`) + shotlist (via `social-shotlist`) for each
4. Tag with source pillar lineage in state

### Mode B — From blog post (text adaptation)

```bash
social-repurpose blog --source content/blog/published/agentic-shift-final.mdx \
  --target-channels elioth,celavii \
  --output-formats x-thread,ig-carousel
```

Process:

1. Section-by-section extract (H2 hierarchy)
2. Identify single most-quotable line per section → potential hook
3. For X thread: 1 tweet per H2; pin a stat-bearing tweet up top
4. For IG carousel: 1 slide per H2 + cover slide pulled from headline + CTA slide
5. Apply channel voice + tone-by-context

### Mode C — From podcast (transcript audio)

```bash
social-repurpose podcast --transcript path/to/transcript.vtt \
  --audio path/to/episode.mp3 \
  --target-channels celavii \
  --output-formats audiogram,short-clip
```

Process:

1. ClipsAI identifies high-engagement quote moments
2. Generate audiograms (waveform + caption + branded frame)
3. Generate text quote cards for IG/LinkedIn

### Mode D — Reactivation pass (republish loop)

For evergreen pillars >90 days old, propose a republish with fresh framing.

```bash
social-repurpose reactivate --pillar p-001-agentic-marketing --window 90d
```

Reads `social-drift` history; suggests pillars with high historical ER but fading recent engagement; proposes 1–2 fresh atomic spawns.

## Repurpose Lineage Tracking

Every spawned post carries a `repurpose_lineage` array in its state entry:

```json
{
  "post_id": "celavii-tt-005",
  "repurpose_lineage": ["blog/agentic-shift-final.mdx", "celavii-blog-001", "celavii-tt-005"],
  "source_pillar_long_form": "blog/agentic-shift-final.mdx",
  "spawn_format": "tiktok-short",
  "channel_route": "celavii"
}
```

Used by `social-cannibalization` (recognize legit spawns vs accidental duplication) and `social-drift` (track repurposing fan-out per pillar).

## ClipsAI Integration (Mode A backbone)

`scripts/repurpose_video.py` wraps ClipsAI:

```python
from clipsai import Transcript, MediaEditor
transcript = Transcript.from_file("keynote.vtt")
editor = MediaEditor.from_file("keynote.mp4")
clips = transcript.find_clips(
    target_durations=[45, 60, 90],
    sentence_aware=True,
    hook_density_threshold=0.7
)
for clip in clips:
    editor.export_clip(clip, output=f"clip-{clip.id}.mp4")
```

Then each exported clip → `social-shotlist from-transcript` → brief → script.

## Channel Voice Re-Application

Every repurposed output re-applies channel voice from `voice.json#channel_overrides`:

- Elioth blog excerpt → Elioth-voiced thread (first-person)
- Celavii blog → Celavii-voiced carousel (third-person, data-rich)
- Same source can spawn very different outputs per channel

## Quality Gates

Every repurposed brief still goes through:

1. `social-quality silo-check` — does the spawn match its target pillar?
2. `social-quality gate-c` — does the spawned content pass per-post quality?
3. `social-cannibalization check` — does it duplicate something already in the calendar?

## Integration

- Reads `state.phases.plan.repurposing_loops`
- Calls `social-brief` + `social-script` + `social-shotlist` per spawned post
- ClipsAI Python wrapper for video lane (Phase B19)
- Updates `state.weekly_cycles[].posts[]` with `repurpose_lineage` set

## References

- `references/reverse-pyramid.md` — Gary Vee fan-out per channel
- `references/clipsai-wrapper.md` — Python integration pattern (Phase B19)
- `references/per-format-adaptation.md` — blog → X / IG / TT / YT routing rules
- `references/lineage-tracking.md` — state schema for repurpose_lineage

## Status

- [x] SKILL.md scaffold (this file) — Phase F2 + B19 contract
- [ ] `scripts/repurpose_video.py` — ClipsAI wrapper (Phase B19.1)
- [ ] `scripts/repurpose_blog.py` — text adapter (Phase F2.1)
- [ ] Reactivation mode (Phase F2.1)
- [ ] Smoke test against existing published Celavii blog post (Phase F2.2)
