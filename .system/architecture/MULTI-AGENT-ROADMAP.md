# Multi-Agent Organization Roadmap

> **Future Extension Document**  
> Last Updated: 2026-02-05  
> Status: Planning Phase

---

## Vision: ClawRecruit Agency

Create a "village" of specialized AI agents that mirror and augment the organization structure. Each agent has its own personality, skills, communication channels, and eventually its own identity (email, accounts).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLAWRECRUIT AGENCY                                   │
│                        (Mac Mini Gateway)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   SKIPPY    │ │    MAX      │ │   ARIA      │ │   LOGAN     │           │
│  │   (Admin)   │ │   (Dev)     │ │  (Sales)    │ │  (Support)  │           │
│  │  Telegram A │ │  Telegram B │ │   Slack     │ │   Discord   │           │
│  │  ProtonMail │ │  ProtonMail │ │  Org Gmail  │ │  Org Gmail  │           │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
│         │               │               │               │                   │
│         └───────────────┴───────┬───────┴───────────────┘                   │
│                                 ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      SHARED INFRASTRUCTURE                             │  │
│  │  • API Keys (LLM providers)                                           │  │
│  │  • Skills Library                                                      │  │
│  │  • GitHub Organization                                                 │  │
│  │  • Netlify Team                                                        │  │
│  │  • Project Repository                                                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      COLLABORATION LAYER                               │  │
│  │  • Cross-agent messaging                                              │  │
│  │  • Shared memory pools                                                │  │
│  │  • Task delegation                                                     │  │
│  │  • Knowledge base                                                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation (Current State) ✅

### Completed

- [x] Single gateway with multi-model routing
- [x] Telegram channel configured
- [x] Skills installed (whisper, sag, sherpa-onnx, github, netlify, pi, etc.)
- [x] GitHub + Netlify authenticated
- [x] Agent workspace structured

### Current Capabilities

| Capability      | Status         |
| --------------- | -------------- |
| Single agent    | ✅ Operational |
| Voice I/O       | ✅ Ready       |
| Code generation | ✅ Via Pi      |
| Deployment      | ✅ Netlify     |
| Version control | ✅ GitHub      |

---

## Phase 2: Multi-Agent Basics

### Goal

Deploy 2-3 agents with distinct personalities and channels, sharing workspace.

### Configuration Structure

```json5
{
  agents: {
    defaults: {
      workspace: "~/agent-workspace",
    },
    profiles: {
      skippy: {
        soul: "~/agent-workspace/souls/SKIPPY.md",
        channels: {
          telegram: { botToken: "TOKEN_A", allowFrom: ["ADMIN_ID"] },
        },
      },
      max: {
        soul: "~/agent-workspace/souls/MAX.md",
        channels: {
          telegram: { botToken: "TOKEN_B", allowFrom: ["ADMIN_ID", "DEV_ID"] },
        },
      },
      aria: {
        soul: "~/agent-workspace/souls/ARIA.md",
        channels: {
          slack: { token: "SLACK_TOKEN", channels: ["sales"] },
        },
      },
    },
  },
}
```

### Workspace Layout

```
~/agent-workspace/
├── souls/                    # Agent personalities
│   ├── SKIPPY.md            # Admin/personal assistant
│   ├── MAX.md               # Developer
│   ├── ARIA.md              # Sales/BD
│   └── LOGAN.md             # Support
├── skills/                   # Shared skills
├── projects/                 # Shared project space
├── memory/                   # Shared notes (optional)
└── shared/                   # Cross-agent resources
    ├── knowledge-base/      # Company docs
    ├── templates/           # Shared templates
    └── assets/              # Brand assets
```

### Tasks

- [ ] Create multiple SOUL.md files for distinct personas
- [ ] Create additional Telegram bots via @BotFather
- [ ] Configure agent profiles in openclaw.json
- [ ] Test multi-agent routing
- [ ] Document agent personalities

---

## Phase 3: Cross-Agent Collaboration

### Goal

Enable agents to communicate, delegate tasks, and share context.

### Collaboration Mechanisms

#### 1. Direct Messaging (Agent-to-Agent)

