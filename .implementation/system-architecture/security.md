# Security & Token Architecture

> Part of [System Architecture](README.md)

---

## API Keys & Authentication

### Environment Variables (`~/.openclaw/.env`)

```bash
# LLM PROVIDERS
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...

# WEB TOOLS
BRAVE_API_KEY=BSA...
FIRECRAWL_API_KEY=fc-...

# VOICE & MEDIA
ELEVENLABS_API_KEY=           # ← Add your key here for sag TTS

# CREATOR INTELLIGENCE (shared across all agents)
CELAVII_API_KEY=              # ← cvii_live_* key from Celavii dashboard
```

### Permissions

| File                        | Permission | Purpose               |
| --------------------------- | ---------- | --------------------- |
| `~/.openclaw/`              | 700        | Directory access      |
| `~/.openclaw/.env`          | 600        | API keys (owner only) |
| `~/.openclaw/openclaw.json` | 600        | Config with token     |
| `~/org/config/env/`         | 700        | Per-agent env files   |
| `~/org/config/env/*.env`    | 600        | Per-agent secrets     |

---

## Credential Isolation by Agent Type

| Credential                       | Location       | admin-001 (unsandboxed) | member (sandboxed)                         | guest (sandboxed) |
| -------------------------------- | -------------- | ----------------------- | ------------------------------------------ | ----------------- |
| `~/.config/gh/` (GitHub CLI)     | macOS Keychain | ✅ Full access          | ❌ Not mounted                             | ❌ Not mounted    |
| `~/.config/netlify/`             | Local config   | ✅ Full access          | ❌ Not mounted                             | ❌ Not mounted    |
| `~/.local/share/com.vercel.cli/` | Local data     | ✅ Full access          | ❌ Not mounted                             | ❌ Not mounted    |
| `~/.openclaw/.env`               | API keys       | ✅ Full access          | ❌ Not mounted                             | ❌ Not mounted    |
| `~/org/config/env/shared.env`    | Shared PAT     | ✅ Can read             | ❌ Not mounted (injected via `docker.env`) | ❌ Not mounted    |

Sandboxed agents **never see credential files**. They only receive explicitly injected env vars via `sandbox.docker.env`.

---

## Env Siloing (Per-Agent API Key Isolation)

**Current behavior**: Sandboxed agents are already env-isolated. The Docker container only receives `{ LANG: "C.UTF-8" }` by default — no API keys leak from `~/.openclaw/.env`. Unsandboxed agents (admin) inherit all `process.env` from the gateway.

| Agent Type                   | Env Source                                                       | Sees `~/.openclaw/.env`?    |
| ---------------------------- | ---------------------------------------------------------------- | --------------------------- |
| **Unsandboxed** (admin)      | `process.env` (gateway inherits all)                             | ✅ Full access              |
| **Sandboxed** (member/guest) | `sandbox.docker.env` only                                        | ❌ Explicitly injected only |
| **Skills**                   | Per-skill `skills.{name}.env` + `skills.{name}.apiKey` in config | Injected at runtime         |

**Env merge order** (in `resolveSandboxDockerConfig`):

```
agents.defaults.sandbox.docker.env  →  agents.list[].sandbox.docker.env (override)
```

### Phase 1: Config-Based Injection (Works Today)

Inject per-agent keys via `sandbox.docker.env` in `openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "docker": {
          "env": {
            "GEMINI_API_KEY": "shared-key-all-agents"
          }
        }
      }
    },
    "list": [
      {
        "id": "member-001",
        "sandbox": {
          "docker": {
            "env": {
              "GEMINI_API_KEY": "member-001-own-key",
              "ANTHROPIC_API_KEY": "member-001-anthropic"
            }
          }
        }
      }
    ]
  }
}
```

### Phase 2: File-Based Env Hierarchy (Future)

Separate secrets from config into `.env` files with inheritance:

```
~/org/config/env/
├── shared.env                ← Base keys for all sandboxed agents
├── admin.env                 ← Role: admin overrides
├── member.env                ← Role: member overrides
├── guest.env                 ← Role: guest overrides
├── member-001.env            ← Agent: specific overrides
└── member-002.env            ← Agent: specific overrides
```

**Loading order** (last wins):

