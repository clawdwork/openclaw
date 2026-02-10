# Generate Video

Create a video prompt for a text-to-video model.

## Usage

```
create a video of [description]
make a video clip of [concept]
generate a video prompt for [brief]
```

## Workflow

1. Read `media-content/video-prompting/SKILL.md` for prompt crafting guidance
2. **Decide approach**: text-to-video (direct) or image-to-video (first-frame control)
   - **Image-to-video**: generate a still frame with `nano-banana-pro` first, get approval, then animate
   - See § Image-to-Video Workflow in `video-prompting/SKILL.md`
3. Determine target platform (Veo 3.1 or Sora 2)
   - **Veo 3.1** (`veo3-gen`): native audio, max 8s, 720p/1080p/4k
   - **Sora 2** (`sora2-gen`): silent video, max 12s, supports remix
4. Read platform-specific rules: `references/veo3-rules.md` or `references/sora2-rules.md`
5. Apply Six Key Aspects: Shot, Scene, Action, Characters, Camera, Audio
6. Structure action in beats (2-3 per 8-sec clip)
7. Format dialogue per platform rules
8. If recurring character: read `media-content/character-consistency/SKILL.md`
9. Execute via the appropriate skill script
10. Save to `~/org/shared/projects/{project}/media/generated/drafts/`
