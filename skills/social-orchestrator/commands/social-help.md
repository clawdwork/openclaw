---
description: List all available social commands with usage, inputs, and expected results
argument-hint: "[command-name]"
---

# /social-help

Show all available social commands or get detailed help for a specific command.

## Help

If the first argument is `help` or no arguments provided, print this block verbatim and stop:

```
/social-help — List all social commands or get help for a specific one

USAGE:  /social-help [command-name]

EXAMPLES:
  /social-help                Show all commands
  /social-help social-curate  Show detailed help for that command
  /<any-command> help         Same thing — works on any command
```

## Trigger

User runs `/social-help`, asks "what social commands are available?", "list social tools", "help", or "what can you do for social?".

If a specific command name is provided (e.g. `/social-help social-strategy`), read that command's `## Help` section and print it.

If no command name is provided, print the full directory below.

## Full Command Directory

Print this block verbatim:

```
SOCIAL COMMAND DIRECTORY
========================

STRATEGY & PLANNING
  /social_strategy                    Full 7-phase social strategy pipeline
                                       ACQUIRE → DISCOVER → ANALYZE → AGGREGATE
                                       → PLAN → DELIVER → REPORT  (~2-3 hr, ~$11.70 + ~$1 Apify)
  /social_strategy resume             Continue from checkpoint
  /social_strategy phase=N            Run a specific phase only (0-6)
  /social_strategy gate=a|b           Re-run a gate against current state
  /social_strategy refresh            Quarterly refresh (skips intake)

WEEKLY PRODUCTION
  /social_curate week=YYYY-Wnn        Curate one ISO week — research, briefs, hooks,
                                       scripts, shotlists, Gate C  (~22 min, ~$6.80/week typical)
  /social_curate week=current         Alias for current ISO week
  /social_curate week=next            Alias for next ISO week
  /social_curate resume               Continue last incomplete week
  /social_curate week=... dry-run     Cost estimate without execution

SINGLE-POST
  /social_post post_id={id}           Regenerate a single calendar entry
                                                       (~4 min, ~$0.66 static / ~$1.16 video)
  /social_post post_id=... force=true Re-curate even if Gate C ≥ 7.5
  /social_post post_id=... ad-hoc ... One-off post not in the calendar
  /social_post post_id=... only=hooks Run only one sub-skill (hooks|brief|script|shotlist|gate-c)

ATOMIC SKILLS (callable directly via "use {skill-name}")
  social-discover                     Profile/hashtag/location discovery (Tier 0/1/2)
  social-competitor-scrape            Competitor baselines + top-posts + cross-platform
  social-trend-detect                 Velocity + acceleration + z-score over time-series
  social-aggregate                    Phase 3 deterministic aggregator (Python, <5s)
  social-research                     Per-week research packets + per-post citations
  social-brief                        Per-post briefs (hooks, beats, CTA, hashtags, e_tags)
  social-hooks                        5+ hook variants, archetype-tagged + scored
  social-script                       Long-form video scripts + 8-pass humanizer
  social-shotlist                     Camera/b-roll/on-screen-text breakdown (ClipsAI)
  social-quality                      Critic gates A/B/C + silo-check
  social-persona                      NN/g 4-D voice extraction + enforcement
  social-drift                        SQLite baseline + 17-rule drift detection
  social-factcheck                    Loki + RefChecker AI-fabricated stat detection
  social-cannibalization              Cosine + 30d temporal cannibalization
  social-sxo                          Platform-fit ("does this deserve to engage?")
  social-plan                         Calendar + Gary Vee Reverse Pyramid + cadence rules
  social-repurpose                    Cross-channel adaptation; ClipsAI for video lane

HELP
  /social-help                        This directory
  /<any-command> help                  Detailed help for that command

TIP: Most atomic skills are contract-only today (SKILL.md, no scripts yet).
     The orchestrator falls back to primitives — see § Skill Implementation Status
     in social-orchestrator/SKILL.md. First runs are slower and more verbose;
     that's expected ("harden as we go" mode).

     Strategy state file:    projects/celavii/research/social/social-strategy-state.json
     Output bundle pattern:  projects/celavii/deliverables/handoffs/social-week-{YYYYWW}.zip
```
