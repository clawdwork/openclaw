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

## Single-channel fast path (D15.1)

Surfaced from cutmasterai dry-run (2026-05-04, Finding 19): when the spawn matrix after D16 pruning has **≤2 (channel × platform) tuples**, skip the parallel-spawn infrastructure entirely. Run the work inline in the orchestrator's main context.

Rationale: parallel-spawn pays for itself by amortizing harness coordination overhead across many concurrent subagents. With 1 tuple, the orchestrator pays setup cost (spawning, prompt construction, JSON merge) for zero parallelism benefit. With 2 tuples, the breakeven is borderline; defer to inline as the simpler path.

```
matrix_size = sum(1 for ch in channels for p in platforms_per_channel[ch] if not pruned_by_d16(ch, p))

if matrix_size <= 2:
  # Inline path — no Agent spawns
  for ch, p in matrix:
    discover_inline(ch, p)  # run the same logic as the subagent prompt, in main context
else:
  # Parallel path — original D15
  spawn_all(matrix)
```

State writes are identical between paths; the inline path just skips the spawn/merge ceremony. Findings logged from inline runs use the same shape.

When `len(channels) == 1` AND `len(platforms_per_channel[ch]) == 1` AND the channel is `pre_launch=true`, an additional simplification applies: the inline run draws **all** signal from competitor + hashtag-seed data (per Patch A pre-launch branch), so the per-tuple subagent prompt's "read profile + posts JSONs" tasks are skipped — there are no profile/posts JSONs.

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
