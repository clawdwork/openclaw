# Frameworks & Methodology Audit

> 12-category sweep of frameworks, papers, methodology articles, and empirical 2025–2026 data informing the social-agents pipeline.
> **Date**: 2026-04-28

---

## 1. Content Strategy Frameworks

### Hub & Spoke / Pillar-Cluster

[Animalz — Hubs vs Pillars](https://www.animalz.co/blog/hubs-vs-pillars) (industry-standard, paywall-free)

- **Hub** = navigational overview that links to subtopics
- **Pillar** = single comprehensive long-form piece
- 2026 ranking depth: high-ranking pillars now 3,000–5,000 words
- **Pipeline use**: Phase 4 (Plan) differentiates "social hub posts" (linkers/round-ups) from "social pillars" (deep authority pieces)

### 4E Framework (Educate, Entertain, Engage, Empower)

[Foundation Inc — 4Es of Content](https://foundationinc.co/lab/4es-content) (industry blog, paywall-free)

- **Empower** = make audience feel capable, not just motivated
- Best content combines ≥2 E's
- **Pipeline use**: Tag every planned post with one or more E's; require Educate+Empower mix on Celavii product channel

### Three-Circle / AIDA-for-social

Folk frameworks. The three-circle Venn (passion/expertise/audience) is folklore-level — no peer-reviewed canonical source. **Treat as heuristic, not gospel.**

---

## 2. Multi-Channel Content Architectures

### MrBeast Network

[Brandeploy — MrBeast content machine](https://www.brandeploy.io/en-mrbeast-youtube-content-strategy-ai/) (case study)

- Separate fully-dubbed language channels; AI voice cloning + lip-sync for simultaneous multi-language launches
- Pre-launch thumbnail/title A/B testing via small ad spends

### Linus Media Group

[Wikipedia — Linus Media Group](https://en.wikipedia.org/wiki/Linus_Media_Group) (encyclopedia, well-cited)

- Channel-per-format split: LTT (flagship), Techquickie (60–90s), TechLinked (news), ShortCircuit (unboxings)
- **Channel = format, not topic**

### Hormozi 2026 Pivot

[Startupspells — Hormozi/MrBeast live-streaming pivot](https://startupspells.com/p/mrbeast-advice-alex-hormozi-live-streaming-content-strategy)

- Pivoted from "viral views" to "interest media" (depth over reach)
- Live-streaming as a core engine

### HubSpot Loop Marketing

[HubSpot — Multi-channel content distribution](https://blog.hubspot.com/marketing/multi-channel-content-distribution) (industry-standard)

- Multi-channel distribution = "Amplify" stage
- **Explicit dual targeting**: human audiences AND AI search engines

### Recurring patterns

1. Format-as-channel, not topic-as-channel
2. One pillar → dozens of atomic pieces
3. Language/locale dubbing is now table stakes
4. Thumbnail/hook A/B is treated as a pre-publish gate

**Pipeline use**: Phase 4 (Plan) and Phase 5 (Deliver) should support per-channel format profiles + a thumbnail/hook critic gate before publish.

---

## 3. Posting Cadence (2025–2026 Empirical)

| Platform  | Optimal cadence                                             | Source                                                                                             |
| --------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| TikTok    | 2–5x/week → +17% views; 11+/week → +34%                     | [Buffer State of Social 2026](https://buffer.com/resources/state-of-social-media-engagement-2026/) |
| TikTok    | Daily posters grow followers **3.5x faster** than 2–3x/week | Buffer 11M-post analysis                                                                           |
| YouTube   | ≥12 uploads/month → +53% views, +66% subs                   | vidIQ 5M-channel study                                                                             |
| Instagram | 3–5 posts/week; Reels 3–5/week sweet spot                   | Sprout Social                                                                                      |
| X         | 3–5x/day                                                    | Sprout Social                                                                                      |
| LinkedIn  | 1–2x/day OR 3–5x/week                                       | Sprout Social                                                                                      |

[Sprout Social — Best Times to Post 2026](https://sproutsocial.com/insights/best-times-to-post-on-social-media/)

**2026 framing**: "highest cadence sustainable without quality drop" dominates — pure volume is no longer the win.

**Pipeline use**: Phase 4 cadence rules per platform; Phase 6 (Report) flags under/over-posting against benchmarks.

---

## 4. Engagement Metrics & Scoring

### Standard Formula

`ER = (Likes + Comments + Shares + Saves) / Followers × 100`

### TikTok Variant (preferred for individual videos)

`ER = (Likes + Comments + Shares + Saves) / Views × 100`

[Influencer Marketing Factory — TikTok ER calculation](https://theinfluencermarketingfactory.com/how-to-calculate-tiktok-engagement-rate/)

### 2026 Benchmarks

[Digital Information World — 2026 Social Media Benchmark](https://www.digitalinformationworld.com/2026/03/2026-social-media-benchmark-tiktok.html) (sourced from Socialinsider 52M-post study)

| Platform  | Median ER 2026                |
| --------- | ----------------------------- |
| TikTok    | 3.70% (+49% YoY)              |
| Reels     | 7.5% (Creator Economy Report) |
| Instagram | 0.48%                         |
| Facebook  | 0.15%                         |
| X         | 0.12%                         |

### Critical Finding: No Lighthouse-Equivalent Social Score Exists

Searched explicitly. Closest analogs are vendor "social health" dashboards (Sprout, Emplifi, Dash) — proprietary weighted aggregates, not reproducible.

**Opportunity**: Celavii could publish a Social Score (composite of ER, save-rate, follow-conversion, retention). Real gap in the market.

**Pipeline use**: Phase 2 (Analyze) computes ER per-platform with the right denominator; Phase 6 reports vs benchmark.

---

## 5. AI for Content Production — SOTA

| Source                                                                                                                         | Key insight                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Anthropic — Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)                       | Patterns: orchestrator-worker, evaluator-optimizer, routing — directly maps to our critic-gate architecture                                       |
| [Anthropic — Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)                   | Lead agent + sub-agents with explicit "division of labor, problem-solving approaches, and effort budgets." Prompts = frameworks for collaboration |
| [Anthropic — Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | Reframes prompt eng as "curating optimal token set during inference"                                                                              |
| [Anthropic Cookbooks (GitHub)](https://github.com/anthropics/claude-cookbooks)                                                 | Sub-agent patterns (Haiku worker + Opus orchestrator), JSON mode, prompt caching                                                                  |

**Pipeline use**: Adopt **evaluator-optimizer** for the critic gate; **orchestrator-worker** for atomic sub-skills.

---

## 6. Trend Detection Methodology

| Tool                                                                           | Method                                                                                                                              |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| [Glimpse](https://meetglimpse.com/)                                            | Real-time Google Trends extension. Absolute volumes + growth-rate % + seasonality decomposition. Forecasts long-term sustainability |
| [Semrush — Exploding Topics](https://www.semrush.com/kb/1490-exploding-topics) | ML + human curation over millions of unstructured data points (Reddit, YouTube, podcast transcripts). Closed-source                 |
| [TikTok Creative Center](https://ads.tiktok.com/business/creativecenter/)      | Daily-updated trend lists with explicit _velocity_ flag. Filterable region + 7d/30d window                                          |

### Underlying Math (Industry Consensus)

- **Velocity** = first derivative of view/search volume
- **Acceleration** = second derivative
- **"Exploding"** = z-score of growth rate vs same-cohort baseline > 2–3 sigma

### Critical Caveat

Platform-native trend lists surface trends that have already peaked. For early detection, third-party outlier detection over hashtag/sound view-count time-series is required.

**Pipeline use**: Phase 1 (Discover) computes velocity AND acceleration AND baseline-normalized z-score, not raw volume. Treat platform-native trend lists as **lagging**, not leading.

---

## 7. Hook Frameworks

### Justin Welsh (LinkedIn-focused)

[Anatomy of a Viral LinkedIn Post](https://www.justinwelsh.me/newsletter/the-anatomy-of-a-viral-linkedin-post)

- Pattern: specific sub-niche + scroll-stopping first line + curiosity hook
- Documented: 4.7M impressions on a single post
- VFCA copywriting formula

### Curiosity Gap (Academic Basis)

[Mewse — Curiosity Hooks](https://mewse.ai/curiosity-hooks)

- Loewenstein's "information gap" theory — curiosity = discomfort from gap between known and wanted-to-know
- **Empirical sweet spot**: medium gap (too little = boring, too much = abandonment)

### 5 Dominant Archetypes (recur across analyses)

1. **Curiosity Gap** — withholding key info
2. **Contrarian Take** — challenge conventional wisdom
3. **Story Hook** — narrative cold-open
4. **Authority Claim** — credibility-first
5. **Pattern Interrupt** — contrasting opposites

### 3-Second Hold Metric

[Opus.pro — TikTok Hook Formulas](https://www.opus.pro/blog/tiktok-hook-formulas)

- TikTok/Reels viral hooks must produce sub-3s retention spike
- Quantifiable via: 3s retention rate, save rate, comment-to-view ratio
- **Like rate is now a weak signal**

**Pipeline use**: Phase 5 (Deliver) generates 5+ hook variants per post tagged by archetype; Gate C critic scores each on a rubric (specificity, gap-size, archetype clarity).

---

## 8. Repurposing Taxonomies

### Gary Vee Reverse Pyramid (Canonical)

[GV Content Model PDF](https://s3.amazonaws.com/gv2016wp/wp-content/uploads/20180725172810/GV-Content-Model-1.pdf)

- One pillar (30–60min keynote/vlog/podcast) → atomized into 30+ micro-pieces, contextual to each platform
- **Documented result**: 1 keynote → 35M total views; one repurposed Insta post (712K views) outperformed the full keynote (295K) by 7x reach, 60x engagement

**Pipeline use**: Build Phase 5 (Deliver) and `social-repurpose` skill around this. Every long-form input must spawn N atomic outputs with explicit per-channel formatting. "10x content" is the same model rebranded.

---

## 9. Brand Voice Modeling

### NN/g Four Dimensions of Tone (Industry-Standard)

[NN/g — Four Dimensions of Tone of Voice](https://www.nngroup.com/articles/tone-of-voice-dimensions/) (paywall-free)

| Dimension      | Axis                          |
| -------------- | ----------------------------- |
| Humor          | funny ↔ serious               |
| Formality      | formal ↔ casual               |
| Respectfulness | respectful ↔ irreverent       |
| Enthusiasm     | enthusiastic ↔ matter-of-fact |

Tone = a point in 4D space.

### Mailchimp Content Style Guide (OSS)

[Voice and Tone](https://styleguide.mailchimp.com/voice-and-tone/) | [GitHub repo](https://github.com/mailchimp/content-style-guide)

- Clarity > entertainment
- **Voice fixed, tone shifts with user emotional state**

### Atlassian

[Voice and Tone Principles](https://atlassian.design/content/voice-and-tone-principles/)

- Three principles: bold, optimistic, practical, with a wink

### Schema reality check

No canonical OSS JSON schema for brand voice exists. Mailchimp's repo is closest (Markdown, not JSON).

**Pipeline use**: Encode brand voice as NN/g 4D vector + Mailchimp-style tone-by-context matrix in `.styles/[company]/voice.json`. **Schema is opportunity for Celavii to define and publish.**

---

## 10. Cannibalization / Overlap Detection

### Semantic Embeddings (SOTA)

[The Ad Firm — AI Cannibalization via Embeddings](https://www.theadfirm.net/how-ai-tools-can-detect-cannibalization-and-fix-internal-competing-keywords-2/)

- Method: content → embeddings (text-embedding-ada-002 cited as best cost/accuracy) → cosine similarity > 0.9 = high cannibalization probability
- **Documented**: 312 cannibalization clusters discovered on a 5K-page e-commerce site that Screaming Frog + SEMrush keyword-only methods missed

### Vendor approaches (lagging)

- **Semrush**: keyword-position-based; flags keywords with multiple landing-page rankings
- **Ahrefs**: position-history switching as cannibalization signal

**Pipeline use** (`social-cannibalization`): Embed every post → cosine-similarity matrix per channel + 30-day window. Flag pairs > 0.85. **New social dimension is _temporal_** — two near-identical posts 3 days apart = bad; same posts 90 days apart = fine.

---

## 11. Critique-and-Revise Loops

| Paper                                                                                                                | Method                                                        | Key result                                  |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| [Self-Refine (Madaan et al., 2303.17651)](https://arxiv.org/abs/2303.17651)                                          | Single LLM as generator + refiner + feedback                  | ~20% absolute task improvement, no training |
| [Reflexion (Shinn et al., 2303.11366)](https://arxiv.org/pdf/2303.11366)                                             | Verbal RL — LLM critique of past trajectory loaded in-context | Diminishing returns after 3–5 loops         |
| [Constitutional AI (Bai et al.)](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback) | Critique against explicit principle list; supervised + RLAIF  | Foundational                                |

### What Makes a Gate Effective (Synthesized)

1. **Explicit written rubric/principles** (constitution)
2. **Separate critic from generator** (avoids self-confirmation)
3. **Bounded iteration count** (Reflexion: 3–5 max)
4. **Ground-truth checks** to detect divergence/hallucination drift

**Pipeline use**: Each phase critic gate follows Self-Refine structure with a Constitutional-AI-style principle file (`.claude/rules/`).

---

## 12. Anti-Patterns / Failure Modes

### "AI Slop" Crisis (Word of the Year, Dec 2025)

[Marketing Cloud — Avoiding AI Slop](https://www.themarketingcloud.com/blog/avoiding-ai-slop)

- Production cost → 0 + minimal-engagement-still-profitable creates flood incentive
- **Model collapse** when models train on AI output

### De-Indexing Risk

[Digital Watch — AI Slop's Meteoric Rise](https://dig.watch/updates/ai-slop-content-social-media)

- AI-content-heavy sites suffered **95–100% organic traffic loss** in Google updates

### Work SLOP Cost

[SalesChoice — SLOP Risk Management 2026](https://www.saleschoice.com/the-crucial-2026-ai-skill-slop-risk-management/)

- HBR study: $9M/yr lost productivity for 10K-employee firm

### Anti-AI Marketing Trend (2026)

[Liinks — AI Slop Tipping Point](https://www.liinks.co/blog/the-ai-slop-tipping-point)

- 2026 framed as "anti-AI marketing year" — authenticity premium up 10x
- **+1 in 5 YouTube recommendations now show slop characteristics**

### Concrete Failure Modes

1. Agent doom loops (no hard stop on revision count)
2. Generator-critic same-model degeneracy (false agreement)
3. Zero-cost incentive to publish
4. Model-collapse from synthetic-only training data
5. Generic AI tone ("delve", "tapestry", "multifaceted") — flagged as -50% engagement

**Pipeline use**:

- Hard iteration caps (≤3 refinement loops)
- **Cross-model critic** (Sonnet generates, Opus critiques)
- Human-in-loop checkpoint per pillar
- Lineage tagging on every artifact (raw-data archive supports this)
- Anti-slop rubric in the constitution: specificity, novelty, sourced claims, distinctive POV

---

## Outdated / Disproven Beliefs

| Belief                                   | Status (2026)                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| "Like rate as primary engagement signal" | ❌ Replaced by save rate + retention rate (TikTok/Reels weight saves highest)         |
| "Volume always wins"                     | ⚠️ Partially disproven; quality + sustainability dominate (Buffer 2026)               |
| "Viral views = success"                  | ❌ Hormozi/MrBeast school explicitly rejects in 2026; "interest media" depth replaces |
| "Three-circle method"                    | ⚠️ Folk framework, no canonical academic source; treat as heuristic                   |
| "27 hooks" listicles                     | ⚠️ Every "X hooks" listicle traces to ~5–7 underlying archetypes — use the archetypes |
