# Status Semantics — When does each step flip to `complete`?

> **Surfaced from**: cutmasterai dry-run, 2026-05-04. Phase 0 wrote `acquire.status = complete` while `competitor_discovery.candidates_confirmed[]` was empty (user hadn't confirmed yet). Gate A would have read this as ready-to-score, which is wrong.
>
> **The rule**: `status` reflects whether the step's contract has been fully discharged, not whether the agent finished its part.

## The four status values

| Value           | Meaning                                                                                                                       | Allowed transitions                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `pending`       | Step has not started. Default initial value.                                                                                  | → `in_progress`                                                                                     |
| `in_progress`   | Agent is actively working on the step. Includes "research done, waiting on user confirmation" — confirmation is part of work. | → `awaiting_user` (if user input is required to flip to complete) or → `complete` (if no user gate) |
| `awaiting_user` | Agent has produced its artifact and is blocked on user input. Distinct from `in_progress` because the agent is idle.          | → `complete` (after user input)                                                                     |
| `complete`      | Step's contract is fully discharged. Downstream phases / gates may safely read this step's outputs.                           | terminal (until `/social_strategy refresh` rolls it back to `pending`)                              |

## What "contract fully discharged" means per step

| Step                                | Complete when…                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Intake** (each Q1–Q5, Q2.5)       | User has answered the question AND the answer passes the question's validation (e.g., Q3 specificity, Q2.5 ≥80 words ≥3 specific nouns).                     |
| **Intake locked**                   | All required questions complete AND auto-derived fields populated (`channel_types`, `business_concept`, `banned_language`, `channel_e_mix_targets`).         |
| **Phase 0.1 Resolve**               | Each (channel × platform) handle has been resolved OR confirmed unresolvable; `pre_launch[ch][p]` populated.                                                 |
| **Phase 0.2 Profile + 0.3 Posts**   | Profile + posts JSONs written to `raw/` for every (channel × platform) where `pre_launch=false`. Skipped pairs are recorded but don't block.                 |
| **Phase 0.4 Hashtag seeds**         | Each `intake.differentiators[]` has produced at least one hashtag-scrape artifact in `raw/`.                                                                 |
| **Phase 0.5a Competitor Discovery** | `candidates_surveyed >= 20` AND `candidates_surfaced >= 5` AND **`candidates_confirmed[].length >= 3`** (user confirmation required) AND `confirmed_at` set. |
| **Phase 0.5 Competitor baselines**  | Each confirmed competitor has a profile JSON in `raw/`.                                                                                                      |
| **Phase 0 ACQUIRE overall**         | All sub-steps above are `complete` (skipped sub-steps under pre-launch branch count as discharged). Then and only then `phases.acquire.status = complete`.   |
| **Gate A**                          | Critic has scored AND verification rule passed (Article 6 citations present) AND score ≥ threshold OR iteration cap reached.                                 |
| **Phase 1–6**                       | All artifacts the next phase requires are written to disk and referenced from state. Mid-phase intermediate state lives in `phases.{name}.in_progress_log`.  |

## The cardinal sin

Marking a step `complete` when downstream consumers would read invalid or partial outputs.

Specifically, the cutmasterai Phase 0 dry-run wrote `acquire.status = complete` with `competitor_discovery.candidates_confirmed = []`. Under the new semantics this is `awaiting_user` — the agent finished research, surfaced 5 candidates, but user confirmation hasn't landed yet. Gate A reading `complete` would have proceeded to score against `handles[].length == 0` and triggered the Article 6 fail clause we just wrote — caught downstream, but at the cost of one wasted Gate A iteration.

## Cascade rule

A parent step's `status` is the minimum of its children's statuses, ranked: `pending < in_progress < awaiting_user < complete`. The orchestrator MUST recompute parent status whenever a child status changes — never set parent status independently of child statuses.

## Phase entry / exit rule (Patches I-1 + I-5)

At phase entry, two mandatory reads (BOTH required, neither sufficient alone):

**State (Patch I-1)** — re-read state.json from disk, capture `phases.{name}.state_version_at_read = state.version_counter`. Catches data staleness from manual edits and parallel writes.

**Skills (Patch I-5)** — re-read (via Read tool) the skill files this phase depends on per `commands/social-strategy.md` § Skill Versioning § Mandatory phase-entry skill re-reads. Capture `phases.{name}.skill_versions_at_read[file] = {mtime, size_bytes}`. Catches spec staleness from mid-session skill edits — without this, the agent operates on its session-start cache of skills even if SKILL.md was just rewritten.

NEVER skip either. They catch different bug classes.

At phase exit: after final state write, capture `phases.{name}.state_version_at_write = state.version_counter`. If `state_version_at_write - state_version_at_read > {writes this phase made}`, an external edit happened mid-phase — flag in `phases.{name}.notes[]`.

## Refresh rule

`/social_strategy refresh` rolls `complete` → `pending` for all phases except `intake` (which stays locked unless user explicitly says "start new"). Refresh is the only mechanism to undo a `complete`.

## Anti-patterns

- ❌ Writing `complete` on the agent's behalf when the contract requires user input. Use `awaiting_user`.
- ❌ Recording the result of an in-progress step in `phases.{name}` while status is still `pending` — use `phases.{name}.in_progress_log` for intermediate writes, only commit to the canonical fields when the step transitions to `complete`.
- ❌ Skipping the cascade rule (writing parent `complete` while a child is `awaiting_user`). The cardinal sin in compact form.
- ❌ Treating skipped steps (pre-launch) as `pending` indefinitely — they should be marked `complete` with a `skip_reason` field, so cascade math works.
