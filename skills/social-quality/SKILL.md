---
name: social-quality
description: >
  Critic gates for the social-agents pipeline. One skill, three gates: Gate A
  (strategy alignment, post-Phase-3), Gate B (calendar + cannibalization,
  post-Phase-4), Gate C (per-post quality, pre-publish). Plus silo-check
  sub-mode. Enforces the 10-article Constitution. Cross-model critic
  (Sonnet generates, Opus critiques). 3-iteration cap.
user-invocable: true
metadata: { "openclaw": { "emoji": "🛂", "requires": { "env": [] }, "primaryEnv": null } }
---

# social-quality

> **Phase B8 + B9 + B19 + B20 + B21 — folded into one skill.** Three gates + silo-check + humanizer hook + RefChecker hook.
> **Critic config**: cross-model (Sonnet ⊥ Opus) per Constitution Article 7. 3-iteration cap per Article 8.

## CRITICAL: Critic-Reads-Intake First (Article 6)

Before running ANY check in any gate, the critic MUST read:

1. `state.intake.channels`
2. `state.intake.channel_identities`
3. `state.intake.goal`
4. `state.intake.competitors_per_channel`
5. `state.intake.voice_rules_ref` → load voice.json
6. `state.intake.banned_language`

See [`social-orchestrator/references/critic-intake-rule.md`](file:///Users/operator/dev/openclaw/skills/social-orchestrator/references/critic-intake-rule.md). If the critic doesn't cite intake in its output, the gate is contaminated and re-runs.

## Modes (One Skill, Multiple Gates)

### Mode `gate-a` — Strategy Alignment

Run after Phase 3 (Aggregate). Validates:

| Check                        | Pass criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `channel_distinctiveness`    | Cross-channel pillar overlap < 20%                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `voice_alignment`            | Each channel's pillars align with `voice.json#channel_overrides` 4-D vector                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `differentiator_coverage`    | ≥4 of `state.intake.competitors_per_channel` differentiator items present in pillars                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `competitor_coverage`        | Top 3 competitors per channel have ≥1 counter-positioning pillar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `e_tag_distribution`         | Each channel: ≥80% of pillars have ≥2 E-tags incl. educate, AND aggregate report's e_tag percentages match `intake.voice_rules.4e_mix_targets` ±5%                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `numeric_claim_verification` | (Patch I-2) Every numerical claim in aggregate-report-{date}.md that names a state.intake field MUST match that field's current value within ±0.5%                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `state_freshness`            | (Patch I-1, hardened by Patch K-1) `state.phases.aggregate.state_version_at_read` must be ≥ `max(intake_last_modified_version, advisories_last_modified_version)`. **NO research-mode exception** — versioning is run metadata, not data quality. Mode does not excuse missing/stale versioning. **NO backfill (Patch K-2)**: if `state_version_at_read` was set after `phases.{n}.ran_at`, the field is invalid; gate fails.                                                                                                                                           |
| `skill_freshness`            | (Patch I-5, hardened by Patch K-1) `state.phases.{aggregate, plan}.skill_versions_at_read` must be present AND mtimes must match current on-disk skill mtimes within 60 sec. **NO research-mode exception** — same reasoning as `state_freshness`. **NO backfill (Patch K-2)**: if any `skill_versions_at_read[file].mtime > phases.{name}.ran_at`, the field was populated post-run with current mtimes (not phase-time mtimes); gate fails with reason "backfilled skill_versions_at_read is invalid for the phase block; rebuild phase to capture true skill state." |

```bash
social-quality gate-a --state social-strategy-state.json
```

#### `numeric_claim_verification` (Patch I-2, added 2026-05-04 from cutmasterai dry-run F35b)

For every numerical claim in `aggregate-report-{date}.md` that references a field also present in `state.intake` or `state.phases.discover.projections`:

1. Extract the field name + claimed value from the report (e.g., "Educate target: 70%")
2. Look up the same field in current state (`intake.voice_rules.4e_mix_targets.educate`)
3. Compare numeric values; tolerate ±0.5% rounding drift
4. If mismatch: gate fails with reason `"aggregate report value {field}={report_value} does not match current state {field}={state_value}; aggregate report is stale and must be regenerated against current state"`

The check primarily catches the bug where state was edited (manually or by another phase) between aggregate-report generation and gate execution. Combined with `state_freshness`, it closes the staleness loophole that surfaced in cutmasterai dry-run.

#### `state_freshness` (Patch I-1, hardened by K-1 + K-2)

Reads `state.phases.aggregate.state_version_at_read` and compares to highest version_counter at which any field consumed by aggregate was last modified. If aggregate was generated before the latest intake/advisories edit, gate fails with `"aggregate report generated against stale intake (read v{X}, current v{Y}); regenerate aggregate before re-running Gate A"`.

**No research-mode exception (Patch K-1)**: versioning is run metadata, not data quality. Research mode legitimately exempts cannibalization (no historical data) and format-diversity (single-format launch); it does NOT exempt versioning. A research-mode run can produce qualitative outputs against fresh state — it cannot produce ANY outputs against unrecorded versioning.

**No backfill (Patch K-2)**: if `state_version_at_read` was added to a phase block AFTER that phase's `ran_at` timestamp, the field is invalid. Detect by checking the phase block's `notes[]` or git history for retroactive edits, OR by comparing the field's introduction time to `ran_at`. Gate fails with reason `"state_version_at_read was backfilled after phase ran; field does not reflect phase-time state. Rebuild phase to capture true read-version."`

#### `skill_freshness` (Patch I-5, hardened by K-1 + K-2)

Reads `state.phases.{aggregate, plan}.skill_versions_at_read` and compares to current on-disk skill file mtimes. Within 60 sec = pass; outside = stale-skill warning OR fail.

**No research-mode exception (K-1)**: same reasoning as state_freshness. Skill versioning is run metadata; mode never excuses it.

**Backfill detection (K-2) — primary defense**: for every entry in `skill_versions_at_read[file]`, check `mtime ≤ phases.{name}.ran_at`. If `mtime > ran_at`, the file was modified AFTER the phase claimed to run — meaning the agent populated `skill_versions_at_read` with current mtimes (not phase-time mtimes) AFTER the spec changed. This is worse than a missing field because it lies about what the phase actually read.

Fail with: `"skill_versions_at_read.{file}.mtime ({mtime}) > phases.{name}.ran_at ({ran_at}). Field was backfilled post-run; cannot represent phase-time skill state. Rebuild phase {name} to capture skill versions as they are read."`

PASS → proceed to Phase 4 (Plan)
FAIL → trigger Phase 2B remediation (for content gaps), OR rebuild affected phase (for staleness/backfill fails). NEVER pass-with-caveat for staleness or backfill.

### Mode `gate-b` — Calendar + Cannibalization

Run after Phase 4 (Plan). Validates:

| Check                     | Pass criteria                                                                                                                                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cadence_target_met`      | Each channel meets per-platform cadence floor (per `social-plan` rules)                                                                                                                                                                                                |
| `no_cannibalization`      | `social-cannibalization audit` returns 0 hard fails                                                                                                                                                                                                                    |
| `all_pillars_covered`     | Every pillar has ≥1 atomic post in calendar                                                                                                                                                                                                                            |
| `repurposing_loops_wired` | Every long-form pillar has ≥1 spawned post per active channel                                                                                                                                                                                                          |
| `cta_distribution`        | Each channel: ≤30% of posts share the same CTA                                                                                                                                                                                                                         |
| `format_diversity`        | No channel has >70% of posts in single format                                                                                                                                                                                                                          |
| `advisories_surfaced`     | (Patch M) Every `state.advisories[]` entry with `user_response == "deferred"` (or null) AND `re_surface_at_phases` including `plan` MUST appear in `calendar-{date}.md` AND `state.phases.plan.advisories_resurfaced[]`                                                |
| `brief_tier_consistency`  | (Patch L) Every brief in `state.phases.deliver.briefs[]` has a `brief_type ∈ {full, skeletal}`. Posts tagged `phase: launch` (or first 10 calendar entries) MUST be `full`; posts tagged `phase: steady_state` MAY be `skeletal`. Mixing within launch sequence = fail |

```bash
social-quality gate-b --state social-strategy-state.json
```

PASS → proceed to Phase 5 (Deliver)
FAIL → return to Phase 4 with specific fix list

### Mode `gate-c` — Per-Post Quality (Pre-Publish)

Run on every brief + script before they enter the handoff bundle.

| Check                         | Source                                   | Pass threshold                                        |
| ----------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| Specificity (Article 1)       | claim count per 100w                     | ≥7                                                    |
| Novelty (Article 2)           | "fresh-model" test                       | passes (subjective + Sonnet/Opus disagreement = warn) |
| Sourced claims (Article 3)    | every stat-bearing sentence has citation | 100%                                                  |
| Distinctive POV (Article 4)   | matches channel voice 4-D vector ±0.30   | within range                                          |
| Banned language (Article 5)   | forbidden + slop tells                   | zero hits                                             |
| Hook score (Article 10)       | from `social-hooks score`                | ≥7.0                                                  |
| Save-rate prediction          | weighted 35% of score                    | ≥0.5                                                  |
| 3s-hold prediction            | weighted 30% of score                    | ≥0.5                                                  |
| Factcheck verdict             | from `social-factcheck verify`           | no Refuted/Hallucinated                               |
| RefChecker pass (Article B21) | hallucination risk                       | <0.7 per claim                                        |

Composite Gate C score:

```
score = (specificity × 0.20)
      + (novelty × 0.15)
      + (sourced × 0.15)
      + (voice × 0.10)
      + (banned-lang × 0.10 — binary, hard fail)
      + (hook × 0.10)
      + (factcheck × 0.10)
      + (refcheck × 0.10)
```

Threshold: **≥80/100 = pass**. <80 with no hard fails = warn (revise & re-run). Hard fail (banned language, hallucinated stat, refuted claim) = block.

```bash
social-quality gate-c --brief content/social/briefs/celavii-ig-001-brief.md
```

### Mode `silo-check` (Phase B9)

Verify a brief belongs to its declared pillar (no pillar drift).

```bash
social-quality silo-check --brief content/social/briefs/celavii-ig-001-brief.md
```

Reads `brief.frontmatter.pillar_id` + `state.phases.aggregate.pillars[id].topics` + brief body. Checks that:

- Brief topic matches pillar's topic vocabulary (cosine ≥0.6 on pillar centroid)
- Brief hashtags overlap pillar hashtag set
- Brief E-tags align with pillar E-tag profile

Returns pass / warn / fail. On fail, suggests correct pillar reassignment.

## Cross-Model Critic Configuration (Article 7)

Default config (set in `social-orchestrator` runtime):

```yaml
generator: claude-sonnet-4-6
critic: claude-opus-4-7
iteration_cap: 3
gate_critics:
  gate_a: opus
  gate_b: opus
  gate_c: opus
```

Per Article 7, generator and critic MUST be different models. Gate runs that use the same model are flagged as contaminated.

## Iteration Cap (Article 8)

Hard cap: **3 iterations per gate**.

After 3 fails:

- Gate A → escalate to human review
- Gate B → escalate to human review
- Gate C → block the post; require manual rewrite

No auto-iteration past 3.

## 8-Pass Humanizer Hook (Phase B20)

When `social-quality gate-c` runs on a script, it invokes `social-script` 8-pass humanizer first as a pre-pass. The humanizer report appends to the gate-c report.

## RefChecker Hook (Phase B21)

When `social-quality gate-c` runs, it invokes `social-factcheck refcheck` (Mode C — RefChecker pass) on every stat-bearing sentence. Hallucination risk ≥0.7 = hard fail.

## Output Schema

```
state.gates.A = {
  status: "pass" | "fail",
  iteration: 0..3,
  critic_model: "claude-opus-4-7",
  generator_model: "claude-sonnet-4-6",
  checks: [
    { id: "channel_distinctiveness", result: "pass", evidence: "..." },
    ...
  ],
  fail_remediation: [...]  // if fail: list of specific fix actions
}

state.gates.C.per_post[post_id] = {
  iteration: 0..3,
  score: 87,
  anti_slop: "pass",
  factcheck: "pass",
  voice: "pass",
  silo_check: "pass",
  humanizer_passes: "8/8",
  refchecker: "pass"
}
```

## Reports

Per-gate human-readable report saved to:

- `state.gates.A.report` → `research/social/gate-a-report-{date}.md`
- `state.gates.B.report` → `research/social/gate-b-report-{date}.md`
- Gate C reports inline with the brief at `content/social/briefs/{post-id}-gate-c.md`

## Integration

- Calls `social-cannibalization` (Gate B)
- Calls `social-hooks score` (Gate C)
- Calls `social-factcheck verify` + `refcheck` (Gate C)
- Calls `social-persona enforce` (Gate C voice)
- Calls `social-sxo scan` (Gate C — pre-Gate-C since SXO catches different things)
- Reads `voice.json`, `social-constitution.md`, `state.intake`
- Writes `state.gates.{A,B,C}` per gate

## References

- `references/gate-a-checklist.md` — full Gate A check definitions (Phase B8.1)
- `references/gate-b-checklist.md` — full Gate B check definitions (Phase B8.1)
- `references/gate-c-rubric.md` — full 8-axis scoring rubric (Phase B8.1)
- `references/silo-check-method.md` — pillar-centroid cosine + hashtag overlap (Phase B9.1)
- `references/cross-model-protocol.md` — Sonnet/Opus pass-handoff (Phase B8.1)
- `references/iteration-cap-escalation.md` — what happens at iteration 3 fail (Phase B8.1)

## Status

- [x] SKILL.md scaffold (this file) — Phase B8+B9+B20+B21 contract
- [ ] `scripts/gate_a.py` (Phase B8.1)
- [ ] `scripts/gate_b.py` (Phase B8.1)
- [ ] `scripts/gate_c.py` (Phase B8.1)
- [ ] `scripts/silo_check.py` (Phase B9.1)
- [ ] Cross-model critic runtime (depends on Phase D18 orchestrator wire)
- [ ] Smoke test against existing v2 content_queue (Phase G pilot)
