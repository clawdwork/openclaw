---
name: social-post
description: >
  /social_post post_id={id} — single-post regeneration. Runs the per-post sub-skill
  chain (research → hooks → brief → script → shotlist → silo-check → Gate C) for
  one calendar entry. Use when a single post fails Gate C in /social_curate, or
  for ad-hoc one-off posts outside the weekly cadence.
---

# /social_post

> **Phase F1 contract.** The per-post unit of work, callable in isolation. `/social_curate` invokes this loop internally per scheduled entry; `/social_post` is the same chain exposed as a one-shot.

---

## Help

```
/social_post post_id=celavii-ig-carousel-001        → regenerate a single calendar entry
/social_post post_id=... force=true                 → re-curate even if Gate C ≥ 7.5
/social_post post_id=... dry-run                    → estimate cost; no generation
/social_post post_id=... ad-hoc topic="..." channel=celavii platform=instagram format=reel
                                                    → ad-hoc post not in calendar
/social_post post_id=... only=hooks                 → run only one sub-skill (hooks|brief|script|shotlist|gate-c)
/social_post help                                   → this block
```

**Output**: brief + hooks + citations + (if video) script + shotlist + Gate C score, all written to `briefs/`. Does NOT zip into a weekly bundle (that's `/social_curate`'s job).

**Cost**: ~$0.66 static / ~$1.16 video per post.

---

## Trigger

User says any of: `/social_post`, "regenerate post X", "redo this post", "make me a one-off post about X for celavii".

---

## Execution modes

### Mode 1 — Calendar entry (default)

```bash
/social_post post_id=celavii-ig-carousel-001
```

Reads the entry from `state.phases.plan.publication_calendar[]`. Errors if `post_id` not found.

### Mode 2 — Forced re-curation

```bash
/social_post post_id=celavii-ig-carousel-001 force=true
```

Skips the "already curated, Gate C ≥ 7.5" check. Use when the brief needs a regenerate after upstream changes (voice update, citation refresh, archetype retarget).

### Mode 3 — Ad-hoc (off-calendar)

```bash
/social_post post_id=celavii-ig-adhoc-2026-04-29 \
  ad-hoc \
  topic="agentic outreach demo" \
  channel=celavii \
  platform=instagram \
  format=reel \
  pillar_id=p-001-agentic-marketing \
  hook_archetype_target=authority \
  e_tags=educate,empower
```

Builds a synthetic calendar entry, runs the chain, **does not** insert it into `publication_calendar` automatically (user must explicitly run `/social_strategy phase=4` to add ad-hoc entries to the official plan).

### Mode 4 — Single-step

```bash
/social_post post_id=celavii-ig-carousel-001 only=hooks
/social_post post_id=celavii-ig-carousel-001 only=script
/social_post post_id=celavii-ig-carousel-001 only=gate-c
```

Runs exactly one sub-skill. Useful to refresh hooks (e.g. user wants a different archetype) or re-score Gate C after manual brief edits.

Allowed values: `research | hooks | brief | script | shotlist | silo-check | gate-c`.

---

## Per-post chain

Identical to `/social_curate` § Per-post sub-skill chain. See [`social-curate.md` § Per-post sub-skill chain](social-curate.md). Same failure handling: silo-check fail → 1 re-brief with pillar reminder → flag if still fails. No further auto-iteration.

```pseudocode
load_post(post_id, mode)
  → research → hooks (5+ archetype-tagged) → brief → (if video) script + shotlist
  → silo-check → Gate C
write outputs to briefs/
update state.phases.deliver.briefs[post_id]
print summary line + Gate C score
```

---

## State writes

```jsonc
state.phases.deliver.briefs[post_id] = {
  brief_path:     "briefs/celavii-ig-carousel-001-brief.md",
  hooks_path:     "briefs/celavii-ig-carousel-001-hooks.md",
  citations_path: "briefs/celavii-ig-carousel-001-citations.md",
  script_path:    null,
  shotlist_path:  null,
  gate_c:         { score: 8.4, status: "pass", ran_at: "<iso>" },
  ad_hoc:         false,                // true for Mode 3
  regen_count:    1                      // increments on each /social_post call
}
```

If the post is part of a `weekly_cycles[]` entry that was already complete, also update that cycle's `gate_c_scores[post_id]`.

---

## Dry-run mode

```bash
/social_post post_id=celavii-ig-carousel-001 dry-run
```

Returns:

```
Dry run — /social_post post_id=celavii-ig-carousel-001

  Calendar entry found in: state.phases.plan.publication_calendar
  Channel:    celavii
  Platform:   instagram
  Format:     carousel  (static — no video lane)
  Pillar:     p-001-agentic-marketing
  Hook target: authority

  Already curated?  yes (Gate C 8.4 on 2026-04-25)
  Will skip?        yes — pass force=true to re-curate

  If force=true:
    Sub-skills firing:  social-research, social-hooks, social-brief, silo-check, gate-c
    Estimated cost:     $0.66
    Estimated time:     ~4 min
```

---

## Differences vs `/social_curate`

| Aspect                | `/social_curate`                   | `/social_post`                                      |
| --------------------- | ---------------------------------- | --------------------------------------------------- |
| Scope                 | Whole week (5–10 posts typical)    | One post                                            |
| Output                | Zipped bundle + index README       | Loose files in `briefs/`                            |
| State                 | Appends to `state.weekly_cycles[]` | Updates `state.phases.deliver.briefs[post_id]` only |
| Skip-already-done     | Yes (Gate C ≥ 7.5)                 | Configurable via `force=`                           |
| Ad-hoc / off-calendar | No                                 | Yes (Mode 3)                                        |
| Single-step refresh   | No                                 | Yes (Mode 4 `only=`)                                |

---

## When to use which

- **Weekly production rhythm** → `/social_curate week=...`
- **One post failed Gate C, want to re-curate** → `/social_post post_id=... force=true`
- **Need a same-day post not in the plan** → `/social_post ad-hoc ...` (then optionally insert into calendar via `/social_strategy phase=4`)
- **Just need new hook variants** → `/social_post post_id=... only=hooks`
- **Manual edit done, re-score Gate C** → `/social_post post_id=... only=gate-c`

---

## Integration

- Shares per-post chain with `/social_curate` (same sub-skill calls, same failure handling)
- Does NOT trigger upstream phases (no Phase 4 PLAN edit unless user explicitly does it)
- Calls `/social_repurpose` (Phase F2) when the calendar entry has `repurpose_lineage` — repurposed posts inherit pillar context and preserve lineage

## References

- [`/social_curate` command spec](social-curate.md) — shares per-post chain
- [`social-brief/SKILL.md`](../../social-brief/SKILL.md)
- [`social-quality/SKILL.md`](../../social-quality/SKILL.md) — silo-check + Gate C
- [`social-repurpose/SKILL.md`](../../social-repurpose/SKILL.md) — for repurposed entries
