# GitHub Repo Audit — SEO + Blog Upgrade

> External OSS sweep for the seo-strategy v2 upgrade. Two community-maintained Claude Code skill packs as primary sources, plus prior-art references.
> **Date**: 2026-04-27

---

## 1. Primary Source Repos (Already Synced Locally)

### **[claude-seo](https://github.com/dontriskit/claude-seo)** — ★ PRIMARY UPSTREAM

Local path: `~/dev/research/claude-seo`
Last synced: 2026-04-27 (`a0561b2` — 24h ago, actively maintained)
License: verify in repo before vendoring

24 skills, 18 agents, 30+ scripts.

**What we adopt** (per [integration-recommendations.md](integration-recommendations.md)):

- `seo-google/` — Google Search Console + Indexing API + CrUX + GA4 Python clients
- `seo-drift/` — SQLite-backed regression detection (17 rules)
- `seo-backlinks/` — Free Moz + Bing + CommonCrawl backlink gap analysis
- `seo-cluster/` — SERP-overlap semantic clustering

**What we skip**:

- `seo-audit` — overlaps with our `deep-audit` (ours is superior)
- `seo-page` — overlaps with our `page-analysis`
- `seo-content` — overlaps with our existing `seo-content`
- `seo-schema` — overlaps with our existing `seo-schema`
- `seo-images`, `seo-hreflang`, `seo-sitemap`, `seo-technical`, `seo-geo`, `seo-plan`, `seo-programmatic` — direct overlap with our equivalents

### **[claude-blog](https://github.com/dontriskit/claude-blog)** — ★ PRIMARY UPSTREAM

Local path: `~/dev/research/claude-blog`
Last synced: 2026-04-27 (`bc734cb` — 2 weeks ago)
License: verify in repo before vendoring

22 skills, 4 agents, multi-language (`blog/` + `skills/blog-*/`).

**What we adopt**:

