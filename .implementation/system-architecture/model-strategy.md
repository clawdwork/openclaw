# Model Strategy & Provider Analysis

> Part of [System Architecture](README.md)
> Last updated: 2026-02-12

---

## Current Implementation: Option A — "Google Backbone + GPT-5.2 Precision"

Google Gemini 3's 1M context as backbone for all high-volume agents. GPT-5.2/Codex for quality-critical agents where xhigh reasoning matters. Zero Anthropic primary agents.

---

## Model Reference (Active Models Only)

| Model              | Provider | Input/1M | Output/1M | Cached In/1M | Context | Reasoning                        | Released |
| ------------------ | -------- | -------- | --------- | ------------ | ------- | -------------------------------- | -------- |
| Gemini 3 Flash     | Google   | $0.50    | $3.00     | —            | **1M**  | Configurable (off→high)          | 2026     |
| Gemini 3 Pro       | Google   | $2.00    | $12.00    | —            | **1M**  | Configurable (low/high)          | 2026     |
| GPT-5 Nano         | OpenAI   | $0.05    | $0.40     | —            | 400K    | —                                | Aug 2025 |
| GPT-5 Mini         | OpenAI   | $0.25    | $2.00     | —            | 400K    | —                                | Aug 2025 |
| GPT-5.1            | OpenAI   | $1.25    | $10.00    | $0.125       | 400K    | —                                | Nov 2025 |
| GPT-5.1 Codex      | OpenAI   | $1.25    | $10.00    | $0.125       | 400K    | Code-optimized                   | Nov 2025 |
| GPT-5.1 Codex Mini | OpenAI   | $0.25    | $2.00     | —            | 400K    | Code-optimized, cheap            | Nov 2025 |
| GPT-5.1 Codex Max  | OpenAI   | $1.25    | $10.00    | $0.125       | 400K+   | xhigh, compaction                | Dec 2025 |
| **GPT-5.2**        | OpenAI   | $1.75    | $14.00    | **$0.175**   | 400K    | **xhigh**, SOTA reasoning        | Dec 2025 |
| **GPT-5.2 Codex**  | OpenAI   | $1.75    | $14.00    | **$0.175**   | 400K+   | **xhigh**, compaction, SOTA code | Jan 2026 |

### Deprecated / Not Used

| Model                       | Reason                                                    |
| --------------------------- | --------------------------------------------------------- |
| Anthropic Claude Haiku 4.5  | Deprecated — replaced by Flash (thinking off)             |
| Anthropic Claude Sonnet 4.5 | Demoted to fallback only — too expensive for primary      |
| Anthropic Claude Opus 4.6   | Removed as primary — replaced by GPT-5.2 ($1.75 vs $5.00) |
| OpenAI GPT-4.x family       | Outdated — superseded by 5.x models                       |
| OpenAI o3 / o4-mini         | 200K context too small for agent sessions                 |

---

## GPT-5.2 Capabilities (Research Summary)

