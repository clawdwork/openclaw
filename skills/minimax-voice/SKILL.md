---
name: minimax-voice
description: Generate studio-grade speech via MiniMax Speech 2.6 HD/Turbo on Replicate.
user-invocable: false
homepage: https://replicate.com/minimax/speech-2.6-hd
metadata:
  {
    "openclaw":
      {
        "emoji": "🎙️",
        "requires": { "bins": ["uv"], "env": ["REPLICATE_API_TOKEN"] },
        "primaryEnv": "REPLICATE_API_TOKEN",
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

# MiniMax Speech 2.6 HD (Text-to-Speech)

Use the bundled script to generate studio-grade speech from text.

Basic TTS

```bash
uv run {baseDir}/scripts/generate_speech.py --text "Hello, welcome to the demo." --filename "greeting.mp3"
```

Custom voice + emotion

```bash
uv run {baseDir}/scripts/generate_speech.py --text "This is exciting news!" --filename "excited.mp3" --voice Wise_Woman --emotion happy
```

High-fidelity FLAC

```bash
uv run {baseDir}/scripts/generate_speech.py --text "Narration text" --filename "narration.flac" --format flac --sample-rate 48000
```

With subtitles

```bash
uv run {baseDir}/scripts/generate_speech.py --text "Sentence one. Sentence two." --filename "captioned.mp3" --subtitles
```

Turbo (low latency)

```bash
uv run {baseDir}/scripts/generate_speech.py --text "Quick response" --filename "fast.mp3" --model turbo
```

Slow + low pitch (dramatic)

```bash
uv run {baseDir}/scripts/generate_speech.py --text "In the beginning..." --filename "dramatic.mp3" --speed 0.8 --pitch -3 --emotion calm
```

With cloned voice (see voice-clone skill)

```bash
uv run {baseDir}/scripts/generate_speech.py --text "Using my cloned voice" --filename "clone.mp3" --voice YOUR_CLONED_VOICE_ID
```

API token

- `REPLICATE_API_TOKEN` env var
- Or set `skills."minimax-voice".apiKey` / `skills."minimax-voice".env.REPLICATE_API_TOKEN` in `~/.openclaw/openclaw.json`

Parameters

| Flag            | Options                     | Default                       | Notes                                            |
| --------------- | --------------------------- | ----------------------------- | ------------------------------------------------ |
| `--text`        | text                        | (required)                    | Text to synthesize. Use `<#seconds#>` for pauses |
| `--filename`    | path                        | (required)                    | Output file path                                 |
| `--voice`       | voice ID                    | `English_expressive_narrator` | 300+ built-in + cloned voices                    |
| `--emotion`     | see below                   | `auto`                        | Emotion control                                  |
| `--format`      | `mp3`, `wav`, `flac`, `pcm` | `mp3`                         | Audio format                                     |
| `--speed`       | 0.5-2.0                     | `1.0`                         | Speech rate                                      |
| `--pitch`       | -12 to 12                   | `0`                           | Semitone adjustment                              |
| `--volume`      | 0.1-2.0                     | `1.0`                         | Volume multiplier                                |
| `--sample-rate` | 8000-48000                  | `32000`                       | Sample rate (Hz)                                 |
| `--subtitles`   | flag                        | off                           | Generate .titles.json                            |
| `--model`       | `hd`, `turbo`               | `hd`                          | Quality vs speed                                 |

Emotions

| Emotion     | Use For                                  |
| ----------- | ---------------------------------------- |
| `auto`      | Let model match tone to script (default) |
| `happy`     | Upbeat, joyful                           |
| `sad`       | Melancholic, subdued                     |
| `angry`     | Forceful, intense                        |
| `fearful`   | Anxious, worried                         |
| `disgusted` | Disapproving                             |
| `surprised` | Astonished                               |
| `calm`      | Relaxed, soothing — great for narration  |
| `fluent`    | Smooth, flowing                          |
| `neutral`   | Balanced, matter-of-fact                 |

Model variants

| Model | ID                         | Quality      | Latency | Cost            |
| ----- | -------------------------- | ------------ | ------- | --------------- |
| HD    | `minimax/speech-2.6-hd`    | Studio-grade | 2-45s   | $0.10/1K tokens |
| Turbo | `minimax/speech-2.6-turbo` | High         | <2s     | $0.06/1K tokens |

Popular voices

- `English_expressive_narrator` — versatile narrator
- `Wise_Woman` — warm, authoritative female
- `Professional_Male` — corporate/business
- Custom cloned voices (use `voice-clone` skill first)

Notes

- **Always use `./` relative paths** for filenames so OpenClaw can auto-attach via chat (e.g., `./media/generated/drafts/2026-02-09-narration.mp3`).
- The script prints a `MEDIA:` line for OpenClaw to auto-attach on supported chat providers.
- Do not read the audio back; report the saved path only.
- Pause syntax: `<#1.5#>` inserts a 1.5-second pause.
- Output URLs from Replicate expire in 24 hours — the script downloads immediately.
- 40+ languages supported — set `--voice` to a multilingual voice ID.
- Cost estimate: ~$0.0001 per character ($0.10 per 1K tokens).
