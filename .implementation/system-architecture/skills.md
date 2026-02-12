# Skills Inventory & Loading

> Part of [System Architecture](README.md)

---

## Skill Loading Locations

```
~/.openclaw/skills/           ← SYMLINK → ~/agent-workspace/skills/ (global managed dir)
~/agent-workspace/skills/     ← 28 skills (managed: domain categories + celavii + custom)
repo skills/                  ← 60 skills (bundled with OpenClaw binary)
```

All agents read skills from `~/.openclaw/skills/` (managed dir), which symlinks to the admin workspace. Edits in the admin workspace are instantly visible to all agents.

### Loading Precedence

Skills are loaded by `src/agents/skills/workspace.ts` from four sources (first match wins):

1. **Extra directories** (`config.skills.load.extraDirs`) — highest priority
2. **Bundled skills** (built into OpenClaw binary)
3. **Managed skills** (`~/.openclaw/skills/`) — global shared dir
4. **Workspace skills** (`{workspaceDir}/skills/`) — per-agent local

---

## Voice & Media Skills

| Skill                  | Status           | Purpose                      | Provider     |
| ---------------------- | ---------------- | ---------------------------- | ------------ |
| 🎙️ **openai-whisper**  | ✅ Ready         | Speech-to-text transcription | Local CLI    |
| 🗣️ **sag**             | ⏳ Needs API key | ElevenLabs TTS (primary)     | ElevenLabs   |
| 🗣️ **sherpa-onnx-tts** | ✅ Ready         | Local TTS fallback (offline) | Local ONNX   |
| 🍌 **nano-banana-pro** | ✅ Ready         | Image generation/editing     | Gemini 3 Pro |

## Development & Deployment Skills

| Skill               | Status   | Purpose                     | CLI       |
| ------------------- | -------- | --------------------------- | --------- |
| 🐙 **github**       | ✅ Ready | Git operations, PRs, issues | `gh`      |
| 🧩 **coding-agent** | ✅ Ready | Delegate coding to Pi agent | `pi`      |
| 📦 **netlify**      | ✅ Ready | Deploy static web apps      | `netlify` |
| ▲ **vercel**        | ✅ Ready | Deploy SSR/API/cron apps    | `vercel`  |

## Search & Analysis Skills

| Skill               | Status   | Purpose                   | CLI        |
| ------------------- | -------- | ------------------------- | ---------- |
| 📜 **session-logs** | ✅ Ready | Search past conversations | `jq`, `rg` |
| 🌐 **web-search**   | ✅ Ready | Web research              | Brave API  |

---

## Domain Skills (56 Skills across 15 Categories)

| Domain                 | Count | Skills                                                                                                                                          | Model   |
| ---------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **Marketing**          | 6     | brand-voice, campaign-planning, competitive-analysis, content-creation, intel-ingest, performance-analytics                                     | Flash   |
| **Sales**              | 6     | account-research, call-prep, competitive-intelligence, create-an-asset, daily-briefing, draft-outreach                                          | Flash   |
| **Product Management** | 6     | competitive-analysis, feature-spec, metrics-tracking, roadmap-management, stakeholder-comms, user-research-synthesis                            | Flash   |
| **Customer Support**   | 5     | customer-research, escalation, knowledge-management, response-drafting, ticket-triage                                                           | Flash   |
| **Enterprise Search**  | 3     | knowledge-synthesis, search-strategy, source-management                                                                                         | Flash   |
| **Legal**              | 6     | canned-responses, compliance, contract-review, legal-risk-assessment, meeting-briefing, nda-triage                                              | Pro     |
| **Finance**            | 6     | audit-support, close-management, financial-statements, journal-entry-prep, reconciliation, variance-analysis                                    | Pro     |
| **Data**               | 7     | data-context-extractor, data-exploration, data-validation, data-visualization, interactive-dashboard-builder, sql-queries, statistical-analysis | Pro     |
| **Media Content**      | 5     | image-prompting, video-prompting, character-consistency, commercial-styles, creative-direction                                                  | Pro     |
| **Quality Critic**     | 1     | quality-critic (agnostic review of proposals, images, decks, data viz)                                                                          | GPT-5.2 |

---

## Creator Intelligence Skills (Celavii API)

| Skill                    | Status   | Purpose                                                    | Credits   |
| ------------------------ | -------- | ---------------------------------------------------------- | --------- |
| 🔍 **celavii-discover**  | ✅ Ready | Search creators by keyword, niche, affinities, hashtags    | 1/query   |
| 👤 **celavii-profiles**  | ✅ Ready | Full profile detail, affinities, posts, network, contact   | 0 (free)  |
| 📊 **celavii-campaigns** | ✅ Ready | Campaign list, metrics, creators, matched content          | 0–1       |
| 🤝 **celavii-crm**       | ✅ Ready | CRM pipeline, managed profiles, lists, org stats           | 0 (free)  |
| 📈 **celavii-analytics** | ✅ Ready | Demographics, locations, niches, overlap, affinity posts   | 1/query   |
| 📚 **celavii-knowledge** | ✅ Ready | Knowledge base CRUD, semantic search for AI context        | 0 (free)  |
| ⚡ **celavii-data-ops**  | ✅ Ready | Profile enhancement, follower/hashtag/URL scrapes, job ops | 1-2+Apify |

