#!/usr/bin/env python3
"""
Social content linter — runs as PostToolUse hook on Edit|Write of
projects/celavii/content/social/**/*.md files.

Exit codes:
  0 = pass
  1 = warn (issues reported, save allowed)
  2 = block (save refused)

Checks:
- Banned language from .styles/celavii/voice.json#forbidden_phrases
- AI-slop tells (delve, tapestry, multifaceted, navigate the landscape, ...)
- Char limit per platform (inferred from filename suffix: -x-, -ig-, -tt-, -yt-)
- Required frontmatter fields (status, channel, platform, post-id)

This is a stub — Phase A12 lands the manifest; Phase B fills the validator out
with full voice.json enforcement.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

WORKSPACE_ROOT = Path("/Users/operator/dev/workspace")
VOICE_JSON = WORKSPACE_ROOT / ".styles" / "celavii" / "voice.json"

AI_SLOP_TELLS = [
    "delve",
    "tapestry",
    "multifaceted",
    "navigate the landscape",
    "in conclusion",
    "in today's fast-paced",
    "ever-evolving",
    "harness the power",
    "dive into",
]

PLATFORM_CHAR_LIMITS = {
    "x":  280,        # caption length cap
    "tt": 2200,       # TikTok caption
    "ig": 2200,       # IG caption
    "yt": 5000,       # YouTube description
}


def load_voice() -> dict:
    if not VOICE_JSON.exists():
        return {"forbidden_phrases": []}
    try:
        return json.loads(VOICE_JSON.read_text())
    except json.JSONDecodeError:
        return {"forbidden_phrases": []}


def detect_platform(path: Path) -> str | None:
    name = path.name.lower()
    for token, _ in [("-x-", "x"), ("-tt-", "tt"), ("-ig-", "ig"), ("-yt-", "yt")]:
        if token in name:
            return token.strip("-")
    return None


def main() -> int:
    if len(sys.argv) < 2:
        print("validate-social-content.py: missing FILE_PATH arg", file=sys.stderr)
        return 1

    path = Path(sys.argv[1])
    if not path.exists():
        return 0  # nothing to validate

    text = path.read_text()
    text_lower = text.lower()

    voice = load_voice()
    forbidden = [p.lower() for p in voice.get("forbidden_phrases", [])]

    blocking: list[str] = []
    warnings: list[str] = []

    for phrase in forbidden:
        if phrase in text_lower:
            blocking.append(f"banned phrase: '{phrase}' (per voice.json)")

    for tell in AI_SLOP_TELLS:
        if tell in text_lower:
            warnings.append(f"AI-slop tell: '{tell}' — rewrite for specificity")

    platform = detect_platform(path)
    if platform and platform in PLATFORM_CHAR_LIMITS:
        body_match = re.search(r"^---\n.*?\n---\n(.*)", text, re.DOTALL)
        body = body_match.group(1) if body_match else text
        if len(body) > PLATFORM_CHAR_LIMITS[platform]:
            warnings.append(
                f"length {len(body)} > {platform} cap {PLATFORM_CHAR_LIMITS[platform]}"
            )

    if blocking:
        print("BLOCK: " + "; ".join(blocking), file=sys.stderr)
        return 2
    if warnings:
        print("WARN: " + "; ".join(warnings), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
