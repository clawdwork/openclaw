# Model Strategy & Provider Analysis

> Part of [System Architecture](README.md)
> Last updated: 2026-05-04

---

## Current Implementation: V7 — "DeepSeek Reasoning Core + Gemini Backbone"

As of 2026-05-04 the architecture deploys **DeepSeek V4 Pro for the Coordinator, SEO, Quality Critic, Prod Coder, and Planner** (reasoning + 1M context, with native tool calling and structured output); **DeepSeek V4 Flash for Dev Coder** (cheap reasoning-capable codegen at 1M ctx); and **Gemini 3.1 Pro retained for Blogger** (creative voice — reasoning-trained models like DeepSeek/Kimi underperform on long-form creative writing). New as of V7: **two social agents** — `social-research` on DeepSeek V4 Pro `medium` (analytical: discover, brief, plan, drift, cannibalization, factcheck, sxo, persona, trend, competitor-scrape, aggregate, research, quality) and `social-writer` on Gemini 3.1 Pro `high` (creative: orchestrator, hooks, script, shotlist, repurpose, celavii-social). The cross-model boundary enforces `skills/social-orchestrator/references/social-constitution.md` Article 7 structurally. Volume agents stay on Gemini 3 Flash (marketing, product, support, search). Precision domains (Legal, Finance, Data, Media Content, Workspace Auditor) stay on Gemini 3.1 Pro. Zero Anthropic primary agents.

Gateway port migrated **49152 → 9173** on 2026-05-04. The "first ephemeral slot" choice for 49152 collided with macOS handing the same port to Windsurf's plugin host whenever the gateway briefly dropped its bind during restart. 9173 is in the registered range and stable.

### Active OpenRouter aliases

| Alias               | Slug                         | Used by                                                                      | Thinking     |
| ------------------- | ---------------------------- | ---------------------------------------------------------------------------- | ------------ |
| `DeepSeek-V4-Pro`   | `deepseek/deepseek-v4-pro`   | Coordinator, SEO                                                             | high, medium |
| `DeepSeek-V4-Flash` | `deepseek/deepseek-v4-flash` | Dev Coder                                                                    | high         |
| `DeepSeek-V3.2`     | `deepseek/deepseek-v3.2`     | (benchmark baseline)                                                         | none         |
| `Kimi-K2.6`         | `moonshotai/kimi-k2.6`       | (benchmark candidate; demoted from primary — degrades on long-form creative) | —            |
| `MiniMax-M2.7`      | `minimax/minimax-m2.7`       | (benchmark candidate)                                                        | configurable |

### V6 (correction — was actually shipped)

V6 — "OpenRouter Reasoning Core" (Kimi K2.6 on Coordinator/SEO/Blogger; DeepSeek V4 Pro on Critic/Prod-Coder/Planner) — was deployed 2026-04-25 to `~/.openclaw/openclaw.json` (the live config). It was NOT mirrored to `~/dev/config/openclaw.json` (the stale workspace copy), creating the appearance during the V7 audit on 2026-05-04 that V6 had never shipped. **V6 did ship; the doc audit was reading the wrong file.** V7 supersedes V6 by reverting the Coordinator/SEO/Blogger assignments — Coordinator and SEO move to DeepSeek V4 Pro (cheaper than Kimi at higher reasoning depth), and Blogger reverts to Gemini 3.1 Pro for creative voice (Kimi K2-class reasoning models produce template-y prose past ~3K words). Critic/Prod-Coder/Planner stay on DeepSeek V4 Pro. The two configs were re-synced and re-symlinked on 2026-05-04 to prevent recurrence.

### Prior implementation: Option A — "Google Backbone + GPT-5.2 Precision" (deprecated 2026-04-25)

Google Gemini 3's 1M context as backbone for all high-volume agents. GPT-5.2/Codex (later GPT-5.4) for quality-critical agents. V7 keeps the Gemini backbone but replaces Coordinator/SEO/Dev-Coder with DeepSeek V4 family for cheaper reasoning at 1M context.

---

## Model Reference (Active Models Only)

