# Org-Scale Multi-Agent Team Architecture

> Part of [System Architecture](README.md)

---

## Naming Protocol

**Principle**: Role-based IDs, numeric suffixes, zero personal identifiers. Agents are activated/deactivated — not created/deleted by name.

```
Pattern: {role}-{NNN}
```

| Role Prefix | Description                                          | Sandbox | Examples                   |
| ----------- | ---------------------------------------------------- | ------- | -------------------------- |
| `admin`     | System administrators (full access, unsandboxed)     | Off     | `admin-001`, `admin-002`   |
| `member`    | Team members (sandboxed, full coding)                | On      | `member-001`, `member-002` |
| `guest`     | External collaborators (sandboxed, restricted tools) | On      | `guest-001`, `guest-002`   |
| `service`   | Automated/bot agents (cron, monitoring, CI)          | On      | `service-001`              |

Three-digit padding supports up to 999 per role. `admin-001` = primary admin (you).

---

## Org Directory Structure

```
~/org/                                ← ORG ROOT
├── shared/                           ← Accessible by all agents
│   ├── projects/                     ← Collaborative work
│   │   ├── celavii/
│   │   └── max-kick/
│   ├── knowledge/                    ← Cross-project intel
│   │   ├── industry/
│   │   ├── intel/
│   │   ├── legal/
│   │   └── marketing/
│   └── templates/                    ← Shared templates
│
├── workspaces/                       ← Private workspaces (one per agent)
│   ├── admin-001/                    ← Primary admin workspace
│   │   ├── SOUL.md                   ← Agent identity & orchestration rules
│   │   ├── USER.md                   ← User context & preferences
│   │   ├── IDENTITY.md              ← Agent persona
│   │   ├── HEARTBEAT.md             ← Periodic task queue
│   │   ├── MEMORY.md                ← Curated long-term memory
│   │   ├── AGENTS.md                ← Multi-agent coordination rules
│   │   ├── TOOLS.md                 ← Model reference & local tool notes
│   │   ├── WORKSPACE.md             ← Canonical workspace map & file routing
│   │   ├── memory/                  ← Private daily notes (append-only)
│   │   ├── daily/                   ← Personal daily activities & standup notes
│   │   │   └── archive/             ← Older daily files
│   │   ├── todos/                   ← Task lists (active.md, completed.md)
│   │   ├── intel/daily/             ← Personal intelligence briefs
│   │   ├── private/                 ← Admin eyes only
│   │   ├── scripts/                 ← Personal scripts & automations
│   │   └── audio/                   ← Voice memos, TTS output
│   ├── member-001/                  ← Team member workspace
│   │   ├── SOUL.md, USER.md, IDENTITY.md, HEARTBEAT.md
│   │   ├── MEMORY.md, AGENTS.md, TOOLS.md, WORKSPACE.md
│   │   ├── memory/, daily/, todos/, intel/, private/, scripts/, audio/
│   │   └── (same personal dirs as admin)
│   └── guest-001/                   ← Guest workspace (minimal)
│       ├── SOUL.md, TOOLS.md, AGENTS.md, WORKSPACE.md
│       └── memory/, daily/, todos/
│
└── config/                          ← Org-level config (admin-only, never mounted)
    ├── roles.json                   ← Role definitions & permissions
    ├── roster.json                  ← Agent registry (active/inactive)
    ├── acl.json                     ← Folder ACL rules (for plugin)
    └── env/                         ← Per-agent env files (chmod 600)
        ├── shared.env               ← Base keys for all sandboxed agents
        ├── admin.env                ← Role: admin overrides
        ├── member.env               ← Role: member overrides
        ├── guest.env                ← Role: guest overrides
        └── {agent-id}.env           ← Agent-specific overrides
```

Skills live at `~/.openclaw/skills/` → symlink to `~/agent-workspace/skills/` (all agents inherit).

---

## Access Matrix

| Resource                    | admin               | member               | guest                | How Enforced      |
| --------------------------- | ------------------- | -------------------- | -------------------- | ----------------- |
| `~/org/workspaces/{own}/`   | ✅ rw               | ✅ rw (sandbox root) | ✅ rw (sandbox root) | Workspace config  |
| `~/org/workspaces/{other}/` | ✅ rw (unsandboxed) | ❌ invisible         | ❌ invisible         | Sandbox isolation |
| `~/org/shared/`             | ✅ rw (direct)      | ✅ rw (bind mount)   | 🔒 ro (bind mount)   | Docker binds      |
| `~/org/config/`             | ✅ rw (direct)      | ❌ invisible         | ❌ invisible         | Never mounted     |
| `~/.openclaw/openclaw.json` | ✅ rw               | ❌ invisible         | ❌ invisible         | Sandbox isolation |
| `~/.openclaw/skills/`       | ✅ auto-loaded      | ✅ auto-loaded       | ✅ auto-loaded       | OpenClaw native   |
| `~/.openclaw/.env`          | ✅ direct           | ❌ invisible         | ❌ invisible         | Sandbox isolation |

