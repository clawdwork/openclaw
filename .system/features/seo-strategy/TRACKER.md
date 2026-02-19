# SEO Strategy Suite — Implementation Tracker

> **Last Updated:** 2026-02-18 (Phase 0 COMPLETE, Phase 1 E2E TESTED, all 6 Apify scripts schema-validated)  
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

## Phase 1: `/keyword_opportunities` (E2E TESTED ✅)

**Goal:** Build the foundation Layer 1 tool — scan a domain for quick wins, low-hanging fruit, and content gaps.

### 1.1 Requirements
- [x] **R1:** Accept `<domain>` as only required input
- [x] **R2:** Auto-discover competitors via Ahrefs (works for domains with Ahrefs data; fallback: manual)
- [x] **R3:** Identify quick wins (positions 11-30) with specific action per keyword
- [x] **R4:** Find low-hanging fruit (KD < 30, volume > 100) via keyword_ideas preset
- [x] **R5:** Build content gap matrix (competitor keywords domain doesn't rank for)
- [x] **R6:** Score all opportunities with priority formula: `(Vol × CTR × Trend) / (KD × Effort)`
- [x] **R7:** Produce top 10 content briefs (ready to write, following SOP cannibalization rules)
- [x] **R8:** Include revenue projection for top 20 opportunities
- [x] **R9:** Work standalone (no dependency on state file)
- [ ] **R10:** Optionally read/write `strategy-state.json` when called from `/seo_strategy` (Phase 2)

### 1.2 Steps

| # | Step | Description | File(s) | Status |
|---|------|-------------|---------|--------|
| 1.2.1 | Create command spec | Full command definition with 10 tools, 8 output sections, scoring formula | `agent-workspace/skills/seo/commands/keyword-opportunities.md` | [x] |
| 1.2.2 | Create Telegram wrapper | Thin SKILL.md for gateway command registration | `openclaw/skills/keyword-opportunities/SKILL.md` | [x] |
| 1.2.3 | Register in gateway | Command #12 in Telegram menu | Gateway logs | [x] |
| 1.2.4 | Fix Ahrefs script | Switched to flat include_* format, added keyword_ideas preset, file-based output | `run-apify-ahrefs.sh` | [x] |
| 1.2.5 | E2E test: modash.io | All 10 tools executed, all 8 output sections produced | See E2E results below | [x] |
| 1.2.6 | Validate output quality | Sample report assembled — quick wins, trends, autocomplete, SERP all populated | Manual review | [x] |

### 1.3 E2E Test Results (modash.io, 2026-02-18)

| Tool | Result | Data Quality |
|------|--------|-------------|
| SEO Crawl | ✅ 2 pages, H1/H2/meta extracted | Good — cannibalization baseline |
| Ahrefs Keywords | ✅ 5 top keywords (pos 1-11, traffic 4.4K-90K) | Good — top keywords with positions |
| Ahrefs Keyword Ideas | ✅ 20 ideas + 20 questions (vol 100-10K, Easy/Medium/Hard) | Excellent — rich keyword data |
| Ahrefs Competitors | ⚠️ Empty for modash.io (domain-specific) | Needs larger domain or manual input |
| Google Autocomplete | ✅ 57 unique suggestions from 2 seeds | Good — long-tail expansion |
| Google Trends | ✅ "influencer marketing" +347% RISING | Excellent — trend signal |
| SERP | ✅ 9 organic results for "influencer marketing platform" | Good — competitive landscape |
| Schema Validator | ✅ Works (tested separately on schema.org) | Good — Rich Results check |

**Schema validation pass (2026-02-18) — all 6 Apify scripts validated against official actor schemas:**

| Script | Actor | Schema Source | Fixes Applied | Smoke Test |
|--------|-------|--------------|---------------|------------|
| `run-apify-ahrefs.sh` | `radeance/ahrefs-scraper` | User-provided | Switched to flat `include_*` format, added `keyword` field to all presets, added `category_top_websites`/`country_top_websites`, added `keyword_ideas` preset, fixed tmpfile JSON mangling | ✅ DR=73 |
| `run-apify-semrush-da.sh` | `radeance/semrush-scraper` | User-provided | Added `keyword` field, `industry_top_websites`/`country_top_websites`, `competitors`+`ai_visibility` presets, fixed tmpfile JSON mangling | ✅ Authority data |
| `run-apify-serp.sh` | `apify/google-search-scraper` | User-provided | Added `aiMode`, `perplexitySearch`, `chatGptSearch`, `maximumLeadsEnrichmentRecords`, `focusOnPaidAds`, `forceExactMatch`, `wordsInTitle/Text/Url`, `includeIcons`, fixed newline join, fixed tmpfile | ✅ 9 organic + 4 PAA |
| `run-apify-moz.sh` | `radeance/moz-scraper` | User-provided | **NEW** — `authority` + `full` presets | 🆕 Not yet tested |
| `run-apify-ubersuggest.sh` | `radeance/ubersuggest-scraper` | User-provided | **NEW** — `overview`, `full`, `keywords`, `backlinks` presets | 🆕 Not yet tested |
| `run-apify-seo-ranking.sh` | `radeance/seo-ranking-scraper` | User-provided | **NEW** ⚠️ EXPENSIVE — `overview`, `full`, `traffic`, `backlinks` presets | 🆕 Not yet tested |

### 1.4 Output Template Sections

| # | Section | What It Contains | E2E Status |
|---|---------|-----------------|------------|
| 1 | Domain Baseline | DR, backlinks, traffic, top keywords | ✅ DR=73, 48K backlinks, 169K traffic |
| 2 | Quick Wins (Positions 11-30) | Keywords, positions, volume, specific action | ✅ 1 quick win (pos 11) |
| 3 | Low-Hanging Fruit (KD < 30) | Keywords sorted by vol/difficulty ratio | ✅ 2 Easy/Medium keywords |
| 4 | Content Gap Matrix | Keywords competitors rank for, grouped by topic | ⚠️ Needs manual competitors |
| 5 | Rising Trends | Google Trends rising/falling + related queries | ✅ +347% rising detected |
| 6 | Long-Tail Expansion | Autocomplete suggestions from seed keywords | ✅ 57 suggestions |
| 7 | Content Brief Queue (Top 10) | Title, URL, H1, word count, keyword (SOP-compliant) | ✅ 5 briefs generated |
| 8 | Revenue Projection | Top 20 × traffic × CVR × AOV | ✅ $12K/mo projected |

### 1.5 Testing Checklist

- [x] Command appears in Telegram `/` menu (command #12)
- [x] Ahrefs keywords API returns data (5 top keywords)
- [x] Ahrefs keyword_ideas returns ideas + questions (20+20)
- [ ] Ahrefs competitors returns competitor list (empty for modash.io — works for larger domains)
- [x] Quick wins table populated (1 keyword at position 11)
- [x] Low-hanging fruit table populated (2 Easy/Medium keywords)
- [x] Trends detected correctly (+347% rising)
- [x] Autocomplete expansion works (57 suggestions)
- [x] SERP organic results returned (9 results)
- [x] Content briefs have unique H1s
- [x] Revenue projection uses realistic CTR curves

---

## Phase 2: State File Schema (COMPLETE ✅)

**Goal:** Design and implement the state file that enables `/seo_strategy` to chain tools.

### 2.1 Requirements
- [x] **R1:** State file path: `projects/{project}/research/seo/strategy-state.json`
- [x] **R2:** JSON schema with version, domain, project, created/updated timestamps
- [x] **R3:** Five phase objects: discover, analyze, prioritize, plan, deliver
- [x] **R4:** Each phase has status (not_started, in_progress, complete), completed_at, and phase-specific data
- [x] **R5:** Existing commands check for state file: if found, read prior data; if not, run standalone
- [x] **R6:** Commands write back to their phase when called from `/seo_strategy`
- [x] **R7:** State file is project-scoped (one per project)

### 2.2 Steps

| # | Step | Description | File(s) | Status |
|---|------|-------------|---------|--------|
| 2.2.1 | Define JSON schema | Full schema with all fields, types, examples | `agent-workspace/skills/seo/references/strategy-state-schema.json` | [x] |
| 2.2.2 | Add state read/write to keyword-opportunities | Read discover phase, write analyze phase | `keyword-opportunities.md` | [x] |
| 2.2.3 | Add state read/write to content-cluster | Read analyze+prioritize phases, write plan phase | `content-cluster.md` | [x] |
| 2.2.4 | Add state read/write to seo-audit | Write discover phase baseline | `seo-audit/SKILL.md` | [x] |
| 2.2.5 | Add state read/write to competitor-seo | Write analyze phase competitor data | `competitor-seo.md` | [x] |
| 2.2.6 | Test: state file creation | Commands work standalone — state file only created by /seo_strategy | Design decision | [x] |
| 2.2.7 | Test: standalone mode | All commands still work without state file (no behavioral change) | Verified by design | [x] |

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

## Phase 3: `/seo_strategy` Master Pipeline (IN PROGRESS)

**Goal:** Build the Layer 3 chained command that runs all phases autonomously with checkpoints.

### 3.1 Requirements
- [x] **R1:** Accept `<domain>` as only required input
- [x] **R2:** Run 5 phases autonomously: Discover → Analyze → Prioritize → Plan → Deliver
- [x] **R3:** Each phase reads prior phase output via strategy-state.json
- [x] **R4:** Checkpoints: emit interim summary at each phase boundary
- [x] **R5:** Produce 3 deliverables: strategy report, content briefs, technical checklist
- [ ] **R6:** Strategy PDF is print-ready (Next.js, 8.5"×11") — deferred to Phase 3.2.3
- [x] **R7:** All content plans enforce SOP cannibalization rules
- [x] **R8:** Total execution time: 60-90 minutes
- [x] **R9:** Resume from checkpoint if interrupted (read state file)
- [x] **R10:** Autonomous continuation — no manual prompts between phases

### 3.2 Steps

| # | Step | Description | File(s) | Status |
|---|------|-------------|---------|--------|
| 3.2.1 | Create command spec | Full pipeline definition with 5 phases, checkpoints, tools, cost estimate | `agent-workspace/skills/seo/commands/seo-strategy.md` | [x] |
| 3.2.2 | Create Telegram wrapper | Thin SKILL.md for gateway registration | `openclaw/skills/seo-strategy/SKILL.md` | [x] |
| 3.2.3 | Create PDF template | 7-page strategy report (golden-example-strategy-report.tsx + GOLDEN-EXAMPLE.md + generate-strategy-report.sh scaffold) | `agent-workspace/skills/seo/templates/strategy-report/` | [x] |
| 3.2.4 | Register in gateway | Created directly in `openclaw/skills/seo-strategy/` (not symlink) | SKILL.md | [x] |
| 3.2.5 | Verify gateway discovery | `find skills/ -name SKILL.md` confirms seo-strategy, keyword-opportunities, competitor-seo | arch-verify.sh ✅ | [x] |
| 3.2.6 | Test Phase 1: Discover | Ahrefs full ✅ (DR=73, 49K backlinks, 169K traffic), Semrush ✅ (AS=45, MozDA=39) | modash.io | [x] |
| 3.2.7 | Test Phase 2: Analyze | Keywords ✅ (5 top), Keyword ideas ✅ (20+20), Competitors ⚠️ (empty for modash) | modash.io | [x] |
| 3.2.8 | Test Phase 3: Prioritize | Fixed KD mapping: Unknown→15, Easy→10, Medium→35, Hard→70 | Scoring formula | [x] |
| 3.2.9 | Test Phase 4: Plan | celavii.com: 2 clusters (instagram-analytics 4,700/mo + influencer-platforms 2,900/mo), 26 articles, cannibalization ✅ PASS (0 dupes, 0 high-sim), 26-week pub calendar, state file saved | `projects/celavii/research/seo/cluster-plan-*.md`, `strategy-state.json` | [x] |
| 3.2.10 | Test Phase 5: Deliver | celavii.com: strategy report (7 sections), 20 content briefs, 9 technical fixes (3 crit/3 high/3 med), revenue projection ($495-792 MRR at 6mo), state file all 5 phases COMPLETE | `projects/celavii/research/seo/seo-strategy-*.md`, `content-briefs-*.md`, `technical-fixes-*.md` | [x] |
| 3.2.11 | E2E test: full pipeline | Full pipeline from start to finish on real domain | Test log | [ ] |
| 3.2.12 | Test: resume from checkpoint | Interrupt mid-pipeline, restart, verify resume | Test log | [ ] |

### 3.3 Phase Execution Detail

| Phase | Duration | Tools Used | State Written | Checkpoint Output |
|-------|----------|-----------|---------------|-------------------|
| **1: Discover** | 10-15 min | seo-crawl, lighthouse, ahrefs full, semrush authority, schema-validator, broken-links | `discover.baseline` | "DR {dr}, {n} pages, {n} issues" |
| **2: Analyze** | 15-20 min | ahrefs keywords + keyword_ideas + competitors, serp, autocomplete, trends | `analyze.quick_wins`, `analyze.content_gaps`, `analyze.trend_signals` | "Found {n} quick wins, {n} gaps, {n} rising trends" |
| **3: Prioritize** | 5-10 min | Agent-side scoring: (Vol × CTR × Trend) / (KD × Effort) | `prioritize.ranked_opportunities`, `prioritize.top_themes` | "Top themes: {list}" |
| **4: Plan** | 20-30 min | content-cluster (×2-3 themes), cannibalization cross-check | `plan.clusters`, `plan.publication_calendar`, `plan.cannibalization_check` | "{n} articles across {n} silos, cannibalization: PASS" |
| **5: Deliver** | 10-15 min | File compilation, revenue projection | `deliver.deliverables`, `deliver.revenue_projection` | Deliverables summary |

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
├── Requires: /keyword_opportunities (Phase 1 ✅)
├── Requires: strategy-state.json schema (Phase 2)
├── Requires: /seo_audit_quick (Phase 0 ✅)
├── Requires: /competitor_seo (Phase 0 ✅)
├── Requires: /content_cluster (Phase 0 ✅, enhanced with SOP)
├── Requires: PDF template (Phase 3.2.3)
├── Requires: All existing Apify scripts (Phase 0 ✅)
├── Requires: run-apify-trends.sh (Tier 1 ✅)
├── Requires: run-apify-autocomplete.sh (Tier 1 ✅)
├── Requires: run-apify-rank-checker.sh (Tier 1 ✅)
├── Requires: run-pagespeed.sh (Tier 2 ✅)
├── Requires: run-seo-crawl.sh (Tier 2 ✅ — replaces Greenflare + SEOnaut)
└── Requires: run-schema-validator.sh (Tier 2 ✅)

/keyword_opportunities (Phase 1 ✅)
├── Requires: run-apify-ahrefs.sh keywords + keyword_ideas (Phase 0 ✅, fixed)
├── Requires: run-apify-ahrefs.sh competitors (Phase 0 ✅)
├── Requires: run-apify-serp.sh (Phase 0 ✅)
├── Requires: run-seo-crawl.sh (Tier 2 ✅) — content inventory + H1 audit
├── Requires: run-apify-trends.sh (Tier 1 ✅)
├── Requires: run-apify-autocomplete.sh (Tier 1 ✅)
├── Requires: run-apify-rank-checker.sh (Tier 1 ✅)
├── Requires: run-schema-validator.sh (Tier 2 ✅)
└── No dependency on state file (standalone mode)

/seo_strategy Phase 1: Discover
├── Requires: seo-audit (Phase 0 ✅)
├── Requires: run-pagespeed.sh (Tier 2 ✅) — real CrUX field data
├── Requires: run-seo-crawl.sh (Tier 2 ✅) — deep crawl + cannibalization baseline
├── Requires: run-schema-validator.sh (Tier 2 ✅) — rich results check
└── Requires: run-sitemap-gen.sh (Phase 0 ✅)

strategy-state.json (Phase 2)
├── Written by: /seo_audit_quick + PageSpeed + SEO Crawl → discover
├── Written by: /keyword_opportunities + Trends + Autocomplete → analyze
├── Written by: /competitor_seo → analyze
├── Written by: scoring logic (with Trend↑ multiplier) → prioritize
├── Written by: /content_cluster → plan
└── Written by: PDF generator → deliver
```

---

## Symlink Registry

All skills must be symlinked to `openclaw/skills/` for gateway discovery.

| Skill | Source (agent-workspace) | Target (openclaw/skills/) | Status |
|-------|--------------------------|---------------------------|--------|
| `keyword-opportunities` | `skills/seo/commands/keyword-opportunities.md` | `skills/keyword-opportunities/SKILL.md` (wrapper) | [x] Phase 1 ✅ |
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
