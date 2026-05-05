# OpenClaw System Architecture

> **Admin Reference Document**  
> Last Updated: 2026-02-12  
> Gateway Version: 2026.2.12

---

## Document Index

This architecture is split into focused modules. Each file is self-contained.

| Document                                           | Content                                                                                                    |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **[README.md](README.md)** (this file)             | Overview diagram, model hierarchy, prompt caching, heartbeat, quick reference                              |
| **[agents.md](agents.md)**                         | Sub-agent definitions, routing, spawning, lifecycle, parallel execution, context injection                 |
| **[skills.md](skills.md)**                         | Skills inventory (39 managed + 65 bundled), domain table, Celavii API, loading                             |
| **[VALUES.md](VALUES.md)**                         | Single source of truth for runtime values (ports, counts, paths)                                           |
| **[org-structure.md](org-structure.md)**           | Org directory layout, workspace structure, access matrix, roles, migration path                            |
| **[deployments.md](deployments.md)**               | GitHub account, repo conventions, Vercel deployments, deploy templates                                     |
| **[security.md](security.md)**                     | Token architecture, env siloing, credential isolation, sandbox, leakage prevention                         |
| **[channels.md](channels.md)**                     | Telegram, WhatsApp, WebChat, bindings, DM policy                                                           |
| **[costs.md](costs.md)**                           | Monthly projections, per-task estimates, cost comparison                                                   |
| **[model-strategy.md](model-strategy.md)**         | Model reference, GPT-5.2 research, Option A/B comparison, thinking strategy                                |
| **[openrouter.md](openrouter.md)**                 | OpenRouter integration: aliases, provider routing, caching matrix, reasoning, observability                |
| **[MAINTENANCE.md](MAINTENANCE.md)**               | Documentation maintenance proposal and decisions                                                           |
| **[memory.md](memory.md)**                         | Memory system architecture, indexing, per-agent stores, audit checklist                                    |
| **[CHANGELOG.md](CHANGELOG.md)**                   | Version history                                                                                            |
| **[methodology/README.md](methodology/README.md)** | The Department Model — methodology, vocabulary, studio tour, how-to-build. **Start here for new joiners.** |

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OPENCLAW GATEWAY                                  │
│                        ws://127.0.0.1:9173                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │             COORDINATOR (DeepSeek V4 Pro via OpenRouter)            │   │
│  │                                                                      │   │
│  │  Model: deepseek/deepseek-v4-pro (thinking: high)                    │   │
│  │  Role: Conversation, routing, web search, coordination              │   │
│  │  Context: 1M tokens, native tool calling + structured output        │   │
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
│  │              DOMAIN SUB-AGENTS (15 Specialists)                   │      │
│  │                                                                   │      │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │      │
│  │  │  Marketing   │ │    Sales     │ │   Product    │  (Flash)     │      │
│  │  │  6 skills    │ │  9 skills    │ │  6 skills    │              │      │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │      │
│  │  ┌──────────────┐ ┌──────────────┐                               │      │
│  │  │   Support    │ │   Search     │                (Flash)        │      │
│  │  │  5 skills    │ │  3 skills†   │           † persistent        │      │
│  │  └──────────────┘ └──────────────┘             memory             │      │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │      │
│  │  │     SEO      │ │    Legal     │ │   Finance    │ (DSV4Pro/Pro)│      │
│  │  │  18 skills   │ │  6 skills    │ │  6 skills    │              │      │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │      │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │      │
│  │  │    Data      │ │Media Content │ │   Blogger    │  (Pro)       │      │
│  │  │  7 skills    │ │  5 skills    │ │  SEO-coupled │              │      │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │      │
│  │  ┌──────────────┐ ┌──────────────┐                               │      │
│  │  │ Social       │ │Social Writer │   (DSV4Pro / Pro)             │      │
│  │  │ Research 🔬  │ │ 🎬 6 skills  │                               │      │
│  │  │ 13 skills    │ └──────────────┘                               │      │
│  │  └──────────────┘                                                 │      │
│  │  ┌──────────────┐ ┌──────────────┐                               │      │
│  │  │  Workspace   │ │Quality Critic│                (Pro / DSV4Pro)│      │
│  │  │   Auditor 🏗️ │ │  1 skill 🔍  │                               │      │
│  │  └──────────────┘ └──────────────┘                               │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│  Coordinator also spawns these directly (domain agents CANNOT spawn):       │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   │
│  │ DeepSeek V4Pro│   │ DeepSeek V4Pro│   │  5.4-NANO     │   │
│  │  (planner)    │   │ (prod-coder)  │   │  (grunt work) │   │
│  │ thinking:high │   │ thinking:high │   │  thinking:off │   │
│  │ 1.6T MoE      │   │ 1.6T MoE      │   │               │   │
│  │ Architecture  │   │ Code impl.    │   │ File ops      │   │
│  └───────────────┘   └───────────────┘   └───────────────┘   │
│  Anthropic: 0 primary agents (fallback only)                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         HEARTBEAT SERVICE                            │   │
│  │                                                                      │   │
│  │  Model: google/gemini-2.5-flash                                     │   │
│  │  Interval: Every 30 minutes                                         │   │
│  │  Task: Check HEARTBEAT.md for pending actions                       │   │
│  │  Cost: ~$0.50/month                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Model Hierarchy

