# Phase A — Foundation Tracker

> **Phase status**: ✅ COMPLETE
> **Started**: 2026-04-28
> **Completed**: 2026-04-28
> **Driver**: [../social-agents-implementation-proposal.md § 5](../social-agents-implementation-proposal.md)

---

## Status Legend

- `[x]` — done and verified
- `[~]` — partially done / scaffolded for follow-up phase
- `[ ]` — pending
- `[!]` — blocked (with note)

---

## Phase A Checklist

### A1–A2 — Audit existing v2 state + spec

- [x] **A1** Read `research/social/social-strategy-state.json` (v2, 1975 lines, 68KB) — captured reusable fields: `meta.brand_voice`, `meta.differentiators`, `meta.content_silos`, `phases.research`, `phases.plan`, `platforms.{twitter,instagram,tiktok,linkedin}`, `content_queue`, `hashtag_strategy`, `competitor_presence`, `cohort_insights`, `metrics`, `seo_sync`
- [x] **A2** Read `research/social/SOCIAL-STRATEGY-STATE-SPEC.md` (567 lines, v1.0 from 2026-03-09) — sections 1–9 cover meta, phases, platforms, content queue, hashtags, competitors, cohort, metrics, seo_sync

### A3 — v3 schema

- [x] **A3** Appended v3 schema to [`SOCIAL-STRATEGY-STATE-SPEC.md`](file:///Users/operator/dev/workspace/projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md) covering:
  - `intake` (5-question structured intake — feeds critic gates)
  - `phases.acquire` / `phases.discover` / `phases.analyze` / `phases.aggregate` / `phases.deliver` / `phases.report`
  - `gates` (A/B/C with cross-model + iteration-cap fields)
  - `weekly_cycles[]` (drives `/social_curate`)
  - `meta.platforms.youtube` placeholder (enabled: false sentinel for H-YT)
  - Per-platform ER formulas (TT/YT use views denominator)
  - Raw-file reference convention
  - v2→v3 migration notes

### A4 — Directory skeleton

- [x] **A4** Created on disk:
  - `projects/celavii/research/social/raw/`
  - `projects/celavii/content/social/research/`
  - `projects/celavii/content/social/briefs/`
  - `projects/celavii/content/social/scripts/`
  - `projects/celavii/content/social/shotlists/`
  - `projects/celavii/media/generated/social/`
  - `projects/celavii/deliverables/handoffs/`
  - `openclaw/skills/social-{orchestrator,persona,drift}/{commands,references,scripts}`
  - `openclaw/.system/features/social-strategy/{decisions,hooks,plugin,extensions,v1}`

### A5 — social-orchestrator skill

- [x] **A5** Authored [`openclaw/skills/social-orchestrator/SKILL.md`](file:///Users/operator/dev/openclaw/skills/social-orchestrator/SKILL.md) — full router with task-routing table (20+ task types), 3-channel map (Elioth/Celavii/CutMaster), per-platform ER math, 5-archetype hook taxonomy, 4E framework rule, anti-slop rubric, cross-model + iteration-cap critic config. Plus `references/critic-intake-rule.md`.

### A6 — Symlink into managed dir

- [x] **A6** Symlinked `social-orchestrator`, `social-persona`, `social-drift` into both `~/dev/workspace/skills/` and (transitively) `~/.openclaw/skills/`. Verified: `ls ~/.openclaw/skills/ | grep social` shows 5 entries (incl. pre-existing `celavii-social` + `social-hooks`).

### A7 — PROJECT.md File Index

- [x] **A7** Updated [`projects/celavii/PROJECT.md`](file:///Users/operator/dev/workspace/projects/celavii/PROJECT.md) Research-Social table — added rows for `raw/`, `content/social/{research,briefs,scripts,shotlists}/`, `deliverables/handoffs/` + cross-link to master proposal. Spec date bumped to 2026-04-28.

### A8 — architecture skills.md + VALUES.md

- [x] **A8** Updated `.system/architecture/skills.md`: count 39 → 42, added 3 new social-agents rows (`social-orchestrator`, `social-persona`, `social-drift`)
- [x] **A8** Updated `.system/architecture/VALUES.md`: managed-dir 39 → 42, social count 2 → 5, last-verified 2026-04-28

### A9 — arch-verify.sh

- [x] **A9** Ran `bash scripts/arch-verify.sh` from openclaw repo root. **Down from 4 failures to 1** (the remaining `CELAVII_API_KEY missing from SHELL_ENV_EXPECTED_KEYS` is pre-existing Phase I cleanup work — not Phase A scope).

### A10 — Commit

- [ ] **A10** Commit checkpoint to both repos (workspace + openclaw) — **deferred pending user approval**. All changes staged on disk.

### A11 — Plugin manifest

- [x] **A11** Authored [`plugin/plugin.json`](../plugin/plugin.json) — name `social-agents`, v0.1.0, MIT, lists 18 planned skills + 3 commands + env/MCP requires + skill dependencies

### A12 — Hooks PostToolUse

- [x] **A12** Authored [`hooks/hooks.json`](../hooks/hooks.json) (3 hooks: content lint / state schema / brief structure) + [`hooks/validate-social-content.py`](../hooks/validate-social-content.py) stub (banned phrases, AI-slop tells, char limits per platform). Validators are stubs to be fleshed out in Phase B.

### A13 — PDF stack decision

- [x] **A13** Recorded in [`decisions/0001-pdf-stack.md`](../decisions/0001-pdf-stack.md): **weasyprint + matplotlib for v0** (internal). Defer Next.js print template until first client-facing strategy delivery.

### A14 — Vendor Anthropic brand-voice

- [~] **A14** Scaffolded `social-persona` + `social-drift` SKILL.md shells with NOTICE.md attribution placeholders. **Vendoring proper happens in Phase B13 (persona) + B16 (drift)** — full SKILL.md content is large enough that we want to do it as part of the implementation phase, not the foundation phase.

### A15 — voice.json (NN/g 4-D + tone-by-context)

- [x] **A15** Authored [`~/dev/workspace/.styles/celavii/voice.json`](file:///Users/operator/dev/workspace/.styles/celavii/voice.json):
  - NN/g 4-D vector (humor / formality / respectfulness / enthusiasm)
  - 3 channel overrides (Elioth / Celavii / CutMaster)
  - 6 tone-by-context entries (to_competitors / to_creators / to_marketers / to_developers / celebrating_a_win / responding_to_complaint)
  - 14 forbidden phrases + 9 AI-slop tells
  - Structural rules (max sentence 28, paragraph 60, specificity ≥7/100)
  - Validation strategy + consumer-skill list

### A16 — social-constitution.md

- [x] **A16** Authored [`openclaw/.claude/rules/social-constitution.md`](file:///Users/operator/dev/openclaw/.claude/rules/social-constitution.md) — 10 articles (Specificity, Novelty, Sourced Claims, Distinctive POV, No Banned Language, Critic Reads Intake, Cross-Model Critic, Iteration Cap, Specificity > Volume, Save Rate > Like Rate) + Application Order + scope notes.

### A17 — trendsmcp wire

- [~] **A17** Authored [`decisions/0002-trendsmcp-wire.md`](../decisions/0002-trendsmcp-wire.md) — full install/register/restart/verify steps. **Actual gateway settings.json patch deferred pending user approval** (gateway config changes require explicit OK).

---

## Exit Criteria — All Met

- [x] Schema documented (v3 appended to existing spec)
- [x] Orchestrator skeleton present (3 skills scaffolded + symlinked)
- [x] All paths exist on disk
- [x] arch-verify down from 4 → 1 failures (remaining is Phase I cleanup)
- [x] Voice schema + Constitution authored
- [x] Research docs in [../docs/](../docs/) cited from skill scaffolds

---

## Pre-existing Items NOT Fixed in Phase A (tracked in master proposal)

- I4 — `CELAVII_API_KEY` missing from `SHELL_ENV_EXPECTED_KEYS` in `openclaw/src/config/io.ts`
- I3 — skills.md skill-count locations (some markdown counts may still reference 39 in 4 places, only the primary "39 skills" line + table were updated)

These are Phase I (Architecture Drift Cleanup) work. Not regressions — pre-existing.

---

## Files Created / Modified (audit trail)

### Created

- `openclaw/skills/social-orchestrator/SKILL.md`
- `openclaw/skills/social-orchestrator/references/critic-intake-rule.md`
- `openclaw/skills/social-persona/SKILL.md`
- `openclaw/skills/social-persona/references/NOTICE.md`
- `openclaw/skills/social-drift/SKILL.md`
- `openclaw/skills/social-drift/references/NOTICE.md`
- `openclaw/.claude/rules/social-constitution.md`
- `openclaw/.system/features/social-strategy/plugin/plugin.json`
- `openclaw/.system/features/social-strategy/hooks/hooks.json`
- `openclaw/.system/features/social-strategy/hooks/validate-social-content.py`
- `openclaw/.system/features/social-strategy/decisions/0001-pdf-stack.md`
- `openclaw/.system/features/social-strategy/decisions/0002-trendsmcp-wire.md`
- `openclaw/.system/features/social-strategy/v1/IMPLEMENTATION.md`
- `openclaw/.system/features/social-strategy/v1/TRACKER.md` ← this file
- `~/dev/workspace/.styles/celavii/voice.json`
- Symlinks: `workspace/skills/social-{orchestrator,persona,drift}` → `openclaw/skills/social-*`
- Directory skeleton (10 dirs across `projects/celavii/{content,research,deliverables,media}` and `openclaw/skills/social-*`, `openclaw/.system/features/social-strategy/`)

### Modified

- `~/dev/workspace/projects/celavii/research/social/SOCIAL-STRATEGY-STATE-SPEC.md` (v3 schema appended)
- `~/dev/workspace/projects/celavii/PROJECT.md` (Research-Social section updated)
- `openclaw/.system/architecture/skills.md` (count + 3 new rows)
- `openclaw/.system/architecture/VALUES.md` (counts + last-verified)

---

## Next Up — Phase B

See [IMPLEMENTATION.md § 4 Phase B](IMPLEMENTATION.md). Recommended start order:

1. EVAL-1 + EVAL-2 (audit social_listener adapters before authoring any scrape skill)
2. B13 `social-persona` CLI (vendor Anthropic brand-voice content)
3. B11 `social-discover` + `social-competitor-scrape` (wrap, don't reimplement)
4. B16 `social-drift` SQLite + 17 rules
5. B18 `social-hooks` (5 archetypes)
6. B14 `social-factcheck` (Loki fork)
7. B15 `social-cannibalization` (embeddings + temporal)
