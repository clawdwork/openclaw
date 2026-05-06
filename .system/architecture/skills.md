# Skills Inventory & Loading

> Part of [System Architecture](README.md)

---

## Skill Loading Locations

```
~/.openclaw/skills/           ← SYMLINK → ~/dev/workspace/skills/ (global managed dir)
~/dev/workspace/skills/     ← 58 skills (managed: domain categories + celavii + social-agents + custom)
~/.agents/skills/             ← Personal skill overrides (applies to all workspaces)
{workspace}/.agents/skills/   ← Per-project skill overrides (highest non-workspace priority)
repo skills/                  ← 65 skills (bundled with OpenClaw binary)
```

All agents read skills from `~/.openclaw/skills/` (managed dir), which symlinks to the admin workspace. Edits in the admin workspace are instantly visible to all agents.

### Repo Symlink Pattern (Added 2026-02-18)

Workspace skills can also be symlinked into the **OpenClaw repo's** `skills/` directory to appear as bundled skills. This enables gateway-level discovery (shows in `openclaw skills list`) and slash command registration via `commands/` subdirectories.

```
~/dev/workspace/skills/{name}/    →  ~/dev/openclaw/skills/{name}  (relative symlink)
~/dev/workspace/skills/seo/seo-*/ →  ~/dev/openclaw/skills/seo-*    (relative symlink)
```

**Setup script:** `~/dev/workspace/scripts/register-workspace-skills.sh`
**Documentation:** `~/dev/workspace/knowledge/system-architecture/SKILL-REGISTRATION.md`

**When to use:** After creating a new skill in `~/dev/workspace/skills/`, run:

```bash
~/dev/workspace/scripts/register-workspace-skills.sh
openclaw gateway restart
openclaw skills list 2>&1 | grep {skill-name}
```

**Current symlinks (26 total):**

- 15 SEO skills (`seo-orchestrator`, `seo-product-page`, etc.)
- 11 workspace skills (`brand-identity`, `quality-critic`, `deploy-and-publish`, etc.)

**Rule:** Never edit files in `openclaw/skills/` directly — always edit in `~/dev/workspace/skills/`. The symlinks ensure changes propagate instantly.

### Loading Precedence

Skills are loaded by `src/agents/skills/workspace.ts` from six sources (last match wins):

1. **Extra directories** (`config.skills.load.extraDirs`) — lowest priority
2. **Bundled skills** (built into OpenClaw binary)
3. **Managed skills** (`~/.openclaw/skills/`) — global shared dir
4. **Personal `.agents/skills/`** (`~/.agents/skills/`) — user-wide overrides _(new in v2026.2.12)_
5. **Project `.agents/skills/`** (`{workspaceDir}/.agents/skills/`) — per-project overrides _(new in v2026.2.12)_
6. **Workspace skills** (`{workspaceDir}/skills/`) — per-agent local (highest priority)

### Per-Project Skill Customization

The `.agents/skills/` directories (added in v2026.2.12) enable skill overrides without touching shared managed skills:

```
# Override quality-critic rubric for a specific client project:
~/org/shared/projects/max-kick/.agents/skills/quality-critic/SKILL.md

# Personal admin-wide skill tweaks (applies to all workspaces):
~/.agents/skills/quality-critic/SKILL.md
```

**Use cases**:

- **Client-specific review criteria**: Override `quality-critic` SKILL.md per project to enforce stricter brand compliance for specific clients
- **Project-specific data schemas**: Override `data/sql-queries` with project-specific table definitions
- **A/B testing skill prompts**: Test a new `content-creation` skill version in one project without affecting others
- **Member workspace customization**: Each member's workspace can have `.agents/skills/` overrides for their domain specialization

**Precedence example** (quality-critic skill):

```
managed: ~/.openclaw/skills/quality-critic/SKILL.md        ← default rubric
personal: ~/.agents/skills/quality-critic/SKILL.md         ← admin tweaks (wins over managed)
project: ~/projects/max-kick/.agents/skills/quality-critic/ ← client-specific (wins over personal)
workspace: ~/dev/workspace/skills/quality-critic/         ← explicit workspace (wins over all)
```

---

## Voice & Media Skills