| Model                 | Provider        | Input/1M | Output/1M | Cached In/1M       | Cache Write   | Context | Reasoning                                          | Released |
| --------------------- | --------------- | -------- | --------- | ------------------ | ------------- | ------- | -------------------------------------------------- | -------- |
| **Kimi K2.6**         | Moonshot via OR | $0.80    | $3.50     | $0.20 (0.20x)      | free          | 256K    | Native MoE reasoning (1T total / 32B active)       | Nov 2026 |
| **Kimi K2 Thinking**  | Moonshot via OR | (live)   | (live)    | (live)             | (live)        | 256K    | Reasoning-specialized (older K2 lineage, 1T MoE)   | Nov 2025 |
| **DeepSeek V4 Pro**   | DeepSeek via OR | $0.435   | $0.870    | $0.036 (0.08x)     | free          | **1M**  | Native reasoning + tools + structured (1.6T / 49B) | 2026     |
| **DeepSeek V4 Flash** | DeepSeek via OR | $0.140   | $0.280    | $0.028 (0.20x)     | free          | **1M**  | Native reasoning + tools + structured (284B / 13B) | 2026     |
| DeepSeek V3.2         | DeepSeek via OR | $0.252   | $0.378    | none               | none          | 128K    | none (non-reasoning)                               | 2026     |
| MiniMax M2.7          | Minimax via OR  | $0.30    | $1.20     | (cache works)      | (cache works) | 196K    | Configurable                                       | 2026     |
| Gemini 3 Flash        | Google          | $0.50    | $3.00     | ~$0.10 (0.20x est) | n/a           | **1M**  | Configurable (off→high)                            | 2026     |
| Gemini 3 Pro          | Google          | $2.00    | $12.00    | ~$0.50 (0.25x est) | n/a           | **1M**  | Configurable (low/high)                            | 2026     |
| GPT-5 Nano            | OpenAI          | $0.05    | $0.40     | —                  | —             | 400K    | —                                                  | Aug 2025 |
| GPT-5 Mini            | OpenAI          | $0.25    | $2.00     | —                  | —             | 400K    | —                                                  | Aug 2025 |
| GPT-5.1               | OpenAI          | $1.25    | $10.00    | $0.125             | —             | 400K    | —                                                  | Nov 2025 |
| GPT-5.4               | OpenAI          | $2.50    | $15.00    | $0.25              | —             | 266K    | xhigh                                              | Mar 2026 |
| GPT-5.4 Mini          | OpenAI          | TBD      | TBD       | TBD                | —             | 391K    | medium                                             | 2026     |
| GPT-5.4 Nano          | OpenAI          | TBD      | TBD       | TBD                | —             | 391K    | none                                               | 2026     |

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

## V7: "DeepSeek Reasoning Core + Gemini Backbone" (CURRENT, 2026-05-04)

### Agent Assignments

| Agent               | Primary                    | Context | Thinking   | Fallback 1 | Fallback 2 |
| ------------------- | -------------------------- | ------- | ---------- | ---------- | ---------- |
| **Coordinator**     | **DeepSeek V4 Pro** (OR)   | **1M**  | **high**   | Pro (1M)   | GPT-5.4    |
| Marketing           | Flash (1M)                 | 1M      | low        | GPT-5 Mini | —          |
| **SEO**             | **DeepSeek V4 Pro** (OR)   | **1M**  | **medium** | Pro (1M)   | Flash      |
| Blogger             | Pro (1M)                   | 1M      | high       | GPT-5.4    | Flash      |
| Sales               | 5.4-Mini                   | 391K    | low        | GPT-5 Mini | —          |
| Product             | Flash (1M)                 | 1M      | low        | GPT-5 Mini | —          |
| Support             | Flash (1M)                 | 1M      | low        | GPT-5 Mini | —          |
| Search              | Flash (1M)                 | 1M      | low        | GPT-5 Mini | —          |
| Legal               | Pro (1M)                   | 1M      | medium     | GPT-5.1    | Flash      |
| Finance             | Pro (1M)                   | 1M      | medium     | GPT-5.1    | Flash      |
| Data                | Pro (1M)                   | 1M      | medium     | GPT-5.1    | Flash      |
| Media Content       | Pro (1M)                   | 1M      | low        | GPT-5.1    | —          |
| Workspace Auditor   | Pro (1M)                   | 1M      | medium     | Flash      | —          |
| Quality Critic      | DeepSeek V4 Pro (OR)       | **1M**  | **high**   | Pro (1M)   | GPT-5.4    |
| **Dev Coder**       | **DeepSeek V4 Flash** (OR) | **1M**  | **high**   | Flash (1M) | 5.4-Mini   |
| Prod Coder          | DeepSeek V4 Pro (OR)       | **1M**  | **high**   | Pro (1M)   | GPT-5.4    |
| Planner             | DeepSeek V4 Pro (OR)       | **1M**  | **high**   | Pro (1M)   | GPT-5.4    |
| **Social Research** | **DeepSeek V4 Pro** (OR)   | **1M**  | **medium** | Pro (1M)   | Flash      |
| **Social Writer**   | **Pro**                    | **1M**  | **high**   | GPT-5.4    | Flash      |
| Grunt               | 5.4-Nano                   | 391K    | off        | GPT-5 Nano | —          |