```
Skippy: "Max, can you review PR #42?"
         ↓
Gateway routes to Max's session
         ↓
Max: Reviews and responds
         ↓
Response routed back to Skippy
```

**Implementation:** Use `sessions_spawn` with `agentId` parameter.

```json5
{
  subagents: {
    allowAgents: ["*"], // Allow cross-agent spawning
  },
}
```

#### 2. Shared Memory Pools

| Memory Type   | Scope        | Use Case                    |
| ------------- | ------------ | --------------------------- |
| Agent-private | Single agent | Personal notes, preferences |
| Team-shared   | Agent group  | Project context, decisions  |
| Org-wide      | All agents   | Company policies, knowledge |

**Implementation Options:**

- Shared `extraPaths` in memorySearch
- QMD backend with shared collections
- Dedicated knowledge base folder

```json5
agents: {
  defaults: {
    memorySearch: {
      extraPaths: [
        "~/agent-workspace/shared/knowledge-base"
      ]
    }
  }
}
```

#### 3. Task Delegation Protocol

```
User → Skippy: "Prepare client proposal"
         ↓
Skippy: Analyzes task, identifies sub-tasks
         ↓
Skippy → Aria: "Research client background"
Skippy → Max: "Prepare technical architecture"
         ↓
Results collected
         ↓
Skippy: Synthesizes final proposal
```

### Tasks

- [ ] Enable cross-agent spawning (`subagents.allowAgents`)
- [ ] Create shared knowledge base structure
- [ ] Define delegation protocols in SOUL files
- [ ] Test agent-to-agent communication
- [ ] Document collaboration patterns

---

## Phase 4: Agent Identity & External Accounts

### Goal

Each agent has its own external identity for independent operations.

### Per-Agent Accounts

| Agent  | Email                 | GitHub             | Calendar   |
| ------ | --------------------- | ------------------ | ---------- |
| Skippy | skippy@clawrecruit.ai | clawrecruit-skippy | Shared     |
| Max    | max@clawrecruit.ai    | clawrecruit-max    | Dev team   |
| Aria   | aria@clawrecruit.ai   | —                  | Sales team |
| Logan  | logan@clawrecruit.ai  | —                  | Support    |

### Email Integration Options

| Provider             | Method              | Notes            |
| -------------------- | ------------------- | ---------------- |
| **ProtonMail**       | IMAP/SMTP or Bridge | Privacy-focused  |
| **Google Workspace** | Gmail API           | Full integration |
| **Microsoft 365**    | Graph API           | Enterprise       |
| **Custom domain**    | Any provider        | Branded emails   |

### Implementation Approach

```json5
agents: {
  profiles: {
    skippy: {
      email: {
        provider: "protonmail",
        address: "skippy@clawrecruit.ai",
        // Credentials via secrets manager
      }
    }
  }
}
```

### Skills to Add

- [ ] Email skill (send/receive/search)
- [ ] Calendar skill (schedule/check availability)
- [ ] Contact management skill
- [ ] Document signing skill (DocuSign/similar)

### Tasks

- [ ] Set up email accounts for agents
- [ ] Integrate email skill
- [ ] Configure per-agent credentials securely
- [ ] Test autonomous email operations
- [ ] Define email policies (approval workflows)

---

## Phase 5: Organizational Intelligence

### Goal

Agents learn from each other and maintain organizational memory.

### Knowledge Graph

```
┌─────────────────────────────────────────────────────────────┐
│                   ORGANIZATIONAL KNOWLEDGE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  POLICIES   │    │  DECISIONS  │    │  LEARNINGS  │     │
│  │             │    │             │    │             │     │
│  │ • Brand     │◀──▶│ • Why X?    │◀──▶│ • What      │     │
│  │ • Security  │    │ • Trade-offs│    │   worked    │     │
│  │ • Workflow  │    │ • Context   │    │ • Mistakes  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         ▲                  ▲                  ▲             │
│         └──────────────────┴──────────────────┘             │
│                           │                                  │
│                    All agents read/write                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Shared Context Types

| Type        | Updates         | Access     |
| ----------- | --------------- | ---------- |
| Policies    | Admin only      | All agents |
| Decisions   | Any agent       | All agents |
| Learnings   | Any agent       | All agents |
| Client data | Relevant agents | Role-based |

### Implementation

- QMD backend with multiple collections
- Periodic sync between agents
- Decision logging to shared memory
- Learning capture hooks

---

## Phase 6: Advanced Orchestration

### Goal

Sophisticated multi-agent workflows with human oversight.

### Workflow Patterns

#### 1. Pipeline (Sequential)

```
Request → Agent A → Agent B → Agent C → Output
```

#### 2. Fan-out (Parallel)

```
                ┌→ Agent A ─┐