```
1. ~/.openclaw/.env           → Gateway process (admin only, unsandboxed)
2. shared.env                 → Base keys for all sandboxed agents
3. {role}.env                 → Role-level overrides
4. {agent-id}.env             → Agent-specific overrides
```

**Implementation**: Requires adding `sandbox.docker.envFile` support to OpenClaw core (~20 lines in `resolveSandboxDockerConfig`). Until then, use Phase 1 config-based injection.

### Key Design Principles

| Principle           | Rule                                                            |
| ------------------- | --------------------------------------------------------------- |
| **Least privilege** | Agents only get the keys they need                              |
| **Inheritance**     | Shared keys propagate, agent-specific keys override             |
| **Separation**      | Secrets in `.env` files, not in `openclaw.json`                 |
| **Rotation**        | Change one `.env` file, restart gateway — done                  |
| **Audit**           | `~/org/config/env/` is admin-only, never mounted into sandboxes |

---

## Token Injection Model

```
~/org/config/env/shared.env          ← GH_TOKEN (shared PAT for all agents)
                                       Created once, reused for all future agents

Vercel REST API (per-agent)          ← VERCEL_TOKEN (unique per agent)
  POST /v3/user/tokens                  Auto-created by wizard during provisioning
  Authorization: Bearer $ADMIN_TOKEN    Scoped per project when possible
```

**Per-agent env injection** (in `openclaw.json`):

```json
{
  "id": "member-001",
  "sandbox": {
    "docker": {
      "env": {
        "GH_TOKEN": "github_pat_...",
        "GITHUB_TOKEN": "github_pat_...",
        "VERCEL_TOKEN": "vercel_token_member001"
      }
    }
  }
}
```

### Token Access Tiers

| Tier          | Role        | GitHub                   | Vercel                     | Netlify       | Can Deploy?    | Can Create Repos?             |
| ------------- | ----------- | ------------------------ | -------------------------- | ------------- | -------------- | ----------------------------- |
| **Full**      | admin-001   | Full CLI auth (Keychain) | Full CLI auth              | Full CLI auth | ✅ Anywhere    | ✅ Any repo                   |
| **Creator**   | member-NNN  | Shared PAT (injected)    | Per-agent token (injected) | None          | ✅ Vercel only | ✅ Naming convention enforced |
| **Viewer**    | guest-NNN   | None                     | None                       | None          | ❌ No          | ❌ No                         |
| **Automated** | service-NNN | Shared PAT (injected)    | Per-agent token (injected) | None          | ✅ Automated   | ✅ Cron/scheduled             |

---

## Leakage Prevention Matrix

| Risk                                       | Mitigation                                                                  | Status              |
| ------------------------------------------ | --------------------------------------------------------------------------- | ------------------- |
| Agent clones unauthorized repo             | PAT has `repo` scope but agent can only USE data from bind-mounted projects | ✅ Mitigated        |
| Agent deploys to wrong Vercel project      | Vercel project ID scoped per agent token (future: project-scoped tokens)    | ⚠️ Acceptable risk  |
| Agent reads other agents' work             | Sandbox bind mounts are per-agent — no cross-workspace access               | ✅ Mitigated        |
| Agent accesses admin credentials           | `~/.config/`, `~/.local/`, macOS Keychain never mounted                     | ✅ Mitigated        |
| Agent pushes sensitive data to public repo | All repos created as `--private` by default                                 | ✅ Mitigated        |
| Agent deletes repos                        | PAT has Administration rw but `tools.deny` can block `gh repo delete`       | ⚠️ Add to deny list |
| Guest accesses deploy tooling              | No `GH_TOKEN` or `VERCEL_TOKEN` injected for guests                         | ✅ Mitigated        |
| Repo accumulation over time                | Naming convention with dates; admin/cron agent runs monthly cleanup         | ✅ Planned          |

---

## Sandbox Network Security

By default, sandbox containers run with **`network: "none"` — no internet access**.

```
@agents.defaults.sandbox.docker.network = "none"
```

| Agent Config                | Internet | Can Deploy? | Can Download Skills?                       | Can `curl`? |
| --------------------------- | -------- | ----------- | ------------------------------------------ | ----------- |
| `network: "none"` (default) | ❌       | ❌          | ❌                                         | ❌          |
| `network: "bridge"`         | ✅       | ✅          | ⚠️ Can fetch but can't install (see below) | ✅          |

