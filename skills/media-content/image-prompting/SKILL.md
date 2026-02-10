---
name: media-content/image-prompting
description: >
  Craft optimized image generation prompts for photorealistic, editorial, cinematic, and commercial photography.
  Use when generating images, photos, portraits, product shots, mood boards, or any visual asset.
  Supports physical format specifications (banners, cans, posters, apparel) and context-aware camera/lens selection.
  Works with nano-banana-pro (Gemini 3 Pro) for execution.
---

# Image Prompting

## Core Workflow

1. **Analyze intent** — what, who, where, why, mood, format
2. **Select prompt formula** — photorealistic, character-focused, cinematic, enhanced lighting, etc.
3. **Choose equipment** — camera + lens matched to scenario (read `references/visual-assets.md` for full tables)
4. **Layer detail progressively** — subject → environment → lighting → technical
5. **Apply physical format** if user specifies dimensions (read `references/dimensions-formats.md`)
6. **Execute** via `nano-banana-pro` skill
7. **Offer 2-3 alternative directions** with different angles/styles

## Prompt Structure

Order matters — models weight elements at the beginning more heavily.

```
[Subject + Action], [Environment/Setting], [Medium (camera/lens/film stock)],
[Depth of Field], [Composition], [Lighting/Time of Day], [Color/Mood], [Textures]
```

### Element Priority

| Priority | Element              | Example                                                           |
| -------- | -------------------- | ----------------------------------------------------------------- |
| 1        | **Subject + Action** | `satisfied Brazilian woman sitting, exhaling smoke toward camera` |
| 2        | **Environment**      | `cozy favela bedroom, house plants`                               |
| 3        | **Medium**           | `editorial photography, Leica M10-R, 50mm f/2`                    |
| 4        | **Depth of Field**   | `shallow depth of field`                                          |
| 5        | **Composition**      | `asymmetrical composition, leading lines`                         |
| 6        | **Lighting**         | `cinematic lighting, golden hour, dramatic shadows`               |
| 7        | **Color/Mood**       | `muted 1990s color grading, warm tones`                           |
| 8        | **Textures**         | `smoke blending with light rays, weathered skin`                  |

**Strategy**: Place whatever needs emphasis FIRST.

## Prompt Length

| Length                   | Effect                                     | Best For       |
| ------------------------ | ------------------------------------------ | -------------- |
| Short (10-30 words)      | Max creative liberty, varied results       | Exploration    |
| **Medium (30-80 words)** | **Sweet spot — precision + AI creativity** | **Production** |
| Long (80-150 words)      | Maximum control, risk of late-token drop   | Complex scenes |
| Too Long (150+)          | Model ignores later elements               | Avoid          |

Use strong keywords, not full sentences. Separate with commas. One subject per prompt.

**Power words**: `luminous` > `bright`, `jubilant` > `happy`, `enormous` > `big`, `ethereal` > `dreamy`

## Prompt Formulas

### Photorealistic (General)

```
[Shot Type], [Photo Style], [Subject + Action], [Environment],
[Camera/Lens/Film Stock], [Depth of Field], [Color Scheme],
[Textures], [Composition], [Lighting]
```

### Character-Focused

```
[Shot Type], [Subject + Action + Environment], [Expression],
[Wardrobe], [Body Position], [Unique Features], [Props],
[Camera/Film Stock]
```

### Cinematic Still

```
Cinematic still, [Subject + Action], [Environment],
[Camera/Film Stock], [Cinematic Lighting], [Details/Modifiers]
```

### Enhanced Lighting

```
[Lighting Conditions], [Subject + Action], [Environment],
[Camera/Film Stock], [Composition], [Details]
```

### Enhanced Motion

```
[Motion Type], [Subject + Action], [Environment],
[Camera/Film Stock], [Composition], [Lighting], [Details]
```

### Super Control (Maximum Detail)

