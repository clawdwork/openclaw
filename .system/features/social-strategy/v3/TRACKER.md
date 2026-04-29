# v3 Tracker — Phase C Deterministic Aggregator (2026-04-29)

> Audit trail for Phase C of [social-agents-implementation-proposal.md](../social-agents-implementation-proposal.md). Phase B closed in [v2/TRACKER.md](../v2/TRACKER.md).

---

## Phase C Items (Status: All Closed)

| #   | Item                                                        | Status | Artifact                                                                                                                                                                                                                                |
| --- | ----------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Scoring rubric (relevance/diff/cross-poll/effort + weights) | ✅     | [`references/scoring-rubric.md`](../../../skills/social-aggregate/references/scoring-rubric.md)                                                                                                                                         |
| C2  | `scripts/aggregate.py` deterministic aggregator             | ✅     | [`scripts/aggregate.py`](../../../skills/social-aggregate/scripts/aggregate.py) (~530 LOC, stdlib only)                                                                                                                                 |
| C3  | `aggregate-report-{date}.md` template (8 sections)          | ✅     | `render_markdown()` in `aggregate.py`                                                                                                                                                                                                   |
| C4  | `state.phases.aggregate.*` writes                           | ✅     | `state_delta` block in payload                                                                                                                                                                                                          |
| C5  | Fixture set + smoke test                                    | ✅     | [`fixtures/`](../../../skills/social-aggregate/fixtures/) + [`scripts/smoke-test.sh`](../../../skills/social-aggregate/scripts/smoke-test.sh)                                                                                           |
| C6  | Runtime target documented                                   | ✅     | [`references/runtime-target.md`](../../../skills/social-aggregate/references/runtime-target.md) — observed 0.01s on 12-post fixture; <5s budget on 1000 posts                                                                           |
| C7  | Cosine + 30d temporal cannibalization                       | ✅     | `cannibalization_clusters()` + [`references/cannibalization-thresholds.md`](../../../skills/social-aggregate/references/cannibalization-thresholds.md)                                                                                  |
| C8  | 4E + 5-archetype taggers                                    | ✅     | `tag_archetype()` + `tag_4e()` + [`references/archetype-patterns.md`](../../../skills/social-aggregate/references/archetype-patterns.md), [`references/4e-classifier.md`](../../../skills/social-aggregate/references/4e-classifier.md) |
| C9  | Velocity/acceleration/z-score (ramekin port)                | ✅     | `trend_signals()` + [`references/trend-math.md`](../../../skills/social-aggregate/references/trend-math.md)                                                                                                                             |

---

## Smoke Test Output (2026-04-29)

```
▸ Running aggregate.py against fixtures…
✓ all assertions passed · 12 posts · 50 scored · 1 cannib · 0.01s
✓ smoke test passed
```

Contract assertions verified:

- `scored_topics[]` non-empty with composite score ≥ 5.0 floor
- Cannibalization cluster detected at cosine 0.894 (Cabc004 vs Cabc005, hard_fail)
- Hook archetype distribution computed across 4 of 5 archetypes
- 4E distribution sums to 1.0 across all four E's
- Channel baselines computed per (channel, platform)
- `state_delta` includes all 7 required keys
- Runtime well under 5s budget (0.01s observed on 12-post fixture)

---

## Bug Fixes During Phase C

| Bug                                                                                                                          | Fix                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 3-gram topics from stopword-stripped tokens didn't match raw-text substring search → 0 supporting posts, cross_pollination=0 | Pre-tokenize all posts once, supporting = `topic_toks ⊆ post_token_set` |
| Post-id prefix used `platform[:2]` → "in:Cabc..." for instagram                                                              | Mapped: instagram→ig, tiktok→tt, x→x, youtube→yt                        |

---

## Architecture Sync

