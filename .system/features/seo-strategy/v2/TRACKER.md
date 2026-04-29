# SEO + Blog Skills Upgrade — Implementation Tracker

> **Last Updated:** 2026-04-29 (Phase 2C COMPLETE + **B8 retrofit COMPLETE** — all skills now multi-tenant via `.seo-config.json` + `project_config.py`; ready to onboard non-Celavii projects. Phase 2A/2B/2C all operational. Phase 1 agent work COMPLETE 2026-04-28. 1.7 + Phase 1.5 awaiting 1.1 user GCP setup.)
> **Reference:** [IMPLEMENTATION.md](./IMPLEMENTATION.md)
> **Research backing:** [docs/repos.md](docs/repos.md) | [docs/frameworks.md](docs/frameworks.md) | [docs/integration-recommendations.md](docs/integration-recommendations.md)
> **Dry-run findings:** `DRY-RUN-FINDINGS.md` (created during Phase 1.5)
> **Companion proposal pattern:** [../../social-strategy/social-agents-implementation-proposal.md](../../social-strategy/social-agents-implementation-proposal.md)

---

## Status Legend

`[ ]` pending · `[~]` in progress · `[x]` complete · `[!]` blocked · `[s]` skipped

---

## Phase 19: Approval & Open Questions (PENDING ⏳)

> Maps to IMPLEMENTATION §19. NumbLetsering matches IMPLEMENTATION 1:1.

### 19.1 User Review

- [ ] **19.1.1** User reads [IMPLEMENTATION.md](./IMPLEMENTATION.md) and approves scope
- [ ] **19.1.2** User reads [docs/repos.md](docs/repos.md) and confirms vendoring approach
- [ ] **19.1.3** User reads [docs/frameworks.md](docs/frameworks.md) and confirms cost model
- [ ] **19.1.4** User reads [docs/integration-recommendations.md](docs/integration-recommendations.md)

### 19.2 Open Questions Answered

- [x] **19.2.1 Q1** ✅ existing GCP project + `GEMINI_API_KEY` reused
- [x] **19.2.2 Q2** ✅ DEFERRED — service account auto-discovers property
- [x] **19.2.3 Q3** ✅ Phase 4B audio ships with Phase 1; 4A + 4C optional
- [x] **19.2.4 Q4** ✅ end of each phase
- [x] **19.2.5 Q5** ✅ Generator (Kimi K2.6 / Gemini 3 Flash) ≠ Critic (DeepSeek V4 Pro)
- [x] **19.2.6 Q6** ✅ `gemini-embedding-2-preview` (768 dim, reuses `GEMINI_API_KEY`)
- [ ] **19.2.7 Q7** Phases 1-3 green-light confirmed

### 19.3 Approval Gates

- [ ] **19.3.1** User commits to 4-6h Phase 1 setup window (reduced from 5-7h)
- [x] **19.3.2** ~~$2/month spend~~ DROPPED — v1.2 reuses `GEMINI_API_KEY` + existing agents. **Net new cost: $0**.
- [ ] **19.3.3** Begin Phase 1.1.1

---

## Phase 1: Google API Foundation + Plugin Scaffolding (CRITICAL — 5-7h)

### 1.1 Google Cloud + Service Account (User-led, ~20 min)

- [ ] **1.1.1** Use existing GCP project (already has `GEMINI_API_KEY`); confirm project ID
- [ ] **1.1.2** Enable APIs: Search Console API, Indexing API, CrUX API, Google Analytics Data API
- [ ] **1.1.3** Create service account at GCP IAM (`celavii-seo@<project>.iam.gserviceaccount.com`)
- [ ] **1.1.4** Generate service account JSON key — save to `~/.config/celavii-seo/service-account.json` (mode 600)
- [ ] **1.1.5** Add service account email as User in Search Console property settings
- [ ] **1.1.6** Add service account email to GA4 property + confirm GA4 wired to celavii.com
- [ ] **1.1.7** Add service account email to Indexing API allowed list (Owner role in GSC)

### 1.2 Vendor Google API Scripts (Agent, ~2h)

- [x] **1.2.1** Copy `google_auth.py` from `~/dev/research/claude-seo/scripts/` ✅
- [x] **1.2.2** Copy `gsc_query.py` ✅
- [x] **1.2.3** Copy `gsc_inspect.py` ✅
- [x] **1.2.4** Copy `indexing_notify.py` ✅
- [x] **1.2.5** Copy `crux_history.py` ✅
- [x] **1.2.6** Copy `ga4_report.py` ✅
- [x] **1.2.7** Vendor `requirements-google.txt` + create venv at `~/dev/workspace/skills/seo/scripts/venv/` ✅ (Python 3.14, all deps installed, imports verified)
- [ ] **1.2.8** Add `GOOGLE_APPLICATION_CREDENTIALS` + `GOOGLE_GSC_PROPERTY=celavii.com` to `~/.openclaw/.env` (reuse existing `GEMINI_API_KEY`)
- [ ] **1.2.9** Register new env keys in `SHELL_ENV_EXPECTED_KEYS` at `openclaw/src/config/io.ts`
- [ ] **1.2.10** Run `python google_auth.py --check` (script natively supports service account; just needs config file at `~/.config/celavii-seo/google-api.json`)