| Role               | Model                                 | Alias             | Cost/1M Tokens                                        | Use Case                                                                                                                                |
| ------------------ | ------------------------------------- | ----------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Coordinator**    | `deepseek/deepseek-v4-pro`            | DeepSeek-V4-Pro   | $0.435 in / $0.870 out (cache-read 0.08x, write free) | Conversation, routing, web search, coordination (thinking=high, 1.6T MoE / 49B active, 1M ctx; replaced Gemini 3 Flash 2026-05-04 — V7) |
| **Sales**          | `openai/gpt-5.4-mini`                 | 5.4-Mini          | TBD                                                   | Research synthesis, qualification, pipeline orchestration                                                                               |
| **Dev Coder**      | `deepseek/deepseek-v4-flash`          | DeepSeek-V4-Flash | $0.140 in / $0.280 out (cache-read 0.20x, write free) | Everyday coding, scripts, simple deploys, CI/CD (thinking=high, 1M ctx; replaced Gemini 3 Flash 2026-05-04 — V7)                        |
| **Prod Coder**     | `openrouter/deepseek/deepseek-v4-pro` | DeepSeek-V4-Pro   | $0.435 in / $0.870 out (cache-read 0.08x, write free) | Complex integrations, APIs, prod-critical code (thinking=high, 1.6T MoE / 49B active, 1M ctx)                                           |
| **Planner**        | `openrouter/deepseek/deepseek-v4-pro` | DeepSeek-V4-Pro   | $0.435 in / $0.870 out (cache-read 0.08x, write free) | Architecture, strategy, SOTA reasoning (thinking=high, 1.6T MoE, 1M ctx)                                                                |
| **Precision**      | `google/gemini-3.1-pro-preview`       | Pro               | $2 in / $12 out                                       | Legal, finance, data, media content, social-writer (1M ctx)                                                                             |
| **Quality Critic** | `openrouter/deepseek/deepseek-v4-pro` | DeepSeek-V4-Pro   | $0.435 in / $0.870 out (cache-read 0.08x, write free) | Review creative outputs (thinking=high, native reasoning + tools + structured output)                                                   |
| **Grunt**          | `openai/gpt-5.4-nano`                 | 5.4-Nano          | TBD                                                   | File ops, bulk operations, cheapest model                                                                                               |
| **Fallback Chain** | Pro → 5.4-Mini → 5.4-Nano → 5.1       | —                 | varies                                                | Multi-provider resilience                                                                                                               |

### Domain Sub-Agent Models

