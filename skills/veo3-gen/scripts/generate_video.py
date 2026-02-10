#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "google-genai>=1.0.0",
# ]
# ///
"""
Generate videos using Google's Veo 3.1 API.

Usage:
    uv run generate_video.py --prompt "your video description" --filename "output.mp4"
    uv run generate_video.py --prompt "description" --filename "out.mp4" --aspect 9:16 --resolution 1080p
    uv run generate_video.py --prompt "description" --filename "out.mp4" -i reference.png

Image-to-video:
    uv run generate_video.py --prompt "animate this scene" --filename "out.mp4" -i first_frame.png

Options:
    --aspect     16:9 (default) or 9:16
    --resolution 720p (default), 1080p, or 4k
    --duration   4, 6, or 8 seconds (default: 8)
    --negative   Negative prompt (what to avoid)
    --seed       Seed for slight reproducibility
    --person     Person generation policy: allow_all (default) or allow_adult
    --model      Model variant: veo-3.1-generate-preview (default) or veo-3.1-fast-generate-preview
"""

import argparse
import os
import sys
import time
from pathlib import Path


def get_api_key(provided_key: str | None) -> str | None:
    """Get API key from argument first, then environment."""
    if provided_key:
        return provided_key
    return os.environ.get("GEMINI_API_KEY")


def main():
    parser = argparse.ArgumentParser(
        description="Generate videos using Veo 3.1 (Google Gemini API)"
    )
    parser.add_argument(
        "--prompt", "-p",
        required=True,
        help="Video description/prompt"
    )
    parser.add_argument(
        "--filename", "-f",
        required=True,
        help="Output filename (e.g., scene-001.mp4)"
    )
    parser.add_argument(
        "--input-image", "-i",
        dest="input_image",
        metavar="IMAGE",
        help="Input image path for image-to-video generation"
    )
    parser.add_argument(
        "--aspect", "-a",
        choices=["16:9", "9:16"],
        default="16:9",
        help="Aspect ratio: 16:9 (landscape, default) or 9:16 (portrait)"
    )
    parser.add_argument(
        "--resolution", "-r",
        choices=["720p", "1080p", "4k"],
        default="720p",
        help="Output resolution: 720p (default), 1080p, or 4k"
    )
    parser.add_argument(
        "--duration", "-d",
        choices=["4", "6", "8"],
        default="8",
        help="Duration in seconds: 4, 6, or 8 (default: 8)"
    )
    parser.add_argument(
        "--negative", "-n",
        dest="negative_prompt",
        help="Negative prompt — what to avoid in the video"
    )
    parser.add_argument(
        "--seed", "-s",
        type=int,
        help="Seed for slight reproducibility (not guaranteed deterministic)"
    )
    parser.add_argument(
        "--person",
        choices=["allow_all", "allow_adult"],
        default="allow_all",
        help="Person generation policy (default: allow_all)"
    )
    parser.add_argument(
        "--model", "-m",
        choices=["veo-3.1-generate-preview", "veo-3.1-fast-generate-preview"],
        default="veo-3.1-generate-preview",
        help="Model variant (default: veo-3.1-generate-preview)"
    )
    parser.add_argument(
        "--api-key", "-k",
        help="Gemini API key (overrides GEMINI_API_KEY env var)"
    )
    parser.add_argument(
        "--poll-interval",
        type=int,
        default=10,
        help="Polling interval in seconds (default: 10)"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=360,
        help="Max wait time in seconds (default: 360)"
    )

    args = parser.parse_args()

    # Get API key
    api_key = get_api_key(args.api_key)
    if not api_key:
        print("Error: No API key provided.", file=sys.stderr)
        print("Please either:", file=sys.stderr)
        print("  1. Provide --api-key argument", file=sys.stderr)
        print("  2. Set GEMINI_API_KEY environment variable", file=sys.stderr)
        sys.exit(1)

    # Import here after checking API key to avoid slow import on error
    from google import genai
    from google.genai import types

    # Initialise client
    client = genai.Client(api_key=api_key)

    # Set up output path
    output_path = Path(args.filename)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Build config
    # Note: allow_all is not supported for image-to-video; auto-downgrade
    person_gen = args.person
    if args.input_image and person_gen == "allow_all":
        person_gen = "allow_adult"
        print("  Note: personGeneration auto-set to allow_adult (required for image input)")

    config_kwargs = {
        "aspect_ratio": args.aspect,
        "resolution": args.resolution,
        "duration_seconds": int(args.duration),
        "person_generation": person_gen,
    }
    if args.negative_prompt:
        config_kwargs["negative_prompt"] = args.negative_prompt
    if args.seed is not None:
        config_kwargs["seed"] = args.seed

    config = types.GenerateVideosConfig(**config_kwargs)

    # Build request kwargs
    request_kwargs = {
        "model": args.model,
        "prompt": args.prompt,
        "config": config,
    }

    # Load input image if provided
    if args.input_image:
        img_path = Path(args.input_image)
        if not img_path.exists():
            print(f"Error: Input image not found: {args.input_image}", file=sys.stderr)
            sys.exit(1)

        mime_map = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
        }
        suffix = img_path.suffix.lower()
        mime_type = mime_map.get(suffix, "image/png")

        image_data = img_path.read_bytes()
        request_kwargs["image"] = types.Image(
            image_bytes=image_data,
            mime_type=mime_type,
        )
        print(f"Loaded input image: {args.input_image} ({mime_type})")

    # Generate video
    print(f"Generating video...")
    print(f"  Model: {args.model}")
    print(f"  Aspect: {args.aspect}")
    print(f"  Resolution: {args.resolution}")
    print(f"  Duration: {args.duration}s")
    if args.negative_prompt:
        print(f"  Negative: {args.negative_prompt}")
    if args.seed is not None:
        print(f"  Seed: {args.seed}")

    try:
        operation = client.models.generate_videos(**request_kwargs)

        # Poll until done
        elapsed = 0
        while not operation.done:
            if elapsed >= args.timeout:
                print(f"Error: Timed out after {args.timeout}s waiting for video generation.", file=sys.stderr)
                sys.exit(1)
            print(f"  Waiting for video generation... ({elapsed}s elapsed)")
            time.sleep(args.poll_interval)
            elapsed += args.poll_interval
            operation = client.operations.get(operation)

        # Check for errors
        if not operation.response or not operation.response.generated_videos:
            print("Error: No video was generated. The request may have been blocked by safety filters.", file=sys.stderr)
            sys.exit(1)

        # Download the generated video
        generated_video = operation.response.generated_videos[0]
        client.files.download(file=generated_video.video)
        generated_video.video.save(str(output_path))

        full_path = output_path.resolve()
        print(f"\nVideo saved: {full_path}")
        print(f"  Duration: ~{args.duration}s")
        print(f"  Resolution: {args.resolution}")
        print(f"  Aspect: {args.aspect}")
        # OpenClaw parses MEDIA tokens and will attach the file on supported providers.
        print(f"MEDIA: {full_path}")

    except Exception as e:
        error_msg = str(e)
        print(f"Error generating video: {error_msg}", file=sys.stderr)
        if "safety" in error_msg.lower() or "blocked" in error_msg.lower():
            print("Hint: The prompt may have triggered safety filters. Try adjusting the content.", file=sys.stderr)
        if "quota" in error_msg.lower() or "rate" in error_msg.lower():
            print("Hint: You may have hit rate limits. Wait a moment and try again.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
