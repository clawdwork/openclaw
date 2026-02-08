# Cost Estimation

> Part of [System Architecture](README.md)

---

## Monthly Projection (Active Use)

| Component                  | Requests/Day | Tokens/Request | Cost/Day  | Cost/Month |
| -------------------------- | ------------ | -------------- | --------- | ---------- |
| Coordinator (Flash)        | 100          | 5,000          | $0.18     | $5.25      |
| Domain agents — Flash (5)  | 30           | 5,000          | $0.05     | $1.58      |
| Domain agents — Sonnet (3) | 15           | 5,000          | $0.27     | $8.10      |
| Coder (Sonnet)             | 20           | 10,000         | $0.36     | $10.80     |
| Planner (Opus)             | 5            | 10,000         | $0.15     | $4.50      |
| Tool executor (Haiku)      | 50           | 2,000          | $0.01     | $0.30      |
| Heartbeat (Haiku)          | 48           | 500            | $0.006    | $0.18      |
| **Total**                  |              |                | **$1.02** | **$30.71** |

---

## Cost Comparison vs Previous Architecture

| Architecture                                    | Monthly Est.   | Savings |
| ----------------------------------------------- | -------------- | ------- |
| Previous (Sonnet main + Opus planner)           | ~$140/month    | —       |
| **Current (Flash coordinator + domain agents)** | **~$31/month** | **78%** |

---

## Per-Task Cost Estimates

| Task Type             | Agent             | Est. Tokens | Cost   |
| --------------------- | ----------------- | ----------- | ------ |
| Simple conversation   | Flash             | 2K          | $0.007 |
| Marketing SEO audit   | Marketing (Flash) | 10K         | $0.035 |
| Legal contract review | Legal (Sonnet)    | 15K         | $0.27  |
| Financial analysis    | Finance (Sonnet)  | 10K         | $0.18  |
| Code implementation   | Sonnet (coder)    | 20K         | $0.36  |
| Architecture plan     | Opus (planner)    | 15K         | $0.45  |
