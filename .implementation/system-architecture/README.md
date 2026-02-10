# OpenClaw System Architecture

> **Admin Reference Document**  
> Last Updated: 2026-02-07  
> Gateway Version: 2026.2.3

---

## Document Index

This architecture is split into focused modules. Each file is self-contained.

| Document                                 | Content                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| **[README.md](README.md)** (this file)   | Overview diagram, model hierarchy, prompt caching, heartbeat, quick reference              |
| **[agents.md](agents.md)**               | Sub-agent definitions, routing, spawning, lifecycle, parallel execution, context injection |
| **[skills.md](skills.md)**               | Skills inventory (20 managed + 60 bundled), domain table, Celavii API, loading             |
| **[VALUES.md](VALUES.md)**               | Single source of truth for runtime values (ports, counts, paths)                           |
| **[org-structure.md](org-structure.md)** | Org directory layout, workspace structure, access matrix, roles, migration path            |
| **[deployments.md](deployments.md)**     | GitHub account, repo conventions, Vercel deployments, deploy templates                     |
| **[security.md](security.md)**           | Token architecture, env siloing, credential isolation, sandbox, leakage prevention         |
| **[channels.md](channels.md)**           | Telegram, WhatsApp, WebChat, bindings, DM policy                                           |
| **[costs.md](costs.md)**                 | Monthly projections, per-task estimates, cost comparison                                   |
| **[CHANGELOG.md](CHANGELOG.md)**         | Version history                                                                            |

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OPENCLAW GATEWAY                                  │
│                        ws://127.0.0.1:19400                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │               COORDINATOR (Gemini 3.0 Flash)                        │   │
│  │                                                                      │   │
│  │  Model: google/gemini-3-flash-preview                               │   │
│  │  Role: Conversation, routing, web search, coordination              │   │
│  │  Context: 1M tokens, native Google grounding                        │   │
│  │                                                                      │   │
│  │  Capabilities:                                                       │   │
│  │  • Handles user conversations (thin router)                         │   │
│  │  • Routes tasks to domain sub-agents                                │   │
│  │  • Native web search (Google grounding)                             │   │
│  │  • Synthesizes sub-agent results                                    │   │
│  │  • Relays domain agent output with minimal transformation           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│      ┌───────────────────────┼───────────────────────┐                      │
│      │                       │                       │                      │
│      ▼                       ▼                       ▼                      │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │              DOMAIN SUB-AGENTS (9 Specialists)                    │      │
│  │                                                                   │      │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │      │
│  │  │  Marketing   │ │    Sales     │ │   Product    │  (Flash)     │      │
│  │  │  6 skills    │ │   6 skills   │ │  6 skills    │              │      │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │      │
│  │  ┌──────────────┐ ┌──────────────┐                               │      │
│  │  │   Support    │ │   Search     │                (Flash)        │      │
│  │  │  5 skills    │ │  3 skills†   │           † persistent        │      │
│  │  └──────────────┘ └──────────────┘             memory             │      │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │      │
│  │  │    Legal     │ │   Finance    │ │    Data      │  (Sonnet)    │      │
│  │  │  6 skills    │ │  6 skills    │ │  7 skills    │              │      │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │      │
│  │  ┌──────────────┐                                                │      │
│  │  │Media Content │                                   (Pro)        │      │
│  │  │  5 skills    │                                                │      │
│  │  └──────────────┘                                                │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│  Flash also spawns these directly (domain agents CANNOT spawn):             │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                 │
│  │  OPUS 4.6     │   │  SONNET 4.5   │   │    HAIKU      │                 │
│  │  (planner)    │   │   (coder)     │   │  (grunt work) │                 │
│  │               │   │               │   │               │                 │
│  │ Architecture  │   │ Code impl.    │   │ File ops      │                 │
│  │ Strategy      │   │ Debugging     │   │ Tool exec     │                 │
│  │ Deep reason.  │   │ Deployments   │   │ Organization  │                 │
│  └───────────────┘   └───────────────┘   └───────────────┘                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         HEARTBEAT SERVICE                            │   │
│  │                                                                      │   │
│  │  Model: anthropic/claude-haiku-4-5                                  │   │
│  │  Interval: Every 30 minutes                                         │   │
│  │  Task: Check HEARTBEAT.md for pending actions                       │   │
│  │  Cost: ~$0.50/month                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Model Hierarchy

