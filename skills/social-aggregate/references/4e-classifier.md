# 4E Classifier (C8)

Educate / Entertain / Engage / Empower — per [docs/frameworks.md § 6](../../../.system/features/social-strategy/docs/frameworks.md). Pattern bank lives in `scripts/aggregate.py` (`E_PATTERNS`). A post can resolve to multiple E's.

## Educate

- "How to" / "Tutorial" / "Guide" / "Step by step"
- "Learn" / "Tip" / "Trick" / "Explain" / "Breakdown" / "Here's how"
- 5W1H informational triggers: what is, why, when, where, which
- "The difference between **_ and _**"

## Entertain

- Humor markers: lol, lmao, funny, joke, meme, hilarious, relatable
- "POV" / "This is me" — relatable-format triggers
- Sentence-initial "When **_" / "Me when _**" / "That moment when \_\_\_"

## Engage

- Direct CTAs: "Comment", "Tag a/your **_", "Share if _**"
- Solicitation: "Tell me", "Drop a/your \_\_\_", "What do you think"
- Polarization: "Am I the only one", "Agree or disagree"
- Trailing "?" (also a Curiosity Gap signal — the two overlap intentionally)

## Empower

- Capability frames: "You can **_", "You'll _**", "You're \_\_\_"
- Action-anti-passivity: "Stop waiting", "Stop asking", "Stop wondering"
- Ownership: "Take control", "Own (your|this) **_", "Build (your|the) _**"
- Time-bound: "Start today", "Start now", "Level up", "Unlock"

## Article 1 + Article 9 application

Constitutional **Article 9 — Specificity > Volume**: a calendar weighted heavily toward `entertain` only is the cadence-quality trap. Aggregator surfaces channel E-mix so Gate B can flag misbalanced calendars.

Celavii product-channel constraint: **≥2 distinct E's per planned post**. The aggregator marks single-E channels with a ⚠️ in the markdown report (`<2 E's` warning). Briefs that resolve to one E are auto-failed by `social-sxo` Mode B.

## Default mix targets per channel type

| Channel type        | Educate | Entertain | Engage | Empower |
| ------------------- | ------- | --------- | ------ | ------- |
| Founder (Elioth)    | 30%     | 25%       | 25%    | 20%     |
| Product (Celavii)   | 50%     | 10%       | 15%    | 25%     |
| Utility (CutMaster) | 60%     | 20%       | 15%    | 5%      |

These are seeded into `state.intake.channel_e_mix_targets`. Aggregator does not enforce — it reports actuals; `social-plan` (Phase 4) does the enforcement.
