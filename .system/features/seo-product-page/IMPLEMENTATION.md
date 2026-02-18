# SEO Product Page Skill — Implementation Proposal

> Feature: `seo-product-page`
> Created: 2026-02-17
> Status: Phase 4b — Live Agent Testing
> Owner: SEO Agent (Pro)
> Desired Output: Reproducible, print-ready PDF proposal for any product page

---

## Goal

Build a production-ready SEO skill that takes a product URL (or product brief) and produces:
1. A fully populated product page SEO spec
2. A 12-20 article content cluster plan with anti-spam publication schedule
3. A client-facing, print-ready proposal report (Next.js, 8.5"×11" PDF)
4. All outputs critic-reviewed and session-resumable

**The entire pipeline runs autonomously via a single Telegram command.**

---

## Phase 1: Skill Implementation (SKILL.md + Commands)

Wire the SOP into actionable agent instructions with tool commands per step.

- [x] **1.1** Expand `SKILL.md` with explicit tool commands for each of the 16 steps
  - Step 1: `run-apify-ahrefs.sh {domain} keywords`, `run-apify-serp.sh "{keyword}"`, `web_search`
  - Step 2: URL validation via `curl -sI` (redirect check, canonical)
  - Step 3: `curl` raw HTML → extract `<title>`, `<meta name="description">`
  - Step 4: `web_fetch` → heading hierarchy extraction, `run-sitemap-gen.sh` → all pages for cannibalization check
  - Step 5-6: `web_fetch` → content analysis, `seo-content/SKILL.md` E-E-A-T scoring, `seo-geo/SKILL.md` citability
  - Step 7: `seo-images/SKILL.md` audit, `analyze_visual.py` screenshots
  - Step 8: Graph spec generation (SVG/PNG requirements)
  - Step 9: `seo-schema/SKILL.md` + `templates.json` → generate Product, Offer, FAQ, Breadcrumb JSON-LD
  - Step 10: FAQ generation from SERP PAA (`run-apify-serp.sh`) + competitor FAQs
  - Step 11: Review/UGC platform detection
  - Step 12-13: `run-apify-ahrefs.sh competitors` + `run-apify-serp.sh` for topic gap → cluster plan
  - Step 14: Interlinking map generator (from sitemap crawl + cluster plan)
  - Step 15: Cannibalization checker (heading extraction across all pages via `parse_html.py`)
  - Step 16: `run-lighthouse.sh` + `run-broken-links.sh` + `run-accessibility.sh` pre-publish QA

- [x] **1.2** Create 4 Telegram command files in `skills/seo/commands/`:
  - `product-page-spec.md` — Generate full spec (Steps 1-6)
  - `product-page-audit.md` — Audit existing page against all 16 steps
  - `content-cluster.md` — Plan 12-20 articles with publication schedule
  - `product-page-report.md` — Full pipeline: research → audit → cluster → report → critic → delivery

- [x] **1.3** Update `seo-orchestrator/SKILL.md` routing table with 4 new command triggers

- [x] **1.4** Create `references/product-page-checklist.md` — critic-specific **12-point** checklist for product page reports (expanded from 8 to 12: added E-E-A-T/YMYL, competitive intelligence, revenue projection)

- [x] **1.5** Create `references/plan-template.md` for session resumption

---

## Phase 2: Script & Tooling Setup

Validate all tools work, create any missing scripts.

- [x] **2.1** Verify Apify scripts work with product-page-specific queries (interfaces validated, all executable):
  ```bash
  run-apify-ahrefs.sh maxkickusa.com keywords us "nicotine pouches"
  run-apify-serp.sh "best nicotine pouches" "nicotine pouch reviews"
  run-apify-semrush-da.sh maxkickusa.com zyn.com rogue-nicotine.com
  ```

- [x] **2.2** Create `scripts/extract-headings.sh` — extracts all H1/H2/H3 from a domain for cannibalization check:
  ```bash
  # Crawl site → extract headings → check for duplicates
  ./extract-headings.sh {domain} > /tmp/heading-map.json
  ```

- [x] **2.3** Create `scripts/generate-interlink-map.sh` — takes cluster plan + sitemap → outputs linking instructions:
  ```bash
  # Input: cluster-plan.md + sitemap.xml → Output: interlink-map.md
  ./generate-interlink-map.sh cluster-plan.md sitemap.xml
  ```

- [x] **2.4** Create `scripts/generate-schema.sh` (tested with Max Kick product data — generates valid Product, Offer, FAQ, Breadcrumb JSON-LD) — wrapper around `seo-schema/templates.json` for product pages:
  ```bash
  # Input: product data → Output: JSON-LD blocks (Product, Offer, FAQ, Breadcrumb)
  ./generate-schema.sh --product "Nicotine Pouches" --price 29.99 --brand "Max Kick"
  ```

