---
name: podcast-gen
description: Generate podcast-style audio conversations from text, files, or URLs using Podcastfy.
metadata:
  {
    "openclaw":
      {
        "emoji": "🎙️",
        "requires": { "bins": ["uv"], "env": ["GEMINI_API_KEY"] },
        "primaryEnv": "GEMINI_API_KEY",
      },
  }
---

# podcast-gen

Generate engaging two-host podcast conversations from any text content using Podcastfy.

## How it works

1. **Script generation**: An LLM (Gemini Flash by default) reads the input and writes a natural two-person conversational script
2. **Text-to-speech**: The script is voiced by two distinct TTS voices
3. **Output**: A single MP3 file with the full podcast episode

## Quick start

```bash
# From text
uv run {baseDir}/scripts/generate_podcast.py --text "Your content here" --filename "./media/generated/drafts/daily-intel.mp3"

# From a markdown file
uv run {baseDir}/scripts/generate_podcast.py -f ./notes/2026-02-09.md --filename "./media/generated/drafts/daily-digest.mp3"

# From multiple files
uv run {baseDir}/scripts/generate_podcast.py -f ./notes/monday.md -f ./notes/tuesday.md --filename "./media/generated/drafts/weekly-recap.mp3"

# From a URL
uv run {baseDir}/scripts/generate_podcast.py -u "https://example.com/article" --filename "./media/generated/drafts/article-pod.mp3"

# Mixed sources
uv run {baseDir}/scripts/generate_podcast.py -f ./report.md -u "https://blog.com/post" --text "Additional context" --filename "./media/generated/drafts/mixed.mp3"
```

## Parameters

### Input sources (at least one required)

| Parameter      | Description                                 |
| -------------- | ------------------------------------------- |
| `--text`       | Raw text to convert                         |
| `--file`, `-f` | Path to text/markdown/PDF file (repeatable) |
| `--url`, `-u`  | URL to include as source (repeatable)       |

### Output

| Parameter           | Default                                | Description                          |
| ------------------- | -------------------------------------- | ------------------------------------ |
| `--filename`        | `./media/generated/drafts/podcast.mp3` | Output audio path                    |
| `--save-transcript` | —                                      | Save conversation transcript to path |
| `--transcript-only` | false                                  | Only generate transcript, skip audio |

### Podcast style

| Parameter        | Default                               | Description                     |
| ---------------- | ------------------------------------- | ------------------------------- |
| `--name`         | —                                     | Podcast name                    |
| `--tagline`      | —                                     | Podcast tagline                 |
| `--language`     | English                               | Output language (40+ supported) |
| `--style`        | `engaging,informative,conversational` | Comma-separated styles          |
| `--instructions` | —                                     | Custom focus/topic instructions |
| `--creativity`   | 0.7                                   | Temperature (0.0–1.0)           |
| `--ending`       | "Thanks for listening!"               | Closing message                 |

### TTS provider

| Parameter  | Default | Description                                                                  |
| ---------- | ------- | ---------------------------------------------------------------------------- |
| `--tts`    | `edge`  | TTS provider: `edge` (free), `openai`, `elevenlabs`, `gemini`, `geminimulti` |
| `--voice1` | auto    | Voice for host 1 (questioner)                                                |
| `--voice2` | auto    | Voice for host 2 (answerer)                                                  |

### LLM

| Parameter      | Default                  | Description               |
| -------------- | ------------------------ | ------------------------- |
| `--llm-model`  | `gemini-3-flash-preview` | LLM for script generation |
| `--gemini-key` | `GEMINI_API_KEY` env     | API key override          |

### Length

| Parameter      | Default               | Description                          |
| -------------- | --------------------- | ------------------------------------ |
| `--longform`   | false                 | Generate longer podcast (10–30+ min) |
| `--max-chunks` | 5 (short) / 15 (long) | Max discussion rounds                |

## TTS providers comparison

| Provider      | Cost           | Quality   | API Key              | Best for                       |
| ------------- | -------------- | --------- | -------------------- | ------------------------------ |
| `edge`        | **Free**       | Good      | None                 | Daily digests, quick summaries |
| `openai`      | ~$15/1M chars  | Great     | `OPENAI_API_KEY`     | Professional quality           |
| `elevenlabs`  | ~$180/1M chars | Excellent | `ELEVENLABS_API_KEY` | Premium voice customization    |
| `geminimulti` | Varies         | Excellent | `GEMINI_API_KEY`     | English, natural multi-speaker |

## Examples

### Daily intelligence digest (2–5 min, free)

```bash
uv run {baseDir}/scripts/generate_podcast.py \
  -f ~/org/shared/memory/2026-02-09.md \
  --name "Daily Intel" \
  --tagline "Your morning briefing" \
  --style "concise,professional,informative" \
  --instructions "Summarize key findings and action items" \
  --filename "./media/generated/drafts/2026-02-09-daily-intel.mp3"
```

### Weekly project recap (10+ min, longform)

```bash
uv run {baseDir}/scripts/generate_podcast.py \
  -f ~/org/shared/projects/acme/research/weekly-summary.md \
  -f ~/org/shared/memory/2026-02-09.md \
  --name "Project Pulse" \
  --longform \
  --style "analytical,engaging,thorough" \
  --instructions "Focus on progress, blockers, and decisions made this week" \
  --filename "./media/generated/drafts/2026-02-09-weekly-recap.mp3"
```

### Premium quality with OpenAI voices

```bash
uv run {baseDir}/scripts/generate_podcast.py \
  -f ./report.md \
  --tts openai \
  --voice1 echo --voice2 shimmer \
  --filename "./media/generated/drafts/premium-podcast.mp3"
```

## API keys

- `GEMINI_API_KEY` — **Required** for script generation (already configured)
- `OPENAI_API_KEY` — Only if using `--tts openai`
- `ELEVENLABS_API_KEY` — Only if using `--tts elevenlabs`
- Edge TTS (`--tts edge`) requires **no API key** at all

## Notes

- **Always use `./` relative paths** for filenames so OpenClaw can auto-attach via chat.
- The script prints a `MEDIA:` line for OpenClaw to auto-attach on supported chat providers.
- Default TTS is Edge (free) — upgrade to OpenAI or ElevenLabs for higher quality.
- Longform podcasts can take 2–5 minutes to generate depending on content length.
- Supports 40+ languages for both script and TTS.
- Do not read the audio back; report the saved path only.