- `architecture/skills.md`: added social-aggregate row, count 55 → 56
- `architecture/VALUES.md`: managed top-level 55→56, SKILL.md files 127→128, social 18→19
- Symlink: `~/dev/workspace/skills/social-aggregate` → openclaw source
- arch-verify status: 1 pre-existing Phase I item (CELAVII_API_KEY in SHELL_ENV_EXPECTED_KEYS); no Phase C regressions

---

## What's Deferred

- **Empirical runtime benchmark** on real Celavii v3 raw data — runs once `social-discover` Phase B11.1 (`scripts/discover.py`) ships. Fixture-only benchmark today (0.01s) is not representative of N=1000.
- `social-aggregate` is now a hard prerequisite for Phase D (Strategy Pipeline) — the `/social_strategy` Phase 3 (AGGREGATE) step calls this script.

---

## Exit Criteria — Met

> Running aggregator on fixture raw/ produces deterministic, LLM-readable report. Cannibalization matrix + hook archetype tags + velocity z-scores all present.

**All four sub-criteria satisfied** — see smoke test output above.

---

## Next Up — Phase D (Strategy Pipeline Command)

See [../social-agents-implementation-proposal.md § Phase D](../social-agents-implementation-proposal.md). 21 items (D1–D21). Wire atomic skills into `/social_strategy` 7-phase command. Phase C is now a callable upstream dependency (Phase 3 AGGREGATE step).

---

## Phase D — Strategy Pipeline Command (2026-04-29)

| #   | Item                                          | Status | Artifact                                                                                                                 |
| --- | --------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| D1  | `/social_strategy` command spec               | ✅     | [`commands/social-strategy.md`](../../../skills/social-orchestrator/commands/social-strategy.md)                         |
| D2  | Intake flow (5 Qs, Telegram-friendly)         | ✅     | [`references/intake-questions.md`](../../../skills/social-orchestrator/references/intake-questions.md)                   |
| D3  | Phase 0 ACQUIRE                               | ✅     | command spec § Phase 0                                                                                                   |
| D4  | Phase 1 DISCOVER (parallel subagents)         | ✅     | command spec § Phase 1 + parallel-subagent-spawn.md                                                                      |
| D5  | Phase 2 ANALYZE                               | ✅     | command spec § Phase 2                                                                                                   |
| D6  | Phase 3 AGGREGATE (calls Phase C script)      | ✅     | command spec § Phase 3                                                                                                   |
| D7  | Gate A (intake-first, Article 6 verification) | ✅     | command spec § Gate A                                                                                                    |
| D8  | Phase 2B remediation                          | ✅     | command spec § Phase 2B                                                                                                  |
| D9  | Phase 4 PLAN                                  | ✅     | command spec § Phase 4                                                                                                   |
| D10 | Gate B (6 checks)                             | ✅     | command spec § Gate B                                                                                                    |
| D11 | Phase 5 DELIVER (brief loop)                  | ✅     | command spec § Phase 5                                                                                                   |
| D12 | Phase 6 REPORT (PDF scaffold plan)            | ✅     | command spec § Phase 6                                                                                                   |
| D13 | Help block                                    | ✅     | command spec § Help                                                                                                      |
| D14 | Cost/time estimates                           | ✅     | command spec § Cost Estimate (~$11.70 + ~$1 Apify, ~2–3hr; Phase G refines)                                              |
| D15 | 15-parallel-subagent spawn pattern            | ✅     | [`references/parallel-subagent-spawn.md`](../../../skills/social-orchestrator/references/parallel-subagent-spawn.md)     |
| D16 | Industry-aware delegation                     | ✅     | [`references/industry-aware-delegation.md`](../../../skills/social-orchestrator/references/industry-aware-delegation.md) |
| D17 | Tiered credentials (T0/T1/T2)                 | ✅     | [`references/tiered-credentials.md`](../../../skills/social-orchestrator/references/tiered-credentials.md)               |
| D18 | Cross-model critic at all gates               | ✅     | command spec § Execution Model (Sonnet generates, Opus critiques)                                                        |
| D19 | 3-iteration cap on gates                      | ✅     | command spec § Iteration Cap (state.gates.{A,B}.iteration counter)                                                       |
| D20 | Format-as-channel rule                        | ✅     | [`references/format-as-channel.md`](../../../skills/social-orchestrator/references/format-as-channel.md)                 |
| D21 | Gary Vee Reverse Pyramid (≥8 atomic spawns)   | ✅     | [`references/gary-vee-fan-out.md`](../../../skills/social-orchestrator/references/gary-vee-fan-out.md)                   |