---

## Role Permissions

```json
{
  "admin": {
    "sandbox": false,
    "sharedAccess": "rw",
    "configAccess": "rw",
    "canSpawnAgents": ["*"],
    "tools": { "allow": ["*"] }
  },
  "member": {
    "sandbox": true,
    "sharedAccess": "rw",
    "configAccess": "none",
    "canSpawnAgents": ["marketing", "sales", "product", "dev-coder", "grunt"],
    "tools": { "deny": ["cron", "gateway"] }
  },
  "guest": {
    "sandbox": true,
    "sharedAccess": "ro",
    "configAccess": "none",
    "canSpawnAgents": [],
    "tools": {
      "allow": ["read", "exec", "sessions_list"],
      "deny": ["write", "edit", "apply_patch", "cron", "gateway"]
    }
  },
  "service": {
    "sandbox": true,
    "sharedAccess": "rw",
    "configAccess": "none",
    "canSpawnAgents": [],
    "tools": { "allow": ["read", "exec", "write"], "deny": ["browser", "cron", "gateway"] }
  }
}
```

---

## Agent Configuration in `openclaw.json`

```json
{
  "agents": {
    "list": [
      {
        "id": "admin-001",
        "default": true,
        "name": "Admin 001",
        "workspace": "~/org/workspaces/admin-001",
        "model": "google/gemini-3-flash-preview",
        "sandbox": { "mode": "off" }
      },
      {
        "id": "member-001",
        "name": "Member 001",
        "workspace": "~/org/workspaces/member-001",
        "model": "google/gemini-3-flash-preview",
        "sandbox": {
          "mode": "all",
          "scope": "agent",
          "workspaceAccess": "rw",
          "docker": {
            "binds": ["~/org/shared:/shared:rw"],
            "network": "bridge"
          }
        },
        "tools": { "deny": ["cron", "gateway"] },
        "subagents": { "allowAgents": ["marketing", "sales", "product", "dev-coder", "grunt"] }
      },
      {
        "id": "guest-001",
        "name": "Guest 001",
        "workspace": "~/org/workspaces/guest-001",
        "model": "google/gemini-3-flash-preview",
        "sandbox": {
          "mode": "all",
          "scope": "agent",
          "workspaceAccess": "rw",
          "docker": {
            "binds": ["~/org/shared:/shared:ro"]
          }
        },
        "tools": {
          "allow": ["read", "exec", "sessions_list"],
          "deny": ["write", "edit", "apply_patch", "cron", "gateway"]
        },
        "subagents": { "allowAgents": [] }
      }
    ]
  }
}
```

---

## Granular Project Access (Per-Agent Bind Mounts)

Docker `binds` control exactly which folders each agent sees. The agent literally cannot access paths not bind-mounted.

| Scenario                        | `docker.binds` Config                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **All shared (default member)** | `["~/org/shared:/shared:rw"]`                                                                                                  |
| **One project only**            | `["~/org/shared/projects/celavii:/shared/projects/celavii:rw"]`                                                                |
| **Multiple specific projects**  | `["~/org/shared/projects/celavii:/shared/projects/celavii:rw", "~/org/shared/projects/max-kick:/shared/projects/max-kick:ro"]` |
| **Knowledge only, no projects** | `["~/org/shared/knowledge:/shared/knowledge:ro"]`                                                                              |
| **No shared access**            | `[]` (empty array) or omit `binds` entirely                                                                                    |
| **Read-only everything**        | `["~/org/shared:/shared:ro"]`                                                                                                  |

**Example — member-001 sees only `celavii` (rw):**

```json
{
  "id": "member-001",
  "sandbox": {
    "docker": {
      "binds": [
        "~/org/shared/projects/celavii:/shared/projects/celavii:rw",
        "~/org/shared/knowledge:/shared/knowledge:ro"
      ]
    }
  }
}
```

**Example — guest-001 with zero shared access:**

```json
{
  "id": "guest-001",
  "sandbox": {
    "docker": {
      "binds": []
    }
  }
}
```

---

## Activation / Deactivation

| Action               | How                                                               | Effect                                              |
| -------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| **Deactivate agent** | Remove from `agents.list` or set `"enabled": false`               | Stops receiving messages; workspace + state persist |
| **Reactivate agent** | Re-add to `agents.list` or set `"enabled": true`                  | Resumes with full history intact                    |
| **Add new member**   | Add entry to `agents.list`, create `~/org/workspaces/member-NNN/` | New agent immediately available                     |
| **Revoke guest**     | Remove from `agents.list`                                         | No more access; sandbox destroyed on next prune     |

