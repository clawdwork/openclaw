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
├── skills.md          ← Skills inventory (60 skills), loading mechanics
├── VALUES.md         ← Single source of truth for runtime values (ports, counts, paths)
├── MAINTENANCE.md     ← Documentation maintenance proposal and decisions
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

1. Run the automated verification script first:
   // turbo

```bash
bash scripts/arch-verify.sh
```

2. Read all architecture files to understand current documented state:
   // turbo

```bash
wc -l .implementation/system-architecture/*.md
```

3. Run additional verification commands for areas the script doesn't cover:
   // turbo

```bash
echo "=== Vercel deployments ===" && vercel ls --token "$VERCEL_TOKEN" 2>/dev/null | head -20 && echo "=== GitHub repos ===" && gh repo list clawdwork --json name --jq '.[].name' 2>/dev/null
```

4. Cross-check each document for discrepancies (use arch-verify.sh output as starting point):
   - **skills.md**: Does skill count match `find` output? Are all categories listed?
   - **deployments.md**: Do active deployments match `vercel ls`? Are all GitHub repos listed?
   - **org-structure.md**: Does workspace structure match actual directories?
   - **agents.md**: Do agent definitions match `openclaw.json` agents.list?
   - **security.md**: Are sandbox configs current?
   - **channels.md**: Do channel configs match gateway status?
   - **costs.md**: Are model prices still accurate?
   - **README.md**: Does overview diagram match current agent count/models?

5. Output a discrepancy checklist:

```
## Architecture Review Results

### ✅ Up to date
- [list files that are current]

### ⚠️ Needs update
- [file]: [what's wrong]

### Recommended actions
- [specific edits needed]
```

6. Wait for user approval before making any changes.

---

## Mode: Update

Use when: user says what changed (e.g., "added a new skill", "deployed a new site", "changed a model")

### Steps

1. Ask the user: **What changed?** Identify the change type:

| Change Type                 | Files to Update                                                           |
| --------------------------- | ------------------------------------------------------------------------- |
| New skill added             | `skills.md`, `VALUES.md`, `README.md` — see **New Skill Checklist** below |
| Skill removed/renamed       | `skills.md`                                                               |
| New deployment              | `deployments.md`                                                          |
| New GitHub repo             | `deployments.md`                                                          |
| New agent provisioned       | `org-structure.md`, `agents.md`                                           |
| Model changed               | `README.md` (hierarchy table + diagram), `agents.md` (domain table)       |
| Channel added/changed       | `channels.md`                                                             |
| New API key added           | `security.md`, `VALUES.md`, `~/.openclaw/.env`, `src/config/io.ts`        |
| Security/token change       | `security.md`                                                             |
| Cost model changed          | `costs.md`                                                                |
| Workspace structure changed | `org-structure.md`                                                        |

2. Check `VALUES.md` first — if the change affects a tracked value, update VALUES.md.

3. Read ONLY the affected file(s) — do not read all 9 files for a targeted update.

4. Make the edits to the affected file(s).

5. Append to `CHANGELOG.md` with today's date and a concise description:

```
| YYYY-MM-DD | **Bold category**: Description of change |
```

6. Run `scripts/arch-verify.sh` to confirm no drift remains.
   // turbo

```bash
bash scripts/arch-verify.sh
```

7. Output a summary of what was changed.

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

## Mode: New Skill Added

Use when: "added a new skill", "created celavii-\* skills", etc.

### Checklist (all steps required)

1. **Create** `skills/{name}/SKILL.md` in the repo (source of truth)
2. **Copy** to `~/agent-workspace/skills/{name}/` (runtime location):
   ```bash
   cp -r skills/{name} ~/agent-workspace/skills/{name}
   ```
3. **Verify** visible via symlink:
   // turbo
   ```bash
   ls ~/.openclaw/skills/{name}/SKILL.md
   ```
4. **Update** `skills.md` → add skill to the appropriate section table
5. **Update** `skills.md` → increment skill count in ALL 4 locations (header, access matrix ×3)
6. **Update** `VALUES.md` → update "Skill count (managed)" and relevant sub-counts
7. **Update** `README.md` → document index description if skill count changed
8. **Update** `README.md` → domain sub-agent models table if skills column changed
9. If skill needs env vars:
   - Add to `~/.openclaw/.env`
   - Add to `security.md` env vars section
   - Add to `SHELL_ENV_EXPECTED_KEYS` in `src/config/io.ts`
   - Update `VALUES.md` API Keys table
10. **Append** to `CHANGELOG.md`
11. **Run** `scripts/arch-verify.sh` to confirm no drift

---

## Mode: New API Key Added

Use when: a new external API key needs to be configured.

### Checklist

1. **Add** key entry to `~/.openclaw/.env` (with section header and comment)
2. **Add** to `security.md` env vars code block
3. **Add** to `SHELL_ENV_EXPECTED_KEYS` in `src/config/io.ts`
4. **Update** `VALUES.md` API Keys table
5. **Append** to `CHANGELOG.md`
6. **Run** `scripts/arch-verify.sh`

---

## Rules

- **Never edit the frozen `.implementation/SYSTEM-ARCHITECTURE.md`** — it's preserved as a snapshot
- **Always append to CHANGELOG.md** after any update
- **Minimize cross-file edits** — the whole point of the split is to reduce cascading changes
- **Use verification commands** to check actual state, don't guess
- **Keep tables aligned** — use consistent column widths within each file
- **Run `scripts/arch-verify.sh`** before AND after any update
- **Update `VALUES.md`** whenever a tracked value changes
- **Follow the New Skill / New API Key checklists** — they exist to prevent the exact drift issues we've hit before
