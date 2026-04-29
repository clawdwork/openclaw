# SEO + Blog Skills Upgrade — Implementation Plan (v2)

> **Status:** v1.2 — Phase 1 ready to begin (Q1-Q7 answered)
> **Created:** 2026-04-27 (v1.0); v1.1 validation; v1.2 corrections from user feedback
> **Owner:** SEO Agent + Blogger Agent (joint)
> **Supersedes:** [../v1/IMPLEMENTATION.md](../v1/IMPLEMENTATION.md) (v1 was the 3-layer SEO suite — this v2 layers community-vendored capabilities on top)
> **Research backing:** [docs/repos.md](docs/repos.md), [docs/frameworks.md](docs/frameworks.md), [docs/integration-recommendations.md](docs/integration-recommendations.md)
> **Related:** [../../social-strategy/social-agents-implementation-proposal.md](../../social-strategy/social-agents-implementation-proposal.md) (parallel pattern — adopt its rigor)
> **Dependencies:** `~/dev/research/claude-seo` (community, just synced), `~/dev/research/claude-blog` (community, just synced), Google Cloud project (to be created)

---

## 1. Goal

Adopt high-value capabilities from the community-maintained `claude-seo` (24 skills, 18 agents) and `claude-blog` (22 skills, 4 agents) repositories into our internal `skills/seo/` (35 skills) and `skills/blogger/` (16 skills) ecosystems.

The upgrade closes three concrete capability gaps that are blocking current Celavii work:

1. **Google API integration** — we are blind to _why_ 77% of published blog posts (10 of 13) are not indexed by Google. We have no programmatic GSC, Indexing API, CrUX, or GA4 access.
2. **Pre/post-publish quality gates** — we lack automated fact-checking, drift detection, and keyword cannibalization detection. All currently manual.
3. **Authority-building automation** — strategy targets +5 referring domains by 2026-05-27. We have no backlink gap analysis tool to identify replicable competitor backlinks.

This proposal does NOT replace our internal stack. It augments it. We retain our Apify-heavy competitive intelligence (8 scrapers), revenue-projected keyword opportunities, strategy-state-v2 audit trail, per-article planning, audio versioning, and locked publishing — all of which exceed community capabilities.

---

## 2. References & Why They Matter

| Reference                                                                                                                        | What we borrow                                                              | Why                                                   |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| [../v1/IMPLEMENTATION.md](../v1/IMPLEMENTATION.md)                                                                               | 3-layer architecture (Tools / Workflows / Strategy), 10-section format      | v1 SEO suite is in production — this v2 layers ON TOP |
| [../v1/TRACKER.md](../v1/TRACKER.md)                                                                                             | Per-task checkbox tracker, Phase 0/1/2 grouping, dry-run findings reference | Pattern proven for SEO Phase 1+2                      |
| [../../social-strategy/social-agents-implementation-proposal.md](../../social-strategy/social-agents-implementation-proposal.md) | 7-phase pipeline rigor, intake flow, raw archive, dual critic gates         | Parallel discipline — apply same standards            |
| [../../social-strategy/docs/integration-recommendations.md](../../social-strategy/docs/integration-recommendations.md)           | License compliance table, "What NOT to Do" pattern, skill-to-repo mapping   | Reusable template                                     |
| [../../social-strategy/docs/frameworks.md](../../social-strategy/docs/frameworks.md)                                             | Empirical 2026 data, anti-slop research, Self-Refine + Reflexion patterns   | Same ground truth applies to blog content             |
| [DRY-RUN-TEST-FINDINGS](../v1/) (SEO post-mortem)                                                                                | "Critic must read intake before scoring" lesson                             | Don't re-create known failure mode                    |
| `~/dev/workspace/projects/celavii/research/seo/strategy-state-v2-2026-04-27.json`                                                | Current state + indexation diagnosis                                        | New skills feed this same audit trail                 |
| `~/dev/research/claude-seo/skills/seo-google/`                                                                                   | All Google API scripts                                                      | Direct vendor source                                  |
| `~/dev/research/claude-blog/skills/blog-google/`                                                                                 | Same scripts surfaced from blog orchestrator                                | Confirms one-time setup unlocks both                  |
| `~/dev/openclaw/.claude/rules/social-constitution.md`                                                                            | Brand voice, banned language, gate principles (10 articles)                 | Constitutional principle file pattern                 |

---

## 3. Architecture: 4 Phases + Dry-Run

```
Phase 4: OPTIONAL — Quality-of-life automations
  ├─ blog-image — Gemini hero/inline generation (formalize manual flow)
  ├─ blog-audio Gemini TTS (replace manual Minimax)
  └─ blog-persona — formal voice rules (defer until multi-author)

Phase 3: MEDIUM — Authority + content intelligence
  ├─ seo-backlinks — Moz + CommonCrawl + DataForSEO gap analysis
  └─ seo-cluster — SERP-overlap semantic clustering (vs. our text-similarity)

Phase 2: HIGH — Quality gates
  ├─ seo-drift — SQLite-backed regression detection (17 rules)
  ├─ blog-factcheck — auto-verify cited stats + source URLs (cross-model critic)
  └─ blog-cannibalization — embeddings + cosine-similarity (NOT keyword matching)

★ Phase 1.5 DRY-RUN — Run Phase 1 skills against the 2 just-shipped articles
                       Document failures in DRY-RUN-FINDINGS.md before Phase 2

Phase 1: CRITICAL — Google API foundation + plugin scaffolding
  ├─ seo-google + blog-google — one Google Cloud project unlocks BOTH
  ├─ .claude-plugin/plugin.json (celavii-seo + celavii-blog)
  ├─ hooks/hooks.json (PostToolUse content validation)
  └─ skills/{seo,blogger}/references/constitution.md (skill-internal constitutional principle files; openclaw pipeline loads via skill invocation)
```

### Layer Properties