| Skill                  | Status           | Purpose                      | Provider                                      |
| ---------------------- | ---------------- | ---------------------------- | --------------------------------------------- |
| 🎙️ **openai-whisper**  | ✅ Ready         | Speech-to-text transcription | Local CLI                                     |
| 🗣️ **sag**             | ⏳ Needs API key | ElevenLabs TTS (primary)     | ElevenLabs                                    |
| 🗣️ **sherpa-onnx-tts** | ✅ Ready         | Local TTS fallback (offline) | Local ONNX                                    |
| 🍌 **nano-banana-pro** | ✅ Ready         | Image generation/editing     | Gemini 3.1 Flash (NB2 default) / Gemini 3 Pro |

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

## Domain Skills (94 Skills across 17 Categories)

| Domain                 | Count | Skills                                                                                                                                                                                                                                                                                                   | Model     |
| ---------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Marketing**          | 6     | brand-voice, campaign-planning, competitive-analysis, content-creation, intel-ingest, performance-analytics                                                                                                                                                                                              | Flash     |
| **SEO**                | 19    | seo-orchestrator, seo-audit, seo-page, seo-technical, seo-content, seo-schema, seo-images, seo-sitemap, seo-geo, seo-plan, seo-programmatic, seo-competitor-pages, seo-hreflang, seo-report-generator, seo-product-page, **seo-strategy**, **keyword-opportunities**, **competitor-seo**, **seo-google** | Pro       |
| **Sales**              | 10    | account-research, call-prep, competitive-intelligence, create-an-asset, daily-briefing, draft-outreach, **lead-gen**, **sales-asset**, **sales-deck**, **sales-strategy**                                                                                                                                | Flash/Pro |
| **Product Management** | 6     | competitive-analysis, feature-spec, metrics-tracking, roadmap-management, stakeholder-comms, user-research-synthesis                                                                                                                                                                                     | Flash     |
| **Customer Support**   | 5     | customer-research, escalation, knowledge-management, response-drafting, ticket-triage                                                                                                                                                                                                                    | Flash     |
| **Enterprise Search**  | 3     | knowledge-synthesis, search-strategy, source-management                                                                                                                                                                                                                                                  | Flash     |
| **Legal**              | 6     | canned-responses, compliance, contract-review, legal-risk-assessment, meeting-briefing, nda-triage                                                                                                                                                                                                       | Pro       |
| **Finance**            | 6     | audit-support, close-management, financial-statements, journal-entry-prep, reconciliation, variance-analysis                                                                                                                                                                                             | Pro       |
| **Data**               | 7     | data-context-extractor, data-exploration, data-validation, data-visualization, interactive-dashboard-builder, sql-queries, statistical-analysis                                                                                                                                                          | Pro       |
| **Media Content**      | 5     | image-prompting, video-prompting, character-consistency, commercial-styles, creative-direction                                                                                                                                                                                                           | Pro       |
| **Quality Critic**     | 1     | quality-critic (agnostic review of proposals, images, decks, data viz)                                                                                                                                                                                                                                   | GPT-5.2   |
| **Blogger**            | 16    | blog-orchestrator, blog-write, blog-rewrite, blog-analyze, blog-audit, blog-brief, blog-outline, blog-schema, blog-repurpose, blog-geo, blog-chart, blog-calendar, blog-seo-check, blog-strategy, **blog-strategy-progress**, **blog-google**                                                            | Pro       |
| **Workspace Auditor**  | 1     | workspace-audit (MWF structural, registry, semantic integrity checks)                                                                                                                                                                                                                                    | Pro       |

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
| 📋 **celavii-jobs**      | ✅ Ready | List enhance/refine/scrape jobs, list/campaign coverage    | 0 (free)  |
| 🌐 **celavii-platforms** | ✅ Ready | Platform reference (IG/TT IDs, scrape routing)             | 0 (free)  |
| ✉️ **celavii-outreach**  | ✅ Ready | Personalized DMs, emails, follow-ups using profile intel   | 0 (local) |
| 📑 **celavii-reporting** | ✅ Ready | Stakeholder reports — campaign / audience / pipeline       | 0 (local) |
| 🎯 **celavii-strategy**  | ✅ Ready | Influence targeting, brand acquisition, network strategy   | 0 (local) |

