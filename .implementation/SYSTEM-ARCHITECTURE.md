# OpenClaw System Architecture

> **Admin Reference Document**  
> Last Updated: 2026-02-06  
> Gateway Version: 2026.2.3

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OPENCLAW GATEWAY                                  │
│                        ws://127.0.0.1:49152                                 │
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
│  │              DOMAIN SUB-AGENTS (8 Specialists)                    │      │
│  │                                                                   │      │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │      │
│  │  │  Marketing   │ │    Sales     │ │   Product    │  (Flash)     │      │
│  │  │  5 skills    │ │   6 skills   │ │  6 skills    │              │      │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │      │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │      │
│  │  │   Support    │ │   Search     │ │    Legal     │  (Sonnet)    │      │
│  │  │  5 skills    │ │  3 skills†   │ │  6 skills    │              │      │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │      │
│  │  ┌──────────────┐ ┌──────────────┐           † persistent        │      │
│  │  │   Finance    │ │    Data      │             memory             │      │
│  │  │  6 skills    │ │  7 skills    │  (Sonnet)                     │      │
│  │  └──────────────┘ └──────────────┘                               │      │
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
| **Coder**           | `anthropic/claude-sonnet-4-5`   | Sonnet | $3 in / $15 out   | Code implementation, debugging, deployments     |
| **Planner**         | `anthropic/claude-opus-4-6`     | Opus   | $5 in / $25 out   | Architecture, strategy, deep reasoning          |
| **Tool Executor**   | `anthropic/claude-haiku-4-5`    | Haiku  | $1 in / $5 out    | File ops, tool chains, organization             |
| **Alt. Reasoning**  | `google/gemini-3-pro-preview`   | Pro    | $2 in / $12 out   | Quality fallback                                |
| **OpenAI Fallback** | `openai/gpt-5-mini`             | Mini   | ~                 | OpenAI fallback                                 |

### Domain Sub-Agent Models

| Domain Agent          | Model  | Why                       | Skills                |
| --------------------- | ------ | ------------------------- | --------------------- |
| **Marketing**         | Flash  | Speed, volume, web search | 5 skills, 7 commands  |
| **Sales**             | Flash  | Research, outreach        | 6 skills, 3 commands  |
| **Product**           | Flash  | Specs, roadmaps           | 6 skills, 6 commands  |
| **Support**           | Flash  | Triage, responses         | 5 skills, 5 commands  |
| **Enterprise Search** | Flash  | Native Google grounding   | 3 skills, 2 commands  |
| **Legal**             | Sonnet | Precision, risk           | 6 skills, 1+ commands |
| **Finance**           | Sonnet | Accuracy, compliance      | 6 skills, 5 commands  |
| **Data**              | Sonnet | SQL, code generation      | 7 skills, varies      |

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

### Task Routing (1-Level Spawning)

> **Codebase constraint**: Sub-agents cannot spawn other sub-agents.
> See `src/agents/tools/sessions-spawn-tool.ts:122-127` — enforced via `isSubagentSessionKey()`.
> Only agents with main sessions (`agent:{id}:main`) can spawn.

```
Flash (coordinator) receives user message
        │
        ├── Marketing task? ──▶ Spawn Marketing Agent (Flash)
        │
        ├── Sales task? ──▶ Spawn Sales Agent (Flash)
        │
        ├── Legal task? ──▶ Spawn Legal Agent (Sonnet)
        │
        ├── Finance task? ──▶ Spawn Finance Agent (Sonnet)
        │
        ├── Data task? ──▶ Spawn Data Agent (Sonnet)
        │
        ├── Product task? ──▶ Spawn Product Agent (Flash)
        │
        ├── Support task? ──▶ Spawn Support Agent (Flash)
        │
        ├── Search task? ──▶ Spawn Enterprise Search Agent (Flash)
        │
        ├── Code implementation? ──▶ Spawn Sonnet (coder)
        │
        ├── Architecture/planning? ──▶ Spawn Opus (planner)
        │
        ├── File ops / grunt work? ──▶ Spawn Haiku
        │
        ├── Web search? ──▶ Handle directly (native grounding)
        │
        └── Simple conversation? ──▶ Handle directly
```

### Spawning Depth Limits

| Level | Agent               | Can Spawn?                                   | Session Key Pattern          |
| ----- | ------------------- | -------------------------------------------- | ---------------------------- |
| 0     | Flash (coordinator) | ✅ All domain agents + Sonnet + Opus + Haiku | `agent:main:main`            |
| 0     | Team coordinators   | ✅ Per `subagents.allowAgents` config        | `agent:{id}:main`            |
| 1     | Domain sub-agents   | ❌ Cannot spawn (sub-agent session)          | `agent:{id}:subagent:{uuid}` |
| 1     | Sonnet/Opus/Haiku   | ❌ Cannot spawn (sub-agent session)          | `agent:main:subagent:{uuid}` |