> Quality Critic, Prod Coder, and Planner have been on DeepSeek V4 Pro `high` since V6 (deployed 2026-04-25). The 2026-05-04 doc audit incorrectly thought they were still on GPT-5.4 (audit was reading stale `~/dev/config/openclaw.json`); the live `~/.openclaw/openclaw.json` always had DeepSeek V4 Pro for these three. V7 retains the DeepSeek V4 Pro assignment.

### Per-Agent Cost Estimate (V7, no caching applied)

Tokens/req split assumed 80% input / 20% output. Heartbeat at full volume.

| Agent               | Model                 | Reqs/Day | Tokens/Req | Daily $   | Monthly $                                    |
| ------------------- | --------------------- | -------- | ---------- | --------- | -------------------------------------------- |
| **Coordinator**     | **DeepSeek V4 Pro**   | 100      | 5,000      | $0.070    | **$2.10**                                    |
| Marketing           | Flash                 | 8        | 5,000      | $0.020    | $0.59                                        |
| **SEO**             | **DeepSeek V4 Pro**   | 10       | 8,000      | $0.042    | **$1.25**                                    |
| Blogger             | Pro                   | 5        | 8,000      | $0.080    | $2.40                                        |
| Sales               | 5.4-Mini              | 5        | 5,000      | TBD       | TBD                                          |
| Product             | Flash                 | 5        | 5,000      | $0.013    | $0.38                                        |
| Support             | Flash                 | 5        | 5,000      | $0.013    | $0.38                                        |
| Search              | Flash                 | 10       | 5,000      | $0.025    | $0.75                                        |
| Legal               | Pro                   | 5        | 5,000      | $0.050    | $1.50                                        |
| Finance             | Pro                   | 5        | 5,000      | $0.050    | $1.50                                        |
| Data                | Pro                   | 8        | 5,000      | $0.080    | $2.40                                        |
| Media Content       | Pro                   | 5        | 5,000      | $0.050    | $1.50                                        |
| Workspace Auditor   | Pro                   | 1        | 8,000      | $0.016    | $0.48                                        |
| Quality Critic      | DeepSeek V4 Pro       | 5        | 3,000      | $0.0058   | $0.18                                        |
| **Dev Coder**       | **DeepSeek V4 Flash** | 15       | 10,000     | $0.025    | **$0.76**                                    |
| Prod Coder          | DeepSeek V4 Pro       | 10       | 10,000     | $0.0639   | $1.92                                        |
| Planner             | DeepSeek V4 Pro       | 3        | 10,000     | $0.0192   | $0.58                                        |
| **Social Research** | **DeepSeek V4 Pro**   | 5        | 8,000      | $0.0210   | **$0.62**                                    |
| **Social Writer**   | **Pro**               | 5        | 8,000      | $0.0800   | **$2.40**                                    |
| Grunt               | 5.4-Nano              | 50       | 2,000      | TBD       | TBD                                          |
| Heartbeat           | Gemini 2.5 Flash      | 48       | 500        | $0.003    | $0.09                                        |
|                     |                       |          |            | **Total** | **~$31.74/mo** (excluding Sales + Grunt TBD) |

V7 vs V6 (V6 was actually shipped, contrary to earlier misread): Coordinator/SEO migrate from Kimi K2.6 → DeepSeek V4 Pro (cheaper, better orchestration); Blogger reverts Kimi K2.6 → Gemini 3.1 Pro (creative voice priority); Dev Coder migrates Gemini 3 Flash → DeepSeek V4 Flash (3× cheaper with native reasoning); Critic/Prod-Coder/Planner stay on DeepSeek V4 Pro (already there since V6). Two new agents added: `social-research` (DeepSeek V4 Pro `medium`) and `social-writer` (Gemini 3.1 Pro `high`) to enforce social-constitution Article 7 cross-model boundary structurally.

### Provider Distribution (V7)

| Provider                  | Primary Agents                                                          | Est. Monthly | % of Spend |
| ------------------------- | ----------------------------------------------------------------------- | ------------ | ---------- |
| **OpenRouter (DeepSeek)** | 7 (Coord, SEO, Critic, Prod-Coder, Planner, Dev Coder, Social Research) | $7.39        | 39%        |
| **Google Flash**          | 5 (Marketing, Product, Support, Search, Heartbeat)                      | $2.19        | 7%         |
| **Google Pro**            | 6 (Blogger, Legal, Finance, Data, Media, Auditor)                       | $9.78        | 31%        |
| **OpenAI GPT-5.4-Mini**   | 1 (Sales)                                                               | TBD          | —          |
| **OpenAI GPT-5.4-Nano**   | 1 (Grunt)                                                               | TBD          | —          |
| **Anthropic**             | 0                                                                       | $0.00        | 0%         |
|                           | **19**                                                                  | **~$31.74**  |            |

