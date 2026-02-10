---
name: media-content/character-consistency
description: >
  Maintain character visual and vocal identity across multiple image and video generations.
  Use when creating recurring characters, multi-shot sequences, series content, brand characters,
  or any project requiring consistency between generations. Implements the Master Descriptor Protocol
  with Visual and Vocal Character Sheets, shot splitting, and visual anchors.
---

# Character Consistency

## Core Rule: Every Prompt is an Island

AI generation models have **zero memory** between prompts. The model does not remember what it generated 5 seconds ago.

- Every prompt must contain the **FULL** character description
- Never say "same character as before" or "the woman from the last shot"
- **Copy-paste** the exact same descriptor block into every prompt
- Any detail omitted WILL be randomized

## Master Descriptor Protocol

For every recurring character, create two descriptor sheets.

### Visual Character Sheet

```
VISUAL CHARACTER SHEET: [Character Name]
─────────────────────────────────────────
Age/Build:    [specific age range, body type, height impression]
Face:         [face shape, defining features, skin tone/texture]
Hair:         [color, length, style, texture, distinctive elements]
Eyes:         [color, shape, distinctive quality]
Expression:   [default emotional state, micro-expressions]
Wardrobe:     [specific clothing items, colors, textures, condition]
Props:        [recurring objects the character carries/wears]
Marks:        [scars, tattoos, jewelry, accessories]
Posture:      [how they carry themselves, gait, gestures]
```

### Example

```
VISUAL CHARACTER SHEET: Elena
─────────────────────────────
Age/Build:    Late twenties, athletic, medium height
Face:         Angular jaw, high cheekbones, olive skin with faint freckles across nose
Hair:         Dark auburn, shoulder-length, slightly wavy, tucked behind left ear
Eyes:         Deep green, intense, slightly narrowed
Expression:   Confident half-smile, alert and watchful
Wardrobe:     Worn leather jacket (brown, zippered), white crew-neck tee, dark jeans
Props:        Silver compass pendant on thin chain, weathered canvas messenger bag
Marks:        Small scar above right eyebrow, silver ring on left thumb
Posture:      Weight shifted to one hip, hands often in jacket pockets
```

### Vocal Character Sheet (Video Only)

```
VOCAL CHARACTER SHEET: [Character Name]
─────────────────────────────────────────
Voice quality:    [pitch, timbre, resonance]
Tone:             [emotional baseline — warm, cold, guarded, playful]
Pace:             [speaking speed — measured, rapid, deliberate]
Accent/Dialect:   [if any — be specific]
Speech patterns:  [verbal tics, sentence structure]
Volume:           [baseline loudness — soft-spoken, commanding]
```

### Example Vocal Sheet

```
VOCAL CHARACTER SHEET: Elena
─────────────────────────────
Voice quality:    Mid-range alto, slightly husky, warm resonance
Tone:             Dry, confident, occasional vulnerability underneath
Pace:             Measured, deliberate — pauses before important words
Accent:           Slight Mediterranean lilt, mostly neutral
Speech patterns:  Short declarative sentences, avoids questions
Volume:           Conversational, drops to near-whisper for emphasis
```

## Using Descriptors in Prompts

### Single Character (Image)

```
[Shot type], [PASTE FULL Visual Character Sheet],
[Action], [Environment], [Camera/Lens], [Lighting]
```

### Single Character (Video)

```
[Camera setup]. [Environment description].
[PASTE FULL Visual Character Sheet].
[Action — beat by beat].
[Camera movement].
[Audio — if dialogue, include Vocal Sheet + "says:" format].
```

### Multi-Character Scene

1. Introduce each character with their FULL Visual Sheet
2. Distinguish clearly: "the taller woman", "the man in the red jacket"
3. Attribute every dialogue line explicitly
4. Describe spatial relationships: "standing three feet apart"

### Multi-Character Dialogue Example

```
Two figures face each other in a dimly lit alley.

[Full Visual Sheet: Character A — the detective]
[Full Visual Sheet: Character B — the informant]

The detective leans against the brick wall, arms crossed. The informant
shifts nervously, glancing over his shoulder. The detective says in a
low, steady voice: You're running out of time. The informant swallows
hard and replies, voice cracking: I know things you don't.
```

## Shot Splitting for Continuity

Each shot in a multi-shot sequence must:

1. **Repeat the full character descriptor** — copy-paste, no shortcuts
2. **Repeat consistent environment details** — same setting text
3. **Repeat lighting and mood** — same time of day, same palette
4. **Vary ONLY the action and camera** — this changes between shots

### Example: 3-Shot Sequence

**Shot 1 — Establishing (Wide)**

```
Wide shot. Rain-soaked city rooftop at night, neon signs reflecting off puddles.
[Elena's full Visual Sheet]. She stands at the roof's edge, looking out.
Camera slowly pushes in from behind. Distant traffic hum, rain on concrete.
```

**Shot 2 — Mid Shot**

```
Medium shot. Same rain-soaked rooftop, neon reflections on wet concrete.
[Elena's full Visual Sheet]. She turns from the edge, pulling jacket tighter.
Expression shifts from watchful to resolved. Camera holds steady at chest height.
Rain intensifies. She says in a low, husky voice: It's time.
```

**Shot 3 — Close-Up**

```
Extreme close-up. Rain-soaked rooftop. Neon light flickers across wet surfaces.
[Elena's full Visual Sheet — face details emphasized]. Green eyes narrow.
A raindrop traces down the scar above her right eyebrow.
Camera slowly dollies in. Ambient city noise fades. Only her breathing.
```

Notice: rooftop, rain, neon, and Elena's full description repeat in every shot.

## Visual Anchors

Recurring visual elements that create thematic continuity:

| Anchor Type             | Example                                | Purpose               |
| ----------------------- | -------------------------------------- | --------------------- |
| **Color motif**         | Always wears brown leather + white tee | Character recognition |
| **Prop**                | Silver compass pendant                 | Character signature   |
| **Environment element** | Neon reflections on wet surfaces       | Scene continuity      |
| **Lighting pattern**    | Always sidelit from the left           | Visual consistency    |
| **Compositional rule**  | Character always in right third        | Style signature       |

Include anchor descriptions in every prompt:

```
...neon signs casting blue and pink reflections on rain-slicked concrete...
...her silver compass pendant catches the light...
```

## Storage

Save character sheets to the project media workspace:

```
~/org/shared/projects/{project}/media/characters/{character-name}.md
```

## Common Failures & Fixes

| Problem                   | Fix                                                                 |
| ------------------------- | ------------------------------------------------------------------- |
| Character looks different | Descriptor was shortened — use EXACT same block                     |
| Clothing changes          | Be ultra-specific: `brown leather jacket, zippered, worn at elbows` |
| Hair changes              | Specify color, length, style, texture, positioning                  |
| Environment shifts        | Use identical environment text in every prompt                      |
| Age appears to shift      | Use specific: `late twenties` not `young woman`                     |
| Props appear/disappear    | Include prop descriptions in EVERY prompt                           |

## Rules

1. **Write once, paste everywhere** — create descriptor, copy-paste verbatim
2. **Never paraphrase** — "auburn hair" ≠ "red-brown hair" to the model
3. **Version control** — if you update a descriptor, update ALL prompts
4. **Test early** — generate 2-3 test images before committing to a sequence
5. **Keep under 80 words per character** — longer descriptors dilute other elements