> Sub-tasks 1.2.1-1.2.6 also copied 10 reference docs into `skills/seo/seo-google/references/` + LICENSE.txt. Config paths in all 6 scripts adapted from `claude-seo` → `celavii-seo` namespace.

### 1.3 Skill Wrappers (Agent, ~1h)

- [x] **1.3.1** Author `~/dev/workspace/skills/seo/seo-google/SKILL.md` ✅
- [x] **1.3.2** Author `~/dev/workspace/skills/blogger/blog-google/SKILL.md` ✅
- [x] **1.3.3** Update `seo-orchestrator/SKILL.md` routing table (5 new commands added) ✅
- [x] **1.3.4** Update `blog-orchestrator/SKILL.md` (added `blog-google` to Sub-Skills table, count 13→14) ✅
- [x] **1.3.5** Modify `blog_finalize.py` — added `--publish` flag + `auto_submit_on_publish()` function. Auto-calls `indexing_notify.py` + `drift_baseline.py` (graceful skip if Phase 2 not done yet). Syntax validated. ✅

### 1.4 Plugin + Hooks + Constitutional Scaffolding (Agent, ~1.5h)

- [x] **1.4.1** Create `~/dev/workspace/skills/seo/.claude-plugin/plugin.json` (`celavii-seo` v0.1.0, MIT) ✅ + NOTICE file
- [x] **1.4.2** Create `~/dev/workspace/skills/blogger/.claude-plugin/plugin.json` (`celavii-blog` v0.1.0, MIT) ✅ + NOTICE file
- [x] **1.4.3** Author `~/dev/workspace/skills/seo/hooks/hooks.json` (Phase 1 placeholder, Phase 2D wiring documented inline) ✅
- [x] **1.4.4** Author `~/dev/workspace/skills/blogger/hooks/hooks.json` (Phase 1 placeholder, Phase 2D wiring documented inline) ✅
- [x] **1.4.5** Author `~/dev/workspace/skills/seo/references/constitution.md` (14 articles) ✅ — corrected path: skill-internal references/, not `.claude/rules/` (rejected). Skills are openclaw-pipeline-loaded; constitution ships with the skill pack.
- [x] **1.4.6** Author `~/dev/workspace/skills/blogger/references/constitution.md` (12 articles) ✅ — corrected path: skill-internal references/.
- [x] **1.4.7** Cross-reference from `seo-orchestrator/SKILL.md` (Reference Files section) + `blog-orchestrator/SKILL.md` (Shared References section) ✅

> **Note**: Phase 1 sub-sections skip `1.5` to avoid collision with Phase 1.5 (Dry-Run).

### 1.6 Architecture Updates (Agent, ~30 min)

- [x] **1.6.1** Update `openclaw/.system/architecture/security.md` — added Google API env vars (`GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_GSC_PROPERTY`) + service-account credentials table ✅
- [x] **1.6.2** Update `openclaw/.system/architecture/VALUES.md` — bumped SKILL.md count 125→127; added 2 Google API rows to API Keys table (status: Pending Phase 1.1) ✅
- [x] **1.6.3** Update `openclaw/.system/architecture/skills.md` — SEO 18→19 (added `seo-google`), Blogger 15→16 (added `blog-google`), header total 92→94 ✅
- [x] **1.6.4** Append CHANGELOG entry — 2026-04-28 entry covering Google API vendoring, env vars, plugin manifests, blog_finalize.py extension, $0 net new cost ✅
- [!] **1.6.5** Run `openclaw/scripts/arch-verify.sh` — completed; 1 pre-existing failure (`CELAVII_API_KEY` literal-grep against `src/config/io.ts` while real registration lives in `src/config/shell-env-expected-keys.ts` via dynamic provider/channel resolvers). **0 new regressions introduced by Phase 1.6.** Pre-existing failure is tech debt outside Phase 1 scope.

### 1.7 Acceptance Criteria

- [ ] **1.7.1** `python gsc_query.py celavii.com --days 30` returns valid JSON
- [ ] **1.7.2** `python indexing_notify.py <url>` returns HTTP 200 + quota update
- [ ] **1.7.3** `python gsc_inspect.py <url>` returns indexation status for 2 just-shipped articles
- [ ] **1.7.4** `blog_finalize.py` auto-submits new URLs on publish
- [ ] **1.7.5** Today's pending todo (manual GSC URL Inspection) closed automatically
- [ ] **1.7.6** `arch-verify.sh` passes 0 failures
- [ ] **1.7.7** Plugin manifests + constitutional files exist + cross-referenced

---

## Phase 1.5: Dry-Run + Findings (★ NEW in v1.1 — 1-2h)

- [ ] **1.5.1** Run `python gsc_inspect.py "https://celavii.com/blog/network-intelligence/influencer-audience-intelligence"` — capture verbose output
- [ ] **1.5.2** Run `python gsc_inspect.py "https://celavii.com/blog/network-intelligence/free-instagram-audience-overlap-tools"` — capture verbose output
- [ ] **1.5.3** Run `python gsc_query.py celavii.com --days 30 --output /tmp/gsc-baseline.json`
- [ ] **1.5.4** Run `python crux_history.py celavii.com --weeks 25`
- [ ] **1.5.5** Run `python ga4_report.py celavii.com --days 30`
- [ ] **1.5.6** Run `python indexing_notify.py` (dry-run mode) for both new articles
- [ ] **1.5.7** Document every error, edge case, unexpected behavior in `DRY-RUN-FINDINGS.md`
- [ ] **1.5.8** Identify + fix top 2-3 highest-impact issues
- [ ] **1.5.9** Re-run smoke tests post-fix; all 1.7.x acceptance criteria pass

