# Image Prompting Fundamentals

> Model-agnostic principles for photorealistic image generation (applicable to Gemini 3 Pro, Midjourney, DALL-E, etc.)

---

## Core Principle

**Clear, Direct Prompt = Clear, Direct Output. Ambiguous Prompt = Ambiguous Output.**

The AI generates exactly what you describe. If you don't specify an element, the model fills in the blanks with its defaults. Control comes from specificity.

---

## Prompt Structure

The recommended structure for image prompts, ordered by priority (models weight elements at the beginning of the prompt more heavily):

```
[Subject + Action], [Environment/Setting], [Medium Details (camera/lens/film stock)],
[Depth of Field], [Composition], [Lighting/Time of Day], [Color/Mood], [Textures/Details]
```

### Element Breakdown

| Element                 | Description                             | Example                                                           |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------------- |
| **Subject + Action**    | Main focus and what they're doing       | `satisfied Brazilian woman sitting, exhaling smoke toward camera` |
| **Environment/Setting** | Location, context, backdrop             | `cozy favela bedroom, house plants`                               |
| **Medium Details**      | Photography style, camera body, lens    | `editorial photography, Leica M10-R, 50mm f/2`                    |
| **Depth of Field**      | Focus control                           | `shallow depth of field`, `moderate DoF`                          |
| **Composition**         | Spatial arrangement                     | `asymmetrical composition`, `leading lines`, `rule of thirds`     |
| **Lighting**            | Light quality, direction, time          | `cinematic lighting, golden hour, dramatic shadows`               |
| **Color/Mood**          | Palette, emotional tone                 | `muted 1990s color grading, warm tones`                           |
| **Textures/Details**    | Surface qualities, atmospheric elements | `smoke blending with light rays, weathered skin`                  |

---

## Prompt Weighting

Models prioritize elements that appear earlier in the prompt. The same prompt with reordered elements produces dramatically different results:

- **Subject first** → Subject is the focus, environment supports
- **Environment first** → Environment is prioritized, subject is secondary
- **Color first** → Colors are maximally pronounced
- **Lighting first** → Lighting becomes the dominant feature

**Strategy**: Place whatever you want to emphasize FIRST in the prompt.

---

## Prompt Length Guidelines

| Length                    | Effect                                                                     | Best For                                  |
| ------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| **Short** (10-30 words)   | Model takes maximum creative liberty; varied, sometimes generic results    | Exploration, brainstorming                |
| **Medium** (30-80 words)  | Sweet spot — enough direction for precision, enough room for AI creativity | Production prompts                        |
| **Long** (80-150 words)   | Maximum control but risk of model ignoring later elements                  | Complex scenes requiring specific details |
| **Too Long** (150+ words) | Model can't process all elements; later tokens get dropped                 | Avoid — break into multiple prompts       |

### Length Tips

1. Use strong keywords, not full sentences (for image gen)
2. Separate keywords with commas
3. Use powerful language: `luminous` > `bright`, `jubilant` > `happy`, `enormous` > `big`
4. Focus on ONE subject (multiple subjects confuse the model)
5. Tell the model a "story" — what, where, how, why

---

## Progressive Detail Layering

Start simple and add detail incrementally to build control:

### Layer 1: Subject

```
satisfied Brazilian woman sitting, looking at camera
```

### Layer 2: + Position & Framing

```
satisfied Brazilian woman sitting, looking at camera, center of image, medium shot, editorial
```

### Layer 3: + Focus & Depth

```
... sharp focus, mid-ground, slightly blurred background
```

### Layer 4: + Wardrobe & Props

```
... wearing muted blue oversized t-shirt, headband, red lipstick
```

### Layer 5: + Environment

```
... cozy favela bedroom, house plants, rundown and liberated
```

### Layer 6: + Lighting & Time

```
... low light, light shines from window, dramatic shadows, early morning
```

### Layer 7: + Texture & Aesthetic

```
... smoke blending with light rays, muted 1990s color grading, cinematic moment
```

### Layer 8: + Technical

```
... Bergger Pancro 400 film
```

Each layer gives you more control. You don't always need all layers — add only what matters for the shot.

---

## Prompt Formulas

### Photorealistic (General)