### Cost notes

DeepSeek free cache-writes + 0.08× cache-read on Coordinator likely cut the live monthly bill 30–50% once warm. Total is now anchored by Pro-tier domain agents (Legal/Finance/Data/Media/Auditor at $5.25/mo) and the new Social Writer ($2.40/mo). Cost dropped substantially from V6's GPT-5.4-anchored estimate (~$32/mo) once the V6 audit was corrected and Critic/Prod-Coder/Planner were confirmed on DeepSeek V4 Pro.

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

| Version | Date           | Architecture                                                                                                                                                                                    | Monthly Est. | Savings vs V1 |
| ------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------- |
| V1      | 2026-02        | Sonnet main + Opus planner                                                                                                                                                                      | ~$140/mo     | —             |
| V2      | 2026-02        | Flash + Sonnet domains + Haiku grunt                                                                                                                                                            | ~$31/mo      | 78%           |
| V3      | 2026-02-12     | Flash + Pro domains, no Anthropic domains                                                                                                                                                       | ~$24/mo      | 83%           |
| V4      | 2026-02-12     | Flash + Pro + GPT-5.2 precision (Option A)                                                                                                                                                      | ~$22/mo      | 84%           |
| V5      | 2026-04-02     | V4 + GPT-5.4 flagship, 5.4-Mini Sales, 5.4-Nano Grunt                                                                                                                                           | ~$25/mo      | 82%           |
| V6      | 2026-04-25     | OpenRouter reasoning core — Kimi K2.6 on Coord/SEO/Blogger; DeepSeek V4 Pro on Critic/Prod-Coder/Planner. **Did ship to live config; missed by 2026-05-04 audit reading stale workspace copy.** | ~$29/mo      | 79%           |
| **V7**  | **2026-05-04** | **DeepSeek V4 Pro on Coord/SEO/Critic/Prod-Coder/Planner; V4 Flash on Dev Coder; Pro on Blogger; +`social-research` (DeepSeek V4 Pro) and `social-writer` (Pro). Port 49152 → 9173.**           | **~$19/mo**  | **86%**       |

V7 reverts V6's Blogger on Kimi (research evidence shows reasoning-trained models underperform on long-form creative writing past ~3K words → use Gemini 3.1 Pro). Coord/SEO migrate from Kimi K2.6 → DeepSeek V4 Pro (cheaper at higher reasoning depth). Critic/Prod-Coder/Planner stay on DeepSeek V4 Pro (already there since V6). Dev Coder gets DeepSeek V4 Flash for cheap reasoning-capable codegen at 1M ctx. Two new agents enforce the social-constitution Article 7 cross-model critic boundary structurally: `social-research` (analytical, DeepSeek V4 Pro `medium`) and `social-writer` (creative, Gemini 3.1 Pro `high`).

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

### Thinking Levels by Agent (V7)

| Thinking Level | Agents                                                    | Model                  | Rationale                                                                               |
| -------------- | --------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| **xhigh**      | quality-critic, prod-coder, planner                       | GPT-5.4                | Maximum reasoning depth for critique, large refactors, multi-step planning              |
| **high**       | **coordinator**                                           | **DeepSeek V4 Pro**    | Orchestration benefits from MoE reasoning; 1M context handles long sessions             |
| **high**       | blogger                                                   | Gemini 3.1 Pro         | Long-form drafting + research synthesis                                                 |
| **high**       | dev-coder                                                 | DeepSeek V4 Flash      | Cheap reasoning-capable codegen at 1M context                                           |
| **medium**     | **seo**                                                   | **DeepSeek V4 Pro**    | Research-heavy with reasoning needs; medium balances cost vs depth on routine SEO tasks |
| **medium**     | legal, finance, data, workspace-auditor                   | Gemini 3.1 Pro         | Balanced reasoning + 1M context for precision domains                                   |
| **low**        | marketing, sales, product, support, search, media-content | Flash / Pro / 5.4-Mini | Volume, speed priority                                                                  |
| **off**        | grunt                                                     | 5.4-Nano               | File ops don't need reasoning                                                           |

### DeepSeek V4 Thinking Mapping

