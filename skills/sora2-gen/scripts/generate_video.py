#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "openai>=1.0.0",
# ]
# ///
"""
Generate videos using OpenAI's Sora 2 API.

Usage:
    uv run generate_video.py --prompt "your video description" --filename "output.mp4"
    uv run generate_video.py --prompt "description" --filename "out.mp4" --size 720x1280 --seconds 8
    uv run generate_video.py --prompt "animate this" --filename "out.mp4" -i reference.png

Image-to-video:
    uv run generate_video.py --prompt "she turns and smiles" --filename "out.mp4" -i first_frame.jpg --size 1280x720

Remix an existing video:
    uv run generate_video.py --remix VIDEO_ID --prompt "shift palette to warm tones" --filename "remix.mp4"

Options:
    --size       1280x720 (landscape), 720x1280 (portrait), 1080x1080 (square)
    --seconds    4 (default), 8, or 12
    --model      sora-2 (default) or sora-2-pro (HD)
    --remix      Video ID to remix (iterative editing)
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path


def get_api_key(provided_key: str | None) -> str | None:
    """Get API key from argument first, then environment."""
    if provided_key:
        return provided_key
    return os.environ.get("OPENAI_API_KEY")


async def run(args):
    from openai import AsyncOpenAI

    api_key = get_api_key(args.api_key)
    if not api_key:
        print("Error: No API key provided.", file=sys.stderr)
        print("Please either:", file=sys.stderr)
        print("  1. Provide --api-key argument", file=sys.stderr)
        print("  2. Set OPENAI_API_KEY environment variable", file=sys.stderr)
        sys.exit(1)

    client = AsyncOpenAI(api_key=api_key)

    # Set up output path
    output_path = Path(args.filename)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Build request kwargs
    create_kwargs = {
        "model": args.model,
        "prompt": args.prompt,
    }

    # Size and seconds
    if args.size:
        create_kwargs["size"] = args.size
    if args.seconds:
        create_kwargs["seconds"] = args.seconds

    # Remix mode
    if args.remix:
        print(f"Remixing video {args.remix}...")
        print(f"  Model: {args.model}")
        print(f"  Prompt: {args.prompt[:80]}{'...' if len(args.prompt) > 80 else ''}")

        # Remix uses a different endpoint pattern
        # POST /videos/{video_id}/remix
        video = await client.videos.create(
            model=args.model,
            prompt=args.prompt,
            remix_video_id=args.remix,
        )
    elif args.input_image:
        # Image-to-video
        img_path = Path(args.input_image)
        if not img_path.exists():
            print(f"Error: Input image not found: {args.input_image}", file=sys.stderr)
            sys.exit(1)

        print(f"Generating video from image...")
        print(f"  Model: {args.model}")
        print(f"  Image: {args.input_image}")
        print(f"  Size: {args.size or 'auto'}")
        print(f"  Duration: {args.seconds or '4'}s")

        # For image input, use multipart form via the REST-style call
        img_data = img_path.read_bytes()
        mime_map = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
        }
        suffix = img_path.suffix.lower()
        mime_type = mime_map.get(suffix, "image/jpeg")

        video = await client.videos.create(
            model=args.model,
            prompt=args.prompt,
            input_reference=img_data,
            **({"size": args.size} if args.size else {}),
            **({"seconds": args.seconds} if args.seconds else {}),
        )
    else:
        # Text-to-video
        print(f"Generating video...")
        print(f"  Model: {args.model}")
        print(f"  Size: {args.size or '1280x720'}")
        print(f"  Duration: {args.seconds or '4'}s")

        video = await client.videos.create(**create_kwargs)

    print(f"  Job ID: {video.id}")
    print(f"  Status: {video.status}")

    # Poll until done
    elapsed = 0
    while video.status in ("queued", "in_progress"):
        if elapsed >= args.timeout:
            print(f"Error: Timed out after {args.timeout}s.", file=sys.stderr)
            sys.exit(1)

        progress = video.progress or 0
        bar_len = 30
        filled = int((progress / 100) * bar_len)
        bar = "=" * filled + "-" * (bar_len - filled)
        status_text = "Queued" if video.status == "queued" else "Processing"
        print(f"  {status_text}: [{bar}] {progress}% ({elapsed}s elapsed)")

        await asyncio.sleep(args.poll_interval)
        elapsed += args.poll_interval
        video = await client.videos.retrieve(video.id)

    # Check result
    if video.status == "failed":
        print(f"Error: Video generation failed.", file=sys.stderr)
        if hasattr(video, "error") and video.error:
            print(f"  Reason: {video.error}", file=sys.stderr)
        sys.exit(1)

    if video.status != "completed":
        print(f"Error: Unexpected status: {video.status}", file=sys.stderr)
        sys.exit(1)

    # Download the video
    print(f"  Downloading video...")
    content = await client.videos.download_content(video.id)
    body = await content.aread()

    output_path.write_bytes(body)

    full_path = output_path.resolve()
    size_mb = len(body) / (1024 * 1024)
    print(f"\nVideo saved: {full_path}")
    print(f"  Size: {size_mb:.1f} MB")
    print(f"  Duration: ~{args.seconds or '4'}s")
    print(f"  Resolution: {args.size or '1280x720'}")
    print(f"  Model: {args.model}")
    # OpenClaw parses MEDIA tokens and will attach the file on supported providers.
    print(f"MEDIA: {full_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate videos using Sora 2 (OpenAI API)"
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
        help="Input reference image for image-to-video"
    )
    parser.add_argument(
        "--size", "-s",
        choices=["1280x720", "720x1280", "1080x1080"],
        default=None,
        help="Video size: 1280x720 (landscape), 720x1280 (portrait), 1080x1080 (square)"
    )
    parser.add_argument(
        "--seconds", "-d",
        choices=["4", "8", "12"],
        default=None,
        help="Duration in seconds: 4 (default), 8, or 12"
    )
    parser.add_argument(
        "--model", "-m",
        choices=["sora-2", "sora-2-pro"],
        default="sora-2",
        help="Model: sora-2 (standard, default) or sora-2-pro (HD)"
    )
    parser.add_argument(
        "--remix",
        metavar="VIDEO_ID",
        help="Remix an existing video by its ID"
    )
    parser.add_argument(
        "--api-key", "-k",
        help="OpenAI API key (overrides OPENAI_API_KEY env var)"
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
        default=600,
        help="Max wait time in seconds (default: 600)"
    )

    args = parser.parse_args()
    asyncio.run(run(args))


if __name__ == "__main__":
    main()
