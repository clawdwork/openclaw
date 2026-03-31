# OpenClaw Architecture Overview

> Generated: 2026-03-09 | Gateway Version: 2026.2.12 | All checks passed ✅

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    USER INTERFACES (CHANNELS)                                    │
├──────────────────┬──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│    📱 Telegram   │   💬 WhatsApp    │    🌐 WebChat    │    📲 Custom     │     🎙️ Voice      │
│   @maxious_bot   │  Dedicated Number │  ws://127.0.0.1  │   HTTP→Gateway   │  Whisper + TTS     │
│   Allowlist      │  Pairing Gate    │     :49152       │     API          │  ElevenLabs/Local  │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬─────────┴──────────┬─────────┘
         │                  │             ◊     │                  │                    │
         └──────────────────┴──────────────────┼──────────────────┴────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              OPENCLAW GATEWAY (ws://127.0.0.1:49152)                            │
│                                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                     MESSAGE ROUTING                                         │ │
│  │                                                                                             │ │
│  │   Bindings → Agent ID Resolution → Session Management → Tool Execution → Response          │ │
│  │                                                                                             │ │
│  │   • Per-sender session isolation (WhatsApp: +1xxx → private session)                       │ │
│  │   • Channel binding patterns (Telegram bots, WhatsApp numbers, WebChat)                    │ │
│  │   • DM policy: pairing gate for unknown senders                                            │ │
│  └────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                               │                                                  │
│                                               ▼                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                           COORDINATOR (Gemini 3.0 Flash)                                   │ │
│  │                                                                                             │ │
│  │   Model: google/gemini-3-flash-preview          Cost: $0.50 in / $3 out per 1M tokens      │ │
│  │   Context: 1M tokens                            Thinking: medium                           │ │
│  │   Role: Conversation, routing, web search, coordination, synthesis                         │ │
│  │                                                                                             │ │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────┐  │ │
│  │   │ WORKSPACE FILES (Coordinator sees ALL):                                              │  │ │
│  │   │   SOUL.md → Orchestration rules, domain routing                                      │  │ │
│  │   │   TOOLS.md → Model reference, self-documenting rules                                 │  │ │
│  │   │   AGENTS.md → Multi-agent coordination                                               │  │ │
│  │   │   USER.md → User preferences                                                         │  │ │
│  │   │   IDENTITY.md → Agent persona                                                        │  │ │
│  │   │   MEMORY.md → Long-term memory                                                       │  │ │
│  │   │   Skills → Auto-loaded (101 total: 36 managed + 65 bundled)                          │  │ │
│  │   └─────────────────────────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                               │                                                  │
│                    ┌──────────────────────────┼──────────────────────────┐                       │
│                    │                          │                          │                       │
│                    ▼                          ▼                          ▼                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                           DOMAIN SUB-AGENTS (18 Specialists)                                ││
│  │                                                                                              ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────┐   ││
│  │  │ FLASH AGENTS (Speed Priority) - $0.50/$3 per 1M                                     │   ││
│  │  │                                                                                      │   ││
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │   ││
│  │  │  │  Marketing   │ │    Sales     │ │   Product    │ │   Support    │               │   ││
│  │  │  │  6 skills    │ │  6 skills    │ │  6 skills    │ │  5 skills    │               │   ││
│  │  │  │  +10 Celavii │ │  think: low  │ │  think: low  │ │  think: low  │               │   ││
│  │  │  │  think: high │ │              │ │              │ │              │               │   ││
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘               │   ││
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                │   ││
│  │  │  │   Search     │ │  Dev Coder   │ │    Grunt     │                                │   ││
│  │  │  │  3 skills    │ │  think: high │ │  think: OFF  │                                │   ││
│  │  │  │  persistent  │ │  everyday    │ │  file ops,   │                                │   ││
│  │  │  │  memory      │ │  coding      │ │  bulk tasks  │                                │   ││
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘                                │   ││
│  │  └─────────────────────────────────────────────────────────────────────────────────────┘   ││
│  │                                                                                              ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────┐   ││
│  │  │ PRO AGENTS (Precision Priority) - $2/$12 per 1M                                     │   ││
│  │  │                                                                                      │   ││
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │   ││
│  │  │  │     SEO      │ │    Legal     │ │   Finance    │ │     Data     │               │   ││
│  │  │  │  18 skills   │ │  6 skills    │ │  6 skills    │ │  7 skills    │               │   ││
│  │  │  │  think: high │ │  think: med  │ │  think: med  │ │  think: med  │               │   ││
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘               │   ││
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                │   ││
│  │  │  │Media Content │ │   Blogger    │ │  Workspace   │                                │   ││
│  │  │  │  5 skills    │ │  15 skills   │ │   Auditor    │                                │   ││
│  │  │  │  think: low  │ │  think: high │ │  1 skill     │                                │   ││
│  │  │  │  visual gen  │ │  SEO-coupled │ │  MWF audits  │                                │   ││
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘                                │   ││
│  │  └─────────────────────────────────────────────────────────────────────────────────────┘   ││
│  │                                                                                              ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────┐   ││
│  │  │ SPECIALIST AGENTS (SOTA Priority) - $1.75/$14 per 1M                                │   ││
│  │  │                                                                                      │   ││
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                │   ││
│  │  │  │   GPT-5.2    │ │  5.2-Codex   │ │Quality Critic│                                │   ││
│  │  │  │  (Planner)   │ │ (Prod Coder) │ │  (Reviewer)  │                                │   ││
│  │  │  │  xhigh       │ │  xhigh       │ │  xhigh       │                                │   ││
│  │  │  │  architecture│ │  complex API │ │  proposals,  │                                │   ││
│  │  │  │  deep reason │ │  prod-code   │ │  images, etc │                                │   ││
│  │  │  └──────────────┘ └──────────────┘ └──────────────┘                                │   ││
│  │  └─────────────────────────────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                   BACKGROUND SERVICES                                       │ │
│  │                                                                                             │ │
│  │  ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐                  │ │
│  │  │  💓 Heartbeat     │    │   ⏰ Cron Jobs    │    │  🔄 Auto-Archive  │                  │ │
│  │  │  Every 30 min     │    │  Scheduled tasks  │    │  60 min sessions  │                  │ │
│  │  │  Gemini 2.5 Flash │    │  maxRuns support  │    │  cleanup routine  │                  │ │
│  │  │  ~$0.50/month     │    │                   │    │                   │                  │ │
│  │  └───────────────────┘    └───────────────────┘    └───────────────────┘                  │ │
│  └────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Task Routing Flow

```
                                    USER MESSAGE
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            FLASH COORDINATOR (agent:main:main)                       │
│                                                                                      │
│   1. Classify intent                                                                 │
│   2. Check if sub-agent needed                                                       │
│   3. Spawn via sessions_spawn({ agentId, task, label })                             │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
         ▼                               ▼                               ▼
    ┌─────────────┐               ┌─────────────┐               ┌─────────────┐
    │  Marketing? │               │  Code Task? │               │  Precision? │
    │  SEO? Sales?│               │             │               │  Legal/Fin? │
    └──────┬──────┘               └──────┬──────┘               └──────┬──────┘
           │                             │                             │
           ▼                             ▼                             ▼
    ┌─────────────┐               ┌─────────────┐               ┌─────────────┐
    │ Flash Agent │               │ Dev: Flash  │               │ Pro Agent   │
    │  (speed)    │               │ Prod: Codex │               │ (precision) │
    └──────┬──────┘               └──────┬──────┘               └──────┬──────┘
           │                             │                             │
           └─────────────────────────────┼─────────────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │  RESULTS TO FLASH   │
                              │  (synthesize &      │
                              │   deliver to user)  │
                              └─────────────────────┘
```

---

## Spawning Depth & Session Keys

```
LEVEL 0 (Main Sessions - CAN SPAWN)
├── agent:main:main                    ← Flash Coordinator (full spawning rights)
├── agent:admin-001:main               ← Admin agent (allowAgents: ["*"])
└── agent:member-001:main              ← Member agent (allowAgents: subset)

LEVEL 1 (Sub-Agent Sessions - CANNOT SPAWN)
├── agent:marketing:subagent:{uuid}    ← Marketing sub-agent
├── agent:seo:subagent:{uuid}          ← SEO sub-agent
├── agent:sales:subagent:{uuid}        ← Sales sub-agent
├── agent:legal:subagent:{uuid}        ← Legal sub-agent
├── agent:finance:subagent:{uuid}      ← Finance sub-agent
├── agent:data:subagent:{uuid}         ← Data sub-agent
├── agent:product:subagent:{uuid}      ← Product sub-agent
├── agent:support:subagent:{uuid}      ← Support sub-agent
├── agent:search:subagent:{uuid}       ← Search sub-agent (persistent)
├── agent:media-content:subagent:{uuid}← Media sub-agent
├── agent:blogger:subagent:{uuid}      ← Blogger sub-agent
├── agent:quality-critic:subagent:{uuid} ← Critic sub-agent
├── agent:dev-coder:subagent:{uuid}    ← Dev coder sub-agent
├── agent:prod-coder:subagent:{uuid}   ← Prod coder sub-agent
├── agent:planner:subagent:{uuid}      ← Planner sub-agent
├── agent:grunt:subagent:{uuid}        ← Grunt sub-agent
└── agent:workspace-auditor:subagent:{uuid} ← Auditor sub-agent
```

---

## Skills Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               SKILL LOADING HIERARCHY                                │
│                                (Last Match Wins)                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
         ▼                               ▼                               ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│ 1. BUNDLED SKILLS   │      │ 2. MANAGED SKILLS   │      │ 3. WORKSPACE SKILLS │
│    (65 skills)      │      │    (36 skills)      │      │    (overrides)      │
│                     │      │                     │      │                     │
│ Built into OpenClaw │      │ ~/.openclaw/skills/ │      │ {workspace}/skills/ │
│ binary              │      │ → ~/dev/workspace │      │ Highest priority    │
│                     │      │    /skills/ symlink │      │                     │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               SKILLS BY DOMAIN (88 Total)                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  MARKETING (6+10)    SEO (18)           SALES (6)          PRODUCT (6)              │
│  ├── brand-voice     ├── seo-*          ├── account-res    ├── feature-spec         │
│  ├── campaigns       ├── keyword-*      ├── call-prep      ├── roadmap              │
│  ├── content         └── competitor-*   ├── outreach       └── user-research        │
│  └── 10 Celavii API                     └── daily-brief                              │
│                                                                                      │
│  SUPPORT (5)         SEARCH (3)         LEGAL (6)          FINANCE (6)              │
│  ├── ticket-triage   ├── knowledge-*    ├── contract-*     ├── audit-*              │
│  ├── escalation      ├── search-*       ├── compliance     ├── reconciliation       │
│  └── kb-mgmt         └── source-mgmt    └── risk-assess    └── forecasting          │
│                                                                                      │
│  DATA (7)            MEDIA (5)          BLOGGER (15)       QUALITY (1)              │
│  ├── sql-queries     ├── image-prompt   ├── blog-*         └── quality-critic       │
│  ├── visualization   ├── video-prompt   ├── blog-strategy                           │
│  └── dashboards      └── creative-dir   └── blog-calendar  AUDITOR (1)              │
│                                                             └── workspace-audit      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Security & Sandbox Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY BOUNDARIES                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

     ┌───────────────────────────────────────────────────────────────────────────┐
     │                         UNSANDBOXED (admin-001)                            │
     │                                                                            │
     │   • Full process.env access (inherits gateway env)                        │
     │   • ~/.openclaw/.env visible (API keys)                                   │
     │   • ~/.config/gh/, ~/.local/share/com.vercel.cli/ accessible             │
     │   • exec.mode: "full" (unsandboxed)                                       │
     │   • Can deploy, create repos, full CLI access                             │
     └───────────────────────────────────────────────────────────────────────────┘

     ┌───────────────────────────────────────────────────────────────────────────┐
     │                        SANDBOXED (member/guest)                            │
     │                                                                            │
     │   ┌─────────────────────────────────────────────────────────────────────┐ │
     │   │                      DOCKER CONTAINER                                │ │
     │   │                                                                      │ │
     │   │   Image: openclaw-sandbox-deploy:latest (members)                   │ │
     │   │          openclaw-sandbox:bookworm-slim (guests)                    │ │
     │   │                                                                      │ │
     │   │   Network: bridge (members) / none (guests)                         │ │
     │   │                                                                      │ │
     │   │   Env: Only explicitly injected via sandbox.docker.env              │ │
     │   │        ❌ ~/.openclaw/.env NOT visible                               │ │
     │   │        ❌ ~/.config/, ~/.local/ NOT mounted                          │ │
     │   │                                                                      │ │
     │   │   Binds: Per-agent workspace only                                   │ │
     │   │          ❌ Cross-workspace access blocked                           │ │
     │   │                                                                      │ │
     │   │   readOnlyRoot: true (system-level writes blocked)                  │ │
     │   │   user: 1000:1000 (non-root)                                        │ │
     │   └─────────────────────────────────────────────────────────────────────┘ │
     └───────────────────────────────────────────────────────────────────────────┘

     ┌───────────────────────────────────────────────────────────────────────────┐
     │                          TOKEN ACCESS TIERS                                │
     │                                                                            │
     │   FULL (admin)    → GitHub Keychain + Vercel CLI + Netlify + All APIs    │
     │   CREATOR (member)→ Shared PAT (injected) + Per-agent Vercel token       │
     │   VIEWER (guest)  → None (research via gateway tools only)               │
     │   AUTOMATED (svc) → Shared PAT + Per-agent Vercel (cron/scheduled)       │
     └───────────────────────────────────────────────────────────────────────────┘
```

---

## Memory System

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                MEMORY ARCHITECTURE                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

     ~/dev/workspace/                      ~/.openclaw/memory/
     ├── MEMORY.md (long-term facts)         ├── main.sqlite (coordinator)
     └── memory/                             ├── marketing.sqlite
         ├── 2026-02-05.md                   ├── seo.sqlite
         ├── 2026-02-06.md                   ├── sales.sqlite
         └── ...                             ├── legal.sqlite
                                             ├── finance.sqlite
              WRITE PATH                     ├── data.sqlite
                  │                          ├── media-content.sqlite
                  ▼                          ├── quality-critic.sqlite
         ┌───────────────┐                   ├── dev-coder.sqlite
         │ Agent writes  │                   ├── prod-coder.sqlite
         │ markdown file │                   ├── planner.sqlite
         └───────┬───────┘                   ├── grunt.sqlite
                 │                           ├── workspace-auditor.sqlite
                 ▼                           ├── product.sqlite
         ┌───────────────┐                   ├── support.sqlite
         │ openclaw      │                   └── search.sqlite
         │ memory index  │
         └───────┬───────┘
                 │
         ┌───────┴───────┐
         │   CHUNK +     │
         │   EMBED +     │
         │   STORE       │
         └───────────────┘

              READ PATH
                  │
         ┌───────┴───────┐
         │ Semantic      │
         │ Search        │──────► Relevant chunks injected
         │ (hybrid:      │        into agent context
         │  vector+BM25) │
         └───────────────┘
```

---

## Model Fallback Chain

```
                    REQUEST
                       │
                       ▼
              ┌─────────────────┐
              │  Try Flash      │──── Success ────► USE FLASH
              │  (main model)   │
              └────────┬────────┘
                       │ Fail (rate limit, error)
                       ▼
              ┌─────────────────┐
              │  Try Gemini Pro │──── Success ────► USE PRO
              └────────┬────────┘
                       │ Fail
                       ▼
              ┌─────────────────┐
              │  Try GPT-5 Mini │──── Success ────► USE GPT-5 MINI
              └────────┬────────┘
                       │ Fail
                       ▼
              ┌─────────────────┐
              │  Try GPT-5.1    │──── Success ────► USE GPT-5.1
              └─────────────────┘
```

---

## Current System Status

| Component       | Status        | Details                           |
| --------------- | ------------- | --------------------------------- |
| **Gateway**     | ✅ Running    | Port 49152, LaunchAgent installed |
| **Skill Count** | ✅ 36 managed | Matches documentation             |
| **API Keys**    | ✅ All set    | 9 keys configured                 |
| **Memory**      | ✅ Healthy    | 14 source files, all stores clean |
| **Channels**    | ✅ Active     | Telegram, WhatsApp, WebChat       |

---

## File Locations

| Path                        | Purpose                             |
| --------------------------- | ----------------------------------- |
| `~/.openclaw/openclaw.json` | Gateway configuration               |
| `~/.openclaw/.env`          | API keys (chmod 600)                |
| `~/.openclaw/skills/`       | Symlink → `~/dev/workspace/skills/` |
| `~/.openclaw/memory/`       | SQLite memory indexes               |
| `~/dev/workspace/`          | Admin workspace                     |
| `~/dev/workspace/MEMORY.md` | Long-term memory                    |
| `~/dev/workspace/memory/`   | Daily session logs                  |
| `~/org/workspaces/`         | Per-agent workspaces                |
| `~/org/config/`             | Org config (roster, env, docker)    |

---

_Generated by `/architecture` workflow analysis_
