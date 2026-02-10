# Sora 2 Platform Rules

## API Parameters

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

## Prompt Anatomy

1. **Camera framing** — angle, distance, lens
2. **Depth of field** — background treatment
3. **Action** — what subjects do (in "beats")
4. **Lighting** — direction, quality, color
5. **Subject details** — appearance, clothing, expression
6. **Plausible action** — physically realistic motion

## Style Sets the Tone

The style declaration completely changes output:

- `35mm film noir` → dark, contrasty, moody
- `bright Instagram ad` → clean, colorful, modern
- `hand-drawn animation` → illustrated, loose
- `documentary footage` → natural, handheld, authentic

## Motion & Timing

- Describe actions in **beats** (sequential moments)
- Keep camera moves and subject actions **simple and singular** per shot
- One camera move per shot: don't combine pan + zoom + dolly
- One action per beat: "She picks up the cup, then turns" (not simultaneous)

## Lighting & Color

- **3-5 colors max** for palette stability
- Name specific tones: `deep slate grey, ocean blue, warm gold`
- Specify light direction: `warm sidelight from the left`
- Mention time of day for natural consistency

## Image Input

- Upload a reference image as the **first frame**
- The model extends the scene from that starting point
- Ensure the reference image matches the prompt's described setting
- Use `--reference-image` flag when available

## Remix Workflow

1. Generate initial video
2. Review output — note what works and what doesn't
3. Adjust specific elements in the prompt
4. Re-generate with refined prompt
5. Iterate until satisfied

This is the recommended workflow for production use — rarely does the first generation nail everything.

## Prompt Template

```
[Camera: angle, distance, movement]
[Setting: location, time, weather]
[Subject: detailed appearance]
[Action: what happens, described in beats]
[Lighting: direction, quality, mood]
[Audio: music, SFX, dialogue]
[Style: visual aesthetic, color palette]
```

## Duration Strategy

| Duration | Best For                                | Risk                                  |
| -------- | --------------------------------------- | ------------------------------------- |
| 5 sec    | Product reveal, reaction, single action | Low                                   |
| 10 sec   | Dialogue, action sequence, establishing | Low                                   |
| 15 sec   | Multi-beat scene, complex choreography  | Medium — may lose coherence           |
| 20 sec   | Extended narrative                      | High — model struggles with long form |

## Tips

- Short prompts give Sora more creative freedom (good for exploration)
- Detailed prompts give more control (good for production)
- Visual cues steer the look more than verbal descriptions
- Clear framing instructions prevent random camera behavior
- Describe what IS in the scene, not what ISN'T
