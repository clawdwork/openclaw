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
        ├── Legal task? ──▶ Spawn Legal Agent (Pro, medium)
        │
        ├── Finance task? ──▶ Spawn Finance Agent (Pro, medium)
        │
        ├── Data task? ──▶ Spawn Data Agent (Pro, medium)
        │
        ├── Product task? ──▶ Spawn Product Agent (Flash)
        │
        ├── Support task? ──▶ Spawn Support Agent (Flash)
        │
        ├── Search task? ──▶ Spawn Enterprise Search Agent (Flash)
        │
        ├── Media content task? ──▶ Spawn Media Content Agent (Pro)
        │   (image, video, mood board, product shot, character design,
        │    commercial ad, visual asset, brand identity visual)
        │
        ├── Review creative output? ──▶ Spawn Quality Critic (GPT-5.2, xhigh)
        │   (proposals, images, decks — feedback loop after generation)
        │
        ├── Everyday coding? ──▶ Spawn Dev Coder (Flash, high)
        │
        ├── Complex/prod code? ──▶ Spawn Prod Coder (5.2-Codex, xhigh)
        │
        ├── Architecture/planning? ──▶ Spawn GPT-5.2 (planner, xhigh)
        │
        ├── File ops / grunt work? ──▶ Spawn Flash (grunt, off)
        │
        ├── Web search? ──▶ Handle directly (native grounding)
        │
        └── Simple conversation? ──▶ Handle directly
```

### Spawning Depth Limits

| Level | Agent               | Can Spawn?                               | Session Key Pattern          |
| ----- | ------------------- | ---------------------------------------- | ---------------------------- |
| 0     | Flash (coordinator) | ✅ All domain agents + GPT-5.2 (planner) | `agent:main:main`            |
| 0     | Team coordinators   | ✅ Per `subagents.allowAgents` config    | `agent:{id}:main`            |
| 1     | Domain sub-agents   | ❌ Cannot spawn (sub-agent session)      | `agent:{id}:subagent:{uuid}` |
| 1     | GPT-5.2/utility     | ❌ Cannot spawn (sub-agent session)      | `agent:main:subagent:{uuid}` |

> **Multi-step workflows** (domain research → coding): Flash orchestrates sequentially.
> Flash spawns marketing agent, waits for results, then spawns prod-coder with findings.

---

## Sub-Agent Configuration

```json
{
  "subagents": {
    "maxConcurrent": 4,
    "archiveAfterMinutes": 60,
    "model": {
      "primary": "google/gemini-3-flash-preview"
    },
    "thinking": "low"
  }
}
```

### Domain Sub-Agent Definitions

Each domain agent is defined in `openclaw.json` `agents.list` and spawned via `sessions_spawn({ agentId: "{id}" })`.
The gateway resolves per-agent config: model, skills filter, workspace, identity.

| Agent             | ID               | Model     | Thinking | Role Summary                                                      | Session Type   |
| ----------------- | ---------------- | --------- | -------- | ----------------------------------------------------------------- | -------------- |
| **Coordinator**   | `main`           | Flash     | medium   | User conversations, routing, web search, synthesis                | Main session   |
| Marketing         | `marketing`      | Flash     | low      | SEO, content, campaigns, brand voice, analytics, Celavii CIP      | Ephemeral      |
| Sales             | `sales`          | Flash     | low      | Account research, outreach, pipeline, call summaries              | Ephemeral      |
| Product           | `product`        | Flash     | low      | Specs, roadmaps, competitive analysis, user stories               | Ephemeral      |
| Support           | `support`        | Flash     | low      | Ticket triage, KB management, escalation                          | Ephemeral      |
| Enterprise Search | `search`         | Flash     | low      | Query decomposition, multi-source synthesis                       | **Persistent** |
| Legal             | `legal`          | Pro       | medium   | Contracts, compliance, risk assessment                            | Ephemeral      |
| Finance           | `finance`        | Pro       | medium   | Budgets, forecasting, reconciliation                              | Ephemeral      |
| Data              | `data`           | Pro       | medium   | SQL, visualization, ETL, data quality                             | Ephemeral      |
| Media Content     | `media-content`  | Pro       | low      | Image/video/audio prompt crafting, visual assets                  | Ephemeral      |
| Quality Critic    | `quality-critic` | GPT-5.2   | xhigh    | Reviews creative outputs against specs (proposals, images, decks) | Ephemeral      |
| **Dev Coder**     | `dev-coder`      | Flash     | high     | Everyday coding, automations, scripts, simple deploys, CI/CD      | Ephemeral      |
| **Prod Coder**    | `prod-coder`     | 5.2-Codex | xhigh    | Complex integrations, APIs, backends, prod-critical refactors     | Ephemeral      |
| **Planner**       | `planner`        | GPT-5.2   | xhigh    | Architecture review, validation, expert advisor                   | Ephemeral      |
| **Grunt**         | `grunt`          | Flash     | off      | File ops, tests, cleanup, bulk operations, scaffolding            | Ephemeral      |

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
  → Model: Flash or Pro per domain (+ thinking level)
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
  └── Spawn Legal Agent (Pro) ──→ Contract review
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

| Task Type             | Use Sub-Agent? | Which Agent                                |
| --------------------- | -------------- | ------------------------------------------ |
| Marketing content/SEO | ✅ Yes         | Marketing (Flash)                          |
| Creator discovery     | ✅ Yes         | Marketing (Flash)                          |
| Campaign analytics    | ✅ Yes         | Marketing (Flash)                          |
| CRM pipeline check    | ✅ Yes         | Marketing (Flash)                          |
| Account research      | ✅ Yes         | Sales (Flash)                              |
| Contract review       | ✅ Yes         | Legal (Pro)                                |
| Financial analysis    | ✅ Yes         | Finance (Pro)                              |
| SQL / data work       | ✅ Yes         | Data (Pro)                                 |
| Product specs         | ✅ Yes         | Product (Flash)                            |
| Ticket handling       | ✅ Yes         | Support (Flash)                            |
| Cross-tool search     | ✅ Yes         | Enterprise Search (Flash)                  |
| Code implementation   | ✅ Yes         | Dev Coder (Flash) / Prod Coder (5.2-Codex) |
| Architecture planning | ✅ Yes         | GPT-5.2 (planner, xhigh)                   |
| File ops / grunt work | ✅ Yes         | Grunt (Flash, thinking off)                |
| Image generation      | ✅ Yes         | Media Content (Pro)                        |
| Video prompting       | ✅ Yes         | Media Content (Pro)                        |
| Mood board / brand ID | ✅ Yes         | Media Content (Pro)                        |
| Product shot          | ✅ Yes         | Media Content (Pro)                        |
| Character design      | ✅ Yes         | Media Content (Pro)                        |
| Review proposal/image | ✅ Yes         | Quality Critic (GPT-5.2, xhigh)            |
| Web search            | ❌ No          | Flash handles directly                     |
| Simple conversation   | ❌ No          | Flash handles directly                     |

---

## Quality Critic Feedback Loop (PaperBanana-Inspired)

For client-facing creative outputs, Flash orchestrates a generate→review→refine loop using the Quality Critic agent (GPT-5.2, xhigh). Inspired by the [PaperBanana](https://dwzhu-pku.github.io/PaperBanana/) multi-agent architecture for academic illustration.

```
User: "Create proposal for X"
        │
        ▼
