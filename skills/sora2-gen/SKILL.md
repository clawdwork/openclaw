---
name: sora2-gen
description: Generate videos via OpenAI Sora 2 API (text-to-video, image-to-video, remix).
homepage: https://developers.openai.com/api/docs/guides/video-generation
metadata:
  {
    "openclaw":
      {
        "emoji": "🎥",
        "requires": { "bins": ["uv"], "env": ["OPENAI_API_KEY"] },
        "primaryEnv": "OPENAI_API_KEY",
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

# Sora 2 Video Generation

Use the bundled script to generate videos from text prompts, images, or remix existing videos.

Text-to-video

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "your video description" --filename "output.mp4"
```

Portrait video (9:16)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "description" --filename "reel.mp4" --size 720x1280
```

Square video (1:1)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "description" --filename "square.mp4" --size 1080x1080
```

Longer clip (8 or 12 seconds)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "description" --filename "long.mp4" --seconds 12
```

HD quality (Sora 2 Pro)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "description" --filename "hd.mp4" --model sora-2-pro
```

Image-to-video (animate a reference image)

```bash
uv run {baseDir}/scripts/generate_video.py --prompt "she turns and smiles" --filename "animated.mp4" -i first_frame.jpg --size 1280x720
```

Remix an existing video

```bash
uv run {baseDir}/scripts/generate_video.py --remix VIDEO_ID --prompt "shift palette to warm tones" --filename "remix.mp4"
```

API key

- `OPENAI_API_KEY` env var
- Or set `skills."sora2-gen".apiKey` / `skills."sora2-gen".env.OPENAI_API_KEY` in `~/.openclaw/openclaw.json`

Parameters

| Flag         | Options                             | Default    | Notes                            |
| ------------ | ----------------------------------- | ---------- | -------------------------------- |
| `--prompt`   | text                                | (required) | Video description                |
| `--filename` | path                                | (required) | Output .mp4 path                 |
| `--size`     | `1280x720`, `720x1280`, `1080x1080` | `1280x720` | Landscape, portrait, or square   |
| `--seconds`  | `4`, `8`, `12`                      | `4`        | Clip length                      |
| `--model`    | `sora-2`, `sora-2-pro`              | `sora-2`   | Standard or HD                   |
| `--remix`    | video ID                            | —          | Remix existing video             |
| `-i`         | image path                          | —          | Reference image for image-to-vid |

Model variants

| Model        | Quality  | Duration | Cost (est.) | Use Case                    |
| ------------ | -------- | -------- | ----------- | --------------------------- |
| `sora-2`     | Standard | 4-12s    | $0.16-0.48  | Drafts, social, A/B testing |
| `sora-2-pro` | HD       | 4-12s    | $0.48-1.44  | Production, cinematic, ads  |

Notes

- Duration supports 4, 8, or 12 seconds (longer than Veo 3.1's max of 8s).
- Audio is NOT natively generated — Sora 2 outputs silent video.
- Image input must match the target video resolution (size parameter).
- Remix preserves original structure/composition — best for single focused edits.
- **Always use `./` relative paths** for filenames so OpenClaw can auto-attach via chat (e.g., `./media/generated/drafts/2026-02-09-scene.mp4`).
- The script prints a `MEDIA:` line for OpenClaw to auto-attach on supported chat providers.
- Do not read the video back; report the saved path only.
- Latency: 2-5 minutes depending on model, duration, and API load.
- Videos include C2PA metadata and watermarks for AI content identification.
- Content restrictions: no minors in unsafe contexts, no copyrighted characters/music, no real people.