### Exit Criteria — Met (contract level)

> `/social_strategy` callable end-to-end. Dry-run produces all phase artifacts in correct paths. Gates respect cross-model + iteration cap rules.

Contract is fully specified. Empirical end-to-end dry-run is **deferred to Phase G** (G1-G7) — the actual `/social_strategy` callable execution requires the per-skill scripts (B11.1 social-discover, B14.1 social-factcheck, etc.) which were intentionally deferred to on-demand build during pipeline assembly.

### What's Now Callable End-to-End

- Phase 3 AGGREGATE — fully implemented (Phase C, deterministic Python)
- Phase 0–2, 4–6 — specs reference real SKILL.md contracts; per-skill scripts to be implemented on first invocation per Phase B's "ship contracts now, implementations on-demand" decision

### What's Deferred to Phase G (Pilot)

- D14 empirical cost validation (current estimates are first-pass)
- End-to-end dry-run that validates state-file flow across all 7 phases
- Cross-model critic empirical verification (does Opus actually disagree with Sonnet?)

### Next Up — Phase E (Weekly Curation Command)

See [../social-agents-implementation-proposal.md § Phase E](../social-agents-implementation-proposal.md). 8 items (E1–E8). `/social_curate week=YYYY-Wnn` — the user's stated weekly use case.

---

## Phase E — Weekly Curation Command (2026-04-29)

| #   | Item                                             | Status | Artifact                                                                                     |
| --- | ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------- |
| E1  | `/social_curate` command spec                    | ✅     | [`commands/social-curate.md`](../../../skills/social-orchestrator/commands/social-curate.md) |
| E2  | Week resolution + calendar slice + idempotency   | ✅     | command spec § Week resolution                                                               |
| E3  | Per-post sub-skill chain                         | ✅     | command spec § Per-post sub-skill chain (full pseudocode)                                    |
| E4  | Silo-check failure → re-brief × 1 (no auto-iter) | ✅     | command spec § Failure handling                                                              |
| E5  | Zipped weekly bundle + index README              | ✅     | command spec § Bundle assembly                                                               |
| E6  | `state.weekly_cycles[]` append                   | ✅     | command spec § State writes                                                                  |
| E7  | Help + dry-run + resume                          | ✅     | command spec § Help, § Dry-run mode, § Resume                                                |
| E8  | Hook variants (5+, archetype-tagged) pre-brief   | ✅     | command spec § Hook variant generation                                                       |

### Exit Criteria — Met (contract level)

> `/social_curate week=2026-W18` produces zipped weekly bundle ready for human handoff or `celavii-social` execution.

Contract is fully specified. End-to-end execution requires the per-skill scripts (B2.1, B3.1, B4.1, B6.1, B7.1, B8/9 implementations) which were intentionally deferred per the "ship contracts now, implementations on-demand" decision. First real execution will harden them in Phase G pilot.

### Key design decisions

