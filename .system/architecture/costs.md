# Cost Estimation

> Part of [System Architecture](README.md)

---

## Monthly Projection (Active Use)

| Component                       | Requests/Day | Tokens/Request | Cost/Day | Cost/Month |
| ------------------------------- | ------------ | -------------- | -------- | ---------- |
| Coordinator (Flash, medium)     | 100          | 5,000          | $0.18    | $5.25      |
| Domain agents — Flash (4)       | 30           | 5,000          | $0.05    | $1.58      |
| Domain agents — Pro (7)         | 25           | 5,000          | $0.18    | $5.25      |
| Sales (5.4-Mini, medium)        | 20           | 8,000          | TBD      | TBD        |
| Dev Coder (Flash, high)         | 15           | 10,000         | $0.05    | $1.58      |
| Prod Coder (5.2-Codex, xhigh)   | 10           | 10,000         | $0.158   | $4.73      |
| Planner (GPT-5.2, xhigh)        | 3            | 10,000         | $0.047   | $1.42      |
| Grunt (5.4-Nano, off)           | 50           | 2,000          | TBD      | TBD        |
| Heartbeat (Gemini 2.5 Flash)    | 48           | 500            | $0.003   | $0.09      |
| Quality Critic (GPT-5.2, xhigh) | 5            | 3,000          | $0.024   | $0.72      |
| **Total**                       |              |                | **TBD**  | **TBD**    |

> **Note**: GPT-5.4-Mini and GPT-5.4-Nano pricing TBD — update costs when OpenAI publishes rates. Expected: 5.4-Nano cheaper than Flash, 5.4-Mini between Flash and Pro.

---

## Cost Comparison vs Previous Architecture

| Architecture                                    | Monthly Est.   | Savings |
| ----------------------------------------------- | -------------- | ------- |
| V1 (Sonnet main + Opus planner)                 | ~$140/month    | —       |
| V2 (Flash + Sonnet domains + Haiku grunt)       | ~$31/month     | 78%     |
| V3 — Flash + Pro domains, no Anthropic domains  | ~$24/month     | 83%     |
| V4 — Flash + Pro + GPT-5.2 precision (Option A) | ~$22/month     | 84%     |
| **V5 — Flash + Pro + 5.4-Mini/Nano + GPT-5.2**  | **~$20/month** | **86%** |

---

## Per-Task Cost Estimates

| Task Type             | Agent                       | Est. Tokens | Cost   |
| --------------------- | --------------------------- | ----------- | ------ |
| Simple conversation   | Flash (medium)              | 2K          | $0.007 |
| Marketing SEO audit   | Marketing (Flash)           | 10K         | $0.035 |
| Legal contract review | Legal (Pro, medium)         | 15K         | $0.21  |
| Financial analysis    | Finance (Pro, medium)       | 10K         | $0.14  |
| Code implementation   | Prod Coder (GPT-5.4, xhigh) | 20K         | $0.35  |
| Architecture plan     | Planner (GPT-5.4, xhigh)    | 15K         | $0.26  |
| Quality review        | Critic (GPT-5.4, xhigh)     | 3K          | $0.053 |
| Sales synthesis       | Sales (5.4-Mini, medium)    | 8K          | $0.042 |
| File ops / bulk       | Grunt (5.4-Nano, off)       | 2K          | $0.003 |
