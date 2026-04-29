# GitHub Repo Audit

> External OSS sweep for the social-agents pipeline. 50+ repos across 10 categories, scored on 2026 viability, fork-readiness, and skill-mapping.
> **Date**: 2026-04-28

---

## 1. AI Agent Frameworks for Social/Content

### **[langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent)** — ★ FORK CANDIDATE

LangGraph agent for sourcing, curating, scheduling posts with HITL. Closest 1:1 to our 7-phase pipeline.

- `ingest_data` → verification → `generatePost` graph mirrors our Acquire → Discover → Plan stages
- Slack-channel-as-inbox pattern is a cheap, elegant ingestion model worth adopting
- HITL approval checkpoints per platform — port directly to Phase 5 (Quality) + Phase 6 (Deliver)
- License: MIT

### [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app)

20k+ stars, Apache 2.0, "agentic social media scheduler" supporting 30+ platforms.

- Connector abstraction — one adapter per platform — directly relevant for `social-discover`
- Provider tokens model + scheduling state machine
- Active commits 2025-2026
- **Use for**: Phase 6 (Deliver) without re-implementing OAuth dances

### [inovector/mixpost](https://github.com/inovector/mixpost)

Laravel+Vue Buffer alternative. Different stack, but the post-state model (`draft → scheduled → published → failed`) and unified `Post` with platform-specific variants closely match our cross-channel design.

- Read for state-modeling ideas; don't try to integrate

---

## 2. Multi-Platform Scrapers / API Wrappers (2026 status)