- `blog-google/` — same scripts as `seo-google/` (one Google Cloud project unlocks both)
- `blog-factcheck/` — auto-verify cited URLs + claims (we'll add cross-model critic)
- `blog-cannibalization/` — keyword overlap detection (we'll **augment with embeddings**, not adopt as-is)
- `blog-image/` (Phase 4 OPT) — Gemini API hero/inline generation
- `blog-audio/` (Phase 4 OPT) — Gemini TTS replacement for our Minimax flow
- `blog-persona/` (Phase 4 OPT) — voice consistency layer

**What we skip**:

- `blog-taxonomy` — CMS sync (Celavii is static MDX, no dynamic CMS)
- `blog-notebooklm` — defer (nice-to-have, not blocking)
- `blog-analyze`, `blog-audit`, `blog-brief`, `blog-calendar`, `blog-chart`, `blog-geo`, `blog-outline`, `blog-repurpose`, `blog-rewrite`, `blog-schema`, `blog-seo-check`, `blog-strategy`, `blog-write` — direct overlap with our equivalents

---

## 2. Prior-Art References (Patterns + Methodology, Not Vendored)

### Cannibalization Detection (Why We Build Custom Instead of Adopting)

| Repo / Source                                                                                                                                               | Method                                                     | Why we use this for our build             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| [The Ad Firm — AI Cannibalization via Embeddings](https://www.theadfirm.net/how-ai-tools-can-detect-cannibalization-and-fix-internal-competing-keywords-2/) | Cosine similarity > 0.85 on text-embedding-ada-002 vectors | Found 312 clusters keyword methods missed |
| [jmelm93/seo_cannibalization_analysis](https://github.com/jmelm93/seo_cannibalization_analysis)                                                             | GSC query-page mapping + overlap thresholding              | Algorithm + Excel output pattern          |
| [SEO Cannibalization Detector (mdskills)](https://www.mdskills.ai/skills/seo-cannibalization-detector)                                                      | Claude skill, free                                         | Pre-publish gate pattern                  |

**Decision**: build `cannibalization_detector.py` from scratch using The Ad Firm cosine method on text-embedding-3-small (cheaper successor to ada-002). NOT adopt community's keyword-only approach.

### Fact-Check Skeleton (Reference Only)

| Repo                                                                                   | Use                                                                                                           |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [Libr-AI/OpenFactVerification (Loki)](https://github.com/Libr-AI/OpenFactVerification) | MIT, paper-backed pipeline: claim decomposition → check-worthiness → query gen → evidence retrieval → verdict |
| [BharathxD/ClaimeAI](https://github.com/BharathxD/ClaimeAI)                            | LangGraph implementation of same pipeline                                                                     |
| [amazon-science/RefChecker](https://github.com/amazon-science/RefChecker)              | 3-stage claim extractor tuned for LLM hallucinations                                                          |

**Decision**: adopt community's `blog-factcheck` scripts as primary; reference Loki pattern if we need to extend later.

### Cross-Model Critic (Pattern Source)

| Source                                                                                                               | Why                                                                               |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [Self-Refine (Madaan et al., 2303.17651)](https://arxiv.org/abs/2303.17651)                                          | Single-model critic = false agreement (~20% absolute task improvement when split) |
| [Reflexion (Shinn et al., 2303.11366)](https://arxiv.org/pdf/2303.11366)                                             | Diminishing returns after 3-5 critique loops                                      |
| [Constitutional AI (Bai et al.)](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback) | Critique against explicit principle list                                          |
| [Anthropic — Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)             | Evaluator-optimizer pattern directly maps to our factcheck gate                   |

**Decision**: factcheck verifier MUST use a different model than the blog generator (DeepSeek V4 Pro generates → Opus 4.7 or Kimi K2.6 critiques). Hard cap at 3 iterations.

### Anti-Slop References

| Source                                                                                            | Key insight                                                                    |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Marketing Cloud — Avoiding AI Slop](https://www.themarketingcloud.com/blog/avoiding-ai-slop)     | "Word of the Year, Dec 2025"; -50% engagement on AI-tells                      |
| [Digital Watch — AI Slop's Meteoric Rise](https://dig.watch/updates/ai-slop-content-social-media) | AI-content-heavy sites suffered 95-100% organic traffic loss in Google updates |
| [Liinks — AI Slop Tipping Point](https://www.liinks.co/blog/the-ai-slop-tipping-point)            | 2026 framed as "anti-AI marketing year"; authenticity premium up 10x           |

**Decision**: blog-factcheck includes anti-slop word list ("delve", "tapestry", "multifaceted", "navigate the landscape", "in today's digital landscape"). Banned-language linter + cross-model critic together defend against slop.

---

## 3. Companion Patterns from social-strategy

| Source                                                                                                                           | Pattern adopted                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [../../social-strategy/social-agents-implementation-proposal.md](../../social-strategy/social-agents-implementation-proposal.md) | 7-phase pipeline rigor, intake flow, raw archive, dual critic gates, Phase G dry-run + DRY-RUN-FINDINGS     |
| [../../social-strategy/docs/integration-recommendations.md](../../social-strategy/docs/integration-recommendations.md)           | License compliance table, "What NOT to Do" pattern, skill-to-repo mapping                                   |
| [../../social-strategy/docs/frameworks.md](../../social-strategy/docs/frameworks.md)                                             | Empirical 2026 data, anti-slop research, Self-Refine + Reflexion patterns, Constitutional AI principle file |

---

## 4. License Compliance Summary

| Source                                                                | License            | Action                                              |
| --------------------------------------------------------------------- | ------------------ | --------------------------------------------------- |
| `~/dev/research/claude-seo` (vendored scripts)                        | (verify)           | Vendor + NOTICE in `skills/seo/.claude-plugin/`     |
| `~/dev/research/claude-blog` (vendored scripts)                       | (verify)           | Vendor + NOTICE in `skills/blogger/.claude-plugin/` |
| Google API Python clients (`google-auth`, `google-api-python-client`) | Apache 2.0         | Standard pip install                                |
| Gemini API (embeddings + TTS + CrUX)                                  | Commercial API ToS | Reuses existing `GEMINI_API_KEY`; track cost        |
| Moz Link Explorer API                                                 | Free tier ToS      | Rate-limit; cite in derivative output               |
| Bing Webmaster Tools API                                              | Microsoft API ToS  | Standard usage                                      |
| CommonCrawl data                                                      | CC BY-SA           | Cite in derivative output                           |
| The Ad Firm cosine method                                             | Industry standard  | Encode internally                                   |
| Self-Refine / Reflexion / Constitutional AI papers                    | Academic           | Cite + apply patterns                               |

### Auth approach (v1.2 update)

| API                                  | Auth                       | Why                                                     |
| ------------------------------------ | -------------------------- | ------------------------------------------------------- |
| Gemini API (embeddings + TTS + CrUX) | API key (`GEMINI_API_KEY`) | Already exists; standard for AI Studio APIs             |
| Search Console API                   | **Service account**        | No user consent flow; no token rotation                 |
| Indexing API                         | **Service account**        | Same reasoning; service account needs Owner role in GSC |
| GA4 Data API                         | **Service account**        | Same                                                    |

**Replaces** earlier OAuth flow plan. Service account JSON key at `~/.config/celavii-seo/service-account.json` (gitignored, mode 600). Pattern matches enterprise SEO tools (Screaming Frog, Sitebulb).

---

## 5. Pitfalls & Risks

- **Verify community repo licenses before vendoring** — both `claude-seo` and `claude-blog` need explicit license confirmation; not all "claude-\*" repos use MIT
- **Google API quota** — Indexing API: 200/day free; GSC: 2K queries/day per project
- **OAuth token rotation** — refresh-token logic in `google_auth.py` (community handles this)
- **Embeddings API cost** — text-embedding-3-small @ $0.02/1M tokens; ~$0.003 per cannibalization audit (negligible)
- **Cross-model critic adds latency** — factcheck step only, not full generation

---

## 6. Top Adoption Candidates (Ranked)

| #   | Source                                              | Why                                                                     |
| --- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | `~/dev/research/claude-seo/skills/seo-google/`      | Direct foundation for Google API integration; closes 23% indexation gap |
| 2   | `~/dev/research/claude-blog/skills/blog-google/`    | Same backend as #1; surface from blog orchestrator                      |
| 3   | `~/dev/research/claude-seo/skills/seo-drift/`       | Catches deploy regressions before they kill indexation                  |
| 4   | `~/dev/research/claude-blog/skills/blog-factcheck/` | Auto-verify citations; pairs with cross-model critic                    |
| 5   | `~/dev/research/claude-seo/skills/seo-backlinks/`   | Direct support for +5 referring-domains target                          |

---

## 7. Skill-to-Repo Mapping (Cheat Sheet)

| New skill                | Best prior art                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `seo-google`             | claude-seo/seo-google + Google API Python clients                                                               |
| `seo-drift`              | claude-seo/seo-drift + SQLite baseline pattern                                                                  |
| `seo-backlinks`          | claude-seo/seo-backlinks + Moz Link Explorer free tier                                                          |
| `seo-cluster`            | claude-seo/seo-cluster + DataForSEO SERP API (or free SERP scraper fallback)                                    |
| `blog-google`            | claude-blog/blog-google (same backend as seo-google)                                                            |
| `blog-factcheck`         | claude-blog/blog-factcheck + Libr-AI/OpenFactVerification (Loki) skeleton + cross-model critic pattern          |
| `blog-cannibalization`   | The Ad Firm cosine method + jmelm93/seo_cannibalization_analysis (custom build, NOT community keyword detector) |
| `blog-image` (Phase 4)   | claude-blog/blog-image + Gemini API                                                                             |
| `blog-persona` (Phase 4) | claude-blog/blog-persona + NN/g 4D voice schema                                                                 |
