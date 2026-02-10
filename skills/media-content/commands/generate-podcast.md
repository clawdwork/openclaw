# Generate Podcast

Create a podcast-style audio conversation from text, notes, files, or URLs.

## Usage

```
create a podcast from [notes/files/topic]
turn today's notes into a podcast
generate a daily intelligence briefing podcast
make a weekly recap podcast from project notes
```

## Workflow

1. Gather source content (daily notes, project files, URLs, or raw text)
2. Choose length: **short** (2–5 min default) or **longform** (10–30+ min with `--longform`)
3. Choose TTS: **Edge** (free, default) or upgrade to OpenAI/ElevenLabs
4. Generate with `podcast-gen` skill
5. Save to `~/org/shared/projects/{project}/media/generated/drafts/`

## Quick examples

### Daily intelligence digest (free, 2–5 min)

```bash
uv run {baseDir}/../podcast-gen/scripts/generate_podcast.py \
  -f ~/org/shared/memory/$(date +%Y-%m-%d).md \
  --name "Daily Intel" \
  --style "concise,professional,informative" \
  --instructions "Summarize key findings, decisions, and action items" \
  --filename "./media/generated/drafts/$(date +%Y-%m-%d)-daily-intel.mp3"
```

### From multiple files

```bash
uv run {baseDir}/../podcast-gen/scripts/generate_podcast.py \
  -f ./research/report.md -f ./notes/meeting.md \
  --name "Project Update" \
  --longform \
  --filename "./media/generated/drafts/project-update.mp3"
```

### Premium quality (OpenAI voices)

```bash
uv run {baseDir}/../podcast-gen/scripts/generate_podcast.py \
  -f ./content.md \
  --tts openai --voice1 echo --voice2 shimmer \
  --filename "./media/generated/drafts/premium-podcast.mp3"
```

## TTS selection

| Provider   | Flag                   | Cost           | When to use                 |
| ---------- | ---------------------- | -------------- | --------------------------- |
| Edge       | `--tts edge` (default) | Free           | Daily digests, internal use |
| OpenAI     | `--tts openai`         | ~$15/1M chars  | Professional, client-facing |
| ElevenLabs | `--tts elevenlabs`     | ~$180/1M chars | Premium voice customization |

## Notes

- Default LLM is Gemini Flash (uses existing `GEMINI_API_KEY`)
- Default TTS is Edge (free, no API key needed)
- Always use `./` relative paths for `--filename`
- Longform podcasts take 2–5 minutes to generate
