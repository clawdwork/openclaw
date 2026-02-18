# SEO Strategy Suite — Implementation Plan

> **Status:** Phase 1 COMPLETE, Phase 2 COMPLETE — Phase 3 next  
> **Created:** 2026-02-18  
> **Owner:** SEO Agent  
> **Dependencies:** seo-orchestrator, all SEO sub-skills, Apify scripts

---

## 1. Goal

Build a complete, chained SEO product suite that serves three use cases:

1. **Quick answers** (Layer 1: Tools) — standalone, fast, no dependencies
2. **Client deliverables** (Layer 2: Workflows) — multi-step, produce PDFs/reports
3. **Full engagement strategy** (Layer 3: Strategy) — chained pipeline, each phase feeds the next

The suite eliminates fragmented tooling and delivers a top-to-bottom SEO strategy from a single command.

---

## 2. Architecture: 3 Layers

```
Layer 3: STRATEGY (full engagement)
  └─ /seo_strategy — complete top-to-bottom, chained pipeline (Option C: checkpoints)

Layer 2: WORKFLOWS (multi-step, focused deliverables)
  ├─ /product_page_report — product page → PDF proposal
  ├─ /content_cluster — one topic → silo + articles (with SOP cannibalization rules)
  └─ /generate_seo_report — site-wide audit → PDF

Layer 1: TOOLS (single-use, fast answers)
  ├─ /keyword_opportunities — scan domain for quick wins + low-hanging fruit
  ├─ /competitor_seo — DA + keyword gap vs competitors
  └─ /seo_audit_quick — 7-tool health check
```

### Layer Properties

| Layer | Input | Output | Time | Dependencies |
|-------|-------|--------|------|-------------|
| **Tools** | domain + optional args | Markdown research file | 10-15 min | None (standalone) |
| **Workflows** | domain + topic/URL | Client-facing PDF + research | 20-45 min | Tools run internally |
| **Strategy** | domain only | Complete engagement package | 60-90 min | Chains Tools + Workflows via state file |

---

## 3. Current State (What Exists)

### Layer 1: Tools

