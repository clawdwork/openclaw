# Video Prompting Fundamentals

> Platform-specific rules and techniques for Veo 3 and Sora 2 text-to-video generation.

---

## Universal Video Prompting Principles

### 1. Every Prompt is an Island

Video AI models have **zero memory** between generations. Every prompt must be completely self-contained — full character descriptions, setting details, lighting, mood. Never reference "the previous scene" or "continuing from before."

### 2. Think Like a Director

You are briefing a cinematographer. Describe:

- What the camera sees
- How the camera moves
- What the subject does
- What the environment looks like
- What the audio sounds like

### 3. Prompt Length Sweet Spot

- **Veo 3**: 100-250 words optimal (max ~400, but 200 and below show best results)
- **Sora 2**: 50-300 words (shorter = more creative liberty, longer = more control)
- Use full sentences, not keyword lists (unlike image prompts)
- Natural language helps the model connect details

### 4. No IP References

Models reject copyrighted characters, shows, movies, or real public figures. Instead, describe the character's appearance, personality, voice, and mannerisms in full detail.

---

## The Six Key Aspects of a Video Prompt

Every video prompt should address these six aspects:

### 1. Establish the Shot

Camera angle, framing, and lens choice.

```
Camera starts at ground level, angled steeply upward from a low wide shot...
```

### 2. Set the Scene

Environment, time of day, weather, atmosphere.

```
A vast, desolate plain under a stormy, overcast sky...
```

### 3. Describe the Action

What happens in the scene, beat by beat.

```
Wind stirs the dust between them. The men charge, sprinting as one, weapons raised...
```

### 4. Define Characters

Physical appearance, clothing, expression, body language.

```
A silver-haired man in his late twenties, blindfolded and expressionless, in a flowing black coat...
```

### 5. Identify Camera Movement

How the camera moves through the scene.

```
Camera cranes high to show the vast distance, then cuts low to the charging men...
```

### 6. Describe the Audio

Dialogue, music, sound effects, ambient sounds.

```
Soft ambient electronic music plays, punctuated by gentle ripples. She says: I'm not afraid of anything.
```

---

## Veo 3 Specific Rules

### Platform Details

- **Output**: 8-second clips at 720p (upscalable to 1080p)
- **Audio**: Native audio generation (dialogue, SFX, music)
- **Access**: Google Flow / Gemini Pro/Ultra subscription
- **Model selection**: Verify Veo 3 is selected (Google defaults to Veo 2)

### Dialogue Formatting

```
✅ She says: I'm not afraid of anything.
✅ He whispers: You were too slow.
✅ The narrator speaks in a deep voice: We've been watching this plank for 48 seasons.

❌ She says "I'm not afraid" (quotes trigger auto-subtitles)
❌ He says (whispering) "hello" (parentheses trigger subtitles)
❌ [She says: hello] (brackets trigger subtitles)
```

- Write dialogue inline with `Character says:` format
- Specify voice quality: `gravelly tone`, `calm and slow`, `slightly high pitch and raspy`
- For multiple speakers, clearly identify who says what
- To avoid subtitles: remove all quotation marks, brackets, parentheses

### Veo 3 Scenebuilder (Continuity)

#### Text-to-Video Continuity

1. Generate initial 8-second clip
2. Save the last frame as an asset
3. Use "Jump to" with that frame as the starting point
4. Write a new self-contained prompt describing what happens next
5. The new prompt should NOT say "continuing from" or "from previous"

#### Frames-to-Video (Veo 2 only)

- Set a start frame and end frame
- Write a prompt describing the transition between them
- Ensure frames are compatible (similar setting, lighting, composition)
- Select camera movement via the UI control

#### Ingredients-to-Video (Veo 2 only)

- Upload specific visual elements (characters, objects, environments)
- Reference each ingredient in the prompt
- Limit to 3 ingredients per scene for best results
- Avoid contradictory guidance between prompt and ingredients

### Veo 3 Best Practices

- Camera movement + mannerism + personality specs are your best friends
- Descriptive yet concise to reduce model confusion
- If multiple characters speak, specify who says each line
- Use vivid imagery and strong visual vocabulary
- Always verify Veo 3 is selected (not Veo 2) before generating
- Download immediately — videos may not be permanently stored

---

## Sora 2 Specific Rules

### API Parameters

```json
{
  "model": "sora",
  "size": "1920x1080",
  "seconds": 10
}
```

| Parameter | Options                         | Notes                       |
| --------- | ------------------------------- | --------------------------- |
| `size`    | 1920×1080, 1080×1920, 1080×1080 | Landscape, portrait, square |
| `seconds` | 5, 10, 15, 20                   | Longer = less precise       |
| `n`       | 1-4                             | Number of variations        |

