#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11,<3.14"
# dependencies = ["podcastfy", "playwright", "audioop-lts", "replicate", "pydub", "httpx"]
# ///
"""Generate a podcast-style audio conversation from text, files, or URLs using Podcastfy.

Uses an LLM to create a two-host conversational script, then voices it with TTS.
Default: Gemini Flash for script generation + Edge TTS for voices (zero extra cost).
"""

import argparse
import json
import os
import re
import sys
import tempfile
import time
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

    # For minimax, we handle TTS externally — set edge as placeholder for Podcastfy config
    tts_model = "edge" if args.tts == "minimax" else args.tts
    config["text_to_speech"] = {"model": tts_model}

    if args.tts == "edge" or args.tts == "minimax":
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


def parse_transcript_segments(transcript_text):
    """Parse <Person1> and <Person2> segments from Podcastfy transcript."""
    segments = []
    # Match <Person1>...</Person1> and <Person2>...</Person2> tags
    pattern = re.compile(r'<(Person[12])>\s*(.*?)\s*</\1>', re.DOTALL)
    for match in pattern.finditer(transcript_text):
        speaker = match.group(1)
        text = match.group(2).strip()
        if text:
            segments.append((speaker, text))
    return segments


def minimax_tts_segment(text, voice, api_token, model="speech-02-hd", timeout=120, max_retries=5):
    """Generate audio for a single text segment using MiniMax via Replicate."""
    import replicate
    import httpx

    for attempt in range(max_retries):
        try:
            prediction = replicate.predictions.create(
                model="minimax/speech-02-hd" if model == "speech-02-hd" else "minimax/speech-02-turbo",
                input={
                    "text": text,
                    "voice_id": voice,
                },
            )
            break
        except Exception as e:
            if "429" in str(e) or "throttled" in str(e).lower():
                wait = 10 * (attempt + 1)
                print(f"    Rate limited, waiting {wait}s (attempt {attempt+1}/{max_retries})...")
                time.sleep(wait)
                continue
            raise
    else:
        raise RuntimeError(f"MiniMax TTS: rate limited after {max_retries} retries")

    # Poll for completion
    start = time.time()
    while prediction.status not in ("succeeded", "failed", "canceled"):
        if time.time() - start > timeout:
            raise TimeoutError(f"MiniMax TTS timed out after {timeout}s")
        time.sleep(2)
        prediction.reload()

    if prediction.status != "succeeded":
        raise RuntimeError(f"MiniMax TTS failed: {prediction.error}")

    # Download audio
    output_url = prediction.output
    if isinstance(output_url, list):
        output_url = output_url[0]

    resp = httpx.get(output_url, timeout=60)
    resp.raise_for_status()
    return resp.content


