# System Values (Single Source of Truth)

> Part of [System Architecture](README.md)
> Verified by: `scripts/arch-verify.sh`

When updating architecture docs, check this file first. If a value here is stale, update it here AND grep for all occurrences across the architecture docs.

---

## Runtime Values

| Key             | Value                  | Files That Reference It | Last Verified |
| --------------- | ---------------------- | ----------------------- | ------------- |
| Gateway port    | 19400                  | README.md, channels.md  | 2026-02-09    |
| WebSocket URL   | ws://127.0.0.1:19400   | README.md, channels.md  | 2026-02-09    |
| WebChat URL     | http://127.0.0.1:19400 | README.md               | 2026-02-09    |
| Gateway version | 2026.2.12              | README.md               | 2026-02-12    |

## Skill Counts

| Key                                  | Value | Files That Reference It           | Last Verified |
| ------------------------------------ | ----- | --------------------------------- | ------------- |
| Skill count (managed top-level dirs) | 35    | skills.md (×4)                    | 2026-02-16    |
| Skill count (managed SKILL.md files) | 89    | (nested inside domain categories) | 2026-02-17    |
| Skill count (bundled repo dirs)      | 65    | skills.md, README.md              | 2026-02-16    |
| Skill count (celavii)                | 10    | skills.md                         | 2026-02-16    |
| Skill count (custom)                 | 8     | skills.md                         | 2026-02-16    |

## Agent Counts

| Key                                    | Value | Files That Reference It | Last Verified |
| -------------------------------------- | ----- | ----------------------- | ------------- |
| **Agent count (domain)**               | 12    | README.md, agents.md    | 2026-02-16    |
| **Agent count (total in agents.list)** | 17    | agents.md               | 2026-02-16    |

## Provider Distribution

| Key                               | Value         | Files That Reference It     | Last Verified |
| --------------------------------- | ------------- | --------------------------- | ------------- |
| **Google Flash agents (primary)** | 8             | agents.md, README.md        | 2026-02-16    |
| **Google Pro agents (primary)**   | 6             | agents.md, README.md        | 2026-02-16    |
| **OpenAI GPT-5.2 agents**         | 2             | agents.md (critic, planner) | 2026-02-12    |
| **OpenAI 5.2-Codex agents**       | 1             | agents.md (prod-coder)      | 2026-02-12    |
| **Anthropic agents (primary)**    | 0             | agents.md (fallback only)   | 2026-02-12    |
| **Haiku status**                  | deprecated    | agents.md, README.md        | 2026-02-12    |
| **Sonnet/Opus status**            | fallback only | agents.md, README.md        | 2026-02-12    |
| **Global thinkingDefault**        | medium        | agents.md, openclaw.json    | 2026-02-12    |
| **Global subagents.thinking**     | low           | agents.md, openclaw.json    | 2026-02-12    |

## Paths

| Key                    | Value                                            | Files That Reference It | Last Verified |
| ---------------------- | ------------------------------------------------ | ----------------------- | ------------- |
| **Managed skills dir** | ~/.openclaw/skills/ → ~/agent-workspace/skills/  | skills.md               | 2026-02-09    |
| **API keys location**  | ~/.openclaw/.env                                 | security.md, README.md  | 2026-02-09    |
| **Config file**        | ~/.openclaw/openclaw.json                        | security.md, README.md  | 2026-02-09    |
| **LaunchAgent plist**  | ~/Library/LaunchAgents/ai.openclaw.gateway.plist | (new)                   | 2026-02-09    |

## API Keys

| Key                   | Location         | Status | Last Verified |
| --------------------- | ---------------- | ------ | ------------- |
| `ANTHROPIC_API_KEY`   | ~/.openclaw/.env | Set    | 2026-02-09    |
| `OPENAI_API_KEY`      | ~/.openclaw/.env | Set    | 2026-02-09    |
| `GEMINI_API_KEY`      | ~/.openclaw/.env | Set    | 2026-02-09    |
| `CELAVII_API_KEY`     | ~/.openclaw/.env | Set    | 2026-02-09    |
| `ELEVENLABS_API_KEY`  | ~/.openclaw/.env | Set    | 2026-02-09    |
| `BRAVE_API_KEY`       | ~/.openclaw/.env | Set    | 2026-02-09    |
| `FIRECRAWL_API_KEY`   | ~/.openclaw/.env | Set    | 2026-02-09    |
| `REPLICATE_API_TOKEN` | ~/.openclaw/.env | Set    | 2026-02-16    |
| `APIFY_API_TOKEN`     | ~/.openclaw/.env | Set    | 2026-02-17    |

---

## How to Use

1. **Before any architecture update**: Run `scripts/arch-verify.sh` to detect drift
2. **When a value changes**: Update this file FIRST, then grep for stale references
3. **After updating**: Run `scripts/arch-verify.sh` again to confirm consistency
