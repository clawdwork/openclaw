# Generate Carousel

Generate an Instagram carousel post with copy and media prompts.

## Usage

```
create a carousel about [topic]
generate instagram carousel for [silo]
make a carousel post for [concept]
prepare carousel from queue post [id]
```

## Workflow

1. **Load context**
   - Read `social-strategy-state.json` for brand voice, silos, hashtag strategy
   - If post ID provided, load that queue item's outline

2. **Generate copy**
   - Caption (hook → value → CTA)
   - Slide-by-slide text (7-8 slides typical)
   - Hashtags (11 using formula: 2 branded + 5 industry + 3 silo + 1 trending)

3. **Generate media prompts**
   - One prompt per slide
   - Use Celavii brand visual guidelines
   - Include: dark gradient BG, blue-cyan accents, Inter typography

4. **Save files**

   ```
   content/social/ig-post-[NNN]-[slug]-carousel.md
   ```

5. **Update state**
   - Set `status: "ready"`
   - Add `copy_file` path
   - Add `copy_ready_at` timestamp

## Example Output

See `celavii-social/SKILL.md` → Instagram Carousel template.

## Media Execution (Optional)

If user wants images generated immediately:

```bash
uv run ~/.openclaw/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "[slide prompt]" \
  --filename "~/agent-workspace/projects/celavii/media/generated/social/ig-[id]-slide-[N].png" \
  --resolution 1K
```
