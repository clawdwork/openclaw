---
name: social-brief
description: >
  Generate per-post briefs from research packets. Brief includes hook variants
  (5+, archetype-tagged), beats, CTA, hashtags, e_tags, success metric, and
  pillar reference. Mirrors blogger/blog-brief structure. Required input to
  social-script (video) and final copy generation in celavii-social.
user-invocable: true
metadata: { "openclaw": { "emoji": "📝", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-brief

> **Phase B4.** Mirrors [`blogger/blog-brief/`](file:///Users/operator/dev/workspace/skills/blogger/blog-brief/) structure.

## Inputs

- `--research` (required): research packet from `social-research`
- `--post-id` (required): canonical post ID, e.g. `celavii-ig-001`
- `--platform` (required): instagram | tiktok | x | youtube
- `--channel` (required): elioth | celavii | cutmaster

## Output Schema

`content/social/briefs/{channel}-{post-id}-brief.md`:

```markdown
---
post_id: celavii-ig-001
channel: celavii
platform: instagram
format: reel
scheduled_for: 2026-05-04T14:00:00-05:00
pillar_id: p-001-agentic-marketing
hub_or_pillar: atomic
e_tags: [educate, empower]
hook_archetype_target: authority
source_pillar_long_form: blog/agentic-shift-final.mdx
voice_context: to_marketers
---

# Brief: How a creator-intel agent runs a campaign while you sleep

## Hook (5 variants — see hooks.md)

Primary: "I scored 5K creator profiles last night. Here's what the agent found."

- Archetype: Authority Claim
- 3s-hold prediction: 0.78
- Score: 8.2

[4 more variants in companion hooks file]

## Beats (story arc)

1. **Cold open (0-3s)**: Hook + concrete number
2. **Tension (3-10s)**: "But here's why most agencies are still doing this manually..."
3. **Payoff (10-25s)**: Show agent in action — split-screen demo
4. **Stakes (25-35s)**: What this unlocks — speed, depth, cost
5. **CTA (35-45s)**: Try it / read the blog / join waitlist

## CTA

> "Watch the full agent demo at celavii.com/agent — link in bio"

## Hashtags (per channel formula: 1-2 branded + 3-5 industry-core + 2-3 silo + 1 trending)

Branded: #Celavii #CreatorIntelligence
Industry: #AIMarketing #InfluencerMarketing #AgenticAI
Silo: #AgenticMarketing #CreatorAlpha
Trending: #agentic (z=2.4 this week)

## Success Metric

- Saves: target ≥150 (channel median ×2)
- 3s retention: ≥45%
- Comments: ≥20

## Source Citations

See: content/social/research/celavii-ig-001-citations.md

## Notes from research packet

[brief excerpt of relevant angles from the research]
```

## Per-Channel Voice Application

Brief generation auto-applies channel voice from `~/dev/workspace/.styles/celavii/voice.json#channel_overrides`:

- **Elioth**: first-person, candid, vulnerability OK
- **Celavii**: educational, third-person, data-rich
- **CutMaster**: snappy, demo-driven, ~70% on-screen action

Tone-by-context (`to_marketers`, `to_creators`, etc.) layered on top per `--voice-context` flag.

## Required Sub-skill Calls

When `social-brief` runs, it invokes (in order):

1. **`social-hooks generate`** — produces 5+ hook variants → saves to `{channel}-{post-id}-hooks.md`
2. **`social-persona enforce`** — voice lint on draft hook + body
3. **`social-sxo format-fit`** — verify format/length compatible with platform
4. **`social-research citations`** — extract claims → generate citation doc

If any sub-skill returns hard fail, brief generation halts with the specific failure surfaced.

## Format-Specific Briefs

| Format                   | Extra fields                                              |
| ------------------------ | --------------------------------------------------------- |
| Reel / TikTok / YT short | beats, on-screen text per beat, b-roll cues               |
| Carousel                 | per-slide content, slide count (max 10), cover-slide copy |
| X thread                 | tweet-by-tweet outline, char count per tweet              |
| Long-form video          | full script outline (handoff to `social-script`)          |
| Static IG / X single     | single-line hook + caption                                |

## Integration

- Reads research packet from `social-research`
- Calls `social-hooks` + `social-persona` + `social-sxo` + `social-research citations`
- Output consumed by `social-script` (if video) and `celavii-social` (final copy generation)
- Updates `state.weekly_cycles[].posts[].brief_path`

## Cross-Channel Boilerplate Prevention

If two briefs in the same week have cosine >0.85 on hook + body, `social-cannibalization check` fires (called automatically). On hard fail, brief generation refuses with a "differentiate or reschedule" prompt.

## Brief Tiers (Patch L, added 2026-05-05 from cutmasterai dry-run F55)

Briefs come in two tiers. The orchestrator MUST tag each brief's `brief_type` in `state.phases.deliver.briefs[i].brief_type`.

| Tier       | Contents                                                                                                                                              | When to use                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `full`     | Frontmatter + context + 3 hook variants (with 3s-hold scores) + beats (Hook/Reveal/Depth/Stakes/Loop) + shot list + caption text + CTA + format notes | Posts tagged `phase: launch` (pre-launch first-N posts per Patch A). High production attention warranted.  |
| `skeletal` | Frontmatter + context + 1 hook + abbreviated beats + CTA. ~30% the bytes of `full`.                                                                   | Posts tagged `phase: steady_state` (after launch sequence). Cadence-driven; full briefs would be overkill. |

### Selection rule

```
brief_type = "full" if post.phase == "launch" or post.calendar_index < 10 else "skeletal"
```

The literal first-10 rule covers Patch A's launch sequence. Posts 11+ get skeletal unless explicitly upgraded by user request (e.g., a high-stakes feature-launch post mid-cadence).

### Override

User can override per-post via Telegram: `/upgrade_brief cutmaster-yt-007 full` flips a skeletal brief to full and triggers regeneration. State records `brief_type_override = {post_id, from, to, by_user, at}`.

### Anti-patterns

- ❌ Writing all skeletal because "we don't have full content yet" — full briefs for the launch sequence are the dry-run's most important deliverable, NOT optional
- ❌ Writing all full at scale — 50+ briefs full per quarter is unsustainable; skeletal is the steady-state mode
- ❌ Mixing tiers within the launch sequence (some launch posts full, others skeletal) — entire launch sequence should be one tier (full)
- ❌ Skipping `brief_type` field on the state entry — Phase 6 REPORT renders the two tiers differently and will misrender or crash without the tag

### Auto-derivation cutmasterai dry-run

cutmasterai Phase 5 produced 3 full + 9 skeletal. Per the rule, posts 1–10 should have been full and 11–12 skeletal. Agent's choice (1, 5, 8 full) was an undocumented economy. Post-Patch-L, this would re-run and produce 10 full + 2 skeletal.

## References

- `references/brief-template.md` — full markdown template per format
- `references/skeletal-brief-template.md` — skeletal markdown template (Patch L addition; abbreviated beats + 1 hook)
- `references/voice-context-map.md` — when to use each tone-by-context entry
- `references/success-metric-defaults.md` — channel-median targets

## Status

- [x] SKILL.md scaffold (this file) — Phase B4 contract
- [ ] `scripts/brief.py` — orchestrates the 4 sub-skill calls (Phase B4.1)
- [ ] Format-specific brief templates (Phase B4.1)
- [ ] Smoke test against existing v2 state content_queue (Phase B4.2)