Flash (coordinator)
  ├─ Step 1: Spawn generator (dev-coder / marketing / media-content)
  │    └─ Returns: generated code, deployed URL, or image
  │
  ├─ Step 2: Spawn quality-critic (GPT-5.2, xhigh)
  │    └─ Input: spec + output + quality-checklist.md
  │    └─ Evaluates: content fidelity, layout, visual quality, brand
  │    └─ Returns: PASS or { FAIL, structured feedback }
  │
  ├─ Step 3 (if FAIL, iteration < 2):
  │    └─ Spawn generator again with critic feedback
  │    └─ Back to Step 2
  │
  └─ Step 4: Deliver final result to user
```

| Property           | Value                                                   |
| ------------------ | ------------------------------------------------------- |
| **Agent ID**       | `quality-critic`                                        |
| **Model**          | Gemini 3 Pro (~$0.016/critique)                         |
| **Max iterations** | 2 refinement passes (3 evaluations total)               |
| **Skill**          | `skills/quality-critic/SKILL.md`                        |
| **Applies to**     | Proposals, images, decks, data viz, any creative output |
| **Skip when**      | Internal/draft outputs (save cost)                      |

### Evaluation Dimensions

| Dimension         | Weight | What It Checks                                      |
| ----------------- | ------ | --------------------------------------------------- |
| Content Fidelity  | 40%    | All spec data present, no hallucinations            |
| Layout Compliance | 25%    | Fits medium (8.5x11, aspect ratio), density limits  |
| Visual Quality    | 20%    | Consistent spacing, typography, colors, readability |
| Brand Consistency | 15%    | Colors, logo, typography match brand.json           |

---

## Thinking Strategy

### Resolution Hierarchy

Thinking levels are resolved at spawn time via a 3-tier cascade (first non-empty wins):

```
1. Explicit spawn param   →  sessions_spawn({ thinking: "high" })
2. Per-agent config        →  agents.list[].subagents.thinking
3. Global default          →  agents.defaults.subagents.thinking  (currently: "low")
```

The **main coordinator session** uses `agents.defaults.thinkingDefault` (currently: `"medium"`).

### Current Configuration

| Tier                 | Config Path                          | Value    | Affects                    |
| -------------------- | ------------------------------------ | -------- | -------------------------- |
| **Global main**      | `agents.defaults.thinkingDefault`    | `medium` | Coordinator (main session) |
| **Global sub-agent** | `agents.defaults.subagents.thinking` | `low`    | All sub-agents (baseline)  |
| **Per-agent**        | `agents.list[].subagents.thinking`   | varies   | Overrides global per agent |

### Thinking Level Assignments

| Agent                  | Model     | Thinking | Rationale                                                    |
| ---------------------- | --------- | -------- | ------------------------------------------------------------ |
| **Coordinator** (main) | Flash     | `medium` | Routing + synthesis needs reasoning                          |
| Marketing              | Flash     | `low`    | Volume work, speed priority                                  |
| Sales                  | Flash     | `low`    | Research, outreach — speed matters                           |
| Product                | Flash     | `low`    | Specs, roadmaps — standard depth                             |
| Support                | Flash     | `low`    | Triage, quick responses                                      |
| Search                 | Flash     | `low`    | Query decomposition                                          |
| Legal                  | Pro       | `medium` | Precision, risk assessment                                   |
| Finance                | Pro       | `medium` | Accuracy, compliance                                         |
| Data                   | Pro       | `medium` | SQL generation, data quality                                 |
| Media Content          | Pro       | `low`    | Creative work, vision                                        |
| Quality Critic         | GPT-5.2   | `xhigh`  | SOTA reasoning for deep review (92.4% GPQA, 52.9% ARC-AGI-2) |
| Dev Coder              | Flash     | `high`   | Code quality needs deep thinking                             |
| Prod Coder             | 5.2-Codex | `xhigh`  | SOTA coding (55.6% SWE-Bench Pro), context compaction        |
| Planner                | GPT-5.2   | `xhigh`  | SOTA reasoning replaces Opus at 65% cost savings             |
| Grunt                  | Flash     | `off`    | File ops don't need reasoning                                |

### Provider Strategy (Cost Optimization)

**Goal**: Minimize Anthropic usage — too expensive for sustained operations.

| Provider             | Role                     | Agents                                                                               | Cost/1M            |
| -------------------- | ------------------------ | ------------------------------------------------------------------------------------ | ------------------ |
| **Google Flash**     | Primary workhorse        | 8 agents (coordinator, marketing, sales, product, support, search, dev-coder, grunt) | $0.50 in / $3 out  |
| **Google Pro**       | Precision + creative     | 4 agents (legal, finance, data, media-content)                                       | $2 in / $12 out    |
| **OpenAI GPT-5.2**   | SOTA reasoning           | 2 agents (quality-critic, planner)                                                   | $1.75 in / $14 out |
| **OpenAI 5.2-Codex** | SOTA coding              | 1 agent (prod-coder)                                                                 | $1.75 in / $14 out |
| **Anthropic**        | **Removed from primary** | 0 agents (available in fallback chain only)                                          | —                  |
| **Haiku**            | **Deprecated**           | 0 agents                                                                             | —                  |

> Full model strategy and cost analysis: [model-strategy.md](model-strategy.md)

### Gemini Thinking Level Mapping

The SDK maps OpenClaw's `ThinkLevel` → Google-native `ThinkingConfig` automatically:

| OpenClaw Level | Gemini 3 Flash | Gemini 3 Pro         | Notes      |
| -------------- | -------------- | -------------------- | ---------- |
| `off`          | No thinking    | No thinking          |            |
| `minimal`      | MINIMAL        | ❌ (failover → LOW)  | Flash only |
| `low`          | LOW            | LOW                  |            |
| `medium`       | MEDIUM         | ❌ (failover → HIGH) | Flash only |
| `high`         | HIGH           | HIGH                 |            |

> Pro only supports LOW and HIGH. The runner's `pickFallbackThinkingLevel()` auto-retries with a supported level if the provider rejects the request.

### Workspace-Level Customization (Commissioned Agents)

Member workspaces can override thinking levels for their specific agents:

```json
// Member workspace: ~/org/workspaces/member-sales-001/openclaw.json
{
  "agents": {
    "list": [
      {
        "id": "sales",
        "subagents": { "thinking": "high" }
      }
    ]
  }
}
```

This inherits everything from the central config but overrides thinking for the sales agent in that workspace only. Use case: a dedicated sales member who needs deep reasoning for account research and outreach strategy.

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
│  │   support, search, media-content                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

| Feature                  | Per Coordinator                                   |
| ------------------------ | ------------------------------------------------- |
| **Own workspace**        | Different SOUL.md, TOOLS.md, projects/            |
| **Own model**            | Flash, Pro, GPT-5.2, or any per team member       |
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
| Creator search  | celavii-\*     | Creator intelligence  |
| Any output      | sag/sherpa     | Spoken response       |
