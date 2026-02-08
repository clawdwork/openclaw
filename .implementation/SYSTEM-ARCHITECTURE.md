# OpenClaw System Architecture (Legacy — Moved)

> **This document has been refactored into focused modules.**  
> See: [`.implementation/system-architecture/README.md`](system-architecture/README.md)

## New Location

```
.implementation/system-architecture/
├── README.md          ← Overview, model hierarchy, quick reference (START HERE)
├── agents.md          ← Sub-agent definitions, routing, spawning, lifecycle
├── skills.md          ← Full skills inventory (50 skills), loading mechanics
├── org-structure.md   ← Org directory layout, workspaces, access matrix, roles
├── deployments.md     ← GitHub, repo conventions, Vercel deployments, templates
├── security.md        ← Token architecture, env siloing, sandbox, leakage prevention
├── channels.md        ← Telegram, WhatsApp, WebChat, bindings
├── costs.md           ← Monthly projections, per-task estimates
└── CHANGELOG.md       ← Version history
```

> **Use `/architecture` workflow** in Windsurf to review or update the architecture.

---

> The content below is preserved as a frozen snapshot. All future edits should go to the split files above.

---

## Overview (FROZEN — see system-architecture/README.md)

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
│  │  │  6 skills    │ │   6 skills   │ │  6 skills    │              │      │
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
| **Dev Coder**       | `google/gemini-3-flash-preview` | Flash  | $0.50 in / $3 out | Everyday coding, scripts, simple deploys, CI/CD |
| **Prod Coder**      | `anthropic/claude-sonnet-4-5`   | Sonnet | $3 in / $15 out   | Complex integrations, APIs, prod-critical code  |
| **Planner**         | `anthropic/claude-opus-4-6`     | Opus   | $5 in / $25 out   | Architecture, strategy, deep reasoning          |
| **Tool Executor**   | `anthropic/claude-haiku-4-5`    | Haiku  | $1 in / $5 out    | File ops, tool chains, organization             |
| **Alt. Reasoning**  | `google/gemini-3-pro-preview`   | Pro    | $2 in / $12 out   | Quality fallback                                |
| **OpenAI Fallback** | `openai/gpt-5-mini`             | Mini   | ~                 | OpenAI fallback                                 |

### Domain Sub-Agent Models

| Domain Agent          | Model  | Why                       | Skills                |
| --------------------- | ------ | ------------------------- | --------------------- |
| **Marketing**         | Flash  | Speed, volume, web search | 6 skills, 7 commands  |
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
        ├── Everyday coding? ──▶ Spawn Dev Coder (Flash)
        │
        ├── Complex/prod code? ──▶ Spawn Prod Coder (Sonnet)
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

| Agent             | ID           | Model      | Role Summary                                                    | Session Type   |
| ----------------- | ------------ | ---------- | --------------------------------------------------------------- | -------------- |
| **Coordinator**   | `main`       | Flash      | User conversations, routing, web search, synthesis              | Main session   |
| Marketing         | `marketing`  | Flash      | SEO, content, campaigns, brand voice, analytics                 | Ephemeral      |
| Sales             | `sales`      | Flash      | Account research, outreach, pipeline, call summaries            | Ephemeral      |
| Product           | `product`    | Flash      | Specs, roadmaps, competitive analysis, user stories             | Ephemeral      |
| Support           | `support`    | Flash      | Ticket triage, KB management, escalation                        | Ephemeral      |
| Enterprise Search | `search`     | Flash      | Query decomposition, multi-source synthesis                     | **Persistent** |
| Legal             | `legal`      | Sonnet     | Contracts, compliance, risk assessment                          | Ephemeral      |
| Finance           | `finance`    | Sonnet     | Budgets, forecasting, reconciliation                            | Ephemeral      |
| Data              | `data`       | Sonnet     | SQL, visualization, ETL, data quality                           | Ephemeral      |
| **Dev Coder**     | `dev-coder`  | Flash      | Everyday coding, automations, scripts, simple deploys, CI/CD    | Ephemeral      |
| **Prod Coder**    | `prod-coder` | Sonnet 4.5 | Complex integrations, APIs, backends, prod-critical refactors   | Ephemeral      |
| **Planner**       | `planner`    | Opus 4.6   | Architecture review, validation, expert advisor (USE SPARINGLY) | Ephemeral      |
| **Grunt**         | `grunt`      | Haiku      | File ops, tests, cleanup, bulk operations, scaffolding          | Ephemeral      |

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
  → Workspace: ~/org/workspaces/{agent-id}/

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
   // Gateway resolves: model=flash, skills=[marketing skills], workspace=~/org/workspaces/admin-001/
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
│  │  admin-001          │        │  member-001         │           │
│  │  agent:admin-001:main│       │  agent:member-001:main│         │
│  │  Telegram: @admin_bot│       │  Telegram: @team1_bot│          │
│  │  Workspace: ~/org/  │        │  Workspace: ~/org/  │           │
│  │   workspaces/       │        │   workspaces/       │           │
│  │   admin-001         │        │   member-001        │           │
│  │  allowAgents: ["*"] │        │  allowAgents:       │           │
│  │  Can spawn ALL      │        │    ["marketing",    │           │
│  │  domain agents      │        │     "sales",        │           │
│  │  (unsandboxed)      │        │     "dev-coder"]    │           │
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
  "id": "member-001",
  "name": "Member 001",
  "model": "google/gemini-3-flash-preview",
  "workspace": "~/org/workspaces/member-001",
  "sandbox": {
    "mode": "all",
    "scope": "agent",
    "docker": { "binds": ["~/org/shared:/shared:rw"] }
  },
  "subagents": {
    "allowAgents": ["marketing", "sales", "dev-coder"]
  }
}
```

---

## Org-Scale Multi-Agent Team Architecture

### Naming Protocol

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

### Org Directory Structure

```
~/org/                                ← ORG ROOT
├── shared/                           ← Accessible by all agents
│   ├── projects/                     ← Collaborative work
│   │   ├── celavii/
│   │   ├── max-kick/
│   │   ├── kick/
│   │   ├── maxkick-brand-identity/
│   │   ├── seo-proposals/
│   │   └── ORGANIZATION_SUMMARY.md
│   ├── knowledge/                    ← Cross-project intel
│   │   ├── industry/
│   │   ├── intel/
│   │   ├── legal/
│   │   └── marketing/
│   └── templates/                    ← Shared templates
│
├── workspaces/                       ← Private workspaces (one per agent)
│   ├── admin-001/                    ← Admin private workspace
│   │   ├── SOUL.md, USER.md, IDENTITY.md, HEARTBEAT.md
│   │   ├── MEMORY.md, AGENTS.md, TOOLS.md
│   │   ├── memory/                   ← Private daily notes
│   │   ├── private/                  ← Admin eyes only
│   │   └── scripts/
│   ├── member-001/                   ← Team member workspace
│   │   ├── SOUL.md, USER.md, IDENTITY.md, HEARTBEAT.md
│   │   ├── MEMORY.md, AGENTS.md, TOOLS.md
│   │   ├── memory/
│   │   └── private/
│   └── guest-001/                    ← Guest workspace (minimal)
│       ├── SOUL.md, TOOLS.md, AGENTS.md
│       └── memory/
│
└── config/                           ← Org-level config (admin-only)
    ├── roles.json                    ← Role definitions & permissions
    ├── roster.json                   ← Agent registry (active/inactive)
    └── acl.json                      ← Folder ACL rules (for plugin)