**Even with `network: "bridge"`**, agents **cannot install skills** because:

1. `~/.openclaw/skills/` is **never bind-mounted** into sandboxes
2. `readOnlyRoot: true` prevents system-level writes
3. `user: "1000:1000"` blocks `apt-get install`
4. Skills are loaded by the **gateway process** on the host, not by sandbox containers

**Network policy per role:**

Each member/user gets a **complete OpenClaw agent** in Docker (research + deploy + coding + sub-agents). They are NOT specialized — every member needs full capabilities.

| Role        | Network            | Why                                                                                                  |
| ----------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| **admin**   | Host (unsandboxed) | Full access, no container                                                                            |
| **member**  | `bridge`           | Deploy needs outbound internet for `exec` (git push, vercel). All other tools run on gateway (host). |
| **guest**   | `none` (default)   | Research works via gateway tools (`web_search`, `web_fetch`). No `exec` internet needed.             |
| **service** | `bridge`           | Automated deploys, cron jobs                                                                         |

> **Why `bridge` not `host`?** `host` shares the host's full network stack (can access localhost services, other containers, Docker API). `bridge` gives outbound internet only — isolated from host services. Same deploy capability, better security.

---

## Sandbox Images

Each member gets a complete agent sandbox — not a stripped-down research-only box. All members use the deploy image since they need full capabilities.

| Image                            | Based On                            | Tools Included                            | Use For                          |
| -------------------------------- | ----------------------------------- | ----------------------------------------- | -------------------------------- |
| `openclaw-sandbox:bookworm-slim` | Debian bookworm-slim                | Shell, basic unix tools                   | Guests (restricted)              |
| `openclaw-sandbox-deploy:latest` | Above + Node 22 + git + gh + vercel | Node.js, npm, git, gh CLI, Vercel CLI, jq | **All members + service agents** |

**Build the deploy image:**

```bash
~/org/config/docker/build-deploy-image.sh
```

**Dockerfile**: `~/org/config/docker/Dockerfile.deploy-agent`

**Recommended `openclaw.json` config:**

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "docker": {
          "image": "openclaw-sandbox-deploy:latest",
          "network": "none"
        }
      }
    },
    "list": [
      {
        "id": "member-001",
        "sandbox": {
          "docker": {
            "network": "bridge"
          }
        }
      },
      {
        "id": "guest-001",
        "sandbox": {
          "docker": {
            "image": "openclaw-sandbox:bookworm-slim"
          }
        }
      }
    ]
  }
}
```

- **Default**: `network: "none"` (safest baseline)
- **Members**: override to `bridge` per-agent (deploy needs `exec` outbound)
- **Guests**: inherit `none`, use slim image (no deploy CLIs needed)

---

## Agent Deactivation Protocols

| Tier        | Command                                                           | What It Does                                                   | Reversible? |
| ----------- | ----------------------------------------------------------------- | -------------------------------------------------------------- | ----------- |
| **Disable** | Edit `openclaw.json`: `"enabled": false`                          | Agent stops receiving messages                                 | ✅ Yes      |
| **Archive** | `deactivate-workspace.sh --id {id} --action archive`              | Workspace → `.archive/`, roster → inactive                     | ✅ Yes      |
| **Delete**  | `deactivate-workspace.sh --id {id} --action delete --revoke-keys` | Remove workspace, clear env, revoke Vercel token               | ❌ No       |
| **Purge**   | `deactivate-workspace.sh --id {id} --action purge`                | Delete + revoke tokens + delete repos + remove Vercel projects | ❌ No       |

**Purge checklist** (automated by `--action purge`):

1. ✅ Delete workspace directory
2. ✅ Revoke Vercel token via API
3. ✅ Clear agent env file
4. ✅ Delete all `{agent-id}-*` GitHub repos
5. ✅ Remove all `{agent-id}-*` Vercel projects
6. ✅ Set roster status to inactive
7. ⬜ Manual: remove from `openclaw.json` agents.list
8. ⬜ Manual: remove channel binding
9. ⬜ Manual: remove phone from WhatsApp allowFrom
10. ⬜ Manual: restart gateway

**Guest time-limiting**: Add `"expires": "YYYY-MM-DD"` to roster entries. A cron agent can check for expired guests and alert admin.
