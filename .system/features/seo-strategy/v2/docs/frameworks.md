# Frameworks & Methodology — SEO + Blog Upgrade

> Empirical 2025-2026 data + methodology backing the seo-strategy v2 upgrade.
> **Date**: 2026-04-27

---

## 1. Indexation Crisis (Internal Empirical)

Source: `~/dev/workspace/projects/celavii/research/seo/strategy-state-v2-2026-04-27.json`

| Metric                                      | Value                                                                      | Source                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Total live blog posts                       | 13                                                                         | Strategy state (2026-04-23 GSC snapshot)                              |
| Indexed in Google                           | 3 (23%)                                                                    | Strategy state `blog_posts_indexed_summary_2026_04_23`                |
| Posts published 2026-04-06 to 04-15 indexed | 0 of 6                                                                     | Strategy state `gsc_not_yet_indexed_note`                             |
| Indexed page count delta since 2026-04-06   | +1 (22 → 23)                                                               | Strategy state `gsc_indexed_urls_delta_since_04_06`                   |
| Diagnosis                                   | **Domain authority bottleneck — pages crawled but not selected for index** | Strategy state `indexing_velocity_finding_2026_04_27` (high-severity) |

### Strategy-Prescribed Fix

Source: `next_actions_2026_04_27` block of strategy-state-v2-2026-04-27.json

1. Indexed posts must link to unindexed siblings (authority cascade) — DONE for 2 just-shipped articles
2. Once 4-article batch ships, they become priority interlink targets
3. Backlink acquisition: target +5 referring domains by 2026-05-27 (HARO, podcasts, partner co-marketing, directories)
4. Submit all new URLs to GSC URL Inspection on publish day — **today's pending todo, automatable via Phase 1 of this upgrade**
5. Batch internal-link plan required before publishing
6. Coordinate batch publish (not staggered)

### Pipeline Use

Phase 1 (`seo-google`/`blog-google`) directly closes action #4 (programmatic GSC URL Inspection). Phase 2A (`seo-drift`) catches if any indexed post regresses. Phase 3A (`seo-backlinks`) directly supports action #3 (referring-domain target).

---

## 2. AI for Content Production — SOTA

