# System Values (Single Source of Truth)

> Part of [System Architecture](README.md)
> Verified by: `scripts/arch-verify.sh`

When updating architecture docs, check this file first. If a value here is stale, update it here AND grep for all occurrences across the architecture docs.

---

## Runtime Values

| Key             | Value                 | Files That Reference It                  | Last Verified |
| --------------- | --------------------- | ---------------------------------------- | ------------- |
| Gateway port    | 9173                  | README.md, channels.md, SETUP-TRACKER.md | 2026-05-04    |
| WebSocket URL   | ws://127.0.0.1:9173   | README.md, channels.md                   | 2026-05-04    |
| WebChat URL     | http://127.0.0.1:9173 | README.md                                | 2026-05-04    |
| Gateway version | 2026.4.25             | README.md                                | 2026-05-04    |

## Skill Counts

| Key                                  | Value | Files That Reference It                                                                                                                                                                                                                                                                                                                           | Last Verified |
| ------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Skill count (managed top-level dirs) | 58    | skills.md (×4)                                                                                                                                                                                                                                                                                                                                    | 2026-05-06    |
| Skill count (managed SKILL.md files) | 128   | (nested inside domain categories)                                                                                                                                                                                                                                                                                                                 | 2026-04-29    |
| Skill count (bundled repo dirs)      | 65    | skills.md, README.md                                                                                                                                                                                                                                                                                                                              | 2026-02-16    |
| Skill count (celavii)                | 13    | skills.md                                                                                                                                                                                                                                                                                                                                         | 2026-05-06    |
| Skill count (social)                 | 19    | skills.md (celavii-social, social-hooks, social-orchestrator, social-persona, social-drift, social-discover, social-competitor-scrape, social-trend-detect, social-factcheck, social-cannibalization, social-sxo, social-plan, social-research, social-brief, social-script, social-shotlist, social-quality, social-repurpose, social-aggregate) | 2026-04-29    |
| Skill count (custom)                 | 10    | skills.md                                                                                                                                                                                                                                                                                                                                         | 2026-03-31    |

## Agent Counts

| Key                                    | Value | Files That Reference It | Last Verified |
| -------------------------------------- | ----- | ----------------------- | ------------- |
| **Agent count (domain)**               | 15    | README.md, agents.md    | 2026-05-04    |
| **Agent count (total in agents.list)** | 20    | agents.md               | 2026-05-04    |

## Provider Distribution

| Key                               | Value         | Files That Reference It     | Last Verified |
| --------------------------------- | ------------- | --------------------------- | ------------- |
| **Google Flash agents (primary)** | 8             | agents.md, README.md        | 2026-02-16    |
| **Google Pro agents (primary)**   | 7             | agents.md, README.md        | 2026-02-25    |
| **OpenAI GPT-5.2 agents**         | 2             | agents.md (critic, planner) | 2026-02-12    |
| **OpenAI 5.2-Codex agents**       | 1             | agents.md (prod-coder)      | 2026-02-12    |
| **Anthropic agents (primary)**    | 0             | agents.md (fallback only)   | 2026-02-12    |
| **Haiku status**                  | deprecated    | agents.md, README.md        | 2026-02-12    |
| **Sonnet/Opus status**            | fallback only | agents.md, README.md        | 2026-02-12    |
| **Global thinkingDefault**        | medium        | agents.md, openclaw.json    | 2026-02-12    |
| **Global subagents.thinking**     | low           | agents.md, openclaw.json    | 2026-02-12    |

## Memory

| Key                       | Value                   | Files That Reference It | Last Verified |
| ------------------------- | ----------------------- | ----------------------- | ------------- |
| **Memory stores (total)** | 17                      | memory.md               | 2026-02-25    |
| **Memory source files**   | 13                      | memory.md               | 2026-02-25    |
| **Embedding model**       | text-embedding-3-small  | memory.md, README.md    | 2026-02-25    |
| **Memory source dir**     | ~/dev/workspace/memory/ | memory.md               | 2026-02-25    |
| **Memory index dir**      | ~/.openclaw/memory/     | memory.md               | 2026-02-25    |

## Paths

| Key                    | Value                                            | Files That Reference It | Last Verified |
| ---------------------- | ------------------------------------------------ | ----------------------- | ------------- |
| **Managed skills dir** | ~/.openclaw/skills/ → ~/dev/workspace/skills/    | skills.md               | 2026-02-09    |
| **API keys location**  | ~/.openclaw/.env                                 | security.md, README.md  | 2026-02-09    |
| **Config file**        | ~/.openclaw/openclaw.json                        | security.md, README.md  | 2026-02-09    |
| **LaunchAgent plist**  | ~/Library/LaunchAgents/ai.openclaw.gateway.plist | (new)                   | 2026-02-09    |

## API Keys

| Key                              | Location                                                             | Status                                    | Last Verified |
| -------------------------------- | -------------------------------------------------------------------- | ----------------------------------------- | ------------- |
| `ANTHROPIC_API_KEY`              | ~/.openclaw/.env                                                     | Set                                       | 2026-02-09    |
| `OPENAI_API_KEY`                 | ~/.openclaw/.env                                                     | Set                                       | 2026-02-09    |
| `GEMINI_API_KEY`                 | ~/.openclaw/.env                                                     | Set                                       | 2026-02-09    |
| `OPENROUTER_API_KEY`             | ~/.openclaw/.env                                                     | Set                                       | 2026-04-25    |
| `CELAVII_API_KEY`                | ~/.openclaw/.env                                                     | Set (rotated)                             | 2026-05-06    |
| `ELEVENLABS_API_KEY`             | ~/.openclaw/.env                                                     | Set                                       | 2026-02-09    |
| `BRAVE_API_KEY`                  | ~/.openclaw/.env                                                     | Set                                       | 2026-02-09    |
| `FIRECRAWL_API_KEY`              | ~/.openclaw/.env                                                     | Set                                       | 2026-02-09    |
| `REPLICATE_API_TOKEN`            | ~/.openclaw/.env                                                     | Set                                       | 2026-02-16    |
| `APIFY_API_TOKEN`                | ~/.openclaw/.env                                                     | Set                                       | 2026-02-17    |
| `GOOGLE_APPLICATION_CREDENTIALS` | ~/.openclaw/.env (path → ~/.config/celavii-seo/service-account.json) | Pending (Phase 1.1)                       | 2026-04-28    |
| `GOOGLE_GSC_PROPERTY`            | ~/.openclaw/.env                                                     | Pending (Phase 1.1; value: `celavii.com`) | 2026-04-28    |

---

## How to Use

1. **Before any architecture update**: Run `scripts/arch-verify.sh` to detect drift
2. **When a value changes**: Update this file FIRST, then grep for stale references
3. **After updating**: Run `scripts/arch-verify.sh` again to confirm consistency
