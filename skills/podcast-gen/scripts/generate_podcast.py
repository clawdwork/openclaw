#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11,<3.14"
# dependencies = ["podcastfy", "playwright", "audioop-lts"]
# ///
"""Generate a podcast-style audio conversation from text, files, or URLs using Podcastfy.

Uses an LLM to create a two-host conversational script, then voices it with TTS.
Default: Gemini Flash for script generation + Edge TTS for voices (zero extra cost).
"""

import argparse
import json
import os
import sys
import tempfile
from pathlib import Path


def build_conversation_config(args):
    """Build a conversation_config dict from CLI arguments."""
    config = {}

    if args.name:
        config["podcast_name"] = args.name
    if args.tagline:
        config["podcast_tagline"] = args.tagline
    if args.language:
        config["output_language"] = args.language
    if args.style:
        config["conversation_style"] = [s.strip() for s in args.style.split(",")]
    if args.instructions:
        config["user_instructions"] = args.instructions
    if args.creativity is not None:
        config["creativity"] = args.creativity

    # TTS model selection
    config["text_to_speech"] = {"model": args.tts}

    if args.tts == "edge":
        config["text_to_speech"]["default_voices"] = {
            "question": args.voice1 or "en-US-JennyNeural",
            "answer": args.voice2 or "en-US-EricNeural",
        }
    elif args.tts == "openai":
        config["text_to_speech"]["default_voices"] = {
            "question": args.voice1 or "echo",
            "answer": args.voice2 or "shimmer",
        }
    elif args.tts == "elevenlabs":
        config["text_to_speech"]["default_voices"] = {
            "question": args.voice1 or "Chris",
            "answer": args.voice2 or "Jessica",
        }

    if args.ending:
        config["text_to_speech"]["ending_message"] = args.ending

    if args.longform:
        config["max_num_chunks"] = args.max_chunks or 15
        config["min_chunk_size"] = 400
    else:
        config["max_num_chunks"] = args.max_chunks or 5
        config["min_chunk_size"] = 600

    return config


def resolve_inputs(args):
    """Resolve input sources into urls list and/or raw text."""
    urls = []
    raw_text = None

    if args.url:
        urls.extend(args.url)

    if args.file:
        for f in args.file:
            p = Path(f).resolve()
            if not p.exists():
                print(f"WARNING: File not found: {f}", file=sys.stderr)
                continue
            if p.suffix.lower() == ".pdf":
                # Podcastfy handles PDFs via file:// URL
                urls.append(f"file://{p}")
            else:
                # Read text content
                content = p.read_text(encoding="utf-8", errors="replace")
                if raw_text is None:
                    raw_text = content
                else:
                    raw_text += "\n\n---\n\n" + content

    if args.text:
        if raw_text is None:
            raw_text = args.text
        else:
            raw_text += "\n\n---\n\n" + args.text

    return urls, raw_text


