#!/usr/bin/env python3
"""
Cannibalization analyzer for the social-strategy pipeline.

Computes pairwise cosine similarity between posts in a calendar window,
applies same-channel and cross-channel thresholds (see ../references/thresholds.json),
and emits a structured JSON verdict for Gate B + pre-publish Gate C.

Embeddings: OpenAI text-embedding-3-small (default; configurable in thresholds.json).
Cache: ~/.cache/claude-social/embeddings/{sha256(text)[:16]}.json — keyed by content hash.

Usage:
  python cannibalization.py --input posts.json --output verdict.json
  python cannibalization.py --input posts.json --output verdict.json --window-days 30

Input shape (posts.json):
  {
    "calendar_window": "2026-W18 -> 2026-W22",
    "posts": [
      { "post_id": "celavii-ig-014", "channel": "celavii", "platform": "instagram",
        "scheduled_for": "2026-05-04T14:00:00Z",
        "text": "<hook + body + hashtags concatenated>" },
      ...
    ]
  }

Output shape (verdict.json):
  {
    "calendar_window": "...", "posts_analyzed": 47,
    "embeddings": { "fresh": 0, "cached": 47 },
    "conflicts": [{ "post_a": "...", "post_b": "...", "channel_pair": "celavii",
                    "cosine": 0.87, "days_apart": 12, "severity": "warn",
                    "rule": "same_channel_8_30_days" }],
    "cross_channel_summary": [{ "pair": "celavii × cutmaster", "posts_compared": 35,
                                "max_cosine": 0.71, "status": "pass" }],
    "max_cosine": 0.87, "status": "warn"
  }
"""

import argparse
import hashlib
import json
import math
import os
import sys
import urllib.request
from datetime import datetime, timezone
from itertools import combinations
from pathlib import Path

CACHE_DIR = Path.home() / ".cache" / "claude-social" / "embeddings"
DEFAULT_THRESHOLDS = Path(__file__).resolve().parent.parent / "references" / "thresholds.json"
OPENAI_ENDPOINT = "https://api.openai.com/v1/embeddings"


def content_hash(text: str, model: str) -> str:
    return hashlib.sha256(f"{model}:{text}".encode("utf-8")).hexdigest()[:16]


def embed(text: str, model: str, api_key: str, fresh_counter: list, cache_counter: list) -> list:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    h = content_hash(text, model)
    cache_path = CACHE_DIR / f"{h}.json"
    if cache_path.exists():
        cache_counter[0] += 1
        with cache_path.open() as f:
            return json.load(f)["embedding"]
    payload = json.dumps({"input": text, "model": model}).encode("utf-8")
    req = urllib.request.Request(
        OPENAI_ENDPOINT,
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = json.loads(resp.read())
    vector = body["data"][0]["embedding"]
    fresh_counter[0] += 1
    with cache_path.open("w") as f:
        json.dump({"text": text, "model": model, "embedding": vector}, f)
    return vector


def cosine(a: list, b: list) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0


def parse_iso(s: str) -> datetime:
    # Accept "...Z" or "...+HH:MM"
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    return datetime.fromisoformat(s).astimezone(timezone.utc)


def days_between(a: str, b: str) -> int:
    return abs((parse_iso(a) - parse_iso(b)).days)


def apply_rules(rules: list, scope: str, cosine_val: float, days_apart: int) -> dict | None:
    """Return the most severe matching rule (fail > warn > pass), or None."""
    severity_order = {"fail": 3, "warn": 2, "pass": 1}
    matched = None
    for rule in rules:
        if rule["scope"] != scope:
            continue
        if scope == "same_channel":
            if "max_days_apart" in rule and days_apart > rule["max_days_apart"]:
                continue
            if "min_days_apart" in rule and days_apart < rule["min_days_apart"]:
                continue
        if cosine_val < rule["cosine_threshold"]:
            continue
        if matched is None or severity_order[rule["severity"]] > severity_order[matched["severity"]]:
            matched = rule
    return matched


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to posts.json")
    parser.add_argument("--output", required=True, help="Path to write verdict.json")
    parser.add_argument("--thresholds", default=str(DEFAULT_THRESHOLDS))
    args = parser.parse_args()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        sys.exit("OPENAI_API_KEY not set in environment.")

    with open(args.input) as f:
        payload = json.load(f)
    with open(args.thresholds) as f:
        thresholds = json.load(f)

    posts = payload.get("posts", [])
    model = thresholds.get("embedding_model", "text-embedding-3-small")
    fresh, cached = [0], [0]

    # Embed every post (cached on second pass)
    embeddings = {p["post_id"]: embed(p["text"], model, api_key, fresh, cached) for p in posts}
    by_id = {p["post_id"]: p for p in posts}

    conflicts = []
    cross_pair_stats = {}  # ("celavii","cutmaster") -> { compared, max_cosine }
    max_cosine = 0.0

    for a, b in combinations(posts, 2):
        c = cosine(embeddings[a["post_id"]], embeddings[b["post_id"]])
        max_cosine = max(max_cosine, c)
        if a["channel"] == b["channel"]:
            scope = "same_channel"
            d = days_between(a["scheduled_for"], b["scheduled_for"])
            rule = apply_rules(thresholds["rules"], scope, c, d)
            if rule and rule["severity"] != "pass":
                conflicts.append({
                    "post_a": a["post_id"], "post_b": b["post_id"],
                    "channel_pair": a["channel"],
                    "cosine": round(c, 4), "days_apart": d,
                    "severity": rule["severity"], "rule": rule["id"],
                    "message": rule["message"],
                })
        else:
            scope = "cross_channel"
            pair_key = tuple(sorted([a["channel"], b["channel"]]))
            stats = cross_pair_stats.setdefault(pair_key, {"compared": 0, "max_cosine": 0.0})
            stats["compared"] += 1
            stats["max_cosine"] = max(stats["max_cosine"], c)
            rule = apply_rules(thresholds["rules"], scope, c, 0)
            if rule and rule["severity"] != "pass":
                conflicts.append({
                    "post_a": a["post_id"], "post_b": b["post_id"],
                    "channel_pair": " × ".join(pair_key),
                    "cosine": round(c, 4), "days_apart": None,
                    "severity": rule["severity"], "rule": rule["id"],
                    "message": rule["message"],
                })

    # Roll up cross-channel summary
    cross_summary = []
    for (ch_a, ch_b), s in sorted(cross_pair_stats.items()):
        max_c = s["max_cosine"]
        status = "fail" if max_c >= 0.90 else ("warn" if max_c >= 0.80 else ("watch" if max_c >= 0.70 else "pass"))
        cross_summary.append({
            "pair": f"{ch_a} × {ch_b}", "posts_compared": s["compared"],
            "max_cosine": round(max_c, 4), "status": status,
        })

    severities = [c["severity"] for c in conflicts]
    overall = "fail" if "fail" in severities else ("warn" if "warn" in severities else "pass")

    verdict = {
        "calendar_window": payload.get("calendar_window"),
        "posts_analyzed": len(posts),
        "embeddings": {"fresh": fresh[0], "cached": cached[0], "model": model},
        "conflicts": conflicts,
        "cross_channel_summary": cross_summary,
        "max_cosine": round(max_cosine, 4),
        "status": overall,
        "ran_at": datetime.now(timezone.utc).isoformat(),
    }

    with open(args.output, "w") as f:
        json.dump(verdict, f, indent=2)
    print(f"Wrote {args.output} — {len(posts)} posts, {len(conflicts)} conflicts, status: {overall}")


if __name__ == "__main__":
    main()
