# Character Consistency Protocol

> Master Descriptor Protocol for maintaining character identity across multiple image and video generations. Critical for multi-shot sequences, series content, and brand characters.

---

## Core Rule: Every Prompt is an Island

AI generation models have **zero memory** between prompts. The model does not remember what it generated 5 seconds ago. Therefore:

- Every prompt must contain the FULL character description
- Never say "same character as before" or "the woman from the last shot"
- Copy-paste the exact same descriptor block into every prompt where the character appears
- Any detail omitted WILL be randomized by the model

---

## Master Descriptor Protocol

For every recurring character, create two descriptor sheets that get inserted verbatim into every prompt.

### Visual Character Sheet

A complete physical description covering:

```
VISUAL CHARACTER SHEET: [Character Name]
─────────────────────────────────────────
Age/Build: [specific age range, body type, height impression]
Face: [face shape, defining features, skin tone/texture]
Hair: [color, length, style, texture, any distinctive elements]
Eyes: [color, shape, distinctive quality]
Expression: [default emotional state, micro-expressions]
Wardrobe: [specific clothing items, colors, textures, condition]
Props: [recurring objects the character carries/wears]
Distinguishing marks: [scars, tattoos, jewelry, accessories]
Posture/Movement: [how they carry themselves, gait, gestures]
```

### Example Visual Sheet

```
VISUAL CHARACTER SHEET: Elena
─────────────────────────────
Age/Build: Late twenties, athletic, medium height
Face: Angular jaw, high cheekbones, olive skin with faint freckles across nose
Hair: Dark auburn, shoulder-length, slightly wavy, usually tucked behind left ear
Eyes: Deep green, intense, slightly narrowed
Expression: Confident half-smile, alert and watchful
Wardrobe: Worn leather jacket (brown, zippered), white crew-neck tee, dark jeans
Props: Silver compass pendant on thin chain, weathered canvas messenger bag
Distinguishing marks: Small scar above right eyebrow, silver ring on left thumb
Posture: Stands with weight shifted to one hip, hands often in jacket pockets
```

### Vocal Character Sheet (Video Only)

For video generation with dialogue:

```
VOCAL CHARACTER SHEET: [Character Name]
─────────────────────────────────────────
Voice quality: [pitch, timbre, resonance]
Tone: [emotional baseline — warm, cold, guarded, playful]
Pace: [speaking speed — measured, rapid, deliberate]
Accent/Dialect: [if any — be specific]
Speech patterns: [verbal tics, favorite phrases, sentence structure]
Volume: [baseline loudness — soft-spoken, commanding, etc.]
```

### Example Vocal Sheet

```
VOCAL CHARACTER SHEET: Elena
─────────────────────────────
Voice quality: Mid-range alto, slightly husky, warm resonance
Tone: Dry, confident, occasional vulnerability underneath
Pace: Measured, deliberate — pauses before important words
Accent: Slight Mediterranean lilt, mostly neutral
Speech patterns: Short declarative sentences, avoids questions
Volume: Conversational, drops to near-whisper for emphasis
```

---

## Using Descriptors in Prompts

### Single Character Shot (Image)

```
[Shot type], [Visual Character Sheet pasted in full],
[Action], [Environment], [Camera/Lens], [Lighting]
```

### Single Character Shot (Video)

```
[Camera setup]. [Environment description].
[Visual Character Sheet pasted in full].
[Action — what happens beat by beat].
[Camera movement].
[Audio — if character speaks, include Vocal Sheet + dialogue with "says:" format].
```

### Multi-Character Scene

When multiple characters appear in the same prompt:

1. Introduce each character with their full Visual Sheet
2. Clearly distinguish them: "Character A" vs "Character B" or use descriptive labels ("the taller woman", "the man in the red jacket")
3. For dialogue, explicitly attribute every line
4. Describe spatial relationships: "standing three feet apart", "facing each other across the table"