def main():
    parser = argparse.ArgumentParser(
        description="Generate a podcast-style audio conversation from text, files, or URLs."
    )

    # Input sources (at least one required)
    input_group = parser.add_argument_group("Input sources (provide at least one)")
    input_group.add_argument(
        "--text", type=str, help="Raw text to convert into a podcast"
    )
    input_group.add_argument(
        "--file", "-f", action="append",
        help="Path to a text/markdown/PDF file (can repeat)"
    )
    input_group.add_argument(
        "--url", "-u", action="append",
        help="URL to include as source (can repeat)"
    )

    # Output
    parser.add_argument(
        "--filename", type=str, default="./media/generated/drafts/podcast.mp3",
        help="Output audio file path (default: ./media/generated/drafts/podcast.mp3)"
    )

    # Podcast style
    parser.add_argument("--name", type=str, help="Podcast name")
    parser.add_argument("--tagline", type=str, help="Podcast tagline")
    parser.add_argument("--language", type=str, default="English", help="Output language")
    parser.add_argument(
        "--style", type=str, default="engaging,informative,conversational",
        help="Comma-separated conversation styles"
    )
    parser.add_argument(
        "--instructions", type=str,
        help="Custom instructions to guide the conversation focus"
    )
    parser.add_argument(
        "--creativity", type=float, default=0.7,
        help="Creativity/temperature (0.0-1.0, default: 0.7)"
    )

    # TTS
    parser.add_argument(
        "--tts", type=str, default="edge",
        choices=["edge", "openai", "elevenlabs", "gemini", "geminimulti"],
        help="TTS provider (default: edge — free, no API key)"
    )
    parser.add_argument("--voice1", type=str, help="Voice for host 1 (questioner)")
    parser.add_argument("--voice2", type=str, help="Voice for host 2 (answerer)")
    parser.add_argument(
        "--ending", type=str, default="Thanks for listening!",
        help="Ending message for the podcast"
    )

    # LLM
    parser.add_argument(
        "--llm-model", type=str, default="gemini-3-flash-preview",
        help="LLM model for script generation (default: gemini-3-flash-preview)"
    )
    parser.add_argument(
        "--gemini-key", type=str,
        help="Gemini API key override (default: GEMINI_API_KEY env)"
    )

    # Length
    parser.add_argument(
        "--longform", action="store_true",
        help="Generate a longer podcast (10-30+ minutes)"
    )
    parser.add_argument(
        "--max-chunks", type=int,
        help="Max discussion rounds (default: 5 short, 15 longform)"
    )

    # Transcript
    parser.add_argument(
        "--transcript-only", action="store_true",
        help="Only generate the transcript, skip audio"
    )
    parser.add_argument(
        "--save-transcript", type=str,
        help="Save the conversation transcript to this path"
    )

    # Misc
    parser.add_argument(
        "--timeout", type=int, default=600,
        help="Timeout in seconds (default: 600)"
    )

    args = parser.parse_args()

    # Validate at least one input
    if not args.text and not args.file and not args.url:
        parser.error("At least one input source is required (--text, --file, or --url)")

    # Set API key if overridden
    if args.gemini_key:
        os.environ["GEMINI_API_KEY"] = args.gemini_key

    # Validate API key for LLM
    if "gemini" in args.llm_model.lower() and not os.environ.get("GEMINI_API_KEY"):
        print("ERROR: GEMINI_API_KEY not set. Required for script generation.", file=sys.stderr)
        sys.exit(1)

    # Validate TTS API keys
    if args.tts == "openai" and not os.environ.get("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY not set. Required for OpenAI TTS.", file=sys.stderr)
        print("TIP: Use --tts edge for free TTS (no API key needed).", file=sys.stderr)
        sys.exit(1)
    if args.tts == "elevenlabs" and not os.environ.get("ELEVENLABS_API_KEY"):
        print("ERROR: ELEVENLABS_API_KEY not set. Required for ElevenLabs TTS.", file=sys.stderr)
        print("TIP: Use --tts edge for free TTS (no API key needed).", file=sys.stderr)
        sys.exit(1)

    urls, raw_text = resolve_inputs(args)

    if not urls and not raw_text:
        print("ERROR: No valid input content found.", file=sys.stderr)
        sys.exit(1)

    # Build conversation config
    conversation_config = build_conversation_config(args)

    # Resolve output path
    output_path = Path(args.filename)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    full_path = output_path.resolve()

    print(f"Generating podcast...")
    print(f"  LLM: {args.llm_model}")
    print(f"  TTS: {args.tts}")
    print(f"  Longform: {args.longform}")
    if urls:
        print(f"  URLs: {len(urls)}")
    if raw_text:
        print(f"  Text: {len(raw_text)} chars")

    try:
        from podcastfy.client import generate_podcast

        # Build kwargs
        kwargs = {
            "conversation_config": conversation_config,
            "tts_model": args.tts,
            "llm_model_name": args.llm_model,
        }

        if urls:
            kwargs["urls"] = urls

        if raw_text:
            # Podcastfy accepts raw text via topic or transcript
            kwargs["topic"] = raw_text

        if args.transcript_only:
            kwargs["transcript_only"] = True

        audio_file = generate_podcast(**kwargs)

        if args.transcript_only:
            print(f"\nTranscript generated.")
            if args.save_transcript and audio_file:
                Path(args.save_transcript).parent.mkdir(parents=True, exist_ok=True)
                Path(args.save_transcript).write_text(audio_file, encoding="utf-8")
                print(f"Transcript saved: {args.save_transcript}")
            elif audio_file:
                print(audio_file)
            sys.exit(0)

        if not audio_file or not Path(audio_file).exists():
            print("ERROR: Podcastfy did not produce an audio file.", file=sys.stderr)
            sys.exit(1)

        # Move to desired output path
        import shutil
        shutil.move(audio_file, str(full_path))

        # File size
        size_mb = full_path.stat().st_size / (1024 * 1024)
        print(f"\nPodcast saved: {full_path} ({size_mb:.1f} MB)")

        # Save transcript if requested
        if args.save_transcript:
            # Check for transcript in podcastfy's default location
            transcript_dir = Path("./data/transcripts")
            if transcript_dir.exists():
                transcripts = sorted(transcript_dir.glob("*.txt"), key=lambda p: p.stat().st_mtime, reverse=True)
                if transcripts:
                    Path(args.save_transcript).parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(str(transcripts[0]), args.save_transcript)
                    print(f"Transcript saved: {args.save_transcript}")

        # MEDIA: token for OpenClaw chat delivery
        print(f"MEDIA: {args.filename}")

    except KeyboardInterrupt:
        print("\nCancelled.", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