```
[Shot Type], [Photo Style], [Subject + Action], [Environment],
[Camera/Lens/Film Stock], [Depth of Field], [Color Scheme],
[Textures], [Composition], [Lighting Details]
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
[Lighting], [Time of Day], [Textures], [Camera/Technical Details]
```

---

## User-Defined Dimensions & Physical Formats

Gemini 3 Pro is natively smart about physical dimensions and real-world format specifications. Users can specify exact output dimensions in real-world units, and the model will adapt composition, aspect ratio, and layout accordingly.

### Supported Format Specifications

| Format        | Example Prompt Phrasing                                                     |
| ------------- | --------------------------------------------------------------------------- |
| **Banners**   | `design for a 6 foot vinyl banner`, `horizontal banner 8ft x 2ft`           |
| **Packaging** | `label for a 2.75 inch aluminum can`, `wrap design for a 12oz bottle`       |
| **Print**     | `poster at 24x36 inches`, `business card 3.5 x 2 inches`                    |
| **Digital**   | `Instagram story 1080x1920`, `YouTube thumbnail 1280x720`                   |
| **Signage**   | `A-frame sidewalk sign 24x36`, `window decal 4ft diameter`                  |
| **Apparel**   | `design for front of t-shirt 12x16 print area`, `hat embroidery 4x2 inches` |

### How It Works

The model interprets physical dimensions to:

- **Adjust aspect ratio** automatically (a 6ft banner implies extreme landscape)
- **Scale text/elements** proportionally to the physical size
- **Adapt composition** — a narrow can label vs a wide banner require fundamentally different layouts
- **Consider viewing distance** — a billboard needs bolder, simpler elements than a business card

### Example

```
Design a product label for a 2.75 inch aluminum energy drink can. Bold
typography, electric blue and neon green color scheme, lightning bolt motif,
clean modern layout. The brand name "VOLT" should be prominent and readable
at arm's length. Matte black background with metallic accents.
```

```
Create a horizontal vinyl banner, 6 feet wide by 2 feet tall, for a grand
opening event. Bold white text on deep navy background reading "NOW OPEN".
Gold accent border. Clean, readable from 20 feet away. Minimalist design
with a single logo placeholder on the left third.
```

### Key Tips

- State the **exact physical dimensions** early in the prompt
- Mention the **material/medium** (vinyl, aluminum, canvas, paper) — it affects texture rendering
- Consider **viewing distance** and specify if relevant ("readable from 20 feet")
- For packaging, specify if it's a **wrap** (360°) or **flat label**
- Combine with standard prompt elements (lighting, style, color) for best results

---

## Key Principles

### 1. Specificity Over Generality

- ❌ `a photo of a woman`
- ✅ `extreme closeup portrait, French woman, black hair, green eyes, 35mm film, global illumination`

### 2. Photography Elements Create Realism

Simply adding a camera and lens transforms AI-looking output into photorealistic results:

- ❌ `African wild dogs, wilderness, hunt` → looks artificial
- ✅ `African wild dogs, wilderness, intense hunt, Sony A9 II, 85mm f/1.8 GM lens` → photorealistic

### 3. Context-Aware Equipment Selection

Match camera/lens choices to the scenario:

- **Portraits**: Leica M10-R + 50mm f/2 ASPH (sharp, dreamy)
- **Wildlife**: Sony A9 II + 200mm telephoto (fast, sharp)
- **Street**: Fujifilm X-T4 + 35mm (candid, organic)
- **Landscape**: Hasselblad H6D + wide angle (ultra-resolution)
- **Action**: GoPro HERO (extreme angles, immersive)
- **Vintage**: Polaroid SX-70 (artistic, nostalgic)

### 4. Film Stock Sets the Aesthetic

- **Natural/Balanced**: Fujifilm Provia
- **Warm Portraits**: Kodak Portra
- **High Contrast B&W**: Kodak Tri-X 400
- **Cinematic Night**: Cinestill 800T
- **Vivid Landscape**: Fuji Velvia 50
- **Vintage Feel**: AgfaPhoto Vista
- **Surreal**: LomoChrome Purple

### 5. Iterate, Don't Start Over

Small tweaks to lighting, camera angle, or color often produce better results than rewriting the entire prompt. Change one element at a time.
