# SEO Strategy Suite — Implementation Tracker

> **Last Updated:** 2026-02-18 (Phase 0.4b/0.4c implemented, all scripts tested)  
> **Reference:** [IMPLEMENTATION.md](./IMPLEMENTATION.md)

---

## Phase 0: Foundation (COMPLETE ✅)

Everything built prior to the strategy suite that it depends on.

### 0.1 Telegram Command Infrastructure
- [x] **Root cause fix** — `BOT_COMMANDS_TOO_MUCH` resolved by hiding 54 skills with `user-invocable: false`
- [x] **Gateway restart** — PID verified, RPC ok, no Telegram errors
- [x] **Command registration** — 12 commands registered in Telegram menu (added `/keyword_opportunities`)

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

### 0.4b SEO Scripts — Tier 1: Keyword Intelligence (IMPLEMENTED ✅)

These tools directly power `/keyword_opportunities` and `/seo_strategy`.

> **PIVOT (2026-02-18):** Original plan used paid Apify rental actors ($5-10/mo each).
> All 3 actors (`apify/google-trends-scraper`, `simpleapi/google-search-autocomplete-scraper`,
> `caprolok/google-rank-checker`) required paid rentals we didn't have.
> **Solution:** Replaced with free alternatives — pytrends, Google Suggest API, existing SERP scraper.
> **Result:** $0 additional cost. All scripts tested and working.

| # | Script | Source | What It Gets | Cost | Test Result | Status |
|---|--------|--------|-------------|------|-------------|--------|
| 1 | `run-apify-trends.sh` | **pytrends** (free Python lib) | Interest over time, rising/falling signal, related queries, rising queries | **FREE** | ✅ Tested: "nicotine pouches" = +31% RISING, 53 data points, 10 related queries | [x] |
| 2 | `run-apify-autocomplete.sh` | **Google Suggest API** (free, no key) | Real-time autocomplete suggestions (50-100+ per seed) with modifier expansion | **FREE** | ✅ Tested: 77 unique suggestions from 1 seed + 7 modifiers | [x] |
| 3 | `run-apify-rank-checker.sh` | **Existing SERP scraper** (`apify/google-search-scraper`, already rented) | Real-time rank position for domain + keyword pairs in top 100 | ~$0.25/run | ✅ Tested: maxkickusa.medusajs.site not in top 100 for "nicotine pouches" (expected for new site) | [x] |
| 4 | `run-apify-spyfu.sh` | TBD | Competitor PPC keywords, ad spend | TBD | ❌ Not implemented — need pay-per-result actor or free alternative | [ ] |

**Tier 1 Script Specs (Actual Implementation):**

#### `run-apify-trends.sh` — ✅ TESTED
```
Usage: run-apify-trends.sh "keyword1" "keyword2" ... [--timeframe 12months] [--geo US] [--output file]
Source: pytrends Python library (pip install pytrends)
Output: {
  interest_over_time: { keyword: { current, avg_recent, avg_older, change_pct, trend: rising|stable|falling } },
  related_queries: { keyword: [{ query, value }] },
  rising_queries: { keyword: [{ query, value }] }
}
Cost: FREE
Tested: "nicotine pouches" → +31% rising, current=79, 10 related queries, 10 rising queries
```

#### `run-apify-autocomplete.sh` — ✅ TESTED
```
Usage: run-apify-autocomplete.sh "seed1" "seed2" ... [--depth 2] [--output file]
Source: Google Suggest API (http://suggestqueries.google.com/complete/search)
Output: [{ suggestion, seed, depth }] — 50-100+ unique suggestions per seed
Cost: FREE (no API key needed)
Features: depth-1 direct suggestions + depth-2 expansion + modifier expansion (best, vs, how to, for, near me, buy, review)
Tested: "nicotine pouches" → 77 unique suggestions
```

#### `run-apify-rank-checker.sh` — ✅ TESTED
```
Usage: run-apify-rank-checker.sh {domain} "keyword1" "keyword2" ... [--country us] [--output file]
Source: apify/google-search-scraper (already rented) — searches each keyword, finds domain in organic results
Output: [{ keyword, position, url, title, snippet, found: bool }]
Cost: ~$0.25/run (uses existing SERP scraper)
Tested: maxkickusa.medusajs.site — 0/2 keywords found in top 100 (expected for new domain)
```

### 0.4c SEO Scripts — Tier 2: Open Source + Free API Integrations (COMPLETE ✅)