> **Multi-step workflows** (domain research → coding): Flash orchestrates sequentially.
> Flash spawns marketing agent, waits for results, then spawns Sonnet with findings.

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
| System prompt    | ✅ Yes | Static, reused every request |
| SOUL.md          | ✅ Yes | Rarely changes               |
| USER.md          | ✅ Yes | Rarely changes               |
| Tool definitions | ✅ Yes | Static                       |
| Daily notes      | ❌ No  | Changes frequently           |
| User messages    | ❌ No  | Unique per request           |
| Tool outputs     | ❌ No  | Dynamic                      |

---

## Sub-Agent Architecture

### Configuration

```json
{
  "subagents": {
    "maxConcurrent": 4,
    "archiveAfterMinutes": 60,
    "model": {
      "primary": "anthropic/claude-haiku-4-5",
      "fallbacks": ["google/gemini-3-flash-preview"]
    }
  }
}
```

### Domain Sub-Agent Definitions

Each domain agent is defined in `openclaw.json` `agents.list` and spawned via `sessions_spawn({ agentId: "{id}" })`.
The gateway resolves per-agent config: model, skills filter, workspace, identity.

| Agent             | ID          | Model      | Role Summary                                                       | Session Type   |
| ----------------- | ----------- | ---------- | ------------------------------------------------------------------ | -------------- |
| **Coordinator**   | `main`      | Flash      | User conversations, routing, web search, synthesis                 | Main session   |
| Marketing         | `marketing` | Flash      | SEO, content, campaigns, brand voice, analytics                    | Ephemeral      |
| Sales             | `sales`     | Flash      | Account research, outreach, pipeline, call summaries               | Ephemeral      |
| Product           | `product`   | Flash      | Specs, roadmaps, competitive analysis, user stories                | Ephemeral      |
| Support           | `support`   | Flash      | Ticket triage, KB management, escalation                           | Ephemeral      |
| Enterprise Search | `search`    | Flash      | Query decomposition, multi-source synthesis                        | **Persistent** |
| Legal             | `legal`     | Sonnet     | Contracts, compliance, risk assessment                             | Ephemeral      |
| Finance           | `finance`   | Sonnet     | Budgets, forecasting, reconciliation                               | Ephemeral      |
| Data              | `data`      | Sonnet     | SQL, visualization, ETL, data quality                              | Ephemeral      |
| **Coder**         | `coder`     | Sonnet 4.5 | Code implementation, debugging, deployments, CI/CD, GitHub Actions | Ephemeral      |
| **Planner**       | `planner`   | Opus 4.6   | Architecture review, validation, expert advisor (USE SPARINGLY)    | Ephemeral      |
| **Grunt**         | `grunt`     | Haiku      | File ops, tests, cleanup, bulk operations, scaffolding             | Ephemeral      |

### Sub-Agent Context Visibility

> **Codebase constraint**: Sub-agents only see 2 workspace files.
> See `src/agents/workspace.ts:293` — `SUBAGENT_BOOTSTRAP_ALLOWLIST`.
> Skills are NOT auto-loaded (`promptMode: "minimal"` skips skills section).

| Workspace File | Sub-Agent Sees?    | Implication                                |
| -------------- | ------------------ | ------------------------------------------ |
| **AGENTS.md**  | ✅ Yes             | Domain routing instructions                |
| **TOOLS.md**   | ✅ Yes             | Self-documenting rules go here             |
| SOUL.md        | ❌ No              | Coordinator-only                           |
| IDENTITY.md    | ❌ No              | Coordinator-only                           |
| USER.md        | ❌ No              | Coordinator-only                           |
| MEMORY.md      | ❌ No              | Coordinator-only                           |
| Skills         | ❌ Not auto-loaded | Sub-agents can `read` skill files manually |

### 3-Layer Context Injection

Since sub-agents have limited visibility, domain context is provided through 3 layers:

```
Layer 1: TOOLS.md (global — all sub-agents see)
  → Self-documenting rules: "ALWAYS save findings to projects/{project}/research/{domain}/"
  → Skill reading pattern: "Read skills/{domain}/{skill}/SKILL.md for guidance"

Layer 2: agents.list (per-agent config in openclaw.json)
  → Model: Flash or Sonnet per domain
  → Skills filter: only relevant skills listed
  → Identity: name + emoji
  → Workspace: ~/agent-workspace/ (shared)

Layer 3: Task field (per-spawn instructions from Flash)
  → "Read skills/marketing/seo-optimization/SKILL.md.
     Perform SEO audit for Max Kick.
     Save findings to projects/max-kick/research/marketing/seo-audit-2026-02-06.md.
     Read projects/max-kick/PROJECT.md first for context."
```

