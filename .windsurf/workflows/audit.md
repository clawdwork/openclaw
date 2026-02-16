---
description: Run a workspace audit on one or all projects to check structural integrity, registry completeness, content consistency, and freshness
---

# Workspace Audit Workflow (/audit)

Triggers the workspace-auditor agent to run an integrity check on workspace projects.

---

## Usage

- `/audit` — Full audit on ALL projects
- `/audit max-kick` — Audit all Max Kick related projects
- `/audit celavii` — Audit Celavii project only
- `/audit {project-name}` — Audit a specific project
- `/audit fix` or user says "fix it" / "reconcile" — Fix issues from the latest audit report

---

## Steps

### Step 1: Determine Scope

If the user specified a project name, map it to the correct project paths:

| User Says                                     | Projects to Audit                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| `max-kick` or `kick` or `maxkick` or `sheetz` | `projects/max-kick/` (unified — kick merged in 2026-02-15)              |
| `celavii`                                     | `projects/celavii/`                                                     |
| `seo`                                         | `projects/seo-proposals/`                                               |
| (no project specified)                        | ALL projects in `projects/` (excluding `_archive/` and `deliverables/`) |

### Step 2: Spawn the Workspace Auditor

Spawn the `workspace-auditor` agent with this task:

```
Read skills/workspace-audit/SKILL.md for the full audit procedure.

Today is {TODAY}. Run a FULL audit (all 5 phases) on the following projects:
{LIST OF PROJECT PATHS}

Check:
1. Does every project have PROJECT.md (required) and README.md (identity anchor)?
2. Are research files registered in their PROJECT.md under "## Research Completed"?
3. Are deliverables registered in PROJECT.md under "## Deliverables"?
4. Is product identity consistent across all project docs?
5. Are there stale TODOs or files older than 7 days with no updates?
6. Any misplaced files outside their project directory?
7. Any duplicate nested directories under skills/?

Save the full audit report to knowledge/workspace/audit-{PROJECT_SLUG}-{YYYY-MM-DD}.md

Report findings as FAIL/WARN/PASS/INFO with specific file paths and recommended fixes.
Do NOT fix anything — report only.
```

### Step 3: Wait for Results

The auditor will save its report to `knowledge/workspace/audit-{slug}-{date}.md`.

### Step 4: Relay the Report

Once the auditor completes:

1. Read the audit report file
2. Summarize the key findings to the user:
   - Number of FAIL / WARN / PASS / INFO items
   - Top 3 critical issues
   - Recommended next actions
3. Ask the user: "Would you like me to fix the issues found?"

### Step 5: Fix (If User Approves)

If the user says yes:

1. For FAIL items: Fix immediately (spawn grunt or dev-coder as appropriate)
2. For WARN items: Fix in priority order
3. After fixes, re-run the audit to verify (spawn workspace-auditor again)
4. Report the before/after comparison

---

## Example Interaction

```
User: /audit max-kick

Bot: 🏗️ Running workspace audit on Max Kick projects...
     Spawning workspace-auditor (Pro, high thinking) — all 5 phases.

     [workspace-auditor completes]

Bot: 📋 Max Kick Workspace Audit Complete

     Summary: 3 FAIL, 5 WARN, 8 PASS, 2 INFO

     Critical Issues:
     1. FAIL: maxkick-brand-identity missing PROJECT.md
     2. FAIL: max-kick PROJECT.md has empty Research/Deliverables sections
     3. FAIL: max-kick missing README.md (identity anchor)

     Full report: knowledge/workspace/audit-maxkick-2026-02-15.md

     Would you like me to fix the issues found?

User: Yes, fix them

Bot: [spawns fixes, then re-audits]
     ✅ Re-audit complete: 0 FAIL, 1 WARN, 14 PASS, 1 INFO
```

---

---

## Mode: Fix / Reconcile

Use when: user says "fix it", "reconcile", `/audit fix`, or approves fixes after an audit.

### Steps

1. Spawn `workspace-auditor` with this task:

```
Read skills/workspace-reconcile/SKILL.md for the reconciliation procedure.
Read the latest audit report at knowledge/workspace/audit-{SLUG}-{YYYY-MM-DD}.md.
Execute ALL fixes for FAIL items, then WARN items.
Save fix log to knowledge/workspace/{SLUG}-fix-log-{YYYY-MM-DD}.md.
After fixes, run a verification check to confirm all issues are resolved.
```

2. After reconciliation completes, read the fix log and report results to user.

3. Spawn `workspace-auditor` again with audit skill to re-verify:

```
Read skills/workspace-audit/SKILL.md. Run a full audit (all 5 phases) on {same projects}.
Save report to knowledge/workspace/audit-{SLUG}-{YYYY-MM-DD}-post-fix.md.
```

4. Compare pre-fix audit vs post-fix audit and report improvement.

---

## Rules

- The auditor **reports only** during audit mode — it never fixes during audits
- The auditor **fixes autonomously** during reconcile mode — using the workspace-reconcile skill
- After fixing, always re-audit to verify
- Save all audit reports and fix logs to `knowledge/workspace/` for history
- Use the workspace-auditor agent (Pro, high thinking) — do NOT run audit or reconcile tasks inline