| Phase             | Source                                            | New skills                                           | New scripts | Setup time    | Impact                                                                        |
| ----------------- | ------------------------------------------------- | ---------------------------------------------------- | ----------- | ------------- | ----------------------------------------------------------------------------- |
| **1 (Critical)**  | claude-seo, claude-blog, social-strategy patterns | 2 + 2 plugin manifests + 2 constitutional rule files | 5 + hooks   | 5-7h one-time | Solves indexation visibility (today's bottleneck)                             |
| **1.5 (Dry-run)** | this proposal                                     | 0                                                    | 0           | 1h            | De-risks Phase 2                                                              |
| **2 (High)**      | claude-seo, claude-blog, OpenAI embeddings        | 3                                                    | ~12         | 5-6h          | Pre-publish gates: drift, factcheck (cross-model), cannibalization (semantic) |
| **3 (Medium)**    | claude-seo                                        | 2                                                    | ~6          | 3-4h          | Backlink gap (May-27 referring-domain target)                                 |
| **4 (Optional)**  | claude-blog                                       | 3                                                    | ~8          | 4-6h          | QoL: image/audio automation, persona                                          |

**Total Phase 1-3 estimated effort**: 14-18 hours (was 11.5-13.5 in v1.0; v1.1 adds plugin scaffolding + dry-run + cross-model critic config + constitutional files)

---

## 4. Current State Audit

### 4.1 Internal SEO Stack (`~/dev/workspace/skills/seo/`)

**35 skills directories, 29 scripts.**

#### Strengths to defend

| Capability                              | Files                                                                                              | Why it stays                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Apify scraper coverage                  | 8 scripts: `run-apify-{ahrefs,semrush-da,moz,ubersuggest,trends,autocomplete,rank-checker,...}.sh` | Community has none of these; we have superior competitive data      |
| Revenue-projected keyword opportunities | `commands/keyword-opportunities.md`, `scripts/estimate-revenue.sh`                                 | Outputs ranked by traffic × CVR × AOV — community outputs raw lists |
| Bulk competitor analysis                | `competitor-seo/`, `commands/competitor-seo.md`                                                    | Compares 10 domains at once vs. community's single-domain focus     |
| Deep-audit autonomy                     | `deep-audit/`, parallel tool execution                                                             | 45-60 min, ~$2.50/run, auto-produces markdown + PDF                 |
| Strategy audit trail                    | `~/dev/workspace/projects/celavii/research/seo/strategy-state-v2-*.json`                           | Phase-by-phase historical record (community has no equivalent)      |
| Product page SEO                        | `product-page-spec/`, `product-page-audit/`, `product-page-report/`                                | Custom Celavii flow; community has no product-page primitive        |
| 3-layer command suite (v1)              | Tools / Workflows / Strategy in `../v1/IMPLEMENTATION.md`                                          | Production-tested                                                   |

#### Gaps

| Missing capability                | Community has                                                                          | Direct cost to current work                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Google Search Console queries** | `seo-google/scripts/gsc_query.py`                                                      | We check GSC manually in browser; cannot diagnose why 77% of posts unindexed                   |
| **Google Indexing API**           | `seo-google/scripts/indexing_notify.py`                                                | Cannot submit publish-day URLs programmatically (current pending todo is manual)               |
| **CrUX historical trends**        | `seo-google/scripts/crux_history.py`                                                   | We only have point-in-time Lighthouse; no field-data regression detection                      |
| **GA4 organic reporting**         | `seo-google/scripts/ga4_report.py`                                                     | Cannot correlate SEO work to revenue per landing page                                          |
| **Drift / regression detection**  | `seo-drift/` (17 rules, SQLite)                                                        | Cannot catch deploy regressions (accidental noindex, schema break) before they kill indexation |
| **Backlink gap analysis**         | `seo-backlinks/scripts/{moz_api,bing_webmaster,commoncrawl_graph,verify_backlinks}.py` | No tool to identify replicable competitor backlinks (blocks +5 referring domains target)       |
| **SERP-overlap clustering**       | `seo-cluster/`                                                                         | We have text-similarity clustering only                                                        |

### 4.2 Internal Blog Stack (`~/dev/workspace/skills/blogger/`)

**16 skills, 4 agents (researcher, writer, rewriter, seo, reviewer), 10 scripts, 12 templates.**

#### Strengths to defend

| Capability                 | Files                                                                                                                    | Why it stays                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Per-article planning       | `~/dev/workspace/projects/celavii/content/blog/plans/{article}/plan.md`, `_handoffs/*.zip`                               | Reproducibility, distributed authorship — community uses GUI (Rankenstein) we use git   |
| Audio versioning           | `published/{slug}.mp3`, `archive/audio-versions/`, `AUDIO-PLAN.md` state file                                            | Prevents stale audio; community treats audio as ad-hoc                                  |
| Locked published directory | Convention enforced in `PROJECT.md`                                                                                      | Prevents accidental overwrites — community has no governance                            |
| SEO ↔ Blog coupling        | Blog orchestrator routes through SEO agent for keyword/cluster alignment                                                 | Tighter than community's decoupled flow; ensures every article hits a strategic keyword |
| 12 templates               | `templates/{case-study,comparison,how-to-guide,listicle,pillar-page,...}.md`                                             | Match community templates 1:1 — neither side has more                                   |
| Pipeline scripts           | `blog_finalize.py`, `blog_preflight.py`, `blog_pipeline.py`, `blog_validate.py`, `ai_detect.py`, `blog_vocab_analyze.py` | Custom Celavii gates community lacks                                                    |

#### Gaps

| Missing capability                       | Community has                                                              | Direct cost to current work                                                                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google Search Console / Indexing API** | `blog-google/` (same scripts as `seo-google`)                              | Same gap — counts once across both stacks                                                                                                                                             |
| **Fact-checking automation**             | `blog-factcheck/scripts/{fact_checker,claim_verifier,source_validator}.py` | Manual spot-check (~20 min/article × ongoing cadence)                                                                                                                                 |
| **Cannibalization detection**            | `blog-cannibalization/` (keyword-based)                                    | We have 18 published + 23 drafts = 41 posts; manual overlap audit takes ~2h. **NOTE**: community uses keyword matching; we'll augment with embeddings (see §10 Critical Design Rules) |
| **Image generation (formal)**            | `blog-image/scripts/` (Gemini API)                                         | We generate images manually in `media/generated/drafts/`; ~30 min/article overhead                                                                                                    |
| **NotebookLM integration**               | `blog-notebooklm/`                                                         | Source-grounded research with zero hallucination (nice-to-have)                                                                                                                       |
| **Persona management**                   | `blog-persona/`                                                            | Voice rules implicit in README.md — formalize when scaling to multi-author                                                                                                            |
| **CMS taxonomy sync**                    | `blog-taxonomy/`                                                           | Not relevant (Celavii is static MDX, no dynamic CMS) — SKIP                                                                                                                           |

### 4.3 Community Repos (Source for Adoption)

| Repo          | Path                         | Last commit                               | Skills | Agents |
| ------------- | ---------------------------- | ----------------------------------------- | ------ | ------ |
| `claude-seo`  | `~/dev/research/claude-seo`  | `a0561b2` (24h ago — actively maintained) | 24     | 18     |
| `claude-blog` | `~/dev/research/claude-blog` | `bc734cb` (2w ago)                        | 22     | 4      |

Both pulled clean (claude-seo +96 commits, claude-blog reset to origin).

---

## 5. Build Plan

### Phase 1 — Google API Foundation + Plugin Scaffolding (CRITICAL)

**Goal**: One Google Cloud project + one auth flow unlocks programmatic access for both SEO and blog agents. Plus distributable plugin scaffolding so the work can be packaged.

**Why first**: Directly addresses the 23% indexation rate that is blocking Celavii content velocity. Also closes today's pending todo (manual GSC URL Inspection submission).

#### 1.1 Google Cloud + Service Account

- [ ] **1.1.1** Use existing GCP project (already configured for `GEMINI_API_KEY` + asset generation); confirm project ID
- [ ] **1.1.2** Enable APIs: Search Console API, Indexing API, CrUX API, Google Analytics Data API
- [ ] **1.1.3** Create service account at GCP IAM (`celavii-seo@<project>.iam.gserviceaccount.com`)
- [ ] **1.1.4** Generate service account JSON key — save to `~/.config/celavii-seo/service-account.json` (gitignored, mode 600)
- [ ] **1.1.5** Add service account email as **User** in Search Console property settings (auto-detects `sc-domain:` or `https://` format)
- [ ] **1.1.6** Add service account email to GA4 property (Admin → Property Access Management); confirm GA4 is wired to celavii.com (otherwise defer GA4 acceptance to Phase 4)
- [ ] **1.1.7** Add service account email to Indexing API allowed list (in Search Console → Settings → Users and permissions → "Owner" role required for Indexing API)

#### 1.2 Vendor Google API Scripts

- [ ] **1.2.1** Copy `~/dev/research/claude-seo/skills/seo-google/scripts/google_auth.py` → `~/dev/workspace/skills/seo/scripts/google_auth.py`
- [ ] **1.2.2** Copy `gsc_query.py` → `~/dev/workspace/skills/seo/scripts/gsc_query.py`
- [ ] **1.2.3** Copy `gsc_inspect.py` → `~/dev/workspace/skills/seo/scripts/gsc_inspect.py`
- [ ] **1.2.4** Copy `indexing_notify.py` → `~/dev/workspace/skills/seo/scripts/indexing_notify.py`
- [ ] **1.2.5** Copy `crux_history.py` → `~/dev/workspace/skills/seo/scripts/crux_history.py`
- [ ] **1.2.6** Copy `ga4_report.py` → `~/dev/workspace/skills/seo/scripts/ga4_report.py`
- [ ] **1.2.7** Vendor `requirements.txt` for each script + create venv at `~/dev/workspace/skills/seo/scripts/venv/`
- [ ] **1.2.8** Add `GOOGLE_APPLICATION_CREDENTIALS=~/.config/celavii-seo/service-account.json` + `GOOGLE_GSC_PROPERTY=celavii.com` to `~/.openclaw/.env` (reuse existing `GEMINI_API_KEY` for CrUX API)
- [ ] **1.2.9** Register new env keys in `SHELL_ENV_EXPECTED_KEYS` at `openclaw/src/config/io.ts`
- [ ] **1.2.10** Adapt vendored `google_auth.py` to use service account auth (instead of OAuth flow); test connection: `python google_auth.py --test` returns "Authenticated as celavii-seo@..."

#### 1.3 Skill Wrappers

- [ ] **1.3.1** Author `~/dev/workspace/skills/seo/seo-google/SKILL.md` — routing for `/seo google {gsc,inspect,index,crux,ga4}`
- [ ] **1.3.2** Author `~/dev/workspace/skills/blogger/blog-google/SKILL.md` — wraps same scripts from blog orchestrator
- [ ] **1.3.3** Update `seo-orchestrator/SKILL.md` — add 5 new commands to routing table
- [ ] **1.3.4** Update `blog-orchestrator/SKILL.md` — add `/blog google gsc` command
- [ ] **1.3.5** Modify `blog_finalize.py` — auto-call `indexing_notify.py` on publish (mirrors §UC-1)

#### 1.4 Plugin + Hooks + Constitutional Scaffolding

- [ ] **1.4.1** Create `~/dev/workspace/skills/seo/.claude-plugin/plugin.json` — name `celavii-seo`, version 0.1.0, MIT license, NOTICE for vendored scripts
- [ ] **1.4.2** Create `~/dev/workspace/skills/blogger/.claude-plugin/plugin.json` — name `celavii-blog`, version 0.1.0, MIT license, NOTICE for vendored scripts
- [ ] **1.4.3** Author `~/dev/workspace/skills/seo/hooks/hooks.json` — placeholder for Phase 2 PostToolUse content validation
- [ ] **1.4.4** Author `~/dev/workspace/skills/blogger/hooks/hooks.json` — placeholder for Phase 2 PostToolUse content validation
- [x] **1.4.5** Author `~/dev/workspace/skills/seo/references/constitution.md` — 14 articles (intake-first, deterministic aggregate, raw archive accumulation, evidence rules, atomic skills, PROJECT.md registration, dry-run indexing, cross-model critic, iteration cap, anti-slop rubric, cosine ≥0.85, force-fresh URL inspection, GA4 DDA, canonical-only baselines). Skill-internal path; openclaw pipeline loads at skill invocation. ✅
- [x] **1.4.6** Author `~/dev/workspace/skills/blogger/references/constitution.md` — 12 articles (specificity, sourced claims, distinctive POV, banned language, cross-model critic, iteration cap, cannibalization threshold, PROJECT.md registration, URL silo routing, auto-submit on publish, audio versioning, locked published dir). Skill-internal path. ✅
- [x] **1.4.7** Cross-reference both constitutions from `seo-orchestrator/SKILL.md` (Reference Files section) + `blog-orchestrator/SKILL.md` (Shared References section). ✅

#### 1.5 Architecture Updates

> **Note**: Phase 1 sub-sections skip `1.5` to avoid collision with Phase 1.5 (Dry-Run). Sub-sections go 1.1 → 1.2 → 1.3 → 1.4 → 1.6 → 1.7.

#### 1.6 Architecture Updates

- [ ] **1.6.1** Update `openclaw/.system/architecture/security.md` — add Google API key entries
- [ ] **1.6.2** Update `openclaw/.system/architecture/VALUES.md` — add to API Keys table
- [ ] **1.6.3** Update `openclaw/.system/architecture/skills.md` — increment skill counts (35 → 36 SEO, 16 → 17 Blog)
- [ ] **1.6.4** Append CHANGELOG entry: "Added Google API integration to SEO + Blog stacks"
- [ ] **1.6.5** Run `openclaw/scripts/arch-verify.sh` — expect 0 failures

#### 1.7 Acceptance Criteria

- [ ] **1.7.1** `python gsc_query.py celavii.com --days 30` returns valid JSON with click/impression rows
- [ ] **1.7.2** `python indexing_notify.py "https://celavii.com/blog/network-intelligence/influencer-audience-intelligence"` returns HTTP 200 + quota update tracked
- [ ] **1.7.3** `python gsc_inspect.py <url>` returns programmatic indexation status for both just-shipped articles
- [ ] **1.7.4** `blog_finalize.py` auto-submits new URLs on publish (verified by simulating a publish)
- [ ] **1.7.5** Today's pending todo (manual GSC URL Inspection) is closed automatically by Phase 1
- [ ] **1.7.6** `arch-verify.sh` passes with 0 failures
- [ ] **1.7.7** Plugin manifests + constitutional files exist + are referenced from `celavii-design-system.md`

**Estimated effort**: 5-7 hours one-time

---

### Phase 1.5 — Dry-Run + Findings (★ NEW in v1.1)

**Goal**: Run Phase 1 skills against the 2 just-shipped articles and document failures BEFORE building Phase 2 on top.

**Why**: Social-strategy proposal Phase G + SEO v1 DRY-RUN-FINDINGS pattern — catch issues like "Gate A had no intake context" before they propagate.

- [ ] **1.5.1** Run `python gsc_inspect.py "https://celavii.com/blog/network-intelligence/influencer-audience-intelligence"` — capture verbose output
- [ ] **1.5.2** Run `python gsc_inspect.py "https://celavii.com/blog/network-intelligence/free-instagram-audience-overlap-tools"` — capture verbose output
- [ ] **1.5.3** Run `python gsc_query.py celavii.com --days 30 --output /tmp/gsc-baseline.json` — verify structure
- [ ] **1.5.4** Run `python crux_history.py celavii.com --weeks 25` — verify CrUX data available for celavii.com
- [ ] **1.5.5** Run `python ga4_report.py celavii.com --days 30` — verify GA4 connection + check sample landing-page output
- [ ] **1.5.6** Run `python indexing_notify.py` (dry-run mode) for both new articles — confirm 200 response, capture quota balance
- [ ] **1.5.7** Document every error, edge case, or unexpected behavior in `DRY-RUN-FINDINGS.md`
- [ ] **1.5.8** Iterate: fix the 2-3 highest-impact issues identified
- [ ] **1.5.9** Re-run smoke tests post-fix; only proceed to Phase 2 once all acceptance criteria pass

**Estimated effort**: 1-2 hours

---

### Phase 2 — Quality Gates (HIGH)

**Goal**: Catch problems pre-publish that currently leak through to live site.

#### 2A. SEO Drift Monitoring

- [ ] **2A.1** Copy `drift_baseline.py` from `~/dev/research/claude-seo/skills/seo-drift/scripts/` → `~/dev/workspace/skills/seo/scripts/drift_baseline.py`
- [ ] **2A.2** Copy `drift_compare.py` → `~/dev/workspace/skills/seo/scripts/drift_compare.py`
- [ ] **2A.3** Author `~/dev/workspace/skills/seo/seo-drift/SKILL.md` — routing for baseline / compare modes
- [ ] **2A.4** Configure SQLite location at `~/.config/celavii-seo/drift/baselines.db`
- [ ] **2A.5** Capture baseline for all 13 currently-published posts + the 2 just-shipped articles (15 baselines total)
- [ ] **2A.6** Add `seo-drift` to `seo-orchestrator/SKILL.md` routing table
- [ ] **2A.7** Acceptance: deliberate test (manually change one post's H1 in dev) is caught at severity HIGH on next compare

#### 2B. Blog Fact-Check (with cross-model critic)

> **Spec drift addressed 2026-04-29**: Upstream `claude-blog/scripts/` has no factcheck Python helpers — only a 135-line prompt-only `skills/blog-factcheck/SKILL.md`. The 3 helpers below were Celavii-authored (not vendored). Cross-model boundary lives at openclaw agent-spawn layer.

- [x] **2B.1** Author `~/dev/workspace/skills/blogger/blog-factcheck/scripts/fact_checker.py` — claim extraction, URL+value verification, tier classification, banned-language scan, 3-iter cap. ✅
- [x] **2B.2** Author `~/dev/workspace/skills/blogger/blog-factcheck/scripts/claim_verifier.py` — paraphrase-aware URL+value matcher (BS4/lxml). ✅
- [x] **2B.3** Author `~/dev/workspace/skills/blogger/blog-factcheck/scripts/source_validator.py` — Tier 1/2/3 source classifier. ✅
- [x] **2B.4** Author `~/dev/workspace/skills/blogger/blog-factcheck/SKILL.md` — vendored upstream prompt + Celavii additions (cross-model boundary, agent-spawn pattern, JSON output schema, hard-fail trigger list). ✅
- [x] **2B.5** ★ Cross-model critic configured at agent layer: Generator = `blogger` (Kimi K2.6 / Gemini 3 Flash); Critic = `quality-critic` (DeepSeek V4 Pro). $0 net new spend. ✅
- [x] **2B.6** ★ Hard-cap 3 iterations (`MAX_ITERATIONS = 3` in `fact_checker.py`; constitution Article 6). ✅
- [x] **2B.7** `blog_preflight.py` extended with `run_factcheck_gate()` — auto-runs factcheck after structural validation passes; `--skip-factcheck` flag for debug. ✅
- [x] **2B.8** `blog_vocab_analyze.py` extended with `FORBIDDEN_PHRASES` + `AI_SLOP_WORDS` from `voice.json` (canonical) + embedded fallback. New `find_banned_hits()` helper. ✅
- [x] **2B.9** Tested on 3 articles: free-instagram-audience-overlap-tools (10 hard fails + 2 banned), influencer-audience-intelligence (10 hard fails + 1 banned), seedance (3 hard fails + 1 banned). All FAIL — gate working correctly. ✅
- [x] **2B.10** Acceptance PASSED: factcheck blocks publish on HIGH-severity findings (verdict=FAIL with non-empty `hard_fails`). ✅

#### 2C. Blog Cannibalization (with embeddings, NOT keyword matching)

- [ ] **2C.1** Author `~/dev/workspace/skills/blogger/scripts/cannibalization_detector.py` — uses **`gemini-embedding-2-preview`** (768 dim) via `generativelanguage.googleapis.com/v1beta/models`, matching existing pattern in `social_listener/supabase/functions/_shared/embedding-provider.ts`
- [ ] **2C.2** Build cosine-similarity matrix across all `published/ + intermediate/ + drafts/` MDX files (41 posts)
- [ ] **2C.3** Set threshold: cosine ≥ 0.85 = HIGH, 0.75-0.85 = MEDIUM, <0.75 = clean
- [ ] **2C.4** Author `~/dev/workspace/skills/blogger/blog-cannibalization/SKILL.md`
- [ ] **2C.5** Reuse existing `GEMINI_API_KEY` in `~/.openclaw/.env` — no new key needed
- [ ] **2C.6** Modify `blog_preflight.py` — block intermediate → published if HIGH-severity cannibalization detected
- [ ] **2C.7** Run initial audit across all 41 posts; document findings; consolidate or differentiate flagged pairs
- [ ] **2C.8** Acceptance: detects existing semantic overlap between `best-influencer-marketing-tools` and `content-creator-analytics-tools` (likely candidates) at MEDIUM or HIGH severity

#### 2D. Hooks Wiring

- [ ] **2D.1** Update `~/dev/workspace/skills/blogger/hooks/hooks.json` — PostToolUse on Write/Edit of `content/blog/**/*.mdx` triggers `blog_preflight.py` + factcheck
- [ ] **2D.2** Update `~/dev/workspace/skills/seo/hooks/hooks.json` — PostToolUse on publish event triggers `drift_baseline.py`
- [ ] **2D.3** Acceptance: editing an MDX file in `intermediate/` triggers automatic preflight; failures block save (exit code 2)

**Estimated effort**: 5-6 hours

---

### Phase 3 — Authority + Content Intelligence (MEDIUM)

**Goal**: Direct support for the +5 referring domains target by 2026-05-27, plus better internal-link planning.

#### 3A. SEO Backlinks

- [ ] **3A.1** User signs up for free Moz Link Explorer API (10 min) — provide `MOZ_API_KEY`
- [ ] **3A.2** User signs up for free Bing Webmaster Tools API (10 min) — provide `BING_WEBMASTER_KEY`
- [ ] **3A.3** Add both keys to `~/.openclaw/.env` + `SHELL_ENV_EXPECTED_KEYS`
- [ ] **3A.4** Copy `moz_api.py` → `~/dev/workspace/skills/seo/scripts/moz_api.py`
- [ ] **3A.5** Copy `bing_webmaster.py` → `~/dev/workspace/skills/seo/scripts/bing_webmaster.py`
- [ ] **3A.6** Copy `commoncrawl_graph.py` → `~/dev/workspace/skills/seo/scripts/commoncrawl_graph.py` (no API key needed)
- [ ] **3A.7** Copy `verify_backlinks.py` → `~/dev/workspace/skills/seo/scripts/verify_backlinks.py`
- [ ] **3A.8** Author `~/dev/workspace/skills/seo/seo-backlinks/SKILL.md` — routing for profile / gap / verify modes
- [ ] **3A.9** Run `/seo backlinks gap modash.io` against celavii.com — output 10+ replicable backlink targets
- [ ] **3A.10** Run same against hypeauditor.com + grin.co — consolidate target list
- [ ] **3A.11** Acceptance: 10+ replicable referring-domain prospects with contact-info hints, ranked by replicability

#### 3B. SERP-Overlap Clustering

- [ ] **3B.1** Copy `serp_cluster.py` from `~/dev/research/claude-seo/skills/seo-cluster/scripts/` → `~/dev/workspace/skills/seo/scripts/serp_cluster.py`
- [ ] **3B.2** Author `~/dev/workspace/skills/seo/seo-cluster/SKILL.md` (augments existing `content-cluster/`)
- [ ] **3B.3** Run `/seo cluster plan "creator analytics platform"` — verify hub-and-spoke architecture matches Celavii's 6 silos
- [ ] **3B.4** Cross-check output against existing `strategy-state-v2-2026-04-27.json` silo structure for consistency
- [ ] **3B.5** Acceptance: output is consistent with our existing strategy-state-v2 silo structure

**Estimated effort**: 3-4 hours

---

### Phase 4 — Quality-of-Life Automation

> **Note**: Phase 4B (Blog Audio Gemini TTS) is **MANDATORY in Phase 1 timeline** (registers Gemini TTS alongside Google API setup since both reuse `GEMINI_API_KEY`). Phase 4A (Image) and 4C (Persona) remain OPTIONAL — defer if cadence ≤3/week.

#### 4A. Blog Image (Gemini) — OPTIONAL

- [ ] **4A.1** Copy `blog-image/scripts/` from claude-blog → `~/dev/workspace/skills/blogger/blog-image/scripts/`
- [ ] **4A.2** Reuse existing `GEMINI_API_KEY` (already in `.env` for asset generation)
- [ ] **4A.3** Author `~/dev/workspace/skills/blogger/blog-image/SKILL.md`
- [ ] **4A.4** Acceptance: `/blog image generate <topic>` produces hero + 3 inline images for any topic

#### 4B. Blog Audio (Gemini TTS replacement) — ★ MANDATORY (ships with Phase 1)

- [ ] **4B.1** Copy `blog-audio/scripts/` from claude-blog → `~/dev/workspace/skills/blogger/blog-audio/scripts/` (replaces Minimax flow)
- [ ] **4B.2** Update existing `generate_blog_audio.py` to use Gemini TTS as primary, Minimax as fallback
- [ ] **4B.3** Run batch on the 6 pending audio regenerations from `AUDIO-PLAN.md`
- [ ] **4B.4** Acceptance: 6 pending audio files generated; quality comparable to Minimax baseline

#### 4C. Blog Persona — OPTIONAL

- [ ] **4C.1** Copy `blog-persona/SKILL.md` → `~/dev/workspace/skills/blogger/blog-persona/SKILL.md`
- [ ] **4C.2** Encode Celavii brand voice as `.styles/celavii/voice.json` (NN/g 4D vector + Mailchimp tone-by-context)
- [ ] **4C.3** Cross-reference from `skills/blogger/references/constitution.md`
- [ ] **4C.4** Acceptance: `/blog persona apply <draft>` flags voice deviations

**Estimated effort**: 4-6 hours (only if executed)

#### 4D. Skipped Permanently

- [s] **4D.1** `blog-taxonomy` — Celavii is static MDX, no dynamic CMS

---

## 6. Critical Design Rules (Non-Negotiable)

These come from social-strategy + SEO v1 DRY-RUN post-mortem lessons. Skipping them re-creates known failure modes.

- [ ] **6.1 Critic reads intake first** — `gsc_inspect.py` callers MUST load the article's `silo` + target keyword from frontmatter before interpreting indexation status. (SEO Gate A failure root cause was missing intake context.)
- [ ] **6.2 Phase 3 (aggregate) is deterministic** — no LLM reads raw GSC JSON; a script consolidates raw → report. The LLM only reads the report. (5-10× token cost reduction, proven in SEO Phase 3.)
- [ ] **6.3 Raw archive accumulates** — every `gsc_query.py` run saves to `~/dev/workspace/projects/celavii/research/seo/raw/gsc-{property}-{ts}.json`. Never `/tmp/`. Never overwrite.
- [ ] **6.4 Evidence rules** — every drift alert cites the SQLite baseline ID + timestamp; every backlink-gap recommendation cites the source API + query date.
- [ ] **6.5 Atomic skills are independently invocable** — `gsc_query.py celavii.com` works without orchestrator. Each script takes the state-file path as arg, defaults to canonical path.
- [ ] **6.6 Files registered in PROJECT.md** — every save updates the File Index per `WORKSPACE.md` routing.
- [ ] **6.7 Always dry-run** for Indexing API submissions (200/day quota) — never auto-submit in serial loops.
- [ ] **6.8 Cross-model critic** for blog factcheck — Generator (DeepSeek V4 Pro) ≠ Critic (Opus 4.7 or Kimi K2.6). Same-model critic = false agreement (Self-Refine literature).
- [ ] **6.9 Hard cap factcheck refinement loops at 3 iterations** (Reflexion paper: diminishing returns after 3-5).
- [ ] **6.10 Anti-slop rubric** in blog-cannibalization output: specificity, novelty, sourced claims, distinctive POV. Banned tells: "delve", "tapestry", "multifaceted", "navigate the landscape".
- [ ] **6.11 Cosine ≥ 0.85 = cannibalization** (The Ad Firm method); below 0.85 = false-positive risk too high.
- [ ] **6.12 GSC URL Inspection cached status is stale** — always force fresh on inspection-API call.
- [ ] **6.13 GA4 attribution** — explicitly use Data-Driven model, never default Last-Click.
- [ ] **6.14 Drift baselines on canonical URLs only** — non-canonical URLs cause false positive drift signals.

---

## 7. Use Cases

### UC-1: Daily blog publish workflow (post-Phase 1)

```
1. Author finalizes article in `intermediate/<slug>.mdx`
2. PostToolUse hook (Phase 2D) auto-runs `blog_preflight.py` (existing) + `/blog factcheck` (Phase 2B)
3. Author moves to `published/`
4. Auto-trigger via blog_finalize.py:
   ├─ python indexing_notify.py "https://celavii.com/blog/<silo>/<slug>"
   ├─ python drift_baseline.py "https://celavii.com/blog/<silo>/<slug>" --label "publish-day"
   └─ python gsc_inspect.py "https://celavii.com/blog/<silo>/<slug>" --schedule "+7d"
```

### UC-2: Weekly indexation audit (post-Phase 1)

```
Monday cron:
  python gsc_query.py celavii.com --days 7 --output ~/dev/workspace/projects/celavii/research/seo/raw/gsc-celavii-$(date +%F).json
  python drift_compare.py celavii.com/blog/* --since 7d --severity high

Sends Telegram alert if:
  - Indexed page count drops
  - Any post regressed (drift severity HIGH)
  - Any post indexed → discovered (Google de-indexed it)
```

### UC-3: Monthly content cluster + cannibalization audit (post-Phase 2 + 3)

```
First of month:
  /blog cannibalization ~/dev/workspace/projects/celavii/content/blog/published/
  /seo cluster audit celavii.com
  /seo backlinks gap modash.io,hypeauditor.com,grin.co

Output: prioritized worklist for the month
  - Articles to consolidate (cannibalization HIGH ≥0.85)
  - Articles to interlink (cluster gaps)
  - Backlink targets (referring-domain prospects)
```

### UC-4: Pre-publish gate enforcement (post-Phase 2)

```
PostToolUse hook + blog_preflight.py refuses to release intermediate → published if:
  - Any cited URL returns non-2xx (factcheck FAIL)
  - Any claim has confidence score <0.6 (claim_verifier)
  - Cannibalization severity HIGH (cosine ≥0.85) against an already-published post
  - Drift baseline cannot be captured (target page returns 5xx or non-canonical)
  - Anti-slop word count > threshold (vocab_analyze)
```

---

## 8. Things WE Have That Stay (Don't Replace)

| Capability                              | File                                                                                                   | Source   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- |
| Apify scraper coverage                  | `skills/seo/scripts/run-apify-{ahrefs,semrush-da,moz,ubersuggest,trends,autocomplete,rank-checker}.sh` | Internal |
| Revenue-projected keyword opportunities | `skills/seo/keyword-opportunities/`, `scripts/estimate-revenue.sh`                                     | Internal |
| Bulk competitor SEO                     | `skills/seo/competitor-seo/`                                                                           | Internal |
| Deep audit (45-60 min, parallel tools)  | `skills/seo/deep-audit/`                                                                               | Internal |
| Strategy audit trail                    | `research/seo/strategy-state-v2-*.json`                                                                | Internal |
| Product page SEO suite                  | `skills/seo/product-page-{spec,audit,report}/`                                                         | Internal |
| 3-layer command suite (v1)              | `../v1/IMPLEMENTATION.md` Tools/Workflows/Strategy                                                     | Internal |
| Per-article planning                    | `content/blog/plans/{article}/plan.md`, `_handoffs/*.zip`                                              | Internal |
| Audio versioning                        | `published/{slug}.mp3` + `archive/` + `AUDIO-PLAN.md`                                                  | Internal |
| Locked publish directory                | `PROJECT.md` convention                                                                                | Internal |
| 5-agent blog pipeline                   | `skills/blogger/agents/{researcher,writer,rewriter,seo,reviewer}`                                      | Internal |
| Custom blog gates                       | `blog_preflight.py`, `blog_finalize.py`, `blog_validate.py`, `ai_detect.py`, `blog_vocab_analyze.py`   | Internal |

---

## 9. Telegram / Slash Commands (Final List After All Phases)

### New SEO commands

| Command                                    | Phase | Description                             |
| ------------------------------------------ | ----- | --------------------------------------- |
| `/seo_google_gsc <domain> [--days N]`      | 1     | GSC clicks/impressions/CTR/position     |
| `/seo_google_inspect <url>`                | 1     | URL Inspection API status               |
| `/seo_google_index <url>`                  | 1     | Submit URL to Indexing API              |
| `/seo_google_crux <url>`                   | 1     | 25-week CWV field-data trend            |
| `/seo_google_ga4 <domain> [--days N]`      | 1     | Organic traffic by landing page         |
| `/seo_drift_baseline <url>`                | 2     | Capture SEO state baseline              |
| `/seo_drift_compare <url>`                 | 2     | Compare to baseline; report regressions |
| `/seo_backlinks_gap <domain> <competitor>` | 3     | Replicable backlink targets             |
| `/seo_cluster_plan <topic>`                | 3     | SERP-overlap content cluster plan       |

### New Blog commands

| Command                        | Phase | Description                                                       |
| ------------------------------ | ----- | ----------------------------------------------------------------- |
| `/blog_google_gsc <url>`       | 1     | Per-URL GSC stats (calls same backend as `/seo_google_gsc`)       |
| `/blog_factcheck <slug>`       | 2     | Verify cited URLs + claims (cross-model critic, max 3 iterations) |
| `/blog_cannibalization [dir]`  | 2     | Detect semantic overlap (cosine ≥0.85) across MDX files           |
| `/blog_image_generate <topic>` | 4     | Gemini hero + inline images                                       |
| `/blog_persona_apply <draft>`  | 4     | Voice deviation check                                             |

### Existing commands that change behavior

| Command           | Phase | Change                                                                          |
| ----------------- | ----- | ------------------------------------------------------------------------------- |
| `/blog_finalize`  | 1     | Auto-submits URL to Indexing API + captures drift baseline on publish           |
| `/blog_preflight` | 2     | Runs factcheck + cannibalization gates before allowing intermediate → published |

---

## 10. Implementation Priority

| #   | Phase | Task                                                             | Owner            | Effort | Blocker if not done                      |
| --- | ----- | ---------------------------------------------------------------- | ---------------- | ------ | ---------------------------------------- |
| 1   | 1     | Service account + grant access in GSC/GA4                        | User (GCP setup) | 20 min | Cannot proceed                           |
| 2   | 1     | Adopt 5 Google API scripts + `seo-google/SKILL.md`               | Agent            | 2h     | Phase 2 drift uses these                 |
| 3   | 1     | Adopt `blog-google/SKILL.md` + wire into `blog_finalize.py`      | Agent            | 1h     | Closes pending todo (GSC URL Inspection) |
| 4   | 1     | Plugin scaffolding + hooks placeholders + constitutional rules   | Agent            | 1.5h   | Phase 2D wires real hooks                |
| 5   | 1.5   | Dry-run + DRY-RUN-FINDINGS.md                                    | Agent            | 1-2h   | De-risks Phase 2                         |
| 6   | 2     | Adopt seo-drift scripts + capture baseline on 15 published posts | Agent            | 2h     | None                                     |
| 7   | 2     | Adopt blog-factcheck + integrate cross-model critic              | Agent            | 2h     | None                                     |
| 8   | 2     | Build cannibalization detector (embeddings + cosine)             | Agent            | 2h     | None                                     |
| 9   | 2     | Wire hooks (PostToolUse) for content validation                  | Agent            | 1h     | None                                     |
| 10  | 3     | Adopt seo-backlinks scripts (free tiers only)                    | Agent            | 1.5h   | None                                     |
| 11  | 3     | Free Moz API + Bing Webmaster signup                             | User             | 20 min | Phase 3 partial without                  |
| 12  | 3     | Adopt seo-cluster + run on celavii.com                           | Agent            | 1.5h   | None                                     |
| 13  | 4     | Optional: blog-image, blog-audio Gemini TTS, blog-persona        | Agent            | 4-6h   | Defer until pipeline >3/week             |

---

## 11. File Tracking

### New files (created by this proposal)

```
skills/seo/
├── seo-google/SKILL.md                    [Phase 1]
├── seo-drift/SKILL.md                     [Phase 2]
├── seo-backlinks/SKILL.md                 [Phase 3]
├── seo-cluster/SKILL.md                   [Phase 3 — augments existing content-cluster]
├── .claude-plugin/plugin.json             [Phase 1]
├── hooks/hooks.json                       [Phase 1 placeholder, Phase 2D wired]
└── scripts/
    ├── google_auth.py                     [Phase 1]
    ├── gsc_query.py                       [Phase 1]
    ├── gsc_inspect.py                     [Phase 1]
    ├── indexing_notify.py                 [Phase 1]
    ├── crux_history.py                    [Phase 1]
    ├── ga4_report.py                      [Phase 1]
    ├── drift_baseline.py                  [Phase 2]
    ├── drift_compare.py                   [Phase 2]
    ├── moz_api.py                         [Phase 3]
    ├── bing_webmaster.py                  [Phase 3]
    ├── commoncrawl_graph.py               [Phase 3]
    ├── verify_backlinks.py                [Phase 3]
    └── serp_cluster.py                    [Phase 3]

skills/blogger/
├── blog-google/SKILL.md                   [Phase 1 — wraps seo/scripts/google_*]
├── blog-factcheck/SKILL.md                [Phase 2]
├── blog-cannibalization/SKILL.md          [Phase 2]
├── blog-image/SKILL.md                    [Phase 4 OPT]
├── blog-persona/SKILL.md                  [Phase 4 OPT]
├── .claude-plugin/plugin.json             [Phase 1]
├── hooks/hooks.json                       [Phase 1 placeholder, Phase 2D wired]
└── scripts/
    ├── fact_checker.py                    [Phase 2]
    ├── claim_verifier.py                  [Phase 2]
    ├── source_validator.py                [Phase 2]
    └── cannibalization_detector.py        [Phase 2 — embeddings, custom build]

skills/seo/references/
└── constitution.md                        [Phase 1 — 14 articles; skill-internal, openclaw pipeline loads]

skills/blogger/references/
└── constitution.md                        [Phase 1 — 12 articles; skill-internal, openclaw pipeline loads]

.styles/celavii/
└── voice.json                             [Phase 4C OPT]

openclaw/.system/features/seo-strategy/v2/
├── IMPLEMENTATION.md                      [this file]
├── TRACKER.md                             [companion file]
├── DRY-RUN-FINDINGS.md                    [Phase 1.5 output]
├── docs/repos.md                          [research-grounding]
├── docs/frameworks.md                     [research-grounding]
└── docs/integration-recommendations.md    [research-grounding]
```

### Modified files

```
skills/blogger/scripts/blog_finalize.py    [Phase 1 — auto-submit to Indexing API]
skills/blogger/scripts/blog_preflight.py   [Phase 2 — factcheck + cannibalization gates]
skills/blogger/scripts/blog_vocab_analyze.py [Phase 2B — anti-slop word list]
skills/blogger/scripts/generate_blog_audio.py [Phase 4B — Gemini TTS primary]
skills/seo/seo-orchestrator/SKILL.md       [Phase 1+ — route new commands]
skills/blogger/blog-orchestrator/SKILL.md  [Phase 1+ — route new commands]
~/.openclaw/.env                           [Phase 1+3 — add GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_GSC_PROPERTY, MOZ_API_KEY, BING_WEBMASTER_KEY (4 new vars; reuses existing GEMINI_API_KEY)]
openclaw/src/config/io.ts                  [Phase 1+3 — register new env keys]
openclaw/.system/architecture/security.md  [Phase 1+3 — document new API keys]
openclaw/.system/architecture/VALUES.md    [Phase 1+3 — update API Keys table]
openclaw/.system/architecture/skills.md    [all phases — increment skill counts]
openclaw/.system/architecture/CHANGELOG.md [each phase — append entry]
skills/seo/seo-orchestrator/SKILL.md       [Phase 1.4.7 — cross-reference seo/references/constitution.md]
skills/blogger/blog-orchestrator/SKILL.md  [Phase 1.4.7 — cross-reference blogger/references/constitution.md]
```

### Untouched (defended)

```
skills/seo/{deep-audit,keyword-opportunities,competitor-seo,product-page-*,strategy-*}
skills/blogger/{blog-orchestrator state, agents/, templates/, blog-strategy-progress/}
skills/seo/scripts/run-apify-*.sh (8 files — Apify is our edge)
content/blog/plans/, content/blog/published/{slug}.mp3 versioning
projects/celavii/research/seo/strategy-state-v2-*.json (audit trail)
```

---

## 12. Success Criteria

### Per-Phase

Per-phase acceptance criteria are tracked at the source — see §1.6 (Phase 1), §1.5 dry-run task 1.5.9 (Phase 1.5), §2A.7/2B.10/2C.8/2D.3 (Phase 2), §3A.11/3B.5 (Phase 3). No duplication here.

### Project-level — done when

- [ ] **12.17** Indexation rate trends from 23% → 50%+ within 30 days of Phase 1 completion
- [ ] **12.18** +5 referring domains acquired by 2026-05-27 (strategy target)
- [ ] **12.19** Zero post-publish factcheck regressions detected manually after factcheck gate is live
- [ ] **12.20** Average article publish-to-indexed lag drops from 14+ days to 3-5 days

---

## 13. What NOT to Do

| Don't                                                                             | Why                                                                                     |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Run Indexing API submissions in serial loops                                      | 200/day quota; rate-limit aware batching only                                           |
| Trust GSC's URL Inspection cached status                                          | Always force fresh on inspection call                                                   |
| Replace our Apify scripts with community equivalents                              | We have superior coverage; community has none                                           |
| Use same model for blog generation + factcheck                                    | Self-Refine literature: false agreement                                                 |
| Optimize blog content for raw word count                                          | 2026: "highest sustainable cadence" wins                                                |
| Use GA4 default attribution                                                       | Always explicitly use Data-Driven model                                                 |
| Capture drift baselines on non-canonical URLs                                     | Catches noise, false-positive regressions                                               |
| Run cannibalization with cosine threshold below 0.85                              | False positives explode                                                                 |
| Vendor community Python scripts without `requirements.txt` per skill              | Transitive dep conflicts; isolate via venv                                              |
| Use community's keyword-only cannibalization detector                             | Misses semantic overlap (cosine method finds 312 clusters keyword misses — The Ad Firm) |
| Use "delve", "tapestry", "multifaceted", "navigate the landscape" in blog content | AI-slop tells; -50% engagement                                                          |
| Skip the dry-run (Phase 1.5)                                                      | SEO v1 dry-run caught Gate A failure mode — same risk here                              |

---

## 14. Risks & Mitigations

| Risk                                                      | Likelihood | Impact | Mitigation                                                                                                 |
| --------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| Google API quota limits                                   | Medium     | Medium | Indexing API: 200/day free; respect with rate-limit wrapper. GSC: 2K queries/day per project.              |
| OAuth token rotation breaks scripts                       | Medium     | Low    | Refresh-token logic in `google_auth.py`                                                                    |
| Free Moz API key cap (10K/month)                          | Low        | Low    | Backlink scans only run weekly; we'll consume <500/month                                                   |
| Cannibalization detector false positives                  | Medium     | Low    | Cosine ≥0.85 threshold + human review final gate                                                           |
| Adopting community scripts introduces new transitive deps | Low        | Medium | Explicit `requirements.txt` per skill; isolate via venv                                                    |
| Community repos diverge from our adoption                 | Low        | Low    | Forking-to-vendor (point-in-time copy), re-sync quarterly                                                  |
| Cross-model critic adds latency                           | Medium     | Low    | Critic only on factcheck step, not full generation                                                         |
| Embeddings API cost (cannibalization)                     | Low        | Low    | gemini-embedding-2-preview reuses existing `GEMINI_API_KEY`; 768 dim, 41 posts × 3K tokens negligible cost |

---

## 15. Out of Scope

Explicitly NOT included in this proposal:

- DataForSEO premium API integration (community has it; add only if free tiers fail)
- Migration of existing Apify scripts to community equivalents (our Apify coverage is superior)
- NotebookLM integration (defer; not blocking)
- WordPress / Shopify / Ghost CMS sync via `blog-taxonomy` (Celavii is static MDX)
- Replacing our 5-agent blog pipeline with community's 4-agent flow (ours is better)
- Replacing our existing `blog_*.py` Python gates (they encode Celavii-specific quality rules)
- Migration of existing `generate-seo-report` PDF stack (defer PDF stack decision to v3)
- Apify MCP server wiring (defer; our shell-script wrappers work today)
- GSC MCP server wiring (defer; community Python clients are sufficient)

---

## 16. License Compliance

| Source                                                             | License                           | Action                                                          |
| ------------------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------- |
| `~/dev/research/claude-seo`                                        | (verify in repo before vendoring) | Vendor scripts + add NOTICE to `skills/seo/.claude-plugin/`     |
| `~/dev/research/claude-blog`                                       | (verify in repo before vendoring) | Vendor scripts + add NOTICE to `skills/blogger/.claude-plugin/` |
| Google API client libs (`google-auth`, `google-api-python-client`) | Apache 2.0                        | Standard pip install, no vendoring                              |
| Gemini API (embeddings + TTS + CrUX)                               | Commercial API                    | Reuses existing `GEMINI_API_KEY`; track cost                    |
| Moz Link Explorer API                                              | Free tier ToS                     | Rate-limit respected; cite in derivative output                 |
| Bing Webmaster Tools API                                           | Microsoft API ToS                 | Standard usage                                                  |
| CommonCrawl data                                                   | CC BY-SA                          | Cite in any derivative output                                   |
| Gemini API (Phase 4)                                               | Commercial API                    | Standard usage                                                  |

- [ ] **16.1** Verify license on each community repo before first vendoring
- [ ] **16.2** Author NOTICE files at `skills/seo/.claude-plugin/NOTICE` + `skills/blogger/.claude-plugin/NOTICE`
- [ ] **16.3** Cite all data sources in any public-facing derivative outputs

---

## 17. Skill-to-Repo Cheat Sheet

| New skill              | Best prior art                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `seo-google`           | `~/dev/research/claude-seo/skills/seo-google/` + Google API Python clients                                      |
| `seo-drift`            | `~/dev/research/claude-seo/skills/seo-drift/` + SQLite baseline pattern                                         |
| `seo-backlinks`        | `~/dev/research/claude-seo/skills/seo-backlinks/` + Moz Link Explorer free tier                                 |
| `seo-cluster`          | `~/dev/research/claude-seo/skills/seo-cluster/` + DataForSEO SERP API (or free SERP scraper fallback)           |
| `blog-google`          | `~/dev/research/claude-blog/skills/blog-google/` (same backend as seo-google)                                   |
| `blog-factcheck`       | `~/dev/research/claude-blog/skills/blog-factcheck/` + Libr-AI/OpenFactVerification (Loki) skeleton              |
| `blog-cannibalization` | The Ad Firm cosine method + jmelm93/seo_cannibalization_analysis (custom build, NOT community keyword detector) |
| `blog-image`           | `~/dev/research/claude-blog/skills/blog-image/` + Gemini API                                                    |
| `blog-persona`         | `~/dev/research/claude-blog/skills/blog-persona/` + NN/g 4D voice schema (encoded internally)                   |

---

## 18. Open Questions for User

- [ ] **Q1 GCP billing**: Indexing API + CrUX API are free, but billing account required for project creation. Do you have one, or should I document the free-tier-only path?
- [ ] **Q2 GSC property scope**: confirm `sc-domain:celavii.com` (domain property) vs `https://celavii.com/` (URL prefix)
- [ ] **Q3 Phase 4 priority**: ship now or defer? Image/audio automation has clear time savings but isn't blocking.
- [ ] **Q4 Architecture docs cadence**: update `architecture/{skills,security,VALUES}.md` at end of each phase, or batch at completion?
- [ ] **Q5 Cross-model critic choice**: Opus 4.7 ($) or Kimi K2.6 (cheaper) for blog factcheck?
- [ ] **Q6 Embeddings provider**: OpenAI text-embedding-3-small ($0.02/1M) or Voyage-3-lite (cheaper)?
- [ ] **Q7 Approval**: green-light Phases 1-3 as scoped, or trim?

---

## 19. Approval

### 19.1 User Review

- [ ] **19.1.1** User reads this IMPLEMENTATION.md and approves scope
- [ ] **19.1.2** User reads [docs/repos.md](docs/repos.md) and confirms vendoring approach
- [ ] **19.1.3** User reads [docs/frameworks.md](docs/frameworks.md) and confirms cost model
- [ ] **19.1.4** User reads [docs/integration-recommendations.md](docs/integration-recommendations.md)

### 19.2 Open Questions Answered

- [x] **19.2.1 Q1** GCP billing: ✅ ANSWERED — existing GCP project + `GEMINI_API_KEY` reused
- [x] **19.2.2 Q2** GSC property scope: ✅ DEFERRED — service account auto-discovers (no advance decision needed)
- [x] **19.2.3 Q3** Phase 4 priority: ✅ ANSWERED — 4B (audio) ships with Phase 1; 4A (image) + 4C (persona) optional
- [x] **19.2.4 Q4** Architecture docs cadence: ✅ ANSWERED — end of each phase
- [x] **19.2.5 Q5** Cross-model critic choice: ✅ ANSWERED — Generator (Kimi K2.6 / Gemini 3 Flash) ≠ Critic (DeepSeek V4 Pro). Routes through existing agent stack.
- [x] **19.2.6 Q6** Embeddings provider: ✅ ANSWERED — `gemini-embedding-2-preview` (768 dim, reuses `GEMINI_API_KEY`)
- [ ] **19.2.7 Q7** Phases 1-3 green-light confirmed

### 19.3 Approval Gates

- [ ] **19.3.1** User commits to 4-6h Phase 1 setup window (reduced from 5-7h since service account replaces OAuth)
- [x] **19.3.2** ~~User commits to ~$2/month spend~~ — DROPPED. v1.2 reuses existing `GEMINI_API_KEY` for embeddings + Gemini TTS; cross-model critic routes through existing Kimi/DeepSeek agents. **Net new monthly cost: $0**.
- [ ] **19.3.3** Begin Phase 1.1.1

---

## 20. Sequencing Summary

```
Day 1     →  Phase 1.1 (GCP + OAuth setup, user-led)
Day 2     →  Phase 1.2 + 1.3 (vendor scripts + skill wrappers)
Day 3     →  Phase 1.4 (plugin + hooks + constitutional scaffolding)
Day 4     →  Phase 1.6 + 1.7 (architecture updates + acceptance tests)
Day 5     →  Phase 1.5 dry-run (★ before Phase 2)
Day 6-7   →  Phase 2 (drift + factcheck + cannibalization + hooks)
Day 8     →  Phase 3 (backlinks + cluster)
Day 9+    →  Phase 4 (optional, deferrable)
```

Total Phase 1-3: ~8 days agent work + ~40 min user setup. Phase 4 deferrable.

---

> **Document version**: 1.2
> **Last updated**: 2026-04-27
> **Approval status**: Q1-Q7 answered; awaiting 19.3.1 + 19.3.3 to begin Phase 1.1.1
> **v1.2 changelog**: switched OAuth → service account auth; embeddings → `gemini-embedding-2-preview`; cross-model critic routed through existing Kimi/DeepSeek agents (no Opus); Phase 4B audio promoted from optional to Phase-1-mandatory; net-new monthly cost dropped from ~$2 → $0
