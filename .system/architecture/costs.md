# Cost Estimation

> Part of [System Architecture](README.md)

---

## Monthly Projection (Active Use)

| Component                                     | Requests/Day | Tokens/Request | Cost/Day | Cost/Month                            |
| --------------------------------------------- | ------------ | -------------- | -------- | ------------------------------------- |
| Coordinator (DeepSeek V4 Pro, high)           | 100          | 5,000          | $0.070   | $2.10                                 |
| SEO (DeepSeek V4 Pro, medium)                 | 10           | 8,000          | $0.042   | $1.25                                 |
| Blogger (Pro, high)                           | 5            | 8,000          | $0.080   | $2.40                                 |
| **Social Research (DeepSeek V4 Pro, medium)** | 5            | 8,000          | $0.021   | **$0.62**                             |
| **Social Writer (Pro, high)**                 | 5            | 8,000          | $0.080   | **$2.40**                             |
| Domain agents — Flash (4)                     | 30           | 5,000          | $0.05    | $1.58                                 |
| Domain agents — Pro (5)                       | 25           | 5,000          | $0.18    | $5.25                                 |
| Sales (5.4-Mini, low)                         | 5            | 5,000          | TBD      | TBD                                   |
| Dev Coder (DeepSeek V4 Flash, high)           | 15           | 10,000         | $0.025   | $0.76                                 |
| Prod Coder (DeepSeek V4 Pro, high)            | 10           | 10,000         | $0.064   | $1.92                                 |
| Planner (DeepSeek V4 Pro, high)               | 3            | 10,000         | $0.019   | $0.58                                 |
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

| Task Type             | Agent                               | Est. Tokens | Cost    |
| --------------------- | ----------------------------------- | ----------- | ------- |
| Simple conversation   | Coordinator (DeepSeek V4 Pro, high) | 2K          | $0.0014 |
| Marketing SEO audit   | Marketing (Flash)                   | 10K         | $0.035  |
| Legal contract review | Legal (Pro, medium)                 | 15K         | $0.21   |
| Financial analysis    | Finance (Pro, medium)               | 10K         | $0.14   |
| Code implementation   | Prod Coder (DeepSeek V4 Pro, high)  | 20K         | $0.022  |
| Architecture plan     | Planner (DeepSeek V4 Pro, high)     | 15K         | $0.016  |
| Quality review        | Critic (DeepSeek V4 Pro, high)      | 3K          | $0.003  |
| Sales synthesis       | Sales (5.4-Mini, medium)            | 8K          | $0.042  |
| File ops / bulk       | Grunt (5.4-Nano, off)               | 2K          | $0.003  |