```

Skills live at `~/.openclaw/skills/` (OpenClaw's native shared skills path — all agents inherit).

### Access Matrix

| Resource                    | admin               | member               | guest                | How Enforced      |
| --------------------------- | ------------------- | -------------------- | -------------------- | ----------------- |
| `~/org/workspaces/{own}/`   | ✅ rw               | ✅ rw (sandbox root) | ✅ rw (sandbox root) | Workspace config  |
| `~/org/workspaces/{other}/` | ✅ rw (unsandboxed) | ❌ invisible         | ❌ invisible         | Sandbox isolation |
| `~/org/shared/`             | ✅ rw (direct)      | ✅ rw (bind mount)   | 🔒 ro (bind mount)   | Docker binds      |
| `~/org/config/`             | ✅ rw (direct)      | ❌ invisible         | ❌ invisible         | Never mounted     |
| `~/.openclaw/openclaw.json` | ✅ rw               | ❌ invisible         | ❌ invisible         | Sandbox isolation |
| `~/.openclaw/skills/`       | ✅ auto-loaded      | ✅ auto-loaded       | ✅ auto-loaded       | OpenClaw native   |
| `~/.openclaw/.env`          | ✅ direct           | ❌ invisible         | ❌ invisible         | Sandbox isolation |

### Role Permissions

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

### Agent Configuration in `openclaw.json`

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

### Granular Project Access (Per-Agent Bind Mounts)

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

### Activation / Deactivation

| Action               | How                                                               | Effect                                              |
| -------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| **Deactivate agent** | Remove from `agents.list` or set `"enabled": false`               | Stops receiving messages; workspace + state persist |
| **Reactivate agent** | Re-add to `agents.list` or set `"enabled": true`                  | Resumes with full history intact                    |
| **Add new member**   | Add entry to `agents.list`, create `~/org/workspaces/member-NNN/` | New agent immediately available                     |
| **Revoke guest**     | Remove from `agents.list`                                         | No more access; sandbox destroyed on next prune     |

### Channel Routing per Agent

```
admin-001  ← Telegram: @maxious_bot (existing) + WhatsApp DM from owner
member-001 ← Telegram: @team1_bot (separate bot) + WhatsApp DM from team member
guest-001  ← WhatsApp DM-split by sender E.164
```

#### Per-Sender Session Isolation (WhatsApp)

Each WhatsApp DM creates a **separate, private session** keyed by sender phone number:

```
Your messages:     agent:admin-001:whatsapp:dm:+1555555555    ← YOUR private session
Team member:       agent:member-001:whatsapp:dm:+1THEIR_NUMBER ← THEIR private session
```

- No cross-talk — senders never see each other's replies
- Bot replies **in the same DM thread** it received the message from
- All on **one WhatsApp number** — bindings determine which agent handles which sender

#### Bindings Configuration

Bindings route incoming messages to specific agents based on channel + sender:`

```json
{
  "bindings": [
    {
      "agentId": "admin-001",
      "match": { "channel": "telegram" }
    },
    {
      "agentId": "admin-001",
      "match": { "channel": "whatsapp", "peer": { "kind": "dm", "id": "+18589221759" } }
    },
    {
      "agentId": "member-001",
      "match": { "channel": "telegram", "accountId": "team1" }
    },
    {
      "agentId": "member-001",
      "match": { "channel": "whatsapp", "peer": { "kind": "dm", "id": "+1TEAMEMBER" } }
    },
    {
      "agentId": "guest-001",
      "match": { "channel": "whatsapp", "peer": { "kind": "dm", "id": "+1GUESTNUMBER" } }
    }
  ]
}
```

#### Binding Patterns Reference

| Pattern                                                              | Matches                                  | Use Case           |
| -------------------------------------------------------------------- | ---------------------------------------- | ------------------ |
| `{ "channel": "telegram" }`                                          | All Telegram messages (default bot)      | Admin catch-all    |
| `{ "channel": "telegram", "accountId": "team1" }`                    | Specific Telegram bot                    | Per-agent bot      |
| `{ "channel": "whatsapp", "peer": { "kind": "dm", "id": "+1..." } }` | Specific WhatsApp sender                 | Per-person routing |
| `{ "channel": "whatsapp" }`                                          | All WhatsApp messages (no binding match) | Default agent      |
| `{ "channel": "webchat" }`                                           | WebChat connections                      | Default agent      |

