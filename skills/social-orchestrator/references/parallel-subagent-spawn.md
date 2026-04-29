# Parallel Subagent Spawn (D15)

Pattern from claude-seo `/seo audit` — 15-parallel-subagent spawn for independent research workstreams. Adapted for Phase 1 DISCOVER.

## Why parallel

Sequential spawn for (3 channels × 4 platforms) = 12 sequential subagent runs at ~45s each = **~9 min wall time**. Parallel spawn: ~45s wall time (longest single subagent) — **12× faster** and leverages the 15-parallel cap that the harness allows.

## Spawn matrix

For each (channel, platform) tuple:

```
spawn(
  subagent_type="general-purpose",
  description="discover {channel} {platform}",
  prompt="""
You are running Phase 1 DISCOVER for {channel} on {platform}.

Inputs (already on disk from Phase 0):
- raw/celavii-{handle}-{platform}-profile-*.json
- raw/celavii-{handle}-{platform}-posts-*.json

Tasks:
1. Read the profile JSON; extract followers, ER, posts/week, format mix.
2. Read the posts JSON; tag each post's hook by archetype (use social-aggregate.tag_archetype).
3. Compute {platform}-specific engagement rate per the per-platform formula in voice.json.
4. Call `social-trend-detect run --platform {platform} --channel {channel}` for live trend signals.
5. Return a JSON slice ready to merge into state.phases.discover.baselines.{channel}.{platform}.

Constraints:
- Tier 0 only (no /scrape/followers, no Apify)
- No LLM-based analysis — pure deterministic extraction
- Hard timeout: 60s

Output exactly the JSON slice; no preamble.
"""
)
```

Spawn all (channel × platform) tuples in a single message with multiple Agent tool uses (the harness runs them concurrently per the parent prompt's "if there are no dependencies between them" rule).

## Industry-aware filtering (D16 dovetail)

Before spawning, prune the spawn matrix per `intake.channel_types[]`:

| Channel type | Skip these (channel × platform) combos            |
| ------------ | ------------------------------------------------- |
| founder      | (channel, youtube-long), (channel, x-thread-only) |
| product      | (none — full matrix)                              |
| utility      | (channel, x-thread), (channel, youtube-long)      |

A 3-channel project with default founder+product+utility mix typically prunes to ~9 spawns instead of the full 12.

## Result aggregation

After all subagents return, the orchestrator merges slices into `state.phases.discover.baselines`. If any subagent returned an error, the orchestrator surfaces that platform-channel as a failure but continues — partial DISCOVER is acceptable input to AGGREGATE.

## When NOT to use parallel spawn

- Phase 0 ACQUIRE — has dependencies (handle resolution must precede profile pull)
- Phase 5 DELIVER — per-post brief generation is independent and parallelizable, but each brief consumes ~30s; parallelizing 25 briefs would saturate harness limits and is not recommended
- Phase 6 REPORT — single Next.js scaffold; not parallel
