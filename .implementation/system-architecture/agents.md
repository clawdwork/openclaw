# Agents & Sub-Agent Architecture

> Part of [System Architecture](README.md)

---

## Task Routing (1-Level Spawning)

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

## Sub-Agent Configuration

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

---

## Sub-Agent Context Visibility

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
  → File Routing Cheat Sheet: project structure, save paths, template locations
  → Per-agent-type paths: coder, data, grunt, planner each have specific save targets
  → Self-documenting rules: "ALWAYS save findings to projects/{project}/research/{domain}/"
  → Skill reading pattern: "Read skills/{domain}/{skill}/SKILL.md for guidance"

Layer 2: agents.list (per-agent config in openclaw.json)
  → Model: Flash or Sonnet per domain
  → Skills filter: only relevant skills listed
  → Identity: name + emoji
  → Workspace: ~/org/workspaces/{agent-id}/

Layer 3: Task field (per-spawn instructions from Flash)
  → "Read skills/marketing/content-creation/SKILL.md.
     Perform SEO audit for Max Kick.
     Save findings to projects/max-kick/research/marketing/seo-audit-2026-02-06.md.
     Read projects/max-kick/PROJECT.md first for context."
```

---

## Sub-Agent Lifecycle

```
1. IDENTIFY
   Flash identifies domain: "Draft SEO content" → marketing
                    │
                    ▼
2. SPAWN (via agentId routing)
   sessions_spawn({
     task: "Read skills/marketing/content-creation/SKILL.md for guidance.
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

---

## When to Use Sub-Agents

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

---

## Multi-Coordinator Architecture (Team Scaling)

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
| **Build & deploy**      | coding-agent → vercel      | "Build a landing page" → Pi creates code → Vercel deploy → Live URL     |
| **PR review workflow**  | github → coding-agent      | "Review PR #42" → Clone → Pi reviews → Post comments via `gh`           |
| **Brand-compliant UI**  | shadcn-ui + brand-identity | "Create a dashboard" → Apply Celavii design tokens → shadcn components  |

### Complex (Orchestrated Multi-Step)

| Scenario                              | Skills Used                                                 | Flow                                                                   |
| ------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Voice-driven development**          | whisper → coding-agent → github → vercel                    | Voice → Transcribe → Code → Create repo → Deploy → Return URL          |
| **Automated proposal generation**     | web-search → brand-identity → generating-proposal-documents | Research → Apply brand → Generate formatted proposal → PDF-ready React |
| **Full-stack feature implementation** | github → coding-agent → session-logs                        | Fetch issue → Search context → Implement → Create PR → Request review  |
| **Voice assistant mode**              | whisper → (any skill) → sag/sherpa-onnx                     | Voice input → Transcribe → Process → Respond with TTS                  |
| **Parallel issue fixing**             | github → coding-agent (×N)                                  | List issues → Worktrees → Parallel Pi agents → PRs for all → Summarize |

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
| Repository      | vercel         | Live site             |
| Research        | brand-identity | Branded content       |
| Branded content | proposals      | Client-ready document |
| Any output      | sag/sherpa     | Spoken response       |