def generate_with_minimax(transcript_text, output_path, voice1, voice2, api_token, model="speech-02-hd"):
    """Voice a Podcastfy transcript using MiniMax TTS and concatenate segments."""
    from pydub import AudioSegment

    segments = parse_transcript_segments(transcript_text)
    if not segments:
        raise ValueError("No <Person1>/<Person2> segments found in transcript")

    print(f"  Voicing {len(segments)} dialogue segments with MiniMax...")
    tmp_dir = Path(tempfile.mkdtemp(prefix="podcast-minimax-"))
    audio_parts = []

    for i, (speaker, text) in enumerate(segments):
        voice = voice1 if speaker == "Person1" else voice2
        print(f"  [{i+1}/{len(segments)}] {speaker} ({len(text)} chars)")
        # Pace requests to stay within Replicate rate limits (6 req/min)
        if i > 0:
            time.sleep(11)
        try:
            audio_data = minimax_tts_segment(text, voice, api_token, model=model)
            seg_path = tmp_dir / f"seg_{i:04d}.mp3"
            seg_path.write_bytes(audio_data)
            audio_seg = AudioSegment.from_file(str(seg_path))
            # Add a small pause between speakers
            audio_parts.append(audio_seg)
            audio_parts.append(AudioSegment.silent(duration=400))  # 400ms pause
        except Exception as e:
            print(f"  WARNING: Segment {i+1} failed: {e}", file=sys.stderr)
            continue

    if not audio_parts:
        raise RuntimeError("No audio segments were generated")

    # Concatenate all segments
    combined = audio_parts[0]
    for part in audio_parts[1:]:
        combined += part

    # Export
    combined.export(str(output_path), format="mp3", bitrate="128k")
    return output_path


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
        choices=["edge", "openai", "elevenlabs", "gemini", "geminimulti", "minimax"],
        help="TTS provider (default: edge — free, no API key; minimax for MiniMax Speech 2.6 HD)"
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
    if args.tts == "minimax" and not os.environ.get("REPLICATE_API_TOKEN"):
        print("ERROR: REPLICATE_API_TOKEN not set. Required for MiniMax TTS.", file=sys.stderr)
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
        import shutil

        # For minimax mode: generate transcript only, then voice with MiniMax
        use_minimax = args.tts == "minimax"

        # Build kwargs
        kwargs = {
            "conversation_config": conversation_config,
            "tts_model": "edge",  # placeholder for minimax; actual tts for others
            "llm_model_name": args.llm_model,
        }
        if not use_minimax:
            kwargs["tts_model"] = args.tts

        if urls:
            kwargs["urls"] = urls

        if raw_text:
            # Podcastfy accepts raw text via topic or transcript
            kwargs["topic"] = raw_text

        if args.transcript_only or use_minimax:
            kwargs["transcript_only"] = True

        audio_file = generate_podcast(**kwargs)

        if args.transcript_only and not use_minimax:
            print(f"\nTranscript generated.")
            if args.save_transcript and audio_file:
                Path(args.save_transcript).parent.mkdir(parents=True, exist_ok=True)
                Path(args.save_transcript).write_text(audio_file, encoding="utf-8")
                print(f"Transcript saved: {args.save_transcript}")
            elif audio_file:
                print(audio_file)
            sys.exit(0)

        if use_minimax:
            # audio_file is a file path in transcript_only mode; read the content
            transcript_path = audio_file
            if not transcript_path or not Path(transcript_path).exists():
                # Fallback: check Podcastfy's default transcript dir
                transcript_dir = Path("./data/transcripts")
                if transcript_dir.exists():
                    transcripts = sorted(transcript_dir.glob("*.txt"), key=lambda p: p.stat().st_mtime, reverse=True)
                    if transcripts:
                        transcript_path = str(transcripts[0])
            if not transcript_path or not Path(transcript_path).exists():
                print("ERROR: No transcript generated.", file=sys.stderr)
                sys.exit(1)

            transcript_text = Path(transcript_path).read_text(encoding="utf-8")

            # Save transcript if requested
            if args.save_transcript:
                Path(args.save_transcript).parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(transcript_path, args.save_transcript)
                print(f"Transcript saved: {args.save_transcript}")

            # Voice with MiniMax
            voice1 = args.voice1 or "English_expressive_narrator"
            voice2 = args.voice2 or "English_female_narrator"
            api_token = os.environ.get("REPLICATE_API_TOKEN", "")
            print(f"  Voice 1 (host): {voice1}")
            print(f"  Voice 2 (co-host): {voice2}")

            generate_with_minimax(
                transcript_text, full_path, voice1, voice2, api_token
            )
        else:
            if not audio_file or not Path(audio_file).exists():
                print("ERROR: Podcastfy did not produce an audio file.", file=sys.stderr)
                sys.exit(1)

            # Move to desired output path
            shutil.move(audio_file, str(full_path))

            # Save transcript if requested
            if args.save_transcript:
                transcript_dir = Path("./data/transcripts")
                if transcript_dir.exists():
                    transcripts = sorted(transcript_dir.glob("*.txt"), key=lambda p: p.stat().st_mtime, reverse=True)
                    if transcripts:
                        Path(args.save_transcript).parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(str(transcripts[0]), args.save_transcript)
                        print(f"Transcript saved: {args.save_transcript}")

        # File size
        size_mb = full_path.stat().st_size / (1024 * 1024)
        print(f"\nPodcast saved: {full_path} ({size_mb:.1f} MB)")

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