#### WhatsApp DM Policy + Bindings Flow

```
Incoming WhatsApp DM from +1SENDER
        │
        ├── Is sender in allowFrom or paired? ──── No ──→ Pairing gate (send code)
        │                                          Yes
        ▼
        ├── Does a binding match sender? ──── Yes ──→ Route to matched agent
        │                                     No
        ▼
        └── Route to default agent
```

#### Current WhatsApp Status

| Setting                | Value                                                   |
| ---------------------- | ------------------------------------------------------- |
| **Dedicated number**   | ✅ Linked and running                                   |
| **DM policy**          | `pairing` (unknown senders get a code)                  |
| **Paired senders**     | `+18589221759` (admin)                                  |
| **LaunchAgent**        | ✅ Installed (`ai.openclaw.gateway`) — survives reboots |
| **Gateway management** | `openclaw gateway restart/stop/start/status`            |

#### Next Steps to Configure Bindings

1. Add `bindings` array to `~/.openclaw/openclaw.json`
2. Add `allowFrom` for known team member phone numbers
3. Restart gateway: `openclaw gateway restart`
4. Verify: `openclaw channels status`

### Migration Path (Current → Org Structure)

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

### Frontend / WebChat Channel

OpenClaw includes a built-in **WebChat** channel (`ws://127.0.0.1:49152`). Each agent can be accessed via WebChat by selecting the agent. For a custom webapp or iOS app, hit the gateway HTTP API directly — the gateway IS the backend. No additional server required.

| Channel    | Protocol           | Per-Agent?                      | Notes                             |
| ---------- | ------------------ | ------------------------------- | --------------------------------- |
| Telegram   | Bot API            | ✅ Separate bot per agent       | Cleanest isolation                |
| WhatsApp   | Web/API            | ✅ DM-split or separate numbers | One number, N agents via bindings |
| WebChat    | WebSocket          | ✅ Agent selector in UI         | Built-in, no extra setup          |
| Custom App | HTTP → Gateway API | ✅ Route by agent ID            | Build your own frontend           |

### Phase 2 Integration Roadmap

> **Priority**: HIGH — may be needed sooner than later.

| Phase | Task                                              | Status     | Notes                                           |
| ----- | ------------------------------------------------- | ---------- | ----------------------------------------------- |
| 2a    | `sandbox.docker.envFile` support in OpenClaw core | 🔜 Planned | ~20 LOC in `resolveSandboxDockerConfig`         |
| 2b    | `~/org/config/env/` file hierarchy                | 🔜 Planned | shared.env → role.env → agent.env loading       |
| 2c    | **Workspace Wizard skill** (admin-only)           | 🔜 Planned | See spec below                                  |
| 2d    | Folder-ACL plugin (`before_tool_call` hook)       | 🔜 Planned | Enforce path boundaries per agent               |
| 2e    | Execute full migration (agent-workspace → ~/org/) | 🔜 Planned | Create dirs, move files, symlink, update config |

### Workspace Wizard Skill (Admin-Only)

**Location**: `~/.openclaw/skills/workspace-wizard/` (or `~/org/workspaces/admin-001/skills/workspace-wizard/`)

**Purpose**: An interactive wizard skill for the admin agent that provisions new agent workspaces end-to-end. The admin talks to their agent via Telegram/WebChat, the wizard gathers requirements, and then executes the setup.

#### Wizard Flow

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

#### What the Wizard Executes

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

#### Skill Definition (Draft)

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

#### Template Files Needed

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

#### Deactivation Wizard

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

### OpenClaw State Directory (`~/.openclaw/`) — Protected, Admin-Only

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
├── skills/                               ← SYMLINK → ~/agent-workspace/skills/ (50 skills, all agents inherit)
│   ├── marketing/                        ← 6 skills: brand-voice, campaign-planning, competitive-analysis, content-creation, intel-ingest, performance-analytics
│   ├── sales/                            ← 6 skills: account-research, call-prep, competitive-intelligence, create-an-asset, daily-briefing, draft-outreach
│   ├── product-management/               ← 6 skills: competitive-analysis, feature-spec, metrics-tracking, roadmap-management, stakeholder-comms, user-research-synthesis
│   ├── customer-support/                 ← 5 skills: customer-research, escalation, knowledge-management, response-drafting, ticket-triage
│   ├── enterprise-search/                ← 3 skills: knowledge-synthesis, search-strategy, source-management
│   ├── legal/                            ← 6 skills: canned-responses, compliance, contract-review, legal-risk-assessment, meeting-briefing, nda-triage
│   ├── finance/                          ← 6 skills: audit-support, close-management, financial-statements, journal-entry-prep, reconciliation, variance-analysis
│   ├── data/                             ← 7 skills: data-context-extractor, data-exploration, data-validation, data-visualization, interactive-dashboard-builder, sql-queries, statistical-analysis
│   ├── brand-identity/                   ← Celavii brand guidelines
│   ├── generating-proposal-documents/    ← Proposal formatting
│   ├── deploy-and-publish/               ← Deployment pipeline skill
│   ├── ui/shadcn-ui/                     ← UI component reference (React/Tailwind/shadcn)
│   └── workspace-wizard/                 ← Agent provisioning wizard (admin-only)
├── agents/                               ← Per-agent state (sessions, auth, QMD)
│   ├── admin-001/                        ← Primary admin agent state
│   │   ├── sessions/                     ← Session logs
│   │   ├── agent/                        ← Auth profiles
│   │   └── qmd/                          ← QMD search index (if enabled)
│   ├── member-001/                       ← First team member state
│   │   ├── sessions/
│   │   └── agent/
│   └── guest-001/                        ← First guest state
│       ├── sessions/
│       └── agent/
└── cron/                                 ← Cron job store
    ├── jobs.json                         ← Job definitions
    └── runs/                             ← Execution logs per job
