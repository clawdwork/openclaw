---
name: veo3-gen
description: Generate videos via Google Veo 3.1 API (text-to-video and image-to-video).
user-invocable: false
homepage: https://ai.google.dev/gemini-api/docs/video
metadata:
  {
    "openclaw":
      {
        "emoji": "🎬",
        "requires": { "bins": ["uv"], "env": ["GEMINI_API_KEY"] },
        "primaryEnv": "GEMINI_API_KEY",
        "install":
          [
            {
              "id": "uv-brew",
              "kind": "brew",
              "formula": "uv",
              "bins": ["uv"],
              "label": "Install uv (brew)",
            },
          ],
      },
  }
---

# Veo 3.1 Video Generation

Use the bundled script to generate videos from text prompts or images.

Text-to-video

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "your video description" --filename "output.mp4"
```

Portrait video (9:16)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "description" --filename "reel.mp4" --aspect 9:16
```

High resolution (1080p / 4K)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "description" --filename "hd.mp4" --resolution 1080p
uv run {baseDir}/scripts/generate_video.py --prompt "description" --filename "uhd.mp4" --resolution 4k
```

Image-to-video (animate a still image)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "animate this scene" --filename "animated.mp4" -i first_frame.png
```

Short clip (4 seconds)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "quick action" --filename "short.mp4" --duration 4
```

With negative prompt

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "description" --filename "out.mp4" --negative "blurry, low quality, text overlay"
```

Fast model (lower quality, faster generation)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "description" --filename "fast.mp4" --model veo-3.1-fast-generate-preview
```

API key

- `GEMINI_API_KEY` env var
- Or set `skills."veo3-gen".apiKey` / `skills."veo3-gen".env.GEMINI_API_KEY` in `~/.openclaw/openclaw.json`

Parameters

| Flag           | Options                    | Default                    | Notes                          |
| -------------- | -------------------------- | -------------------------- | ------------------------------ |
| `--prompt`     | text                       | (required)                 | Video description              |
| `--filename`   | path                       | (required)                 | Output .mp4 path               |
| `--aspect`     | `16:9`, `9:16`             | `16:9`                     | Landscape or portrait          |
| `--resolution` | `720p`, `1080p`, `4k`      | `720p`                     | Output resolution              |
| `--duration`   | `4`, `6`, `8`              | `8`                        | Clip length in seconds         |
| `--negative`   | text                       | —                          | What to avoid                  |
| `--seed`       | integer                    | —                          | Slight reproducibility         |
| `--person`     | `allow_all`, `allow_adult` | `allow_all`                | Person generation policy       |
| `--model`      | see below                  | `veo-3.1-generate-preview` | Model variant                  |
| `-i`           | image path                 | —                          | First frame for image-to-video |

Model variants

| Model                           | Speed    | Quality | Use Case                    |
| ------------------------------- | -------- | ------- | --------------------------- |
| `veo-3.1-generate-preview`      | ~30-120s | Highest | Production, cinematic       |
| `veo-3.1-fast-generate-preview` | ~11-60s  | High    | Drafts, A/B testing, social |

Notes

- Duration is always 4, 6, or 8 seconds (Veo 3.1 limit).
- Audio is natively generated — describe sounds, music, and dialogue in the prompt.
- Dialogue format: use natural speech in the prompt (e.g., "A man says: Hello there").
- **Always use `./` relative paths** for filenames so OpenClaw can auto-attach via chat (e.g., `./media/generated/drafts/2026-02-09-scene.mp4`).
- The script prints a `MEDIA:` line for OpenClaw to auto-attach on supported chat providers.
- Do not read the video back; report the saved path only.
- Videos are stored on Google servers for 2 days — download promptly.
- Latency: 11 seconds to 6 minutes depending on complexity and load.
- Generated videos are watermarked with SynthID.