| Repo                                                                              | 2026 Status                 | Notes                                                                                    |
| --------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| [subzeroid/instagrapi](https://github.com/subzeroid/instagrapi)                   | ✅ Working April 2026       | Fastest IG private API lib. Vendor pushes paid HikerAPI for prod. Use only research/dev. |
| [instaloader/instaloader](https://github.com/instaloader/instaloader)             | ⚠️ Working but rate-limited | Public data + metadata only                                                              |
| [davidteather/TikTok-Api](https://github.com/davidteather/TikTok-Api)             | ⚠️ v7.3.3 April 2026, MIT   | Breaks every few weeks; pair with playwright fallback                                    |
| [JustAnotherArchivist/snscrape](https://github.com/JustAnotherArchivist/snscrape) | ❌ DEAD for X               | Avoid entirely                                                                           |
| [vladkens/twscrape](https://github.com/vladkens/twscrape)                         | ✅ Working with auth pool   | Best X option in 2026 — needs cookie pool                                                |
| [Altimis/Scweet](https://github.com/Altimis/Scweet)                               | ✅ Verified March 2026      | Multi-account pool, async, proxy support. **Primary X choice.**                          |
| [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)                                 | ✅ Healthy                  | `--dump-json` for metadata-only is the YouTube primitive                                 |
| [apify/apify-mcp-server](https://github.com/apify/apify-mcp-server)               | ✅ Maintained, paid         | Best fallback when scrapers break — wraps all Apify actors as MCP tools                  |

### Risk Callouts

- **Don't build Acquire on snscrape** — broken since Q1 2025
- **All IG/TikTok scrapers violate ToS** and break on a 2–4 week cadence
- **Architect Acquire as a fallback chain**: official OAuth → Apify (paid) → instagrapi/davidteather (research only). Treat scrapers as failure-tolerant
- **HikerAPI / paid Apify** are the only realistic prod paths for IG/TikTok bulk discovery — budget for it

---

## 3. Trend Detection / Virality

### [trendsmcp/tiktok-trends-mcp](https://github.com/trendsmcp/tiktok-trends-mcp) — ★ DROP-IN

MCP server exposing live TikTok hashtag trend data (volume, growth spikes) to Claude/Cursor.

- Direct drop-in for `social-trend-detect`
- MCP-native — no scraper wrangling

### [bellingcat/tiktok-hashtag-analysis](https://github.com/bellingcat/tiktok-hashtag-analysis)

Co-occurring hashtag frequency analyzer.

- Solid baseline algorithm to lift for hashtag clustering in `social-aggregate`
- Bellingcat-grade investigative tool — high-quality

### [readikus/ramekin](https://github.com/readikus/ramekin)

Generic real-time trend detection lib (z-score over time-window buckets).

- Lightweight, language-agnostic algorithm
- **Worth porting** the math to our `social-aggregate` script

### Academic refs (not for production)

- [juanls1/TikTok-Virality-Predictor](https://github.com/juanls1/TikTok-Virality-Predictor)
- [harbarex/tiktok-virality-prediction](https://github.com/harbarex/tiktok-virality-prediction) — ViViT models

Useful for "what features predict virality" (audio reuse, hook density, posting cadence). Don't ship the models — encode the features in our scoring rubric.

### Paid SaaS to mimic, not adopt

- Exolyt, vidIQ, TikTok Creative Center
- The "breakout/established" tier rubric is worth replicating in our state-file schema

---

## 4. Calendar / Scheduling / Cannibalization

| Repo                                                                                                | Use                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Postiz](https://github.com/gitroomhq/postiz-app) + [Mixpost](https://github.com/inovector/mixpost) | Both expose state machines for Plan→Deliver. Postiz: per-platform queues with rate-limit awareness; Mixpost: unified Post w/ platform variants (closer to our cross-channel model) |
| [jmelm93/seo_cannibalization_analysis](https://github.com/jmelm93/seo_cannibalization_analysis)     | Excel-output GSC analyzer; algorithm (query-page mapping with overlap thresholding) is what we need for `social-cannibalization`                                                   |
| [SEO Cannibalization Detector](https://www.mdskills.ai/skills/seo-cannibalization-detector)         | Claude skill version, free; pre-publish check pattern matches our gate model                                                                                                       |
| [mautic/mautic](https://github.com/mautic/mautic)                                                   | Overkill, but campaign + segment data model is worth reading for Phase 7 (Report)                                                                                                  |

---

## 5. Voice / Persona / Style

### **[anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)** — ★ TOP FORK CANDIDATE

Official Anthropic skill set. The `marketing/skills/brand-voice` and `partner-built/brand-voice` directories include:

- `discover-brand` — extract voice from samples
- `brand-voice-enforcement` — lint content against voice guide

**Direct prior art for `social-persona` + `social-drift`. FORK/VENDOR these SKILL.md files.**

- License: MIT

### Voice schema references (not OSS but adoptable)

- [Mailchimp Content Style Guide](https://github.com/mailchimp/content-style-guide) — public-domain-ish; "voice constant, tone flexes" model
- [Hack23/homepage](https://github.com/Hack23/homepage) brand-voice-tone SKILL.md — small but well-structured JSON schema

### Encode internally

NN/g 4-dimension framework (formal↔casual, serious↔funny, respectful↔irreverent, matter-of-fact↔enthusiastic) — not OSS but trivially encodable as 4 floats in our persona JSON.

---

## 6. Repurposing / Cross-Channel

| Repo                                                                    | Use                                                                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [ClipsAI/clipsai](https://github.com/ClipsAI/clipsai)                   | ★ Python lib auto-converts long videos → clips with transcript-aware cuts. Apache 2.0. **Backbone for `social-repurpose` video lane** |
| [Shaarav4795/ClippedAI](https://github.com/Shaarav4795/ClippedAI)       | OpusClip OSS clone built on ClipsAI; viral-title generation + subtitles. Good prompt examples for hook extraction                     |
| [mutonby/openshorts](https://github.com/mutonby/openshorts)             | Self-hosted "AI shorts" platform. Heavier — covers UGC/AI-actor flows                                                                 |
| [jipraks/yt-short-clipper](https://github.com/jipraks/yt-short-clipper) | One-command long→short transformer; good CLI ergonomics reference                                                                     |
| [hilmanski/contentswift](https://github.com/hilmanski/contentswift)     | SEO content optimizer (Surfer/Frase alt). Useful prompt patterns for `social-brief`                                                   |

---

## 7. Quality / Fact-Check / Safety

### **[Libr-AI/OpenFactVerification (Loki)](https://github.com/Libr-AI/OpenFactVerification)** — ★ FORK CANDIDATE

MIT, paper-backed pipeline: claim decomposition → check-worthiness → query gen → evidence retrieval → verdict.

- **Direct skeleton for `social-factcheck`**

### [BharathxD/ClaimeAI](https://github.com/BharathxD/ClaimeAI)

LangGraph implementation of the same pipeline. Copy graph topology directly.

### [amazon-science/RefChecker](https://github.com/amazon-science/RefChecker)

3-stage claim extractor specifically tuned for LLM hallucinations.

- Best for catching AI-fabricated stats in scripts before they ship
- Run on output of `social-script` and `social-brief`

### [yuxiaw/OpenFactCheck](https://github.com/yuxiaw/OpenFactCheck)

Unifying eval harness; useful for benchmarking our own factcheck outputs.

### AI-detection / banned-language

No clear OSS winner. The `Humanizer` skill in [OpenClaudia/openclaudia-skills](https://github.com/OpenClaudia/openclaudia-skills) uses an "8-pass editing system" — adversarial editing loop is a good pattern for `social-quality`.

---

## 8. Claude Code Skills / Plugins Marketplaces

| Repo                                                                                                                                                                                                                                                                                | Notes                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)**                                                                                                                                                                                       | ★ PRIMARY UPSTREAM. Marketing plugin = brand-voice, content creation, campaign planning, brand-review, draft-content. Several skills map 1:1 to ours |
| [OpenClaudia/openclaudia-skills](https://github.com/OpenClaudia/openclaudia-skills)                                                                                                                                                                                                 | 34 marketing skills including Humanizer, SEO writers                                                                                                 |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills)                                                                                                                                                                                                     | 232+ skills across stacks; broad, mixed quality                                                                                                      |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)                                                                                                                                                                                                 | 1000+ agent skills curated index — good discovery layer                                                                                              |
| [rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit)                                                                                                                                                                                     | 135 agents + 35 skills + plugins                                                                                                                     |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)                                                                                                                                                                                                   | CRO/copywriting/SEO/analytics skills tailored for Claude Code                                                                                        |
| [quemsah/awesome-claude-plugins](https://github.com/quemsah/awesome-claude-plugins)                                                                                                                                                                                                 | Automated metrics scraper; useful for picking winners by adoption                                                                                    |
| [GetBindu/awesome-claude-code-and-skills](https://github.com/GetBindu/awesome-claude-code-and-skills), [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills), [BehiSecc/awesome-claude-skills](https://github.com/BehiSecc/awesome-claude-skills) | Curated lists; scan for novel patterns only                                                                                                          |

### License risk

Many "awesome-\*" lists aggregate prompts/skills with unclear chain-of-license. **Re-read individual skill repos before vendoring.**

---

## 9. Prompt Engineering Libraries

| Repo                                                                                                                    | Notes                                                               |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [f/prompts.chat](https://github.com/f/prompts.chat)                                                                     | 143k+ stars; cherry-pick the marketing/social subset                |
| [ai-boost/awesome-prompts](https://github.com/ai-boost/awesome-prompts)                                                 | Top-rated GPT Store prompts including content + protection patterns |
| [aminblm/awesome-chatgpt-content-creation-prompts](https://github.com/aminblm/awesome-chatgpt-content-creation-prompts) | Narrow content focus, lower stars but high signal                   |

All "vendor and curate" — none are dependency-grade.

---

## 10. State Machines / Orchestration

| Repo                                                                                                        | Use                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [BrightPool/langgraph-content-state-machine](https://github.com/BrightPool/langgraph-content-state-machine) | Blog brief + reflection loop in LangGraph. Tiny but the reflection-iteration pattern fits our Quality phase                          |
| [crewAIInc/crewAI-examples](https://github.com/crewAIInc/crewAI-examples)                                   | Marketing Strategy, Instagram Post, Landing Page Generator, Content Creator Flow examples. Closest CrewAI prior to our 7-phase model |
| [akj2018/Multi-AI-Agent-Systems-with-crewAI](https://github.com/akj2018/Multi-AI-Agent-Systems-with-crewAI) | Marketing Crew with role-based agents (Researcher, Writer, Editor, Strategist)                                                       |
| [paulsuryanshu/multimodal-agentic-poc](https://github.com/paulsuryanshu/multimodal-agentic-poc)             | LangGraph text→image→audio→video pipeline; pattern for future video-gen extension                                                    |
| [von-development/awesome-LangGraph](https://github.com/von-development/awesome-LangGraph)                   | Curated index for further mining                                                                                                     |

⚠️ **Pitfall**: CrewAI/LangGraph examples are demos, not prod. Borrow patterns, don't lift code wholesale; most have no error handling, retries, or idempotency.

---

## Top 5 Fork Candidates (Ranked)

| #   | Repo                                                                                                                                                         | Why                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | **[anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)** brand-voice skills                                             | Direct foundation for `social-persona` and `social-drift`                               |
| 2   | **[langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent)**                                                                    | Closest end-to-end pipeline; lift the graph topology, keep our atomic-skill granularity |
| 3   | **[Libr-AI/OpenFactVerification (Loki)](https://github.com/Libr-AI/OpenFactVerification)** + **[BharathxD/ClaimeAI](https://github.com/BharathxD/ClaimeAI)** | Drop-in skeleton for `social-factcheck`                                                 |
| 4   | **[ClipsAI/clipsai](https://github.com/ClipsAI/clipsai)**                                                                                                    | Backbone for `social-repurpose` video lane                                              |
| 5   | **[trendsmcp/tiktok-trends-mcp](https://github.com/trendsmcp/tiktok-trends-mcp)**                                                                            | Wire as MCP server feeding `social-trend-detect`                                        |

---

## Skill-to-Repo Mapping (Cheat Sheet)

| Atomic skill             | Best prior art                                                 |
| ------------------------ | -------------------------------------------------------------- |
| `social-discover`        | langchain-ai/social-media-agent ingest_data + Apify MCP        |
| `social-research`        | OpenFactVerification + WebSearch/MCP patterns                  |
| `social-brief`           | crewAI-examples Content Creator Flow + ContentSwift prompts    |
| `social-script`          | OpenClaudia Humanizer + ClippedAI viral-title prompts          |
| `social-shotlist`        | ClipsAI transcript-aware cuts                                  |
| `social-quality`         | RefChecker + Humanizer 8-pass loop                             |
| `social-aggregate`       | Postiz/Mixpost post-state schema + ramekin z-score math        |
| `social-plan`            | langgraph-content-state-machine reflection loop                |
| `social-trend-detect`    | tiktok-trends-mcp + ramekin + bellingcat hashtag-analysis      |
| `social-repurpose`       | ClipsAI + ClippedAI + jipraks/yt-short-clipper                 |
| `social-persona`         | anthropics knowledge-work-plugins brand-voice (discover-brand) |
| `social-drift`           | anthropics brand-voice-enforcement                             |
| `social-cannibalization` | jmelm93/seo_cannibalization_analysis + mdskills detector       |
| `social-factcheck`       | Loki + ClaimeAI + RefChecker                                   |

---

## Pitfalls & Risks (Aggregate)

- **snscrape is dead for X** — do not start any Acquire work on it
- **All IG/TikTok scrapers are ToS-violating** and break on a 2–4 week cadence. Architect Acquire with fallback chain
- **HikerAPI / paid Apify** are the only realistic prod paths for IG/TikTok bulk discovery
- **Watch licensing on awesome-\* lists** — many aggregate prompts/skills with unclear chain-of-license
- **CrewAI/LangGraph examples are demos** — borrow patterns, don't lift code
- **NN/g tone framework** has no canonical OSS implementation — encode it ourselves