| Command | Status | Telegram | File |
|---------|--------|----------|------|
| `/seo_audit_quick` | ✅ LIVE | ✅ Registered | `skills/seo-audit-quick/SKILL.md` |
| `/competitor_seo` | ✅ LIVE | ✅ Registered | `skills/competitor-seo/SKILL.md` |
| `/keyword_opportunities` | ✅ LIVE (E2E tested) | ✅ Registered (#12) | `skills/keyword-opportunities/SKILL.md` |

### Layer 2: Workflows

| Command | Status | Telegram | File |
|---------|--------|----------|------|
| `/product_page_report` | ✅ LIVE | ✅ Registered | `skills/product-page-report/SKILL.md` |
| `/content_cluster` | ✅ LIVE (enhanced with SOP) | ✅ Registered | `skills/content-cluster/SKILL.md` |
| `/generate_seo_report` | ✅ LIVE | ✅ Registered | `skills/generate-seo-report/SKILL.md` |

### Layer 3: Strategy

| Command | Status | Telegram | File |
|---------|--------|----------|------|
| `/seo_strategy` | ❌ NOT BUILT | ❌ | — |

### Supporting Infrastructure

| Item | Status | File |
|------|--------|------|
| SOP Reference Files | ✅ Saved | `skills/seo/references/product-seo-llm-sop-2026.md` |
| Publication Schedule | ✅ Saved | `skills/seo/references/product-publication-schedule.md` |
| State File Schema | ✅ DESIGNED | `skills/seo/references/strategy-state-schema.json` |
| Validate Proposal Script | ✅ Working | `skills/seo/scripts/validate-proposal.sh` |
| Revenue Estimation Script | ✅ Working | `skills/seo/scripts/estimate-revenue.sh` |

---

## 4. Build Plan

### Phase 1: `/keyword_opportunities` Command (Layer 1 Tool)

**Priority:** HIGH — this is the foundation tool that `/seo_strategy` will chain.

#### 4.1 Command Spec

```
/keyword_opportunities <domain>
```

**What it does:**
1. Scans the domain's current keyword positions (Ahrefs)
2. Identifies competitors automatically (Ahrefs)
3. Runs keyword gap analysis (what competitors rank for, domain doesn't)
4. Validates opportunities via SERP analysis
5. Scores and prioritizes all opportunities

**Tools used:**

| # | Tool | Purpose |
|---|------|---------|
| 1 | `run-apify-ahrefs.sh {domain} keywords` | Current keyword rankings + positions |
| 2 | `run-apify-ahrefs.sh {domain} competitors` | Auto-discover competitors |
| 3 | `run-apify-ahrefs.sh {competitor} keywords` | Competitor keyword inventory |
| 4 | `run-apify-serp.sh "{top keywords}"` | SERP features, PAA, difficulty validation |
| 5 | `run-sitemap-gen.sh {domain}` | Existing content inventory |
| 6 | `web_search site:{domain}` | Indexed page count |

**Output:** `projects/{project}/research/seo/keyword-opportunities-{YYYY-MM-DD}.md`

**Output sections:**

1. **Domain Baseline**
   - Current indexed pages, estimated organic traffic, top 10 keywords

2. **Quick Wins (Positions 11-30)**
   - Keywords already ranking on page 2-3
   - Specific action per keyword: optimize title, add H2, write supporting article
   - Estimated traffic gain if pushed to page 1

3. **Low-Hanging Fruit (KD < 30, Vol > 100)**
   - Easy keywords with decent volume
   - Sorted by volume/difficulty ratio
   - Grouped by topic potential

4. **Content Gap Matrix**
   - Keywords competitors rank for but domain doesn't
   - Grouped by topic cluster
   - Each with volume, KD, and which competitor ranks

5. **Priority Scoring**
   ```
   Priority = (Volume × CTR_estimate) / (KD × Effort_estimate)
   ```
   - CTR_estimate: based on SERP features (featured snippet, PAA, etc.)
   - Effort_estimate: 1 (optimize existing) / 2 (write short article) / 3 (write long article) / 5 (build silo)

6. **Content Brief Queue (Top 10)**
   - Top 10 keywords ready to write
   - Each with: title suggestion, URL slug, word count, H1 (unique per SOP)
   - Follows SOP cannibalization rules

7. **Revenue Projection**
   - Top 20 opportunities × estimated traffic × CVR × AOV

#### 4.2 Tasks

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 4.2.1 | Create `skills/seo/commands/keyword-opportunities.md` | ✅ COMPLETE | — |
| 4.2.2 | Create `skills/keyword-opportunities/SKILL.md` (Telegram wrapper) | ✅ COMPLETE | 4.2.1 |
| 4.2.3 | E2E test with modash.io | ✅ COMPLETE | 4.2.2 |
| 4.2.4 | Register in gateway, verify Telegram command | ✅ COMPLETE (#12) | 4.2.3 |

---

### Phase 2: State File Schema (Chaining Infrastructure)

**Priority:** HIGH — required for `/seo_strategy` to chain tools.

#### 4.3 State File Design

Path: `projects/{project}/research/seo/strategy-state.json`

```json
{
  "version": 1,
  "domain": "maxkickusa.medusajs.site",
  "project": "max-kick",
  "created": "2026-02-18T00:00:00Z",
  "updated": "2026-02-18T01:30:00Z",
  "phases": {
    "discover": {
      "status": "complete",
      "completed_at": "2026-02-18T00:15:00Z",
      "baseline": {
        "indexed_pages": 42,
        "estimated_traffic": 1200,
        "lighthouse_scores": { "seo": 85, "performance": 72, "accessibility": 91 },
        "broken_links": 3,
        "sitemap_pages": 38,
        "existing_h1s": ["..."],
        "technical_issues": ["..."]
      }
    },
    "analyze": {
      "status": "complete",
      "completed_at": "2026-02-18T00:35:00Z",
      "quick_wins": [
        { "keyword": "...", "position": 14, "volume": 890, "action": "optimize title" }
      ],
      "low_hanging_fruit": [
        { "keyword": "...", "kd": 18, "volume": 450, "topic_cluster": "..." }
      ],
      "content_gaps": [
        { "keyword": "...", "competitor": "zyn.com", "competitor_position": 3, "volume": 1200 }
      ],
      "competitors": ["zyn.com", "roguenicotine.com"]
    },
    "prioritize": {
      "status": "complete",
      "completed_at": "2026-02-18T00:50:00Z",
      "ranked_opportunities": [
        { "keyword": "...", "priority_score": 8.5, "tier": "quick-win", "estimated_traffic": 340 }
      ],
      "top_themes": [
        { "theme": "nicotine pouches safety", "opportunity_count": 8, "total_volume": 4500 }
      ]
    },
    "plan": {
      "status": "in_progress",
      "clusters": [
        { "theme": "...", "articles": 15, "cluster_plan_file": "cluster-plan-...-2026-02-18.md" }
      ],
      "publication_calendar": { "months": 6, "total_articles": 45, "articles_per_week": 2 },
      "technical_fixes": [
        { "issue": "missing canonical on /products", "priority": "high", "effort": "5 min" }
      ]
    },
    "deliver": {
      "status": "not_started",
      "deliverables": {
        "strategy_pdf": null,
        "content_briefs": null,
        "technical_checklist": null
      }
    }
  }
}
```

#### 4.4 State File Rules

1. Each existing tool checks for `strategy-state.json` in the project directory
2. If found, reads relevant prior phase data as context
3. Writes its output back to the appropriate phase
4. If not found, runs standalone (no dependency on state file)
5. State file is project-scoped, not global

#### 4.5 Tasks

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 4.5.1 | Define state file JSON schema | ✅ COMPLETE | — |
| 4.5.2 | Add state file read/write to `keyword-opportunities.md` | ✅ COMPLETE | Phase 1 |
| 4.5.3 | Add state file read/write to `content-cluster.md` | ✅ COMPLETE | 4.5.1 |
| 4.5.4 | Add state file read/write to `seo-audit.md` | ✅ COMPLETE | 4.5.1 |
| 4.5.5 | Add state file read/write to `competitor-seo.md` | ✅ COMPLETE | 4.5.1 |

---

### Phase 3: `/seo_strategy` Command (Layer 3 Master Pipeline)

**Priority:** MEDIUM — build after Phase 1 + 2 are validated.

#### 4.6 Command Spec

```
/seo_strategy <domain>
```

**Execution model:** Option C — autonomous with checkpoints

**Phase flow:**

```
Phase 1: DISCOVER (10-15 min)
  ├─ Run /seo_audit_quick internally
  ├─ Crawl sitemap for existing content + H1 inventory
  ├─ Discover competitors via Ahrefs
  └─ Write strategy-state.json { discover: {...} }
  ★ CHECKPOINT: "Site baseline complete. {indexed_pages} pages, {n} issues found."

Phase 2: ANALYZE (15-20 min)
  ├─ Run /keyword_opportunities internally (reads discover phase)
  ├─ Run /competitor_seo internally
  ├─ Cross-reference: quick wins + gaps + competitor strengths
  └─ Write strategy-state.json { analyze: {...} }
  ★ CHECKPOINT: "Found {n} quick wins, {n} low-hanging fruit, {n} content gaps."

Phase 3: PRIORITIZE (5-10 min)
  ├─ Score all opportunities: Priority = (Vol × CTR) / (KD × Effort)
  ├─ Group by topic cluster potential
  ├─ Identify top 3-5 strategic themes
  └─ Write strategy-state.json { prioritize: {...} }
  ★ CHECKPOINT: "Top themes: {theme1}, {theme2}, {theme3}. Proceeding to content planning."

Phase 4: PLAN (20-30 min)
  ├─ Run /content_cluster for top 3-5 themes (reads prioritize phase)
  ├─ Build 3-6 month publication calendar
  ├─ Compile technical quick-fix list from discover phase
  ├─ Cannibalization check across ALL planned articles + existing pages
  └─ Write strategy-state.json { plan: {...} }
  ★ CHECKPOINT: "{n} articles planned across {n} silos. {n} technical fixes identified."

Phase 5: DELIVER (10-15 min)
  ├─ Generate executive strategy PDF (Next.js, 8.5"×11")
  ├─ Compile content briefs (top 10 articles ready to write)
  ├─ Compile technical implementation checklist
  └─ Write strategy-state.json { deliver: {...} }
  ★ FINAL: Preview URL + deliverables summary
```

**Total estimated time:** 60-90 minutes

#### 4.7 Deliverables Package

The `/seo_strategy` command produces:

1. **Executive Strategy PDF** (print-ready, client-facing)
   - Executive summary
   - Current state assessment
   - Competitive landscape
   - Opportunity analysis (top 20 keywords with priority scores)
   - Content roadmap (3-6 month plan with silo architecture)
   - Technical fixes list
   - Revenue projections
   - Implementation timeline

2. **Content Briefs File** (internal, for writers)
   - Top 10 articles ready to write
   - Each with: H1, H2 outline, target keyword, word count, URL, meta description
   - All following SOP cannibalization rules

3. **Technical Fix Checklist** (internal, for developers)
   - Broken links to fix
   - Missing canonical tags
   - Schema gaps
   - Image optimization opportunities
   - Core Web Vitals improvements

#### 4.8 Tasks

| # | Task | Status | Depends On |
|---|------|--------|-----------|
| 4.8.1 | Create `skills/seo/commands/seo-strategy.md` | NOT STARTED | Phase 1 + 2 |
| 4.8.2 | Create `skills/seo-strategy/SKILL.md` (Telegram wrapper) | NOT STARTED | 4.8.1 |
| 4.8.3 | Create strategy PDF template (Next.js) | NOT STARTED | 4.8.1 |
| 4.8.4 | Test full pipeline with maxkickusa.medusajs.site | NOT STARTED | 4.8.2 + 4.8.3 |
| 4.8.5 | Register in gateway, verify Telegram command | NOT STARTED | 4.8.4 |

---

## 5. Use Cases

### Use Case 1: New Client Pitch

```
Day 1: /seo_audit_quick maxkickusa.com        → quick health snapshot for the call
Day 1: /competitor_seo maxkickusa.com zyn.com  → competitive landscape for the pitch
Day 2: /seo_strategy maxkickusa.com            → full strategy package for the proposal
```

### Use Case 2: Monthly Retainer Work

```
Week 1: /keyword_opportunities maxkickusa.com  → "what to write this month"
Week 1: /content_cluster maxkickusa.com "topic" → plan the articles
Week 4: /generate_seo_report maxkickusa.com    → monthly progress report
```

### Use Case 3: Product Launch

```
/product_page_report maxkickusa.com/products/new-flavor
```
One command → full product page optimization + content plan + PDF.

### Use Case 4: "We're Getting Crushed by Competitor X"

```
/competitor_seo maxkickusa.com zyn.com roguenicotine.com
→ see exactly where they're winning
/keyword_opportunities maxkickusa.com
→ find the gaps you can fill fastest
/content_cluster maxkickusa.com "nicotine pouches vs alternatives"
→ plan the comparison content silo
```

### Use Case 5: Quarterly Strategy Refresh

```
/seo_strategy maxkickusa.com
→ re-run full pipeline, compare against previous strategy-state.json
→ new opportunities since last quarter
→ updated content roadmap
```

---

## 6. SOP Integration

All content-producing commands enforce the Product SEO + LLM SOP (2026):

| SOP Section | Enforced By |
|-------------|------------|
| Step 4: Heading Structure (No Cannibalization) | `/content_cluster`, `/seo_strategy` Phase 4 |
| Step 5: LLM Micro-Summary Blocks | `/content_cluster`, `/product_page_report` |
| Step 12: Pillar Page Requirements | `/content_cluster` |
| Step 13: 12-20 Supporting Articles | `/content_cluster` |
| Step 14: Interlinking Structure | `/content_cluster`, `/seo_strategy` Phase 4 |
| Step 15: Unique Heading Enforcement | `/content_cluster`, `/seo_strategy` Phase 4 |
| Publication Schedule (anti-spam cadence) | `/content_cluster`, `/seo_strategy` Phase 4 |

**Reference files:**
- `skills/seo/references/product-seo-llm-sop-2026.md`
- `skills/seo/references/product-publication-schedule.md`
- `skills/seo/references/product-seo-llm-sop-original.md`

---

## 7. Telegram Commands (Final List)

After full implementation, the Telegram `/` menu will show:

| # | Command | Layer | Purpose |
|---|---------|-------|---------|
| 1 | `/seo_strategy` | Strategy | Complete top-to-bottom SEO engagement |
| 2 | `/product_page_report` | Workflow | Product page → PDF proposal |
| 3 | `/content_cluster` | Workflow | One topic → silo + articles |
| 4 | `/generate_seo_report` | Workflow | Site-wide audit → PDF |
| 5 | `/keyword_opportunities` | Tool | Scan domain for quick wins |
| 6 | `/competitor_seo` | Tool | DA + keyword gap analysis |
| 7 | `/seo_audit_quick` | Tool | 7-tool health check |
| 8 | `/seo_orchestrator` | Router | Natural language SEO routing |
| 9 | `/deploy_and_publish` | Utility | Deployment pipeline |
| 10 | `/quality_critic` | Utility | Quality review |
| 11 | `/project_scaffold` | Utility | New project setup |
| 12 | `/workspace_audit` | Utility | Workspace health |
| 13 | `/workspace_reconcile` | Utility | Fix workspace issues |

---

## 8. Implementation Priority

| Priority | Phase | What | Est. Effort |
|----------|-------|------|-------------|
| **P0** | Phase 1 | `/keyword_opportunities` command | 2-3 hours |
| **P1** | Phase 2 | State file schema + integration | 1-2 hours |
| **P2** | Phase 3 | `/seo_strategy` command + PDF template | 4-6 hours |
| **P3** | — | Quarterly comparison (diff vs previous state) | 1-2 hours |

---

## 9. File Tracking

| File | Purpose | Status |
|------|---------|--------|
| `skills/seo/commands/keyword-opportunities.md` | Command spec | NOT STARTED |
| `skills/keyword-opportunities/SKILL.md` | Telegram wrapper | NOT STARTED |
| `skills/seo/commands/seo-strategy.md` | Master pipeline spec | NOT STARTED |
| `skills/seo-strategy/SKILL.md` | Telegram wrapper | NOT STARTED |
| `skills/seo/templates/strategy-report/` | PDF template (Next.js) | NOT STARTED |
| `strategy-state.json` schema | State file for chaining | NOT STARTED |

---

## 10. Success Criteria

1. `/keyword_opportunities` produces a prioritized opportunity list with quick wins, low-hanging fruit, and content gaps in < 15 minutes
2. `/seo_strategy` chains all phases autonomously, each phase reads prior phase output via state file
3. Checkpoints produce interim summaries at each phase boundary
4. All content plans enforce SOP cannibalization rules (unique H1/H2/meta)
5. Executive strategy PDF is client-ready (print-quality, 8.5"×11")
6. Individual Layer 1 tools still work standalone (no dependency on state file)
