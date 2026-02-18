---
name: voice-clone
description: Clone voices from audio samples via MiniMax Voice Cloning on Replicate.
user-invocable: false
homepage: https://replicate.com/minimax/voice-cloning
metadata:
  {
    "openclaw":
      {
        "emoji": "🎭",
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

# MiniMax Voice Cloning

Clone a voice from an audio sample to use with `minimax-voice` for TTS.

Clone a voice

```bash
uv run {baseDir}/scripts/clone_voice.py --audio sample.wav --name "Brand Voice"
```

Clone + generate demo

```bash
uv run {baseDir}/scripts/clone_voice.py --audio recording.mp3 --name "My Voice" --text "Testing my cloned voice"
```

Then use the cloned voice with minimax-voice

```bash
uv run {baseDir}/../minimax-voice/scripts/generate_speech.py --text "Hello" --filename "out.mp3" --voice CLONED_VOICE_ID
```

API token

- `REPLICATE_API_TOKEN` env var (same as minimax-voice)
- Or set `skills."voice-clone".apiKey` / `skills."voice-clone".env.REPLICATE_API_TOKEN` in `~/.openclaw/openclaw.json`

Parameters

| Flag       | Options   | Default                       | Notes                          |
| ---------- | --------- | ----------------------------- | ------------------------------ |
| `--audio`  | file path | (required)                    | WAV, MP3, M4A, or FLAC         |
| `--name`   | text      | (required)                    | Label for the cloned voice     |
| `--text`   | text      | —                             | Optional demo text to generate |
| `--output` | file path | `/tmp/voice-clone-demo-*.mp3` | Demo output path               |

Audio requirements

| Requirement      | Details                                    |
| ---------------- | ------------------------------------------ |
| Minimum duration | 5 seconds                                  |
| Recommended      | 10-30 seconds                              |
| Best quality     | 20-30 seconds                              |
| Format           | WAV (best), MP3, M4A, FLAC                 |
| Content          | Clear speech, single speaker               |
| Avoid            | Background noise, music, multiple speakers |

Workflow

1. Obtain a clean audio sample of the target voice (with consent)
2. Run `clone_voice.py` — returns a `voice_id`
3. Store the `voice_id` in the project's `MEDIA-CONFIG.md` under Characters
4. Use the `voice_id` with `minimax-voice` for all future TTS with that voice

Notes

- Voice IDs are persistent — clone once, use many times.
- Processing time: 30-180 seconds depending on audio length.
- Always obtain consent before cloning a voice.
- Cloned voices work with both HD and Turbo MiniMax models.
- The voice ID is tied to the Replicate/MiniMax account.
