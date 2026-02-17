# System Prompt Persona Patterns

> Architecture patterns distilled from 5 existing creative personas (creative-director, inspiration, photorealism, technical, video-director). These patterns inform how the media-content agent's system prompt should be structured.

---

## Persona Architecture

Each persona is a TypeScript export with this structure:

```typescript
export const personaName: PersonaPrompt = {
  id: "persona-id",
  name: "Display Name",
  description: "One-line description of the persona's role",
  icon: "emoji",
  image: `system prompt for image generation mode`,
  video: `system prompt for video generation mode`,
};
```

- **Separate image/video prompts** allow mode-specific instructions
- Some personas use a **unified prompt** (same for both modes) when the approach is identical
- The `PersonaPrompt` type is imported from a shared `../types` module

---

## Chain-of-Thought Reasoning Pattern

All personas use a structured reasoning framework with `<thinking>` blocks:

```
When given a request, ALWAYS use this process:

<thinking>
OBSERVE: [analyze what was provided — reference media, user intent, context]
REASON: [determine the best approach — equipment, settings, technique]
ACT: [craft the specific prompt or response]
</thinking>

Then provide the final output.
```

This forces the model to analyze before generating, producing higher-quality, more contextual prompts.

---

## Reference Media Analysis Protocol

When a user provides a reference image/video, personas follow a structured extraction:

### For Images

```
OBSERVE the reference:
1. Subject identification (who/what, position, expression, wardrobe)
2. Technical analysis (apparent camera, lens, focal length, aperture)
3. Lighting (direction, quality, color temperature, ratios)
4. Composition (rule of thirds, leading lines, framing, balance)
5. Color (palette, grading, saturation, contrast)
6. Mood/Atmosphere (emotional tone, energy level)
7. Environment (setting, depth, background treatment)
```

### For Videos

```
OBSERVE the reference:
Visual Analysis:
1. Opening frame composition and establishing elements
2. Subject motion patterns and pacing
3. Camera movement type and speed
4. Lighting changes through the clip
5. Color palette and any grading shifts
6. Scene transitions or cuts

Audio Analysis:
1. Dialogue (if any) — content, delivery, voice quality
2. Music — genre, tempo, instrumentation
3. Sound effects — ambient, foley, designed
4. Audio-visual sync points
```

---

## Five Persona Specializations

### 1. Creative Director

**Core function**: Visual storytelling + character consistency

**Key capabilities**:

- Master Descriptor Protocol (Visual + Vocal character sheets)
- "Every Prompt is an Island" enforcement
- Shot splitting for multi-shot sequences
- Visual anchor identification and maintenance
- Multi-character scene orchestration

**Reasoning focus**: How to maintain visual coherence across a series of generations

**Output style**: Complete prompt sequences with character descriptors embedded, shot-by-shot breakdowns

### 2. Inspiration (Creative Catalyst)

**Core function**: Expand creative possibilities, push boundaries

**Key capabilities**:

- Generate 3+ radically different directions from any starting point
- Style mashup combinations (e.g., "Studio Ghibli meets Blade Runner")
- Commercial ad style suggestions per genre
- Trending aesthetic identification
- Random combination generator for unexpected ideas

**Reasoning focus**: What unexpected directions could this take? What hasn't been tried?

**Output style**: Multiple options with brief rationale for each, encouraging experimentation

**Unique rule**: Always provide at least 3 radically different options — never just one approach

### 3. Photorealism Master

**Core function**: Technical precision for photorealistic output

**Key capabilities**:

- Context-aware camera/lens matching (scenario → equipment)
- Film stock selection based on desired aesthetic
- Prompt formula application (photorealistic, character-focused, cinematic, etc.)
- Extensive equipment databases organized by shooting scenario
- Troubleshooting guide for common photorealism failures

**Reasoning focus**: What real camera/lens/settings would a photographer use for this exact scenario?

**Output style**: Technically precise prompts with specific equipment, settings, and lighting setups

**Unique databases**:

- Camera databases by scenario (aerial, cinematic, street, portrait, action, landscape, underwater, low-light)
- Lens guide with focal length recommendations
- Film stock library with aesthetic descriptions
- Lighting reference by pattern and quality

### 4. Technical Cinematographer

**Core function**: Diagnose and fix prompt issues with technical precision

**Key capabilities**:

- **Describe**: Analyze reference media and extract technical specifications
- **Diagnose**: Identify why a prompt produced unwanted results
- **Specify**: Provide exact technical language for desired effects

**Reasoning focus**: What specific technical parameter needs to change to fix this issue?

**Output style**: Diagnostic format — problem → cause → specific fix with technical parameters

**Troubleshooting expertise**:
| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| Flat lighting | Missing direction/quality spec | Add specific lighting pattern + ratio |
| Subject blur | Aperture/shutter mismatch | Specify DoF + motion freeze settings |
| Digital look | No film stock/grain specified | Add film stock + grain texture |
| Color cast | White balance unspecified | Add color temperature + grading |
| Wrong perspective | Lens choice inappropriate | Match focal length to desired compression |
| Stiff motion (video) | Over-specified static poses | Use dynamic action verbs, describe momentum |

### 5. Video Director

**Core function**: Video-specific prompt structuring

**Key capabilities**:

- Six Key Aspects framework (Shot, Scene, Action, Characters, Camera, Audio)
- Duration strategy (matching content complexity to clip length)
- Action-in-beats methodology
- Platform-specific rules (Veo 3, Sora 2, LTX, Runway, Pika)
- Dialogue formatting per platform

**Reasoning focus**: How to structure 8 seconds of coherent video from a text description

**Output style**: Structured video prompts following the Six Key Aspects template

**Video prompt template**:

```
[SHOT]: Camera angle, distance, lens
[SCENE]: Environment, time, weather, atmosphere
[ACTION]: What happens, beat by beat
[CHARACTERS]: Full visual descriptors for each
[CAMERA]: Movement type, speed, transitions
[AUDIO]: Dialogue (says: format), music, SFX, ambience
```

---

## Patterns to Adopt for the Media Content Agent

### 1. Mode-Aware Prompting

The agent should detect whether the user wants an image or video and adjust its approach:

- **Image**: Keyword-style, comma-separated, technical equipment specs
- **Video**: Full sentences, narrative flow, temporal beats, audio design

### 2. Progressive Refinement

Start with the user's core idea, then layer detail:

1. Understand intent (what emotion/message/story?)
2. Select appropriate style/genre
3. Choose technical parameters (camera, lighting, palette)
4. Craft the prompt
5. Offer variations and alternatives

### 3. Always Provide Alternatives

Like the Inspiration persona — never give just one option. Offer 2-3 variations that explore different angles (literal and figurative).

### 4. Self-Contained Prompts

Every prompt the agent generates must be fully self-contained. No references to "previous" or "last" generation. Character descriptors repeated in full every time.

### 5. Platform Awareness

The agent must know which platform the prompt targets and apply platform-specific rules:

- **Gemini 3 Pro**: Image generation — model-agnostic visual vocabulary
- **Veo 3**: 8-sec video, `says:` dialogue, no quotes/brackets, 200 words optimal
- **Sora 2**: 5-20 sec video, API params, image input support, remix workflow

### 6. Structured Thinking

Use `<thinking>` blocks for complex requests to show the OBSERVE→REASON→ACT process before delivering the final prompt.

---

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
