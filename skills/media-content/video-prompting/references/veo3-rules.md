# Veo 3 Platform Rules

## Platform Details

- **Output**: 8-second clips at 720p (upscalable to 1080p)
- **Audio**: Native audio generation (dialogue, SFX, music)
- **Access**: Google Flow / Gemini Pro/Ultra subscription
- **Optimal prompt length**: 100-200 words (max ~250)
- **Model selection**: Verify Veo 3 is selected (Google defaults to Veo 2)

## Dialogue Formatting

```
✅ She says: I'm not afraid of anything.
✅ He whispers: You were too slow.
✅ The narrator speaks in a deep voice: We've been watching for 48 seasons.

❌ She says "I'm not afraid" (quotes trigger auto-subtitles)
❌ He says (whispering) "hello" (parentheses trigger subtitles)
❌ [She says: hello] (brackets trigger subtitles)
```

- Use `Character says:` format with NO punctuation wrappers
- Specify voice quality: `gravelly tone`, `calm and slow`, `slightly high pitch and raspy`
- For multiple speakers, clearly identify who says each line
- To avoid subtitles: remove all quotation marks, brackets, parentheses

## Scenebuilder (Continuity)

### Text-to-Video Continuity

1. Generate initial 8-second clip
2. Save the last frame as an asset
3. Use "Jump to" with that frame as starting point
4. Write a NEW self-contained prompt describing what happens next
5. Do NOT say "continuing from" or "from previous"

### Frames-to-Video (Veo 2 only)

- Set start frame and end frame
- Write prompt describing the transition
- Ensure frames are compatible (similar setting, lighting, composition)
- Select camera movement via UI control

### Ingredients-to-Video (Veo 2 only)

- Upload specific visual elements (characters, objects, environments)
- Reference each ingredient in the prompt
- Limit to 3 ingredients per scene
- Avoid contradictory guidance between prompt and ingredients

## The Eight Essentials

Every Veo 3 prompt should address:

1. **Scene** — one clear sentence describing action + vibe
2. **Visual style** — pick one and commit
3. **Camera movement** — stated plainly
4. **Main subject** — crystal clear, named early
5. **Background** — setting and era
6. **Lighting & mood** — specific direction
7. **Audio cue** — music, ambience, or SFX
8. **Color palette** — 2-3 dominant tones

## Best Practices

- Camera movement + mannerism + personality specs are key levers
- Descriptive yet concise to reduce confusion
- If multiple characters speak, specify who says each line
- Use vivid imagery and strong visual vocabulary
- Always verify Veo 3 is selected (not Veo 2) before generating
- Download immediately — videos may not be permanently stored

## Quick Fixes

| Problem               | Fix                                                             |
| --------------------- | --------------------------------------------------------------- |
| Unwanted subtitles    | Remove all quotes, brackets, parentheses from dialogue          |
| Flat lighting         | Add specific lighting direction: `warm sidelight from the left` |
| Character looks wrong | Add more physical detail in first sentence                      |
| Too short/rushed      | Reduce to 2 beats max per 8-second clip                         |
| Audio doesn't match   | Be explicit: `soft piano`, `city traffic hum`, `thunder rumble` |