These tools improve audit quality and content authority.

| # | Script | Source | What It Gets | Cost | Test Result | Status |
|---|--------|--------|-------------|------|-------------|--------|
| 5 | `run-pagespeed.sh` | Google PageSpeed Insights API | Real CrUX field data + Lighthouse lab data + category scores + opportunities | **FREE** (uses Gemini API key) | ✅ Tested: maxkickusa LCP=9.4s, Perf=62, SEO=92, A11y=86, BP=100 | [x] |
| 6 | `run-seo-crawl.sh` | **Python** (requests + BeautifulSoup) | Full site crawl: title, H1, H2s, meta, status codes, canonical, schema, word count, **duplicate detection** | **FREE** | ✅ Tested: maxkickusa 2 pages crawled, status codes, H1/H2/meta extraction, cannibalization detection | [x] |
| 7 | `run-schema-validator.sh` | **Python** (requests + BeautifulSoup) | JSON-LD extraction, property validation, Rich Results eligibility check per schema type | **FREE** | ✅ Tested: schema.org → 9 schemas found, 1 invalid flagged (missing url), Product/Article/FAQ validation | [x] |

> **PIVOT (2026-02-18):** Replaced Greenflare (GUI-only, needs tkinter) and SEOnaut (needs Docker + MySQL)
> with lightweight Python scripts using `requests` + `beautifulsoup4`. `site-audit-seo` (npm) also tested
> but crashes on Node 22+25 due to Puppeteer v1.20 incompatibility. Python scripts are faster, more reliable,
> and fully controllable.

**Tier 2 Script Specs:**

#### `run-pagespeed.sh` — ✅ TESTED
```
Usage: run-pagespeed.sh "https://example.com" [--strategy mobile|desktop] [--output file]
API: https://www.googleapis.com/pagespeedonline/v5/runPagespeed
Auth: GOOGLE_API_KEY env var (uses Gemini API key — same Google Cloud project)
  - Key added to ~/.openclaw/.env as GOOGLE_API_KEY
  - Without key: quota = 0/day (Google shared project exhausted)
  - With key: quota = 25K queries/day (free tier)
Output: {
  field_data: { lcp_ms, fcp_ms, cls, inp_ms, ttfb_ms } (real CrUX — only for sites with traffic),
  lab_data: { fcp, lcp, cls, tbt, si, tti } (Lighthouse synthetic),
  scores: { performance, seo, accessibility, best-practices } (0-100),
  opportunities: [{ title, savings_ms, description }] (top 10)
}
Cost: FREE
Tested: maxkickusa.medusajs.site → Perf=62, SEO=92, LCP=9.4s, FCP=1.4s, CLS=0, TBT=210ms
Finding: LCP 9.4s is critical — needs image optimization + redirect fix (902ms redirect savings)
```

#### `run-seo-crawl.sh` — ✅ TESTED (replaces Greenflare + SEOnaut)
```
Usage: run-seo-crawl.sh "https://example.com" [--max-pages 50] [--output file]
Source: Python (requests + beautifulsoup4)
Output: {
  pages_crawled: N,
  status_codes: { "200": N, "404": N },
  pages: [{
    url, status, title, h1, h1_count, h2s[], meta_description,
    canonical, schema_types[], word_count, internal_links, external_links,
    images_total, images_missing_alt, missing_alt_srcs[]
  }],
  duplicate_titles: [{ title, urls[] }],
  duplicate_h1s: [{ h1, urls[] }],
  duplicate_descriptions: [{ description, urls[] }],
  missing_title: [urls], missing_h1: [urls], missing_meta_description: [urls],
  multiple_h1: [{ url, count }],
  schema_types: { "Product": N, "WebSite": N },
  content_stats: { avg_word_count, min_word_count, max_word_count, thin_pages }
}
Cost: FREE
Prerequisite: pip3 install requests beautifulsoup4
Tested: maxkickusa.medusajs.site → 2 pages, status codes, H1/H2/meta, cannibalization check
Key value: duplicate_titles/h1s/descriptions → direct cannibalization detection
```

