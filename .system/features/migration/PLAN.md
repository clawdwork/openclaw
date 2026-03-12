# Mono-Dev Root Migration Plan

> **Goal**: Consolidate all development locations under `~/dev/` so a single Windsurf IDE instance provides bird's-eye control of every repo, config, skill, and project.

**Status**: Draft  
**Created**: 2026-03-11  
**Author**: Architecture Review

---

## Current State → Target State

```
BEFORE                                          AFTER
──────                                          ─────
~/Documents/CascadeProjects/openclaw/   ──→     ~/dev/openclaw/
~/agent-workspace/                      ──→     ~/dev/workspace/
~/agent-workspace/projects/intel-hub/   ──→     ~/dev/intel-hub/       (extracted)
~/.openclaw/.env                        ──→     symlink → ~/dev/config/.env
~/.openclaw/openclaw.json               ──→     symlink → ~/dev/config/openclaw.json
~/.openclaw/skills                      ──→     symlink → ~/dev/workspace/skills/
(unchanged)                                     ~/dev/.windsurf/       (shared IDE config)
```

---

## Phase 0: Backup & Snapshot

> Safety net. Nothing changes on disk yet.

- [ ] **0.1** Commit all pending changes in `agent-workspace` (78 uncommitted files)

  ```bash
  cd ~/agent-workspace
  git add -A && git commit -m "chore: pre-migration snapshot"
  git push origin main
  ```

- [ ] **0.2** Commit pending changes in openclaw repo

  ```bash
  cd ~/Documents/CascadeProjects/openclaw
  git add -A && git commit -m "chore: pre-migration snapshot"
  git push origin main
  ```

- [ ] **0.3** Commit pending changes in intel-hub

  ```bash
  cd ~/agent-workspace/projects/intel-hub
  git add -A && git commit -m "chore: pre-migration snapshot"
  git push origin main
  ```

- [ ] **0.4** Delete stale backups (reclaim ~2GB)
  ```bash
  rm -rf ~/agent-workspace.bak-20260216-023749
  rm -f ~/agent-workspace-backup-2026-02-15-pre-maxkick-fix.tar.gz
  ```

---

## Phase 1: Create Dev Root & Move Repos

> Physical relocation. Gateway must be stopped during moves.

- [ ] **1.1** Stop the gateway

  ```bash
  openclaw gateway stop
  ```

- [ ] **1.2** Create the dev root

  ```bash
  mkdir -p ~/dev
  ```

- [ ] **1.3** Move openclaw repo

  ```bash
  mv ~/Documents/CascadeProjects/openclaw ~/dev/openclaw
  ```

- [ ] **1.4** Move agent-workspace

  ```bash
  mv ~/agent-workspace ~/dev/workspace
  ```

- [ ] **1.5** Extract intel-hub as sibling repo

  ```bash
  mv ~/dev/workspace/projects/intel-hub ~/dev/intel-hub
  ```

- [ ] **1.6** Update workspace .gitignore (remove old intel-hub exclusion, add new reference)

  ```bash
  # In ~/dev/workspace/.gitignore, change:
  #   projects/intel-hub/
  # to:
  #   (remove line — intel-hub is no longer nested)
  ```

- [ ] **1.7** Add intel-hub symlink back into projects/ (so project discovery still works)
  ```bash
  ln -s ../../intel-hub ~/dev/workspace/projects/intel-hub
  ```

---

## Phase 2: Config Symlinks (Control from Dev Root)

> Make .env and openclaw.json editable from the IDE while the binary reads from ~/.openclaw/.

### Validated Behavior

The OpenClaw binary loads config via:

- `~/.openclaw/.env` → `src/infra/dotenv.ts` → `dotenv.config({ path })` → **follows symlinks** ✅
- `~/.openclaw/openclaw.json` → `src/config/io.ts` → `fs.readFileSync` → **follows symlinks** ✅
- The binary also **writes** to `openclaw.json` (auto-backups, mutations) → symlink target must be writable ✅

Both use standard Node.js `fs` calls that transparently resolve symlinks.

### Steps

- [ ] **2.1** Create config directory in dev root

  ```bash
  mkdir -p ~/dev/config
  ```

- [ ] **2.2** Move .env to dev root

  ```bash
  mv ~/.openclaw/.env ~/dev/config/.env
  ```