| Role                | Model                           | Alias  | Cost/1M Tokens    | Use Case                                        |
| ------------------- | ------------------------------- | ------ | ----------------- | ----------------------------------------------- |
| **Coordinator**     | `google/gemini-3-flash-preview` | Flash  | $0.50 in / $3 out | Conversation, routing, web search, coordination |
| **Dev Coder**       | `google/gemini-3-flash-preview` | Flash  | $0.50 in / $3 out | Everyday coding, scripts, simple deploys, CI/CD |
| **Prod Coder**      | `anthropic/claude-sonnet-4-5`   | Sonnet | $3 in / $15 out   | Complex integrations, APIs, prod-critical code  |
| **Planner**         | `anthropic/claude-opus-4-6`     | Opus   | $5 in / $25 out   | Architecture, strategy, deep reasoning          |
| **Tool Executor**   | `anthropic/claude-haiku-4-5`    | Haiku  | $1 in / $5 out    | File ops, tool chains, organization             |
| **Alt. Reasoning**  | `google/gemini-3-pro-preview`   | Pro    | $2 in / $12 out   | Quality fallback                                |
| **OpenAI Fallback** | `openai/gpt-5-mini`             | Mini   | ~                 | OpenAI fallback                                 |

### Domain Sub-Agent Models

| Domain Agent          | Model  | Why                       | Skills                |
| --------------------- | ------ | ------------------------- | --------------------- |
| **Marketing**         | Flash  | Speed, volume, web search | 6 + 7 Celavii skills  |
| **Sales**             | Flash  | Research, outreach        | 6 skills, 3 commands  |
| **Product**           | Flash  | Specs, roadmaps           | 6 skills, 6 commands  |
| **Support**           | Flash  | Triage, responses         | 5 skills, 5 commands  |
| **Enterprise Search** | Flash  | Native Google grounding   | 3 skills, 2 commands  |
| **Legal**             | Sonnet | Precision, risk           | 6 skills, 1+ commands |
| **Finance**           | Sonnet | Accuracy, compliance      | 6 skills, 5 commands  |
| **Data**              | Sonnet | SQL, code generation      | 7 skills, varies      |
| **Media Content**     | Pro    | Prompt crafting, visuals  | 5 skills, 6 commands  |

### Model Selection Logic (Fallback Chain)

```
Main Session Request
        │
        ▼
┌─────────────────────┐
│  Try Flash (main)  │ ──── Success ────▶ Use Flash (COORDINATOR)
└─────────────────────┘
        │ Fail (rate limit, error)
        ▼
┌─────────────────────┐
│  Try Sonnet 4.5    │ ──── Success ────▶ Use Sonnet
└─────────────────────┘
        │ Fail
        ▼
┌─────────────────────┐
│  Try Gemini Pro    │ ──── Success ────▶ Use Pro
└─────────────────────┘
        │ Fail
        ▼
┌─────────────────────┐
│  Try GPT-5 Mini    │ ──── Success ────▶ Use GPT-5
└─────────────────────┘
```

---

## Prompt Caching Architecture

### How It Works

```
REQUEST 1 (Cache Write)
┌────────────────────────────────────────┐
│ System Prompt + SOUL.md + USER.md      │ ◀── 25% extra cost (write)
│ [10,000 tokens]                        │
├────────────────────────────────────────┤
│ User Message: "Build landing page"     │ ◀── Full price
└────────────────────────────────────────┘

REQUEST 2-N (Cache Hit, within 5 min)
┌────────────────────────────────────────┐
│ System Prompt + SOUL.md + USER.md      │ ◀── 90% DISCOUNT (cached)
│ [10,000 tokens] CACHED                 │
├────────────────────────────────────────┤
│ User Message: "Add dark theme"         │ ◀── Full price
└────────────────────────────────────────┘
```

### Cache Configuration

```json
{
  "models": {
    "anthropic/claude-opus-4-6": {
      "params": { "cacheRetention": "long" } // Extended TTL
    },
    "anthropic/claude-sonnet-4-5": {
      "params": { "cacheRetention": "long" } // Extended TTL
    },
    "anthropic/claude-haiku-4-5": {}, // No cache (already cheap)
    "google/gemini-3-flash-preview": {} // Coordinator (Google caching)
  }
}
```

### Cache Optimization Strategy

| Content Type     | Cache? | Reason                       |
| ---------------- | ------ | ---------------------------- |
| System prompt    | Yes    | Static, reused every request |
| SOUL.md          | Yes    | Rarely changes               |
| USER.md          | Yes    | Rarely changes               |
| Tool definitions | Yes    | Static                       |
| Daily notes      | No     | Changes frequently           |
| User messages    | No     | Unique per request           |
| Tool outputs     | No     | Dynamic                      |

