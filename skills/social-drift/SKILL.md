---
name: social-drift
description: >
  Baseline + drift detection for social content. Tracks engagement metrics, post snapshots,
  follower trajectory, and voice-conformance over time using a SQLite cache. Detects
  regressions (engagement drop, deleted posts, caption edits, voice drift) and reports
  changes against rolling baselines. Pairs with social-persona for voice-side drift.
user-invocable: true
metadata: { "openclaw": { "emoji": "📉", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-drift

Patterned on [claude-seo/skills/seo-drift/](file:///Users/operator/dev/research/claude-seo/skills/seo-drift/) (SQLite baseline + 17-rule comparator). Adapted for social: tracks both metric drift (engagement) and content drift (caption edits, deleted posts, voice slippage).

> **Phase A14 status**: scaffolded shell. Phase B16 lands the SQLite schema, comparison rules, and reporting.

## Cache Location

```
~/.cache/claude-social/drift/
├── baselines.db            # SQLite: post snapshots + metrics
├── voice-snapshots.db       # SQLite: per-channel voice 4-D vectors over time
└── reports/                 # Daily/weekly drift reports
```

## What It Tracks

### Per-post (timestamped snapshots)

- Caption text (full)
- Hashtag list
- Like / save / comment / share / view counts
- Engagement rate (per-platform formula)
- Post status (live / deleted / hidden)
- Last-seen timestamp

### Per-channel (rolling baselines)

- Follower count delta
- Posts/week cadence
- Median engagement rate (rolling 30 / 90 day windows)
- Format mix shift (carousel→reel, etc.)
- Voice 4-D vector drift (vs. `.styles/celavii/voice.json` channel target)

## Drift Rules (17, planned — claude-seo seo-drift inspired)

### CRITICAL (block on appearance)

1. Post deleted within 7 days of publication
2. Engagement rate dropped >50% week-over-week
3. Follower count went negative >2% in a week
4. Banned phrase appeared in a published post (caught post-publish)
5. Channel posted 0× in a 14-day window
6. Voice 4-D vector axis flipped sign (was positive → became negative)

### WARNING (surface, don't block)

7. ER ↓20–50% W/W
8. ER < 50% of platform median for 2+ consecutive weeks
9. Caption edited >24h after publish
10. Cadence dropped >30% W/W
11. Format mix shifted >40% (e.g. all reels → all carousels)
12. Voice 4-D axis drifted >0.30 from channel target
13. New banned phrase added to voice.json that historical posts violate

### INFO (log only)

14. Hashtag set change >50% W/W
15. New top-performing post (>3× channel median)
16. New top-performing format
17. Competitor cadence change (if competitors tracked)

## Modes

### Mode A — `baseline`

Capture a fresh baseline. Runs at: initial setup, manual `social-drift baseline --channel celavii`, Phase H-YT activation.

### Mode B — `compare`

Compare current state to last baseline. Default: rolling 7-day window.

```bash
social-drift compare --window 7d --channel celavii
```

Output: `~/.cache/claude-social/drift/reports/{date}-{channel}.md`

### Mode C — `monitor`

Long-running mode (cron/launchd). Daily check, alert on CRITICAL drift.

```bash
social-drift monitor --channels elioth,celavii,cutmaster --frequency daily
```

### Mode D — `voice-drift`

Compare current channel voice against `.styles/celavii/voice.json` channel target. Calls `social-persona enforce` over last N posts → averages 4-D vector → reports per-axis drift.

## SQLite Schema (planned)

```sql
CREATE TABLE post_snapshots (
  id INTEGER PRIMARY KEY,
  post_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  platform TEXT NOT NULL,
  url_hash TEXT NOT NULL,
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  caption TEXT,
  hashtags JSON,
  metrics JSON,
  status TEXT,
  raw_file TEXT
);

CREATE INDEX idx_post_channel_time ON post_snapshots(channel, captured_at DESC);

CREATE TABLE channel_baselines (
  id INTEGER PRIMARY KEY,
  channel TEXT NOT NULL,
  platform TEXT NOT NULL,
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  followers INTEGER,
  median_er REAL,
  posts_per_week REAL,
  format_mix JSON,
  voice_4d JSON
);

CREATE INDEX idx_baselines_channel_time ON channel_baselines(channel, platform, captured_at DESC);
```

## Integration Points

- Reads raw files written by `social-discover` + `social-competitor-scrape` (no extra scraping)
- Calls `social-persona enforce` for voice-axis drift
- Outputs to `state.weekly_cycles[].drift_report` if attached to a weekly cycle
- Cron-friendly: idempotent, exits cleanly on no-change

## References (Phase B16)

- `references/NOTICE.md` — vendored-skill attribution
- `references/drift-rules.md` — full 17-rule catalog with thresholds
- `references/sqlite-schema.sql` — DDL for cache databases

## Status

- [x] Skill scaffold (this file)
- [ ] SQLite schema + DDL — Phase B16
- [ ] Drift-rule implementation — Phase B16
- [ ] Voice-drift mode (depends on B13 social-persona enforce CLI) — Phase B16
- [ ] Cron / launchd hookup — Phase G (pilot)