> **Social skills (19) are owned by two agents** as of 2026-05-04 (V7): the analytical 13 (`social-discover`, `social-brief`, `social-plan`, `social-drift`, `social-cannibalization`, `social-factcheck`, `social-sxo`, `social-persona`, `social-trend-detect`, `social-competitor-scrape`, `social-aggregate`, `social-research`, `social-quality`) live on the **`social-research`** agent (DeepSeek V4 Pro `medium`). The creative 6 (`social-orchestrator`, `social-hooks`, `social-script`, `social-shotlist`, `social-repurpose`, `celavii-social`) live on **`social-writer`** (Gemini 3.1 Pro `high`). This split enforces the cross-model critic boundary required by `skills/social-orchestrator/references/social-constitution.md` Article 7.

| 📱 **celavii-social** | ✅ Ready | Social content orchestration — copy, media prompts, state | 0 (local) |
| 🎣 **social-hooks** | ✅ B18 (5-archetype layer added) | Hook generation library — 6 categories + 5-archetype foundation + 4-axis scoring rubric (B18) | 0 (local) |
| 📣 **social-orchestrator** | 🚧 Phase A | Multi-channel social pipeline router (`/social_strategy`, `/social_curate`, `/social_post`). Source-of-truth: [.system/features/social-strategy/](../features/social-strategy/) | 0 (local) |
| 🗣️ **social-persona** | 🚧 Phase B13 | NN/g 4-D voice extraction + enforcement (CLI fleshed out). Voice spec at `~/dev/workspace/.styles/celavii/voice.json` | 0 (local) |
| 📉 **social-drift** | 🚧 Phase B16 | SQLite baseline + drift detection — full schema + 17 rules documented. Cache at `~/.cache/claude-social/drift/` | 0 (local) |
| 🔭 **social-discover** | 🚧 Phase B11 | Profile/hashtag/location discovery wrapping Celavii public scrape API | 0 (local) |
| 🥷 **social-competitor-scrape** | 🚧 Phase B11 | Competitor baselines + top-posts + cross-platform link extraction | 0 (local) |
| 📈 **social-trend-detect** | 🚧 Phase B10 | Velocity + acceleration + z-score over time-series; trendsmcp + ramekin math | 0 (local) |
| 🔍 **social-factcheck** | 🚧 Phase B14 | Claim decomposition → verification (Loki) + RefChecker AI-fabricated stat detection | 0 (local) |
| 🎯 **social-cannibalization** | 🚧 Phase B15 | Cosine similarity + 30d temporal window; auto Gate B check | 0 (local) |
| 🎚️ **social-sxo** | 🚧 Phase B17 | Platform-fit analyzer ("does this post deserve to engage?") | 0 (local) |
| 🗓️ **social-plan** | 🚧 Phase B12 | Calendar + Gary Vee Reverse Pyramid + 2026 cadence rules | 0 (local) |
| 📚 **social-research** | 🚧 Phase B1+B3 | Per-week research packets + per-post citation extraction | 0 (local) |
| 📝 **social-brief** | 🚧 Phase B4 | Per-post briefs (hook variants, beats, CTA, hashtags, e_tags, success metrics) | 0 (local) |
| 🎬 **social-script** | 🚧 Phase B6 | Long-form video script writer + 8-pass humanizer | 0 (local) |
| 🎥 **social-shotlist** | 🚧 Phase B7 | Shot list from script (camera, b-roll, on-screen text); ClipsAI backbone | 0 (local) |
| 🛂 **social-quality** | 🚧 Phase B8/B9/B20/B21 | Critic gates A/B/C + silo-check + 8-pass humanizer hook + RefChecker hook | 0 (local) |
| ♻️ **social-repurpose** | 🚧 Phase F2/B19 | Cross-channel adaptation; ClipsAI for video lane | 0 (local) |
| 📊 **social-aggregate** | ✅ Phase C (script + smoke) | Phase 3 deterministic aggregator — scoring, cosine cannibalization, 4E + archetype taggers, velocity/acceleration/z-score; <5s on 1000 posts | 0 (local) |