| Domain Agent          | Model                    | Why                                                                                                                      | Skills                                       |
| --------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| **Marketing**         | Flash                    | Speed, volume, web search                                                                                                | 6 + 10 Celavii skills                        |
| **Sales**             | 5.4-Mini                 | Research, synthesis, outreach, lead gen, pipeline                                                                        | 9 skills, 10 commands, 6 scripts, 1 template |
| **Product**           | Flash                    | Specs, roadmaps                                                                                                          | 6 skills, 6 commands                         |
| **Support**           | Flash                    | Triage, responses                                                                                                        | 5 skills, 5 commands                         |
| **Enterprise Search** | Flash                    | Native Google grounding                                                                                                  | 3 skills, 2 commands                         |
| **SEO**               | DeepSeek V4 Pro (medium) | Reasoning + 1M context for technical/strategic SEO; ~50% cheaper than Pro (replaced Pro 2026-05-04 — V7)                 | 18 skills                                    |
| **Legal**             | Pro                      | Precision, risk                                                                                                          | 6 skills, 1+ commands                        |
| **Finance**           | Pro                      | Accuracy, compliance                                                                                                     | 6 skills, 5 commands                         |
| **Data**              | Pro                      | SQL, code generation                                                                                                     | 7 skills, varies                             |
| **Media Content**     | Pro                      | Prompt crafting, visuals                                                                                                 | 5 skills, 6 commands                         |
| **Blogger**           | Pro (high)               | Creative voice + research synthesis; reasoning-trained models (Kimi/DeepSeek) underperform on long-form creative writing | 1 skill (SEO handoff)                        |
| **Social Research**   | DeepSeek V4 Pro (medium) | Reasoning + 1M context for discover/brief/plan/drift/cannibalization/factcheck/sxo/persona/trend (analytical)            | 13 social-\* skills                          |
| **Social Writer**     | Pro (high)               | Creative voice for hook/script/shotlist/repurpose/copy production. Cross-model boundary vs Social Research per Article 7 | 6 skills (orchestrator + 5 production)       |
| **Quality Critic**    | DeepSeek V4 Pro (high)   | SOTA review (1.6T MoE, structured output, ~17× cheaper output than GPT-5.4)                                              | 1 skill (agnostic)                           |
| **Workspace Auditor** | Pro                      | Semantic drift detection                                                                                                 | 1 skill (MWF audit)                          |

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
│  Try Gemini Pro    │ ──── Success ────▶ Use Pro
└─────────────────────┘
        │ Fail
        ▼
┌─────────────────────┐
│  Try GPT-5.4 Mini  │ ──── Success ────▶ Use GPT-5.4 Mini
└─────────────────────┘
        │ Fail
        ▼
┌─────────────────────┐
│  Try GPT-5.4 Nano  │ ──── Success ────▶ Use GPT-5.4 Nano
└─────────────────────┘
        │ Fail
        ▼
┌─────────────────────┐
│  Try GPT-5.1       │ ──── Success ────▶ Use GPT-5.1
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
    "openrouter/deepseek/deepseek-v4-pro": {}, // Coordinator (high) + SEO (medium) + Social Research (medium) + Quality Critic (high) + Prod Coder (high) + Planner (high) — DeepSeek caching 0.08x cache-read, write free
    "openrouter/deepseek/deepseek-v4-flash": {}, // Dev coder (high) — DeepSeek caching 0.20x cache-read, write free
    "google/gemini-3-flash-preview": {}, // Marketing, product, support, search (Google caching)
    "google/gemini-3.1-pro-preview": {}, // Blogger, Social Writer, Legal, Finance, Data, Media Content, Workspace Auditor (Google caching)
    "google/gemini-3.1-pro-preview": {}, // Precision domains: Legal, Finance, Data, Media Content, Workspace Auditor (Google caching)
    "openai/gpt-5-mini": {} // Fallback
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
    "model": "google/gemini-2.5-flash",
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
│  Heartbeat (Gemini 2.5 Flash) reads HEARTBEAT.md │
└───────────────────────────────────────┘
        │
        ├──── File empty ──────▶ Reply "HEARTBEAT_OK"
        │
        └──── Tasks found ─────▶ Execute tasks
                                        │
                                        ▼
                                Report to target (if configured)
```

### Heartbeat Control Commands

| Command          | Action                                        |
| ---------------- | --------------------------------------------- |
| `/shutdown`      | Pause heartbeat notifications until `/resume` |
| `/heartbeat on`  | Enable heartbeat                              |
| `/heartbeat off` | Disable heartbeat                             |
| `/heartbeat`     | Show current heartbeat status                 |
| `/resume`        | Re-enable heartbeat after `/shutdown`         |

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

### Cron Job Auto-Disable (`maxRuns`)

Task-scoped cron jobs can set `maxRuns` to auto-disable after N successful executions.
When the threshold is reached, the system disables the job and sends a notification:
_"✅ Cron job X completed after N run(s) and has been auto-disabled."_

```json
{
  "name": "Poll Scrape Jobs",
  "maxRuns": 10,
  "schedule": { "kind": "every", "everyMs": 1800000 },
  "payload": { "kind": "agentTurn", "message": "Check job status..." }
}
```

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
/model 5.2          # Switch to GPT-5.2
/model Flash        # Switch to Flash
/model Pro          # Switch to Pro
```

### Restart Gateway

```bash
kill $(pgrep -f "openclaw.*gateway")
cd /path/to/openclaw
nohup node dist/index.js gateway run --port 9173 &
```

### WebChat URL

```
http://127.0.0.1:9173/?token=<encoded_token>
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
**Gateway**: OpenClaw 2026.2.12  
**Location**: `.system/architecture/`