- [x] **2.5** Validate all existing scripts run cleanly:
  - `run-lighthouse.sh` ✅ (lighthouse@13.0.3, added `--strategy mobile|desktop` flag)
  - `run-broken-links.sh` ✅ (broken-link-checker@0.7.8)
  - `run-accessibility.sh` ✅ (pa11y@9.1.0)
  - `run-sitemap-gen.sh` ✅ (sitemap-generator-cli@7.5.0)
  - `fetch_page.py` / `parse_html.py` / `analyze_visual.py` ✅ (all executable)

- [x] **2.6** Create `scripts/estimate-revenue.sh` — revenue projection from cluster keyword volumes (CTR curves + CVR + AOV)

- [x] **2.7** Create `scripts/validate-proposal.sh` — 12-check pre-critic gate (article count, title length, ©, placeholders, OOS, E-E-A-T, revenue, platform recs, mobile/desktop CWV, tool claims, data source, exec summary). Tested 12/12 PASS on golden example.

- [x] **2.8** Add `--strategy mobile|desktop` flag to `run-lighthouse.sh` (mobile emulation: 412×823, Moto G Power)

- [x] **2.9** Add 6 Mandatory Pre-Audit Checks to SKILL.md (A-F: platform detection, YMYL/E-E-A-T, mobile+desktop Lighthouse, OOS detection, competitive authority, revenue projection)

- [x] **2.10** Create golden example: `references/golden-example-proposal.tsx` + `references/GOLDEN-EXAMPLE.md` (HempHouse, Feb 2026)

- [x] **2.11** Update `product-page-report.md` with Phase 0 + Phase 4.5, 13 critical rules, 24 tools

- [x] **2.12** Symlink 26 skills into `openclaw/skills/` for gateway discovery (15 SEO + 11 workspace). Gateway: 36→51 ready skills. Created `register-workspace-skills.sh` + `SKILL-REGISTRATION.md`.

---

## Phase 3: Gold Standard Report Template

Create the proposal template that the dev-coder uses to generate reports.

- [x] **3.1** Design report structure (8.5"×11" print-ready, Next.js/Tailwind) — **dynamic page count (5 core + 3 conditional)**:
  ```
  CORE (always):
  Page 1: Cover — product name, brand, exec summary, key metrics
  Page 2: Current State Audit — 16-step score card, phase scores, tool log
  Page 3: SEO Specification — title, meta, H1-H3, AI blocks, image spec
  Page 4: Content Cluster — articles by category, anti-spam schedule
  Page 5: Action Plan & Timeline — prioritized fixes, 90-day roadmap, CTA
  
  CONDITIONAL (data-driven):
  Page 4a: Schema & Technical — if CWV/schema issues warrant full page
  Page 5a: Competitive Landscape — if 3+ competitors with keyword gap data
  Page 5b: Publication Schedule — if cluster >15 articles
  ```

- [x] **3.2** Create gold standard `proposal.tsx` template (935 lines, 8 page types, INCLUDE_PAGES flags, data constants at top)

- [x] **3.3** Build supporting files (layout.tsx, globals.css, page.tsx, next.config.mjs, tsconfig.json, tailwind.config.js, postcss.config.js, package.json)

- [ ] **3.4** Test print output at 8.5"×11" — verify no overflow, proper page breaks (Phase 4b E2E)

---

## Phase 4: E2E Testing

### Phase 4a: Manual Tool + Template Validation (COMPLETE)

Ran 9 SEO tools against celavii.com and populated the report template with real data.
Target: celavii.com | Date: Feb 17-18, 2026 | Grade: **Template layer validated, agent layer untested**

- [x] **4a.1** HTML fetch + meta extraction (curl + sed/grep) — 86,773 bytes, title ✅, meta ✅, OG ✅, **H1 missing**, 0 JSON-LD
- [x] **4a.2** Lighthouse v13 desktop — Perf: 79, SEO: 100, A11y: 89, BP: 100
- [x] **4a.3** Broken-link-checker — **39 broken / 217 total** (13 footer 404s: /careers, /contact, /press, /terms, /privacy, /cookies, /security, /integrations, /blog, /help, /guides, /templates, /about)
- [x] **4a.4** pa11y accessibility — ⚠️ BLOCKED (Chrome 145 not installed on host)
- [x] **4a.5** Sitemap analysis — 12 pages in sitemap.xml, proper `<lastmod>` + `<priority>`
- [x] **4a.6** Robots.txt — Well-configured (Allow: /, 5 Disallow rules, Sitemap reference)
- [x] **4a.7** Security headers — **1/5 present** (HSTS ✅, CSP ❌, X-Frame ❌, X-Content-Type ❌, Referrer-Policy ❌)
- [x] **4a.8** Schema generation via `generate-schema.sh` — Product + Offer JSON-LD generated
- [x] **4a.9** Template population — 7-page proposal.tsx with real audit data (610 lines)
- [x] **4a.10** Dev server verification — Next.js compiled, `GET / 200` in 1084ms