**Base URL**: `https://www.celavii.com/api/v1`  
**Auth**: `CELAVII_API_KEY` (shared across all agents, stored in `~/.openclaw/.env`)  
**Tier**: Pro (60 req/min, 10k req/day)

---

## Custom Skills (Non-Domain)

| Skill                             | Category | Purpose                                                                     |
| --------------------------------- | -------- | --------------------------------------------------------------------------- |
| **shadcn-ui**                     | `ui/`    | UI component reference (React/Tailwind/shadcn)                              |
| **brand-identity**                | (root)   | Celavii brand guidelines                                                    |
| **generating-proposal-documents** | (root)   | Proposal formatting                                                         |
| **deploy-and-publish**            | (root)   | Deployment pipeline skill                                                   |
| **workspace-wizard**              | (root)   | Agent provisioning wizard (admin-only)                                      |
| **blogger**                       | (root)   | Blog content production (SEO-coupled)                                       |
| **workspace-audit**               | (root)   | MWF workspace integrity audits                                              |
| **workspace-reconcile**           | (root)   | Autonomous fix execution from audit reports                                 |
| **project-scaffold**              | (root)   | New project directory + PROJECT.md scaffolding                              |
| **sales-deck**                    | (root)   | Sales pitch deck generator (React/Vite, visual assets, prospect archetypes) |

---

## Skills with Extra Artifacts

| Artifact                        | Categories                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Commands** (action templates) | sales, marketing, seo, product-management, customer-support, data, legal, finance, enterprise-search, media-content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **MCP configs** (`.mcp.json`)   | sales, marketing, seo, product-management, customer-support, data, legal, finance, enterprise-search                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Scripts**                     | marketing/intel-ingest (`cron-exec.sh`), sales/scripts (`run-apify-prospects.sh`, `run-apify-email-finder.sh`, `run-apify-gmaps.sh`, `run-apify-contact-scraper.sh`, `run-apify-serp.sh` ← symlink to seo/scripts, `validate-synthesis.sh`, `validate-assets.sh`, `validate-emails.sh`), seo/scripts (`run-apify-ahrefs.sh`, `run-apify-semrush-da.sh`, `run-apify-serp.sh`, `run-apify-moz.sh`, `run-apify-ubersuggest.sh`, `run-apify-seo-ranking.sh`, `run-lighthouse.sh`, `run-broken-links.sh`, `run-accessibility.sh`, `extract-headings.sh`, `generate-schema.sh`, `generate-interlink-map.sh`, `estimate-revenue.sh`, `validate-proposal.sh`, `run-sitemap-gen.sh`, `run-unlighthouse.sh`), workspace-wizard (`provision-workspace.sh`, `add-binding.sh`, `deactivate-workspace.sh`) |
| **References**                  | data/data-context-extractor, generating-proposal-documents, marketing/intel-ingest, media-content/\* (6 reference files), quality-critic, seo/seo-orchestrator (4 reference files), seo/seo-schema (`templates.json`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

---

## Agent-to-Skill Access Matrix

| Agent Type                        | Workspace Skills            | Managed Skills (`~/.openclaw/skills/` → symlink) |
| --------------------------------- | --------------------------- | ------------------------------------------------ |
| **admin-001**                     | ✅ 39 managed + 65 bundled  | ✅ same via symlink                              |
| **Sub-agents** (spawned by admin) | ✅ synced from parent       | ✅                                               |
| **member-NNN** (provisioned)      | — (empty workspace skills/) | ✅ 39 managed + 65 bundled                       |
| **guest-NNN** (provisioned)       | — (empty workspace skills/) | ✅ 39 managed + 65 bundled                       |

---

## Agent Capabilities Matrix

### Communication

| Channel      | Status            | Config                                |
| ------------ | ----------------- | ------------------------------------- |
| **Telegram** | ✅ Active         | Bot: `@maxious_bot`, Allowlist policy |
| **WebChat**  | ✅ Active         | `ws://127.0.0.1:9173`                 |
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

| Feature          | Config                              |
| ---------------- | ----------------------------------- |
| Heartbeat        | Every 30 minutes (Gemini 2.5 Flash) |
| Cron jobs        | Via `cron` tool                     |
| Background tasks | Via `sessions_spawn`                |