### Sub-Agent Lifecycle

```
1. IDENTIFY
   Flash identifies domain: "Draft SEO content" → marketing
                    │
                    ▼
2. SPAWN (via agentId routing)
   sessions_spawn({
     task: "Read skills/marketing/seo-optimization/SKILL.md for guidance.
            Perform SEO audit for Max Kick.
            Save findings to projects/max-kick/research/marketing/seo-audit-2026-02-06.md.
            Read projects/max-kick/PROJECT.md first for context.",
     agentId: "marketing",
     label: "marketing-seo"
   })
   // Gateway resolves: model=flash, skills=[marketing skills], workspace=~/agent-workspace/
                    │
                    ▼
3. EXECUTE (Independent Session — isolated context)
   ┌─────────────────────────────────────────────┐
   │  Marketing Agent (Flash)                     │
   │  Session: agent:marketing:subagent:{uuid}    │
   │  - Sees: AGENTS.md + TOOLS.md (auto-loaded)  │
   │  - Reads PROJECT.md (via task instructions)   │
   │  - Reads skills/ (via task instructions)      │
   │  - Performs SEO analysis                      │
   │  - Saves findings to research/marketing/      │
   │  - CANNOT spawn other sub-agents              │
   └─────────────────────────────────────────────┘
                    │
                    ▼
4. REPORT
   Domain agent returns results to Flash coordinator
                    │
                    ▼
5. DELIVER
   Flash relays results to user with minimal transformation
                    │
                    ▼
6. ARCHIVE (after 60 minutes)
   Session archived, resources freed
```

### Parallel Execution Example

```
User: "Do marketing AND legal work for Max Kick"

Flash (coordinator):
  ├── Spawn Marketing Agent (Flash) ──→ SEO audit
  └── Spawn Legal Agent (Sonnet) ──→ Contract review
       │                                  │
       │ (running in parallel)            │
       ▼                                  ▼
  Marketing returns results         Legal returns results
       │                                  │
       └──────────────┬───────────────────┘
                      ▼
              Flash synthesizes and delivers both
```

### When to Use Sub-Agents

| Task Type             | Use Sub-Agent? | Which Agent               |
| --------------------- | -------------- | ------------------------- |
| Marketing content/SEO | ✅ Yes         | Marketing (Flash)         |
| Account research      | ✅ Yes         | Sales (Flash)             |
| Contract review       | ✅ Yes         | Legal (Sonnet)            |
| Financial analysis    | ✅ Yes         | Finance (Sonnet)          |
| SQL / data work       | ✅ Yes         | Data (Sonnet)             |
| Product specs         | ✅ Yes         | Product (Flash)           |
| Ticket handling       | ✅ Yes         | Support (Flash)           |
| Cross-tool search     | ✅ Yes         | Enterprise Search (Flash) |
| Code implementation   | ✅ Yes         | Sonnet (coder)            |
| Architecture planning | ✅ Yes         | Opus (planner)            |
| File ops / grunt work | ✅ Yes         | Haiku                     |
| Web search            | ❌ No          | Flash handles directly    |
| Simple conversation   | ❌ No          | Flash handles directly    |

### Multi-Coordinator Architecture (Team Scaling)

Multiple coordinators can coexist — each is a full agent in `agents.list` with its own main session and full spawning rights. Sub-agent restrictions only apply to spawned sessions (session key contains `subagent:`).