---

## OpenClaw State Directory (`~/.openclaw/`)

```
~/.openclaw/                              ← System state (protected)
├── openclaw.json                         ← Global config (gateway, models, channels, agents)
├── .env                                  ← API keys (chmod 600) ← ALL SECRETS HERE
├── credentials/                          ← OAuth tokens (web provider)
├── sessions/                             ← Session JSONL logs (legacy)
├── canvas/                               ← Canvas/artifact files
├── memory/
│   └── main.sqlite                       ← Vector index for memory search
├── tools/
│   └── sherpa-onnx-tts/                  ← Local TTS runtime + models
│       ├── runtime/                      ← sherpa-onnx binaries
│       └── models/                       ← Piper voice models (ONNX)
├── skills/                               ← SYMLINK → ~/agent-workspace/skills/ (34 managed skills, all agents inherit)
├── agents/                               ← Per-agent state (sessions, auth, QMD)
│   ├── admin-001/
│   │   ├── sessions/
│   │   ├── agent/
│   │   └── qmd/
│   ├── member-001/
│   │   ├── sessions/
│   │   └── agent/
│   └── guest-001/
│       ├── sessions/
│       └── agent/
└── cron/                                 ← Cron job store
    ├── jobs.json
    └── runs/
```

---

## Project Organization Rules

| Rule                        | Description                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **Project-first**           | All work files live under `~/org/shared/projects/{name}/`                                         |
| **Domain subfolders**       | Research organized by domain: `research/{domain}/`                                                |
| **Date-stamped files**      | `{topic}-{date}.md` to track evolution                                                            |
| **PROJECT.md manifest**     | Every project has a status file domain agents read first. Use `project-scaffold` skill to create. |
| **Cross-project knowledge** | Reusable insights in `~/org/shared/knowledge/`                                                    |
| **Self-documenting agents** | Domain agents MUST save research before reporting back                                            |
| **Private-by-default**      | Agent workspace files (SOUL.md, etc.) are never shared                                            |
| **Shared-by-intent**        | Only `~/org/shared/` is mounted into sandboxed agents                                             |

---

## Key Paths Reference

| Purpose              | Path                                      |
| -------------------- | ----------------------------------------- |
| **API Keys**         | `~/.openclaw/.env`                        |
| **Main Config**      | `~/.openclaw/openclaw.json`               |
| **Shared Skills**    | `~/.openclaw/skills/`                     |
| **Admin Workspace**  | `~/org/workspaces/admin-001/`             |
| **Admin Soul**       | `~/org/workspaces/admin-001/SOUL.md`      |
| **Admin Memory**     | `~/org/workspaces/admin-001/memory/`      |
| **Shared Projects**  | `~/org/shared/projects/`                  |
| **Shared Knowledge** | `~/org/shared/knowledge/`                 |
| **Org Config**       | `~/org/config/`                           |
| **Memory Index**     | `~/.openclaw/memory/main.sqlite`          |
| **Session Logs**     | `~/.openclaw/agents/{agent-id}/sessions/` |
| **Cron Store**       | `~/.openclaw/cron/jobs.json`              |
| **Local TTS**        | `~/.openclaw/tools/sherpa-onnx-tts/`      |
| **GitHub Auth**      | Stored in macOS Keychain (`gh`)           |
| **Netlify Auth**     | `~/.config/netlify/`                      |
| **Vercel Auth**      | `~/.local/share/com.vercel.cli/`          |
| **Shared Agent Env** | `~/org/config/env/shared.env`             |

---

## Migration Path (Current → Org Structure)

```
~/agent-workspace/SOUL.md          → ~/org/workspaces/admin-001/SOUL.md
~/agent-workspace/USER.md          → ~/org/workspaces/admin-001/USER.md
~/agent-workspace/IDENTITY.md      → ~/org/workspaces/admin-001/IDENTITY.md
~/agent-workspace/HEARTBEAT.md     → ~/org/workspaces/admin-001/HEARTBEAT.md
~/agent-workspace/MEMORY.md        → ~/org/workspaces/admin-001/MEMORY.md
~/agent-workspace/AGENTS.md        → ~/org/workspaces/admin-001/AGENTS.md
~/agent-workspace/TOOLS.md         → ~/org/workspaces/admin-001/TOOLS.md
~/agent-workspace/memory/          → ~/org/workspaces/admin-001/memory/
~/agent-workspace/scripts/         → ~/org/workspaces/admin-001/scripts/
~/agent-workspace/projects/        → ~/org/shared/projects/
~/agent-workspace/knowledge/       → ~/org/shared/knowledge/
~/agent-workspace/skills/          → ~/.openclaw/skills/    ✅ DONE (symlink created)

Post-migration symlinks (backward compatibility):
  ~/agent-workspace/projects  → ~/org/shared/projects
  ~/agent-workspace/knowledge → ~/org/shared/knowledge
  ~/.openclaw/skills          → ~/agent-workspace/skills  ✅ DONE (reverse symlink — admin workspace is canonical source)
```