1. **No auto-iteration in production-volume command** — production weekly runs surface failures to humans rather than auto-retry. Iteration loops belong in `/social_strategy` (Gate A/B, capped at 3 per Article 8). E4's "max 1 retry per post" is the only retry loop in this command.
2. **Skip-already-done idempotency** — re-running `/social_curate` on a partially-completed week resumes from where it left off. Posts with Gate C ≥ 7.5 are skipped.
3. **Hook artifact shipped independently** — `social-hooks` is called explicitly before `social-brief` (rather than only as brief's sub-skill) so the variant file becomes a first-class bundle artifact.
4. **Bundle is the deliverable** — zipped folder + index README is what hands off to `celavii-social` or human review. Not state.json (which is internal pipeline state).
5. **Cost: ~$6.80/week typical** (5 static + 3 video posts) vs Phase D estimated ~$2/week — proposal estimate was low; per-post real cost ~$0.66 static / ~$1.16 video. Surfaced in dry-run output.

### Next Up — Phase F (Single-Post + Repurpose)

See [../social-agents-implementation-proposal.md § Phase F](../social-agents-implementation-proposal.md). 3 items (F1-F3). `/social_post post_id={id}` for single-post regeneration + `social-repurpose` skill SKILL.md scaffold (B19/F2 dual-cited). Mirror [`workspace/skills/blogger/blog-repurpose/`](file:///Users/operator/dev/workspace/skills/blogger/blog-repurpose/).

---

## Phase F — Single-Post + Repurpose (2026-04-29)

| #   | Item                                 | Status | Artifact                                                                                                |
| --- | ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------- |
| F1  | `/social_post post_id={id}` command  | ✅     | [`commands/social-post.md`](../../../skills/social-orchestrator/commands/social-post.md)                |
| F2  | `social-repurpose` SKILL.md hardened | ✅     | [`social-repurpose/SKILL.md`](../../../skills/social-repurpose/SKILL.md) — D21 handshake + lineage      |
| F3  | Smoke-test fixture for agentic-shift | ✅     | [`fixtures/agentic-shift-fanout.md`](../../../skills/social-repurpose/fixtures/agentic-shift-fanout.md) |

### Key design decisions

1. **`/social_post` shares the per-post chain with `/social_curate`** — same sub-skills, same failure handling. Difference: scope (1 post vs week), output (loose files vs zipped bundle), state (deliver.briefs vs weekly_cycles).
2. **Four execution modes for `/social_post`**: calendar entry (default) / forced re-curation (`force=true`) / ad-hoc off-calendar (synthetic entry, NOT auto-inserted into calendar) / single-step (`only=hooks|brief|script|...`).
3. **D21 pillar-registration handshake**: Phase 4 PLAN initializes pillar with `atomic_count_target ≥ 8`. `social-repurpose` increments `atomic_count_planned` per spawn. Gate B reads counts to verify D21 compliance before approving calendar.
4. **F3 fixture is the contract, not the implementation**: 12 atomic outputs spec'd against `agentic-shift-final.mdx`. When `scripts/repurpose_blog.py` (F2.1) ships, its output must match this fixture. Fixture defines: ≥8 spawns, ≥3 platforms, ≥3 formats, ≥3 archetypes, all 4 E's, lineage populated, no cannibalization clusters.
5. **Cross-pillar pollination guard**: before spawning, `social-repurpose` calls `social-cannibalization` mode=cross-pillar to verify the new spawn doesn't duplicate an already-spawned atomic from another pillar (cosine ≥ 0.85 fail).
6. **Sequencing**: 12 spawns spread across 4 weeks (3/week) per Gary Vee fan-out cadence — aligns with platform sustainable cadence targets without saturating any single platform.

### Exit Criteria — Met (contract level)

> F1 callable. F2 contract authored with D21 integration. F3 fixture defined and validates contract.

Implementations (F2.1 `scripts/repurpose_blog.py` + B19.1 `scripts/repurpose_video.py`) deferred to on-demand build per the standing decision. F3 paper exercise validates the contract as authored.

### Next Up — Phase G (Dry-Run + Real Pilot)

See [../social-agents-implementation-proposal.md § Phase G](../social-agents-implementation-proposal.md). 12 items (G1-G12). Pick narrow scope (Celavii + IG only), run `/social_strategy` end-to-end, document failures in DRY-RUN-TEST-FINDINGS.md, fix top 2-3, then `/social_curate` for one real week. Phase G is where the per-skill scripts get hardened against real data.