```
┌─────────────────────────────────────────────────────────────────┐
│                        OPENCLAW GATEWAY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────┐        ┌────────────────────┐           │
│  │  Your Coordinator   │        │  Team Coordinator   │           │
│  │  agent:main:main    │        │  agent:team:main    │           │
│  │  Telegram: @you     │        │  Telegram: @maria   │           │
│  │  Workspace: ~/agent │        │  Workspace: ~/maria │           │
│  │  allowAgents: ["*"] │        │  allowAgents:       │           │
│  │                     │        │    ["marketing",    │           │
│  │  Can spawn ALL      │        │     "sales",        │           │
│  │  domain agents      │        │     "product"]      │           │
│  └────────────────────┘        └────────────────────┘           │
│           │                              │                        │
│           └──────────┬───────────────────┘                        │
│                      ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           SHARED DOMAIN AGENTS (agents.list)              │   │
│  │   marketing, sales, legal, finance, data, product,        │   │
│  │   support, search                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

| Feature                  | Per Coordinator                                   |
| ------------------------ | ------------------------------------------------- |
| **Own workspace**        | Different SOUL.md, TOOLS.md, projects/            |
| **Own model**            | Flash, Sonnet, or any per team member             |
| **Own channel**          | Different Telegram bot, phone, etc.               |
| **Own session history**  | Conversations don't mix                           |
| **Spawning rights**      | `subagents.allowAgents` controls which domains    |
| **Shared domain agents** | All coordinators can spawn the same domain agents |

**Configuration**: Pure config — add another entry to `agents.list`:

```json
{
  "id": "team-lead",
  "name": "Maria's Coordinator",
  "model": "google/gemini-3-flash-preview",
  "workspace": "~/maria-workspace",
  "subagents": {
    "allowAgents": ["marketing", "sales", "product"]
  },
  "identity": { "name": "Maria", "emoji": "🌟" }
}
```

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

## File System Layout

### OpenClaw State Directory (`~/.openclaw/`)

```
~/.openclaw/
├── openclaw.json              # Main configuration (gateway, models, channels)
├── .env                       # API keys (chmod 600) ← ALL SECRETS HERE
├── credentials/               # OAuth tokens (web provider)
├── sessions/                  # Session JSONL logs
├── canvas/                    # Canvas/artifact files
├── memory/
│   └── main.sqlite            # Vector index for memory search
├── tools/
│   └── sherpa-onnx-tts/       # Local TTS runtime + models
│       ├── runtime/           # sherpa-onnx binaries
│       └── models/            # Piper voice models (ONNX)
└── agents/
    └── main/
        ├── sessions/          # Per-agent session logs
        └── qmd/               # QMD search index (if enabled)
```

### Agent Workspace (`~/agent-workspace/`)

```
~/agent-workspace/
├── SOUL.md                    # Agent identity & orchestration rules
├── USER.md                    # User context & preferences
├── TOOLS.md                   # Model reference & local tool notes
├── HEARTBEAT.md               # Periodic task queue
├── IDENTITY.md                # Additional identity/persona
├── MEMORY.md                  # Curated long-term memory
├── memory/
│   └── YYYY-MM-DD.md          # Daily notes (append-only)
├── skills/                    # Domain skills (46 total across 8 domains)
│   ├── marketing/             # 5 skills: content-creation, seo-optimization, etc.
│   ├── sales/                 # 6 skills: account-research, outreach, pipeline, etc.
│   ├── product-management/    # 6 skills: feature-spec, roadmap-planning, etc.
│   ├── customer-support/      # 5 skills: ticket-triage, kb-management, etc.
│   ├── enterprise-search/     # 3 skills: search-strategy, knowledge-synthesis, etc.
│   ├── legal/                 # 6 skills: contract-review, compliance, etc.
│   ├── finance/               # 6 skills: budget-analysis, forecasting, etc.
│   ├── data/                  # 7 skills: sql-generation, visualization, etc.
│   ├── brand-identity/        # Celavii brand guidelines
│   ├── generating-proposal-documents/  # Proposal formatting
│   └── shadcn-ui.md           # UI component guidance
├── projects/                  # Project-organized work (per client/engagement)
│   ├── max-kick/
│   │   ├── PROJECT.md         # Project overview, status, contacts
│   │   ├── research/          # Domain-organized research
│   │   │   ├── marketing/     # SEO audits, competitor analysis
│   │   │   ├── legal/         # Contract reviews
│   │   │   ├── finance/       # Pricing models
│   │   │   └── sales/         # Account research
│   │   └── deliverables/      # Final outputs (apps, docs, etc.)
│   ├── celavii/
│   │   ├── PROJECT.md
│   │   ├── research/
│   │   └── deliverables/
│   └── [future-project]/      # Same structure for new projects
└── knowledge/                 # Cross-project knowledge base
    ├── marketing/             # Reusable marketing insights
    ├── legal/                 # Standard templates, policies
    └── industry/              # Market research, trends
```

### Project Organization Rules

| Rule                        | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| **Project-first**           | All work files live under `projects/{name}/`             |
| **Domain subfolders**       | Research organized by domain: `research/{domain}/`       |
| **Date-stamped files**      | `{topic}-{date}.md` to track evolution                   |
| **PROJECT.md manifest**     | Every project has a status file domain agents read first |
| **Cross-project knowledge** | Reusable insights in `knowledge/` (not project-specific) |
| **Self-documenting agents** | Domain agents MUST save research before reporting back   |

### Key Paths Reference

| Purpose           | Path                                 |
| ----------------- | ------------------------------------ |
| **API Keys**      | `~/.openclaw/.env`                   |
| **Main Config**   | `~/.openclaw/openclaw.json`          |
| **Agent Soul**    | `~/agent-workspace/SOUL.md`          |
| **Agent Memory**  | `~/agent-workspace/memory/`          |
| **Memory Index**  | `~/.openclaw/memory/main.sqlite`     |
| **Session Logs**  | `~/.openclaw/agents/main/sessions/`  |
| **Custom Skills** | `~/agent-workspace/skills/`          |
| **Local TTS**     | `~/.openclaw/tools/sherpa-onnx-tts/` |
| **GitHub Auth**   | Stored in macOS Keychain (`gh`)      |
| **Netlify Auth**  | `~/.config/netlify/`                 |

---

## API Keys & Authentication

### Environment Variables (`~/.openclaw/.env`)

```bash
# ═══════════════════════════════════════════════════════════
# LLM PROVIDERS
# ═══════════════════════════════════════════════════════════
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...