**Key Findings:**
- Product Score: **52/100** (3 pass, 5 warn, 8 fail across 16 steps)
- Critical gaps: No H1, no JSON-LD schema, 39 broken links, 4.0s LCP, no canonical tags
- Zero LLM optimization (no AI Definition Block, no FAQ, no Quick Answer)
- Zero content authority (no blog, no supporting articles)
- Strong foundation: Lighthouse SEO 100, all images have alt text, proper robots.txt

### Phase 4b: Live Agent Testing via Telegram (READY TO START)

Prerequisites completed:
- ✅ All 26 skills symlinked into `openclaw/skills/` for gateway discovery
- ✅ Gateway restarted with 51 ready skills (includes all 15 SEO + 14 commands)
- ✅ validate-proposal.sh tested 12/12 PASS on golden example
- ✅ APIFY_API_TOKEN verified working (user: blank_quibble, STARTER plan)

**Test order (simplest → full pipeline):**

- [ ] **4.1** Test `/product-page-spec` on Max Kick:
  ```
  /product-page-spec https://maxkickusa.medusajs.site/products/nicotine-pouches
  ```
  - Verify keyword research runs (Apify Ahrefs + SERP)
  - Verify spec template is fully populated (keyword table, entity map, title, meta, headings, AI blocks, FAR)
  - Verify output saved to `projects/max-kick/research/seo/product-spec-*.md`
  - Verify plan.md created and updated

- [ ] **4.2** Test `/product-page-audit` on Max Kick:
  ```
  /product-page-audit https://maxkickusa.medusajs.site/products/nicotine-pouches
  ```
  - Verify Phase 0 pre-audit checks run (platform detection, YMYL, mobile LH, OOS)
  - Verify all 16+ tools execute (Lighthouse desktop+mobile, broken links, etc.)
  - Verify 16-step scoring produces gap analysis
  - Verify E-E-A-T and GEO sections populated

- [ ] **4.3** Test `/content-cluster` with real keyword:
  ```
  /content-cluster nicotine pouches maxkickusa.medusajs.site
  ```
  - Verify 12-20 articles planned with topics, categories, word counts
  - Verify publication schedule matches anti-spam cadence
  - Verify interlinking map generated
  - Verify `estimate-revenue.sh` runs and produces projection

- [ ] **4.4** Test `/product-page-report` end-to-end:
  ```
  /product-page-report https://maxkickusa.medusajs.site/products/nicotine-pouches
  ```
  - Phase 0 pre-audit checks (platform, YMYL, mobile LH, OOS, competitive)
  - Phase 1-3 research completes autonomously (no user prompts)
  - Phase 4 report generated by dev-coder from golden example template
  - Phase 4.5 `validate-proposal.sh` runs → must get 12/12 PASS
  - Phase 5 quality-critic reviews using 12-point checklist vs golden example
  - Phase 6 delivery with preview URL
  - Verify plan.md tracks all phases
  - Verify report has: OOS warning (if applicable), E-E-A-T section, revenue projection, platform-specific recs, mobile+desktop CWV
  - Verify session resumption works (kill mid-pipeline, restart)

- [ ] **4.5** Document issues found during testing — create fix log

---

## Phase 5: Skill Refinement

Iterate on skill based on e2e test findings.

### 5a: Fixes Applied (from celavii.com audit — Feb 18, 2026)

- [x] **5.1** Fix SKILL.md gaps revealed by celavii.com audit:
  - Added **H1 existence check** to Step 4 ("H1 must exist — fails immediately if missing")
  - Added **security headers audit** (16g) to Step 16 with 5-header checklist and scoring
  - Added **H1 verification command** (16h) to Step 16 for SPA/Next.js sites
  - Added **canonical tag verification** (16i) to Step 16
  - Added `/llms.txt` as a deliverable in Step 5
- [x] **5.2** Fix checklist gaps — added new **Point 9: Technical Health**:
  - 9.1 H1 tag existence (FAIL if missing)
  - 9.2 Canonical tag presence (FAIL if missing)
  - 9.3 Broken links threshold (0=PASS, 1-5=WARN, >5=FAIL)
  - 9.4 Core Web Vitals with actual vs. target thresholds
  - 9.5 Security headers (5/5=PASS, 3-4=WARN, <3=FAIL)
  - 9.6 /llms.txt and AI crawler access
  - Added Point 9 to critic output summary table
