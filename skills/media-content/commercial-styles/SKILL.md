---
name: media-content/commercial-styles
description: >
  Generate commercial and advertising visual content across multiple genres and platforms.
  Use when creating product ads, mood boards, brand identity visuals, food/beverage photography,
  packaging designs, social media content, or any commercial/marketing visual asset.
  Covers Outdoor/Adventure, Health/Wellness, Futuristic Tech, Cinematic Product Showcase,
  Fresh Market, Mood Boards, Food Photography, and Brand Identity workflows.
---

# Commercial Styles

## Core Workflow

1. **Identify genre** — Outdoor, Wellness, Tech, Cinematic, Market, Mood Board, Food, Brand Identity
2. **Load genre vocabulary** — read `references/genre-templates.md` for vocabulary banks and templates
3. **Apply product prompt template** — suspended, macro, rotation, lifestyle, unboxing
4. **Consider platform** — TikTok 9:16, YouTube, Instagram, landscape 16:9
5. **For mood boards**: multi-panel grid with color swatches + product shots
6. **For brand identity**: follow 5-step workflow (concept → formula → variations → consistency → iterate)

## Genre Quick Reference

| Genre                 | Core Focus                          | Visual Signature                                        |
| --------------------- | ----------------------------------- | ------------------------------------------------------- |
| **Outdoor/Adventure** | Freedom, scale, natural beauty      | Aerial shots, golden hour, dust trails, vast landscapes |
| **Health/Wellness**   | Serenity, self-care, mindfulness    | Soft diffused light, slow motion, muted earth tones     |
| **Futuristic Tech**   | Innovation, precision, power        | High contrast, dark backgrounds, blue/violet accents    |
| **Cinematic Product** | Luxury, drama, desire               | Slow orbit, mist/fog, lens flares, rich textures        |
| **Fresh Market**      | Authenticity, warmth, sensory       | Golden hour, macro textures, rustic materials           |
| **Mood Board**        | Visual cohesion, brand storytelling | Multi-panel grid, color swatches, symmetrical layout    |
| **Food/Beverage**     | Appetite appeal, plating artistry   | Top-down/table-level, natural light, long shadows       |
| **Brand Identity**    | Consistency, comprehensive          | Reusable formula, same camera/lens across all shots     |

For detailed vocabulary banks, sound design palettes, and full prompt templates per genre: **read `references/genre-templates.md`**.

## Product Prompt Templates

### Suspended Product Shot

```
Camera slowly [orbits/rotates around] a [product] [suspended/floating] above
[surface/field]. [Light type] [pulses/reflects/cascades] across [material].
[Atmospheric element: mist/fog/particles]. Sound: [ambient tone] + [accent sound].
```

### Macro Reveal

```
[Extreme/Ultra] close-up of [product detail]. Camera [glides/pushes in] to reveal
[texture/feature]. [Light behavior on material]. [Background treatment].
Sound: [material-specific sound], [ambient pad].
```

### Dramatic Rotation

```
[Product] rotates [slowly/precisely] on [surface]. Camera [tracks/orbits] at
[angle]. [Lighting direction] creates [shadow/reflection effect].
[Color palette]. Sound: [atmospheric tone], [mechanical/organic accent].
```

### Lifestyle Integration

```
[Person/hand] [interacts with product] in [environment]. Camera [movement].
[Natural lighting]. [Emotional tone]. Focus [racks/shifts] from [element] to [product].
Sound: [ambient environment], [subtle music].
```

### Unboxing / Assembly

```
[Product/component] [rises/assembles/unfolds] from [starting state].
Camera [cranes/follows] as parts [snap/lock/magnetize] into place.
[Light builds] as assembly completes. Final form [glows/activates].
Sound: [mechanical sequence], [completion chime/tone].
```

## Mood Board Prompting

### Structure

```
multi-panel mood board [split into N boxes], [Brand/Theme],
seamlessly blend lifestyle images, color swatches, [product shots],
in a [clean/symmetrical] layout. [Color scheme], [aesthetic direction]
```

### Tips

- Open with `multi-panel mood board`
- Specify panel count: `split into 8 boxes`
- Name specific product types to include
- Specify color scheme explicitly
- Use permutation prompts for color variants: `{mint, orange, lime}`

## Brand Identity Workflow

### Step 1: Define Concept

Establish brand positioning, target audience, setting, quality tier.

### Step 2: Create Prompt Formula

Build a reusable template with fill-in-the-blank slots:

```
Capture an epic [type of photography] of the [specific location/object],
showcasing [desired style] in [location]. Use a [camera] and [lens],
setting [resolution], [ISO], and [shutter speed]. Frame to include
[features] and [surrounding landscape] under [weather]. Direct [lighting]
to emphasize [color/effect], underscoring [atmosphere].
```

### Step 3: Generate Variations

Feed formula + brief to produce multiple prompt variations for:

- Hero/establishing shots (drone, wide angle)
- Interior/exterior details
- Product close-ups
- People/lifestyle
- Food/beverage (if applicable)

### Step 4: Maintain Consistency

Keep constant across all generated images:

- Camera body + lens (e.g., Canon EOS 5D Mark IV, EF 24-70mm f/2.8L II USM)
- Lighting direction and quality
- Color palette / warmth
- Architectural/environmental style language

### Step 5: Iterate Per Category

Adjust only subject and framing while keeping the brand formula intact.

## Platform Considerations

| Platform           | Format         | Key Trait                                          |
| ------------------ | -------------- | -------------------------------------------------- |
| **TikTok/Reels**   | 9:16 vertical  | Hook in 1-2 sec, bold colors, high energy          |
| **YouTube Shorts** | 9:16 vertical  | Slightly more cinematic, sound design matters      |
| **Instagram Feed** | 1:1 or 4:5     | Clean aesthetic, strong as still frame             |
| **Brand Video**    | 16:9 landscape | Full cinematic, premium sound, multiple shot types |

## Food & Beverage Quick Reference

### Strong Trigger Words

- `invigorating`, `award-winning food photography`
- `innovative plating`, `intricate ceramic dishes`

### Key Tips

- Describe actual dish composition, not just the name
- Include plating details: what food sits on, garnishes, arrangement
- Specify lighting: `bright natural light and long shadows`
- Shot types: `top-down shot`, `table-view shot`, `close-up`
