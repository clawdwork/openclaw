# Critic Intake Rule (Non-Negotiable)

> **Source of lesson**: [seo-strategy/v1/DRY-RUN-TEST-FINDINGS.md § Finding 1](../../../../.system/features/seo-strategy/v1/DRY-RUN-TEST-FINDINGS.md)
> **Why this rule exists**: SEO Gate A failed twice in dry-run because the critic operated context-free. Don't repeat it.

## The Rule

Before running ANY check in any gate (A, B, or C), the critic MUST read and internalize:

1. **`state.intake.channels`** — what channels exist and their per-platform handles
2. **`state.intake.channel_identities`** — what each channel is FOR (Elioth ≠ Celavii ≠ CutMaster)
3. **`state.intake.goal`** — what the user is trying to achieve
4. **`state.intake.competitors_per_channel`** — who's in the competitive set
5. **`state.intake.voice_rules_ref`** — load the voice JSON it points to
6. **`state.intake.banned_language`** — the forbidden phrase list

## Why

Threshold checks alone create generic remediation:

> "You have 49 keywords with volume. Need 50. Run more keyword_ideas."

Intake-aware checks create useful remediation:

> "You have 49 keywords with volume. The user's stated differentiators are agentic workflows + pay-as-you-go. Only 8 of your 49 keywords reflect those concepts. Re-run with seeds drawn from differentiators."

Same gap; very different fix.

## Implementation Requirement

Every gate prompt template must begin with:

```
You are critiquing the {phase_name} output. Before you score:

1. Load state.intake from {state_path}
2. Internalize the channel identities, voice rules, banned language
3. Cross-reference any gap or concern against the intake — does it relate to a stated differentiator? a competitor? the goal?
4. ONLY THEN apply the threshold checks below.

If you score without reading intake, the score is invalid and the gate fails by definition.
```

## Verification

After every gate run, verify the critic's output references at least 2 of:

- a phrase from `intake.channel_identities`
- a name from `intake.competitors_per_channel`
- the verb/noun from `intake.goal`
- a banned-language item from `intake.banned_language`

If none appear, the gate is contaminated. Re-run with a stricter prompt.