---

## Workspace Wizard Skill (Admin-Only)

**Location**: `~/.openclaw/skills/workspace-wizard/`

**Purpose**: An interactive wizard skill for the admin agent that provisions new agent workspaces end-to-end.

### Wizard Flow

```
Admin: "Set up a new agent"
Agent (wizard):
  1. What role? → admin / member / guest / service
  2. Agent ID auto-assigned → member-002
  3. Which channel? → Telegram (need bot token) / WhatsApp / WebChat only
  4. Which shared projects should they access? → [list from ~/org/shared/projects/]
  5. Shared access level? → rw (member default) / ro (guest default)
  6. Which domain agents can they spawn? → [select from available agents]
  7. API keys — inherit shared? Own keys? → Phase 1 config or Phase 2 env file
  8. Resource limits? → CPU, memory, pids (defaults per role)
  9. Confirm & execute
```

### What the Wizard Executes

```bash
# 1. Create workspace directory
mkdir -p ~/org/workspaces/member-002/{memory,private}

# 2. Scaffold workspace files from templates
cp ~/org/shared/templates/SOUL.template.md ~/org/workspaces/member-002/SOUL.md
cp ~/org/shared/templates/TOOLS.template.md ~/org/workspaces/member-002/TOOLS.md
cp ~/org/shared/templates/AGENTS.template.md ~/org/workspaces/member-002/AGENTS.md
# ... etc (USER.md, IDENTITY.md, HEARTBEAT.md, MEMORY.md)

# 3. Apply role-based customizations (inject agent ID, role, permissions)
sed -i "s/{{AGENT_ID}}/member-002/g" ~/org/workspaces/member-002/SOUL.md
sed -i "s/{{ROLE}}/member/g" ~/org/workspaces/member-002/SOUL.md

# 4. Create env file (Phase 2) or inject docker.env (Phase 1)
touch ~/org/config/env/member-002.env
chmod 600 ~/org/config/env/member-002.env

# 5. Update openclaw.json — add agent to agents.list
# (agent uses gateway tool or direct config write)

# 6. Update roster.json
# (add entry with status: active)

# 7. Verify — run openclaw channels status
```

### Skill Definition (Draft)

```yaml
---
name: workspace-wizard
description: >
  Interactive wizard to provision new agent workspaces.
  Gathers role, channel, project access, API keys, and resource limits.
  Executes workspace creation, config updates, and verification.
trigger: /new-agent, /provision, /setup-agent
admin_only: true
tools_required:
  - exec
  - write
  - read
  - gateway
---
```

### Template Files

```
~/org/shared/templates/
├── SOUL.template.md          ← Role-based routing rules with {{AGENT_ID}}, {{ROLE}} placeholders
├── TOOLS.template.md         ← Model reference (shared across roles)
├── AGENTS.template.md        ← Multi-agent coordination (shared)
├── USER.template.md          ← Blank user preferences
├── IDENTITY.template.md      ← Default persona with {{AGENT_ID}} placeholder
├── HEARTBEAT.template.md     ← Default heartbeat tasks
└── MEMORY.template.md        ← Empty memory scaffold
```

### Deactivation Wizard

```
Admin: "Deactivate member-002"
Agent (wizard):
  1. Confirm agent ID → member-002
  2. Archive or preserve workspace? → archive (move to ~/org/workspaces/.archive/)
  3. Revoke API keys? → yes / keep for reactivation
  4. Remove from openclaw.json agents.list → set enabled: false
  5. Update roster.json → status: inactive
  6. Prune Docker sandbox → docker rm
  7. Confirm & execute
```

---

## Phase 2 Integration Roadmap

| Phase | Task                                              | Status     | Notes                                           |
| ----- | ------------------------------------------------- | ---------- | ----------------------------------------------- |
| 2a    | `sandbox.docker.envFile` support in OpenClaw core | 🔜 Planned | ~20 LOC in `resolveSandboxDockerConfig`         |
| 2b    | `~/org/config/env/` file hierarchy                | 🔜 Planned | shared.env → role.env → agent.env loading       |
| 2c    | **Workspace Wizard skill** (admin-only)           | ✅ Created | See `skills/workspace-wizard/`                  |
| 2d    | Folder-ACL plugin (`before_tool_call` hook)       | 🔜 Planned | Enforce path boundaries per agent               |
| 2e    | Execute full migration (agent-workspace → ~/org/) | 🔜 Planned | Create dirs, move files, symlink, update config |