- [ ] **2.3** Create symlink so binary still finds it

  ```bash
  ln -s /Users/operator/dev/config/.env ~/.openclaw/.env
  ```

- [ ] **2.4** Verify .env symlink works

  ```bash
  cat ~/.openclaw/.env | head -3
  # Should show "# OpenClaw API Keys"
  ls -la ~/.openclaw/.env
  # Should show: .env -> /Users/operator/dev/config/.env
  ```

- [ ] **2.5** Move openclaw.json to dev root

  ```bash
  mv ~/.openclaw/openclaw.json ~/dev/config/openclaw.json
  ```

- [ ] **2.6** Create symlink so binary still finds it

  ```bash
  ln -s /Users/operator/dev/config/openclaw.json ~/.openclaw/openclaw.json
  ```

- [ ] **2.7** Verify openclaw.json symlink works

  ```bash
  cat ~/.openclaw/openclaw.json | head -5
  # Should show JSON content
  ```

- [ ] **2.8** Move backup configs to dev root (keep accessible but not cluttering ~/.openclaw)

  ```bash
  mv ~/.openclaw/openclaw.json.bak* ~/dev/config/
  ```

- [ ] **2.9** Add `config/` to dev root .gitignore (secrets must not be committed)
  ```bash
  echo "config/.env" >> ~/dev/.gitignore
  echo "config/openclaw.json.bak*" >> ~/dev/.gitignore
  # openclaw.json CAN be committed (no secrets — uses ${VAR} refs)
  ```

---

## Phase 3: Update Skills Symlink

> The runtime skill symlink must point to the new workspace location.

- [ ] **3.1** Update ~/.openclaw/skills symlink

  ```bash
  rm ~/.openclaw/skills
  ln -s /Users/operator/dev/workspace/skills ~/.openclaw/skills
  ```

- [ ] **3.2** Verify skills are visible
  ```bash
  ls ~/.openclaw/skills/ | head -10
  ```

---

## Phase 4: Convert Repo Skill Symlinks to Relative Paths

> The 26 symlinks in openclaw/skills/ currently use absolute paths to ~/agent-workspace.
> Convert them to relative paths so they work within the ~/dev/ tree.

- [ ] **4.1** Run conversion script

  ```bash
  cd ~/dev/openclaw/skills

  # Remove old absolute symlinks and recreate as relative
  for link in celavii-outreach celavii-reporting celavii-strategy; do
    rm "$link"
    ln -s "../../workspace/skills/$link" "$link"
  done

  for link in seo-audit seo-competitor-pages seo-content seo-geo seo-hreflang \
    seo-images seo-orchestrator seo-page seo-plan seo-product-page \
    seo-programmatic seo-report-generator seo-schema seo-sitemap seo-technical; do
    rm "$link"
    ln -s "../../workspace/skills/seo/$link/" "$link"
  done

  for link in workspace-audit workspace-reconcile workspace-wizard; do
    rm "$link"
    ln -s "../../workspace/skills/$link" "$link"
  done

  for link in brand-identity quality-critic generating-proposal-documents \
    deploy-and-publish project-scaffold; do
    rm "$link"
    ln -s "../../workspace/skills/$link" "$link"
  done
  ```

- [ ] **4.2** Verify all symlinks resolve
  ```bash
  cd ~/dev/openclaw/skills
  for l in $(find . -maxdepth 1 -type l); do
    target=$(readlink "$l")
    if [ ! -e "$l" ]; then
      echo "BROKEN: $l -> $target"
    else
      echo "OK: $l -> $target"
    fi
  done
  ```

---

## Phase 5: Update Hardcoded Paths

> 19 occurrences in openclaw.json + references in workspace docs.

- [ ] **5.1** Update openclaw.json workspace paths

  ```bash
  sed -i '' 's|/Users/operator/agent-workspace|/Users/operator/dev/workspace|g' ~/dev/config/openclaw.json
  ```

- [ ] **5.2** Verify the change

  ```bash
  grep "workspace" ~/dev/config/openclaw.json | sort -u
  # Should show: "workspace": "/Users/operator/dev/workspace"
  ```

- [ ] **5.3** Update WORKSPACE.md absolute paths

  ```bash
  sed -i '' 's|/Users/operator/agent-workspace|/Users/operator/dev/workspace|g' ~/dev/workspace/WORKSPACE.md
  ```

