# SEO Strategy Suite — Implementation Tracker

> **Last Updated:** 2026-02-18  
> **Reference:** [IMPLEMENTATION.md](./IMPLEMENTATION.md)

---

## Phase 0: Foundation (COMPLETED)

Everything built prior to the strategy suite that it depends on.

### 0.1 Telegram Command Infrastructure
- [x] **Root cause fix** — `BOT_COMMANDS_TOO_MUCH` resolved by hiding 54 skills with `user-invocable: false`
- [x] **Gateway restart** — PID verified, RPC ok, no Telegram errors
- [x] **Command registration** — 11 commands registered in Telegram menu

### 0.2 SEO Sub-Skills (14 skills)
- [x] `seo-audit` — Full website SEO audit
- [x] `seo-page` — Single page analysis
- [x] `seo-technical` — Technical SEO audit
- [x] `seo-content` — Content quality + E-E-A-T
- [x] `seo-schema` — Schema.org structured data
- [x] `seo-images` — Image SEO optimization
- [x] `seo-sitemap` — XML sitemap validation
- [x] `seo-geo` — GEO / AI search optimization
- [x] `seo-plan` — Strategic SEO planning
- [x] `seo-programmatic` — Programmatic SEO
- [x] `seo-competitor-pages` — Comparison/alternatives pages
- [x] `seo-hreflang` — International SEO
- [x] `seo-report-generator` — End-to-end report generation
- [x] `seo-product-page` — Product page SEO SOP (16 steps)

### 0.3 SEO Orchestrator + Commands
- [x] `seo-orchestrator/SKILL.md` — Router skill with task routing table
- [x] `seo-orchestrator/commands/` — 14 command files (symlinked from agent-workspace)
- [x] `seo-orchestrator/references/` — Reference files (symlinked from agent-workspace)

### 0.4 SEO Scripts (Existing)
- [x] `scripts/run-apify-ahrefs.sh` — Ahrefs API via Apify (keywords, competitors, overview)
- [x] `scripts/run-apify-serp.sh` — SERP analysis via Apify (`apify/google-search-scraper`)
- [x] `scripts/run-apify-semrush-da.sh` — Semrush Domain Authority (`radeance/semrush-scraper`)
- [x] `scripts/run-sitemap-gen.sh` — Sitemap generation + crawl
- [x] `scripts/validate-proposal.sh` — 12-point proposal validation
- [x] `scripts/estimate-revenue.sh` — Revenue projection calculator

### 0.4b SEO Scripts — Tier 1: New Apify Integrations (NOT STARTED)

These tools directly power `/keyword_opportunities` and `/seo_strategy`.

| # | Script | Apify Actor | What It Gets | Why We Need It | Status |
|---|--------|-------------|-------------|----------------|--------|
| 1 | `run-apify-trends.sh` | `apify/google-trends-scraper` | Interest over time, rising queries, regional demand, trending keywords | Identifies **emerging keywords** before competition. Adds "trend direction" signal to priority scoring — a rising keyword with low KD is a goldmine | [ ] |
| 2 | `run-apify-autocomplete.sh` | `simpleapi/google-search-autocomplete-scraper` | Real-time autocomplete suggestions (50+ per seed keyword) | Generates **long-tail keyword ideas** from actual user searches. Finds low-hanging fruit Ahrefs misses because they're too niche for its database | [ ] |
| 3 | `run-apify-rank-checker.sh` | `caprolok/google-rank-checker` | Real-time rank position for specific keyword+domain pairs | **Quick wins validation** — confirms positions 11-30 in real-time before recommending action. Ahrefs data can be 2-4 weeks stale | [ ] |
| 4 | `run-apify-spyfu.sh` | SpyFu scraper (TBD) | Competitor PPC keywords, ad spend estimates, organic keyword history | See what keywords competitors **pay for** — if they buy ads, it converts. Free organic content targeting those keywords = high ROI | [ ] |

**Tier 1 Script Specs:**

#### `run-apify-trends.sh`
```
Usage: run-apify-trends.sh "keyword1" "keyword2" ... [--timeframe 12months] [--geo US] [--output file]
Actor: apify/google-trends-scraper
Output: interest_over_time[], rising_queries[], related_topics[], regional_interest[]
Cost: ~$0.50/run (5 keywords)
```