# ═══════════════════════════════════════════════════════════
# WEB TOOLS
# ═══════════════════════════════════════════════════════════
BRAVE_API_KEY=BSA...
FIRECRAWL_API_KEY=fc-...

# ═══════════════════════════════════════════════════════════
# VOICE & MEDIA
# ═══════════════════════════════════════════════════════════
ELEVENLABS_API_KEY=           # ← Add your key here for sag TTS
```

### Permissions

| File                        | Permission | Purpose               |
| --------------------------- | ---------- | --------------------- |
| `~/.openclaw/`              | 700        | Directory access      |
| `~/.openclaw/.env`          | 600        | API keys (owner only) |
| `~/.openclaw/openclaw.json` | 600        | Config with token     |

---

## Cost Estimation

### Monthly Projection (Active Use)

| Component                  | Requests/Day | Tokens/Request | Cost/Day  | Cost/Month |
| -------------------------- | ------------ | -------------- | --------- | ---------- |
| Coordinator (Flash)        | 100          | 5,000          | $0.18     | $5.25      |
| Domain agents — Flash (5)  | 30           | 5,000          | $0.05     | $1.58      |
| Domain agents — Sonnet (3) | 15           | 5,000          | $0.27     | $8.10      |
| Coder (Sonnet)             | 20           | 10,000         | $0.36     | $10.80     |
| Planner (Opus)             | 5            | 10,000         | $0.15     | $4.50      |
| Tool executor (Haiku)      | 50           | 2,000          | $0.01     | $0.30      |
| Heartbeat (Haiku)          | 48           | 500            | $0.006    | $0.18      |
| **Total**                  |              |                | **$1.02** | **$30.71** |

### Cost Comparison vs Previous Architecture

| Architecture                                    | Monthly Est.   | Savings |
| ----------------------------------------------- | -------------- | ------- |
| Previous (Sonnet main + Opus planner)           | ~$140/month    | —       |
| **Current (Flash coordinator + domain agents)** | **~$31/month** | **78%** |

### Per-Task Cost Estimates

| Task Type             | Agent             | Est. Tokens | Cost   |
| --------------------- | ----------------- | ----------- | ------ |
| Simple conversation   | Flash             | 2K          | $0.007 |
| Marketing SEO audit   | Marketing (Flash) | 10K         | $0.035 |
| Legal contract review | Legal (Sonnet)    | 15K         | $0.27  |
| Financial analysis    | Finance (Sonnet)  | 10K         | $0.18  |
| Code implementation   | Sonnet (coder)    | 20K         | $0.36  |
| Architecture plan     | Opus (planner)    | 15K         | $0.45  |

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

## Installed Skills & Capabilities

### Voice & Media

| Skill                  | Status           | Purpose                      | Provider     |
| ---------------------- | ---------------- | ---------------------------- | ------------ |
| 🎙️ **openai-whisper**  | ✅ Ready         | Speech-to-text transcription | Local CLI    |
| 🗣️ **sag**             | ⏳ Needs API key | ElevenLabs TTS (primary)     | ElevenLabs   |
| 🗣️ **sherpa-onnx-tts** | ✅ Ready         | Local TTS fallback (offline) | Local ONNX   |
| 🍌 **nano-banana-pro** | ✅ Ready         | Image generation/editing     | Gemini 3 Pro |

### Development & Deployment

| Skill               | Status   | Purpose                     | CLI       |
| ------------------- | -------- | --------------------------- | --------- |
| 🐙 **github**       | ✅ Ready | Git operations, PRs, issues | `gh`      |
| 🧩 **coding-agent** | ✅ Ready | Delegate coding to Pi agent | `pi`      |
| 📦 **netlify**      | ✅ Ready | Deploy web apps             | `netlify` |

### Search & Analysis

| Skill               | Status   | Purpose                   | CLI        |
| ------------------- | -------- | ------------------------- | ---------- |
| 📜 **session-logs** | ✅ Ready | Search past conversations | `jq`, `rg` |
| 🌐 **web-search**   | ✅ Ready | Web research              | Brave API  |

### Domain Skills (46 Skills across 8 Domains)

| Domain                 | Skills                                                                                                               | Commands                                                                                                  | Model  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| **Marketing**          | content-creation, seo-optimization, campaign-planning, brand-voice, analytics-reporting                              | /draft-content, /campaign-plan, /seo-audit, /brand-check, /social-calendar, /ab-test, /performance-report | Flash  |
| **Sales**              | account-research, outreach-generation, pipeline-analysis, call-preparation, competitive-intel, proposal-creation     | /research-account, /call-summary, /forecast                                                               | Flash  |
| **Product Management** | feature-spec, roadmap-planning, competitive-analysis, user-story-generation, metrics-dashboard, release-notes        | /write-spec, /prioritize, /release-notes, /user-research, /competitive-brief, /sprint-plan                | Flash  |
| **Customer Support**   | ticket-triage, kb-management, escalation-handling, response-generation, satisfaction-analysis                        | /triage, /draft-response, /update-kb, /escalate, /csat-report                                             | Flash  |
| **Enterprise Search**  | search-strategy, knowledge-synthesis, source-management                                                              | /search, /digest                                                                                          | Flash  |
| **Legal**              | contract-review, compliance-check, risk-assessment, policy-drafting, ip-analysis, regulatory-research                | /review-contract                                                                                          | Sonnet |
| **Finance**            | budget-analysis, forecasting, expense-review, revenue-modeling, audit-preparation, variance-analysis                 | /budget-review, /forecast, /expense-report, /revenue-model, /audit-prep                                   | Sonnet |
| **Data**               | sql-generation, data-visualization, etl-pipeline, data-quality, metric-definition, ab-test-analysis, cohort-analysis | varies                                                                                                    | Sonnet |

### Custom Skills (Non-Domain)

| Skill                             | Location                    | Purpose                  |
| --------------------------------- | --------------------------- | ------------------------ |
| **shadcn-ui**                     | `~/agent-workspace/skills/` | UI component guidance    |
| **brand-identity**                | `~/agent-workspace/skills/` | Celavii brand guidelines |
| **generating-proposal-documents** | `~/agent-workspace/skills/` | Proposal formatting      |

---

## Agent Capabilities Matrix

### Communication

| Channel      | Status            | Config                                |
| ------------ | ----------------- | ------------------------------------- |
| **Telegram** | ✅ Active         | Bot: `@maxious_bot`, Allowlist policy |
| **WebChat**  | ✅ Active         | `ws://127.0.0.1:49152`                |
| **WhatsApp** | ✅ Plugin enabled | Requires phone setup                  |
| **Signal**   | ✅ Plugin enabled | Requires setup                        |

