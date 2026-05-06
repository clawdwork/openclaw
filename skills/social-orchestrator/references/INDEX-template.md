# INDEX.md — per-project social strategy run manifest

> **Purpose**: lists every `/social_strategy` run for a project so the orchestrator can detect resume candidates, the user can navigate runs, and stale runs get superseded explicitly. Maintained by the orchestrator at `projects/{project}/research/social/INDEX.md`.
>
> **Source of truth**: this file. Per-run `state.json` is authoritative for that run; this index is the cross-run catalog.

## Header (constant)

```markdown
# Social Strategy Runs — {project}

> Updated by `social-orchestrator`. Manual edits OK for status flips (e.g. `superseded`, `archived`); structural columns are agent-managed.

| Run ID | Channels | Platforms | Started | Last Phase | Status | Run Mode | Resumable |
| ------ | -------- | --------- | ------- | ---------- | ------ | -------- | --------- |
```

## Status enum

| Status               | Meaning                                                                                        | Resumable?                   |
| -------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------- |
| `running`            | Currently executing (some phase status ∈ in_progress / awaiting_user)                          | yes                          |
| `awaiting_user`      | Halted at intake question, advisory, or gate failure waiting for user input                    | yes                          |
| `complete`           | All 7 phases passed both gates; deliverable written                                            | no (start a refresh instead) |
| `failed`             | Halted at unrecoverable error (key revoked, schema validation, audit fail with no remediation) | yes (after fix)              |
| `superseded`         | Replaced by a later run; preserved for forensic reference                                      | no                           |
| `archived`           | Manually moved out (e.g. after a project rename)                                               | no                           |
| `legacy_pre_patch_n` | Run pre-dates Patch N output scoping; lives at the un-scoped path; do not overwrite            | no                           |

## Example INDEX.md (filled)

```markdown
# Social Strategy Runs — celavii

> Updated by `social-orchestrator`. Manual edits OK for status flips (e.g. `superseded`, `archived`); structural columns are agent-managed.

| Run ID                                         | Channels | Platforms               | Started             | Last Phase | Status             | Run Mode | Resumable |
| ---------------------------------------------- | -------- | ----------------------- | ------------------- | ---------- | ------------------ | -------- | --------- |
| `celavii-instagram-2026-05-06`                 | celavii  | instagram               | 2026-05-06 14:30 ET | plan       | running            | live     | yes       |
| `social-strategy-state-v1-2026-04-02` (legacy) | celavii  | unspecified (v1 schema) | 2026-04-02          | execute    | legacy_pre_patch_n | n/a      | no        |
```

## Resume detection algorithm

```python
def detect_resume_candidates(project_root):
    index_path = project_root / "research" / "social" / "INDEX.md"
    if not index_path.exists():
        return []
    rows = parse_markdown_table(index_path)
    candidates = [r for r in rows if r["status"] in {"running", "awaiting_user", "failed"}]
    return candidates  # orchestrator surfaces to user, default = most recent
```

## Update points

The orchestrator MUST update INDEX.md at five moments:

1. **Run start** — Phase 0 entry; appends a new row with `status: running`, `last_phase: acquire`, today's date as `started`
2. **Each phase exit** — bump `last_phase` to the phase just completed
3. **Gate halt** — flip `status: awaiting_user` when a gate fails or an advisory blocks
4. **Run end** — flip `status: complete` after Phase 6 + Gate B both pass
5. **Run abandon** — flip `status: failed` if the user explicitly aborts

Updates are append-only for new rows; existing-row updates rewrite the row in place. INDEX.md is **NOT** part of the schema-validated state — it's a flat markdown manifest, hand-editable.

## Why markdown not JSON

INDEX.md is human-first. Users open it to ask "what runs exist for this project?" — markdown table renders in any editor / GitHub view. A machine-parseable mirror lives at `INDEX.json` only if a downstream tool needs it (none today).

## Anti-patterns

- ❌ Forgetting to append the row at run start — the run becomes invisible to resume detection; orchestrator may treat next invocation as fresh
- ❌ Mutating a `complete` row's status back to `running` — start a new run instead, preserves forensic trail
- ❌ Embedding the run's full state in INDEX.md — index stays small (one row per run); state.json holds run detail
- ❌ Skipping the `legacy_pre_patch_n` entry on first migration — `superseded` artifacts disappear from agent visibility