#### `run-apify-autocomplete.sh`
```
Usage: run-apify-autocomplete.sh "seed1" "seed2" ... [--depth 2] [--output file]
Actor: simpleapi/google-search-autocomplete-scraper
Output: suggestions[] (50+ per seed), each with estimated search volume
Cost: ~$0.25/run (5 seeds)
Depth: level 1 = direct suggestions; level 2 = suggestions of suggestions (more long-tail)
```

#### `run-apify-rank-checker.sh`
```
Usage: run-apify-rank-checker.sh {domain} "keyword1" "keyword2" ... [--country us] [--output file]
Actor: caprolok/google-rank-checker
Output: { keyword, position, url, title, snippet } per keyword
Cost: ~$0.10/run (20 keywords)
Use: validate quick wins identified by Ahrefs before recommending action
```

#### `run-apify-spyfu.sh`
```
Usage: run-apify-spyfu.sh {domain} [--output file]
Actor: TBD (research needed — may use radeance/spyfu-scraper or similar)
Output: paid_keywords[], organic_keywords_history[], ad_spend_estimate, top_competitors[]
Cost: ~$0.50/run
Use: identify high-converting keywords (competitors pay for them = proven ROI)
```

### 0.4c SEO Scripts — Tier 2: Open Source + Free API Integrations (NOT STARTED)

These tools improve audit quality and content authority.

| # | Script | Source | What It Gets | Why We Need It | Status |
|---|--------|--------|-------------|----------------|--------|
| 5 | `run-pagespeed.sh` | Google PageSpeed Insights API (FREE) | Real CrUX field data: FCP, LCP, CLS, INP from actual Chrome users | **Real user performance** vs synthetic Lighthouse lab data. Makes audit scores credible — "92% of your real users experience LCP under 2.5s" | [ ] |
| 6 | `run-greenflare.sh` | Greenflare (open source, Python) | Full site crawl: broken links, redirects, canonicals, status codes, crawl depth, response times | Better than `broken-link-checker` for large sites. Gives internal link graph + crawl depth analysis | [ ] |
| 7 | `run-seonaut.sh` | SEOnaut (open source, Go binary) | Technical SEO crawl: headings, meta, images, structured data, CWV per page | Complements Lighthouse with **per-page heading/meta uniqueness analysis** — directly powers cannibalization checks | [ ] |
| 8 | `run-schema-validator.sh` | Google Rich Results Test API or schema-dts npm | Deep schema.org validation beyond Lighthouse | Validates JSON-LD against spec, checks for missing required properties, tests Rich Results eligibility | [ ] |

**Tier 2 Script Specs:**

#### `run-pagespeed.sh`
```
Usage: run-pagespeed.sh "https://example.com" [--strategy mobile|desktop] [--output file]
API: https://www.googleapis.com/pagespeedonline/v5/runPagespeed
Auth: None required (free, rate-limited to 25K queries/day)
Output: {
  field_data: { fcp, lcp, cls, inp, ttfb } (real Chrome users),
  lab_data: { fcp, lcp, cls, tbt, si } (Lighthouse synthetic),
  opportunities: [{ title, savings_ms }],
  diagnostics: [{ title, details }]
}
Cost: FREE
```

#### `run-greenflare.sh`
```
Usage: run-greenflare.sh "https://example.com" [--max-pages 500] [--output file]
Install: pip install greenflare (or use pre-built binary)
Output: {
  pages_crawled: N,
  status_codes: { 200: N, 301: N, 404: N },
  broken_links: [{ source, target, status }],
  redirect_chains: [{ url, chain_length, final_url }],
  canonicals: [{ url, canonical, match: bool }],
  crawl_depth: { avg, max, distribution },
  response_times: { avg_ms, p95_ms, slow_pages: [] }
}
Cost: FREE (open source)
Prerequisite: pip install greenflare
```

#### `run-seonaut.sh`
```
Usage: run-seonaut.sh "https://example.com" [--max-pages 200] [--output file]
Install: Download Go binary from https://seonaut.org/
Output: {
  pages: [{
    url, title, h1, h2s[], meta_description,
    images: [{ src, alt, size_kb }],
    schema_types: [],
    word_count, internal_links, external_links
  }],
  duplicate_titles: [{ title, urls[] }],
  duplicate_h1s: [{ h1, urls[] }],
  duplicate_descriptions: [{ desc, urls[] }],
  missing_alt_tags: [{ url, img_src }]
}
Cost: FREE (open source)
Prerequisite: Download binary or `go install`
Key value: duplicate_titles/h1s/descriptions → direct cannibalization detection
```

