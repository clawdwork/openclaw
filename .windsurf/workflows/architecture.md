---
description: Review or update the OpenClaw system architecture documentation
---

# Architecture Workflow (/architecture)

Manages the modular system architecture documentation at `.implementation/system-architecture/`.

---

## Document Index

```
.implementation/system-architecture/
├── README.md          ← Overview, model hierarchy, quick reference
├── agents.md          ← Sub-agent definitions, routing, spawning, lifecycle
├── skills.md          ← Skills inventory (50 skills), loading mechanics
├── org-structure.md   ← Org directory layout, workspaces, access matrix, roles
├── deployments.md     ← GitHub, repo conventions, Vercel deployments, templates
├── security.md        ← Token architecture, env siloing, sandbox, leakage prevention
├── channels.md        ← Telegram, WhatsApp, WebChat, bindings
├── costs.md           ← Monthly projections, per-task estimates
└── CHANGELOG.md       ← Version history
```

---

## Mode: Review

Use when: "review the architecture", "audit the docs", "check if architecture is up to date"

### Steps

1. Read all 9 architecture files to understand current documented state:
   // turbo

```bash
wc -l .implementation/system-architecture/*.md
```

2. Run verification commands to check actual state against documented state:
   // turbo

```bash
echo "=== Skills count ===" && find -L ~/.openclaw/skills -name "SKILL.md" -type f | wc -l && echo "=== Skills categories ===" && ls ~/.openclaw/skills/ && echo "=== Vercel deployments ===" && vercel ls --token "$VERCEL_TOKEN" 2>/dev/null | head -20 && echo "=== GitHub repos ===" && gh repo list clawdwork --json name --jq '.[].name' 2>/dev/null
```

3. Cross-check each document for discrepancies:
   - **skills.md**: Does skill count match `find` output? Are all categories listed?
   - **deployments.md**: Do active deployments match `vercel ls`? Are all GitHub repos listed?
   - **org-structure.md**: Does workspace structure match actual directories?
   - **agents.md**: Do agent definitions match `openclaw.json` agents.list?
   - **security.md**: Are sandbox configs current?
   - **channels.md**: Do channel configs match gateway status?
   - **costs.md**: Are model prices still accurate?
   - **README.md**: Does overview diagram match current agent count/models?

4. Output a discrepancy checklist:

```
## Architecture Review Results

### ✅ Up to date
- [list files that are current]

### ⚠️ Needs update
- [file]: [what's wrong]

### Recommended actions
- [specific edits needed]
```

5. Wait for user approval before making any changes.

---

## Mode: Update

Use when: user says what changed (e.g., "added a new skill", "deployed a new site", "changed a model")

### Steps

1. Ask the user: **What changed?** Identify the change type:

| Change Type                 | Files to Update                                                     |
| --------------------------- | ------------------------------------------------------------------- |
| New skill added             | `skills.md`                                                         |
| Skill removed/renamed       | `skills.md`                                                         |
| New deployment              | `deployments.md`                                                    |
| New GitHub repo             | `deployments.md`                                                    |
| New agent provisioned       | `org-structure.md`, `agents.md`                                     |
| Model changed               | `README.md` (hierarchy table + diagram), `agents.md` (domain table) |
| Channel added/changed       | `channels.md`                                                       |
| Security/token change       | `security.md`                                                       |
| Cost model changed          | `costs.md`                                                          |
| Workspace structure changed | `org-structure.md`                                                  |

2. Read ONLY the affected file(s) — do not read all 9 files for a targeted update.

3. Make the edits to the affected file(s).

4. Append to `CHANGELOG.md` with today's date and a concise description:

```
| YYYY-MM-DD | **Bold category**: Description of change |
```

5. Verify the edit is consistent (e.g., if you updated a skill count in skills.md, check README.md overview diagram doesn't contradict).

6. Output a summary of what was changed.

---

## Verification Commands

Use these to check actual state when reviewing:

### Skills

// turbo

```bash
find -L ~/.openclaw/skills -name "SKILL.md" -type f | wc -l
```

### Skill categories

// turbo

```bash
ls ~/.openclaw/skills/
```

### Active deployments

```bash
vercel ls --token "$VERCEL_TOKEN" 2>/dev/null | head -20
```

### GitHub repos

```bash
gh repo list clawdwork --json name --jq '.[].name'
```

### Gateway channels

```bash
openclaw channels status --probe 2>/dev/null
```

### Workspace directories

// turbo

```bash
ls ~/agent-workspace/skills/ && echo "---" && ls ~/org/workspaces/ 2>/dev/null
```

---

## Rules

- **Never edit the frozen `.implementation/SYSTEM-ARCHITECTURE.md`** — it's preserved as a snapshot
- **Always append to CHANGELOG.md** after any update
- **Minimize cross-file edits** — the whole point of the split is to reduce cascading changes
- **Use verification commands** to check actual state, don't guess
- **Keep tables aligned** — use consistent column widths within each file
