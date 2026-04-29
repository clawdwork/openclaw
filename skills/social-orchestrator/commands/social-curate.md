---
name: social-curate
description: >
  /social_curate week=YYYY-Wnn — runs the per-week production loop. Reads the
  publication calendar slice for the target week, then for each scheduled post
  runs research → citations → brief → (if video) script → shotlist → silo-check
  → Gate C. Produces a zipped handoff bundle.
---

# /social_curate

> **Phase E contract.** The user's stated weekly use case: "based on this strategy, for this week we have to curate the topics, research, prepare script, citations, shot list, silo check." Wraps Phase B atomic skills into a single weekly call.

---

## Help

```
/social_curate week=2026-W18              → curate ISO-week 2026-W18 (default: current week)
/social_curate week=current               → alias for current ISO week
/social_curate week=next                  → alias for next ISO week
/social_curate post_id=celavii-ig-001     → single-post mode (alias of /social_post)
/social_curate week=2026-W18 dry-run      → cost estimate; no actual generation
/social_curate resume                     → continue last incomplete week
/social_curate help                       → this block
```

**Prerequisite**: `/social_strategy` must have completed at least Phase 4 PLAN (calendar exists). If not: errors with "Run /social_strategy first; calendar not found."

**Output**: `deliverables/handoffs/social-week-{YYYYWW}.zip` + state delta in `state.weekly_cycles[]`.

**Cost**: ~$2/week per channel (3-channel calendar at ~6–8 posts/week → ~$5–8 total).

---

## Trigger

User says any of: `/social_curate`, "curate this week", "prep next week's content", "weekly bundle".

---

## Inputs

- `state.phases.plan.publication_calendar[]` — full plan from `/social_strategy`
- `state.intake` — channels, voice, banned language (passed to every sub-skill)
- `state.phases.aggregate.report_path_md` — for hook + topic context
- `state.weekly_cycles[]` — prior weekly runs (for resume + skip-already-done)

## Output Tree

```
~/dev/workspace/projects/{project}/research/social/
├── briefs/
│   ├── celavii-ig-carousel-001-brief.md
│   ├── celavii-ig-carousel-001-hooks.md
│   ├── celavii-ig-carousel-001-citations.md
│   ├── celavii-tt-video-002-brief.md
│   ├── celavii-tt-video-002-hooks.md
│   ├── celavii-tt-video-002-citations.md
│   ├── celavii-tt-video-002-script.md
│   ├── celavii-tt-video-002-shotlist.md
│   └── ... (one set per planned post in the week)
└── deliverables/handoffs/
    ├── social-week-2026W18/
    │   ├── README.md                              ← index
    │   ├── briefs/                                 ← copies of week's briefs
    │   ├── hooks/
    │   ├── scripts/
    │   ├── shotlists/
    │   ├── citations/
    │   └── gate-c-scores.json                      ← per-post Gate C scoring
    └── social-week-2026W18.zip                    ← shipped artifact
```

---

## Week resolution (E2)

### Step 1: Resolve the target week

| Input           | Resolution                                           |
| --------------- | ---------------------------------------------------- |
| `week=2026-W18` | Use that ISO week directly                           |
| `week=current`  | `datetime.now().isocalendar()[:2]` → e.g. `2026-W17` |
| `week=next`     | current + 7 days, then ISO-week                      |
| (no arg)        | default = `current`                                  |

### Step 2: Slice the calendar

```pseudocode
week_iso = "2026-W18"
week_start, week_end = iso_week_bounds(week_iso)  # Mon 00:00 → Sun 23:59:59 in user TZ

slice = [
  post for post in state.phases.plan.publication_calendar
  if week_start <= parse(post.scheduled_for) <= week_end
]
```

If `state.weekly_cycles[]` already has an entry for this week with `status=="complete"`: ask "Re-run? (existing bundle at {path}). [y/N]" — default no.

If the slice is empty: error with "No posts scheduled for {week_iso}. Adjust calendar via `/social_strategy phase=4` or pick a different week."

### Step 3: Skip-already-done

For each post in the slice, check `state.phases.deliver.briefs[]`:

