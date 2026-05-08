# Cost Estimation

> Part of [System Architecture](README.md)

---

## Per-Agent Pricing (auto-synced from openclaw.json + scripts/sync/sync_agents.py PRICING)

<!-- AUTO-GENERATED:cost-table START -->

| Agent               | Model             | Input $/1M | Output $/1M |
| ------------------- | ----------------- | ---------- | ----------- |
| `main`              | DeepSeek V4 Pro   | $0.435     | $0.870      |
| `marketing`         | Gemini 3 Flash    | $0.500     | $3.000      |
| `seo`               | DeepSeek V4 Pro   | $0.435     | $0.870      |
| `blogger`           | Gemini 3.1 Pro    | $2.000     | $12.000     |
| `social-research`   | DeepSeek V4 Pro   | $0.435     | $0.870      |
| `social-writer`     | Gemini 3.1 Pro    | $2.000     | $12.000     |
| `sales`             | GPT-5.4-Mini      | TBD        | TBD         |
| `product`           | Gemini 3 Flash    | $0.500     | $3.000      |
| `support`           | Gemini 3 Flash    | $0.500     | $3.000      |
| `search`            | Gemini 3 Flash    | $0.500     | $3.000      |
| `legal`             | Gemini 3.1 Pro    | $2.000     | $12.000     |
| `finance`           | Gemini 3.1 Pro    | $2.000     | $12.000     |
| `data`              | Gemini 3.1 Pro    | $2.000     | $12.000     |
| `media-content`     | Gemini 3.1 Pro    | $2.000     | $12.000     |
| `quality-critic`    | DeepSeek V4 Pro   | $0.435     | $0.870      |
| `dev-coder`         | DeepSeek V4 Flash | $0.140     | $0.280      |
| `prod-coder`        | DeepSeek V4 Pro   | $0.435     | $0.870      |
| `planner`           | DeepSeek V4 Pro   | $0.435     | $0.870      |
| `grunt`             | GPT-5.4-Nano      | TBD        | TBD         |
| `workspace-auditor` | Gemini 3.1 Pro    | $2.000     | $12.000     |

<!-- AUTO-GENERATED:cost-table END -->

> Edit pricing in `scripts/sync/sync_agents.py` PRICING dict. Edit agent assignments in `~/.openclaw/openclaw.json`. Then run `scripts/sync/sync_agents.py`.

---

## Monthly Projection (Active Use)

| Component                                     | Requests/Day | Tokens/Request | Cost/Day | Cost/Month                            |
| --------------------------------------------- | ------------ | -------------- | -------- | ------------------------------------- |
| Coordinator (DeepSeek V4 Pro, medium)         | 100          | 5,000          | $0.070   | $2.10                                 |
| SEO (DeepSeek V4 Pro, medium)                 | 10           | 8,000          | $0.042   | $1.25                                 |
| Blogger (Pro, medium)                         | 5            | 8,000          | $0.080   | $2.40                                 |
| **Social Research (DeepSeek V4 Pro, medium)** | 5            | 8,000          | $0.021   | **$0.62**                             |
| **Social Writer (Pro, medium)**               | 5            | 8,000          | $0.080   | **$2.40**                             |
| Domain agents — Flash (4)                     | 30           | 5,000          | $0.05    | $1.58                                 |
| Domain agents — Pro (5)                       | 25           | 5,000          | $0.18    | $5.25                                 |
| Sales (5.4-Mini, low)                         | 5            | 5,000          | TBD      | TBD                                   |
| Dev Coder (DeepSeek V4 Flash, medium)         | 15           | 10,000         | $0.025   | $0.76                                 |
| Prod Coder (DeepSeek V4 Pro, medium)          | 10           | 10,000         | $0.064   | $1.92                                 |
| Planner (DeepSeek V4 Pro, medium)             | 3            | 10,000         | $0.019   | $0.58                                 |
| Quality Critic (DeepSeek V4 Pro, high)        | 5            | 3,000          | $0.006   | $0.18                                 |
| Grunt (5.4-Nano, off)                         | 50           | 2,000          | TBD      | TBD                                   |
| Heartbeat (Gemini 2.5 Flash)                  | 48           | 500            | $0.003   | $0.09                                 |
| **Total (V7)**                                |              |                |          | **~$19.13** (excl. Sales + Grunt TBD) |

> **Note**: GPT-5.4-Mini and GPT-5.4-Nano pricing TBD — update costs when OpenAI publishes rates. Expected: 5.4-Nano cheaper than Flash, 5.4-Mini between Flash and Pro.

---

## Cost Comparison vs Previous Architecture

| Architecture                                                                                               | Monthly Est.     | Savings |
| ---------------------------------------------------------------------------------------------------------- | ---------------- | ------- |
| V1 (Sonnet main + Opus planner)                                                                            | ~$140/month      | —       |
| V2 (Flash + Sonnet domains + Haiku grunt)                                                                  | ~$31/month       | 78%     |
| V3 — Flash + Pro domains, no Anthropic domains                                                             | ~$24/month       | 83%     |
| V4 — Flash + Pro + GPT-5.2 precision (Option A)                                                            | ~$22/month       | 84%     |
| V5 — Flash + Pro + 5.4-Mini/Nano + GPT-5.2                                                                 | ~$20/month       | 86%     |
| V6 — OpenRouter reasoning core (planned, never shipped)                                                    | ~$29/month (est) | —       |
| V7 (initial doc, 2026-05-04, never reflected live state)                                                   | ~$32/month       | 77%     |
| **V7 (corrected) — Coord/SEO/Critic/Prod-Coder/Planner on DeepSeek V4 Pro; +Social Research/Writer split** | **~$19/month**   | **86%** |

---

## Per-Task Cost Estimates

| Task Type             | Agent                                 | Est. Tokens | Cost    |
| --------------------- | ------------------------------------- | ----------- | ------- |
| Simple conversation   | Coordinator (DeepSeek V4 Pro, medium) | 2K          | $0.0014 |
| Marketing SEO audit   | Marketing (Flash)                     | 10K         | $0.035  |
| Legal contract review | Legal (Pro, medium)                   | 15K         | $0.21   |
| Financial analysis    | Finance (Pro, medium)                 | 10K         | $0.14   |
| Code implementation   | Prod Coder (DeepSeek V4 Pro, medium)  | 20K         | $0.022  |
| Architecture plan     | Planner (DeepSeek V4 Pro, medium)     | 15K         | $0.016  |
| Quality review        | Critic (DeepSeek V4 Pro, high)        | 3K          | $0.003  |
| Sales synthesis       | Sales (5.4-Mini, medium)              | 8K          | $0.042  |
| File ops / bulk       | Grunt (5.4-Nano, off)                 | 2K          | $0.003  |