---

## Phase 2: Quality Gates (HIGH — 5-6h)

### 2A. SEO Drift Monitoring (COMPLETE 2026-04-29)

- [x] **2A.1** Copy `drift_baseline.py` from claude-seo (410 lines) ✅
- [x] **2A.2** Copy `drift_compare.py` (544 lines) ✅
- [x] **2A.2b** ★ EXTRAS: Also vendored `drift_report.py` (376 lines, HTML reports), `drift_history.py` (127 lines, timeline queries), and 3 transitive deps (`fetch_page.py`, `parse_html.py`, `pagespeed_check.py`). Namespace patched `~/.cache/claude-seo/` → `~/.config/celavii-seo/`. Vendored 17-rule `comparison-rules.md` to `seo-drift/references/`. ✅
- [x] **2A.3** Author `~/dev/workspace/skills/seo/seo-drift/SKILL.md` (5 modes: baseline, compare, report, history, monitor; mirrors social-drift pattern; cites constitution Articles 1, 4, 6, 14) ✅
- [x] **2A.4** Configure SQLite at `~/.config/celavii-seo/drift/baselines.db` (mode 600, dir mode 700; tables: baselines + comparisons + sqlite_sequence) ✅
- [x] **2A.5** Capture baseline for all **14 deployed posts**. URL discovery source: live sitemap (`https://celavii.com/blog/sitemap.xml`) — not workspace `published/` MDX (which can include articles awaiting dev-team sync) and not any local repo clone (may not exist on every machine; introduces portability dependency the drift skill must not have). Initial pass mistakenly used workspace MDX → 4 phantom 404s; phantoms deleted, 14 sitemap-authoritative URLs baselined (IDs 21-34). ✅
- [x] **2A.6** Add `seo-drift` to `seo-orchestrator/SKILL.md` routing table (2 new rows: Drift baseline + Drift compare) ✅
- [x] **2A.7** Acceptance test PASSED: injected simulated good baseline (H1 + per-article canonical) at id=20, ran `drift_compare.py`, output **2 CRITICAL** findings (`canonical_changed`, `h1_removed`) + 3 WARNING + 2 INFO. Test baseline cleaned up post-verification. ✅
- [⚠] **2A.X SIDE FINDING (not in spec)**: Verified production Next.js SSR bug — **0/14 deployed articles have an `<h1>` tag in SSR HTML** (verified via pure `curl … | grep '<h1'` across 4 sample silos: ai-workflows, creator-analytics, network-intelligence, industry — 0 hits each). Canonical URLs ARE correct (14/14). The earlier 4-broken-canonical claim was a phantom-URL artifact: 4 workspace articles weren't yet deployed → 404 → Next.js fell through to blog-index canonical (`/blog`). After switching baseline source to deployed repo, that artifact disappears. **The H1 finding is real**: contributes directly to indexation rate (23%, 3 of 13 in strategy-state-v2). Likely workspace→prod transformation casualty (dev team converts H1 to layout component). Out of Phase 2A scope; flagged for Next.js metadata-generation fix.

### 2B. Blog Fact-Check (Cross-Model Critic) — COMPLETE 2026-04-29

> **Spec drift**: `~/dev/research/claude-blog/scripts/` does not contain `fact_checker.py`, `claim_verifier.py`, or `source_validator.py`. Upstream's `blog-factcheck/` is a **prompt-only SKILL.md** (135 lines) that uses `WebFetch` via the agent's tool palette — no Python helpers exist upstream. Resolved by vendoring the prompt and **Celavii-authoring** the 3 helper scripts as deterministic tools the Quality Critic agent calls (URL fetch + value match, source tier classification, claim orchestration with 3-iter cap). Cross-model boundary lives at the agent-spawn layer, not in any one script.