| Source                                                                                                                         | Key insight                                                                                               | Pipeline use                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Anthropic — Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)                       | Patterns: orchestrator-worker, evaluator-optimizer, routing                                               | Adopt evaluator-optimizer for blog-factcheck; orchestrator-worker for atomic skills |
| [Anthropic — Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)                   | Lead agent + sub-agents with explicit "division of labor, problem-solving approaches, and effort budgets" | Each new skill is independently invocable; orchestrator routes                      |
| [Anthropic — Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | "Curating optimal token set during inference"                                                             | Phase 2 cannibalization detector returns ranked report (not raw matrix) to LLM      |

---

## 3. Critique-and-Revise Loops

| Paper                                                                                                                | Method                                                        | Key result                                  |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| [Self-Refine (Madaan et al., 2303.17651)](https://arxiv.org/abs/2303.17651)                                          | Single LLM as generator + refiner + feedback                  | ~20% absolute task improvement, no training |
| [Reflexion (Shinn et al., 2303.11366)](https://arxiv.org/pdf/2303.11366)                                             | Verbal RL — LLM critique of past trajectory loaded in-context | Diminishing returns after 3-5 loops         |
| [Constitutional AI (Bai et al.)](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback) | Critique against explicit principle list; supervised + RLAIF  | Foundational                                |

### Effective Gate Synthesis

1. **Explicit written rubric/principles** (constitution) → `~/.claude/rules/{seo,blog}-constitution.md`
2. **Separate critic from generator** (avoids self-confirmation) → cross-model critic for blog-factcheck
3. **Bounded iteration count** (Reflexion: 3-5 max) → hard cap at 3 in factcheck
4. **Ground-truth checks** to detect divergence/hallucination drift → claim_verifier.py validates against source URLs

### Pipeline Use

Phase 2B blog-factcheck implements all 4. Per Critical Design Rules §6.8 + §6.9:

- Generator: DeepSeek V4 Pro (current Coordinator/Quality-Critic/Prod-Coder)
- Critic: Opus 4.7 OR Kimi K2.6 (different model — false-agreement defense)
- Iteration cap: 3
- Constitutional principle file: `~/.claude/rules/blog-constitution.md`

---

## 4. Cannibalization Detection (Why Embeddings, Not Keywords)

### Semantic Embeddings (SOTA — what we'll build)

[The Ad Firm — AI Cannibalization via Embeddings](https://www.theadfirm.net/how-ai-tools-can-detect-cannibalization-and-fix-internal-competing-keywords-2/)

- Method: content → embeddings (text-embedding-ada-002 cited; we'll use text-embedding-3-small successor) → cosine similarity > 0.85 = high cannibalization probability
- **Documented**: 312 cannibalization clusters discovered on a 5K-page e-commerce site that Screaming Frog + SEMrush keyword-only methods missed

### Vendor Approaches (Lagging — what we'll skip)

- **Semrush**: keyword-position-based; flags keywords with multiple landing-page rankings
- **Ahrefs**: position-history switching as cannibalization signal
- **`claude-blog` community `blog-cannibalization`**: keyword extraction + clustering; misses semantic overlap

### Pipeline Use

Phase 2C builds custom `cannibalization_detector.py` using embeddings + cosine matrix across all 41 Celavii posts (`published/ + intermediate/ + drafts/`). Cosine ≥0.85 = HIGH; 0.75-0.85 = MEDIUM; <0.75 = clean. Per Critical Design Rules §6.10 + §6.11.

---

## 5. Anti-Patterns / Failure Modes

### "AI Slop" Crisis (Word of the Year, Dec 2025)

[Marketing Cloud — Avoiding AI Slop](https://www.themarketingcloud.com/blog/avoiding-ai-slop)

- Production cost → 0 + minimal-engagement-still-profitable creates flood incentive
- **Model collapse** when models train on AI output

### De-Indexing Risk

[Digital Watch — AI Slop's Meteoric Rise](https://dig.watch/updates/ai-slop-content-social-media)

- AI-content-heavy sites suffered **95-100% organic traffic loss** in Google updates

### Anti-AI Marketing Trend (2026)

[Liinks — AI Slop Tipping Point](https://www.liinks.co/blog/the-ai-slop-tipping-point)

- 2026 framed as "anti-AI marketing year" — authenticity premium up 10x
- 1 in 5 YouTube recommendations now show slop characteristics

### Concrete Failure Modes

1. Agent doom loops (no hard stop on revision count)
2. Generator-critic same-model degeneracy (false agreement)
3. Zero-cost incentive to publish
4. Model-collapse from synthetic-only training data
5. **Generic AI tone** — "delve", "tapestry", "multifaceted", "navigate the landscape" — flagged as -50% engagement

### Pipeline Use

- Hard iteration caps (≤3 refinement loops) → Critical Design Rule §6.9
- **Cross-model critic** (DeepSeek V4 Pro generates, Opus/Kimi critiques) → §6.8
- Anti-slop word list in `blog_vocab_analyze.py` extension → Phase 2B.8
- Lineage tagging on every artifact (raw archive supports this) → §6.3
- Anti-slop rubric in constitution: specificity, novelty, sourced claims, distinctive POV → §6.10

---

## 6. SEO Drift Detection Methodology

[claude-seo seo-drift skill](https://github.com/dontriskit/claude-seo/tree/main/skills/seo-drift)

**17 baseline rules monitored**:

- Title tag changes
- Meta description changes
- H1-H3 heading changes
- Schema.org markup additions/removals
- Robots meta directive changes (noindex, nofollow)
- Canonical URL changes
- Open Graph tag changes
- Core Web Vitals regression (LCP, FID, CLS)
- Mobile-friendliness changes
- HTTPS/HTTP transitions
- Internal link count changes
- External link count changes
- Image alt text changes
- Sitemap inclusion/exclusion
- Hreflang changes
- AMP version changes
- Page word count changes (>20% delta)

### Pipeline Use

Phase 2A captures baselines for all 15 (13 prior + 2 new) published posts in SQLite at `~/.config/celavii-seo/drift/baselines.db`. Weekly cron compares; alerts on HIGH severity. Per Critical Design Rule §6.14 (canonical URLs only).

---

## 7. Backlink Authority Building

### Free Backlink APIs

| Source                                                                                                  | Free tier           | What it returns                               |
| ------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------- |
| [Moz Link Explorer API](https://moz.com/products/api)                                                   | 10K queries/month   | Domain Authority, top pages, link profile     |
| [Bing Webmaster Tools API](https://www.bing.com/webmasters/help/apis-bing-webmaster-tools-api-1eccf48e) | Standard API        | Inbound links, anchor text, referring domains |
| [CommonCrawl Domain Graph](https://commoncrawl.org/the-data/get-started/)                               | Public (no API key) | Webgraph data; build custom backlink reports  |

### Vendor APIs (Premium — Skipped for Now)

- DataForSEO: $0.001/row, deep backlink data
- Ahrefs API: enterprise pricing
- Semrush API: enterprise pricing

### Pipeline Use

Phase 3A uses free Moz + Bing + CommonCrawl. Sufficient for our scale (Celavii has ~18 referring domains; targeting +5 by May 27).

---

## 8. Hub vs Pillar Content (For Cluster Planning)

[Animalz — Hubs vs Pillars](https://www.animalz.co/blog/hubs-vs-pillars)

- **Hub** = navigational overview that links to subtopics
- **Pillar** = single comprehensive long-form piece
- 2026 ranking depth: high-ranking pillars now 3,000-5,000 words

Our `influencer-audience-intelligence.mdx` (2,607 words) is a **pillar** but ~30% short of the 4-5K target. Our `free-instagram-audience-overlap-tools.mdx` (3,866 words) is a **listicle** (different SERP intent — comparison-shopping).

### Pipeline Use

Phase 3B `seo-cluster` should explicitly tag posts as Hub vs Pillar in cluster output. Helps prioritize: pillars get the 4-5K word expansion treatment; hubs stay short.

---

## 9. Outdated / Disproven Beliefs (Don't Repeat These Mistakes)

| Belief                                              | Status (2026)                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| "Adopt all community skills wholesale"              | ❌ Most overlap our existing skills; selective adoption only                       |
| "Keyword cannibalization detection is enough"       | ❌ Misses 312 semantic clusters per The Ad Firm; need embeddings                   |
| "Same-model critic is fine"                         | ❌ Self-Refine literature: false agreement; cross-model required                   |
| "More iterations = better refinement"               | ❌ Reflexion: diminishing returns after 3-5; cap at 3                              |
| "GSC URL Inspection cached status is current"       | ❌ Always force fresh on inspection-API call (Critical Rule §6.12)                 |
| "GA4 default attribution is fine for SEO reporting" | ❌ Always use Data-Driven model (Critical Rule §6.13)                              |
| "Drift baselines on any URL"                        | ❌ Canonical URLs only; non-canonical = false-positive noise (Critical Rule §6.14) |

---

## 10. Cost Model

### Phase 1 — Google API Foundation (Free)

| Service                   | Free tier      | Our usage | Cost   |
| ------------------------- | -------------- | --------- | ------ |
| Search Console API        | 2K queries/day | ~50/day   | $0     |
| Indexing API              | 200 URLs/day   | ~5/week   | $0     |
| CrUX API                  | Public dataset | ~10/week  | $0     |
| Google Analytics Data API | Standard tier  | ~50/month | $0     |
| **Phase 1 monthly**       |                |           | **$0** |

### Phase 2 — Quality Gates ($0 NET NEW)

| Service                             | Cost                                                                          | Our usage                                   | Net new cost                                           |
| ----------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| Gemini `gemini-embedding-2-preview` | reuses existing `GEMINI_API_KEY`                                              | 41 posts × 3K tokens × weekly               | **$0 net new** (within existing Gemini spend)          |
| Cross-model critic                  | reuses existing Kimi K2.6 (Blogger) + DeepSeek V4 Pro (Quality Critic) agents | ~5 articles/week × 2K tokens × 3 iterations | **$0 net new** (within existing model strategy budget) |
| **Phase 2 monthly NET NEW**         |                                                                               |                                             | **$0**                                                 |

**v1.2 update**: Original cost model assumed new OpenAI/Voyage embedding API + Opus 4.7 critic. After validating against existing patterns in `social_listener` and `model-strategy.md`, both can route through existing keys/agents.

### Phase 3 — Authority + Cluster (Free)

| Service                              | Cost   |
| ------------------------------------ | ------ |
| Moz Link Explorer (free tier)        | $0     |
| Bing Webmaster Tools                 | $0     |
| CommonCrawl                          | $0     |
| DataForSEO SERP (optional, deferred) | TBD    |
| **Phase 3 monthly**                  | **$0** |

### Phase 4 — QoL ($0 NET NEW)

| Service                      | Cost                             | Notes                                      |
| ---------------------------- | -------------------------------- | ------------------------------------------ |
| Gemini API (image gen + TTS) | reuses existing `GEMINI_API_KEY` | Already in production for asset generation |

### Total Monthly Cost (Phases 1-3 + 4B mandatory)

**$0 net new** — every API spend reuses existing keys (`GEMINI_API_KEY` for embeddings/TTS/CrUX) or routes through existing agent stack (Kimi K2.6 + DeepSeek V4 Pro for cross-model critic). Cost increase versus baseline: zero.

---

## 11. References

- Internal: `~/dev/workspace/projects/celavii/research/seo/strategy-state-v2-2026-04-27.json` (indexation diagnosis)
- Companion: `~/dev/openclaw/.system/features/social-strategy/docs/frameworks.md` (parallel patterns)
- External: see [repos.md](repos.md) for full source links
