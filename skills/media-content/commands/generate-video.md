# Generate Video

Create a video from a text prompt or animate a reference image.

## Usage

```
create a video of [description]
make a video clip of [concept]
generate a video prompt for [brief]
animate this image                     # with reference image attached
turn this photo into a video           # with reference image attached
```

## CRITICAL: Reference Image Routing

If the user provides, attaches, or references an image:

1. **You MUST pass it via `-i` flag** to `veo3-gen` or `sora2-gen` for image-to-video generation
2. **Do NOT ignore the image** and generate text-to-video only — the user expects the image to be the first frame
3. The `-i` flag tells the model to use the image as the starting frame and animate from it

```bash
# Image-to-video with Veo 3.1 (recommended — has native audio)
uv run {baseDir}/veo3-gen/scripts/generate_video.py \
  --prompt "motion and audio description" \
  --filename "./media/generated/drafts/animated.mp4" \
  -i /path/to/reference-image.png --resolution 1080p

# Image-to-video with Sora 2 (longer clips, no audio)
uv run {baseDir}/sora2-gen/scripts/generate_video.py \
  --prompt "motion description" \
  --filename "./media/generated/drafts/animated.mp4" \
  -i /path/to/reference-image.png --size 1280x720
```

**Decision tree**:

- User provides image + asks for video/animation → **image-to-video** (`-i` flag)
- User provides image + asks for image edits → **image-to-image** (see `generate-image.md`)
- No image but user wants first-frame control → generate still with `nano-banana-pro` first, get approval, then animate with `-i`
- No image provided → **text-to-video** (standard workflow below)

## Workflow (Text-to-Video)

1. Read `media-content/video-prompting/SKILL.md` for prompt crafting guidance
2. Determine target platform (Veo 3.1 or Sora 2)
   - **Veo 3.1** (`veo3-gen`): native audio, max 8s, 720p/1080p/4k
   - **Sora 2** (`sora2-gen`): silent video, max 12s, supports remix
3. Read platform-specific rules: `references/veo3-rules.md` or `references/sora2-rules.md`
4. Apply Six Key Aspects: Shot, Scene, Action, Characters, Camera, Audio
5. Structure action in beats (2-3 per 8-sec clip)
6. Format dialogue per platform rules
7. If recurring character: read `media-content/character-consistency/SKILL.md`
8. Execute via the appropriate skill script
9. Save to `~/org/shared/projects/{project}/media/generated/drafts/`

## Workflow (Image-to-Video)

1. Read `media-content/video-prompting/SKILL.md` § Image-to-Video Workflow
2. Analyze the reference image (subject, composition, lighting)
3. Craft a motion prompt describing what should animate (do NOT re-describe the static scene)
4. **Execute with `-i` flag**: pass the reference image to veo3-gen or sora2-gen
5. Include audio description in prompt if using Veo 3.1
6. Save to `~/org/shared/projects/{project}/media/generated/drafts/`
