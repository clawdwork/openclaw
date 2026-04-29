# Integration Recommendations — SEO + Blog Upgrade

> Synthesis of [repos.md](repos.md) + [frameworks.md](frameworks.md) into actionable items mapped to phases of [../IMPLEMENTATION.md](../IMPLEMENTATION.md).
> **Date**: 2026-04-27

---

## 1. Top-Priority Adoptions (Do These First)

| #   | Action                                                                                                                         | From                                            | Maps to            | Effort                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------ | -------------------------- |
| 1   | Vendor `seo-google/scripts/*` — Google API Python clients                                                                      | claude-seo                                      | Phase 1.2          | 2 hrs                      |
| 2   | Existing GCP project + service account (replaces OAuth)                                                                        | Google Cloud Console                            | Phase 1.1          | 20 min user + 30 min agent |
| 3   | Wire `indexing_notify.py` into `blog_finalize.py` for auto-publish submission                                                  | claude-seo + internal                           | Phase 1.3.5        | 30 min                     |
| 4   | Vendor `seo-drift/scripts/*` + capture baselines on 15 posts                                                                   | claude-seo                                      | Phase 2A           | 2 hrs                      |
| 5   | Vendor `blog-factcheck/scripts/*` + cross-model critic (Kimi K2.6 / Gemini 3 Flash → DeepSeek V4 Pro via existing agent stack) | claude-blog + frameworks.md §3                  | Phase 2B           | 2 hrs                      |
| 6   | Build `cannibalization_detector.py` using `gemini-embedding-2-preview` (768d) — match social_listener pattern                  | The Ad Firm method + social_listener/embeddings | Phase 2C           | 2 hrs                      |
| 7   | Hard-cap factcheck refinement loops at 3 iterations                                                                            | Reflexion (frameworks.md §3)                    | Critical Rule §6.9 | Config only                |
| 8   | Author `~/.claude/rules/{seo,blog}-constitution.md`                                                                            | social-strategy pattern                         | Phase 1.5          | 1 hr                       |

---

## 2. Phase-by-Phase Integration

### Phase 1 — Google API Foundation

