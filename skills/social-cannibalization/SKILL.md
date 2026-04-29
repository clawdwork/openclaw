---
name: social-cannibalization
description: >
  Detect overlapping/duplicate content across channels and within a 30-day
  rolling window. Embeds posts (text-embedding-ada-002 or Voyage), computes
  cosine similarity matrix per channel, flags pairs >0.85 within window.
  Also checks cross-channel overlap (Elioth ≠ Celavii ≠ CutMaster). Replaces
  Gate B's manual cannibalization check.
user-invocable: true
metadata:
  {
    "openclaw":
      { "emoji": "🎯", "requires": { "env": ["OPENAI_API_KEY"] }, "primaryEnv": "OPENAI_API_KEY" },
  }
---

# social-cannibalization

> **Phase B15.** Method from [The Ad Firm — AI Cannibalization via Embeddings](https://www.theadfirm.net/how-ai-tools-can-detect-cannibalization-and-fix-internal-competing-keywords-2/) + algorithm pattern from [`jmelm93/seo_cannibalization_analysis`](https://github.com/jmelm93/seo_cannibalization_analysis). Adds the social-specific _temporal_ dimension SEO tools miss.

## Why This Skill Exists

Two near-identical posts 3 days apart = bad (cannibalize own audience). Same posts 90 days apart = fine. Static cosine similarity isn't enough — we need similarity × temporal proximity.

## The Algorithm

```
For each post in state.phases.plan.publication_calendar:
    embed(post.body + post.hook + post.hashtags)  # text-embedding-3-small or Voyage

For each (post_a, post_b) pair where same channel + |scheduled_for_a - scheduled_for_b| ≤ 30 days:
    cosine = cosine_similarity(emb_a, emb_b)
    if cosine > 0.85:
        flag (post_a, post_b, cosine, days_apart)

For each (post_a, post_b) pair where different channels:
    cosine = cosine_similarity(emb_a, emb_b)
    if cosine > 0.80:                      # tighter cross-channel threshold
        flag (post_a, post_b, "cross-channel", cosine)
```

## Modes

### Mode A — Pre-publish check

Before approving a brief, check it against the rolling 30-day window for the same channel.

```bash
social-cannibalization check --brief content/social/briefs/celavii-ig-001-brief.md
# Returns: { conflicts: [...], max_cosine: 0.72, status: pass }
```

### Mode B — Calendar audit (Gate B)

After Phase 4 (Plan), audit the entire publication calendar for cannibalization conflicts.

```bash
social-cannibalization audit --calendar state.phases.plan.publication_calendar
# Outputs: research/social/cannibalization-audit-{date}.md
```

### Mode C — Cross-channel overlap

Verify Elioth / Celavii / CutMaster are sufficiently distinct.

```bash
social-cannibalization cross-channel --window 30d
# Returns per-pair channel overlap percentage
```

Acceptable: <20% pillar overlap, <15% post-text overlap (per Gate A `channel_distinctiveness` check).

### Mode D — Historical scan (drift)

Scan published posts (last 90 days) for recurring patterns. Used by `social-drift` Mode B.

```bash
social-cannibalization historical --channel celavii --window 90d
```

## Embedding Choice

| Provider | Model                    | Cost (per 1M tokens) | Notes                           |
| -------- | ------------------------ | -------------------- | ------------------------------- |
| OpenAI   | `text-embedding-3-small` | $0.02                | Default — cheapest tier 1       |
| OpenAI   | `text-embedding-3-large` | $0.13                | If higher fidelity needed       |
| Voyage   | `voyage-3`               | varies               | Fallback if OpenAI quota issues |

Embeddings are **cached** at `~/.cache/claude-social/embeddings/{post_id}.json` keyed by content hash. Re-runs skip.

## Thresholds

| Comparison                  | Threshold    | Action                               |
| --------------------------- | ------------ | ------------------------------------ |
| Same channel, ≤7 days apart | cosine ≥0.80 | Hard fail (block calendar)           |
| Same channel, 8–30 days     | cosine ≥0.85 | Warn (request rewrite or reschedule) |
| Same channel, >30 days      | any          | Pass (encouraged: refresh evergreen) |
| Cross-channel               | cosine ≥0.80 | Warn (channels should be distinct)   |
| Cross-channel               | cosine ≥0.90 | Fail (likely misrouted post)         |

Thresholds tunable in `references/thresholds.json` (Phase B15.1).

## Output Schema

`research/social/cannibalization-audit-{date}.md`:

```markdown
## Cannibalization Audit — 2026-04-28

**Calendar window**: 2026-W18 → 2026-W22 (5 weeks)
**Posts analyzed**: 47
**Embeddings cached**: 47 (0 fresh, 47 reuse)

### Hard Fails (0)

None ✓

### Warnings (2)

#### W1 — Same channel, 12 days apart

- Channel: celavii
- Post A: celavii-ig-014 (2026-05-04) — "How to read TikTok analytics"
- Post B: celavii-ig-022 (2026-05-16) — "TikTok analytics deep dive"
- Cosine: 0.87
- Days apart: 12
- Recommendation: differentiate angle OR reschedule B by 30+ days

[...]

### Cross-channel Overlap

| Channel pair        | Posts compared | Max cosine | Status                                                                                |
| ------------------- | -------------- | ---------- | ------------------------------------------------------------------------------------- |
| Elioth × Celavii    | 23             | 0.62       | ✓ Pass                                                                                |
| Elioth × CutMaster  | 23             | 0.45       | ✓ Pass                                                                                |
| Celavii × CutMaster | 35             | 0.71       | ⚠️ Watch (boundary case, Celavii product tutorials and CutMaster shorts on same tool) |
```

State writes:

- `state.phases.aggregate.conflicts[]` — append cosine conflicts
- `state.gates.B.checks[].id == "no_cannibalization"` — pass/fail flag

## Integration

- Called by Gate B (Phase 4 → Phase 5 transition)
- Called pre-publish by Gate C per-post
- Output feeds `social-drift` (records cannibalization rate over time as drift signal)
- Embeddings cache shared with `social-research` (same caching layer)

## References

- `references/algorithm.md` — full pseudocode + edge cases
- `references/thresholds.json` — tunable threshold table
- `references/embedding-providers.md` — OpenAI vs Voyage selection
- `references/cross-channel-rule.md` — derivation of cross-channel thresholds

## Status

- [x] SKILL.md scaffold (this file) — Phase B15 contract
- [ ] `scripts/cannibalization.py` — embed + cosine + temporal-window check (Phase B15.1)
- [ ] Embedding cache layer (Phase B15.1)
- [ ] Cross-channel mode (Phase B15.1)
- [ ] Smoke test against the existing v2 social-strategy-state content_queue (Phase B15.2)
