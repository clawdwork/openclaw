#!/usr/bin/env python3
"""
social-aggregate — Phase 3 deterministic aggregator for the social-agents pipeline.

Reads raw/*.json (profiles, posts, hashtags, competitors), scores topics, clusters
posts by cosine similarity, tags hooks by archetype + 4E framework, computes
velocity/acceleration/z-score trend signals, emits one LLM-readable markdown
report (~2K tokens) plus full structured JSON.

NO LLM in aggregation. Pure stdlib (math + re + json + glob). Target: <5s on 1000 posts.

Usage:
    python3 aggregate.py --social-dir projects/celavii/research/social
    python3 aggregate.py --fixture                         # bundled smoke test
    python3 aggregate.py --social-dir <dir> --top-n 50

Exit codes:
    0 = success
    1 = missing required files / dir
    2 = invalid arguments
"""

from __future__ import annotations

import argparse
import glob
import hashlib
import json
import math
import os
import re
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable

# ─────────────────────────────────────────────────────────────────────────────
# Hook-archetype regex bank (C8)
# ─────────────────────────────────────────────────────────────────────────────

ARCHETYPE_PATTERNS: dict[str, list[re.Pattern[str]]] = {
    "curiosity_gap": [
        re.compile(r"\b(here'?s why|the reason|nobody (talks|is talking) about|secret|hidden|truth about)\b", re.I),
        re.compile(r"\b(what (they|nobody) tell(s)? you|behind the scenes|the real|actually)\b", re.I),
        re.compile(r"\?$"),
    ],
    "contrarian": [
        re.compile(r"\b(stop (using|doing)|don'?t|you'?re wrong|everyone is (lying|wrong)|hot take|unpopular opinion)\b", re.I),
        re.compile(r"\b(myth|misconception|overrated|outdated)\b", re.I),
    ],
    "story": [
        re.compile(r"\b(I (was|tried|spent|built|lost|made)|when I|years ago|last (week|month|year)|my (first|biggest))\b", re.I),
        re.compile(r"\b(story time|true story|here'?s what happened)\b", re.I),
    ],
    "authority": [
        re.compile(r"\b(I (analyzed|scored|reviewed|studied)|after (\d+|\w+) (posts|videos|tests|years))\b", re.I),
        re.compile(r"\b(\d{2,}[Kk]?\+?\s*(creators|posts|profiles|brands|accounts|users|hours))\b"),
        re.compile(r"\b(data shows|study|research|the numbers say)\b", re.I),
    ],
    "pattern_interrupt": [
        re.compile(r"^(wait|hold on|stop|listen|ok so)[,.\s—–-]", re.I),
        re.compile(r"\b(plot twist|but here'?s the thing|hear me out)\b", re.I),
        re.compile(r"^\W*(🚨|⚠️|🛑)"),
    ],
}

# ─────────────────────────────────────────────────────────────────────────────
# 4E classifier (C8)
# ─────────────────────────────────────────────────────────────────────────────

E_PATTERNS: dict[str, list[re.Pattern[str]]] = {
    "educate": [
        re.compile(r"\b(how to|tutorial|guide|step[- ]by[- ]step|learn|tip|trick|explain|breakdown|here'?s how)\b", re.I),
        re.compile(r"\b(what is|why|when|where|which|the difference between)\b", re.I),
    ],
    "entertain": [
        re.compile(r"\b(lol|lmao|funny|joke|meme|hilarious|relatable|this is me|pov)\b", re.I),
        re.compile(r"^(when |me when |that moment when )", re.I),
    ],
    "engage": [
        re.compile(r"\b(comment|tag (a|your)|share if|tell me|drop (a|your)|what do you think|am I the only one|agree or disagree)\b", re.I),
        re.compile(r"\?$"),
    ],
    "empower": [
        re.compile(r"\b(you can|you'?ll|you'?re|stop (waiting|asking|wondering)|take control|own (your|this)|build (your|the))\b", re.I),
        re.compile(r"\b(start (today|now)|level up|unlock)\b", re.I),
    ],
}

