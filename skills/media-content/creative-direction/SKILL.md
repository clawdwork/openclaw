---
name: media-content/creative-direction
description: >
  Creative catalyst for AI media generation — sparks ideas, explores unexpected directions,
  and provides style mashups. Use when brainstorming visual concepts, seeking inspiration,
  exploring creative alternatives, generating style mashups, or when the user wants multiple
  radically different options for an image or video project. Also handles reference image
  analysis using the OBSERVE → REASON → ACT framework.
---

# Creative Direction

## Core Workflow

1. **Analyze starting point** — reference image, brief, concept, or vague idea
2. **Use structured thinking** — OBSERVE → REASON → ACT
3. **Generate minimum 3 radically different directions**
4. **For each direction**: style, mood, technical approach, example prompt
5. **If reference image provided**: extract composition, palette, equipment, mood
6. **Suggest unexpected combinations** — genre mashups, trending aesthetics
7. **Iterate based on feedback** — refine the chosen direction

## OBSERVE → REASON → ACT Framework

Use this structured thinking for every creative request:

```
<thinking>
OBSERVE: [analyze what was provided — reference media, user intent, context, constraints]
REASON: [determine the best approaches — what styles fit, what equipment, what techniques]
ACT: [craft specific prompts or present creative options]
</thinking>
```

### Reference Image Analysis (OBSERVE Phase)

When a user provides a reference image:

**For Images**:

1. Subject identification (who/what, position, expression, wardrobe)
2. Technical analysis (apparent camera, lens, focal length, aperture)
3. Lighting (direction, quality, color temperature, ratios)
4. Composition (rule of thirds, leading lines, framing, balance)
5. Color (palette, grading, saturation, contrast)
6. Mood/Atmosphere (emotional tone, energy level)
7. Environment (setting, depth, background treatment)

**For Videos**:

1. Opening frame composition and establishing elements
2. Subject motion patterns and pacing
3. Camera movement type and speed
4. Lighting changes through the clip
5. Color palette and grading shifts
6. Audio — dialogue, music, SFX, sync points

## Creative Direction Patterns

### Style Mashups

Combine unexpected genres for unique output:

- **Studio Ghibli meets Blade Runner** — soft organic forms in neon cyberpunk
- **Wes Anderson meets horror** — symmetrical, pastel, deeply unsettling
- **National Geographic meets fashion** — editorial wildlife, high-end styling
- **Vintage Polaroid meets sci-fi** — retro warmth, futuristic subjects
- **Film noir meets tropical** — high contrast shadows, lush vegetation

### Trending Aesthetics

| Aesthetic          | Visual Signature                                      |
| ------------------ | ----------------------------------------------------- |
| **Liminal spaces** | Empty, unsettling, institutional lighting, no people  |
| **Dark academia**  | Moody, rich tones, books, old architecture, tweed     |
| **Cottagecore**    | Soft light, florals, rustic, handmade, pastoral       |
| **Cyberpunk**      | Neon, rain, holographics, dense urban, night          |
| **Solarpunk**      | Green tech, organic architecture, warm light, utopian |
| **Y2K revival**    | Chrome, pastels, futuristic retro, glossy             |
| **Analog horror**  | VHS grain, surveillance footage, uncanny, distorted   |
| **Maximalism**     | Bold patterns, clashing colors, ornate, layered       |

### Mood Explorations

From any starting concept, explore emotional range:

| Mood            | Visual Translation                                         |
| --------------- | ---------------------------------------------------------- |
| **Euphoric**    | Bright, saturated, motion blur, wide angle, upward camera  |
| **Melancholic** | Muted, blue-grey, shallow DoF, soft focus, low angle       |
| **Tense**       | High contrast, tight framing, Dutch angle, deep shadows    |
| **Serene**      | Soft light, wide shot, pastel, symmetrical, static camera  |
| **Chaotic**     | Handheld, extreme angles, clashing colors, motion, noise   |
| **Nostalgic**   | Warm grain, vintage film stock, soft vignette, golden hour |

## Creative Expansion Process

### Step 1: Anchor