- [ ] **5.4** Update SOUL.md references

  ```bash
  sed -i '' 's|~/agent-workspace|~/dev/workspace|g' ~/dev/workspace/SOUL.md
  ```

- [ ] **5.5** Update architecture workflow paths

  ```bash
  sed -i '' 's|~/agent-workspace|~/dev/workspace|g' ~/dev/openclaw/.windsurf/workflows/architecture.md
  ```

- [ ] **5.6** Update .system/architecture docs that reference agent-workspace
  ```bash
  grep -rl "agent-workspace" ~/dev/openclaw/.system/architecture/ | while read f; do
    sed -i '' 's|~/agent-workspace|~/dev/workspace|g' "$f"
    sed -i '' 's|/Users/operator/agent-workspace|/Users/operator/dev/workspace|g' "$f"
  done
  ```

---

## Phase 6: Move .windsurf to Dev Root

> Windsurf reads .windsurf/ from the workspace root. Moving it to ~/dev/ makes workflows
> available across all repos.

- [ ] **6.1** Move .windsurf to dev root

  ```bash
  mv ~/dev/openclaw/.windsurf ~/dev/.windsurf
  ```

- [ ] **6.2** Verify workflows are present

  ```bash
  ls ~/dev/.windsurf/workflows/
  ls ~/dev/.windsurf/rules/
  ls ~/dev/.windsurf/skills/
  ```

- [ ] **6.3** Update any workflow file paths that assumed they were inside openclaw/

  ```bash
  # Review workflows for relative path references like ".system/architecture/"
  # These will need to become "openclaw/.system/architecture/"
  grep -rn '\.system/' ~/dev/.windsurf/workflows/ | head -20
  ```

- [ ] **6.4** Update workflow references to prefix with `openclaw/`
  ```bash
  # Manual review required — each workflow may reference different relative paths
  # Key files: architecture.md, audit.md, check-work.md, implement.md
  ```

---

## Phase 7: Clean Up Agent Workspace

> Remove loose files that don't belong at the workspace root.

- [ ] **7.1** Move media dumps to their project directories

  ```bash
  mkdir -p ~/dev/workspace/projects/orianafig-booking-mvp/media
  mv ~/dev/workspace/orianafig/* ~/dev/workspace/projects/orianafig-booking-mvp/media/
  rmdir ~/dev/workspace/orianafig

  mkdir -p ~/dev/workspace/projects/s3bascutz-booking-mvp/media
  mv ~/dev/workspace/s3bascutz/* ~/dev/workspace/projects/s3bascutz-booking-mvp/media/
  rmdir ~/dev/workspace/s3bascutz
  ```

- [ ] **7.2** Delete stale script copies from workspace root

  ```bash
  rm ~/dev/workspace/blog_finalize.py
  rm ~/dev/workspace/blog_pipeline.py
  ```

- [ ] **7.3** Verify clean workspace root
  ```bash
  ls ~/dev/workspace/
  # Should only show: .git .gitignore .openclaw .styles .system
  #   AGENTS.md BOOTSTRAP.md HEARTBEAT.md IDENTITY.md MEMORY.md
  #   README.md SOUL.md TOOLS.md USER.md WORKSPACE.md
  #   data knowledge memory projects scripts skills venv
  #   .venv-ig .venv-ig-oriana .research
  ```

---

## Phase 8: Restart & Verify

> Bring the system back up and confirm everything works.

- [ ] **8.1** Restart gateway

  ```bash
  openclaw gateway start
  ```

- [ ] **8.2** Run doctor

  ```bash
  openclaw doctor
  ```

- [ ] **8.3** Verify skills load (no more "skipping outside root" warnings)

  ```bash
  openclaw skills list 2>&1 | grep -c "ready"
  openclaw skills list 2>&1 | grep "skipping"
  # Should show 0 skipping warnings
  ```

- [ ] **8.4** Run arch-verify

  ```bash
  cd ~/dev/openclaw && bash scripts/arch-verify.sh
  ```

- [ ] **8.5** Test agent via Telegram

  ```
  Send a test message to @maxious_bot
  Verify response comes back
  ```

- [ ] **8.6** Verify memory index

  ```bash
  openclaw memory status 2>&1 | grep -E "Dirty|Indexed"
  ```