Source: [OpenAI — Introducing GPT-5.2](https://openai.com/index/introducing-gpt-5-2/) (Dec 2025)

### Benchmarks

| Benchmark                                   | GPT-5.2 Thinking | GPT-5.1 Thinking | Improvement  |
| ------------------------------------------- | ---------------- | ---------------- | ------------ |
| **GDPval** (knowledge work, 44 occupations) | 70.9%            | 38.8% (GPT-5)    | +83%         |
| **SWE-Bench Pro** (multi-language coding)   | 55.6%            | 50.8%            | +9%          |
| **SWE-Bench Verified** (Python coding)      | 80.0%            | 76.3%            | +5%          |
| **GPQA Diamond** (grad-level science)       | 92.4%            | 88.1%            | +5%          |
| **AIME 2025** (competition math)            | 100.0%           | 94.0%            | +6%          |
| **ARC-AGI-2** (abstract reasoning)          | 52.9%            | 17.6%            | **+200%**    |
| **MRCR v2** (long-context, 256K)            | ~100%            | ~85%             | Near-perfect |

### Key Features

- **xhigh reasoning effort**: Only GPT-5.2 and GPT-5.2 Pro support this level
- **30% fewer hallucinations** than GPT-5.1
- **Context compaction** via `/compact` endpoint — extends effective context beyond 400K
- **90% cached input discount**: $0.175/M for repeated context (system prompts, tools)
- **State of the art** on tool calling (98.7% on Tau2-bench Telecom)
- **Best vision model**: Cuts error rates in half on chart reasoning

### GPT-5.2 Codex (Jan 2026)

Source: [OpenAI — Introducing GPT-5.2-Codex](https://openai.com/index/introducing-gpt-5-2-codex/)

- Optimized for **agentic coding** in long-horizon tasks
- **Native context compaction** for working across multiple context windows
- Better at large **refactors, migrations, code reviews**
- State of the art on **SWE-Bench Pro** and **Terminal-Bench 2.0**
- Stronger **cybersecurity** capabilities

### GPT-5.1 Codex Max (Dec 2025)

Source: [OpenAI — GPT-5.1-Codex-Max](https://openai.com/index/gpt-5-1-codex-max/)

- First model trained to operate across **multiple context windows via compaction**
- Effectively works over **millions of tokens** in a single task
- **30% fewer thinking tokens** for equivalent performance vs GPT-5.1 Codex
- **xhigh** reasoning support
- 95% of OpenAI engineers use Codex weekly; 70% more PRs shipped

---

## Option A: "Google Backbone + GPT-5.2 Precision" (IMPLEMENTED)

### Agent Assignments

| Agent              | Primary                   | Context | Thinking  | Fallback 1         | Fallback 2    |
| ------------------ | ------------------------- | ------- | --------- | ------------------ | ------------- |
| **Coordinator**    | Flash (1M)                | 1M      | medium    | GPT-5 Mini (400K)  | GPT-5.1       |
| Marketing          | Flash (1M)                | 1M      | low       | GPT-5 Mini         | —             |
| Sales              | Flash (1M)                | 1M      | low       | GPT-5 Mini         | —             |
| Product            | Flash (1M)                | 1M      | low       | GPT-5 Mini         | —             |
| Support            | Flash (1M)                | 1M      | low       | GPT-5 Mini         | —             |
| Search             | Flash (1M)                | 1M      | low       | GPT-5 Mini         | —             |
| Legal              | Pro (1M)                  | 1M      | medium    | GPT-5.1 (400K)     | Flash         |
| Finance            | Pro (1M)                  | 1M      | medium    | GPT-5.1            | Flash         |
| Data               | Pro (1M)                  | 1M      | medium    | GPT-5.1            | Flash         |
| Media Content      | Pro (1M)                  | 1M      | low       | GPT-5.1            | —             |
| **Quality Critic** | **GPT-5.2** (400K)        | 400K    | **xhigh** | Pro (1M)           | GPT-5.1       |
| Dev Coder          | Flash (1M)                | 1M      | high      | GPT-5.1 Codex Mini | —             |
| **Prod Coder**     | **GPT-5.2 Codex** (400K+) | 400K+   | **xhigh** | Pro (1M)           | GPT-5.1 Codex |
| **Planner**        | **GPT-5.2** (400K)        | 400K    | **xhigh** | Pro (1M)           | GPT-5.1       |
| Grunt              | Flash (1M)                | 1M      | off       | GPT-5 Nano         | —             |

### Per-Agent Cost Estimate

| Agent          | Model         | Reqs/Day | Tokens/Req | Daily Total | Monthly    |
| -------------- | ------------- | -------- | ---------- | ----------- | ---------- |
| Coordinator    | Flash         | 100      | 5,000      | $0.175      | $5.25      |
| Marketing      | Flash         | 8        | 5,000      | $0.014      | $0.42      |
| Sales          | Flash         | 5        | 5,000      | $0.009      | $0.27      |
| Product        | Flash         | 5        | 5,000      | $0.009      | $0.27      |
| Support        | Flash         | 5        | 5,000      | $0.009      | $0.27      |
| Search         | Flash         | 10       | 5,000      | $0.018      | $0.54      |
| Legal          | Pro           | 5        | 5,000      | $0.035      | $1.05      |
| Finance        | Pro           | 5        | 5,000      | $0.035      | $1.05      |
| Data           | Pro           | 8        | 5,000      | $0.056      | $1.68      |
| Media Content  | Pro           | 5        | 5,000      | $0.035      | $1.05      |
| Quality Critic | GPT-5.2       | 5        | 3,000      | $0.024      | $0.72      |
| Dev Coder      | Flash         | 15       | 10,000     | $0.053      | $1.58      |
| Prod Coder     | GPT-5.2 Codex | 10       | 10,000     | $0.158      | $4.73      |
| Planner        | GPT-5.2       | 3        | 10,000     | $0.047      | $1.42      |
| Grunt          | Flash         | 50       | 2,000      | $0.035      | $1.05      |
| Heartbeat      | Flash         | 48       | 500        | $0.008      | $0.24      |
|                |               |          |            | **Total**   | **$21.59** |

### Provider Distribution

| Provider                 | Primary Agents | Monthly Cost  | % of Spend |
| ------------------------ | -------------- | ------------- | ---------- |
| **Google Flash**         | 8              | $9.89         | 46%        |
| **Google Pro**           | 4              | $4.83         | 22%        |
| **OpenAI GPT-5.2**       | 2              | $2.14         | 10%        |
| **OpenAI GPT-5.2 Codex** | 1              | $4.73         | 22%        |
| **Anthropic**            | 0              | $0.00         | 0%         |
|                          | **15**         | **$21.59/mo** |            |

---

## Option B: "GPT-5.2 Reasoning Core" (ALTERNATIVE — Not Implemented)

Documented for future reference. Uses GPT-5.2 for 7 agents (all precision + code).

### Agent Assignments

| Agent              | Primary            | Context | Thinking  | Fallback 1 | Fallback 2    |
| ------------------ | ------------------ | ------- | --------- | ---------- | ------------- |
| **Coordinator**    | Flash (1M)         | 1M      | medium    | GPT-5 Mini | GPT-5.1       |
| Marketing          | Flash (1M)         | 1M      | low       | GPT-5 Mini | —             |
| Sales              | Flash (1M)         | 1M      | low       | GPT-5 Mini | —             |
| Product            | Flash (1M)         | 1M      | low       | GPT-5 Mini | —             |
| Support            | Flash (1M)         | 1M      | low       | GPT-5 Mini | —             |
| Search             | Flash (1M)         | 1M      | low       | GPT-5 Mini | —             |
| **Legal**          | **GPT-5.2**        | 400K    | **xhigh** | Pro (1M)   | GPT-5.1       |
| **Finance**        | **GPT-5.2**        | 400K    | **xhigh** | Pro (1M)   | GPT-5.1       |
| **Data**           | **GPT-5.2**        | 400K    | **xhigh** | Pro (1M)   | GPT-5.1       |
| Media Content      | Pro (1M)           | 1M      | low       | GPT-5.1    | —             |
| **Quality Critic** | **GPT-5.2**        | 400K    | **xhigh** | Pro (1M)   | —             |
| **Dev Coder**      | **5.1 Codex Mini** | 400K    | high      | Flash (1M) | GPT-5 Mini    |
| **Prod Coder**     | **GPT-5.2 Codex**  | 400K+   | **xhigh** | Pro (1M)   | GPT-5.1 Codex |
| **Planner**        | **GPT-5.2**        | 400K    | **xhigh** | Pro (1M)   | GPT-5.1       |
| Grunt              | Flash (1M)         | 1M      | off       | GPT-5 Nano | —             |

**Monthly cost**: ~$21.47 | **OpenAI spend**: 56% | **Risk**: Medium (400K limit on 7 agents)

---

## Architecture History

| Version | Date           | Architecture                                   | Monthly Est. | Savings vs V1 |
| ------- | -------------- | ---------------------------------------------- | ------------ | ------------- |
| V1      | 2026-02        | Sonnet main + Opus planner                     | ~$140/mo     | —             |
| V2      | 2026-02        | Flash + Sonnet domains + Haiku grunt           | ~$31/mo      | 78%           |
| V3      | 2026-02-12     | Flash + Pro domains, no Anthropic domains      | ~$24/mo      | 83%           |
| **V4**  | **2026-02-12** | **Flash + Pro + GPT-5.2 precision (Option A)** | **~$22/mo**  | **84%**       |

---

## Context Window Strategy

Sessions can exceed 400K tokens. Strategy:

1. **Coordinator (Flash, 1M)**: Always safe — handles all user conversations
2. **Volume agents (Flash, 1M)**: Safe — marketing, sales, product, support, search, grunt
3. **Precision agents (Pro, 1M)**: Safe — legal, finance, data, media-content
4. **Quality agents (GPT-5.2, 400K)**: Sub-agents are ephemeral, rarely exceed 400K. If they do, fallback to Pro (1M)
5. **Code agents (GPT-5.2 Codex, 400K+)**: Context compaction extends effective window. Fallback to Pro (1M)

### Fallback Trigger

When a GPT-5.2 agent hits 400K context limit:

- OpenClaw's fallback chain auto-routes to next model
- Pro (1M) catches the overflow
- Session continues without interruption

---

## Thinking Level Strategy

### Resolution Hierarchy (3-tier cascade)

```
1. Explicit spawn param   →  sessions_spawn({ thinking: "high" })
2. Per-agent config        →  agents.list[].subagents.thinking
3. Global default          →  agents.defaults.subagents.thinking  (currently: "low")
```

### Thinking Levels by Agent

| Thinking Level | Agents                                                    | Model               | Rationale                            |
| -------------- | --------------------------------------------------------- | ------------------- | ------------------------------------ |
| **xhigh**      | quality-critic, prod-coder, planner                       | GPT-5.2 / 5.2 Codex | Maximum reasoning for critical tasks |
| **high**       | dev-coder                                                 | Flash               | Code quality needs deep thinking     |
| **medium**     | coordinator, legal, finance, data                         | Flash / Pro         | Balanced reasoning + speed           |
| **low**        | marketing, sales, product, support, search, media-content | Flash / Pro         | Volume, speed priority               |
| **off**        | grunt                                                     | Flash               | File ops don't need reasoning        |

### Gemini Thinking Level Mapping

| OpenClaw Level | Gemini 3 Flash | Gemini 3 Pro |
| -------------- | -------------- | ------------ |
| `off`          | No thinking    | No thinking  |
| `minimal`      | MINIMAL        | ❌ → LOW     |
| `low`          | LOW            | LOW          |
| `medium`       | MEDIUM         | ❌ → HIGH    |
| `high`         | HIGH           | HIGH         |

> Pro only supports LOW and HIGH. The runner auto-retries with a supported level.

### OpenAI xhigh Support

Only `openai/gpt-5.2` and `openai/gpt-5.2-pro` support `xhigh` reasoning effort. The SDK maps OpenClaw's `xhigh` → OpenAI's `reasoning_effort: "xhigh"`.
