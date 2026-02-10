# Generate Image

Generate an image from a text brief or reference image.

## Usage

```
generate an image of [description]
create a photo of [subject]
make me a picture of [concept]
edit this image to [changes]           # with reference image attached
make a version of this but [changes]   # with reference image attached
```

## CRITICAL: Reference Image Routing

If the user provides, attaches, or references an image:

1. **You MUST pass it via `-i` flag** to `nano-banana-pro` for image-to-image generation
2. **Do NOT ignore the image** and generate from text only — that defeats the purpose
3. The `-i` flag tells the model to use the image as input, not just as creative inspiration

```bash
# Image-to-image (editing/styling a reference)
uv run {baseDir}/nano-banana-pro/scripts/generate_image.py \
  --prompt "edit instructions describing desired changes" \
  --filename "./media/generated/drafts/output.png" \
  -i /path/to/reference-image.png --resolution 2K

# Multi-image composition (combining references)
uv run {baseDir}/nano-banana-pro/scripts/generate_image.py \
  --prompt "combine into one scene" \
  --filename "./media/generated/drafts/output.png" \
  -i ref1.png -i ref2.png
```

**Decision tree**:

- User provides image + asks for edits/changes → **image-to-image** (`-i` flag)
- User provides image + asks for video → **image-to-video** (see `generate-video.md`)
- User provides image as style/mood reference only → analyze with creative-direction, then generate text-to-image inspired by it (no `-i`)
- No image provided → **text-to-image** (standard workflow below)

## Workflow (Text-to-Image)

1. Read `media-content/image-prompting/SKILL.md` for prompt crafting guidance
2. Analyze the user's brief — identify subject, mood, style, format
3. Select appropriate prompt formula (photorealistic, cinematic, character, etc.)
4. Choose camera + lens matched to scenario
5. Craft the prompt using progressive detail layering
6. Execute via `nano-banana-pro` skill
7. Save to `~/org/shared/projects/{project}/media/generated/drafts/`
8. Offer 2-3 alternative directions

## Workflow (Image-to-Image)

1. Read `media-content/creative-direction/SKILL.md` for OBSERVE→REASON→ACT framework
2. Analyze the reference: subject, composition, lighting, palette, equipment
3. Craft a prompt describing the desired transformation or edit
4. **Execute with `-i` flag**: `uv run .../generate_image.py --prompt "..." -i /path/to/ref.png --filename "output.png"`
5. Auto-detect resolution from input image (or use `--resolution 2K` for high quality)
6. Save to `~/org/shared/projects/{project}/media/generated/drafts/`
