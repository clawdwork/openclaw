#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10,<3.14"
# dependencies = [
#     "replicate>=1.0.0",
# ]
# ///
"""
Clone a voice using MiniMax Voice Cloning via Replicate API.

Usage:
    uv run clone_voice.py --audio sample.wav --name "My Voice"
    uv run clone_voice.py --audio recording.mp3 --name "Brand Voice" --text "Optional demo text"

The cloned voice ID can then be used with minimax-voice for TTS:
    uv run generate_speech.py --text "Hello" --filename "out.mp3" --voice CLONED_VOICE_ID

Requirements:
    - Audio: WAV, MP3, M4A, or FLAC
    - Minimum: 5 seconds of clear speech
    - Recommended: 10-30 seconds for best quality
    - Single speaker, minimal background noise
"""

import argparse
import os
import sys
import time
from pathlib import Path


def get_api_token(provided_token: str | None) -> str | None:
    """Get API token from argument first, then environment."""
    if provided_token:
        return provided_token
    return os.environ.get("REPLICATE_API_TOKEN")


def main():
    parser = argparse.ArgumentParser(
        description="Clone a voice using MiniMax Voice Cloning (Replicate)"
    )
    parser.add_argument(
        "--audio", "-a",
        required=True,
        help="Path to audio sample (WAV, MP3, M4A, FLAC). Min 5s, recommended 10-30s."
    )
    parser.add_argument(
        "--name", "-n",
        required=True,
        help="Name for the cloned voice (for your reference)"
    )
    parser.add_argument(
        "--text", "-t",
        help="Optional demo text to generate with the cloned voice"
    )
    parser.add_argument(
        "--output", "-o",
        help="Output file for demo audio (only used with --text)"
    )
    parser.add_argument(
        "--api-token", "-k",
        help="Replicate API token (overrides REPLICATE_API_TOKEN env var)"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=300,
        help="Max wait time in seconds (default: 300)"
    )

    args = parser.parse_args()

    # Validate audio file
    audio_path = Path(args.audio)
    if not audio_path.exists():
        print(f"Error: Audio file not found: {args.audio}", file=sys.stderr)
        sys.exit(1)

    valid_exts = {".wav", ".mp3", ".m4a", ".flac"}
    if audio_path.suffix.lower() not in valid_exts:
        print(f"Error: Unsupported format {audio_path.suffix}. Use: {', '.join(valid_exts)}", file=sys.stderr)
        sys.exit(1)

    # Get API token
    api_token = get_api_token(args.api_token)
    if not api_token:
        print("Error: No API token provided.", file=sys.stderr)
        print("Please either:", file=sys.stderr)
        print("  1. Provide --api-token argument", file=sys.stderr)
        print("  2. Set REPLICATE_API_TOKEN environment variable", file=sys.stderr)
        sys.exit(1)

    # Import after token check
    import replicate

    os.environ["REPLICATE_API_TOKEN"] = api_token
    client = replicate.Client(api_token=api_token)

    file_size = audio_path.stat().st_size / 1024
    print(f"Cloning voice...")
    print(f"  Name: {args.name}")
    print(f"  Audio: {args.audio} ({file_size:.1f} KB)")

    try:
        # Upload audio file and create prediction
        with open(audio_path, "rb") as audio_file:
            prediction = client.predictions.create(
                model="minimax/voice-cloning",
                input={
                    "audio": audio_file,
                },
            )

        # Poll until done
        elapsed = 0
        poll_interval = 5
        while prediction.status in ("starting", "processing"):
            if elapsed >= args.timeout:
                print(f"Error: Timed out after {args.timeout}s.", file=sys.stderr)
                sys.exit(1)
            print(f"  Status: {prediction.status} ({elapsed}s elapsed)")
            time.sleep(poll_interval)
            elapsed += poll_interval
            prediction.reload()

        if prediction.status == "failed":
            print(f"Error: Voice cloning failed.", file=sys.stderr)
            if prediction.error:
                print(f"  Reason: {prediction.error}", file=sys.stderr)
            sys.exit(1)

        if prediction.status != "succeeded":
            print(f"Error: Unexpected status: {prediction.status}", file=sys.stderr)
            sys.exit(1)

        # Extract voice ID
        output = prediction.output
        voice_id = None
        if isinstance(output, dict):
            voice_id = output.get("voice_id")
        elif isinstance(output, str):
            voice_id = output

        if not voice_id:
            print("Error: No voice ID returned.", file=sys.stderr)
            print(f"  Raw output: {output}", file=sys.stderr)
            sys.exit(1)

        print(f"\nVoice cloned successfully!")
        print(f"  Voice Name: {args.name}")
        print(f"  Voice ID: {voice_id}")
        print(f"  Processing time: ~{elapsed}s")
        print(f"\nTo use this voice with minimax-voice:")
        print(f'  uv run .../minimax-voice/scripts/generate_speech.py --text "Hello" --filename "out.mp3" --voice {voice_id}')

        # Optionally generate demo audio
        if args.text:
            demo_output = args.output or f"/tmp/voice-clone-demo-{args.name.lower().replace(' ', '-')}.mp3"
            print(f"\nGenerating demo with cloned voice...")
            print(f"  Text: {args.text[:80]}{'...' if len(args.text) > 80 else ''}")

            demo_prediction = client.predictions.create(
                model="minimax/speech-2.6-hd",
                input={
                    "text": args.text,
                    "voice_id": voice_id,
                    "emotion": "auto",
                    "audio_format": "mp3",
                },
            )

            demo_elapsed = 0
            while demo_prediction.status in ("starting", "processing"):
                if demo_elapsed >= 60:
                    print("  Demo generation timed out, but voice ID is valid.", file=sys.stderr)
                    break
                time.sleep(3)
                demo_elapsed += 3
                demo_prediction.reload()

            if demo_prediction.status == "succeeded":
                demo_out = demo_prediction.output
                audio_url = demo_out.get("audio") if isinstance(demo_out, dict) else demo_out

                if audio_url:
                    import urllib.request
                    demo_path = Path(demo_output)
                    demo_path.parent.mkdir(parents=True, exist_ok=True)
                    urllib.request.urlretrieve(audio_url, str(demo_path))
                    full_demo = demo_path.resolve()
                    print(f"  Demo saved: {full_demo}")
                    print(f"MEDIA: {full_demo}")

    except Exception as e:
        error_msg = str(e)
        print(f"Error cloning voice: {error_msg}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