```

### Org Root (`~/org/`) — Org-Wide Workspace Structure

```
~/org/                                    ← ORG ROOT
├── shared/                               ← Accessible by all agents (bind-mounted into sandboxes)
│   ├── projects/                         ← Collaborative work (per client/engagement)
│   │   ├── max-kick/
│   │   │   ├── PROJECT.md                ← Project overview, status, contacts
│   │   │   ├── research/                 ← Domain-organized research
│   │   │   │   ├── marketing/            ← SEO audits, competitor analysis
│   │   │   │   ├── legal/                ← Contract reviews
│   │   │   │   ├── finance/              ← Pricing models
│   │   │   │   └── sales/                ← Account research
│   │   │   └── deliverables/             ← Final outputs (apps, docs, etc.)
│   │   ├── celavii/
│   │   │   ├── PROJECT.md
│   │   │   ├── research/
│   │   │   └── deliverables/
│   │   ├── kick/
│   │   ├── maxkick-brand-identity/
│   │   ├── seo-proposals/
│   │   ├── ORGANIZATION_SUMMARY.md
│   │   └── [future-project]/             ← Same structure for new projects
│   ├── knowledge/                        ← Cross-project knowledge base
│   │   ├── industry/                     ← Market research, trends
│   │   ├── intel/                        ← Daily intelligence briefs
│   │   ├── legal/                        ← Standard templates, policies
│   │   └── marketing/                    ← Reusable marketing insights
│   └── templates/                        ← Shared document templates
│
├── workspaces/                           ← Private workspaces (one per agent)
│   ├── admin-001/                        ← Primary admin workspace
│   │   ├── SOUL.md                       ← Agent identity & orchestration rules
│   │   ├── USER.md                       ← User context & preferences
│   │   ├── IDENTITY.md                   ← Agent persona
│   │   ├── HEARTBEAT.md                  ← Periodic task queue
│   │   ├── MEMORY.md                     ← Curated long-term memory
│   │   ├── AGENTS.md                     ← Multi-agent coordination rules
│   │   ├── TOOLS.md                      ← Model reference & local tool notes
│   │   ├── WORKSPACE.md                  ← Canonical workspace map & file routing
│   │   ├── memory/                       ← Private daily notes (append-only)
│   │   ├── daily/                        ← Personal daily activities & standup notes
│   │   │   └── archive/                  ← Older daily files
│   │   ├── todos/                        ← Task lists (active.md, completed.md)
│   │   ├── intel/daily/                  ← Personal intelligence briefs
│   │   ├── private/                      ← Admin eyes only
│   │   ├── scripts/                      ← Personal scripts & automations
│   │   └── audio/                        ← Voice memos, TTS output
│   ├── member-001/                       ← Team member workspace
│   │   ├── SOUL.md, USER.md, IDENTITY.md, HEARTBEAT.md
│   │   ├── MEMORY.md, AGENTS.md, TOOLS.md, WORKSPACE.md
│   │   ├── memory/, daily/, todos/, intel/, private/, scripts/, audio/
│   │   └── (same personal dirs as admin)
│   └── guest-001/                        ← Guest workspace (minimal)
│       ├── SOUL.md, TOOLS.md, AGENTS.md, WORKSPACE.md
│       └── memory/, daily/, todos/
│
└── config/                               ← Org-level config (admin-only, never mounted)
    ├── roles.json                        ← Role definitions & permissions
    ├── roster.json                       ← Agent registry (active/inactive)
    ├── acl.json                          ← Folder ACL rules (for plugin)
    └── env/                              ← Per-agent env files (chmod 600)
        ├── shared.env                    ← Base keys for all sandboxed agents
        ├── admin.env                     ← Role: admin overrides
        ├── member.env                    ← Role: member overrides
        ├── guest.env                     ← Role: guest overrides
        └── {agent-id}.env                ← Agent-specific overrides