```
[Shot Type], [Photo Type], [Subject + Action], [Subject Position],
[Wardrobe], [Props], [Subject Focus], [Environment],
[Environment Focus], [Environment Details], [Colors & Tone],
[Lighting], [Time of Day], [Textures], [Camera/Technical]
```

## Progressive Detail Layering

Start simple, add incrementally. Each layer gives more control:

1. **Subject**: `satisfied Brazilian woman sitting, looking at camera`
2. **+ Framing**: `center of image, medium shot, editorial`
3. **+ Focus**: `sharp focus, mid-ground, slightly blurred background`
4. **+ Wardrobe**: `wearing muted blue oversized t-shirt, headband, red lipstick`
5. **+ Environment**: `cozy favela bedroom, house plants, rundown and liberated`
6. **+ Lighting**: `low light, light from window, dramatic shadows, early morning`
7. **+ Aesthetic**: `smoke blending with light rays, muted 1990s color grading`
8. **+ Technical**: `Bergger Pancro 400 film`

## Context-Aware Equipment

Match camera/lens to scenario:

| Scenario       | Camera           | Lens            | Why                     |
| -------------- | ---------------- | --------------- | ----------------------- |
| Portraits      | Leica M10-R      | 50mm f/2 ASPH   | Sharp, dreamy rendering |
| Wildlife       | Sony A9 II       | 200mm telephoto | Fast AF, compressed BG  |
| Street         | Fujifilm X-T4    | 35mm            | Candid, organic feel    |
| Landscape      | Hasselblad H6D   | Wide angle      | Ultra-resolution        |
| Action/Extreme | GoPro HERO       | Ultra-wide      | Immersive POV           |
| Vintage/Art    | Polaroid SX-70   | Fixed           | Nostalgic, soft-toned   |
| Fine Art       | Fujifilm GFX 100 | 110mm f/2       | Medium format detail    |
| Cinematic      | ARRI Alexa Mini  | 70mm            | Film-standard color     |

For full camera, lens, film stock, lighting, and composition tables: **read `references/visual-assets.md`**.

## Film Stock Quick Reference

| Aesthetic         | Film Stock                       |
| ----------------- | -------------------------------- |
| Natural/Balanced  | Fujifilm Provia                  |
| Warm Portraits    | Kodak Portra                     |
| High Contrast B&W | Kodak Tri-X 400                  |
| Cinematic Night   | Cinestill 800T                   |
| Vivid Landscape   | Fuji Velvia 50                   |
| Vintage           | AgfaPhoto Vista                  |
| Surreal           | LomoChrome Purple                |
| Urban Gritty      | Lomography LomoChrome Metropolis |

## Physical Dimensions

Gemini 3 Pro understands real-world format specs. State dimensions early:

```
Design a product label for a 2.75 inch aluminum energy drink can...
Create a horizontal vinyl banner, 6 feet wide by 2 feet tall...
Poster at 24x36 inches for a music festival...
```

Include **material** (vinyl, aluminum, canvas) and **viewing distance** if relevant.

For full format table and examples: **read `references/dimensions-formats.md`**.

## Photography Elements That Create Realism

Simply adding a camera and lens transforms AI output into photorealistic results:

- ❌ `African wild dogs, wilderness, hunt` → looks artificial
- ✅ `African wild dogs, wilderness, intense hunt, Sony A9 II, 85mm f/1.8 GM lens` → photorealistic

## Execution

Generate images via `nano-banana-pro`:

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "your prompt" --filename "output.png" --resolution 1K
```

- Resolutions: `1K` (default), `2K`, `4K`
- Timestamps in filenames: `yyyy-mm-dd-hh-mm-ss-name.png`
- Multi-image composition: add multiple `-i` flags
- Do not read the image back; report the saved path only

## Key Rules

1. **Specificity over generality** — always specify camera, lighting, palette
2. **One subject per prompt** — multiple subjects confuse the model
3. **Place emphasis first** — whatever matters most goes at the beginning
4. **Iterate, don't rewrite** — change one element at a time
5. **Always offer alternatives** — provide 2-3 directions per request