Request ────────┼→ Agent B ─┼──→ Merge → Output
                └→ Agent C ─┘
```

#### 3. Supervisor (Hierarchical)

```
                    ┌─────────────┐
                    │  Supervisor │
                    │   (Skippy)  │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      ┌─────────┐    ┌─────────┐    ┌─────────┐
      │  Worker │    │  Worker │    │  Worker │
      │  (Max)  │    │ (Aria)  │    │ (Logan) │
      └─────────┘    └─────────┘    └─────────┘
```

### Human-in-the-Loop

| Action                 | Requires Approval |
| ---------------------- | ----------------- |
| Send external email    | ✅ Yes            |
| Create GitHub PR       | ❌ No             |
| Deploy to production   | ✅ Yes            |
| Spend > $100           | ✅ Yes            |
| Internal communication | ❌ No             |

---

## Security Considerations

### Permissions Matrix

| Agent  | File Access  | Email   | Deploy  | GitHub | Purchases |
| ------ | ------------ | ------- | ------- | ------ | --------- |
| Skippy | Full         | Full    | Full    | Full   | Full      |
| Max    | Projects     | Limited | Staging | Full   | None      |
| Aria   | Sales docs   | Full    | None    | None   | Limited   |
| Logan  | Support docs | Limited | None    | None   | None      |

### Audit Trail

- All agent actions logged
- Cross-agent communications tracked
- External interactions recorded
- Periodic review by admin

### Credential Management

- Secrets stored in secure vault (not in config)
- Per-agent credential isolation
- Rotation policies
- Revocation procedures

---

## Resource Requirements

### Current (Single Agent)

| Resource  | Usage           |
| --------- | --------------- |
| RAM       | ~200MB          |
| CPU       | Low             |
| Storage   | ~500MB          |
| API costs | ~$100-150/month |

### Projected (4 Agents)

| Resource  | Usage           |
| --------- | --------------- |
| RAM       | ~600MB          |
| CPU       | Moderate        |
| Storage   | ~2GB            |
| API costs | ~$300-500/month |

---

## Migration Path

### From Current State

1. **Phase 2:** Add agent profiles (low risk)
2. **Phase 3:** Enable collaboration (medium complexity)
3. **Phase 4:** Add external accounts (requires setup)
4. **Phase 5:** Build knowledge graph (ongoing)
5. **Phase 6:** Advanced orchestration (future)

### Rollback Strategy

Each phase can be rolled back by reverting config changes. Agent profiles are additive—removing them doesn't break existing functionality.

---

## Open Questions

1. **Identity verification:** How do external parties verify they're talking to the right agent?
2. **Liability:** Who is responsible for agent actions?
3. **Data residency:** Where should sensitive data live?
4. **Rate limits:** How to handle API rate limits across multiple agents?
5. **Cost allocation:** How to track costs per agent?

---

## References

- [OpenClaw Multi-Agent Docs](/concepts/multi-agent) (when available)
- [LangGraph Agent Memory](https://docs.langchain.com/oss/python/langgraph/memory)
- [arXiv 2512.13564 - Memory in the Age of AI Agents](https://arxiv.org/abs/2512.13564)
- Current architecture: `.system/architecture/README.md`

---

## Version History

| Date       | Change                  |
| ---------- | ----------------------- |
| 2026-02-05 | Initial roadmap created |

---

**Document maintained by:** Admin  
**Status:** Planning  
**Location:** `.system/architecture/MULTI-AGENT-ROADMAP.md`