- [x] **2B.1** Author `fact_checker.py` (deterministic orchestrator: claim extraction, URL+value verify via helper, tier classification, banned-language scan, 3-iter cap, exit codes 0/1/2). Celavii-authored. ✅
- [x] **2B.2** Author `claim_verifier.py` (URL fetch + paraphrase-aware value matcher with HTML strip, BS4/lxml-backed; supports 43% → "nearly half", $1.2M → "1.2 million", 5x → "five times"). Celavii-authored. ✅
- [x] **2B.3** Author `source_validator.py` (Tier 1: peer-review/primary platform/celavii.com/IMH 2026; Tier 2: vendor research with methodology; Tier 3: practitioner blogs). Celavii-authored. ✅
- [x] **2B.4** Author `~/dev/workspace/skills/blogger/blog-factcheck/SKILL.md` (vendored upstream prompt + Celavii additions: cross-model boundary, agent-spawn pattern, 3-iter cap, JSON output schema, hard-fail trigger list cited to constitution Articles 2/4/5/6) ✅
- [x] **2B.5** Cross-model critic configured: Generator = `blogger` agent (Kimi K2.6 / Gemini 3 Flash); Critic = `quality-critic` agent (DeepSeek V4 Pro). Boundary enforced at openclaw agent-spawn layer (not in scripts). $0 net new spend. ✅
- [x] **2B.6** Hard-cap 3 iterations enforced in `fact_checker.py` (`MAX_ITERATIONS = 3`; iteration > 3 → verdict=FAIL with reason "exceeds 3-cap (Constitution Article 6)") ✅
- [x] **2B.7** `blog_preflight.py` extended with `run_factcheck_gate()` — auto-runs factcheck after structural validation passes; `--skip-factcheck` flag for debug; promotes verdict to FAIL on factcheck FAIL ✅
- [x] **2B.8** `blog_vocab_analyze.py` extended with `FORBIDDEN_PHRASES` + `AI_SLOP_WORDS` loaded from `.styles/celavii/voice.json` (canonical) with embedded fallback list; new `find_banned_hits()` helper + anti-slop scan in main output. ✅
- [x] **2B.9** Ran factcheck on 3 articles: free-instagram-audience-overlap-tools (56 claims, 10 unsourced, 2 banned hits → FAIL); influencer-audience-intelligence (63 claims, 7 unsourced, 3 unreachable, 1 banned hit → FAIL); ai-video-generation-seedance (108 claims, 7 verified, 1 not-found, 2 unsourced, 1 banned hit → FAIL). Existing published content has factcheck debt — gate would have blocked all three at draft time. ✅
- [x] **2B.10** Acceptance PASSED: all 3 test articles returned `verdict=FAIL` with non-empty `hard_fails`; the gate blocks publish on HIGH-severity findings as constitution requires. ✅
- [x] **2B Routing**: `blog-orchestrator/SKILL.md` Sub-Skills section bumped 14→15; added `blog-factcheck` row. ✅

### 2C. Blog Cannibalization (Embeddings, Custom Build) — COMPLETE 2026-04-29

> **Universality**: Phase 2C is the first sub-phase built **multi-tenant from day 1**. Per-project config at `<project_root>/.seo-config.json`; resolved by `skills/seo/scripts/project_config.py` (universal loader). Discovery: CLI `--project-root` > env `$SEO_PROJECT_ROOT` > walk up from cwd. Cache isolated per `slug` at `~/.config/<slug>-seo/cannibalization/`. Skills now read project config instead of hardcoding `celavii.com` paths. **Phase 1/2A/2B retrofit logged as B8.**

> **Spec drift**: Upstream `claude-blog/skills/blog-cannibalization/SKILL.md` is keyword-based (1-gram/2-gram/3-gram + DataForSEO API) with no Python helpers. We diverge to **embeddings** for semantic overlap (catches conceptual cannibalization that keyword methods miss); 100% Celavii-authored. Vendored only the upstream MERGE/DIFFERENTIATE/CANONICAL/NO_ACTION recommendation taxonomy.

- [x] **2C.0 Universality scaffolding**: `skills/seo/scripts/project_config.py` (universal loader); `projects/celavii/.seo-config.json` (Celavii config). Verified loader resolves correctly. ✅
- [x] **2C.1** Author `skills/blogger/blog-cannibalization/scripts/cannibalization_detector.py` (corrected location per Phase 2B convention; not `skills/blogger/scripts/`). Python port of `social_listener/supabase/functions/_shared/embedding-provider.ts` GeminiEmbeddingProvider — `batchEmbedContents` endpoint, `x-goog-api-key` header, `SEMANTIC_SIMILARITY` task type, max-100 batching, exponential-backoff retry, 768 dim. Focal-extract chunking (title + description + h1 + h2 list + first ~1400 words) to stay under 2048-token limit. JSON cache by SHA-256 of focal extract. ✅
- [x] **2C.2** ~~Build cosine matrix across 41 MDX files~~ Actual corpus = 30 (18 published + 12 drafts; spec said 41 — overestimate). Matrix built; 28 distinct-slug HIGH overlaps surfaced. ✅
- [x] **2C.3** Thresholds: ≥0.85 HIGH, 0.75-0.85 MEDIUM, <0.75 clean (matches Constitution Article 7). CLI override `--thresholds high=X,medium=Y` for future tuning. ✅
- [x] **2C.4** Author `skills/blogger/blog-cannibalization/SKILL.md` — vendored taxonomy + Celavii embedding architecture + universal-config docs. ✅
- [x] **2C.5** Reuses existing `GEMINI_API_KEY` (Phase 1). $0 net new spend; full audit ≈ $0.16, per-edit gate ≈ $0.001. ✅
- [x] **2C.6** Modified `blog_preflight.py` — added `run_cannibalization_gate()` (parallel to factcheck gate); `--skip-cannibalization` flag for debug. HIGH severity → FAIL; MEDIUM → WARN. ✅
- [x] **2C.7** Initial audit across 30-post corpus complete. Output saved to `/tmp/canniba_audit.json`. Findings: 95 HIGH (most are same-slug duplicates between published+drafts — needs corpus dedup pass), **28 distinct-slug HIGH-severity cannibalizations**. Top distinct-slug pairs: `three-circles-method` vs `three-circles-method-2026-03-04` (0.96 — confirmed duplicate); `influencer-marketing-guide` vs `best-influencer-marketing-tools` (0.95); `influencer-marketing-pillar-2026` vs `influencer-marketing-guide` (0.93). The pillar `influencer-marketing-guide` semantically eats 5+ neighbors. ✅
- [x] **2C.8** Acceptance PASSED: `best-influencer-marketing-tools` vs `content-creator-analytics-tools` returned cosine=0.8076, severity=MEDIUM — exactly matching spec ("MEDIUM or HIGH"). Note per Phase 2A B6: `best-influencer-marketing-tools` is workspace-only (not yet in production sitemap); cannibalization runs on workspace MDX so this is fine. ✅
- [x] **2C.9** `blogger/hooks/hooks.json` `_phase_2D_planned` extended — added cannibalization hook entry (PostToolUse on intermediate/published MDX → run `--check`; block on exit code 2). ✅
- [x] **2C.10** `blog-orchestrator/SKILL.md` Sub-Skills 15→16; added `blog-cannibalization` row. ✅