- [x] **5.3** Fix plan-template.md — added 5 missing tools to execution log:
  - Tool 12: Security headers (curl -sI)
  - Tool 13: Heading extraction (H1/H2/H3)
  - Tool 14: Canonical tag check
  - Tool 15: robots.txt analysis
  - Tool 16: generate-schema.sh

### 5b: Remaining Refinement (Not Started)

- [ ] **5.4** Tune command descriptions for better Telegram UX (shorter triggers, clearer argument hints)
- [ ] **5.5** Add edge case handling:
  - New product (no existing page to audit)
  - Competitor-heavy market (>5 competitors)
  - Non-English products
  - Products without reviews
- [ ] **5.6** Update publication schedule timing if anti-spam cadence needs adjustment

---

## Phase 6: Production Finalization

Lock the skill for production use.

- [ ] **6.1** Final e2e test — run `/product-page-report` on a fresh product, verify PDF output
- [ ] **6.2** Update architecture docs:
  - `skills.md` — verify SEO count (15), new commands listed in artifacts
  - `VALUES.md` — verify SKILL.md count
  - `CHANGELOG.md` — entry for production-ready skill
- [ ] **6.3** Update `WORKSPACE.md` skills inventory if counts changed
- [x] **6.4** ~~Create `references/gold-standard-example.md`~~ — DONE: `GOLDEN-EXAMPLE.md` + `golden-example-proposal.tsx` (HempHouse, Feb 2026)
- [ ] **6.5** Run `scripts/arch-verify.sh` — confirm zero drift
- [ ] **6.6** Mark this implementation as COMPLETE

---

## Success Criteria

| Criteria | Metric |
|----------|--------|
| **Reproducible** | Same product → same quality output every time |
| **Autonomous** | Single Telegram command triggers full pipeline |
| **Session-resumable** | `plan.md` enables pickup after session break |
| **Critic-reviewed** | Quality gate before delivery (PASS required) |
| **Print-ready** | 8.5"×11" PDF, no overflow, proper page breaks |
| **Data-backed** | Every metric traces to a tool output (no fabrication) |
| **Fast** | Full pipeline <75 min (vs 2-4 weeks human) |
| **Client-ready** | PDF can be shared directly with client/CMO |

---

## File Tracking

| File | Status | Phase |
|------|--------|-------|
| `skills/seo/seo-product-page/SKILL.md` | ✅ Created | Phase 0 |
| `skills/seo/seo-product-page/README.md` | ✅ Created | Phase 0 |
| `skills/seo/seo-product-page/references/publication-schedule.md` | ✅ Created | Phase 0 |
| `knowledge/seo/references/product-seo-llm-sop-2026.md` | ✅ Created | Phase 0 |
| `skills/seo/commands/product-page-spec.md` | ✅ Created | Phase 1 |
| `skills/seo/commands/product-page-audit.md` | ✅ Created | Phase 1 |
| `skills/seo/commands/content-cluster.md` | ✅ Created | Phase 1 |
| `skills/seo/commands/product-page-report.md` | ✅ Created | Phase 1 |
| `skills/seo/seo-product-page/references/product-page-checklist.md` | ✅ Created | Phase 1 |
| `skills/seo/seo-product-page/references/plan-template.md` | ✅ Created | Phase 1 |
| `skills/seo/scripts/extract-headings.sh` | ✅ Created | Phase 2 |
| `skills/seo/scripts/generate-interlink-map.sh` | ✅ Created | Phase 2 |
| `skills/seo/scripts/generate-schema.sh` | ✅ Created | Phase 2 |
| `skills/seo/seo-product-page/template/` (8 files) | ✅ Created | Phase 3 |
| `projects/celavii/deliverables/product-page-seo-report/` (9 files) | ✅ Created | Phase 4a |
| Phase 4a manual tool validation (celavii.com) | ✅ Complete | Phase 4a |
| Phase 4b live agent testing (Telegram) | ⬜ Ready to start | Phase 4b |
| `skills/seo/scripts/estimate-revenue.sh` | ✅ Created | Phase 2 |
| `skills/seo/scripts/validate-proposal.sh` | ✅ Created + tested 12/12 | Phase 2 |
| `skills/seo/seo-product-page/references/GOLDEN-EXAMPLE.md` | ✅ Created | Phase 6 |
| `skills/seo/seo-product-page/references/golden-example-proposal.tsx` | ✅ Created | Phase 6 |
| `~/agent-workspace/scripts/register-workspace-skills.sh` | ✅ Created | Phase 2 |
| `~/agent-workspace/knowledge/system-architecture/SKILL-REGISTRATION.md` | ✅ Created | Phase 2 |

---

_Last updated: 2026-02-18 05:30_