- [ ] **8.7** Open Windsurf at new root
  ```bash
  # Open ~/dev/ as the Windsurf workspace
  # Verify: Explorer shows openclaw/, workspace/, intel-hub/
  # Verify: Source Control shows 3 git repos
  # Verify: Search spans all repos
  ```

---

## Phase 9: Post-Migration

- [ ] **9.1** Commit all changes across repos

  ```bash
  cd ~/dev/openclaw && git add -A && git commit -m "chore: migrate to ~/dev/ mono-root"
  cd ~/dev/workspace && git add -A && git commit -m "chore: migrate to ~/dev/ mono-root"
  ```

- [ ] **9.2** Update architecture CHANGELOG

  ```
  | 2026-03-XX | **Mono-Dev Root migration**: Consolidated development from 3 locations
  | to ~/dev/ mono-root. Moved openclaw fork, agent-workspace, and intel-hub as sibling
  | repos under single parent. Converted 26 absolute skill symlinks to relative.
  | Added config/ dir with symlinks for .env and openclaw.json. Moved .windsurf/ to
  | dev root for shared IDE workflows. Cleaned workspace root (media dumps, stale scripts).
  ```

- [ ] **9.3** Remove old directory remnants

  ```bash
  rmdir ~/Documents/CascadeProjects/   # if empty after move
  ```

- [ ] **9.4** Reindex memory
  ```bash
  openclaw memory index --force
  ```

---

## Symlink Map (Final State)

```
~/.openclaw/
├── .env               → ~/dev/config/.env                     (API keys)
├── openclaw.json      → ~/dev/config/openclaw.json            (agent config)
├── skills/            → ~/dev/workspace/skills/               (managed skills)
├── agents/            (unchanged — runtime state)
├── credentials/       (unchanged — auth tokens)
├── memory/            (unchanged — embedding indexes)
└── logs/              (unchanged — gateway logs)

~/dev/openclaw/skills/
├── celavii-outreach   → ../../workspace/skills/celavii-outreach     (relative)
├── seo-audit          → ../../workspace/skills/seo/seo-audit/       (relative)
├── brand-identity     → ../../workspace/skills/brand-identity       (relative)
└── ... (26 total relative symlinks)

~/dev/workspace/projects/
└── intel-hub          → ../../intel-hub                             (relative)
```

---

## Rollback Plan

If anything breaks:

```bash
# 1. Stop gateway
openclaw gateway stop

# 2. Reverse moves
mv ~/dev/openclaw ~/Documents/CascadeProjects/openclaw
mv ~/dev/workspace ~/agent-workspace
mv ~/dev/intel-hub ~/agent-workspace/projects/intel-hub

# 3. Restore config symlinks
rm ~/.openclaw/.env && mv ~/dev/config/.env ~/.openclaw/.env
rm ~/.openclaw/openclaw.json && mv ~/dev/config/openclaw.json ~/.openclaw/openclaw.json
rm ~/.openclaw/skills && ln -s /Users/operator/agent-workspace/skills ~/.openclaw/skills

# 4. Restore openclaw.json paths
sed -i '' 's|/Users/operator/dev/workspace|/Users/operator/agent-workspace|g' ~/.openclaw/openclaw.json

# 5. Restart
openclaw gateway start
```

---

## Risk Assessment

| Phase                | Risk                                  | Mitigation                          |
| -------------------- | ------------------------------------- | ----------------------------------- |
| 0. Backup            | None                                  | Git commits preserve state          |
| 1. Move repos        | Medium — gateway reads workspace path | Gateway stopped during move         |
| 2. Config symlinks   | Low — validated in source code        | Binary follows symlinks via `fs`    |
| 3. Skills symlink    | Low                                   | Same mechanism already in use       |
| 4. Relative symlinks | Low — scriptable                      | Verification loop checks all 26     |
| 5. Path updates      | Medium — 19+ occurrences              | `sed` + `grep` verification         |
| 6. Move .windsurf    | Low                                   | Workflow paths need prefix update   |
| 7. Clean up          | Low — only removes duplicates         | Verified duplicates exist elsewhere |
| 8. Verify            | None                                  | Full test suite                     |

**Estimated total time**: ~45 minutes (scripted moves + manual verification)