### Code & Development

| Capability              | How                        |
| ----------------------- | -------------------------- |
| Write code              | Direct via `exec` tools    |
| Delegate complex coding | Spawn Pi coding agent      |
| Create GitHub repos     | `gh repo create --private` |
| Deploy websites         | `netlify deploy --prod`    |
| Review PRs              | `gh pr` commands           |

### Voice & Media

| Capability       | Primary          | Fallback            |
| ---------------- | ---------------- | ------------------- |
| Speech-to-text   | Whisper (local)  | —                   |
| Text-to-speech   | ElevenLabs (sag) | sherpa-onnx (local) |
| Image generation | Gemini 3 Pro     | —                   |

### Memory & Context

| Type            | Storage                | Search               |
| --------------- | ---------------------- | -------------------- |
| Long-term       | `MEMORY.md`            | Vector + BM25 hybrid |
| Daily notes     | `memory/YYYY-MM-DD.md` | Vector + BM25 hybrid |
| Session history | JSONL files            | Optional indexing    |

### Automation

| Feature          | Config                   |
| ---------------- | ------------------------ |
| Heartbeat        | Every 30 minutes (Haiku) |
| Cron jobs        | Via `cron` tool          |
| Background tasks | Via `sessions_spawn`     |

---

## Installed CLIs

| CLI            | Version | Purpose                |
| -------------- | ------- | ---------------------- |
| `gh`           | Latest  | GitHub operations      |
| `netlify`      | Latest  | Netlify deployments    |
| `whisper`      | Local   | Audio transcription    |
| `pi`           | 0.51.6  | Pi coding agent        |
| `jq`           | Latest  | JSON processing        |
| `rg` (ripgrep) | Latest  | Fast text search       |
| `sag`          | 0.2.2   | ElevenLabs TTS         |
| `uv`           | 0.9.30  | Python package manager |

---

## Use Cases & Scenarios

### Simple (Single Skill)

