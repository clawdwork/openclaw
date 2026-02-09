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
| Gateway version | 2026.2.3               | README.md               | 2026-02-09    |

## Skill Counts

| Key                                  | Value | Files That Reference It           | Last Verified |
| ------------------------------------ | ----- | --------------------------------- | ------------- |
| Skill count (managed top-level dirs) | 20    | skills.md (×4)                    | 2026-02-09    |
| Skill count (managed SKILL.md files) | 57    | (nested inside domain categories) | 2026-02-09    |
| Skill count (bundled repo dirs)      | 60    | skills.md, README.md              | 2026-02-09    |
| Skill count (celavii)                | 7     | skills.md                         | 2026-02-09    |
| Skill count (custom)                 | 5     | skills.md                         | 2026-02-07    |

## Agent Counts

| Key                                    | Value | Files That Reference It | Last Verified |
| -------------------------------------- | ----- | ----------------------- | ------------- |
| **Agent count (domain)**               | 8     | README.md, agents.md    | 2026-02-07    |
| **Agent count (total in agents.list)** | 13    | agents.md               | 2026-02-07    |

## Paths

| Key                    | Value                                            | Files That Reference It | Last Verified |
| ---------------------- | ------------------------------------------------ | ----------------------- | ------------- |
| **Managed skills dir** | ~/.openclaw/skills/ → ~/agent-workspace/skills/  | skills.md               | 2026-02-09    |
| **API keys location**  | ~/.openclaw/.env                                 | security.md, README.md  | 2026-02-09    |
| **Config file**        | ~/.openclaw/openclaw.json                        | security.md, README.md  | 2026-02-09    |
| **LaunchAgent plist**  | ~/Library/LaunchAgents/ai.openclaw.gateway.plist | (new)                   | 2026-02-09    |

## API Keys

| Key                  | Location         | Status | Last Verified |
| -------------------- | ---------------- | ------ | ------------- |
| `ANTHROPIC_API_KEY`  | ~/.openclaw/.env | Set    | 2026-02-09    |
| `OPENAI_API_KEY`     | ~/.openclaw/.env | Set    | 2026-02-09    |
| `GEMINI_API_KEY`     | ~/.openclaw/.env | Set    | 2026-02-09    |
| `CELAVII_API_KEY`    | ~/.openclaw/.env | Set    | 2026-02-09    |
| `ELEVENLABS_API_KEY` | ~/.openclaw/.env | Set    | 2026-02-09    |
| `BRAVE_API_KEY`      | ~/.openclaw/.env | Set    | 2026-02-09    |
| `FIRECRAWL_API_KEY`  | ~/.openclaw/.env | Set    | 2026-02-09    |

---

## How to Use

1. **Before any architecture update**: Run `scripts/arch-verify.sh` to detect drift
2. **When a value changes**: Update this file FIRST, then grep for stale references
3. **After updating**: Run `scripts/arch-verify.sh` again to confirm consistency
