# Generate Audio

Create speech, narration, or voiceover from text.

## Usage

```
create a voiceover for [description]
generate narration for [text]
make an audio clip saying [quote]
read this aloud: [text]
```

## Workflow

1. Determine the use case: narration, voiceover, dialogue, notification
2. **Choose TTS provider** (fallback order):
   - **Primary — ElevenLabs** (`sag`): best expressiveness, v3 audio tags, emotion control
     - Requires: `ELEVENLABS_API_KEY`
     - Check credits: if API returns 401/429 or "quota exceeded", switch to fallback
   - **Fallback — MiniMax Speech 2.6 HD** (`minimax-voice`): 300+ voices, 40+ languages, emotion presets
     - Requires: `REPLICATE_API_TOKEN`
     - Use when ElevenLabs credits are exhausted or for multilingual content
3. Select voice and emotion/style appropriate to the content
4. Generate audio with `./` relative output path
5. Save to `~/org/shared/projects/{project}/media/generated/drafts/`

## ElevenLabs (Primary)

```bash
sag -v Clawd -o ./media/generated/drafts/narration.mp3 "Your text here"
```

- Best for: expressive delivery, character voices, English content
- Audio tags: `[whispers]`, `[shouts]`, `[sings]`, `[laughs]`, `[excited]`
- Pause: `[short pause]`, `[long pause]`
- Models: `eleven_v3` (expressive), `eleven_multilingual_v2` (stable), `eleven_flash_v2_5` (fast)

## MiniMax (Fallback)

```bash
uv run {baseDir}/../minimax-voice/scripts/generate_speech.py --text "Your text" --filename "./media/generated/drafts/narration.mp3" --voice English_expressive_narrator --emotion calm
```

- Best for: multilingual (40+ languages), long narration, studio-grade quality
- Emotions: `auto`, `happy`, `sad`, `angry`, `calm`, `fluent`, `surprised`, `neutral`
- Models: `hd` (best quality), `turbo` (low latency)
- Speed/pitch/volume controls available

## Voice Cloning

For custom/branded voices, use `voice-clone` first:

```bash
uv run {baseDir}/../voice-clone/scripts/clone_voice.py --audio sample.wav --name "Brand Voice"
```

Then use the returned voice ID with `minimax-voice --voice CLONED_ID`.

## Fallback Decision Tree

```
ElevenLabs available? ──yes──▶ Use sag (primary)
        │ no / credits exhausted
        ▼
MiniMax available? ──yes──▶ Use minimax-voice (fallback)
        │ no
        ▼
Report: No TTS provider available (check API keys)
```
