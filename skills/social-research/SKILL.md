---
name: social-research
description: >
  Build per-week research packets for scheduled posts. Pulls Tier-1/2 sources,
  industry data, competitor angles, and trend signals into a single research
  doc per (week, channel, pillar). Sub-mode 'citations' extracts URL+claim
  pairs for the citation doc. Feeds social-brief.
user-invocable: true
metadata:
  {
    "openclaw":
      {
        "emoji": "📚",
        "requires": { "env": ["BRAVE_API_KEY", "FIRECRAWL_API_KEY", "CELAVII_API_KEY"] },
        "primaryEnv": "BRAVE_API_KEY",
      },
  }
---

# social-research

> **Phase B1 + B3.** Two skills folded into one (citation extraction is a sub-mode of research, not a separate skill — the research process IS the source-gathering process).

## Modes

### Mode A — Weekly research packet

```bash
social-research week --week 2026-W18 --channel celavii --pillar p-001-agentic-marketing
```

Pulls in parallel:

1. **Brave Search** for trending angles on the pillar topic (last 7 days, freshness=pw)
2. **Firecrawl `web_fetch`** on top 5 results for full-text extraction
3. **Celavii content search** (`/api/v1/content/search?query={pillar}&sort=date&since={week-7d}`) for what creators in the niche posted recently
4. **Celavii hashtag scrape** outputs (already in `raw/celavii-hashtag-*-*-*.json`) for trending hashtags this week
5. **Trend signals** from `state.phases.discover.trend_signals` (any z>2 in this niche)

Output: `content/social/research/{week}-{channel}-{pillar}-research.md`

```markdown
# Research Packet — 2026-W18 / celavii / agentic-marketing

## Hot Angles This Week (Tier 1+2 Sources)

1. [Anthropic's effective-context-engineering post](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — relevant to "agentic" pillar
2. [Buffer State of Social 2026](https://buffer.com/...) — TikTok cadence findings
3. ...

## What Competitors Posted (last 7 days)

- @modaberlin (TT): "If you're still using a 'database' tool..." — 12K likes
- @grin (X): launched new pricing thread — 800 RTs
- ...

## Trending Hashtags / Topics (z > 2)

- #agentic z=2.4 (Reddit + TikTok)
- #creatorintelligence z=2.1 (Twitter spike)

## Suggested Angles for This Week's Posts

1. Operator's first-day workflow (Elioth voice)
2. "5 dashboards in 1 prompt" demo (Celavii voice)
3. CutMaster: "Stop opening 6 tools. Watch this."

## Tier-1/2 Sources Inventory (8 sources)

| URL                                                     | Tier | Date    | Topic            |
| ------------------------------------------------------- | ---- | ------- | ---------------- |
| anthropic.com/engineering/effective-context-engineering | 1    | 2026    | agentic patterns |
| buffer.com/state-of-social-media-engagement-2026        | 2    | 2026-Q1 | TikTok cadence   |

[...]
```

### Mode B — Citation extraction (per-post)

After a brief is drafted, extract every stat-bearing or named-entity-bearing claim and map to a Tier-1/2/3 source.

```bash
social-research citations --brief content/social/briefs/celavii-ig-001-brief.md
```

Output: `content/social/research/{post-id}-citations.md`

This is the input to `social-factcheck` Mode A. Without a citation doc, factcheck has nothing to verify.

### Mode C — Pillar deep-dive (one-shot research for a new pillar)

When a new pillar is added to `state.phases.aggregate.pillars`, generate a foundational research doc for it.

```bash
social-research pillar --id p-001-agentic-marketing
```

Output: `research/social/pillar-{id}-foundation-{date}.md`

## Source Tier Policy (Constitution Article 3)

Pulled sources auto-tagged:

- **Tier 1**: arxiv.org, \*.edu, anthropic.com/research, openai.com/research, primary platform analytics
- **Tier 2**: buffer.com, sproutsocial.com, hubspot.com, hootsuite.com, animalz.co, socialinsider.io, vidiq.com
- **Tier 3**: justinwelsh.me, hormozi.com, opus.pro/blog, mewse.ai (require attribution in brief)
- **Tier 0 (rejected)**: content farms, undated, no clear author

## Research Quality Self-Check

A research packet is incomplete if:

- ≤3 Tier-1 or Tier-2 sources present
- No "competitor angle" section
- No trend-signal cross-reference
- All sources >6 months old (for non-evergreen pillars)

Self-check runs at end of Mode A; flag warnings inline.

## Integration

- Called by `/social_curate` Mode A (weekly research) for each scheduled pillar
- Called by `social-brief` as a prerequisite (brief skill refuses without research packet)
- Output consumed by `social-brief` (research → brief) and `social-factcheck` (research citations → verification)
- Reads `state.phases.aggregate.pillars` + `state.phases.discover.trend_signals` + `state.phases.plan.publication_calendar`

## Caching

Research packets are **cached for 24 hours** at `~/.cache/claude-social/research/{week}-{channel}-{pillar}.md`. Re-running within 24h returns cached version unless `--no-cache` flag. Saves Brave/Firecrawl API costs.

## References

- `references/source-tiers.md` — Tier 1/2/3 catalog with examples
- `references/research-template.md` — full markdown template
- `references/citation-extraction.md` — Mode B claim-extraction prompt

## Status

- [x] SKILL.md scaffold (this file) — Phase B1+B3 contract
- [ ] `scripts/research.py` — Mode A weekly-packet builder (Phase B1.1)
- [ ] `scripts/citations.py` — Mode B claim-to-source extractor (Phase B3.1)
- [ ] Source tier classifier (Phase B1.1)
- [ ] Caching layer (Phase B1.1)
- [ ] Smoke test on existing pillar in v2 state (Phase B1.2)