---

## Heartbeat Service

### Configuration

```json
{
  "heartbeat": {
    "every": "30m",
    "model": "anthropic/claude-haiku-4-5",
    "target": "none",
    "prompt": "Check HEARTBEAT.md for tasks. If empty or no action needed, reply HEARTBEAT_OK."
  }
}
```

### Heartbeat Flow

```
Every 30 Minutes
        │
        ▼
┌───────────────────────────────────────┐
│  Haiku reads HEARTBEAT.md             │
└───────────────────────────────────────┘
        │
        ├──── File empty ──────▶ Reply "HEARTBEAT_OK"
        │
        └──── Tasks found ─────▶ Execute tasks
                                        │
                                        ▼
                                Report to target (if configured)
```

### HEARTBEAT.md Template

```markdown
# Heartbeat Tasks

## Pending

- [ ] Check server status
- [ ] Review overnight logs

## Completed

- [x] Daily backup verified (2026-02-04)
```

---

## Tools Available

| Category     | Tools                                         |
| ------------ | --------------------------------------------- |
| **Coding**   | exec, read, write, glob, grep, etc.           |
| **Web**      | web_search, web_fetch                         |
| **Browser**  | browser (automation)                          |
| **Memory**   | memory_search, memory_get                     |
| **Sessions** | sessions_spawn, sessions_send, session_status |
| **Gateway**  | gateway, agents_list, cron                    |

---

## Installed CLIs

| CLI            | Version | Purpose                      |
| -------------- | ------- | ---------------------------- |
| `gh`           | Latest  | GitHub operations            |
| `netlify`      | Latest  | Netlify deployments (legacy) |
| `whisper`      | Local   | Audio transcription          |
| `pi`           | 0.51.6  | Pi coding agent              |
| `jq`           | Latest  | JSON processing              |
| `rg` (ripgrep) | Latest  | Fast text search             |
| `sag`          | 0.2.2   | ElevenLabs TTS               |
| `uv`           | 0.9.30  | Python package manager       |
| `vercel`       | 50.13.2 | Vercel deployments           |

---

## Quick Reference

### Switch Models (WebChat)

```
/model              # List available
/model Opus         # Switch to Opus
/model Sonnet       # Switch to Sonnet
/model Haiku        # Switch to Haiku
```

### Restart Gateway

```bash
kill $(pgrep -f "openclaw.*gateway")
cd /path/to/openclaw
nohup node dist/index.js gateway run --port 19400 &
```

### WebChat URL

```
http://127.0.0.1:19400/?token=<encoded_token>
```

---

## Monitoring & Debugging

### Check Gateway Status

```bash
export OPENCLAW_GATEWAY_TOKEN="..."
node dist/index.js channels status --probe
node dist/index.js models list
node dist/index.js logs
```

### Check Session Status (in WebChat)

```
/status
/model status
session_status
```

### Log Files

- Gateway log: `/tmp/openclaw/openclaw-YYYY-MM-DD.log`
- Runtime log: `/tmp/openclaw-gateway.log`

---

## Security Notes

1. **API keys**: Stored in `~/.openclaw/.env` (chmod 600) — invisible to sandboxed agents (includes `CELAVII_API_KEY` for Creator Intelligence)
2. **Gateway token**: In `openclaw.json`, required for CLI/WebChat access
3. **Exec security**: `full` for admin (unsandboxed); sandboxed agents run tools inside Docker
4. **Sandbox**: Off for admin-001; On (`mode: all`) for member/guest/service agents
5. **Env isolation**: Sandboxed agents only see explicitly injected `docker.env` vars (see [security.md](security.md))
6. **Filesystem isolation**: Docker bind mounts control per-agent project access (see [org-structure.md](org-structure.md))
7. **Tool restrictions**: Per-agent `tools.allow` / `tools.deny` policies (see [org-structure.md](org-structure.md))

### Risk Mitigation

- Set billing alerts on provider dashboards
- Monitor daily costs via [costs.md](costs.md) projections
- Use heartbeat to check for runaway processes
- Review `~/org/config/roster.json` for active agents
- Audit `~/org/config/env/` for key exposure
- Sandboxed agents cannot access `~/.openclaw/`, `~/org/config/`, or other workspaces

---

**Document maintained by**: Admin  
**Gateway**: OpenClaw 2026.2.3  
**Location**: `.implementation/system-architecture/`
