# Phase B — Atomic Skills Tracker

> **Phase status**: ✅ SCAFFOLD COMPLETE — implementation scripts deferred to per-skill sub-tasks
> **Started**: 2026-04-28
> **Scaffold completed**: 2026-04-28
> **Driver**: [../social-agents-implementation-proposal.md § 5 Phase B](../social-agents-implementation-proposal.md)
> **Audit support**: [eval-findings.md](eval-findings.md) — Celavii social_listener public API mapped

---

## Status Legend

- `[x]` — SKILL.md scaffold complete + symlinked + arch-verify clean
- `[~]` — partial (deferred to follow-up phase or sub-task)
- `[ ]` — pending
- `[!]` — blocked (with note)

Implementation scripts (`scripts/*.py`) tracked at sub-task level inside each skill's own SKILL.md `## Status` section.

---

## EVAL Gates (run before B11 authoring)

- [x] **EVAL-1** Audited `social_listener/src/lib/platform-adapters/{instagram,tiktok,x}.ts` + `actor-registry/*.md` — full PlatformAdapter contract mapped, 11 Apify actors documented with costs. Findings: [eval-findings.md § A–C](eval-findings.md)
- [x] **EVAL-2** Audited `social_listener/Implementation/pipelines/{scrape-dispatch-queue,queue-architecture}/` — BullMQ + Redis queue model documented, public `/api/v1/scrape/*` 5-endpoint surface mapped. Findings: [eval-findings.md § D–F](eval-findings.md)
- [x] **Conclusion**: WRAP existing Celavii public API; do NOT reimplement. `celavii-jobs` MCP for status polling. Five public scrape endpoints already cover Phase 0 ACQUIRE.

---

## B1–B21 Checklist (master proposal mapping)

### Discovery + Scraping (B10, B11)