### 2D. Hooks Wiring

- [ ] **2D.1** Update `skills/blogger/hooks/hooks.json` — PostToolUse on MDX edits triggers preflight + factcheck
- [ ] **2D.2** Update `skills/seo/hooks/hooks.json` — PostToolUse on publish triggers `drift_baseline.py`
- [ ] **2D.3** Acceptance: editing intermediate MDX triggers automatic preflight; failures block save (exit code 2)

---

## Phase 3: Authority + Content Intelligence (MEDIUM — 3-4h)

### 3A. SEO Backlinks

- [ ] **3A.1** User signs up for free Moz Link Explorer API
- [ ] **3A.2** User signs up for free Bing Webmaster Tools API
- [ ] **3A.3** Add `MOZ_API_KEY` + `BING_WEBMASTER_KEY` to `.env` + `SHELL_ENV_EXPECTED_KEYS`
- [ ] **3A.4** Copy `moz_api.py`
- [ ] **3A.5** Copy `bing_webmaster.py`
- [ ] **3A.6** Copy `commoncrawl_graph.py`
- [ ] **3A.7** Copy `verify_backlinks.py`
- [ ] **3A.8** Author `~/dev/workspace/skills/seo/seo-backlinks/SKILL.md`
- [ ] **3A.9** Run `/seo backlinks gap modash.io` — verify 10+ replicable targets
- [ ] **3A.10** Run against hypeauditor.com + grin.co
- [ ] **3A.11** Acceptance: 10+ replicable referring-domain prospects with contact-info hints

### 3B. SERP-Overlap Clustering

- [ ] **3B.1** Copy `serp_cluster.py`
- [ ] **3B.2** Author `~/dev/workspace/skills/seo/seo-cluster/SKILL.md`
- [ ] **3B.3** Run `/seo cluster plan "creator analytics platform"` — verify hub-and-spoke
- [ ] **3B.4** Cross-check vs strategy-state-v2 silo structure
- [ ] **3B.5** Acceptance: output consistent with strategy-state-v2 silos

---

## Phase 4: Quality-of-Life Automation

> **Note**: 4B (audio) is **MANDATORY in Phase 1 timeline**. 4A (image) and 4C (persona) remain OPTIONAL.

### 4A. Blog Image (Gemini) — OPTIONAL

- [ ] **4A.1** Copy `blog-image/scripts/` from claude-blog
- [ ] **4A.2** Reuse existing `GEMINI_API_KEY`
- [ ] **4A.3** Author `~/dev/workspace/skills/blogger/blog-image/SKILL.md`
- [ ] **4A.4** Acceptance: `/blog image generate <topic>` produces hero + 3 inline images

### 4B. Blog Audio (Gemini TTS Replacement) — ★ MANDATORY (ships with Phase 1)

- [ ] **4B.1** Copy `blog-audio/scripts/` from claude-blog
- [ ] **4B.2** Update `generate_blog_audio.py` — Gemini TTS primary, Minimax fallback
- [ ] **4B.3** Run batch on 6 pending audio regenerations from `AUDIO-PLAN.md`
- [ ] **4B.4** Acceptance: 6 pending audio files generated, quality comparable to Minimax

### 4C. Blog Persona — OPTIONAL

- [ ] **4C.1** Copy `blog-persona/SKILL.md`
- [ ] **4C.2** Encode Celavii brand voice as `.styles/celavii/voice.json` (NN/g 4D + Mailchimp matrix)
- [ ] **4C.3** Cross-reference from blog-constitution.md
- [ ] **4C.4** Acceptance: `/blog persona apply <draft>` flags voice deviations

### 4D. Skipped Permanently

- [s] **4D.1** `blog-taxonomy` — Celavii is static MDX, no dynamic CMS

---

## Critical Design Rules (Verification — verify each is enforced)