# ─────────────────────────────────────────────────────────────────────────────
# Tokenization (shared by cosine + trend n-grams)
# ─────────────────────────────────────────────────────────────────────────────

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
    "i", "in", "is", "it", "its", "of", "on", "or", "that", "the", "this", "to",
    "was", "were", "will", "with", "you", "your", "we", "our", "they", "them",
    "but", "not", "if", "so", "do", "does", "did", "can", "just", "what", "how",
    "my", "me", "all", "no", "yes", "very", "much", "more", "than", "then",
}

TOKEN_RE = re.compile(r"[a-z][a-z0-9']{1,}")


def tokenize(text: str, drop_stop: bool = True) -> list[str]:
    if not text:
        return []
    toks = TOKEN_RE.findall(text.lower())
    if drop_stop:
        toks = [t for t in toks if t not in STOPWORDS and len(t) > 2]
    return toks


def ngrams(tokens: list[str], n: int) -> list[str]:
    return [" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]


# ─────────────────────────────────────────────────────────────────────────────
# Cosine similarity (hashed-token L2 norm — pure stdlib, no numpy)
# ─────────────────────────────────────────────────────────────────────────────

def tf_vec(tokens: list[str]) -> dict[str, float]:
    if not tokens:
        return {}
    counts = Counter(tokens)
    total = sum(counts.values())
    return {t: c / total for t, c in counts.items()}


def cosine(a: dict[str, float], b: dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    common = set(a) & set(b)
    if not common:
        return 0.0
    dot = sum(a[t] * b[t] for t in common)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


# ─────────────────────────────────────────────────────────────────────────────
# Loaders
# ─────────────────────────────────────────────────────────────────────────────

def load_state(social_dir: str) -> dict:
    path = os.path.join(social_dir, "social-strategy-state.json")
    if not os.path.exists(path):
        print(f"WARN: no social-strategy-state.json at {path} — using empty intake", file=sys.stderr)
        return {"meta": {}, "intake": {}}
    with open(path) as f:
        return json.load(f)


def load_raw(social_dir: str) -> dict[str, list[dict]]:
    """Return {kind: [json, ...]} where kind ∈ {profile, posts, hashtag, location, competitor}."""
    raw_dir = os.path.join(social_dir, "raw")
    out: dict[str, list[dict]] = defaultdict(list)
    if not os.path.isdir(raw_dir):
        return out
    for path in sorted(glob.glob(os.path.join(raw_dir, "*.json"))):
        try:
            with open(path) as f:
                data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"WARN: skipping {path}: {e}", file=sys.stderr)
            continue
        name = os.path.basename(path)
        if "-profile-" in name:
            out["profile"].append({"_path": path, "_name": name, "data": data})
        elif "-posts-" in name:
            out["posts"].append({"_path": path, "_name": name, "data": data})
        elif "-hashtag-" in name:
            out["hashtag"].append({"_path": path, "_name": name, "data": data})
        elif "-location-" in name:
            out["location"].append({"_path": path, "_name": name, "data": data})
        else:
            out["other"].append({"_path": path, "_name": name, "data": data})
    return out


def flatten_posts(raw: dict[str, list[dict]]) -> list[dict]:
    """Return one flat list of post dicts, each with normalized fields."""
    posts: list[dict] = []
    for bundle in raw.get("posts", []) + raw.get("hashtag", []) + raw.get("location", []):
        items = bundle["data"]
        if isinstance(items, dict):
            items = items.get("posts") or items.get("items") or []
        if not isinstance(items, list):
            continue
        for p in items:
            if not isinstance(p, dict):
                continue
            posts.append(normalize_post(p, source_file=bundle["_name"]))
    return posts


def normalize_post(p: dict, source_file: str = "") -> dict:
    """Map disparate shapes (IG/TT/X) to a common subset."""
    pid = p.get("post_id") or p.get("id") or p.get("shortcode") or hashlib.md5(json.dumps(p, sort_keys=True, default=str).encode()).hexdigest()[:12]
    platform = p.get("platform") or _platform_from_filename(source_file)
    handle = p.get("handle") or p.get("author_handle") or p.get("username") or ""
    text = p.get("caption") or p.get("text") or p.get("description") or p.get("title") or ""
    hook = p.get("hook") or text.split("\n")[0][:160] if text else ""
    likes = _num(p.get("likes") or p.get("like_count"))
    comments = _num(p.get("comments") or p.get("comment_count"))
    saves = _num(p.get("saves") or p.get("save_count"))
    shares = _num(p.get("shares") or p.get("share_count"))
    views = _num(p.get("views") or p.get("view_count") or p.get("plays"))
    followers_at_post = _num(p.get("author_followers") or p.get("followers"))
    posted_at = _dt(p.get("posted_at") or p.get("taken_at") or p.get("created_at") or p.get("timestamp"))
    platform_prefix = {"instagram": "ig", "tiktok": "tt", "x": "x", "youtube": "yt"}.get(platform, platform[:2])
    return {
        "post_id": f"{platform_prefix}:{pid}" if platform else str(pid),
        "platform": platform,
        "handle": handle,
        "hook": hook,
        "text": text,
        "likes": likes,
        "comments": comments,
        "saves": saves,
        "shares": shares,
        "views": views,
        "followers_at_post": followers_at_post,
        "posted_at": posted_at,
        "source_file": source_file,
    }


def _num(x: Any) -> int:
    if x is None:
        return 0
    try:
        return int(x)
    except (TypeError, ValueError):
        try:
            return int(float(x))
        except (TypeError, ValueError):
            return 0


def _dt(x: Any) -> str | None:
    if not x:
        return None
    if isinstance(x, (int, float)):
        try:
            return datetime.fromtimestamp(float(x), tz=timezone.utc).isoformat()
        except (OverflowError, OSError, ValueError):
            return None
    if isinstance(x, str):
        return x
    return None


def _platform_from_filename(name: str) -> str:
    for p in ("instagram", "tiktok", "x", "youtube"):
        if f"-{p}-" in name:
            return p
    return ""


# ─────────────────────────────────────────────────────────────────────────────
# Engagement rate (per-platform formula stub)
# ─────────────────────────────────────────────────────────────────────────────

def engagement_rate(post: dict) -> float:
    """Save-weighted ER. Save+share weighted higher than likes (Article 10)."""
    f = post["followers_at_post"] or 1
    weighted = post["likes"] + 2 * post["comments"] + 3 * post["saves"] + 3 * post["shares"]
    return round(100.0 * weighted / max(f, 1), 4)


# ─────────────────────────────────────────────────────────────────────────────
# Tagging
# ─────────────────────────────────────────────────────────────────────────────

def tag_archetype(hook: str) -> list[str]:
    if not hook:
        return []
    hits: list[tuple[str, int]] = []
    for archetype, patterns in ARCHETYPE_PATTERNS.items():
        n = sum(1 for p in patterns if p.search(hook))
        if n:
            hits.append((archetype, n))
    if not hits:
        return []
    hits.sort(key=lambda kv: -kv[1])
    return [a for a, _ in hits]


def tag_4e(text: str) -> list[str]:
    if not text:
        return []
    es: list[str] = []
    for e, patterns in E_PATTERNS.items():
        if any(p.search(text) for p in patterns):
            es.append(e)
    return es


# ─────────────────────────────────────────────────────────────────────────────
# Topic extraction (n-gram by frequency, gated by relevance)
# ─────────────────────────────────────────────────────────────────────────────

def extract_topics(posts: list[dict], top_k: int = 200) -> list[str]:
    counter: Counter[str] = Counter()
    for p in posts:
        toks = tokenize(p["text"])
        for n in (1, 2, 3):
            for ng in ngrams(toks, n):
                counter[ng] += 1
    return [t for t, _ in counter.most_common(top_k)]


# ─────────────────────────────────────────────────────────────────────────────
# Scoring (C1)
# ─────────────────────────────────────────────────────────────────────────────

def score_topic(
    topic: str,
    posts: list[dict],
    post_token_sets: list[set[str]],
    differentiators: list[str],
    silos: list[str],
    competitor_topics: set[str],
    channels: list[str],
) -> dict:
    topic_toks = set(tokenize(topic, drop_stop=False))

    relevance = 0
    for d in differentiators:
        if any(t in tokenize(d) for t in topic_toks):
            relevance += 3
    for s in silos:
        if any(t in tokenize(s) for t in topic_toks):
            relevance += 2
    relevance = min(relevance, 10)

    # Supporting posts: all topic tokens appear in the post's token set (handles n-gram topics
    # built from stopword-stripped tokens, which won't substring-match the raw text).
    supporting = [p for p, toks in zip(posts, post_token_sets) if topic_toks and topic_toks.issubset(toks)]
    if relevance == 0 and supporting:
        relevance = 4

    differentiation = 10 if topic not in competitor_topics else max(2, 10 - sum(1 for c in competitor_topics if topic == c) * 2)
    distinct_platforms = len({p["platform"] for p in supporting if p["platform"]})
    distinct_channels = len({p["handle"] for p in supporting})
    cross_pollination = min(10, distinct_platforms * 2 + min(distinct_channels, 5))

    if any(p["platform"] == "youtube" for p in supporting):
        effort = 5
    elif any(re.search(r"\b(video|reel|tiktok|short)\b", p["text"] or "", re.I) for p in supporting):
        effort = 3
    else:
        effort = 2

    composite = round(
        0.35 * relevance + 0.30 * differentiation + 0.20 * cross_pollination + 0.15 * (6 - effort) * 2,
        2,
    )

    return {
        "topic": topic,
        "score": composite,
        "relevance": relevance,
        "differentiation": differentiation,
        "cross_pollination": cross_pollination,
        "effort": effort,
        "supporting_post_ids": [p["post_id"] for p in supporting[:10]],
        "channel_fit": list({p["handle"] for p in supporting if p["handle"]})[:5],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Cannibalization (C7)
# ─────────────────────────────────────────────────────────────────────────────

def cannibalization_clusters(posts: list[dict], window_days: int = 30, threshold: float = 0.70) -> list[dict]:
    own = [p for p in posts if p.get("posted_at")]
    if not own:
        return []
    vecs = [(p, tf_vec(tokenize((p["hook"] or "") + " " + (p["text"] or "")[:200]))) for p in own]
    clusters: list[dict] = []
    seen: set[str] = set()
    for i, (p1, v1) in enumerate(vecs):
        if p1["post_id"] in seen:
            continue
        cluster = [p1]
        max_cos = 0.0
        for j in range(i + 1, len(vecs)):
            p2, v2 = vecs[j]
            if p2["post_id"] in seen:
                continue
            if not _within_days(p1["posted_at"], p2["posted_at"], window_days):
                continue
            c = cosine(v1, v2)
            if c >= threshold:
                cluster.append(p2)
                seen.add(p2["post_id"])
                if c > max_cos:
                    max_cos = c
        if len(cluster) > 1:
            clusters.append(
                {
                    "cluster_id": f"cn-{len(clusters) + 1:03d}",
                    "posts": [p["post_id"] for p in cluster],
                    "max_cosine": round(max_cos, 3),
                    "window_days": window_days,
                    "status": "hard_fail" if max_cos >= 0.85 else "warn",
                }
            )
    return clusters


def _within_days(a: str | None, b: str | None, days: int) -> bool:
    if not a or not b:
        return False
    try:
        da = datetime.fromisoformat(a.replace("Z", "+00:00"))
        db = datetime.fromisoformat(b.replace("Z", "+00:00"))
    except ValueError:
        return False
    return abs((da - db).total_seconds()) <= days * 86400


# ─────────────────────────────────────────────────────────────────────────────
# Trend math (C9 — ramekin-style)
# ─────────────────────────────────────────────────────────────────────────────

def trend_signals(posts: list[dict], window_days: int = 30) -> list[dict]:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=window_days)
    by_day: dict[str, Counter] = defaultdict(Counter)
    for p in posts:
        if not p.get("posted_at"):
            continue
        try:
            dt = datetime.fromisoformat(p["posted_at"].replace("Z", "+00:00"))
        except ValueError:
            continue
        if dt < cutoff:
            continue
        day = dt.date().isoformat()
        toks = tokenize(p["text"] or "")
        for ng in set(ngrams(toks, 1) + ngrams(toks, 2)):
            by_day[ng][day] += 1

    signals: list[dict] = []
    for term, daily in by_day.items():
        if sum(daily.values()) < 5:
            continue
        days_30 = [daily.get((now - timedelta(days=d)).date().isoformat(), 0) for d in range(window_days)]
        days_7 = days_30[:7]
        days_14 = days_30[:14]
        mu_30 = sum(days_30) / len(days_30)
        sigma_30 = math.sqrt(sum((x - mu_30) ** 2 for x in days_30) / len(days_30)) or 1.0
        velocity = (sum(days_7) / 7) / max(mu_30, 0.1)
        v_7 = sum(days_7) / 7
        v_14 = sum(days_14) / 14
        acceleration = round(v_7 - v_14, 3)
        z = round((days_30[0] - mu_30) / sigma_30, 2)
        if z >= 1.5 or velocity >= 1.6:
            status = "exploding" if z >= 2.5 else "rising"
            platforms = list({p["platform"] for p in posts if term in (p["text"] or "").lower() and p.get("platform")})
            signals.append(
                {
                    "term": term,
                    "velocity": round(velocity, 3),
                    "acceleration": acceleration,
                    "z_score": z,
                    "status": status,
                    "platform": platforms[0] if platforms else "",
                }
            )
    signals.sort(key=lambda s: -s["z_score"])
    return signals[:50]


# ─────────────────────────────────────────────────────────────────────────────
# Channel baselines + archetype + 4E mix
# ─────────────────────────────────────────────────────────────────────────────

def compute_channel_mix(posts: list[dict]) -> tuple[dict, dict, dict]:
    archetype_by_channel: dict[str, Counter] = defaultdict(Counter)
    e_by_channel: dict[str, Counter] = defaultdict(Counter)
    base_by_channel: dict[str, dict] = defaultdict(lambda: defaultdict(lambda: {"count": 0, "er_sum": 0.0}))

    for p in posts:
        ch = p["handle"] or "unknown"
        for a in tag_archetype(p["hook"]):
            archetype_by_channel[ch][a] += 1
        for e in tag_4e(p["text"]):
            e_by_channel[ch][e] += 1
        plat = p["platform"] or "unknown"
        base_by_channel[ch][plat]["count"] += 1
        base_by_channel[ch][plat]["er_sum"] += engagement_rate(p)

    archetype_dist: dict[str, dict[str, float]] = {}
    for ch, c in archetype_by_channel.items():
        total = sum(c.values())
        if total:
            archetype_dist[ch] = {k: round(v / total, 3) for k, v in c.items()}

    e_dist: dict[str, dict[str, float]] = {}
    for ch, c in e_by_channel.items():
        total = sum(c.values())
        if total:
            e_dist[ch] = {k: round(v / total, 3) for k, v in c.items()}

    baselines: dict[str, dict[str, dict]] = {}
    for ch, plats in base_by_channel.items():
        baselines[ch] = {}
        for plat, stats in plats.items():
            baselines[ch][plat] = {
                "post_count": stats["count"],
                "avg_er_pct": round(stats["er_sum"] / max(stats["count"], 1), 4),
            }

    return archetype_dist, e_dist, baselines


# ─────────────────────────────────────────────────────────────────────────────
# Markdown report
# ─────────────────────────────────────────────────────────────────────────────

def render_markdown(payload: dict, top_n: int = 25) -> str:
    s = payload["stats"]
    lines = [
        f"# Social Aggregate Report — {payload['generated_at'][:10]}",
        "",
        f"**Source dir**: `{payload['social_dir']}`  ",
        f"**Stats**: {s['raw_files']} raw files · {s['posts_processed']} posts · {s['competitors']} competitors · runtime {payload['runtime_sec']}s",
        "",
        "## Top Scored Topics",
        "",
        "| # | Topic | Score | Rel | Diff | XPoll | Effort | Channels |",
        "|---|-------|------:|----:|-----:|------:|-------:|----------|",
    ]
    for i, t in enumerate(payload["scored_topics"][:top_n], 1):
        chans = ", ".join(t["channel_fit"]) if t["channel_fit"] else "—"
        lines.append(
            f"| {i} | {t['topic'][:60]} | {t['score']} | {t['relevance']} | {t['differentiation']} | {t['cross_pollination']} | {t['effort']} | {chans} |"
        )

    lines += ["", "## Hook Archetype Mix per Channel", ""]
    if payload["hook_archetype_distribution"]:
        for ch, d in payload["hook_archetype_distribution"].items():
            top = sorted(d.items(), key=lambda kv: -kv[1])[:5]
            lines.append(f"- **{ch}**: " + ", ".join(f"{k} {v:.0%}" for k, v in top))
    else:
        lines.append("_no archetype hits — review hook quality_")

    lines += ["", "## 4E Distribution per Channel", ""]
    if payload["e_mix"]:
        for ch, d in payload["e_mix"].items():
            row = ", ".join(f"{k} {v:.0%}" for k, v in sorted(d.items(), key=lambda kv: -kv[1]))
            warn = " ⚠️ <2 E's" if len(d) < 2 else ""
            lines.append(f"- **{ch}**: {row}{warn}")
    else:
        lines.append("_no 4E classifications — content too thin_")

    lines += ["", "## Trend Signals (z ≥ 2.5 = exploding)", ""]
    exploding = [t for t in payload["trend_signals"] if t["z_score"] >= 2.5]
    if exploding:
        lines.append("| Term | Platform | Velocity | Accel | Z | Status |")
        lines.append("|------|----------|---------:|------:|--:|--------|")
        for t in exploding[:15]:
            lines.append(f"| {t['term']} | {t['platform']} | {t['velocity']} | {t['acceleration']} | {t['z_score']} | {t['status']} |")
    else:
        lines.append("_no exploding terms in window — relying on platform-native trend lists is risky_")

    lines += ["", "## Cannibalization Warnings", ""]
    hard = [c for c in payload["cannibalization_clusters"] if c["status"] == "hard_fail"]
    warn = [c for c in payload["cannibalization_clusters"] if c["status"] == "warn"]
    if hard:
        lines.append(f"**HARD FAIL ({len(hard)} clusters at cosine ≥ 0.85):**")
        for c in hard:
            lines.append(f"- `{c['cluster_id']}` · cosine {c['max_cosine']} · posts: {', '.join(c['posts'])}")
    if warn:
        lines.append(f"**Warn ({len(warn)} clusters at cosine 0.70–0.85):**")
        for c in warn[:5]:
            lines.append(f"- `{c['cluster_id']}` · cosine {c['max_cosine']} · posts: {', '.join(c['posts'])}")
    if not hard and not warn:
        lines.append("_no near-duplicate clusters detected_")

    lines += ["", "## Channel Baselines", ""]
    if payload["channel_baselines"]:
        lines.append("| Channel | Platform | Posts | Avg ER % |")
        lines.append("|---------|----------|------:|---------:|")
        for ch, plats in payload["channel_baselines"].items():
            for plat, stats in plats.items():
                lines.append(f"| {ch} | {plat} | {stats['post_count']} | {stats['avg_er_pct']} |")
    else:
        lines.append("_no baseline data_")

    lines += [
        "",
        "## State delta",
        "",
        "```json",
        json.dumps(payload["state_delta"], indent=2),
        "```",
        "",
    ]
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# Main aggregator
# ─────────────────────────────────────────────────────────────────────────────

def aggregate(social_dir: str, top_n: int = 50, cannib_window: int = 30) -> dict:
    t0 = time.perf_counter()
    state = load_state(social_dir)
    raw = load_raw(social_dir)

    intake = state.get("intake", {}) or state.get("meta", {})
    differentiators = intake.get("differentiators", []) or state.get("meta", {}).get("differentiators", [])
    silos = [s.get("name", s) if isinstance(s, dict) else s for s in (intake.get("content_silos", []) or state.get("meta", {}).get("content_silos", []))]
    competitor_handles: list[str] = []
    for ch_block in (intake.get("competitors_per_channel") or {}).values():
        if isinstance(ch_block, list):
            competitor_handles.extend(ch_block)

    posts = flatten_posts(raw)
    own_posts = [p for p in posts if p["handle"] not in competitor_handles]
    comp_posts = [p for p in posts if p["handle"] in competitor_handles]

    candidate_topics = extract_topics(own_posts, top_k=200)
    competitor_topics = set(extract_topics(comp_posts, top_k=200))

    channels = list({p["handle"] for p in own_posts if p["handle"]})

    # Pre-tokenize once; reused by topic scoring.
    own_token_sets = [set(tokenize(p["text"] or "")) for p in own_posts]

    scored = [
        score_topic(t, own_posts, own_token_sets, differentiators, silos, competitor_topics, channels)
        for t in candidate_topics
    ]
    scored = [s for s in scored if s["score"] >= 5.0]
    scored.sort(key=lambda s: -s["score"])
    scored = scored[:top_n]

    clusters = cannibalization_clusters(own_posts, window_days=cannib_window)
    archetype_dist, e_dist, baselines = compute_channel_mix(own_posts)
    trends = trend_signals(posts, window_days=cannib_window)

    runtime = round(time.perf_counter() - t0, 2)
    now = datetime.now(timezone.utc).isoformat()

    state_delta = {
        "report_path_md": "",  # filled by caller
        "report_path_json": "",
        "scored_topics_count": len(scored),
        "cannibalization_warnings": sum(1 for c in clusters if c["status"] == "warn"),
        "cannibalization_hard_fails": sum(1 for c in clusters if c["status"] == "hard_fail"),
        "trend_signals_exploding": sum(1 for t in trends if t["z_score"] >= 2.5),
        "ran_at": now,
        "runtime_sec": runtime,
    }

    return {
        "version": 1,
        "generated_at": now,
        "social_dir": social_dir,
        "stats": {
            "raw_files": sum(len(v) for v in raw.values()),
            "posts_processed": len(posts),
            "own_posts": len(own_posts),
            "competitor_posts": len(comp_posts),
            "competitors": len(set(p["handle"] for p in comp_posts)),
        },
        "scored_topics": scored,
        "cannibalization_clusters": clusters,
        "hook_archetype_distribution": archetype_dist,
        "e_mix": e_dist,
        "trend_signals": trends,
        "channel_baselines": baselines,
        "runtime_sec": runtime,
        "state_delta": state_delta,
    }


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="social-aggregate — Phase 3 deterministic aggregator")
    ap.add_argument("--social-dir", help="Path to social/ research dir")
    ap.add_argument("--fixture", action="store_true", help="Run against bundled fixtures/raw/")
    ap.add_argument("--output", help="Output basename (default: aggregate-report-{date} in social-dir)")
    ap.add_argument("--top-n", type=int, default=50)
    ap.add_argument("--cannibalization-window", type=int, default=30)
    args = ap.parse_args()

    if args.fixture:
        social_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "fixtures")
    elif args.social_dir:
        social_dir = args.social_dir
    else:
        print("ERROR: --social-dir or --fixture required", file=sys.stderr)
        return 2

    if not os.path.isdir(social_dir):
        print(f"ERROR: not a directory: {social_dir}", file=sys.stderr)
        return 1

    payload = aggregate(social_dir, top_n=args.top_n, cannib_window=args.cannibalization_window)

    date = payload["generated_at"][:10]
    base = args.output or os.path.join(social_dir, f"aggregate-report-{date}")
    if not base.endswith((".md", ".json")):
        md_path = base + ".md"
        json_path = base + ".json"
    else:
        md_path = base.rsplit(".", 1)[0] + ".md"
        json_path = base.rsplit(".", 1)[0] + ".json"

    payload["state_delta"]["report_path_md"] = md_path
    payload["state_delta"]["report_path_json"] = json_path

    with open(json_path, "w") as f:
        json.dump(payload, f, indent=2, default=str)
    with open(md_path, "w") as f:
        f.write(render_markdown(payload, top_n=min(25, args.top_n)))

    print(f"✓ {json_path}", file=sys.stderr)
    print(f"✓ {md_path}", file=sys.stderr)
    print(
        f"  {payload['stats']['posts_processed']} posts · "
        f"{len(payload['scored_topics'])} scored · "
        f"{len(payload['cannibalization_clusters'])} cannib clusters · "
        f"{payload['state_delta']['trend_signals_exploding']} exploding · "
        f"{payload['runtime_sec']}s",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
