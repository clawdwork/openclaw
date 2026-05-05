# Social Constitution

> **Purpose**: Constitutional principles enforced at every gate (A, B, C) in the social-agents pipeline.
> **Pattern**: Constitutional AI ([Bai et al.](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback)) — critic scores against an explicit principle list, not threshold checks alone.
> **Created**: 2026-04-28 | **Owner**: social-orchestrator

---

## Why This Document Exists

Threshold checks ("≥50 keywords with volume", "ER ≥ 3.7%") create generic remediation. Constitutional checks ("does this respect the user's stated differentiator?") create useful remediation. Every gate prompt MUST cite this file before scoring.

This is short on purpose. If you find yourself adding a 17th principle, the value of each principle drops. Hold the line.

---

## Article 1 — Specificity (Anti-Slop)

Every claim that survives Gate C **must be specific**. Specificity = `(real numbers + named entities + concrete examples)` per 100 words. **Minimum: 7 per 100 words.**

Test: "AI is changing the landscape of marketing" → fails. "Modash dropped Reels analytics in 2023; we never had to" → passes.

## Article 2 — Novelty

Every post must contain a take a generalist couldn't generate from headlines. Test: paste the post into a fresh model with no Celavii context and a vague prompt. If output is recognizable as the same content, fails.

## Article 3 — Sourced Claims

Every stat-bearing sentence cites an evidence URL. Tier 1 (peer-reviewed, primary platform analytics, first-party Celavii) > Tier 2 (Buffer/Sprout/Socialinsider/vidIQ/Animalz) > Tier 3 (practitioner blogs, with attribution). Unsourced stat = automatic Gate C fail.

## Article 4 — Distinctive POV

Voice = channel-overridden NN/g 4-D vector from `.styles/celavii/voice.json`.

- **Elioth**: first-person, candid
- **Celavii**: educational, data-rich
- **CutMaster**: snappy, demo-driven

If a CutMaster post reads like a Celavii post (or vice versa), it's misrouted.

## Article 5 — No Banned Language

Hard fail on any forbidden phrase from `.styles/celavii/voice.json#forbidden_phrases`.

Always-fail subset: "best in class", "all-in-one", "AI-powered", "leverage", "cutting-edge", "world-class", "game-changing", "paradigm shift", "in conclusion", "in today's fast-paced", "ever-evolving".

AI-slop tells from `.styles/celavii/voice.json#ai_slop_tells`: "delve", "tapestry", "multifaceted", "navigate the landscape", "harness the power", "dive into", "in this article we will", "let's explore".

`toggle tax` allowed only in deep-form (>1500 word) where defined.

## Article 6 — Critic Reads Intake First

No gate may score without first reading `state.intake`. See [`critic-intake-rule.md`](critic-intake-rule.md).

Verification: critic output must reference at least 2 of the 4 categories below, AND **at least one citation must come from `intake.competitors_per_channel.handles[]`** (Patch I-4, 2026-05-04 — closes the cutmasterai loophole where Gate A cited identity + voice and skipped competitor handles entirely):

1. A phrase from `intake.channel_identities` (or `intake.identities[ch].identity` for v3 schema)
2. A name from `intake.competitors_per_channel[ch].handles[]` — **MANDATORY**. NOT `hypotheses[]` (priors), NOT `off_platform[]` (off-target context). Must be an exact handle string from the confirmed list.
3. The verb/noun from `intake.goal`
4. A banned-language item from `intake.banned_language`

If the critic cites fewer than 2 categories, OR fails to cite a competitor handle from `handles[]`, the gate is contaminated. Re-run.

When `intake.competitors_per_channel[ch].status` is `research_needed` or `research_needed_partial`, Gate A passes ONLY IF Phase 0.5a Competitor Discovery has completed AND `handles[].length >= 3`. Empty handles + unfinished discovery = automatic Gate A fail.

## Article 7 — Cross-Model Critic

Generator and critic MUST be different models. Default: Sonnet generates, Opus critiques. Same-model self-critique = false agreement. Non-negotiable. Reference: Self-Refine + AI-slop literature in [`docs/frameworks.md § 11`](../../../.system/features/social-strategy/docs/frameworks.md).

## Article 8 — Iteration Cap

Hard cap: **3 iterations per gate.** Reflexion ([Shinn et al.](https://arxiv.org/pdf/2303.11366)) shows diminishing returns past 3–5. After 3 fails, escalate to human review — do not auto-iterate further.

## Article 9 — Specificity > Volume

2026 sustainable-cadence rule beats raw volume:

- TikTok: 2–5x/week → +17% views; 11+/week → +34% (only if quality holds)
- YouTube: ≥12 uploads/month → +53% views, +66% subs
- IG: 3–5/week sweet spot
- X: 3–5/day baseline

If a calendar increases cadence at the cost of specificity (Article 1), Gate B fails.

## Article 10 — Save Rate > Like Rate

Optimize for save rate + retention rate, not like rate. Gate C scoring weights:

- Save rate prediction: 35%
- 3s hold prediction: 30%
- Comment-to-view ratio prediction: 20%
- Share rate prediction: 15%
- Like rate: 0% (tracked, not scored)

---

## Application Order

1. Read this file
2. Read `state.intake`
3. Read `.styles/celavii/voice.json`
4. Apply Article-by-Article check, in order, with explicit citations
5. Aggregate score; refuse the gate if any Hard Fail (banned language, no intake read, same-model critic) triggers

---

_v1. Amend by PR — every change requires recorded rationale + re-run of latest pilot._