| Add                                          | Source                                  | Why                                              |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------ |
| Google Cloud project + OAuth                 | Google Cloud Console                    | Required for any GSC/Indexing/CrUX/GA4 access    |
| `gsc_query.py`                               | claude-seo                              | Programmatic GSC clicks/impressions/CTR/position |
| `gsc_inspect.py`                             | claude-seo                              | URL Inspection API (closes today's pending todo) |
| `indexing_notify.py`                         | claude-seo                              | Indexing API batch submit (200/day quota)        |
| `crux_history.py`                            | claude-seo                              | 25-week CWV field-data trends                    |
| `ga4_report.py`                              | claude-seo                              | Organic traffic by landing page                  |
| `.claude-plugin/plugin.json` for both stacks | social-strategy A11 pattern             | Distributable plugin manifests                   |
| `hooks/hooks.json` placeholders              | social-strategy A12 pattern             | Phase 2D wires real PostToolUse hooks            |
| `~/.claude/rules/{seo,blog}-constitution.md` | social-strategy A16 + Constitutional AI | Explicit principle files for critic gates        |

### Phase 1.5 — Dry-Run + Findings (★ NEW per validation v1.1)

| Add                                      | Source                                  | Why                                               |
| ---------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| `DRY-RUN-FINDINGS.md`                    | SEO v1 DRY-RUN-TEST-FINDINGS.md pattern | Catch failure modes before Phase 2 builds on them |
| Test against the 2 just-shipped articles | Internal                                | Real-world smoke test                             |
| Document edge cases + iterate            | Pattern                                 | Prevents Gate-A-style context-free failures       |

### Phase 2A — SEO Drift

| Add                                      | Source              | Why                                  |
| ---------------------------------------- | ------------------- | ------------------------------------ |
| `drift_baseline.py` + `drift_compare.py` | claude-seo          | 17-rule SQLite baseline + comparison |
| Baseline capture on canonical URLs only  | Critical Rule §6.14 | Non-canonical = noise                |
| Weekly cron for compare                  | UC-2                | Catch regressions early              |

### Phase 2B — Blog Factcheck (Cross-Model Critic)

| Add                                                             | Source                                 | Why                             |
| --------------------------------------------------------------- | -------------------------------------- | ------------------------------- |
| `fact_checker.py` + `claim_verifier.py` + `source_validator.py` | claude-blog                            | Auto-verify cited URLs + claims |
| Cross-model critic config (Generator ≠ Critic)                  | Self-Refine (frameworks.md §3)         | Same-model = false agreement    |
| Hard cap at 3 iterations                                        | Reflexion (frameworks.md §3)           | Diminishing returns after 3-5   |
| Anti-slop word list extension to `blog_vocab_analyze.py`        | frameworks.md §5                       | Catch "delve", "tapestry", etc. |
| Constitutional principle file reference                         | `~/.claude/rules/blog-constitution.md` | Explicit critic rubric          |

### Phase 2C — Blog Cannibalization (Embeddings, Custom Build)

| Add                                                            | Source                                | Why                                            |
| -------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------- |
| `cannibalization_detector.py` (custom)                         | The Ad Firm method (frameworks.md §4) | Cosine ≥0.85 finds 312 clusters keyword misses |
| text-embedding-3-small                                         | OpenAI                                | $0.02/1M tokens, ~$0.003/audit                 |
| Severity thresholds: ≥0.85 HIGH, 0.75-0.85 MEDIUM, <0.75 clean | Critical Rule §6.11                   | Prevents false-positive explosion              |
| Initial audit across 41 Celavii posts                          | Internal                              | Establishes baseline for ongoing detection     |

### Phase 2D — Hooks Wiring

| Add                                                            | Source                                  | Why                                |
| -------------------------------------------------------------- | --------------------------------------- | ---------------------------------- |
| PostToolUse hook on `content/blog/**/*.mdx` Write/Edit         | social-strategy A12 pattern             | Auto-trigger preflight + factcheck |
| Exit code 2 blocks save on hook failure                        | claude-seo `validate-schema.py` pattern | Hard gate, not warning             |
| PostToolUse hook on publish event triggers `drift_baseline.py` | Internal                                | Auto-baseline new published posts  |

### Phase 3A — SEO Backlinks (Free Tiers Only)

| Add                                                                | Source     | Why                               |
| ------------------------------------------------------------------ | ---------- | --------------------------------- |
| Free Moz API (10K queries/month)                                   | claude-seo | Sufficient for our scale          |
| Free Bing Webmaster API                                            | claude-seo | Search engine diversification     |
| CommonCrawl webgraph (no key)                                      | claude-seo | Public data; build custom reports |
| `verify_backlinks.py` crawler                                      | claude-seo | Validate links still pass juice   |
| Weekly cron `/seo backlinks gap modash.io,hypeauditor.com,grin.co` | UC-3       | Replicable target list            |

### Phase 3B — SERP-Overlap Clustering

| Add                                             | Source                     | Why                                        |
| ----------------------------------------------- | -------------------------- | ------------------------------------------ |
| `serp_cluster.py`                               | claude-seo                 | SERP-overlap clustering > text similarity  |
| Hub vs Pillar tagging in output                 | Animalz (frameworks.md §8) | Different post types serve different roles |
| Cross-check vs strategy-state-v2 silo structure | Internal                   | Consistency with existing audit trail      |

### Phase 4 (Optional)

| Add                                           | Source                | Why                                            |
| --------------------------------------------- | --------------------- | ---------------------------------------------- |
| `blog-image` Gemini wrapper                   | claude-blog           | Save 30 min/article × 14 deck rewrites = 7 hrs |
| `blog-audio` Gemini TTS                       | claude-blog           | Replaces manual Minimax flow                   |
| `blog-persona` + `.styles/celavii/voice.json` | claude-blog + NN/g 4D | Voice consistency for multi-author scaling     |

---

## 3. Skill-Specific Integration Plan

### `seo-google` — vendor scripts + custom SKILL.md

```
Source:  claude-seo/skills/seo-google/scripts/*
Action:  Copy 5 Python scripts. Create SKILL.md routing for /seo google {gsc,inspect,index,crux,ga4}
Output:  ~/dev/workspace/skills/seo/scripts/{google_auth,gsc_query,gsc_inspect,indexing_notify,crux_history,ga4_report}.py
         + ~/dev/workspace/skills/seo/seo-google/SKILL.md
Effort:  2 hrs
```

### `seo-drift` — vendor scripts + custom config

```
Source:  claude-seo/skills/seo-drift/scripts/*
Action:  Copy drift_baseline.py + drift_compare.py. Configure SQLite at ~/.config/celavii-seo/drift/.
         Capture baselines for 15 published posts.
Effort:  2 hrs
```

### `seo-backlinks` — vendor scripts + free tier signups

```
Source:  claude-seo/skills/seo-backlinks/scripts/*
Action:  Copy 4 Python scripts (moz_api, bing_webmaster, commoncrawl_graph, verify_backlinks).
         Sign up for free Moz + Bing keys (20 min user time).
Output:  Backlink gap analysis vs modash, hypeauditor, grin
Effort:  1.5 hrs agent + 20 min user
```

### `seo-cluster` — vendor scripts + augment

```
Source:  claude-seo/skills/seo-cluster/scripts/serp_cluster.py
Action:  Copy. Augments (does not replace) our existing content-cluster/.
         Tag output as Hub vs Pillar per Animalz framework.
Effort:  1.5 hrs
```

### `blog-google` — wraps seo-google

```
Source:  claude-blog/skills/blog-google/SKILL.md
Action:  Author SKILL.md routing for /blog google gsc <url>. Calls same Python scripts as seo-google.
         Modify blog_finalize.py to auto-call indexing_notify.py on publish.
Effort:  1 hr
```

### `blog-factcheck` — vendor scripts + cross-model critic

```
Source:  claude-blog/skills/blog-factcheck/scripts/*
Action:  Copy 3 Python scripts (fact_checker, claim_verifier, source_validator).
         Configure cross-model critic: Generator (DeepSeek V4 Pro) ≠ Critic (Opus 4.7 or Kimi K2.6).
         Hard cap iterations at 3.
         Extend blog_vocab_analyze.py with anti-slop word list.
         Modify blog_preflight.py to add factcheck gate.
Effort:  2 hrs
```

### `blog-cannibalization` — custom build (NOT community)

```
Source:  The Ad Firm cosine method (frameworks.md §4) + jmelm93/seo_cannibalization_analysis pattern
Action:  Build cannibalization_detector.py from scratch. Use text-embedding-3-small.
         Cosine matrix across all 41 Celavii MDX files.
         Severity thresholds: ≥0.85 HIGH, 0.75-0.85 MEDIUM.
         Modify blog_preflight.py to block intermediate → published if HIGH.
Effort:  2 hrs
```

---

## 4. Updates to Implementation Proposal (Already Applied in v1.1)

The following items were captured in the v1.1 IMPLEMENTATION.md update:

- ✅ Phase 1.5 Dry-Run added
- ✅ Critical Design Rules (Non-Negotiable) §6 — 14 rules
- ✅ What NOT to Do §13 — 12 anti-patterns
- ✅ License Compliance §16 with action checklist
- ✅ Skill-to-Repo Cheat Sheet §17
- ✅ Open Questions for User §18 — 7 questions
- ✅ Approval checklist §19
- ✅ Sequencing Summary §20 with day-by-day plan
- ✅ Plugin scaffolding tasks (1.4.1-1.4.4)
- ✅ Constitutional principle file tasks (1.5.1-1.5.3)
- ✅ Cross-model critic tasks (2B.5-2B.6)
- ✅ Embeddings-based cannibalization tasks (2C.1-2C.7)
- ✅ Hooks wiring tasks (2D.1-2D.3)

---

## 5. What NOT to Do (Aggregate)

Per Implementation.md §13:

| Don't                                                                | Why                                       |
| -------------------------------------------------------------------- | ----------------------------------------- |
| Run Indexing API submissions in serial loops                         | 200/day quota                             |
| Trust GSC URL Inspection cached status                               | Always force fresh                        |
| Replace our Apify scripts with community equivalents                 | We have superior coverage                 |
| Use same model for blog generation + factcheck                       | False agreement                           |
| Optimize blog content for raw word count                             | 2026: sustainable cadence wins            |
| Use GA4 default attribution                                          | Always Data-Driven model                  |
| Capture drift baselines on non-canonical URLs                        | False-positive regressions                |
| Run cannibalization with cosine threshold below 0.85                 | False-positive explosion                  |
| Vendor community Python scripts without `requirements.txt` per skill | Transitive dep conflicts                  |
| Use community's keyword-only cannibalization detector                | Misses 312 semantic clusters              |
| Use "delve", "tapestry", "multifaceted", "navigate the landscape"    | -50% engagement                           |
| Skip the dry-run (Phase 1.5)                                         | SEO v1 dry-run caught Gate A failure mode |

---

## 6. Decisions Required (Open Questions)

Per IMPLEMENTATION.md §18:

- [ ] **Q1** GCP billing account exists OR free-tier-only path documented
- [ ] **Q2** GSC property scope: `sc-domain:celavii.com` vs `https://celavii.com/`
- [ ] **Q3** Phase 4 priority — ship now or defer?
- [ ] **Q4** Architecture docs cadence — per-phase or batched?
- [ ] **Q5** Cross-model critic choice — Opus 4.7 ($) or Kimi K2.6 (cheaper)?
- [ ] **Q6** Embeddings provider — OpenAI text-embedding-3-small or Voyage-3-lite?
- [ ] **Q7** Approval — green-light Phases 1-3 as scoped?

---

## 7. License Compliance Summary

Per IMPLEMENTATION.md §16:

| Source                       | License                           | Action                          |
| ---------------------------- | --------------------------------- | ------------------------------- |
| `~/dev/research/claude-seo`  | (verify in repo before vendoring) | Vendor + NOTICE                 |
| `~/dev/research/claude-blog` | (verify in repo before vendoring) | Vendor + NOTICE                 |
| Google API Python clients    | Apache 2.0                        | Standard pip install            |
| OpenAI / Voyage embeddings   | Commercial API                    | Track cost; cite in derivative  |
| Moz / Bing / CommonCrawl     | Free tier ToS                     | Rate-limit; cite where required |
| Gemini API (Phase 4)         | Commercial API                    | Standard usage                  |

**Action**: Author NOTICE files at `skills/seo/.claude-plugin/NOTICE` + `skills/blogger/.claude-plugin/NOTICE` before any first vendoring.