**Base URL**: `https://www.celavii.com/api/v1`  
**Auth**: `CELAVII_API_KEY` (shared across all agents, stored in `~/.openclaw/.env`)  
**Tier**: Pro (60 req/min, 10k req/day)

---

## Custom Skills (Non-Domain)

| Skill                             | Category | Purpose                                        |
| --------------------------------- | -------- | ---------------------------------------------- |
| **shadcn-ui**                     | `ui/`    | UI component reference (React/Tailwind/shadcn) |
| **brand-identity**                | (root)   | Celavii brand guidelines                       |
| **generating-proposal-documents** | (root)   | Proposal formatting                            |
| **deploy-and-publish**            | (root)   | Deployment pipeline skill                      |
| **workspace-wizard**              | (root)   | Agent provisioning wizard (admin-only)         |

---

## Skills with Extra Artifacts

| Artifact                        | Categories                                                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Commands** (action templates) | sales, marketing, product-management, customer-support, data, legal, finance, enterprise-search, media-content                           |
| **MCP configs** (`.mcp.json`)   | sales, marketing, product-management, customer-support, data, legal, finance, enterprise-search                                          |
| **Scripts**                     | marketing/intel-ingest (`cron-exec.sh`), workspace-wizard (`provision-workspace.sh`, `add-binding.sh`, `deactivate-workspace.sh`)        |
| **References**                  | data/data-context-extractor, generating-proposal-documents, marketing/intel-ingest, media-content/\* (6 reference files), quality-critic |

---

## Agent-to-Skill Access Matrix

| Agent Type                        | Workspace Skills            | Managed Skills (`~/.openclaw/skills/` → symlink) |
| --------------------------------- | --------------------------- | ------------------------------------------------ |
| **admin-001**                     | ✅ 28 managed + 60 bundled  | ✅ same via symlink                              |
| **Sub-agents** (spawned by admin) | ✅ synced from parent       | ✅                                               |
| **member-NNN** (provisioned)      | — (empty workspace skills/) | ✅ 28 managed + 60 bundled                       |
| **guest-NNN** (provisioned)       | — (empty workspace skills/) | ✅ 28 managed + 60 bundled                       |

---

## Agent Capabilities Matrix

### Communication

| Channel      | Status            | Config                                |
| ------------ | ----------------- | ------------------------------------- |
| **Telegram** | ✅ Active         | Bot: `@maxious_bot`, Allowlist policy |
| **WebChat**  | ✅ Active         | `ws://127.0.0.1:19400`                |
| **WhatsApp** | ✅ Plugin enabled | Requires phone setup                  |
| **Signal**   | ✅ Plugin enabled | Requires setup                        |

### Code & Development

| Capability              | How                        |
| ----------------------- | -------------------------- |
| Write code              | Direct via `exec` tools    |
| Delegate complex coding | Spawn Pi coding agent      |
| Create GitHub repos     | `gh repo create --private` |
| Deploy websites         | `vercel deploy --prod`     |
| Review PRs              | `gh pr` commands           |

### Voice & Media

| Capability       | Primary                   | Fallback                                 |
| ---------------- | ------------------------- | ---------------------------------------- |
| Speech-to-text   | Whisper (local)           | —                                        |
| Text-to-speech   | ElevenLabs (sag, primary) | MiniMax 2.6 HD (minimax-voice, fallback) |
| Voice cloning    | MiniMax (voice-clone)     | —                                        |
| Podcast gen      | Podcastfy (podcast-gen)   | — (Edge TTS free; OpenAI/ElevenLabs opt) |
| Image generation | Gemini 3 Pro              | —                                        |
| Video generation | Veo 3.1 (veo3-gen)        | Sora 2 (sora2-gen)                       |

### Memory & Context

| Type            | Storage                | Search               |
| --------------- | ---------------------- | -------------------- |
| Long-term       | `MEMORY.md`            | Vector + BM25 hybrid |
| Daily notes     | `memory/YYYY-MM-DD.md` | Vector + BM25 hybrid |
| Session history | JSONL files            | Optional indexing    |

### Automation

| Feature          | Config                   |
| ---------------- | ------------------------ |
| Heartbeat        | Every 30 minutes (Haiku) |
| Cron jobs        | Via `cron` tool          |
| Background tasks | Via `sessions_spawn`     |