#### `run-schema-validator.sh` — ✅ TESTED
```
Usage: run-schema-validator.sh "https://example.com" [--output file]
Source: Python (requests + beautifulsoup4)
Output: {
  schemas: [{ type, properties[], property_count, valid, errors[], warnings[], rich_results_eligible }],
  schemas_found: N,
  rich_results_eligible: bool,
  rich_results_types: [],
  summary: { total_schemas, valid, invalid, with_warnings, rich_results_eligible, types_found[] }
}
Cost: FREE
Prerequisite: pip3 install requests beautifulsoup4
Tested: schema.org → 9 schemas found, 1 invalid (missing url), validates Product/Article/FAQ/BreadcrumbList
Validates: required properties per type, empty values, Product offers, Article dates, Rich Results eligibility
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
├── SEO Crawl (NEW Tier 2 ✅)              → H1/H2/meta/title/status/canonical/word count + cannibalization
├── Schema Validator (NEW Tier 2 ✅)       → rich results eligibility + property validation
├── Sitemap gen (existing ✅)              → content inventory
└── Ahrefs competitors (existing ✅)       → competitive landscape

/seo_strategy Phase 3: Prioritize (scoring formula update)
  Priority = (Vol × CTR × Trend↑) / (KD × Effort)
  NEW: Trend↑ multiplier from Google Trends (rising = 1.5x, stable = 1.0x, falling = 0.7x)
  NEW: PPC signal from SpyFu (competitor pays for keyword = 1.3x bonus)
```

### 0.4e Tool Installation Prerequisites (Updated Post-Pivot)

| Tool | Install Command | Verify Command | Status | Notes |
|------|----------------|----------------|--------|-------|
| pytrends (Google Trends) | `pip3 install --break-system-packages pytrends` | `python3 -c "from pytrends.request import TrendReq; print('ok')"` | ✅ Installed | Free, no API key |
| Google Suggest API | None (public endpoint) | `curl -s "http://suggestqueries.google.com/complete/search?client=firefox&q=test"` | ✅ Works | Free, no install |
| Rank Checker | Uses existing SERP scraper | `source ~/.openclaw/.env && echo $APIFY_API_TOKEN` | ✅ Works | Shares SERP actor |
| PageSpeed Insights | GOOGLE_API_KEY in `~/.openclaw/.env` | `run-pagespeed.sh "https://example.com"` | ✅ Works | Uses Gemini API key |
| beautifulsoup4 (SEO crawl + schema) | `pip3 install --break-system-packages beautifulsoup4` | `python3 -c "from bs4 import BeautifulSoup; print('ok')"` | ✅ Installed | For run-seo-crawl.sh + run-schema-validator.sh |
| requests (SEO crawl + schema) | Already installed (pytrends dependency) | `python3 -c "import requests; print('ok')"` | ✅ Installed | Shared dependency |

> **Dropped tools:** Greenflare (GUI-only, needs tkinter), SEOnaut (needs Docker + MySQL),
> site-audit-seo (Puppeteer v1.20 crashes on Node 22+25). Replaced with lightweight Python scripts.

### 0.4f Estimated Costs Per Strategy Run (Updated Post-Pivot)

| Tool | Cost Per Run | Runs Per Strategy | Total | Notes |
|------|-------------|-------------------|-------|-------|
| Ahrefs Keywords (existing) | ~$0.50 | 2-3 (domain + competitors) | ~$1.50 | Apify compute |
| Ahrefs Competitors (existing) | ~$0.25 | 1 | ~$0.25 | Apify compute |
| SERP Scraper (existing) | ~$0.25 | 2-3 (top keywords) | ~$0.75 | Apify compute |
| Semrush DA (existing) | ~$0.25 | 1 | ~$0.25 | Apify compute |
| Google Trends (NEW) | **FREE** | 1 (5 keywords) | **$0.00** | pytrends lib |
| Google Autocomplete (NEW) | **FREE** | 1 (5 seeds) | **$0.00** | Google Suggest API |
| Rank Checker (NEW) | ~$0.25 | 1 (reuses SERP scraper) | ~$0.25 | Shares SERP actor |
| SpyFu (NEW) | TBD | — | TBD | Not implemented |
| PageSpeed (NEW) | **FREE** | 1-3 | **$0.00** | Uses Gemini API key |
| SEO Crawl (NEW) | **FREE** | 1 | **$0.00** | Python (requests + bs4) ✅ |
| Schema Validator (NEW) | **FREE** | 1 | **$0.00** | Python (requests + bs4) ✅ |
| **TOTAL per /seo_strategy** | | | **~$3.00** | **Down from $4.10 estimate** |

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
- [x] `skills/keyword-opportunities/SKILL.md` — Scan domain for quick wins + low-hanging fruit (**NEW**)
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