- [ ] **CDR.1 (§6.1)** Critic reads intake first — `gsc_inspect.py` callers load article frontmatter before interpretation
- [ ] **CDR.2 (§6.2)** Phase 3 (aggregate) is deterministic — no LLM reads raw GSC JSON
- [ ] **CDR.3 (§6.3)** Raw archive accumulates at `research/seo/raw/` — never overwrites
- [ ] **CDR.4 (§6.4)** Evidence rules — every drift alert cites baseline ID + timestamp
- [ ] **CDR.5 (§6.5)** Atomic skills independently invocable — `gsc_query.py celavii.com` works without orchestrator
- [ ] **CDR.6 (§6.6)** Files registered in PROJECT.md after every save
- [ ] **CDR.7 (§6.7)** Always dry-run for Indexing API submissions
- [ ] **CDR.8 (§6.8)** Cross-model critic for blog factcheck (Generator ≠ Critic)
- [ ] **CDR.9 (§6.9)** Hard cap factcheck loops at 3 iterations
- [ ] **CDR.10 (§6.10)** Anti-slop rubric in cannibalization output
- [ ] **CDR.11 (§6.11)** Cosine ≥0.85 = cannibalization threshold
- [ ] **CDR.12 (§6.12)** GSC URL Inspection always force-fresh
- [ ] **CDR.13 (§6.13)** GA4 Data-Driven attribution model
- [ ] **CDR.14 (§6.14)** Drift baselines on canonical URLs only

---

## License Compliance (maps to IMPLEMENTATION §16)

- [ ] **16.1** Verify license on each community repo before first vendoring (claude-seo, claude-blog)
- [ ] **16.2** Author NOTICE files at `skills/seo/.claude-plugin/NOTICE` + `skills/blogger/.claude-plugin/NOTICE`
- [ ] **16.3** Cite all data sources in any public-facing derivative outputs

---

## Success Criteria — Project Level (maps to IMPLEMENTATION §12)

- [ ] **12.17** Indexation rate trends from 23% → 50%+ within 30 days of Phase 1 completion
- [ ] **12.18** +5 referring domains acquired by 2026-05-27 (strategy target)
- [ ] **12.19** Zero post-publish factcheck regressions detected manually after factcheck gate is live
- [ ] **12.20** Average article publish-to-indexed lag drops from 14+ days to 3-5 days

---

## Cost Tracking

| Phase                     | Setup cost | Monthly run cost                  | Notes                                                         |
| ------------------------- | ---------- | --------------------------------- | ------------------------------------------------------------- |
| 1 (Google APIs)           | $0         | $0                                | All free tiers; service account auth                          |
| 1.5 (Dry-run)             | $0         | $0                                | Internal smoke tests                                          |
| 2A (Drift)                | $0         | $0                                | SQLite local                                                  |
| 2B (Factcheck)            | $0         | $0                                | Cross-model via existing Kimi/DeepSeek agents — no new spend  |
| 2C (Cannibalization)      | $0         | $0                                | `gemini-embedding-2-preview` reuses existing `GEMINI_API_KEY` |
| 3A (Backlinks)            | $0         | $0                                | Free Moz + Bing + CommonCrawl                                 |
| 3B (Cluster)              | $0         | $0                                | (or DataForSEO if upgraded)                                   |
| 4B (Audio — mandatory)    | $0         | included in existing Gemini spend | Replaces Minimax                                              |
| 4A/4C (Optional)          | $0         | included in existing Gemini spend |                                                               |
| **Total Phases 1-3 + 4B** | **$0**     | **$0 net new**                    | All API spend reuses existing keys                            |

---

## Sequencing Calendar

```
Day 1     →  Phase 1.1 (GCP + OAuth setup, user-led)
Day 2     →  Phase 1.2 + 1.3 (vendor scripts + skill wrappers)
Day 3     →  Phase 1.4 + 1.5 (plugin scaffolding + constitutional files)
Day 4     →  Phase 1.6 + 1.7 (architecture updates + acceptance tests)
Day 5     →  Phase 1.5 dry-run (★ before Phase 2)
Day 6-7   →  Phase 2 (drift + factcheck + cannibalization + hooks)
Day 8     →  Phase 3 (backlinks + cluster)
Day 9+    →  Phase 4 (optional, deferrable)
```

Total Phase 1-3: ~8 days agent work + ~40 min user setup. Phase 4 deferrable.

---

## Blockers / Open Issues

(Populated as work progresses.)