### Prompt Anatomy (Sora 2)

1. **Camera framing** — angle, distance, lens
2. **Depth of field** — background treatment
3. **Action** — what subjects do (describe in "beats")
4. **Lighting** — direction, quality, color
5. **Subject details** — appearance, clothing, expression
6. **Plausible action** — physically realistic motion

### Sora 2 Tips

- **Style sets the tone**: "35mm film noir" vs "bright Instagram ad" completely changes output
- **One camera move per shot**: Don't combine pan + zoom + dolly
- **One action per beat**: "She picks up the cup, then turns" (not simultaneous)
- **3-5 colors max** for palette stability
- **Image input**: Upload a reference image as the first frame

### Sora 2 Remix Workflow

1. Generate initial video
2. Review output
3. Adjust prompt — change specific elements
4. Re-generate with refined prompt
5. Iterate until satisfied

### Sora 2 Prompt Template

```
[Camera: angle, distance, movement]
[Setting: location, time, weather]
[Subject: detailed appearance]
[Action: what happens, described in beats]
[Lighting: direction, quality, mood]
[Audio: music, SFX, dialogue]
[Style: visual aesthetic, color palette]
```

---

## Duration Strategy

| Duration              | Best For                                        | Guidance                       |
| --------------------- | ----------------------------------------------- | ------------------------------ |
| **5 sec**             | Single action, product reveal, reaction shot    | One clear beat                 |
| **8 sec** (Veo 3 max) | Short scene, dialogue exchange, action sequence | 2-3 beats max                  |
| **10 sec**            | Extended action, dialogue, establishing shot    | 3-4 beats                      |
| **15-20 sec**         | Complex scene (Sora 2 only)                     | Risk: model may lose coherence |

---

## Action in Beats

Break complex action into sequential beats. Each beat = one clear action moment.

### Example: A sword duel

```
Beat 1: Two warriors face each other across a stone courtyard.
Beat 2: They charge simultaneously, blades raised.
Beat 3: Blades clash with a shower of sparks.
Beat 4: One fighter is pushed back, skidding across stone.
```

For an 8-second Veo 3 clip, aim for 2-3 beats maximum. More beats = rushed, confused output.

---

## Camera Movement Vocabulary

| Movement           | Description                           | Use For                            |
| ------------------ | ------------------------------------- | ---------------------------------- |
| **Static**         | Camera doesn't move                   | Dialogue, tension, portrait        |
| **Slow pan**       | Horizontal rotation                   | Revealing environment              |
| **Tilt**           | Vertical rotation                     | Revealing height, scale            |
| **Dolly in/out**   | Camera moves toward/away from subject | Building/releasing tension         |
| **Tracking**       | Camera follows subject laterally      | Walking, running, chase            |
| **Crane**          | Camera rises/descends vertically      | Establishing shots, reveals        |
| **Orbit/Arc**      | Camera circles around subject         | Hero shots, dramatic reveal        |
| **Handheld/Shaky** | Deliberate instability                | Documentary, POV, urgency          |
| **Steadicam**      | Smooth following shot                 | Following characters through space |
| **Whip pan**       | Fast horizontal snap                  | Transition, surprise               |
| **Push in**        | Slow dolly toward subject             | Emotional emphasis                 |
| **Pull back**      | Slow dolly away                       | Revealing context, isolation       |

---

## Troubleshooting

| Problem                      | Cause                                | Solution                                                               |
| ---------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| **Flat lighting**            | No lighting direction specified      | Add `dramatic side lighting`, `golden hour backlight`, `chiaroscuro`   |
| **Subject out of focus**     | Subject not mentioned early enough   | Name the main subject in the first sentence                            |
| **Stiff motion**             | Over-specified poses                 | Describe actions dynamically: `lunges`, `pivots`, `sprints`            |
| **Too "clean"/digital**      | Missing texture cues                 | Add film grain, atmospheric particles: `dust motes`, `morning mist`    |
| **Subtitle artifacts**       | Quotation marks/brackets in dialogue | Use `Character says:` format with no punctuation wrappers              |
| **Wrong character speaking** | Ambiguous dialogue attribution       | Explicitly name who speaks before each line                            |
| **Incoherent transitions**   | Too many narrative shifts            | Simplify to one clear action sequence per generation                   |
| **Color inconsistency**      | No palette specified                 | Limit to 2-3 dominant colors: `deep slate grey, ocean blue, warm gold` |
| **Camera ignores subject**   | Subject buried late in prompt        | Move subject description to the first 1-2 sentences                    |