```
Two figures face each other in a dimly lit alley.

[Full Visual Sheet: Character A — the detective]
[Full Visual Sheet: Character B — the informant]

The detective leans against the brick wall, arms crossed. The informant shifts nervously,
glancing over his shoulder. The detective says in a low, steady voice: You're running out
of time. The informant swallows hard and replies, voice cracking: I know things you don't.
```

---

## Shot Splitting for Continuity

When creating a multi-shot sequence (e.g., a short film), each shot must:

1. **Repeat the full character descriptor** — copy-paste, no shortcuts
2. **Repeat consistent environment details** — same setting description if the scene continues
3. **Repeat lighting and mood** — same time of day, same color palette
4. **Vary only the action and camera** — this is what changes between shots

### Example: 3-Shot Sequence

**Shot 1 — Establishing**

```
Wide shot. A rain-soaked city rooftop at night, neon signs reflecting off puddles.
[Elena's full Visual Sheet]. She stands at the roof's edge, looking out over the city.
Camera slowly pushes in from behind. Distant traffic hum, rain pattering on concrete.
```

**Shot 2 — Mid Shot**

```
Medium shot. The same rain-soaked rooftop, neon reflections on wet concrete.
[Elena's full Visual Sheet]. She turns from the edge, pulling her leather jacket tighter.
Her expression shifts from watchful to resolved. Camera holds steady at chest height.
Rain intensifies. She says in a low, husky voice: It's time.
```

**Shot 3 — Close-Up**

```
Extreme close-up. Rain-soaked rooftop. Neon light flickers across wet surfaces.
[Elena's full Visual Sheet — face details emphasized]. Her green eyes narrow with determination.
A single raindrop traces down the scar above her right eyebrow.
Camera slowly dollies in. Ambient city noise fades. Only the sound of her breathing.
```

Notice: The rooftop, rain, neon, and Elena's full description are repeated in every shot. Only the camera angle, action, and framing change.

---

## Visual Anchors

Visual anchors are recurring visual elements that create thematic continuity even when the AI can't literally "remember" previous shots:

### Types of Visual Anchors

| Anchor Type             | Example                                      | Purpose               |
| ----------------------- | -------------------------------------------- | --------------------- |
| **Color motif**         | Elena always wears brown leather + white tee | Character recognition |
| **Prop**                | The silver compass pendant                   | Character signature   |
| **Environment element** | Neon reflections on wet surfaces             | Scene continuity      |
| **Lighting pattern**    | Always sidelit from the left                 | Visual consistency    |
| **Compositional rule**  | Character always in the right third of frame | Style signature       |

### Using Anchors

Include the same anchor descriptions in every prompt:

```
...neon signs casting blue and pink reflections on rain-slicked concrete...
...her silver compass pendant catches the light...
...sidelit from the left, casting dramatic shadows across her face...
```

---

## Common Consistency Failures & Fixes

| Problem                                 | Cause                                   | Fix                                                                 |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| Character looks different between shots | Descriptor was shortened or paraphrased | Copy-paste the EXACT same descriptor block                          |
| Clothing changes randomly               | Wardrobe description was vague          | Be ultra-specific: `brown leather jacket, zippered, worn at elbows` |
| Hair changes between shots              | Hair description too brief              | Specify color, length, style, texture, positioning                  |
| Environment changes between shots       | Setting described differently           | Use identical environment text blocks                               |
| Mood/lighting shifts unexpectedly       | Lighting not explicitly repeated        | Include full lighting description in every prompt                   |
| Character age appears to shift          | Age description too vague               | Use specific: `late twenties` not `young woman`                     |
| Props appear/disappear                  | Props only mentioned in some prompts    | Include prop descriptions in EVERY prompt                           |

---

## Descriptor Maintenance Rules

1. **Write once, paste everywhere** — create the descriptor, then copy-paste verbatim
2. **Never paraphrase** — "auburn hair" in one prompt and "red-brown hair" in another will produce different results
3. **Version control** — if you update a descriptor, update ALL prompts that use it
4. **Test early** — generate 2-3 test images with the descriptor before committing to a full sequence
5. **Keep it under 80 words per character** — longer descriptors dilute other prompt elements