DeepSeek V4 Pro/Flash expose native reasoning effort via OpenRouter. Levels supported: `off`, `low`, `medium`, `high`. No `xhigh` (use GPT-5.2/5.4 for that tier). DeepSeek V4 Pro `high` enables the model's MoE reasoning depth (1.6T total / 49B active params).

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

`openai/gpt-5.2`, `openai/gpt-5.2-pro`, and `openai/gpt-5.4` support `xhigh` reasoning effort. The SDK maps OpenClaw's `xhigh` → OpenAI's `reasoning_effort: "xhigh"`. In V7, three agents use it: Quality Critic, Prod Coder, Planner.

---

## Comparison: Kimi K2.6 vs Gemini 3 Flash

Why Kimi K2.6 (medium thinking) replaced Pro on SEO and Blogger but did NOT replace Flash on volume agents (Marketing, Sales, Product, Support, Search).

### Headline numbers

| Dimension             | Gemini 3 Flash               | Kimi K2.6 (medium)      | Delta                                  |
| --------------------- | ---------------------------- | ----------------------- | -------------------------------------- |
| Cost — input ($/M)    | $0.50                        | $0.80                   | **+60% (Kimi more expensive)**         |
| Cost — output ($/M)   | $3.00                        | $3.50                   | +17%                                   |
| Cache-read multiplier | ~0.20x ($0.10/M est)         | 0.20x ($0.16/M)         | ~60% more $ on cached input            |
| Cache-write           | unknown (Google-managed)     | free on Moonshot        | Kimi parity or better                  |
| Context window        | **1M**                       | 256K                    | Flash 4× larger                        |
| Reasoning             | Configurable off→high        | **Native MoE**          | Kimi qualitatively stronger            |
| Inputs                | text + image                 | text + image            | parity                                 |
| Tools / structured    | ✅ + native Google grounding | ✅                      | parity (grounding wins for web search) |
| Latency / TTFT        | ~200–400ms                   | ~800ms–2s with thinking | Flash significantly faster             |
| Active parameters     | undisclosed (small)          | 1T MoE / 32B active     | Kimi much larger                       |

### Per-call cost (5K-token request, 80/20 in:out split = 4K in / 1K out)

| Scenario         | Flash   | Kimi K2.6 | Delta             |
| ---------------- | ------- | --------- | ----------------- |
| No caching       | $0.005  | $0.0067   | Flash 34% cheaper |
| 80% cached input | $0.0034 | $0.00465  | Flash 37% cheaper |
| 95% cached input | $0.0030 | $0.0040   | Flash 33% cheaper |

**Conclusion**: Kimi K2.6 is **NOT cheaper than Flash on raw cost**. It is ~30–35% more expensive across all caching levels. The win is on intelligence-per-dollar when the task actually needs reasoning.

### Where Kimi K2.6 wins

| Workload class                                                   | Recommendation               | Why                                                                                 |
| ---------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| High-reasoning planning, multi-step orchestration                | Kimi K2.6 (or DeepSeek V4)   | Flash with `thinking: high` lacks Kimi's MoE depth                                  |
| Long-context synthesis (>256K tokens)                            | Flash or Pro                 | 256K Kimi cap is the binding constraint                                             |
| High-volume routine generation                                   | Flash                        | Cheaper, faster, sufficient quality                                                 |
| Web search + grounded answers                                    | Flash                        | Native Google grounding beats anything routed externally                            |
| Coordinator role                                                 | **Kimi K2.6 high (current)** | Routing decisions benefit from real reasoning; low volume relative to domain agents |
| Quality-critical reasoning (SEO strategy, complex Legal/Finance) | Kimi K2.6 (medium) or Pro    | Justifies cost premium with substantially better output                             |
| Volume domain agents                                             | Flash                        | 30% cost premium × volume not worth marginal quality lift                           |

### Where Kimi K2.6 vs Pro

| Dimension           | Gemini 3 Pro | Kimi K2.6 (medium) | Delta                                |
| ------------------- | ------------ | ------------------ | ------------------------------------ |
| Cost — input ($/M)  | $2.00        | $0.80              | **Kimi 60% cheaper**                 |
| Cost — output ($/M) | $12.00       | $3.50              | **Kimi 71% cheaper**                 |
| Context window      | 1M           | 256K               | Pro 4× larger                        |
| Reasoning           | Configurable | Native MoE         | Comparable; Kimi stronger at default |

**This is why SEO and Blogger were switched from Pro to Kimi K2.6 medium**: same intelligence ceiling, ~70% cheaper output, only context-window concern (256K still ample for both roles' typical sessions). Legal/Finance/Data/Media Content kept Pro because their workloads more often touch the 256K ceiling.
