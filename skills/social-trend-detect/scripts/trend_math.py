#!/usr/bin/env python3
"""
Trend math for the social-trend-detect skill.

Reads `social-discover` Mode B hashtag scrape outputs (raw/celavii-hashtag-*-{platform}-*.json),
builds per-hashtag time series at hour buckets across the last N days, and computes
velocity / acceleration / rolling z-score. Flags hashtags with |z| > 2.0 as "exploding".

Also computes Jaccard co-occurrence over post-sets to cluster related hashtags.

Usage:
  python trend_math.py --raw-dir raw/ --platform tiktok \
                       --window-days 7 --output state-trend-signals.json

Inputs (one or more JSON files, glob: raw/celavii-hashtag-*-{platform}-*.json):
  Each file is a Celavii scrape_hashtags response containing a list of posts.
  We aggregate across files (each file = one snapshot at scrape time) to build
  per-hashtag view-count time series.

  Expected post shape (subset):
    { "post_id": "...", "hashtags": ["#agentic", ...], "view_count": 12345,
      "captured_at": "2026-04-28T12:00:00Z" }

Output (state-trend-signals.json):
  [
    {
      "platform": "tiktok", "topic": "agentic-marketing", "type": "hashtag",
      "velocity": 145.2, "acceleration": 28.7, "z_score": 2.8,
      "is_exploding": true, "co_occurring": ["#aimarketing", "#creatortools"],
      "raw_files": ["raw/trend-tiktok-agentic-marketing-2026-04-28T12.json"],
      "captured_at": "2026-04-28T12:00:00Z"
    },
    ...
  ]
"""

import argparse
import glob
import json
import math
import os
import statistics
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from pathlib import Path


def parse_iso(s: str) -> datetime:
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    return datetime.fromisoformat(s).astimezone(timezone.utc)


def hour_bucket(ts: datetime) -> datetime:
    return ts.replace(minute=0, second=0, microsecond=0)


def compute_velocity(series: list[tuple[datetime, float]]) -> list[tuple[datetime, float]]:
    """Δ value / Δ hours between consecutive buckets."""
    out = []
    for i in range(1, len(series)):
        t0, v0 = series[i - 1]
        t1, v1 = series[i]
        dt_hours = max((t1 - t0).total_seconds() / 3600.0, 1.0)
        out.append((t1, (v1 - v0) / dt_hours))
    return out


def compute_acceleration(velocity_series: list[tuple[datetime, float]]) -> list[tuple[datetime, float]]:
    """Δ velocity / Δ hours."""
    out = []
    for i in range(1, len(velocity_series)):
        t0, v0 = velocity_series[i - 1]
        t1, v1 = velocity_series[i]
        dt_hours = max((t1 - t0).total_seconds() / 3600.0, 1.0)
        out.append((t1, (v1 - v0) / dt_hours))
    return out


def z_score(value: float, mean: float, std: float) -> float:
    if std == 0:
        return 0.0
    return (value - mean) / std


def z_score_outliers(series: list[float], window: int = 24, threshold: float = 2.0) -> list[int]:
    """Return indices in `series` whose value is > threshold standard deviations
    above the rolling-window mean. Window is number of preceding samples."""
    flagged = []
    for i in range(window, len(series)):
        baseline = series[i - window:i]
        m = statistics.mean(baseline)
        s = statistics.pstdev(baseline)
        z = z_score(series[i], m, s)
        if z > threshold:
            flagged.append(i)
    return flagged


def jaccard(a: set, b: set) -> float:
    if not a and not b:
        return 0.0
    return len(a & b) / len(a | b)


def cluster_co_occurrence(hashtag_post_sets: dict[str, set], min_jaccard: float = 0.3) -> dict[str, list[str]]:
    """For each hashtag, return list of co-occurring tags (Jaccard > threshold)."""
    out = {}
    tags = list(hashtag_post_sets.keys())
    for i, tag_a in enumerate(tags):
        related = []
        for tag_b in tags:
            if tag_a == tag_b:
                continue
            if jaccard(hashtag_post_sets[tag_a], hashtag_post_sets[tag_b]) >= min_jaccard:
                related.append(tag_b)
        out[tag_a] = related[:10]  # cap at 10
    return out


