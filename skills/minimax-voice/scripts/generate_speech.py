#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "replicate>=1.0.0",
# ]
# ///
"""
Generate speech using MiniMax Speech 2.6 HD via Replicate API.

Usage:
    uv run generate_speech.py --text "Hello world" --filename "output.mp3"
    uv run generate_speech.py --text "Narration text" --filename "out.flac" --voice Wise_Woman --emotion calm --format flac
    uv run generate_speech.py --text "Fast version" --filename "out.mp3" --model turbo

Options:
    --voice     Voice ID (default: English_expressive_narrator)
    --emotion   auto, happy, sad, angry, fearful, disgusted, surprised, calm, fluent, neutral
    --format    mp3 (default), wav, flac, pcm
    --speed     0.5-2.0 (default: 1.0)
    --pitch     -12 to 12 semitones (default: 0)
    --volume    0.1-2.0 (default: 1.0)
    --model     hd (default) or turbo
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
        description="Generate speech using MiniMax Speech 2.6 HD (Replicate)"
    )
    parser.add_argument(
        "--text", "-t",
        required=True,
        help="Text to synthesize into speech. Use <#seconds#> for pauses."
    )
    parser.add_argument(
        "--filename", "-f",
        required=True,
        help="Output filename (e.g., narration.mp3)"
    )
    parser.add_argument(
        "--voice", "-v",
        default="English_expressive_narrator",
        help="Voice ID (default: English_expressive_narrator)"
    )
    parser.add_argument(
        "--emotion", "-e",
        choices=["auto", "happy", "sad", "angry", "fearful", "disgusted",
                 "surprised", "calm", "fluent", "neutral"],
        default="auto",
        help="Emotion type (default: auto)"
    )
    parser.add_argument(
        "--format",
        choices=["mp3", "wav", "flac", "pcm"],
        default="mp3",
        dest="audio_format",
        help="Output audio format (default: mp3)"
    )
    parser.add_argument(
        "--speed", "-s",
        type=float,
        default=1.0,
        help="Speech speed 0.5-2.0 (default: 1.0)"
    )
    parser.add_argument(
        "--pitch",
        type=int,
        default=0,
        help="Pitch adjustment -12 to 12 semitones (default: 0)"
    )
    parser.add_argument(
        "--volume",
        type=float,
        default=1.0,
        help="Volume 0.1-2.0 (default: 1.0)"
    )
    parser.add_argument(
        "--sample-rate",
        type=int,
        default=32000,
        choices=[8000, 16000, 22050, 24000, 32000, 44100, 48000],
        help="Sample rate in Hz (default: 32000)"
    )
    parser.add_argument(
        "--subtitles",
        action="store_true",
        help="Generate subtitle timestamps"
    )
    parser.add_argument(
        "--model", "-m",
        choices=["hd", "turbo"],
        default="hd",
        help="Model variant: hd (default, best quality) or turbo (low latency)"
    )
    parser.add_argument(
        "--api-token", "-k",
        help="Replicate API token (overrides REPLICATE_API_TOKEN env var)"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=120,
        help="Max wait time in seconds (default: 120)"
    )

    args = parser.parse_args()

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

    # Set up output path
    output_path = Path(args.filename)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Determine model
    model_map = {
        "hd": "minimax/speech-2.6-hd",
        "turbo": "minimax/speech-2.6-turbo",
    }
    model_id = model_map[args.model]

    # Build input
    input_params = {
        "text": args.text,
        "voice_id": args.voice,
        "emotion": args.emotion,
        "speed": args.speed,
        "pitch": args.pitch,
        "volume": args.volume,
        "audio_format": args.audio_format,
        "sample_rate": args.sample_rate,
        "subtitle_enable": args.subtitles,
    }

    char_count = len(args.text)
    est_cost = char_count * 0.0001

    print(f"Generating speech...")
    print(f"  Model: {model_id}")
    print(f"  Voice: {args.voice}")
    print(f"  Emotion: {args.emotion}")
    print(f"  Format: {args.audio_format}")
    print(f"  Speed: {args.speed}x")
    print(f"  Text: {args.text[:80]}{'...' if len(args.text) > 80 else ''}")
    print(f"  Characters: {char_count}")
    print(f"  Est. cost: ${est_cost:.4f}")

    try:
        # Create prediction
        prediction = client.predictions.create(
            model=model_id,
            input=input_params,
        )

        # Poll until done
        elapsed = 0
        poll_interval = 3
        while prediction.status in ("starting", "processing"):
            if elapsed >= args.timeout:
                print(f"Error: Timed out after {args.timeout}s.", file=sys.stderr)
                sys.exit(1)
            print(f"  Status: {prediction.status} ({elapsed}s elapsed)")
            time.sleep(poll_interval)
            elapsed += poll_interval
            prediction.reload()

        if prediction.status == "failed":
            print(f"Error: Speech generation failed.", file=sys.stderr)
            if prediction.error:
                print(f"  Reason: {prediction.error}", file=sys.stderr)
            sys.exit(1)

        if prediction.status != "succeeded":
            print(f"Error: Unexpected status: {prediction.status}", file=sys.stderr)
            sys.exit(1)

        # Download the audio
        output = prediction.output
        audio_url = None
        if isinstance(output, dict):
            audio_url = output.get("audio")
        elif isinstance(output, str):
            audio_url = output

        if not audio_url:
            print("Error: No audio URL in response.", file=sys.stderr)
            sys.exit(1)

        print(f"  Downloading audio...")
        import urllib.request
        urllib.request.urlretrieve(audio_url, str(output_path))

        # Download subtitles if available
        if args.subtitles and isinstance(output, dict) and output.get("subtitles"):
            subtitle_path = output_path.with_suffix(".titles.json")
            urllib.request.urlretrieve(output["subtitles"], str(subtitle_path))
            print(f"  Subtitles saved: {subtitle_path.resolve()}")

        full_path = output_path.resolve()
        file_size = output_path.stat().st_size / 1024
        duration = output.get("duration", "unknown") if isinstance(output, dict) else "unknown"

        print(f"\nAudio saved: {full_path}")
        print(f"  Size: {file_size:.1f} KB")
        print(f"  Duration: ~{duration}s")
        print(f"  Format: {args.audio_format}")
        print(f"  Voice: {args.voice}")
        # OpenClaw parses MEDIA tokens and will attach the file on supported providers.
        print(f"MEDIA: {full_path}")

    except Exception as e:
        error_msg = str(e)
        print(f"Error generating speech: {error_msg}", file=sys.stderr)
        if "authentication" in error_msg.lower() or "token" in error_msg.lower():
            print("Hint: Check your REPLICATE_API_TOKEN is valid.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
