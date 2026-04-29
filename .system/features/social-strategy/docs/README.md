# Social Strategy — Research Docs

External knowledge audit collected before/during the social-strategy build. Use these to ground every implementation decision in cited prior art.

## Files

| File                                                             | What's in it                                                                                                                                                          |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [repos.md](repos.md)                                             | GitHub repo sweep — 50+ repos categorized by skill mapping, with fork candidates, license notes, and 2026-status flags                                                |
| [frameworks.md](frameworks.md)                                   | Methodology + framework sweep — content strategy, posting cadence, engagement scoring, trend math, hook archetypes, brand voice models, critique loops, anti-patterns |
| [integration-recommendations.md](integration-recommendations.md) | Synthesis: what to fork/vendor/borrow, mapped to specific skills + phases of the implementation proposal                                                              |

## Companion Docs (one level up)

| File                                                                                       | Purpose                                                               |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [../social-agents-implementation-proposal.md](../social-agents-implementation-proposal.md) | Master proposal — 7-phase pipeline, 11+ atomic skills, phase trackers |
| [../community-repos-extraction-notes.md](../community-repos-extraction-notes.md)           | Earlier extraction from `claude-blog` + `claude-seo` upstream repos   |

## How to Use

1. **Before designing a new skill** — check [repos.md](repos.md) for prior art, then [frameworks.md](frameworks.md) for the underlying methodology.
2. **Before approving a phase** — verify the phase has at least one cited reference in [integration-recommendations.md](integration-recommendations.md).
3. **Before adding to the implementation proposal tracker** — pull the recommended pattern from these docs so the work is grounded.

## Sweep Summary

- **Repos audited**: 50+ across 10 categories (agent frameworks, scrapers, trend detection, calendars, voice/persona, repurposing, factcheck, Claude skills marketplaces, prompt libs, orchestration)
- **Frameworks audited**: 12 categories (strategy frameworks, channel architectures, cadence, ER scoring, AI SOTA, trend math, hooks, repurposing, voice, cannibalization, critique loops, anti-patterns)
- **Top fork candidates identified**: 5
- **Pitfalls flagged**: 5+ (snscrape dead, scraper-ToS reality, AI slop loop, model collapse risk, awesome-list license rot)
