---
name: social-script
description: >
  Long-form video script writer (TikTok, IG Reel, YouTube short, YouTube
  long-form). Reads brief, expands beats into full spoken script + on-screen
  text + b-roll cues. Pairs with social-shotlist for shot-level production.
  Adopts adversarial 8-pass humanizer pattern.
user-invocable: true
metadata: { "openclaw": { "emoji": "🎬", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-script

> **Phase B6.** Adopts the 8-pass humanizer pattern from [`OpenClaudia/openclaudia-skills/Humanizer`](https://github.com/OpenClaudia/openclaudia-skills) (Phase B20).

## Inputs

- `--brief` (required): brief markdown
- `--target-length` (optional): seconds for short-form (default: per-platform)

## Output Schema

`content/social/scripts/{channel}-{post-id}-script.md`:

```markdown
---
post_id: celavii-tt-005
channel: celavii
platform: tiktok
format: short-video
target_length: 45s
voice_context: to_marketers
hook_archetype: authority
---

# Script: How a creator-intel agent runs a campaign while you sleep

## SPOKEN (45s total)

### [00:00–00:03] Hook

> "I scored 5,000 creator profiles last night."

- delivery: matter-of-fact, plain camera-direct
- on-screen: "5,000 PROFILES SCORED"
- b-roll: terminal scroll, fast cuts of profile cards

### [00:03–00:10] Tension

> "Most agencies are still doing this manually. Excel sheet. 6 dashboards. 4 hours per shortlist."

- delivery: drop pace; mild eye-roll
- on-screen: clock running 4:00:00
- b-roll: hands typing in spreadsheet, then "4 HOURS" overlay

[...beats continue...]

### [00:35–00:45] CTA

> "Try it free at celavii.com/agent — link in bio."

- delivery: warm, no upsell pressure
- on-screen: "celavii.com/agent" with arrow to bio
- b-roll: clean product shot

## NOTES

- Pacing: heavy first 3s (≥3 cuts), normal mid, calm CTA
- Tone overall: matter-of-fact with occasional dry wit (channel: celavii, slight pull toward operator)
- Forbidden: any AI-slop tells (delve, tapestry, etc.); see voice.json
```

## Platform-Specific Defaults

| Platform          | Target length | Hook window | Pacing             |
| ----------------- | ------------- | ----------- | ------------------ |
| TikTok            | 45–90s        | first 3s    | high cuts/min      |
| IG Reel           | 30–60s        | first 3s    | medium             |
| YouTube short     | 30–60s        | first 3s    | high               |
| YouTube long-form | 8–15min       | first 30s   | low/conversational |
| LinkedIn video    | 60–90s        | first 5s    | low/professional   |

## 8-Pass Humanizer (Phase B20)

After draft, apply 8 sequential passes:

1. **Specificity pass** — replace abstractions with concrete examples (Article 1)
2. **Banned-language pass** — strip forbidden phrases + AI-slop tells (Article 5)
3. **Sentence-length pass** — break sentences >28 words
4. **Voice pass** — lint against `voice.json#channel_overrides` 4-D vector
5. **First-person/third-person pass** — enforce per channel (Elioth/Cutmaster: 1st; Celavii: 3rd)
6. **Filler pass** — remove "in this post we", "today I want to", "let me tell you"
7. **Hook pass** — verify hook scores ≥7 on social-hooks rubric; regen if not
8. **Pacing pass** — verify cuts per second / pause distribution per format

Each pass logs delta. Final script is stamped with `humanizer_passes: 8/8` in frontmatter.

## Cross-Model Critic (Article 7)

If `social-script` runs in `--gated` mode, generator (Sonnet) drafts; critic (Opus) reviews per-pass output. Both must agree on each pass before advancing. Hard cap: 3 iterations per pass (Article 8).

## Integration

- Reads brief from `social-brief`
- Outputs to `content/social/scripts/{channel}-{post-id}-script.md`
- Consumed by `social-shotlist` (shot-level expansion)
- Consumed by `celavii-social` (final video generation pipeline)
- Updates `state.weekly_cycles[].posts[].script_path`
- Triggers `social-factcheck` Mode C (RefChecker) on completion

## Voice Profile Application

Reads `~/dev/workspace/.styles/celavii/voice.json` and applies:

1. Channel-override 4-D vector
2. `tone_by_context` from brief frontmatter (`voice_context: to_marketers` etc.)
3. Forbidden + slop lists (hard-fail filter)
4. Structural rules (max sentence words, first-/third-person)

## References

- `references/8-pass-humanizer.md` — full pass sequence with prompts (Phase B6.1)
- `references/pacing-cues.md` — per-platform pacing math
- `references/cross-model-critic.md` — Sonnet/Opus pass-handoff protocol

## Status

- [x] SKILL.md scaffold (this file) — Phase B6 contract
- [ ] `scripts/script.py` — script writer (Phase B6.1)
- [ ] 8-pass humanizer implementation (Phase B6.1, depends on B20)
- [ ] Cross-model critic mode (Phase B6.1, depends on Phase D18)
- [ ] Smoke test against existing pillar (Phase B6.2)