| Scenario                      | Skills Used     | Flow                                                                 |
| ----------------------------- | --------------- | -------------------------------------------------------------------- |
| **Voice memo transcription**  | whisper         | User sends audio → Whisper transcribes → Agent responds to content   |
| **Quick web research**        | web-search      | "What's the latest on X?" → Brave search → Summarized answer         |
| **Generate an image**         | nano-banana-pro | "Create a logo for..." → Gemini 3 Pro → Image returned               |
| **Check GitHub issues**       | github          | "What PRs need review?" → `gh pr list` → Status summary              |
| **Search past conversations** | session-logs    | "What did we discuss about Y?" → `jq`/`rg` search → Context recalled |

### Medium (Multi-Skill Workflows)

| Scenario                | Skills Used                | Flow                                                                    |
| ----------------------- | -------------------------- | ----------------------------------------------------------------------- |
| **Voice-to-task**       | whisper → coding-agent     | Voice memo → Transcribe → Parse task → Spawn Pi to implement            |
| **Research & document** | web-search → memory        | Research topic → Save findings to memory → Available in future sessions |
| **Build & deploy**      | coding-agent → netlify     | "Build a landing page" → Pi creates code → Netlify deploy → Live URL    |
| **PR review workflow**  | github → coding-agent      | "Review PR #42" → Clone → Pi reviews → Post comments via `gh`           |
| **Brand-compliant UI**  | shadcn-ui + brand-identity | "Create a dashboard" → Apply Celavii design tokens → shadcn components  |

### Complex (Orchestrated Multi-Step)

| Scenario                              | Skills Used                                                 | Flow                                                                                                                                                                                |
| ------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Voice-driven development**          | whisper → coding-agent → github → netlify                   | 1. Voice: "Build a todo app"<br>2. Transcribe with Whisper<br>3. Spawn Pi to code<br>4. Create private repo (`gh`)<br>5. Deploy to Netlify<br>6. Return live URL                    |
| **Automated proposal generation**     | web-search → brand-identity → generating-proposal-documents | 1. Research client/market<br>2. Apply brand guidelines<br>3. Generate formatted proposal<br>4. Export as PDF-ready React component                                                  |
| **Full-stack feature implementation** | github → coding-agent → session-logs                        | 1. Fetch issue details (`gh issue view`)<br>2. Search past discussions for context<br>3. Spawn Pi for implementation<br>4. Create PR with proper description<br>5. Request review   |
| **Voice assistant mode**              | whisper → (any skill) → sag/sherpa-onnx                     | 1. Receive voice input via Telegram<br>2. Transcribe with Whisper<br>3. Process request (any capability)<br>4. Respond with TTS (ElevenLabs or local)                               |
| **Parallel issue fixing**             | github → coding-agent (×N)                                  | 1. List open issues<br>2. Create git worktrees for each<br>3. Spawn multiple Pi agents in parallel<br>4. Each fixes assigned issue<br>5. Create PRs for all<br>6. Summarize results |

### Example Conversation Flows

#### Simple: Voice Memo → Task

```
User: [sends voice memo via Telegram]
Agent: [transcribes] "Got it - you want to add dark mode to the dashboard."
Agent: [implements directly or asks for confirmation]
```

#### Medium: Research → Build → Deploy

```
User: "Build a landing page for a SaaS product about AI writing"
Agent: [searches for SaaS landing page best practices]
Agent: [spawns Pi to build with shadcn-ui + brand guidelines]
Agent: [deploys to Netlify]
Agent: "Done! Live at https://xyz.netlify.app - here's what I built..."
```

#### Complex: Full Development Cycle

```
User: "Take GitHub issue #123 and fix it"
Agent: [fetches issue details via gh]
Agent: [searches session-logs for related discussions]
Agent: [creates worktree branch]
Agent: [spawns Pi with full context]
Pi: [implements fix, commits]
Agent: [creates PR via gh pr create]
Agent: "PR #456 created. Summary: [changes made]. Ready for review."
```

### Capability Combinations