| ID  | Phase    | Issue                                                                                                                                                                                                                                                                  | Status              | Resolution                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1  | 1.4.5    | `seo-constitution.md` Write rejected (wrong path)                                                                                                                                                                                                                      | resolved 2026-04-28 | Authored at `skills/seo/references/constitution.md` (skill-internal, openclaw pipeline loads it)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| B2  | 1.4.6    | `blog-constitution.md` Write rejected (wrong path)                                                                                                                                                                                                                     | resolved 2026-04-28 | Authored at `skills/blogger/references/constitution.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| B3  | 1.1      | User-led GCP setup (~20 min, 7 sub-tasks)                                                                                                                                                                                                                              | pending             | User to perform 1.1.1-1.1.7 in parallel with agent work                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| B4  | 1.2.10   | Auth test requires service account JSON from B3                                                                                                                                                                                                                        | pending             | Will run after B3 completes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| B5  | 1.6.5    | Pre-existing arch-verify CELAVII_API_KEY failure (literal grep against `src/config/io.ts`)                                                                                                                                                                             | open                | Out of Phase 1 scope; real registration lives in `shell-env-expected-keys.ts`. Verifier check needs a separate fix.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| B6  | 1.3.5    | Workspace `published/` ≠ deployed. `blog_finalize.py --publish` fires on workspace-publish but the article isn't live until the dev team syncs + deploys it. Auto-submitting to Indexing API or baselining drift before the URL is live = wasted quota + phantom 404s. | open                | Phase 1 follow-up. Recommended: (a) gate auto-submit on live sitemap entry OR HTTP 200 with non-blog-index canonical, (b) emit a deploy-pipeline alert if a workspace-published article doesn't appear in the live sitemap within N days. Drop any approach that depends on local source-repo clones (not portable across machines).                                                                                                                                                                                                                                                                                                                               |
| B7  | 2A.X     | Production Next.js SSR omits `<h1>` for all 14 deployed blog articles (verified via raw curl across 4 silos — 0 `<h1` literal tags). Likely root cause of 23% indexation rate; dev-team transformation likely strips article H1 in favor of a layout component.        | open                | Out of Phase 2A scope. Dev-team task: investigate Next.js page metadata; surface article H1 in SSR. Once fixed, `drift_compare.py` will register HIGH-severity `h1_added`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| B8  | retrofit | Phase 1/2A/2B scripts hardcode Celavii paths.                                                                                                                                                                                                                          | resolved 2026-04-29 | Retrofit complete: (a) `source_validator.py` loads `tier_1_first_party` from `.seo-config.json`; (b) `fact_checker.py` accepts `--project-root`, loads voice via project_config; (c) `blog_vocab_analyze.py` loads voice via project_config; (d) `drift_baseline.py` adds `get_db_path(project_root)` + cache_dir from project_config (transitives drift_compare/history/report inherit); (e) `google_auth.py` resolves CONFIG_PATH/TOKEN_PATH from per-project cache_dir. All 6 smoke tests passed (project_config, source_validator, drift_baseline, fact_checker, end-to-end factcheck FAIL on test article, end-to-end cannibalization audit). No regressions. |
| B9  | 2C.7     | Cannibalization audit returned 95 HIGH findings, but ~67 are same-slug pairs (workspace has both `published/<slug>.mdx` AND `drafts/<slug>.mdx`); 28 distinct-slug HIGH overlaps remain.                                                                               | open                | Add corpus-dedup to `cannibalization_detector.py`: when same slug appears in published + drafts, prefer published; flag drafts as "stale-draft" warning. Document in Phase 2D refinement.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

---

## Change Log

| Date       | Version | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-04-27 | 1.0     | Initial proposal at v1 location (later moved)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-04-27 | 1.1     | Validation v1.1 applied: added 14 critical design rules, dry-run phase, plugin scaffolding, constitutional files, cross-model critic config, embeddings-based cannibalization, hooks wiring, license compliance, skill-to-repo cheat sheet, 7 open questions, 12 anti-patterns. Moved to `seo-strategy/v2/`. Added research-grounding docs (`docs/`) + this TRACKER.md.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-04-27 | 1.1.1   | Drift fix: folded Constitutional sub-section into §1.4 (now 1.4.5-1.4.7); skipped sub-section 1.5 in Phase 1 (collision with Phase 1.5 Dry-Run); flattened TRACKER dry-run from 1.5.1.x/1.5.2.x → 1.5.1-1.5.9; added §1.7.7 (plugin manifests check); reconciled approval section with IMPLEMENTATION §19; added §16 license compliance tracking; renamed PROJ.x → 12.17-12.20. Now every TRACKER ID maps 1:1 to IMPLEMENTATION ID.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-04-27 | 1.2     | User feedback applied: (1) OAuth → service account auth (simpler, no token rotation); (2) embeddings → `gemini-embedding-2-preview` 768d reusing existing `GEMINI_API_KEY` (matches social_listener pattern); (3) cross-model critic → existing Kimi K2.6/Gemini 3 Flash generator + DeepSeek V4 Pro critic (no Opus needed); (4) Phase 4B audio promoted from optional → mandatory in Phase 1 timeline; (5) net new monthly cost dropped from ~$2 → $0. Q1-Q6 marked answered; only Q7 (final scope green-light) + Phase 1 commitment pending.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-04-28 | exec    | Phase 1 execution started (commit `369cbd002a`). Completed: 1.2.1-1.2.7 (vendored 6 scripts + 10 references + LICENSE; venv created with Python 3.14 + Google API libs verified); 1.3.1-1.3.5 (seo-google + blog-google SKILL.md authored, both orchestrators updated, blog_finalize.py extended with `--publish` flag + `auto_submit_on_publish()` function, syntax validated); 1.4.1-1.4.4 (4 plugin manifests + 2 NOTICE files + 2 hooks.json placeholders authored). Blocked: 1.4.5/1.4.6 constitutional file writes rejected — awaiting user direction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-04-28 | exec    | Phase 1.6 architecture updates completed: security.md (Google API env vars + service-account credentials table); VALUES.md (SKILL.md count 125→127, 2 new API key rows pending Phase 1.1); skills.md (SEO 18→19 with seo-google, Blogger 15→16 with blog-google, header total 92→94); CHANGELOG entry appended; arch-verify.sh shows 1 pre-existing CELAVII_API_KEY failure (B5) — 0 new regressions from Phase 1.6 work.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-04-28 | exec    | B1/B2 resolved: constitutional files authored at corrected skill-internal paths (`skills/seo/references/constitution.md` 14 articles + `skills/blogger/references/constitution.md` 12 articles). Original `.claude/rules/` path was wrong (these skills are openclaw-pipeline-loaded; constitution ships with the skill pack via `references/` convention, matching existing `quality-gates.md`, `eeat-framework.md`, etc.). 1.4.7 cross-references added in both orchestrators. Phase 1 agent work now COMPLETE.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-04-29 | exec    | Phase 2A COMPLETE. Vendored 4 drift scripts + 3 transitive deps (fetch_page.py, parse_html.py, pagespeed_check.py) + 17-rule comparison-rules.md reference. Authored seo-drift/SKILL.md (5 modes). SQLite initialized at ~/.config/celavii-seo/drift/baselines.db. seo-orchestrator routing extended (+2 rows). Acceptance test PASSED — synthetic good baseline vs current SSR state surfaced 2 CRITICAL findings (canonical_changed + h1_removed).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-04-29 | exec    | Phase 2A URL-source correction. Initial pass mistakenly derived URLs from workspace `published/` MDX → 4 phantom 404 baselines (workspace contained drafts not yet deployed). Tried switching to local clone of deployed source repo, then reverted (not portable; clone may not exist on every machine). **Final approach: live sitemap (`https://celavii.com/blog/sitemap.xml`) is the canonical runtime URL source for drift** — always authoritative, always available, naturally excludes drafts. Deleted 5 phantom baselines; re-baselined 14 sitemap-authoritative URLs (IDs 21-34). **0/14 H1 in SSR confirmed via raw curl across 4 silos** — verified Next.js bug (B7). Logged B6: workspace publish ≠ deployed; drop any local-clone dependency.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-04-29 | exec    | Phase 2B COMPLETE. Spec drift handled: upstream `claude-blog/scripts/` has no factcheck Python helpers — only a 135-line prompt-only `blog-factcheck/SKILL.md`. Vendored the prompt + Celavii-authored 3 deterministic helpers (`fact_checker.py` orchestrator with 3-iter cap; `claim_verifier.py` URL+value paraphrase-aware matcher; `source_validator.py` Tier 1/2/3 classifier). Cross-model boundary at agent-spawn layer: Generator = blogger agent (Kimi K2.6/Gemini 3 Flash) ≠ Critic = quality-critic (DeepSeek V4 Pro). $0 net new spend. `blog_preflight.py` extended with auto-running factcheck gate (`--skip-factcheck` flag). `blog_vocab_analyze.py` extended with FORBIDDEN_PHRASES + AI_SLOP_WORDS loaded from voice.json (canonical) with embedded fallback. blog-orchestrator Sub-Skills 14→15. Tested on 3 articles (free-instagram, influencer-audience, seedance) — all FAIL with hard_fails (existing content has factcheck debt; gate would have blocked). Acceptance PASSED.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-04-29 | exec    | Phase 2C COMPLETE. **Universality introduced**: `skills/seo/scripts/project_config.py` (universal loader; reads `.seo-config.json` at project root; CLI `--project-root` > env > walk-up discovery; cache isolated per-slug). Created Celavii config at `projects/celavii/.seo-config.json`. **Spec drift**: upstream is keyword-based with no Python — vendored only the MERGE/DIFFERENTIATE/CANONICAL/NO_ACTION taxonomy; embedding approach Celavii-authored. Authored `skills/blogger/blog-cannibalization/scripts/cannibalization_detector.py` — Python port of `social_listener` `embedding-provider.ts` (gemini-embedding-2-preview, 768 dim, SEMANTIC_SIMILARITY task type, batch-100, focal-extract chunking, JSON cache by content hash). Authored matching SKILL.md. `blog_preflight.py` extended with `run_cannibalization_gate()` + `--skip-cannibalization`. blog-orchestrator Sub-Skills 15→16. hooks.json `_phase_2D_planned` extended. Initial 30-post audit: 95 HIGH (~67 same-slug duplicates → B9), **28 distinct-slug HIGH overlaps** including 1 confirmed duplicate (`three-circles-method` vs `three-circles-method-2026-03-04` cosine=0.96) and the `influencer-marketing-guide` pillar eating 5+ neighbors. **Acceptance PASSED**: best-influencer-marketing-tools vs content-creator-analytics-tools cosine=0.8076 MEDIUM. **B8 logged**: Phase 1/2A/2B Celavii-hardcoded scripts need retrofit to use project_config before onboarding a second project. |
| 2026-04-29 | exec    | **B8 retrofit COMPLETE**. All Phase 1/2A/2B scripts now read project config via `project_config.py` instead of Celavii hardcodes: (1) `source_validator.py` — `tier_1_first_party` from config (industry list still embedded); (2) `fact_checker.py` — accepts `--project-root`, voice loaded via config; (3) `blog_vocab_analyze.py` — voice via config; (4) `drift_baseline.py` adds `get_db_path(project_root)` (transitives inherit via DB_PATH import); (5) `google_auth.py` — CONFIG_PATH/TOKEN_PATH derived from per-project cache_dir. All paths fall back to `~/.config/openclaw-seo/` if no project config found. 6/6 smoke tests passed; no regressions (factcheck still FAILs same articles with same hard_fail counts; cannibalization cache hit confirms identical embeddings). System is now ready to onboard non-Celavii projects (max-kick, line-by-line, etc.) by dropping a `.seo-config.json` at the project root.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