- If brief already exists AND its Gate C score ≥ 7.5 → skip (already curated)
- If brief exists but Gate C < 7.5 → re-curate
- If no brief → curate

This makes resume + partial-week re-runs idempotent.

---

## Per-post sub-skill chain (E3)

For each post in `slice`:

```pseudocode
post.platform, post.channel, post.format, post.pillar_id, post.e_tags, post.hook_archetype_target

# 1. Research packet
research_packet_path = social-research generate \
  --topic post.pillar_id \
  --channel post.channel \
  --platform post.platform

# 2. Citations (extracted from research, structured)
citations_path = social-research citations \
  --research <research_packet_path> \
  --post-id post.post_id

# 3. Hook variants (≥5, archetype-tagged) — E8
hooks_path = social-hooks generate \
  --post-id post.post_id \
  --archetype-target post.hook_archetype_target \
  --channel post.channel \
  --variants 5

# 4. Brief (calls hooks/persona/sxo/citations as sub-skills internally)
brief_path = social-brief \
  --research <research_packet_path> \
  --post-id post.post_id \
  --platform post.platform \
  --channel post.channel \
  --hooks <hooks_path>

# 5. Video lane (only if format ∈ {reel, tiktok-video, yt-short, yt-long})
if post.format in VIDEO_FORMATS:
  script_path = social-script \
    --brief <brief_path> \
    --format post.format
  shotlist_path = social-shotlist \
    --script <script_path>
else:
  script_path = None
  shotlist_path = None

# 6. Silo-check (mid-pipeline gate; cheaper than full Gate C)
silo_result = social-quality mode=silo-check \
  --brief <brief_path> \
  --pillar-id post.pillar_id

if silo_result.status == "fail":
  # E4: re-brief once with explicit pillar reminder
  brief_path = social-brief \
    --research <research_packet_path> \
    --post-id post.post_id \
    --platform post.platform \
    --channel post.channel \
    --hooks <hooks_path> \
    --pillar-reminder "Drift detected: this post must stay within pillar {pillar_id}; the prior draft strayed into adjacent silos."
  silo_result = social-quality mode=silo-check ...
  if silo_result.status == "fail":
    # Hard fail after one retry — surface to user, don't loop further
    flag_post_for_human_review(post)
    continue

# 7. Per-post Gate C (8-axis composite scoring)
gate_c = social-quality mode=gate-c \
  --brief <brief_path> \
  --hooks <hooks_path> \
  --citations <citations_path> \
  --script <script_path or null> \
  --shotlist <shotlist_path or null>
```

### Failure handling (E4)

| Sub-skill       | Failure mode                                          | Action                                                      |
| --------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| social-research | source returns 0 results                              | Re-query with broader scope; if still 0, flag post, skip    |
| social-hooks    | <5 variants generated                                 | Re-run with `--variants 8`; if still <5, surface as warning |
| social-brief    | sub-skill chain hard-fails (e.g. SXO format mismatch) | Surface error; require human to fix calendar entry          |
| silo-check      | drift detected                                        | One re-brief with pillar reminder (E4); then flag if fails  |
| social-script   | hook + beats incompatible                             | Re-run with hook locked from `hooks_path`; max 1 retry      |
| Gate C          | score < 7.5                                           | Annotate brief with failure reasons; don't auto-iterate     |

**No iterating loops in `/social_curate`.** This is a production-volume command — failures get flagged, not auto-fixed. Iteration belongs in `/social_strategy` where Gate A/B can refine.

### Hook variant generation (E8)