- [x] **B11** `social-discover` SKILL.md authored — wraps `/api/v1/scrape/{hashtags,locations,urls,followers,following}` + `celavii-discover` `/profiles/search`. Modes A–E (profile / hashtag / location / urls / resolve). Tiered credentials (T0/T1/T2). YouTube-ready dispatch stub.
- [x] **B11** `social-competitor-scrape` SKILL.md authored — Modes A–D (baseline / top-posts / followers / cross-platform link extraction from TikTok adapter). Per-competitor output schema feeds Phase 2 Analyze.
- [x] **B10** `social-trend-detect` SKILL.md authored — velocity + acceleration + z-score math (port of [readikus/ramekin](https://github.com/readikus/ramekin)). 4 modes (hashtags / audio / topics / lagging snapshot). trendsmcp + bellingcat fallback chain.

### Voice + Drift (B13, B16)

- [x] **B13** `social-persona` SKILL.md filled out — 3 modes (discover / enforce / lint). Pseudo-algorithm for discover, full enforce checklist, voice.json reference + hooks integration. Vendoring of Anthropic brand-voice content deferred to B13.1 (paired with `scripts/persona.py` implementation).
- [x] **B16** `social-drift` SKILL.md filled out — full SQLite schema (4 tables: post_snapshots, channel_baselines, voice_snapshots, drift_alerts) + URL normalization rule + 17-rule implementation plan (rules/critical.py, rules/warning.py, rules/info.py).

### Quality + Analysis (B14, B15, B17, B18)

- [x] **B14** `social-factcheck` SKILL.md authored — Loki pipeline (decompose → check-worthiness → query → retrieve → verdict) + RefChecker hook + Tier 1/2/3 source policy + 4 verdict classes.
- [x] **B15** `social-cannibalization` SKILL.md authored — cosine similarity + 30d temporal window. 4 modes (pre-publish / calendar audit / cross-channel / historical). Threshold table (≥0.85 same channel, ≥0.80 cross-channel).
- [x] **B17** `social-sxo` SKILL.md authored — 5-check format/audience/cadence/archetype/platform-signals analyzer. Per-platform format-fit constraint matrix.
- [x] **B18** `social-hooks` 5-archetype layer added to existing skill (Curiosity Gap, Contrarian, Story, Authority, Pattern Interrupt). 4-axis scoring rubric. Anti-slop filter. Channel voice override. Existing 6-category catalog preserved as tactical layer.

### Planning + Production (B12, B1, B3, B4, B6, B7)

- [x] **B12** `social-plan` SKILL.md authored — 4 modes (calendar / repurpose / classify / revise). Gary Vee Reverse Pyramid 1→12-15 fan-out. 2026 cadence rules per platform. Cross-channel distinctiveness enforcement.
- [x] **B1** `social-research` SKILL.md authored — 3 modes (week / citations / pillar). Tier-1/2/3 source policy. 24h cache.
- [x] **B3** `social-citations` folded into `social-research` Mode B (decision: research IS the source-gathering process; separate skill would duplicate logic).
- [x] **B4** `social-brief` SKILL.md authored — required sub-skill calls (hooks → persona → sxo → research/citations). Per-channel voice application. Format-specific brief templates.
- [x] **B6** `social-script` SKILL.md authored — long-form video script writer. Per-platform defaults. 8-pass humanizer integration (B20). Cross-model critic mode.
- [x] **B7** `social-shotlist` SKILL.md authored — 3 modes (from script / from transcript / carousel). ClipsAI backbone for transcript-aware cuts. Brand-constraint enforcement.

### Quality Gates (B8, B9, B19, B20, B21)

- [x] **B8** `social-quality` SKILL.md authored — Gates A/B/C consolidated. Cross-model critic config. 3-iteration cap. Composite Gate C scoring (8 axes).
- [x] **B9** Silo-check sub-mode in `social-quality` — pillar-centroid cosine + hashtag overlap + E-tag alignment.
- [x] **B20** 8-pass humanizer integrated as `social-script` post-pass + `social-quality` Gate C pre-pass.
- [x] **B21** RefChecker integrated as `social-factcheck` Mode C + `social-quality` Gate C hook.
- [~] **B19** ClipsAI integration — SKILL.md contracts in `social-shotlist` (Mode B) and `social-repurpose` (Mode A). Python wrapper script deferred to B19.1 (paired with first video-lane smoke test).

### Repurpose (F2 — pulled forward into Phase B for completeness)

- [x] **F2** `social-repurpose` SKILL.md authored — Gary Vee Reverse Pyramid 4 modes (video / blog / podcast / reactivate). Channel-aware fan-out. Repurpose lineage tracking.

### Smoke tests (deferred to Phase G pilot)

- [~] **B2** Test `social-research` standalone — Phase G pilot scope
- [~] **B5** Test `social-brief` against existing pillar — Phase G pilot scope

---

## Files Created (audit trail)

### New SKILLs (13)

| Path                                                | Lines | Status      |
| --------------------------------------------------- | ----- | ----------- |
| `openclaw/skills/social-discover/SKILL.md`          | ~135  | ✅ scaffold |
| `openclaw/skills/social-competitor-scrape/SKILL.md` | ~125  | ✅ scaffold |
| `openclaw/skills/social-trend-detect/SKILL.md`      | ~150  | ✅ scaffold |
| `openclaw/skills/social-factcheck/SKILL.md`         | ~165  | ✅ scaffold |
| `openclaw/skills/social-cannibalization/SKILL.md`   | ~155  | ✅ scaffold |
| `openclaw/skills/social-sxo/SKILL.md`               | ~150  | ✅ scaffold |
| `openclaw/skills/social-plan/SKILL.md`              | ~155  | ✅ scaffold |
| `openclaw/skills/social-research/SKILL.md`          | ~135  | ✅ scaffold |
| `openclaw/skills/social-brief/SKILL.md`             | ~135  | ✅ scaffold |
| `openclaw/skills/social-script/SKILL.md`            | ~140  | ✅ scaffold |
| `openclaw/skills/social-shotlist/SKILL.md`          | ~145  | ✅ scaffold |
| `openclaw/skills/social-quality/SKILL.md`           | ~190  | ✅ scaffold |
| `openclaw/skills/social-repurpose/SKILL.md`         | ~165  | ✅ scaffold |

### Modified

| Path                                                                                 | Change                                                                             |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `openclaw/skills/social-hooks/SKILL.md`                                              | Added 5-archetype foundation + 4-axis scoring rubric (Phase B18)                   |
| `openclaw/skills/social-persona/SKILL.md`                                            | Filled out CLI Modes A/B/C with pseudo-algorithm + checklist                       |
| `openclaw/skills/social-drift/SKILL.md`                                              | Filled out SQLite schema (4 tables) + URL normalization + rule implementation plan |
| `openclaw/.system/architecture/skills.md`                                            | Count 42 → 55; 14 new social-agents rows                                           |
| `openclaw/.system/architecture/VALUES.md`                                            | managed 42→55, social 5→18                                                         |
| `openclaw/.system/features/social-strategy/social-agents-implementation-proposal.md` | Phase B items flipped `[ ]` → `[x]`/`[~]`                                          |

### Symlinks (13 new)

`workspace/skills/social-{discover,competitor-scrape,trend-detect,factcheck,cannibalization,sxo,plan,research,brief,script,shotlist,quality,repurpose}` → `openclaw/skills/social-*`

### Research findings

- `openclaw/.system/features/social-strategy/v2/eval-findings.md` (681 lines) — Celavii social_listener audit (EVAL-1 + EVAL-2)

---

## Exit Criteria — All Met

- [x] EVAL-1 + EVAL-2 produced concrete API/pipeline mapping
- [x] All 13 new skills scaffolded with full SKILL.md contracts
- [x] Existing 3 Phase A skills (orchestrator, persona, drift) extended for Phase B
- [x] All skills symlinked into managed `~/.openclaw/skills/`
- [x] arch-verify clean except for pre-existing Phase I item (CELAVII_API_KEY in SHELL_ENV_EXPECTED_KEYS)
- [x] Master proposal trackers updated (`[ ]` → `[x]`/`[~]` per item)
- [x] skills.md + VALUES.md count drift fixed (55 / 18 social)

---

## What's Deferred to Per-Skill Sub-Tasks

Each scaffold's `## Status` section lists its own implementation sub-tasks (e.g. `B11.1 scripts/discover.py wrapper CLI`, `B14.1 scripts/factcheck.py Loki pipeline`, `B16.1 scripts/rules/*.py drift rule implementations`). These execute **on-demand** as we hit them in Phase D pipeline assembly or Phase G pilot.

The decision: ship contracts now, ship implementations as the pipeline calls them. This avoids building scripts that may need contract revision once the orchestrator wires everything together.

---

## What's Deferred to Phase G

- B2 — `social-research` standalone smoke test (no fixture data yet)
- B5 — `social-brief` standalone smoke test (depends on B2)

These run during Phase G pilot using one channel + one platform as the narrow first target.

---

## Next Up — Phase C (Deterministic Aggregator)

See [../social-agents-implementation-proposal.md § 5 Phase C](../social-agents-implementation-proposal.md). Recommended start order:

1. **C1** Spec the scoring rubric (relevance/differentiation/cross-pollination/effort weights)
2. **C2** Author `~/dev/workspace/skills/social-aggregate/scripts/aggregate.py`
3. **C7** Cosine cannibalization integration (depends on B15.1 — defer or implement together)
4. **C8** 4E + 5-hook-archetype taggers
5. **C9** velocity/acceleration/z-score computation
6. **C5** Test against fixture (existing v2 social-strategy-state)

Phase C is the cost unlock — deterministic Python script, no LLM in aggregation. Tractable single-day implementation.
