# Decision 0002 — Wire trendsmcp/tiktok-trends-mcp

> **Status**: Specified — pending gateway settings update
> **Date**: 2026-04-28
> **Driver**: A17 of [social-agents-implementation-proposal.md](../social-agents-implementation-proposal.md)
> **Source**: [trendsmcp/tiktok-trends-mcp](https://github.com/trendsmcp/tiktok-trends-mcp)

## Goal

Expose live TikTok hashtag trend data (volume, velocity, growth spikes) to the gateway as MCP tools, consumed by `social-trend-detect` skill.

## Why MCP, Not a Scraper

- Built-in TikTok scrapers (`davidteather/TikTok-Api`) break every 2–4 weeks
- trendsmcp wraps live data at the protocol layer — drop-in, no maintenance
- Aligns with the extensions pattern (Phase J) — clean install + uninstall

## Required Steps

This is a gateway-config change. Proposing only — actual config write requires user approval.

### Step 1 — Verify license

```
gh repo view trendsmcp/tiktok-trends-mcp --json licenseInfo
```

If MIT/Apache, proceed. If unclear, fallback: `bellingcat/tiktok-hashtag-analysis`.

### Step 2 — Install the MCP server

Recommend isolated path:

```
~/.openclaw/mcp-servers/tiktok-trends/
```

Two install paths:

- **npx** (zero-install): `npx -y trendsmcp/tiktok-trends-mcp`
- **Local clone**: `git clone` for pinned-version control

### Step 3 — Register with gateway settings

Edit `~/.openclaw/settings.json`:

```json
{
  "mcpServers": {
    "tiktok-trends": {
      "command": "npx",
      "args": ["-y", "trendsmcp/tiktok-trends-mcp"],
      "env": {}
    }
  }
}
```

### Step 4 — Restart gateway

```
launchctl stop ai.openclaw.gateway && sleep 2 && launchctl start ai.openclaw.gateway
lsof -i -P | grep openclaw   # verify listening on 49152
```

### Step 5 — Verify tools surface

After restart, confirm tools appear with `mcp__tiktok-trends__*` prefix.

### Step 6 — Wire into `social-trend-detect`

Phase B10 calls these MCP tools. Pair with `readikus/ramekin` z-score math (port to `scripts/trend_math.py`) for velocity/acceleration.

## Open Questions

- Does trendsmcp require an API key (e.g. RapidAPI)? If so, log into `~/.openclaw/.env` and add to `SHELL_ENV_EXPECTED_KEYS`.
- Rate-limit profile? Document on first use.

## Risk + Fallback

- If trendsmcp breaks, `bellingcat/tiktok-hashtag-analysis` is the documented fallback — Phase B10 should support both.
- IG / X / YT trend detection still needs separate solutions:
  - **IG**: Apify hashtag scrapers via `extensions/apify-social/` (Phase J1)
  - **X**: native trends via twscrape / Scweet
  - **YouTube**: YouTube Data API once H-YT activates

## Action Items

- [ ] Verify license (5 min)
- [ ] Decide install path (npx vs clone) — recommend npx for v0
- [ ] Submit settings.json patch for user approval
- [ ] Document tool surface in `social-trend-detect/SKILL.md` (Phase B10)
- [ ] Add fallback to bellingcat package in B10