`social-hooks generate` is called explicitly before `social-brief` (not just as brief's sub-skill) so the hook artifact ships independently to the bundle. Per-post hooks file format:

```markdown
---
post_id: celavii-ig-carousel-001
archetype_target: authority
channel: celavii
platform: instagram
generated_at: 2026-04-29T14:00:00Z
---

# Hook Variants — celavii-ig-carousel-001

## Primary (chosen for brief)

> "I scored 5K creator profiles last night. Here's what the agent found."

- Archetype: Authority
- 3s-hold prediction: 0.78
- Score: 8.2

## Variant 2 — Curiosity Gap

> "Nobody is talking about what 5K creator profiles reveal about agentic outreach."

- Archetype: Curiosity Gap
- 3s-hold prediction: 0.71
- Score: 7.6

## Variant 3 — Contrarian

[...]

## Variant 4 — Story

[...]

## Variant 5 — Pattern Interrupt

[...]
```

5 minimum (one per archetype where channel-affinity allows), more on demand. Each carries 3s-hold prediction + composite score per the [4-axis scoring rubric in social-hooks/SKILL.md § B18](../../social-hooks/SKILL.md).

---

## Bundle assembly (E5)

After all posts processed:

```pseudocode
bundle_dir = "deliverables/handoffs/social-week-{YYYYWW}"
mkdir -p bundle_dir/{briefs,hooks,scripts,shotlists,citations}

for post in completed_posts:
  cp briefs/{post_id}-brief.md     bundle_dir/briefs/
  cp briefs/{post_id}-hooks.md     bundle_dir/hooks/
  cp briefs/{post_id}-citations.md bundle_dir/citations/
  if post.script_path:
    cp briefs/{post_id}-script.md   bundle_dir/scripts/
  if post.shotlist_path:
    cp briefs/{post_id}-shotlist.md bundle_dir/shotlists/

write bundle_dir/gate-c-scores.json
write bundle_dir/README.md

zip social-week-{YYYYWW}.zip bundle_dir/
```

### Index README format

```markdown
# Social Week 2026-W18 — Handoff Bundle

**Project**: celavii
**Week**: 2026-04-27 → 2026-05-03
**Generated**: 2026-04-29T14:00:00Z
**Posts curated**: 7 / 7 planned (1 flagged for human review)

## Schedule

| Day | Time  | Channel   | Platform  | Format   | post_id                 | Gate C           |
| --- | ----- | --------- | --------- | -------- | ----------------------- | ---------------- |
| Mon | 14:00 | celavii   | instagram | carousel | celavii-ig-carousel-001 | 8.4              |
| Mon | 18:00 | elioth    | tiktok    | video    | elioth-tt-video-001     | 7.9              |
| Tue | 14:00 | celavii   | tiktok    | video    | celavii-tt-video-002    | 8.1              |
| Wed | 09:00 | cutmaster | tiktok    | video    | cutmaster-tt-video-003  | 7.7              |
| Thu | 14:00 | celavii   | instagram | reel     | celavii-ig-reel-004     | ⚠️ 6.8 (flagged) |
| Fri | 11:00 | celavii   | x         | thread   | celavii-x-thread-005    | 8.0              |
| Sat | 10:00 | elioth    | instagram | reel     | elioth-ig-reel-006      | 8.5              |

## Flagged for Human Review

- **celavii-ig-reel-004** — Gate C 6.8: hook score 5.2 (no Authority archetype hit despite target). Review hooks file; choose alternate variant or re-record opening.

## Files

- `briefs/{post_id}-brief.md` — full brief per post (hook, beats, CTA, hashtags, success metric)
- `hooks/{post_id}-hooks.md` — 5 archetype-tagged hook variants
- `citations/{post_id}-citations.md` — sourced claims with evidence URLs
- `scripts/{post_id}-script.md` — long-form video scripts (where applicable)
- `shotlists/{post_id}-shotlist.md` — camera/b-roll/on-screen text breakdowns
- `gate-c-scores.json` — machine-readable per-post scoring

## Next Step

Hand off to `celavii-social` for execution, OR run `/social_post post_id={id}` for any single-post regeneration.
```

---

## State writes (E6)

After bundle assembled:

```jsonc
state.weekly_cycles.append({
  "week_iso": "2026-W18",
  "week_start": "2026-04-27",
  "week_end":   "2026-05-03",
  "ran_at":     "2026-04-29T14:00:00Z",
  "status":     "complete",         // or "partial" if any flagged-for-review
  "post_count_planned":  7,
  "post_count_curated":  7,
  "post_count_flagged":  1,
  "bundle_path": "deliverables/handoffs/social-week-2026W18.zip",
  "bundle_dir":  "deliverables/handoffs/social-week-2026W18",
  "gate_c_scores": {
    "celavii-ig-carousel-001": { "score": 8.4, "status": "pass" },
    "celavii-ig-reel-004":     { "score": 6.8, "status": "flagged" },
    ...
  },
  "cost_actual_usd": 5.20
})

# Also update each post's brief reference in state.phases.deliver.briefs[]
state.phases.deliver.briefs.update({
  post_id: { brief_path, hooks_path, citations_path, script_path, shotlist_path, gate_c }
})
```

---

## Dry-run mode (E7)

```bash
/social_curate week=2026-W18 dry-run
```

Returns:

```
Dry run — /social_curate week=2026-W18

  Posts scheduled this week:        7
  Already curated (Gate C ≥ 7.5):   2  (skip)
  To curate:                        5
  Of which video format:            3  (script + shotlist required)

  Estimated LLM cost:               $3.80
  Estimated wall time:              22 min
  Estimated bundle size:            ~280 KB (5 briefs + hooks + citations + 3 scripts + 3 shotlists)

  Sub-skills that will fire:
    social-research ×5
    social-hooks ×5
    social-brief ×5
    social-script ×3
    social-shotlist ×3
    social-quality silo-check ×5
    social-quality gate-c ×5

  Skipped (already complete):
    celavii-ig-carousel-001 (Gate C 8.4)
    cutmaster-tt-video-003 (Gate C 7.7)

Continue? [y/N]
```

User confirms → real run drops `dry-run`. Same idempotency: re-running a `dry-run` is free (no LLM calls; just calendar slice math).

---

## Cost estimate

Per-week (3-channel, ~6–8 posts):

| Step                         | Cost per post | Notes                                         |
| ---------------------------- | ------------- | --------------------------------------------- |
| social-research              | ~$0.20        | Brave search + extraction; reused across week |
| social-hooks (5 variants)    | ~$0.08        | Sonnet, low-thinking                          |
| social-brief                 | ~$0.15        | Sonnet medium; calls 4 sub-skills             |
| social-script (if video)     | ~$0.40        | 8-pass humanizer accounts for most cost       |
| social-shotlist (if video)   | ~$0.10        | ClipsAI does heavy lifting                    |
| silo-check                   | ~$0.05        | Sonnet low; reads brief + pillar              |
| Gate C (8-axis, cross-model) | ~$0.18        | Opus critic over brief + hooks + citations    |

Per-post static: ~$0.66
Per-post video: ~$1.16
**Weekly bundle (5 static + 3 video typical): ~$6.80**

---

## Resume (E7)

```bash
/social_curate resume
```

Reads `state.weekly_cycles[-1]`. If `status=="partial"` or `status=="incomplete"`: continues from the first uncurated post in that week's slice. Otherwise: error "Last week complete; specify week=…".

---

## Integration

- Calls `/social_strategy` artifacts (read-only): `state.phases.plan.publication_calendar`, `state.phases.aggregate.report_path_md`, `state.intake`
- Invokes per-post sub-skills: `social-research`, `social-hooks`, `social-brief`, `social-script`, `social-shotlist`, `social-quality`
- Output handed off to: `celavii-social` (final copy + media-prompt generation), or human review (Telegram)

## What this command does NOT do

- ❌ Adjust the publication calendar — that belongs to `/social_strategy phase=4`
- ❌ Re-run aggregate or gates A/B — strategy-level concerns, not weekly
- ❌ Auto-iterate failed Gate C — annotate and surface; humans decide
- ❌ Schedule or publish posts — `celavii-social` (or future scheduler integration) does that

## References

- [Phase D /social_strategy](social-strategy.md) — upstream calendar producer
- [`social-brief/SKILL.md`](../../social-brief/SKILL.md) — per-post brief contract
- [`social-quality/SKILL.md`](../../social-quality/SKILL.md) — silo-check + Gate C modes
- [`social-hooks/SKILL.md`](../../social-hooks/SKILL.md) — 5-archetype variant generator
- [`social-script/SKILL.md`](../../social-script/SKILL.md) + [`social-shotlist/SKILL.md`](../../social-shotlist/SKILL.md) — video lane