#### `run-schema-validator.sh`
```
Usage: run-schema-validator.sh "https://example.com" [--output file]
API: Google Rich Results Test (or local validator)
Output: {
  schemas_found: [{ type, properties, valid: bool, errors: [] }],
  rich_results_eligible: bool,
  missing_required: [{ type, property }]
}
Cost: FREE
```

### 0.4d Integration: How New Tools Fit Into Pipeline

```
/keyword_opportunities (Phase 1)
├── Ahrefs keywords (existing ✅)          → current positions + volumes
├── Ahrefs competitors (existing ✅)       → competitor gaps  
├── Google SERP (existing ✅)              → SERP features, PAA
├── Google Autocomplete (NEW Tier 1)       → long-tail keyword expansion
├── Google Trends (NEW Tier 1)             → rising/falling trend signal
├── Rank Checker (NEW Tier 1)              → real-time position validation
├── SpyFu (NEW Tier 1)                     → competitor PPC = proven converters
└── Sitemap gen (existing ✅)              → existing content inventory

/seo_strategy Phase 1: Discover
├── seo-audit (existing ✅)                → Lighthouse scores
├── PageSpeed Insights (NEW Tier 2)        → real CrUX field data
├── Greenflare (NEW Tier 2)                → deep crawl: redirects, canonicals, link graph
├── SEOnaut (NEW Tier 2)                   → per-page heading/meta for cannibalization
├── Schema Validator (NEW Tier 2)          → rich results eligibility
├── Sitemap gen (existing ✅)              → content inventory
└── Ahrefs competitors (existing ✅)       → competitive landscape

/seo_strategy Phase 3: Prioritize (scoring formula update)
  Priority = (Vol × CTR × Trend↑) / (KD × Effort)
  NEW: Trend↑ multiplier from Google Trends (rising = 1.5x, stable = 1.0x, falling = 0.7x)
  NEW: PPC signal from SpyFu (competitor pays for keyword = 1.3x bonus)
```

### 0.4e Tool Installation Prerequisites

| Tool | Install Command | Verify Command | Notes |
|------|----------------|----------------|-------|
| Google Trends | Apify account (existing) | `curl -s "https://api.apify.com/v2/acts/apify~google-trends-scraper"` | Uses APIFY_API_TOKEN |
| Google Autocomplete | Apify account (existing) | `curl -s "https://api.apify.com/v2/acts/simpleapi~google-search-autocomplete-scraper"` | Uses APIFY_API_TOKEN |
| Google Rank Checker | Apify account (existing) | `curl -s "https://api.apify.com/v2/acts/caprolok~google-rank-checker"` | Uses APIFY_API_TOKEN |
| PageSpeed Insights | None (free API) | `curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com"` | No API key needed |
| Greenflare | `pip install greenflare` | `greenflare --version` | Python 3.8+ |
| SEOnaut | Download from seonaut.org | `seonaut --version` | Go binary, macOS/Linux |
| Schema Validator | npm or API | `npx schema-dts validate` or Google API | Multiple options |

### 0.4f Estimated Costs Per Strategy Run

| Tool | Cost Per Run | Runs Per Strategy | Total |
|------|-------------|-------------------|-------|
| Ahrefs Keywords (existing) | ~$0.50 | 2-3 (domain + competitors) | ~$1.50 |
| Ahrefs Competitors (existing) | ~$0.25 | 1 | ~$0.25 |
| SERP Scraper (existing) | ~$0.25 | 2-3 (top keywords) | ~$0.75 |
| Semrush DA (existing) | ~$0.25 | 1 | ~$0.25 |
| Google Trends (NEW) | ~$0.50 | 1 (5 keywords) | ~$0.50 |
| Google Autocomplete (NEW) | ~$0.25 | 1 (5 seeds) | ~$0.25 |
| Rank Checker (NEW) | ~$0.10 | 1 (20 keywords) | ~$0.10 |
| SpyFu (NEW) | ~$0.50 | 1 | ~$0.50 |
| PageSpeed (NEW) | FREE | 1-3 | $0.00 |
| Greenflare (NEW) | FREE | 1 | $0.00 |
| SEOnaut (NEW) | FREE | 1 | $0.00 |
| Schema Validator (NEW) | FREE | 1 | $0.00 |
| **TOTAL per /seo_strategy** | | | **~$4.10** |

