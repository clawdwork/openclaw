# Industry-Aware Delegation (D16)

Detect channel type → activate only relevant subagents. Saves ~30% of Phase 1 cost and avoids surfacing patterns that don't apply.

## Channel-type heuristic

The orchestrator infers `intake.channel_types[ch]` from the identity_line provided in Q2. Three buckets:

| Type        | Trigger words / signals in identity_line                         | Examples                |
| ----------- | ---------------------------------------------------------------- | ----------------------- |
| **founder** | "I'm…", "my journey", first-person framing, individual creator   | Elioth, Gary Vee        |
| **product** | brand name, "we…", platform/SaaS framing, multi-feature pitch    | Celavii, Modash, Notion |
| **utility** | tools/templates focus, "how to", "tutorials", demo-heavy framing | CutMaster, MKBHD-shorts |

If ambiguous, default to product. User can override at Q2 by appending `[type=founder]` etc.

## Subagent activation table

Per-Phase-1 (DISCOVER) spawn matrix gets pruned per type:

| Channel type | Activate                                           | Skip                                              |
| ------------ | -------------------------------------------------- | ------------------------------------------------- |
| founder      | IG, TikTok, X (single + thread), short-form video  | YouTube long-form (unless `yt:` handle in intake) |
| product      | IG (reel + carousel), TikTok, YT short, YT long, X | (none — full matrix)                              |
| utility      | TikTok, IG reel, YT short                          | X threads, YT long, IG carousel (low fit)         |

Phase 5 (DELIVER) uses the same map for brief format choices: a founder channel won't get YT-long briefs unless explicitly listed in the intake handles.

## Hook archetype affinity per type

Drives Phase 4 PLAN (D21) and Gate B (D10) preference:

| Type    | Preferred archetypes           | Discouraged                          |
| ------- | ------------------------------ | ------------------------------------ |
| founder | Story + Authority              | (none — broad latitude)              |
| product | Authority + Curiosity Gap      | heavy Pattern Interrupt (off-brand)  |
| utility | Pattern Interrupt + Contrarian | long Story (loses the demo audience) |

These match the channel affinity rules already encoded in `social-aggregate/references/archetype-patterns.md`. The aggregator surfaces actuals; the planner enforces preferences.

## E-mix targets per type

Default seed for `intake.channel_e_mix_targets` (per [`social-aggregate/references/4e-classifier.md`](file:///Users/operator/dev/openclaw/skills/social-aggregate/references/4e-classifier.md)):

| Type    | Educate | Entertain | Engage | Empower |
| ------- | ------- | --------- | ------ | ------- |
| founder | 30%     | 25%       | 25%    | 20%     |
| product | 50%     | 10%       | 15%    | 25%     |
| utility | 60%     | 20%       | 15%    | 5%      |

Gate B fails if actual calendar mix drifts >15% from target.

## When industry-aware misroutes

If the inferred type produces a too-narrow spawn matrix (e.g. founder gets only 3 spawns, leaves YouTube traffic on the table), user can:

1. Add a YouTube handle in Q2 → activates the YT-long subagent for that channel
2. Override at command time: `/social_strategy --channel-type celavii=founder` (forces a different bucket)
3. Skip industry-aware filtering entirely: `/social_strategy --no-industry-filter` (full 12-spawn matrix)