| Input           | + Skill        | = Output              |
| --------------- | -------------- | --------------------- |
| Voice memo      | whisper        | Text task             |
| Text task       | coding-agent   | Code                  |
| Code            | github         | Repository            |
| Repository      | netlify        | Live site             |
| Research        | brand-identity | Branded content       |
| Branded content | proposals      | Client-ready document |
| Any output      | sag/sherpa     | Spoken response       |

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
nohup node dist/index.js gateway run --port 49152 &
```

### WebChat URL

```
http://127.0.0.1:49152/?token=<encoded_token>
```

---

## Security Notes

1. **API keys**: Stored in `~/.openclaw/.env` with 600 permissions
2. **Gateway token**: In `openclaw.json`, required for CLI/WebChat access
3. **Exec security**: Set to `full` (agent can run commands)
4. **Sandbox**: Disabled (full filesystem access)

### Risk Mitigation

- Set billing alerts on provider dashboards
- Monitor daily costs
- Use heartbeat to check for runaway processes
- Review agent workspace periodically

---

## Routing Instructions (Workspace Files)

Agent routing is controlled via workspace files that are injected into the system prompt:

### Key Files

| File          | Coordinator Sees? | Sub-Agent Sees?       | Purpose                                   |
| ------------- | ----------------- | --------------------- | ----------------------------------------- |
| `SOUL.md`     | ✅ Yes            | ❌ No                 | Orchestration rules, domain routing table |
| `TOOLS.md`    | ✅ Yes            | ✅ Yes                | Model reference, self-documenting rules   |
| `AGENTS.md`   | ✅ Yes            | ✅ Yes                | Multi-agent coordination                  |
| `USER.md`     | ✅ Yes            | ❌ No                 | User preferences                          |
| `IDENTITY.md` | ✅ Yes            | ❌ No                 | Agent persona                             |
| `MEMORY.md`   | ✅ Yes            | ❌ No                 | Long-term memory                          |
| Skills        | ✅ Auto-loaded    | ❌ Manual `read` only | Domain skill definitions                  |

> **Source**: `src/agents/workspace.ts:293` — `SUBAGENT_BOOTSTRAP_ALLOWLIST = new Set([AGENTS.md, TOOLS.md])`

### Routing Instructions Location

```
~/agent-workspace/
├── SOUL.md        ← Flash coordinator routing rules (coordinator-only)
├── TOOLS.md       ← Sub-agent documentation rules + model reference (shared)
├── AGENTS.md      ← Multi-agent coordination (shared)
├── skills/        ← Domain skill definitions (sub-agents read manually via task)
└── projects/      ← Project context (sub-agents read via task instructions)
```

### How Instructions Are Loaded

**Coordinator (Flash):**

1. Gateway starts session → loads ALL workspace files (SOUL.md, TOOLS.md, USER.md, etc.)
2. Skills auto-loaded into system prompt (full `promptMode`)
3. Flash reads routing instructions from SOUL.md
4. Flash identifies domain and spawns via `sessions_spawn({ agentId, task, label })`

**Sub-Agent (Domain Agent):**

1. Gateway creates sub-agent session → loads AGENTS.md + TOOLS.md only
2. Skills NOT auto-loaded (`promptMode: "minimal"`)
3. Sub-agent receives task field with explicit instructions to:
   - Read specific skills files
   - Read PROJECT.md for context
   - Save findings to research/{domain}/ folder
4. Sub-agent completes task and returns results to Flash

---

## Version History

| Date       | Change                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 2026-02-04 | Initial setup - multi-model, heartbeat, caching                                                       |
| 2026-02-04 | Architecture document created                                                                         |
| 2026-02-04 | Added routing instructions to SOUL.md and TOOLS.md                                                    |
| 2026-02-04 | **Architecture revision**: Sonnet as main agent, Opus for planning, Flash for search, Haiku for tools |
| 2026-02-05 | Configured Telegram channel with allowlist policy                                                     |
| 2026-02-05 | Installed voice skills: whisper, sag, sherpa-onnx-tts                                                 |
| 2026-02-05 | Installed dev tools: gh, netlify, pi, jq, ripgrep                                                     |
| 2026-02-05 | Added custom skills: shadcn-ui, brand-identity, proposals                                             |
| 2026-02-05 | Authenticated GitHub (`clawdwork`) and Netlify accounts                                               |
| 2026-02-05 | Added capabilities matrix and skill inventory                                                         |
| 2026-02-05 | Installed 46 Anthropic domain skills across 8 categories                                              |
| 2026-02-05 | Fixed tool call visibility in Telegram (pruning placeholder)                                          |
| 2026-02-06 | **Architecture revision v2**: Flash as coordinator, Sonnet as coder, Opus 4.6 as planner              |
| 2026-02-06 | Added 8 domain sub-agents: marketing, sales, legal, finance, data, product, support, search           |
| 2026-02-06 | Added project-first file organization with domain research folders                                    |
| 2026-02-06 | Enterprise Search agent configured with file-based persistent memory                                  |
| 2026-02-06 | Self-documenting domain agents: MUST save findings before reporting                                   |
| 2026-02-06 | **Codebase verification**: sub-agents cannot spawn (1-level only)                                     |
| 2026-02-06 | **Codebase verification**: sub-agents see only AGENTS.md + TOOLS.md                                   |
| 2026-02-06 | Added 3-layer context injection pattern (TOOLS.md + agents.list + task field)                         |
| 2026-02-06 | Added multi-coordinator architecture for team scaling                                                 |
| 2026-02-06 | Documented `agentId` routing via `sessions_spawn` for domain agents                                   |

---

**Document maintained by**: Admin  
**Gateway**: OpenClaw 2026.2.3  
**Location**: `.implementation/SYSTEM-ARCHITECTURE.md`
