---
name: social-persona
description: >
  Brand voice modeling and enforcement for social content. Encodes the NN/g 4-dimension
  Tone of Voice framework + Mailchimp tone-by-context matrix. Two modes —
  `discover` (extract voice from sample posts) and `enforce` (lint content against the
  voice JSON). Source-of-truth for the voice spec is `.styles/celavii/voice.json`.
user-invocable: true
metadata: { "openclaw": { "emoji": "🗣️", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-persona

Patterned on the Anthropic [knowledge-work-plugins/marketing/skills/brand-voice](https://github.com/anthropics/knowledge-work-plugins/tree/main/marketing/skills/brand-voice) skill, adapted for the social-agents pipeline. NN/g 4-D voice model + Mailchimp tone-by-context.

> **Phase A14 status**: scaffolded shell. Reference files in `references/` will be filled in Phase B13 by porting from upstream MIT-licensed source. License attribution in `references/NOTICE.md`. Voice JSON spec lives at `~/dev/workspace/.styles/celavii/voice.json`.

## Modes

### Mode A — Discover

Extract a brand voice from a sample of existing posts.

**Inputs**: ≥10 sample posts (md or text)
**Process**:

1. For each post, score on the NN/g 4-D vector (humor, formality, respectfulness, enthusiasm) in `[-1, 1]`
2. Compute median + std-dev across the sample
3. Identify recurring forbidden phrases, distinctive vocabulary, structural rules
4. Output a draft `voice.json` for user review

**Output**: `.styles/{brand}/voice.draft.json`

### Mode B — Enforce

Lint a single post or brief against the active `voice.json`.

**Inputs**: post path or stdin text + `--voice` (defaults to `.styles/celavii/voice.json`)
**Process**:

1. Load voice JSON
2. Detect channel from filename or `--channel` flag → apply `channel_overrides`
3. Apply `tone_by_context` if context flag set (e.g. `--context to_competitors`)
4. Lint:
   - Forbidden phrases (Hard fail)
   - AI-slop tells (Warning)
   - Specificity score < `min_specificity_score` (Hard fail)
   - Sentence/paragraph length caps (Warning)
   - First-person/third-person rule per channel (Warning)
5. Score the post on the 4-D vector and compare against (channel-adjusted) target — flag any axis off by >0.30

**Output**: pass/warn/fail JSON report + suggestions inline

## Voice Spec Location

- Spec: `~/dev/workspace/.styles/celavii/voice.json` (single source of truth)
- Hooks integration: `~/dev/openclaw/.system/features/social-strategy/hooks/validate-social-content.py` consumes `forbidden_phrases` + `ai_slop_tells`

## Default voice.json (Phase A15 shipped)

- 3-channel overrides (Elioth / Celavii / CutMaster)
- 6 tone contexts
- 14 forbidden phrases + 9 AI-slop tells
- Structural rules (max sentence 28 words, paragraph 60 words, specificity ≥7/100)

## CLI (Phase B13)

```bash
social-persona discover --samples projects/celavii/content/blog/published/*.mdx \
  --output .styles/celavii/voice.draft.json

social-persona enforce --file projects/celavii/content/social/briefs/celavii-ig-001-brief.md \
  --channel celavii \
  --context to_marketers
```

## References

- `references/NOTICE.md` — vendored-skill attribution
- `references/nngroup-4d.md` — full 4-dimension framework with examples (B13)
- `references/discover-process.md` — voice extraction methodology (B13)
- `references/enforce-checklist.md` — lint rule catalog (B13)

## Status

- [x] Skill scaffold (this file)
- [x] Voice JSON spec (`.styles/celavii/voice.json`)
- [ ] Vendored discover/enforce SKILL.md from Anthropic upstream — Phase B13
- [ ] CLI implementation — Phase B13
- [ ] Wired into `social-quality` Gate C — Phase B8 / B13
