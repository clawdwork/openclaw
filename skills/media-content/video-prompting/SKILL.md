---
name: media-content/video-prompting
description: >
  Craft optimized video generation prompts for Veo 3, Sora 2, and other text-to-video models.
  Use when creating video clips, motion content, commercials, reels, shorts, animated sequences,
  or any moving visual asset. Handles dialogue formatting, duration strategy, action-in-beats,
  camera movement, and multi-shot continuity planning.
---

# Video Prompting

## Core Workflow

1. **Determine platform** — Veo 3 vs Sora 2, constraints and capabilities
2. **Apply Six Key Aspects** — Shot, Scene, Action, Characters, Camera, Audio
3. **Structure action in beats** — 2-3 per 8-sec clip max
4. **Format dialogue** per platform rules
5. **Plan duration** — match content complexity to clip length
6. **Execute** via appropriate execution skill (future: `veo3-gen`, `sora2-gen`)
7. **For multi-shot**: plan continuity with repeated descriptors (see `character-consistency` skill)

## Universal Principles

### Every Prompt is an Island

Video AI has **zero memory** between generations. Every prompt must be fully self-contained — full character descriptions, settings, lighting. Never say "same as before" or "continuing from."

### Think Like a Director

Brief a cinematographer: what the camera sees, how it moves, what subjects do, what the environment looks like, what is heard.

### Prompt Length

- **Veo 3**: 100-250 words optimal (200 and below best)
- **Sora 2**: 50-300 words (shorter = more creative liberty)
- Use **full sentences**, not keyword lists (unlike image prompts)

### No IP References

Models reject copyrighted characters, shows, movies, real public figures. Describe appearance, personality, voice in full detail instead.

## The Six Key Aspects

Every video prompt should address all six:

### 1. Establish the Shot

```
Camera starts at ground level, angled steeply upward from a low wide shot...
```

### 2. Set the Scene

```
A vast, desolate plain under a stormy, overcast sky...
```

### 3. Describe the Action

```
Wind stirs the dust between them. The men charge, sprinting as one, weapons raised...
```

### 4. Define Characters

```
A silver-haired man in his late twenties, blindfolded, in a flowing black coat...
```

### 5. Identify Camera Movement

```
Camera cranes high to show the vast distance, then cuts low to the charging men...
```

### 6. Describe the Audio

```
Soft ambient electronic music plays, punctuated by gentle ripples. She says: I'm not afraid.
```

## Duration Strategy

| Duration                    | Best For                                | Max Beats |
| --------------------------- | --------------------------------------- | --------- |
| **5 sec**                   | Single action, product reveal, reaction | 1         |
| **8 sec** (Veo 3 max)       | Short scene, dialogue, action sequence  | 2-3       |
| **10 sec**                  | Extended action, dialogue, establishing | 3-4       |
| **15-20 sec** (Sora 2 only) | Complex scene — risk of coherence loss  | 4-5       |

## Action in Beats

Break complex action into sequential beats. One clear action per beat.

```
Beat 1: Two warriors face each other across a stone courtyard.
Beat 2: They charge simultaneously, blades raised.
Beat 3: Blades clash with a shower of sparks.
```

For 8-sec clips: **2-3 beats maximum**. More = rushed, confused output.

## Camera Movement Vocabulary

| Movement         | Use For                        |
| ---------------- | ------------------------------ |
| **Static**       | Dialogue, tension, portrait    |
| **Slow pan**     | Revealing environment          |
| **Tilt**         | Revealing height, scale        |
| **Dolly in/out** | Building/releasing tension     |
| **Tracking**     | Following subject laterally    |
| **Crane**        | Establishing shots, reveals    |
| **Orbit/Arc**    | Hero shots, dramatic reveal    |
| **Handheld**     | Documentary, POV, urgency      |
| **Steadicam**    | Smooth following through space |
| **Whip pan**     | Transition, surprise           |
| **Push in**      | Emotional emphasis             |
| **Pull back**    | Revealing context, isolation   |

**Rule: One camera move per shot.** Don't combine pan + zoom + dolly.

## Platform-Specific Rules

For detailed platform rules, read the references:

- **Veo 3**: `references/veo3-rules.md` — Scenebuilder continuity, dialogue format, 200-word limit
- **Sora 2**: `references/sora2-rules.md` — API params, remix workflow, image input

### Quick Reference: Veo 3 Dialogue

```
✅ She says: I'm not afraid of anything.
✅ He whispers in a gravelly tone: You were too slow.

❌ She says "I'm not afraid" (quotes trigger subtitles)
❌ [He says: hello] (brackets trigger subtitles)
```

### Quick Reference: Sora 2 Params

```json
{ "model": "sora", "size": "1920x1080", "seconds": 10 }
```

Sizes: 1920×1080, 1080×1920, 1080×1080. Duration: 5, 10, 15, 20 sec.

## Video Prompt Template

```
[Camera: angle, distance, movement]
[Setting: location, time, weather]
[Subject: detailed appearance]
[Action: what happens, described in beats]
[Lighting: direction, quality, mood]
[Audio: music, SFX, dialogue]
[Style: visual aesthetic, color palette (2-3 colors)]
```

## Troubleshooting

| Problem                  | Solution                                                             |
| ------------------------ | -------------------------------------------------------------------- |
| Flat lighting            | Add `dramatic side lighting`, `golden hour backlight`, `chiaroscuro` |
| Subject out of focus     | Name subject in first sentence                                       |
| Stiff motion             | Use dynamic verbs: `lunges`, `pivots`, `sprints`                     |
| Too "clean"/digital      | Add `film grain`, `dust motes`, `morning mist`                       |
| Subtitle artifacts       | Use `says:` format, no quotes/brackets                               |
| Color inconsistency      | Limit to 2-3 dominant colors                                         |
| Wrong character speaking | Explicitly name who speaks before each line                          |
| Incoherent transitions   | Simplify to one clear action sequence per generation                 |
| Camera ignores subject   | Move subject description to first 1-2 sentences                      |

## Image-to-Video Workflow

For maximum control over the first frame, generate a still image first, then animate it:

1. Craft an image prompt using `media-content/image-prompting/SKILL.md`
2. Generate via `nano-banana-pro`: `uv run .../generate_image.py --prompt "..." --filename "frame.png" --resolution 2K`
3. Get user approval on the still frame
4. Craft a video prompt describing the motion, camera, and audio
5. Feed the approved image to the video model:
   - **Veo 3.1**: `uv run .../veo3-gen/scripts/generate_video.py --prompt "motion description" --filename "out.mp4" -i frame.png --person allow_adult`
   - **Sora 2**: `uv run .../sora2-gen/scripts/generate_video.py --prompt "motion description" --filename "out.mp4" -i frame.png --size 1280x720`

This workflow is ideal for: brand assets, character introductions, product reveals, hero shots.

## Key Rules

1. **Self-contained** — every prompt has ALL information, no references to "previous"
2. **One action per beat** — sequential, not simultaneous
3. **One camera move per shot** — simple, clear
4. **3-5 colors max** for palette stability
5. **Subject first** — name the main subject early
6. **Audio matters** — always specify music, SFX, or dialogue