### 0.5 SOP Reference Files
- [x] `references/product-seo-llm-sop-2026.md` — Updated 2026 SOP (Steps 1-16)
- [x] `references/product-publication-schedule.md` — Anti-spam publication cadence
- [x] `references/product-seo-llm-sop-original.md` — Original SOP
- [x] `references/cwv-thresholds.md` — Core Web Vitals thresholds
- [x] `references/eeat-framework.md` — E-E-A-T scoring framework
- [x] `references/quality-gates.md` — Quality gate definitions
- [x] `references/schema-types.md` — Schema.org type reference

### 0.6 Telegram Command Wrappers (Layer 1 + 2)
- [x] `skills/seo-audit-quick/SKILL.md` — Quick 7-tool health check
- [x] `skills/competitor-seo/SKILL.md` — DA + keyword gap analysis
- [x] `skills/product-page-report/SKILL.md` — Full product page pipeline → PDF
- [x] `skills/content-cluster/SKILL.md` — Silo + articles (enhanced with SOP rules)
- [x] `skills/generate-seo-report/SKILL.md` — Site-wide audit → PDF

### 0.7 Content Cluster Enhancement
- [x] Silo URL structure enforcement (`/{category}/{subcategory}/{slug}/`)
- [x] Cannibalization prevention rules (unique H1/H2/meta, heading tracker)
- [x] LLM micro-summary blocks (AI definition block per article)
- [x] H2 outline table (no duplicate H2s across articles)
- [x] Anchor text rotation (8-10 variants, no exact-match repetition)
- [x] Spam risk checklist (7-point verification)
- [x] Detailed interlinking rules (SOP Steps 14.1-14.4)

### 0.8 Symlinks (Gateway Skill Discovery)
- [x] `openclaw/skills/seo-orchestrator/commands` → `agent-workspace/skills/seo/commands`
- [x] `openclaw/skills/seo-orchestrator/references` → `agent-workspace/skills/seo/references`
- [x] All 14 SEO sub-skills symlinked to `openclaw/skills/`
- [x] All workspace skills (celavii-*, quality-critic, etc.) symlinked

---

## Phase 1: `/keyword_opportunities` (NOT STARTED)

**Goal:** Build the foundation Layer 1 tool — scan a domain for quick wins, low-hanging fruit, and content gaps.