```

### Project Organization Rules

| Rule                        | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| **Project-first**           | All work files live under `~/org/shared/projects/{name}/` |
| **Domain subfolders**       | Research organized by domain: `research/{domain}/`        |
| **Date-stamped files**      | `{topic}-{date}.md` to track evolution                    |
| **PROJECT.md manifest**     | Every project has a status file domain agents read first  |
| **Cross-project knowledge** | Reusable insights in `~/org/shared/knowledge/`            |
| **Self-documenting agents** | Domain agents MUST save research before reporting back    |
| **Private-by-default**      | Agent workspace files (SOUL.md, etc.) are never shared    |
| **Shared-by-intent**        | Only `~/org/shared/` is mounted into sandboxed agents     |

### Key Paths Reference

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
| `~/org/config/env/`         | 700        | Per-agent env files   |
| `~/org/config/env/*.env`    | 600        | Per-agent secrets     |

### Env Siloing (Per-Agent API Key Isolation)

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

#### Phase 1: Config-Based Injection (Works Today)

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

#### Phase 2: File-Based Env Hierarchy (Future)

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

#### Key Design Principles

| Principle           | Rule                                                            |
| ------------------- | --------------------------------------------------------------- |
| **Least privilege** | Agents only get the keys they need                              |
| **Inheritance**     | Shared keys propagate, agent-specific keys override             |
| **Separation**      | Secrets in `.env` files, not in `openclaw.json`                 |
| **Rotation**        | Change one `.env` file, restart gateway — done                  |
| **Audit**           | `~/org/config/env/` is admin-only, never mounted into sandboxes |

---

## Git & Deployment Integration

### GitHub Account

| Setting            | Value                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Account**        | `clawdwork` (personal, not org)                                                                                                                                             |
| **Type**           | Personal — allows Vercel Hobby plan git connections                                                                                                                         |
| **Existing repos** | `intel-hub`, `client-celavii-seo-proposal`, `client-maxkick-seo-proposal`, `client-kick-sheetz-presentation`, `client-maxkick-war-room`, `openclaw-workspace` (all private) |
| **PAT**            | `org-agent-deploy` (fine-grained, Contents+Admin rw, expires 2026-12-31)                                                                                                    |

### Repository Naming Convention

```
{agent-id}-{project}-{type}-{YYYYMMDD}
```

| Scope               | Pattern                              | Examples                                           | Visibility |
| ------------------- | ------------------------------------ | -------------------------------------------------- | ---------- |
| **Org infra**       | `org-{purpose}`                      | `org-deploy-templates`, `org-daily-ingest`         | Private    |
| **Client work**     | `client-{client}-{type}`             | `client-celavii-webapp`, `client-maxkick-proposal` | Private    |
| **Agent-generated** | `{agent-id}-{project}-{type}-{date}` | `member-001-celavii-q1-proposal-20260207`          | Private    |
| **Internal tools**  | `internal-{name}`                    | `internal-intel-hub`, `internal-agent-dashboard`   | Private    |
| **Experiments**     | `sandbox-{name}`                     | `sandbox-voice-chat`, `sandbox-ai-widget`          | Private    |

### Deployment Platforms

| Platform    | Plan        | Projects     | Bandwidth | Use For                                  | Commercial?            |
| ----------- | ----------- | ------------ | --------- | ---------------------------------------- | ---------------------- |
| **Netlify** | Legacy Free | 500 sites    | 100 GB/mo | Static proposals, client deliverables    | ✅ Yes                 |
| **Vercel**  | Hobby       | 200 projects | 100 GB/mo | SSR/API/cron, internal tools, dashboards | ❌ Non-commercial only |

**Routing rule**: **Vercel for everything** (no build minute cap, ~30s deploys). All Netlify sites have been migrated to Vercel.

| CLI       | Installed | Version         |
| --------- | --------- | --------------- |
| `netlify` | ✅        | Latest (legacy) |
| `vercel`  | ✅        | 50.13.2         |

### Active Deployments (Vercel)

| Site                         | Vercel URL                        | GitHub Repo                                 | Type        |
| ---------------------------- | --------------------------------- | ------------------------------------------- | ----------- |
| **Intel Hub**                | `intel-hub.vercel.app`            | `clawdwork/intel-hub`                       | Static HTML |
| **Celavii SEO Proposal**     | `seo-proposal.vercel.app`         | `clawdwork/client-celavii-seo-proposal`     | React/Vite  |
| **MaxKick SEO Proposal**     | `maxkick-seo-proposal.vercel.app` | `clawdwork/client-maxkick-seo-proposal`     | React/Vite  |
| **Kick Sheetz Presentation** | `presentations-weld.vercel.app`   | `clawdwork/client-kick-sheetz-presentation` | Static HTML |
| **MaxKick War Room**         | `deliverables-three.vercel.app`   | `clawdwork/client-maxkick-war-room`         | Static HTML |

### Legacy Netlify Deployments (Superseded — do not redeploy)

| Former Netlify Site                     | Migrated To                       |
| --------------------------------------- | --------------------------------- |
| `celavii-seo-proposal.netlify.app`      | `seo-proposal.vercel.app`         |
| `max-kick-proposal.netlify.app`         | `maxkick-seo-proposal.vercel.app` |
| `kick-sheetz-presentation.netlify.app`  | `presentations-weld.vercel.app`   |
| `war-room-engineering-2026.netlify.app` | `deliverables-three.vercel.app`   |

### Token Security Architecture

#### Credential Isolation by Agent Type

| Credential                       | Location       | admin-001 (unsandboxed) | member (sandboxed)                         | guest (sandboxed) |
| -------------------------------- | -------------- | ----------------------- | ------------------------------------------ | ----------------- |
| `~/.config/gh/` (GitHub CLI)     | macOS Keychain | ✅ Full access          | ❌ Not mounted                             | ❌ Not mounted    |
| `~/.config/netlify/`             | Local config   | ✅ Full access          | ❌ Not mounted                             | ❌ Not mounted    |
| `~/.local/share/com.vercel.cli/` | Local data     | ✅ Full access          | ❌ Not mounted                             | ❌ Not mounted    |
| `~/.openclaw/.env`               | API keys       | ✅ Full access          | ❌ Not mounted                             | ❌ Not mounted    |
| `~/org/config/env/shared.env`    | Shared PAT     | ✅ Can read             | ❌ Not mounted (injected via `docker.env`) | ❌ Not mounted    |

Sandboxed agents **never see credential files**. They only receive explicitly injected env vars via `sandbox.docker.env`.

#### Token Injection Model

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

#### Token Access Tiers

| Tier          | Role        | GitHub                   | Vercel                     | Netlify       | Can Deploy?    | Can Create Repos?             |
| ------------- | ----------- | ------------------------ | -------------------------- | ------------- | -------------- | ----------------------------- |
| **Full**      | admin-001   | Full CLI auth (Keychain) | Full CLI auth              | Full CLI auth | ✅ Anywhere    | ✅ Any repo                   |
| **Creator**   | member-NNN  | Shared PAT (injected)    | Per-agent token (injected) | None          | ✅ Vercel only | ✅ Naming convention enforced |
| **Viewer**    | guest-NNN   | None                     | None                       | None          | ❌ No          | ❌ No                         |
| **Automated** | service-NNN | Shared PAT (injected)    | Per-agent token (injected) | None          | ✅ Automated   | ✅ Cron/scheduled             |

### Member Self-Service Deploy Architecture

#### The Flow

```
Member (WhatsApp/Telegram):
  "Create a proposal for celavii with our Q1 metrics"
        │
        ▼
Member Agent (sandboxed):
  1. Reads ~/shared/projects/celavii/ (bind-mounted, only data they have access to)
  2. Generates code from template (React + Tailwind from ~/shared/templates/)
  3. Creates private repo: member-001-celavii-q1-proposal-20260207
     → git init, git remote add, git push (uses injected GH_TOKEN)
  4. Deploys via vercel --prod (CLI deploy, no git connection needed)
     → Uses injected VERCEL_TOKEN
  5. Returns live URL to member via WhatsApp
        │
        ▼
Member clicks URL → sees their proposal/dashboard/presentation
```

#### Data Isolation — Bind-Mount Enforcement

The member agent can **only generate content from data it can see**:

```json
{
  "id": "member-001",
  "sandbox": {
    "docker": {
      "binds": [
        "~/org/shared/projects/celavii:/shared/projects/celavii:ro",
        "~/org/shared/templates:/shared/templates:ro",
        "~/org/shared/knowledge:/shared/knowledge:ro"
      ]
    }
  }
}
```

- `member-001` sees celavii data → generates celavii proposals
- `member-001` does NOT see max-kick data → cannot generate max-kick content
- Templates are read-only — agents can copy but not modify originals

#### Deploy Templates (Token-Saving Strategy)

Instead of generating full apps from scratch, agents clone templates and inject content:

```
~/org/shared/templates/
├── proposal-template/              ← React + Tailwind proposal skeleton
│   ├── src/pages/index.tsx         ← Content injection point
│   ├── package.json
│   └── vercel.json
├── dashboard-template/             ← Next.js dashboard with charts
├── presentation-template/          ← Slide-based presentation
└── landing-page-template/          ← Marketing landing page
```

Agent workflow: copy template → inject content → `vercel --prod` → return URL.

#### Wizard Automation (Token Provisioning)

During `workspace-wizard` provisioning, the admin agent:

1. **Reads shared PAT** from `~/org/config/env/shared.env`
2. **Creates Vercel token** via REST API:
   ```bash
   curl -X POST "https://api.vercel.com/v3/user/tokens" \
     -H "Authorization: Bearer $VERCEL_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "member-002-deploy"}'
   ```
3. **Saves tokens** to `~/org/config/env/member-002.env`:
   ```
   GH_TOKEN=github_pat_...    (copied from shared.env)
   VERCEL_TOKEN=<new_token>   (from API response)
   ```
4. **Generates agent config** with `docker.env` referencing these tokens

Only manual step: GitHub PAT creation (done once, already created).

#### Leakage Prevention Matrix

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

#### Repo Cleanup Strategy

Agent-generated repos accumulate over time. Cleanup via `service-001` cron or admin:

```bash
# List agent-generated repos older than 90 days
gh repo list --json name,createdAt --jq \
  '.[] | select(.name | startswith("member-")) | select(.createdAt < "2026-01-01")'

# Archive old Vercel deployments (auto-handled by Vercel after 30 days)
```

### GitHub PAT Details

| Property                | Value                                     |
| ----------------------- | ----------------------------------------- |
| **Name**                | `org-agent-deploy`                        |
| **Type**                | Fine-grained                              |
| **Expiry**              | 2026-12-31                                |
| **Repository access**   | All repositories                          |
| **Contents**            | Read and write                            |
| **Administration**      | Read and write                            |
| **Metadata**            | Read-only (auto)                          |
| **Account permissions** | None                                      |
| **Stored at**           | `~/org/config/env/shared.env` (chmod 600) |
| **Env vars**            | `GH_TOKEN`, `GITHUB_TOKEN`                |

### Future: GitHub App (Phase 3)

For fully automated, per-repo scoped tokens without a shared PAT:

1. Create GitHub App (`clawdwork-deploy-bot`)
2. Grant: Contents rw, Administration rw
3. Install on personal account
4. Wizard generates **installation tokens** per provisioning request
5. Tokens are time-limited (1 hour) and repo-scoped

This eliminates the shared PAT entirely. Defer until agent count exceeds 5-10 and token rotation becomes a concern.

### Sandbox Network Security

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

### Agent Deactivation Protocols

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

### Sandbox Images

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

### Template Tech Stack (No Local Install)

Templates contain `package.json` as a **tech stack declaration** only — no `node_modules/`. Vercel handles `npm install` + build during remote deployment.

| Template                 | Direct Deps     | Size                | Status               |
| ------------------------ | --------------- | ------------------- | -------------------- |
| `proposal-template/`     | 37 deps + 6 dev | ~2 MB (source only) | ✅ Ready             |
| `dashboard-template/`    | —               | Placeholder         | Scaffold when needed |
| `presentation-template/` | —               | Placeholder         | Scaffold when needed |
| `landing-page-template/` | —               | Placeholder         | Scaffold when needed |

Full package inventory: `~/org/config/PACKAGE-INVENTORY.md`

**Agent deploy workflow** (Vercel builds remotely):

```
1. cp -r /shared/templates/proposal-template/ /tmp/build/  ← source files only (~2MB)
2. Inject content into src/app/page.tsx
3. vercel --prod                                            ← Vercel runs npm install + build
4. Return live URL
```

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
| 📦 **netlify**      | ✅ Ready | Deploy static web apps      | `netlify` |
| ▲ **vercel**        | ✅ Ready | Deploy SSR/API/cron apps    | `vercel`  |

### Search & Analysis

| Skill               | Status   | Purpose                   | CLI        |
| ------------------- | -------- | ------------------------- | ---------- |
| 📜 **session-logs** | ✅ Ready | Search past conversations | `jq`, `rg` |
| 🌐 **web-search**   | ✅ Ready | Web research              | Brave API  |

### Domain Skills (50 Skills across 13 Categories)

| Domain                 | Count | Skills                                                                                                                                          | Model  |
| ---------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **Marketing**          | 6     | brand-voice, campaign-planning, competitive-analysis, content-creation, intel-ingest, performance-analytics                                     | Flash  |
| **Sales**              | 6     | account-research, call-prep, competitive-intelligence, create-an-asset, daily-briefing, draft-outreach                                          | Flash  |
| **Product Management** | 6     | competitive-analysis, feature-spec, metrics-tracking, roadmap-management, stakeholder-comms, user-research-synthesis                            | Flash  |
| **Customer Support**   | 5     | customer-research, escalation, knowledge-management, response-drafting, ticket-triage                                                           | Flash  |
| **Enterprise Search**  | 3     | knowledge-synthesis, search-strategy, source-management                                                                                         | Flash  |
| **Legal**              | 6     | canned-responses, compliance, contract-review, legal-risk-assessment, meeting-briefing, nda-triage                                              | Sonnet |
| **Finance**            | 6     | audit-support, close-management, financial-statements, journal-entry-prep, reconciliation, variance-analysis                                    | Sonnet |
| **Data**               | 7     | data-context-extractor, data-exploration, data-validation, data-visualization, interactive-dashboard-builder, sql-queries, statistical-analysis | Sonnet |

### Custom Skills (Non-Domain)

| Skill                             | Category | Purpose                                        |
| --------------------------------- | -------- | ---------------------------------------------- |
| **shadcn-ui**                     | `ui/`    | UI component reference (React/Tailwind/shadcn) |
| **brand-identity**                | (root)   | Celavii brand guidelines                       |
| **generating-proposal-documents** | (root)   | Proposal formatting                            |
| **deploy-and-publish**            | (root)   | Deployment pipeline skill                      |
| **workspace-wizard**              | (root)   | Agent provisioning wizard (admin-only)         |

All skills live at `~/.openclaw/skills/` (symlink → `~/agent-workspace/skills/`).

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
| Deploy websites         | `vercel deploy --prod`     |
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

| CLI            | Version | Purpose                           |
| -------------- | ------- | --------------------------------- |
| `gh`           | Latest  | GitHub operations                 |
| `netlify`      | Latest  | Netlify deployments               |
| `whisper`      | Local   | Audio transcription               |
| `pi`           | 0.51.6  | Pi coding agent                   |
| `jq`           | Latest  | JSON processing                   |
| `rg` (ripgrep) | Latest  | Fast text search                  |
| `sag`          | 0.2.2   | ElevenLabs TTS                    |
| `uv`           | 0.9.30  | Python package manager            |
| `vercel`       | 50.13.2 | Vercel deployments (SSR/API/cron) |

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
Agent: [deploys to Vercel]
Agent: "Done! Live at https://xyz.vercel.app - here's what I built..."
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

1. **API keys**: Stored in `~/.openclaw/.env` (chmod 600) — invisible to sandboxed agents
2. **Gateway token**: In `openclaw.json`, required for CLI/WebChat access
3. **Exec security**: `full` for admin (unsandboxed); sandboxed agents run tools inside Docker
4. **Sandbox**: Off for admin-001; On (`mode: all`) for member/guest/service agents
5. **Env isolation**: Sandboxed agents only see explicitly injected `docker.env` vars (see Env Siloing section)
6. **Filesystem isolation**: Docker bind mounts control per-agent project access (see Granular Project Access)
7. **Tool restrictions**: Per-agent `tools.allow` / `tools.deny` policies (see Role Permissions)

### Risk Mitigation

- Set billing alerts on provider dashboards
- Monitor daily costs via Cost Estimation projections
- Use heartbeat to check for runaway processes
- Review `~/org/config/roster.json` for active agents
- Audit `~/org/config/env/` for key exposure
- Sandboxed agents cannot access `~/.openclaw/`, `~/org/config/`, or other workspaces

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
~/org/workspaces/{agent-id}/
├── SOUL.md        ← Coordinator routing rules (coordinator-only, per agent)
├── TOOLS.md       ← Sub-agent documentation rules + model reference (shared)
├── AGENTS.md      ← Multi-agent coordination (shared)

~/.openclaw/skills/         ← Domain skill definitions (shared, all agents)
~/org/shared/projects/      ← Project context (sub-agents read via task instructions)
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

| Date       | Change                                                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-04 | Initial setup - multi-model, heartbeat, caching                                                                                                                                                 |
| 2026-02-04 | Architecture document created                                                                                                                                                                   |
| 2026-02-04 | Added routing instructions to SOUL.md and TOOLS.md                                                                                                                                              |
| 2026-02-04 | **Architecture revision**: Sonnet as main agent, Opus for planning, Flash for search, Haiku for tools                                                                                           |
| 2026-02-05 | Configured Telegram channel with allowlist policy                                                                                                                                               |
| 2026-02-05 | Installed voice skills: whisper, sag, sherpa-onnx-tts                                                                                                                                           |
| 2026-02-05 | Installed dev tools: gh, netlify, pi, jq, ripgrep                                                                                                                                               |
| 2026-02-05 | Added custom skills: shadcn-ui, brand-identity, proposals                                                                                                                                       |
| 2026-02-05 | Authenticated GitHub (`clawdwork`) and Netlify accounts                                                                                                                                         |
| 2026-02-05 | Added capabilities matrix and skill inventory                                                                                                                                                   |
| 2026-02-05 | Installed 46 Anthropic domain skills across 8 categories                                                                                                                                        |
| 2026-02-05 | Fixed tool call visibility in Telegram (pruning placeholder)                                                                                                                                    |
| 2026-02-06 | **Architecture revision v2**: Flash as coordinator, Sonnet as coder, Opus 4.6 as planner                                                                                                        |
| 2026-02-06 | Added 8 domain sub-agents: marketing, sales, legal, finance, data, product, support, search                                                                                                     |
| 2026-02-06 | Added project-first file organization with domain research folders                                                                                                                              |
| 2026-02-06 | Enterprise Search agent configured with file-based persistent memory                                                                                                                            |
| 2026-02-06 | Self-documenting domain agents: MUST save findings before reporting                                                                                                                             |
| 2026-02-06 | **Codebase verification**: sub-agents cannot spawn (1-level only)                                                                                                                               |
| 2026-02-06 | **Codebase verification**: sub-agents see only AGENTS.md + TOOLS.md                                                                                                                             |
| 2026-02-06 | Added 3-layer context injection pattern (TOOLS.md + agents.list + task field)                                                                                                                   |
| 2026-02-06 | Added multi-coordinator architecture for team scaling                                                                                                                                           |
| 2026-02-06 | Documented `agentId` routing via `sessions_spawn` for domain agents                                                                                                                             |
| 2026-02-06 | **Org-scale team architecture**: role-based naming protocol (`admin-NNN`, `member-NNN`, `guest-NNN`)                                                                                            |
| 2026-02-06 | Designed `~/org/` directory structure: shared/, workspaces/, config/                                                                                                                            |
| 2026-02-06 | Access matrix: sandbox isolation + Docker bind mounts per role                                                                                                                                  |
| 2026-02-06 | Role permissions: admin (full), member (sandboxed rw), guest (sandboxed ro), service (automated)                                                                                                |
| 2026-02-06 | Channel routing plan: separate Telegram bots per agent, WhatsApp DM-split                                                                                                                       |
| 2026-02-06 | Migration path: agent-workspace → ~/org/workspaces/admin-001/ + symlinks                                                                                                                        |
| 2026-02-06 | Docker Desktop installed via Homebrew (arm64)                                                                                                                                                   |
| 2026-02-06 | Env siloing architecture: sandbox already isolates; Phase 1 config + Phase 2 env file hierarchy                                                                                                 |
| 2026-02-06 | Phase 2 integration roadmap: envFile, env hierarchy, workspace wizard, folder-ACL, migration                                                                                                    |
| 2026-02-06 | **Workspace Wizard skill spec**: admin-only provisioning wizard with templates + deactivation flow                                                                                              |
| 2026-02-06 | **Structural audit**: fixed 6 stale refs (old paths, personal names, outdated security notes, model table)                                                                                      |
| 2026-02-06 | WhatsApp channel linked (dedicated number), LaunchAgent installed for boot persistence                                                                                                          |
| 2026-02-06 | **Channel bindings**: per-sender session isolation, binding patterns, DM policy + bindings flow diagram                                                                                         |
| 2026-02-07 | **Git & Deployment Integration**: GitHub repo structure, Vercel/Netlify platform assessment, deployment routing                                                                                 |
| 2026-02-07 | **Token Security Architecture**: credential isolation matrix, injection model, access tiers, leakage prevention                                                                                 |
| 2026-02-07 | **Member Self-Service Deploys**: agent-driven repo creation + Vercel deploy flow, templates, data isolation                                                                                     |
| 2026-02-07 | GitHub PAT `org-agent-deploy` created (fine-grained, expires 2026-12-31), saved to `shared.env`                                                                                                 |
| 2026-02-07 | **deploy-and-publish skill**: unified generate → git → deploy → URL pipeline for member agents                                                                                                  |
| 2026-02-07 | **Proposal template**: `~/org/shared/templates/proposal-template/` (Next.js + Tailwind + Lucide, 8.5x11 print)                                                                                  |
| 2026-02-07 | **Provisioning script**: auto-creates Vercel tokens via API, injects GH_TOKEN from shared.env                                                                                                   |
| 2026-02-07 | **Sandbox network security**: default `network:none`, bridge for deploy-enabled only, skills can't be installed                                                                                 |
| 2026-02-07 | **Deactivation protocols**: disable/archive/delete/purge tiers, Vercel token revocation, repo+deploy cleanup                                                                                    |
| 2026-02-07 | **Deploy routing**: Vercel-first (no build minute cap), Netlify only for existing commercial sites                                                                                              |
| 2026-02-07 | **Netlify→Vercel migration**: All 4 Netlify sites (celavii-seo-proposal, max-kick-proposal, kick-sheetz-presentation, war-room-engineering-2026) migrated to Vercel with dedicated GitHub repos |
| 2026-02-07 | **GitHub repos created**: client-celavii-seo-proposal, client-maxkick-seo-proposal, client-kick-sheetz-presentation, client-maxkick-war-room (all private, clawdwork account)                   |
| 2026-02-07 | **Skills symlink**: `~/.openclaw/skills/` → `~/agent-workspace/skills/` — all 50 skills now globally accessible to all agents                                                                   |
| 2026-02-07 | **shadcn-ui relocated**: `skills/shadcn-ui.md` → `skills/ui/shadcn-ui/SKILL.md` (proper skill directory with YAML frontmatter)                                                                  |
| 2026-02-07 | **Skills inventory**: 50 skills across 13 categories (was 46 across 8+4 custom). Full inventory documented in WORKSPACE.md                                                                      |
| 2026-02-07 | **WORKSPACE.md**: Created canonical workspace map with file save decision tree, project registry, deployment registry, git repo registry, skills inventory                                      |
| 2026-02-07 | **Personal workspace dirs**: Added daily/, todos/, intel/daily/, audio/ to workspace provisioning (provision-workspace.sh + templates)                                                          |
| 2026-02-07 | **Intel hub pipeline fixes**: hub-sync.sh updated with pre-flight checks (edition HTML + index.html), Vercel token auth, removed stale Netlify refs                                             |
| 2026-02-07 | **SKILL.md (intel-ingest)**: Consolidated duplicate Phase 4/5, added HTML edition generation step (4.2), fixed stale paths                                                                      |

---

**Document maintained by**: Admin  
**Gateway**: OpenClaw 2026.2.3  
**Location**: `.implementation/SYSTEM-ARCHITECTURE.md`