Identify the core concept: What is the single most important element?

### Step 2: Diverge

Generate 3+ directions that each take the concept in a radically different direction:

```
Direction A: [Genre/Style] — [One-sentence description]
  Mood: [emotional tone]
  Technical: [camera, lighting, palette]
  Example prompt: [complete prompt]

Direction B: [Genre/Style] — [One-sentence description]
  Mood: [emotional tone]
  Technical: [camera, lighting, palette]
  Example prompt: [complete prompt]

Direction C: [Genre/Style] — [One-sentence description]
  Mood: [emotional tone]
  Technical: [camera, lighting, palette]
  Example prompt: [complete prompt]
```

### Step 3: Converge

Based on user feedback, refine the chosen direction with variations:

- Lighting variant (same scene, different time of day)
- Composition variant (same scene, different camera angle)
- Color variant (same scene, different palette/film stock)

## Random Combination Generator

When the user needs pure inspiration, combine random elements:

```
[Random Photography Style] + [Random Subject] + [Random Environment] +
[Random Lighting] + [Random Film Stock] + [Random Composition]
```

This forces unexpected combinations that often produce the most original results.

## Prompt Examples

For a curated library of tested example prompts across multiple genres (action, sci-fi, comedy, drama, product, portrait, editorial, character study, viral): **read `references/prompt-examples.md`**.

## Platform Awareness

The agent must know which platform the prompt targets and apply platform-specific rules:

| Platform                 | Key Constraints                                                    |
| ------------------------ | ------------------------------------------------------------------ |
| **Gemini 3 Pro** (image) | Keyword-style, comma-separated, technical equipment specs          |
| **Veo 3** (video)        | 8-sec max, `says:` dialogue, no quotes/brackets, 200 words optimal |
| **Sora 2** (video)       | 5-20 sec, API params, image input support, remix workflow          |

Read the appropriate skill for platform rules: `video-prompting/references/veo3-rules.md` or `sora2-rules.md`.

## Technical Troubleshooting

| Issue                | Diagnosis                      | Fix                                         |
| -------------------- | ------------------------------ | ------------------------------------------- |
| Flat lighting        | Missing direction/quality spec | Add specific lighting pattern + ratio       |
| Subject blur         | Aperture/shutter mismatch      | Specify DoF + motion freeze settings        |
| Digital look         | No film stock/grain specified  | Add film stock + grain texture              |
| Color cast           | White balance unspecified      | Add color temperature + grading             |
| Wrong perspective    | Lens choice inappropriate      | Match focal length to desired compression   |
| Stiff motion (video) | Over-specified static poses    | Use dynamic action verbs, describe momentum |

## Anti-Patterns to Avoid

| Anti-Pattern                            | Why It Fails                        | Better Approach                                                 |
| --------------------------------------- | ----------------------------------- | --------------------------------------------------------------- |
| Generic prompts without technical specs | AI fills blanks randomly            | Always specify camera, lighting, palette                        |
| Referencing previous generations        | AI has no memory                    | Repeat all details in every prompt                              |
| Combining too many styles               | Confused, incoherent output         | Pick ONE style and commit                                       |
| Overly long prompts (400+ words)        | Later tokens get dropped            | Stay under 250 words, use layered approach                      |
| Using IP/brand names                    | Gets rejected or produces artifacts | Describe the aesthetic without naming the source                |
| Vague lighting ("good lighting")        | Model guesses randomly              | Specify direction, quality, time: "warm sidelight, golden hour" |
| Multiple simultaneous camera moves      | Physically impossible, confusing    | One camera move per shot                                        |
| Multiple simultaneous actions           | Model can't track parallel motion   | One action per beat, sequential                                 |

## Key Rules

1. **Never give just one option** — minimum 3 radically different directions
2. **Surprise the user** — at least one option should be unexpected
3. **Be specific** — every direction needs a complete, executable prompt
4. **Show range** — vary the mood, technical approach, and genre across options
5. **Analyze before creating** — always OBSERVE → REASON → ACT
6. **Iterate quickly** — small tweaks often beat complete rewrites
