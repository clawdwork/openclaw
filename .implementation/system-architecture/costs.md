# Cost Estimation

> Part of [System Architecture](README.md)

---

## Monthly Projection (Active Use)

| Component                       | Requests/Day | Tokens/Request | Cost/Day  | Cost/Month |
| ------------------------------- | ------------ | -------------- | --------- | ---------- |
| Coordinator (Flash, medium)     | 100          | 5,000          | $0.18     | $5.25      |
| Domain agents — Flash (7)       | 40           | 5,000          | $0.07     | $2.10      |
| Domain agents — Pro (6)         | 25           | 5,000          | $0.18     | $5.25      |
| Dev Coder (Flash, high)         | 15           | 10,000         | $0.05     | $1.58      |
| Prod Coder (5.2-Codex, xhigh)   | 10           | 10,000         | $0.158    | $4.73      |
| Planner (GPT-5.2, xhigh)        | 3            | 10,000         | $0.047    | $1.42      |
| Grunt (Flash, off)              | 50           | 2,000          | $0.01     | $0.18      |
| Heartbeat (Gemini 2.5 Flash)    | 48           | 500            | $0.003    | $0.09      |
| Quality Critic (GPT-5.2, xhigh) | 5            | 3,000          | $0.024    | $0.72      |
| **Total**                       |              |                | **$0.72** | **$21.59** |

---

## Cost Comparison vs Previous Architecture

| Architecture                                        | Monthly Est.   | Savings |
| --------------------------------------------------- | -------------- | ------- |
| V1 (Sonnet main + Opus planner)                     | ~$140/month    | —       |
| V2 (Flash + Sonnet domains + Haiku grunt)           | ~$31/month     | 78%     |
| V3 — Flash + Pro domains, no Anthropic domains      | ~$24/month     | 83%     |
| **V4 — Flash + Pro + GPT-5.2 precision (Option A)** | **~$22/month** | **84%** |

---

## Per-Task Cost Estimates

| Task Type             | Agent                         | Est. Tokens | Cost   |
| --------------------- | ----------------------------- | ----------- | ------ |
| Simple conversation   | Flash (medium)                | 2K          | $0.007 |
| Marketing SEO audit   | Marketing (Flash)             | 10K         | $0.035 |
| Legal contract review | Legal (Pro, medium)           | 15K         | $0.21  |
| Financial analysis    | Finance (Pro, medium)         | 10K         | $0.14  |
| Code implementation   | Prod Coder (5.2-Codex, xhigh) | 20K         | $0.32  |
| Architecture plan     | GPT-5.2 (planner, xhigh)      | 15K         | $0.24  |
| Quality review        | Critic (GPT-5.2, xhigh)       | 3K          | $0.045 |
| File ops / bulk       | Grunt (Flash, off)            | 2K          | $0.007 |