### 1.1 Requirements
- [ ] **R1:** Accept `<domain>` as only required input
- [ ] **R2:** Auto-discover competitors via Ahrefs
- [ ] **R3:** Identify quick wins (positions 11-30) with specific action per keyword
- [ ] **R4:** Find low-hanging fruit (KD < 30, volume > 100)
- [ ] **R5:** Build content gap matrix (competitor keywords domain doesn't rank for)
- [ ] **R6:** Score all opportunities with priority formula: `(Vol × CTR) / (KD × Effort)`
- [ ] **R7:** Produce top 10 content briefs (ready to write, following SOP cannibalization rules)
- [ ] **R8:** Include revenue projection for top 20 opportunities
- [ ] **R9:** Work standalone (no dependency on state file)
- [ ] **R10:** Optionally read/write `strategy-state.json` when called from `/seo_strategy`

### 1.2 Steps

| # | Step | Description | File(s) | Status |
|---|------|-------------|---------|--------|
| 1.2.1 | Create command spec | Full command definition with process, tools, output template | `agent-workspace/skills/seo/commands/keyword-opportunities.md` | [ ] |
| 1.2.2 | Create Telegram wrapper | Thin SKILL.md for gateway command registration | `openclaw/skills/keyword-opportunities/SKILL.md` | [ ] |
| 1.2.3 | Register in gateway | Restart gateway, verify command appears in Telegram | Gateway logs | [ ] |
| 1.2.4 | Test: maxkickusa.medusajs.site | Run via Telegram, verify all 7 output sections | Test log | [ ] |
| 1.2.5 | Test: celavii.com | Run on second domain to verify generalization | Test log | [ ] |
| 1.2.6 | Validate output quality | Review priority scoring, content briefs, revenue projection | Manual review | [ ] |

### 1.3 Tools Used

| Tool | Purpose | Script | Tier |
|------|---------|--------|------|
| Ahrefs Keywords | Current keyword positions + volumes | `run-apify-ahrefs.sh {domain} keywords` | Existing ✅ |
| Ahrefs Competitors | Auto-discover competitors | `run-apify-ahrefs.sh {domain} competitors` | Existing ✅ |
| Ahrefs Competitor Keywords | Competitor keyword inventory | `run-apify-ahrefs.sh {competitor} keywords` | Existing ✅ |
| SERP Analysis | Validate SERP features, PAA, difficulty | `run-apify-serp.sh "{keyword}"` | Existing ✅ |
| Sitemap Generator | Existing content inventory | `run-sitemap-gen.sh {domain}` | Existing ✅ |
| Web Search | Indexed page count | `web_search site:{domain}` | Existing ✅ |
| **Google Trends** | Rising/falling keyword trend signal | `run-apify-trends.sh "{keyword}"` | **NEW Tier 1** |
| **Google Autocomplete** | Long-tail keyword expansion (50+ per seed) | `run-apify-autocomplete.sh "{seed}"` | **NEW Tier 1** |
| **Rank Checker** | Real-time position validation for quick wins | `run-apify-rank-checker.sh {domain} "{kw}"` | **NEW Tier 1** |
| **SpyFu** | Competitor PPC keywords = proven converters | `run-apify-spyfu.sh {domain}` | **NEW Tier 1** |

### 1.4 Output Template Sections

| # | Section | What It Contains |
|---|---------|-----------------|
| 1 | Domain Baseline | Indexed pages, estimated traffic, top 10 keywords |
| 2 | Quick Wins (Positions 11-30) | Keywords, positions, volume, specific action |
| 3 | Low-Hanging Fruit (KD < 30) | Keywords sorted by vol/difficulty ratio |
| 4 | Content Gap Matrix | Keywords competitors rank for, grouped by topic |
| 5 | Priority Scoring | All opportunities ranked by priority formula |
| 6 | Content Brief Queue (Top 10) | Title, URL, H1, word count, keyword (SOP-compliant) |
| 7 | Revenue Projection | Top 20 × traffic × CVR × AOV |

### 1.5 Testing Checklist

- [ ] Command appears in Telegram `/` menu
- [ ] Ahrefs keywords API returns data
- [ ] Ahrefs competitors API returns data
- [ ] Quick wins table populated (if domain has existing rankings)
- [ ] Low-hanging fruit table populated
- [ ] Content gaps identified from competitor comparison
- [ ] Priority scores calculated correctly
- [ ] Content briefs have unique H1s (no duplicates with existing site pages)
- [ ] Revenue projection uses realistic CTR curves
- [ ] Output saved to correct project directory

---

## Phase 2: State File Schema (NOT STARTED)

**Goal:** Design and implement the state file that enables `/seo_strategy` to chain tools.

### 2.1 Requirements
- [ ] **R1:** State file path: `projects/{project}/research/seo/strategy-state.json`
- [ ] **R2:** JSON schema with version, domain, project, created/updated timestamps
- [ ] **R3:** Five phase objects: discover, analyze, prioritize, plan, deliver
- [ ] **R4:** Each phase has status (not_started, in_progress, complete), completed_at, and phase-specific data
- [ ] **R5:** Existing commands check for state file: if found, read prior data; if not, run standalone
- [ ] **R6:** Commands write back to their phase when called from `/seo_strategy`
- [ ] **R7:** State file is project-scoped (one per project)

### 2.2 Steps

| # | Step | Description | File(s) | Status |
|---|------|-------------|---------|--------|
| 2.2.1 | Define JSON schema | Full schema with all fields, types, examples | `agent-workspace/skills/seo/references/strategy-state-schema.json` | [ ] |
| 2.2.2 | Add state read/write to keyword-opportunities | Read discover phase, write analyze phase | `keyword-opportunities.md` | [ ] |
| 2.2.3 | Add state read/write to content-cluster | Read analyze+prioritize phases, write plan phase | `content-cluster.md` | [ ] |
| 2.2.4 | Add state read/write to seo-audit | Write discover phase baseline | `seo-audit.md` | [ ] |
| 2.2.5 | Add state read/write to competitor-seo | Write analyze phase competitor data | `competitor-seo.md` | [ ] |
| 2.2.6 | Test: state file creation | Run commands in sequence, verify state accumulates | Manual test | [ ] |
| 2.2.7 | Test: standalone mode | Verify commands still work without state file | Manual test | [ ] |

### 2.3 State File Schema (Summary)

```
strategy-state.json
├── version: 1
├── domain: string
├── project: string  
├── created: ISO datetime
├── updated: ISO datetime
├── phases
│   ├── discover
│   │   ├── status: not_started | in_progress | complete
│   │   ├── completed_at: ISO datetime
│   │   └── baseline: { indexed_pages, traffic, lighthouse, broken_links, sitemap, existing_h1s, issues }
│   ├── analyze
│   │   ├── status
│   │   ├── quick_wins: [{ keyword, position, volume, action }]
│   │   ├── low_hanging_fruit: [{ keyword, kd, volume, topic_cluster }]
│   │   ├── content_gaps: [{ keyword, competitor, position, volume }]
│   │   └── competitors: [string]
│   ├── prioritize
│   │   ├── status
│   │   ├── ranked_opportunities: [{ keyword, priority_score, tier, estimated_traffic }]
│   │   └── top_themes: [{ theme, opportunity_count, total_volume }]
│   ├── plan
│   │   ├── status
│   │   ├── clusters: [{ theme, articles, cluster_plan_file }]
│   │   ├── publication_calendar: { months, total_articles, articles_per_week }
│   │   └── technical_fixes: [{ issue, priority, effort }]
│   └── deliver
│       ├── status
│       └── deliverables: { strategy_pdf, content_briefs, technical_checklist }
```

---

## Phase 3: `/seo_strategy` Master Pipeline (NOT STARTED)

**Goal:** Build the Layer 3 chained command that runs all phases autonomously with checkpoints.

### 3.1 Requirements
- [ ] **R1:** Accept `<domain>` as only required input
- [ ] **R2:** Run 5 phases autonomously: Discover → Analyze → Prioritize → Plan → Deliver
- [ ] **R3:** Each phase reads prior phase output via strategy-state.json
- [ ] **R4:** Checkpoints: emit interim summary at each phase boundary
- [ ] **R5:** Produce 3 deliverables: strategy PDF, content briefs, technical checklist
- [ ] **R6:** Strategy PDF is print-ready (Next.js, 8.5"×11")
- [ ] **R7:** All content plans enforce SOP cannibalization rules
- [ ] **R8:** Total execution time: 60-90 minutes
- [ ] **R9:** Resume from checkpoint if interrupted (read state file)
- [ ] **R10:** Autonomous continuation — no manual prompts between phases

### 3.2 Steps

| # | Step | Description | File(s) | Status |
|---|------|-------------|---------|--------|
| 3.2.1 | Create command spec | Full pipeline definition with 5 phases, checkpoints, tools | `agent-workspace/skills/seo/commands/seo-strategy.md` | [ ] |
| 3.2.2 | Create Telegram wrapper | Thin SKILL.md for gateway registration | `openclaw/skills/seo-strategy/SKILL.md` | [ ] |
| 3.2.3 | Create PDF template | Next.js strategy report template (8.5"×11") | `agent-workspace/skills/seo/templates/strategy-report/` | [ ] |
| 3.2.4 | Symlink to gateway | Symlink skill + template to `openclaw/skills/` | Symlink | [ ] |
| 3.2.5 | Register in gateway | Restart gateway, verify command in Telegram | Gateway logs | [ ] |
| 3.2.6 | Test Phase 1: Discover | Verify audit + sitemap + competitor discovery | Test log | [ ] |
| 3.2.7 | Test Phase 2: Analyze | Verify keyword scan + gap analysis + state write | Test log | [ ] |
| 3.2.8 | Test Phase 3: Prioritize | Verify scoring + theme grouping | Test log | [ ] |
| 3.2.9 | Test Phase 4: Plan | Verify cluster plans + cannibalization check | Test log | [ ] |
| 3.2.10 | Test Phase 5: Deliver | Verify PDF + content briefs + technical checklist | Test log | [ ] |
| 3.2.11 | E2E test: maxkickusa | Full pipeline from start to finish | Test log | [ ] |
| 3.2.12 | Test: resume from checkpoint | Interrupt mid-pipeline, restart, verify resume | Test log | [ ] |

### 3.3 Phase Execution Detail

| Phase | Duration | Tools Used | State Written | Checkpoint Output |
|-------|----------|-----------|---------------|-------------------|
| **1: Discover** | 10-15 min | seo-audit, sitemap-gen, ahrefs-competitors, **PageSpeed** (Tier 2), **Greenflare** (Tier 2), **SEOnaut** (Tier 2), **Schema Validator** (Tier 2) | `discover.baseline` | "Site baseline: {n} pages, {n} issues, CrUX LCP: {n}s" |
| **2: Analyze** | 15-20 min | ahrefs-keywords, ahrefs-competitor-keywords, serp, **Autocomplete** (Tier 1), **Trends** (Tier 1), **Rank Checker** (Tier 1), **SpyFu** (Tier 1) | `analyze.quick_wins`, `analyze.content_gaps`, `analyze.trends`, `analyze.ppc_signals` | "Found {n} quick wins, {n} gaps, {n} rising trends" |
| **3: Prioritize** | 5-10 min | Scoring algorithm with **Trend↑ multiplier** + **PPC bonus** | `prioritize.ranked_opportunities`, `prioritize.top_themes` | "Top themes: {list}" |
| **4: Plan** | 20-30 min | content-cluster (×3-5 themes), **SEOnaut** cannibalization check | `plan.clusters`, `plan.publication_calendar` | "{n} articles across {n} silos, cannibalization: PASS" |
| **5: Deliver** | 10-15 min | PDF generator, file compilation | `deliver.deliverables` | Preview URL + summary |

### 3.4 PDF Template Sections

| # | Section | Content |
|---|---------|---------|
| 1 | Cover Page | Domain, date, prepared by |
| 2 | Executive Summary | 1-page overview of findings + top 3 recommendations |
| 3 | Current State | Audit scores, indexed pages, traffic baseline |
| 4 | Competitive Landscape | DA comparison, keyword overlap, SERP ownership |
| 5 | Opportunity Analysis | Top 20 keywords with priority scores, effort/reward matrix |
| 6 | Content Roadmap | 3-6 month plan with silo architecture visualization |
| 7 | Technical Fixes | Prioritized checklist of quick technical wins |
| 8 | Revenue Projection | Traffic × CVR × AOV for top opportunities |
| 9 | Implementation Timeline | Gantt-style 6-month execution plan |
| 10 | Appendix | Full keyword data, content briefs, interlinking maps |

### 3.5 Testing Checklist

- [ ] Command appears in Telegram `/` menu
- [ ] Phase 1 completes and writes state file
- [ ] Phase 2 reads Phase 1 state and extends it
- [ ] Phase 3 produces ranked opportunities with correct scoring
- [ ] Phase 4 generates 3-5 content cluster plans
- [ ] Phase 4 passes cannibalization check (zero duplicate H1/H2)
- [ ] Phase 5 produces PDF with all 10 sections
- [ ] PDF renders correctly at 8.5"×11"
- [ ] Content briefs file has top 10 articles ready to write
- [ ] Technical checklist has actionable items from Phase 1
- [ ] Total execution time < 90 minutes
- [ ] Resume from checkpoint works (interrupt + restart)
- [ ] No manual prompts required during execution

---

## Phase 4: Polish & Integration (NOT STARTED)

### 4.1 Steps

| # | Step | Description | Status |
|---|------|-------------|--------|
| 4.1.1 | Quarterly comparison | Diff current vs previous strategy-state.json | [ ] |
| 4.1.2 | Update IMPLEMENTATION.md | Reflect final state of all commands | [ ] |
| 4.1.3 | Update skills.md architecture doc | Add strategy suite to skill inventory | [ ] |
| 4.1.4 | Update CHANGELOG.md | Document all changes | [ ] |
| 4.1.5 | Run arch-verify.sh | Verify no architecture drift | [ ] |

---

## Dependencies Map

```
/seo_strategy (Phase 3)
├── Requires: /keyword_opportunities (Phase 1)
├── Requires: strategy-state.json schema (Phase 2)
├── Requires: /seo_audit_quick (Phase 0 ✅)
├── Requires: /competitor_seo (Phase 0 ✅)
├── Requires: /content_cluster (Phase 0 ✅, enhanced with SOP)
├── Requires: PDF template (Phase 3.2.3)
├── Requires: All existing Apify scripts (Phase 0 ✅)
├── Requires: run-apify-trends.sh (Phase 0.4b Tier 1)
├── Requires: run-apify-autocomplete.sh (Phase 0.4b Tier 1)
├── Requires: run-apify-rank-checker.sh (Phase 0.4b Tier 1)
├── Requires: run-apify-spyfu.sh (Phase 0.4b Tier 1)
├── Requires: run-pagespeed.sh (Phase 0.4c Tier 2)
├── Requires: run-greenflare.sh (Phase 0.4c Tier 2)
├── Requires: run-seonaut.sh (Phase 0.4c Tier 2)
└── Requires: run-schema-validator.sh (Phase 0.4c Tier 2)

/keyword_opportunities (Phase 1)
├── Requires: run-apify-ahrefs.sh (Phase 0 ✅)
├── Requires: run-apify-serp.sh (Phase 0 ✅)
├── Requires: run-sitemap-gen.sh (Phase 0 ✅)
├── Requires: run-apify-trends.sh (Phase 0.4b Tier 1)
├── Requires: run-apify-autocomplete.sh (Phase 0.4b Tier 1)
├── Requires: run-apify-rank-checker.sh (Phase 0.4b Tier 1)
├── Requires: run-apify-spyfu.sh (Phase 0.4b Tier 1)
└── No dependency on state file (standalone mode)

/seo_strategy Phase 1: Discover
├── Requires: seo-audit (Phase 0 ✅)
├── Requires: run-pagespeed.sh (Phase 0.4c Tier 2) — real CrUX field data
├── Requires: run-greenflare.sh (Phase 0.4c Tier 2) — deep crawl + link graph
├── Requires: run-seonaut.sh (Phase 0.4c Tier 2) — heading/meta cannibalization baseline
├── Requires: run-schema-validator.sh (Phase 0.4c Tier 2) — rich results check
└── Requires: run-sitemap-gen.sh (Phase 0 ✅)

strategy-state.json (Phase 2)
├── Written by: /seo_audit_quick + PageSpeed + Greenflare + SEOnaut → discover
├── Written by: /keyword_opportunities + Trends + Autocomplete + SpyFu → analyze
├── Written by: /competitor_seo → analyze
├── Written by: scoring logic (with Trend↑ + PPC bonus) → prioritize
├── Written by: /content_cluster → plan
└── Written by: PDF generator → deliver
```

---

## Symlink Registry

All skills must be symlinked to `openclaw/skills/` for gateway discovery.

| Skill | Source (agent-workspace) | Target (openclaw/skills/) | Status |
|-------|--------------------------|---------------------------|--------|
| `keyword-opportunities` | `skills/seo/commands/keyword-opportunities.md` | `skills/keyword-opportunities/SKILL.md` (wrapper) | [ ] Phase 1 |
| `seo-strategy` | `skills/seo/commands/seo-strategy.md` | `skills/seo-strategy/SKILL.md` (wrapper) | [ ] Phase 3 |
| `seo-orchestrator/commands/` | `skills/seo/commands/` | Symlink ✅ | [x] Phase 0 |
| `seo-orchestrator/references/` | `skills/seo/references/` | Symlink ✅ | [x] Phase 0 |

---

## Environment Variables Required

| Variable | Purpose | Where Set |
|----------|---------|-----------|
| `APIFY_API_TOKEN` | Ahrefs, SERP, Semrush API access | `~/.openclaw/openclaw.json` or env |
| `OPENAI_API_KEY` | PDF generation (if using AI for layout) | `~/.openclaw/openclaw.json` |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Apify rate limits on bulk keyword queries | Medium | Phase 2 Analyze takes too long | Batch queries, cache results in state file |
| Telegram command limit (100) hit again | Low | New commands don't appear | Currently at 11/100, plenty of headroom |
| Content cluster generation > 30 min per theme | Medium | Phase 4 Plan exceeds time budget | Limit to top 3 themes, parallelize if possible |
| State file corruption on interrupt | Low | Can't resume from checkpoint | Validate state on read, rebuild from scratch if invalid |
| Cannibalization check misses existing pages | Medium | Duplicate headings slip through | Mandatory sitemap crawl + web_fetch of existing H1s |
