---
description: Sync your fork with upstream OpenClaw releases while preserving custom modifications
---

# Upstream Sync Workflow (/sync-upstream)

Keeps your workspace (`clawdwork/openclaw-workspace`) up to date with the official OpenClaw repo (`openclaw/openclaw`) while preserving all custom modifications (Celavii skills, architecture docs, cron delivery fallback, etc.).

---

## Remotes

```
origin   → https://github.com/clawdwork/openclaw-workspace.git  (your fork)
upstream → https://github.com/openclaw/openclaw.git              (official)
```

---

## Mode: Preview (Safe — no changes)

Use when: "what's new upstream?", "check for updates", "preview upstream changes"

### Steps

1. Fetch upstream without merging:
   // turbo

```bash
git fetch upstream
```

2. Show what's changed upstream since your last sync:
   // turbo

```bash
git log --oneline main..upstream/main | head -30
```

3. Show which files upstream changed that you also modified:

```bash
echo "=== Your custom files ===" && git log --oneline --name-only origin/main..HEAD | grep -v '^[a-f0-9]' | sort -u > /tmp/our-files.txt && cat /tmp/our-files.txt && echo "" && echo "=== Upstream changed files ===" && git diff --name-only main...upstream/main > /tmp/upstream-files.txt && cat /tmp/upstream-files.txt && echo "" && echo "=== CONFLICT CANDIDATES (both modified) ===" && comm -12 /tmp/our-files.txt /tmp/upstream-files.txt
```

4. Output a sync assessment:

```
## Upstream Sync Preview

### New upstream commits: N
### Files changed upstream: N
### Conflict candidates: N (files modified by both us and upstream)

### Conflict files:
- [list files that both sides touched]

### Safe to auto-merge:
- [list files only upstream touched]

### Recommendation:
- [rebase / cherry-pick / manual review needed]
```

5. Wait for user approval before proceeding.

---

## Mode: Sync (Makes changes)

Use when: "sync upstream", "pull latest", "update from upstream"

### Steps

1. Ensure working tree is clean:
   // turbo

```bash
git status --short
```

If dirty, commit or stash first.

2. Fetch upstream:
   // turbo

```bash
git fetch upstream
```

3. Create a backup branch before rebasing:

```bash
git branch backup/pre-sync-$(date +%Y%m%d-%H%M%S)
```

4. Rebase your commits on top of upstream:

```bash
git rebase upstream/main
```

5. If conflicts occur:
   - Review each conflict carefully
   - **ALWAYS prefer our version** for files in:
     - `.system/` (our architecture docs)
     - `skills/celavii-*` (our custom skills)
     - `scripts/arch-verify.sh` (our maintenance tooling)
     - `.windsurf/` (our workflows)
   - **ALWAYS prefer upstream** for files we haven't customized
   - For shared files (e.g., `src/config/io.ts`, `src/cron/isolated-agent/run.ts`):
     - Review the diff carefully
     - Keep our additions (CELAVII_API_KEY, channel fallback)
     - Accept upstream improvements around our changes
   - After resolving each file: `git add <file>`
   - Continue rebase: `git rebase --continue`
   - If it gets too messy: `git rebase --abort` and fall back to cherry-pick mode

6. Verify the build:

```bash
pnpm build
```

7. Run tests:

```bash
pnpm test 2>&1 | tail -5
```

8. Force-push to origin (rebase rewrites history):

```bash
git push origin main --force-with-lease
```

9. Delete backup branch if everything looks good:

```bash
git branch -D backup/pre-sync-$(date +%Y%m%d-%H%M%S)
```

---

## Mode: Cherry-Pick (Selective sync)

Use when: conflicts are too complex for a full rebase, or you only want specific upstream changes.

### Steps

1. Fetch upstream:
   // turbo

```bash
git fetch upstream
```

2. List upstream commits:
   // turbo

```bash
git log --oneline main..upstream/main | head -30
```

3. Cherry-pick specific commits:

```bash
git cherry-pick <commit-hash>
```

4. Resolve conflicts if any, same rules as rebase mode.

5. Push:

```bash
git push origin main
```

---

## Our Custom Files (Protected)

These files contain our modifications. During sync, always preserve our version unless upstream made critical security fixes:

### Files we added (upstream won't have these):

- `.system/features/celvaii-api/` — Celavii API analysis + skill specs
- `.system/architecture/VALUES.md` — Runtime values
- `.system/architecture/MAINTENANCE.md` — Maintenance proposal
- `scripts/arch-verify.sh` — Architecture verification
- `skills/celavii-*` — 7 Celavii API skills
- `.windsurf/workflows/sync-upstream.md` — This workflow

### Files we modified (may conflict with upstream):

- `src/config/io.ts` — Added CELAVII_API_KEY to SHELL_ENV_EXPECTED_KEYS
- `src/cron/isolated-agent/run.ts` — Smart channel fallback for delivery
- `.system/architecture/*.md` — Architecture docs (ports, skills, agents)
- `.windsurf/workflows/architecture.md` — Enhanced with checklists

---

## Post-Sync Checklist

After every sync, run:

// turbo

```bash
bash scripts/arch-verify.sh
```

Then verify:

- [ ] `CELAVII_API_KEY` still in `SHELL_ENV_EXPECTED_KEYS` (`src/config/io.ts`)
- [ ] Channel fallback code intact in `src/cron/isolated-agent/run.ts`
- [ ] All 7 Celavii skills present in `skills/celavii-*/SKILL.md`
- [ ] Architecture docs still reference port 19400
- [ ] Gateway starts and Telegram works

---

## Rules

- **Never force-push without a backup branch**
- **Always preview before syncing** — run Preview mode first
- **Build + test before pushing** — catch integration issues early
- **Prefer rebase** for clean history; fall back to cherry-pick if conflicts are severe
- **Document upstream version** in VALUES.md after each sync
