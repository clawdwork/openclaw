# Critic Intake Rule (Non-Negotiable)

> **Source of lesson**: [seo-strategy/v1/DRY-RUN-TEST-FINDINGS.md § Finding 1](../../../../.system/features/seo-strategy/v1/DRY-RUN-TEST-FINDINGS.md)
> **Why this rule exists**: SEO Gate A failed twice in dry-run because the critic operated context-free. Don't repeat it.

## The Rule

Before running ANY check in any gate (A, B, or C), the critic MUST read and internalize:

1. **`state.intake.channels`** — what channels exist and their per-platform handles
2. **`state.intake.channel_identities`** — what each channel is FOR (Elioth ≠ Celavii ≠ CutMaster)
3. **`state.intake.goal`** — what the user is trying to achieve
4. **`state.intake.competitors_per_channel`** — who's in the competitive set. Each channel entry has shape `{handles: [], status: "user_provided" | "research_needed" | "research_needed_partial" | "research_complete", confirmed_at, hypotheses}`. The critic MUST check the `status` field before scoring:
   - `user_provided` / `research_complete` → handles[] is authoritative; cite at least one in the verification step
   - `research_needed` / `research_needed_partial` → handles[] may be empty. Gate A passes ONLY IF `state.phases.acquire.competitor_discovery.status == "complete"` AND `handles[].length >= 3`. Otherwise fail the gate with reason: "competitor discovery did not complete; cannot score against an empty competitor set"
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

After every gate run, verify the critic's output references at least 2 of the categories below, AND at least one citation MUST be from `intake.competitors_per_channel[ch].handles[]` (Patch I-4, 2026-05-04):

- a phrase from `intake.channel_identities`
- **a name from `intake.competitors_per_channel[ch].handles[]` — MANDATORY** (NOT `hypotheses[]`, NOT `off_platform[]` — those are unconfirmed priors and off-platform context, neither is citeable). Must be an exact handle string.
- the verb/noun from `intake.goal`
- a banned-language item from `intake.banned_language`

If none appear, the gate is contaminated. Re-run with a stricter prompt.

## Baselines vs Projections (added 2026-05-04 from cutmasterai dry-run, Finding 23)

Gate A receives `state.phases.discover.baselines` AND `state.phases.discover.projections` as separate fields. The critic MUST treat them differently:

| Field         | Source                                                            | Use in scoring                                                                                                                                        |
| ------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baselines`   | Real scrape data — what the channel/competitors actually do today | Ground truth. Cite directly. Compare against goal; flag gaps.                                                                                         |
| `projections` | Intake-synthesized targets for pre-launch channels                | Aspirational. NOT cite-able as "what the channel does." Gate scoring shifts to "are these targets internally consistent and ambitious-but-realistic?" |

`state.phases.discover.data_source[ch][p]` tells the critic which mode applies:

- `measured` → score against baselines; flag goal/baseline gap
- `projections_only` → score the projections themselves (consistent? matches differentiators? cadence achievable per Article 9?). Do NOT compare projections to baselines (there are none).
- `partial` → score measured fields normally; flag missing fields explicitly rather than substituting projections

Cardinal sin: citing a projected value as if measured. Example fail: "Cutmaster has 3 posts/week" (no it doesn't — it has 0; the projection is 3). Correct framing: "Cutmaster's projected cadence is 3 posts/week, derived from intake; baseline is 0 (pre-launch)."