def aggregate_scrapes(raw_dir: str, platform: str, window_days: int) -> tuple[dict, dict, list[str]]:
    """Walk raw/celavii-hashtag-*-{platform}-*.json files, build:
    - hashtag_series: { tag: [(bucket_ts, view_sum), ...] sorted ascending }
    - hashtag_post_sets: { tag: set(post_id) } for Jaccard clustering
    - source_files: paths consumed
    """
    pattern = os.path.join(raw_dir, f"celavii-hashtag-*-{platform}-*.json")
    cutoff = datetime.now(timezone.utc) - timedelta(days=window_days)

    hashtag_buckets = defaultdict(lambda: defaultdict(float))  # {tag: {bucket: views}}
    hashtag_post_sets = defaultdict(set)
    source_files = []

    for path in sorted(glob.glob(pattern)):
        with open(path) as f:
            payload = json.load(f)
        posts = payload.get("data") or payload.get("posts") or []
        for post in posts:
            captured = post.get("captured_at") or post.get("taken_at") or post.get("created_at")
            if not captured:
                continue
            try:
                ts = parse_iso(captured)
            except ValueError:
                continue
            if ts < cutoff:
                continue
            bucket = hour_bucket(ts)
            tags = post.get("hashtags") or []
            views = float(post.get("view_count") or post.get("play_count") or 0)
            post_id = post.get("post_id") or post.get("id") or ""
            for tag in tags:
                normalized = tag.lower().lstrip("#")
                hashtag_buckets[normalized][bucket] += views
                if post_id:
                    hashtag_post_sets[normalized].add(post_id)
        source_files.append(path)

    hashtag_series = {
        tag: sorted(buckets.items(), key=lambda kv: kv[0])
        for tag, buckets in hashtag_buckets.items()
    }
    return hashtag_series, hashtag_post_sets, source_files


def analyze(hashtag_series: dict, hashtag_post_sets: dict, platform: str,
            z_threshold: float = 2.0, z_window: int = 24) -> list[dict]:
    co_occur = cluster_co_occurrence(hashtag_post_sets)
    signals = []
    now = datetime.now(timezone.utc).isoformat()
    for tag, series in hashtag_series.items():
        if len(series) < z_window + 2:
            continue  # not enough history
        velocity = compute_velocity(series)
        accel = compute_acceleration(velocity)
        if not velocity or not accel:
            continue
        # Use the latest bucket's velocity + acceleration; z over the velocity series itself
        latest_velocity = velocity[-1][1]
        latest_accel = accel[-1][1]
        velocity_values = [v for _, v in velocity]
        if len(velocity_values) >= z_window + 1:
            baseline = velocity_values[-z_window - 1:-1]
            m = statistics.mean(baseline)
            s = statistics.pstdev(baseline)
            z = z_score(latest_velocity, m, s)
        else:
            z = 0.0
        signals.append({
            "platform": platform,
            "topic": tag,
            "type": "hashtag",
            "velocity": round(latest_velocity, 2),
            "acceleration": round(latest_accel, 2),
            "z_score": round(z, 2),
            "is_exploding": z > z_threshold,
            "co_occurring": [f"#{t}" for t in co_occur.get(tag, [])],
            "captured_at": now,
        })
    signals.sort(key=lambda s: s["z_score"], reverse=True)
    return signals


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-dir", required=True, help="Directory with celavii-hashtag-*.json scrapes")
    parser.add_argument("--platform", required=True, choices=["tiktok", "instagram", "x", "youtube"])
    parser.add_argument("--window-days", type=int, default=7)
    parser.add_argument("--z-threshold", type=float, default=2.0)
    parser.add_argument("--z-window", type=int, default=24, help="Rolling-baseline buckets for z-score")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    series, post_sets, sources = aggregate_scrapes(args.raw_dir, args.platform, args.window_days)
    if not series:
        print(f"No hashtag data found in {args.raw_dir} for platform={args.platform} within {args.window_days}d")
        Path(args.output).write_text(json.dumps({
            "platform": args.platform,
            "window_days": args.window_days,
            "source_files": sources,
            "trend_signals": [],
            "ran_at": datetime.now(timezone.utc).isoformat(),
        }, indent=2))
        return

    signals = analyze(series, post_sets, args.platform, args.z_threshold, args.z_window)
    Path(args.output).write_text(json.dumps({
        "platform": args.platform,
        "window_days": args.window_days,
        "z_threshold": args.z_threshold,
        "source_files": sources,
        "trend_signals": signals,
        "exploding_count": sum(1 for s in signals if s["is_exploding"]),
        "ran_at": datetime.now(timezone.utc).isoformat(),
    }, indent=2))
    print(f"Wrote {args.output} — {len(signals)} hashtags analyzed, "
          f"{sum(1 for s in signals if s['is_exploding'])} exploding")


if __name__ == "__main__":
    main()
