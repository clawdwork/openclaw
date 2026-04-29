# Community Repos — Extraction Notes

> **Sources reviewed**:
>
> - `/Users/operator/dev/research/claude-blog` (v1.6.9) — 22 sub-skills + agents + tests + plugin manifest
> - `/Users/operator/dev/research/claude-seo` (v1.9.6) — 23 sub-skills + 18 agents + hooks + extensions + schema + PDF infra
>   **Date**: 2026-04-28
>   **Companion to**: [social-agents-implementation-proposal.md](social-agents-implementation-proposal.md)

These are upstream community repos — patterns worth borrowing as we build the social-agents pipeline (and to refresh our local SEO/blogger skills).

---

## 1. New Skills With Direct Social Analogs

### From claude-blog → social

| Source skill           | Path                                                         | Social analog            | Why it matters                                                                                                                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blog-cannibalization` | `claude-blog/skills/blog-cannibalization/SKILL.md`           | `social-cannibalization` | Detect duplicate messaging across channels (Elioth/Celavii/CutMaster) using semantic clustering. Replaces Gate B's manual cannibalization check.                                                                                                                                                     |
| `blog-factcheck`       | `claude-blog/skills/blog-factcheck/SKILL.md`                 | `social-factcheck`       | Extract stat claims, fetch sources via WebFetch, score confidence. Critical for X threads / LinkedIn posts citing data.                                                                                                                                                                              |
| `blog-persona`         | `claude-blog/skills/blog-persona/SKILL.md` (line 109 schema) | `social-persona`         | NNGroup 4-dimension tone framework (Funny↔Serious, Formal↔Casual, Respectful↔Irreverent, Enthusiastic↔Matter-of-fact). Stores JSON with readability + sentence-length + contraction-frequency targets. **Replaces our hand-rolled "voice rules" string** with a structured, machine-checkable model. |
| `blog-taxonomy`        | `claude-blog/skills/blog-taxonomy/SKILL.md`                  | `social-taxonomy`        | Tag/category management with WordPress/Shopify/Ghost/Strapi/Sanity adapters. For us: hashtag + topic-cluster sync across platforms.                                                                                                                                                                  |
| `blog-notebooklm`      | `claude-blog/skills/blog-notebooklm/SKILL.md`                | `social-notebooklm`      | Headless browser + NotebookLM source-grounded research. Tier-1 research source for high-authority content.                                                                                                                                                                                           |

### From claude-seo → social

| Source skill    | Path                                                  | Social analog                 | Why it matters                                                                                                                                                                                                           |
| --------------- | ----------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `seo-drift`     | `claude-seo/skills/seo-drift/`                        | `social-drift`                | **High value.** Git-like baseline capture via SQLite + 17 comparison rules. For social: monitor engagement regressions, deleted posts, caption edits, profile changes. Cache at `~/.cache/claude-social/drift/`.         |
| `seo-sxo`       | `claude-seo/skills/seo-sxo/`                          | `social-sxo`                  | **Search Experience Optimization** — "does this page deserve to rank?" Adapted: "does this post deserve to engage?" Reads platform native ranking signals backwards to detect format/audience mismatches.                |
| `seo-cluster`   | `claude-seo/skills/seo-cluster/`                      | folds into `social-aggregate` | Semantic topic clustering by SERP overlap (not text similarity). For us: hashtag clustering by co-occurrence, not just string match. Strengthens our Phase 3 aggregator.                                                 |
| `seo-flow`      | `claude-seo/skills/seo-flow/`                         | `social-flow`                 | **FLOW framework** Find→Leverage→Optimize→Win→Local. 41 CC BY 4.0 prompts. Adapted: Find trends → Leverage creators → Optimize posts → Win engagement → Local community. Useful prompt library to seed our pipeline.     |
| `seo-backlinks` | `claude-seo/skills/seo-backlinks/`                    | `social-mentions`             | Brand mention tracking, share monitoring, micro-influencer outreach. Maps directly to one of our existing pillars (`social-mentions` is already a published Celavii blog topic).                                         |
| `seo-image-gen` | `claude-seo/skills/seo-image-gen/` (Banana extension) | `social-image-gen`            | Already partly handled by `celavii-social` calling nano-banana-pro. Worth borrowing the **6-component prompt engineering system** (Subject/Style/Context/Action/Composition/Lighting) and platform-aspect-ratio presets. |

---

## 2. Architectural Patterns Worth Adopting

### A. Hooks System (claude-seo) — **WE DO NOT HAVE THIS**

Source: `claude-seo/hooks/hooks.json` + `claude-seo/scripts/validate-schema.py`

```json
{
  "PostToolUse": {
    "matcher": "Edit|Write",
    "command": "validate-schema.py \"$FILE_PATH\""
  }
}
```

Exit code 2 = block edit; 1 = warn; 0 = allow.

**Apply to social**: Hook on Write/Edit to validate:

- Brand voice rules (banned language: "toggle tax", "AI-powered" instead of "agentic")
- OG tag completeness for social-meta files
- Character limits per platform (X: 280, LinkedIn: 3,000, IG caption: 2,200)
- Hashtag-count caps per platform

This catches violations _before_ they're saved, not at gate-time. Add to **Phase A** of the proposal.

### B. Extensions Pattern (claude-seo) — **WE DO NOT HAVE THIS**

Path: `claude-seo/extensions/{dataforseo,firecrawl,banana}/`

Each extension has:

```
extensions/{name}/
├── install.sh / install.ps1   # prompt for credentials, copy skill, merge MCP into settings.json
├── uninstall.sh / uninstall.ps1
├── README.md
├── skill/                      # the SKILL.md + references + scripts
├── agent/                      # specialized subagent definition
└── docs/                       # setup guide
```

**Apply to social**: Future-proof multi-platform integration. Extensions like:

- `extensions/celavii-multiplatform/` — when YT/TT/X scraping endpoints land
- `extensions/apify-social/` — TikTok/IG Apify actors
- `extensions/buffer/` or `extensions/typefully/` — scheduling integration

Add to **Phase H** of the proposal as the design pattern.

### C. Plugin Manifest (`.claude-plugin/`)

Both repos have:

```
.claude-plugin/
├── plugin.json        # name, version, author, keywords, license
└── marketplace.json   # distribution metadata
```

**Apply**: Wrap our skill set as installable plugins. Distinguishes core social-agents from community-extension social-agents. Useful when we publish parts of our stack.

### D. Schema Templates (claude-seo)

Path: `claude-seo/schema/templates.json` — 10 JSON-LD templates ready to drop in.

**Apply to social**: Add `schema/social-templates.json` — VideoObject, CreativeWork, ProfilePage, Article-for-share-cards. Useful for OG/Twitter Card generation in `celavii-social` Step 4.

### E. Specialized Agents (claude-seo `agents/`)

18 agents, each with frontmatter:

```yaml
name: seo-drift-detector
tools: [Read, Grep, WebFetch, Bash]
maxTurns: 15
model: sonnet
description: ...
```

**Apply**: We currently route through skills; pattern says to define **agents** as distinct entities with bounded turns + tool restrictions. Reduces blast radius and lets the orchestrator spawn parallel specialists.

For social: `social-researcher`, `social-writer`, `social-strategist`, `social-analyzer` (per claude-blog `agents/` model).

### F. Tiered Credential Pattern (claude-blog `blog-google`)

Tier 0 (API key) → Tier 1 (OAuth) → Tier 2 (GA4) → Tier 3 (Ads). Each tier unlocks more capabilities. Skill checks tier and routes accordingly.

**Apply**: Social platforms have similar tiers — public scrape (Tier 0) → API token (Tier 1) → Business account (Tier 2). `social-discover` should check tier before each call.

### G. Tests + Evaluations (claude-blog `tests/`)

```
tests/
├── conftest.py                # pytest fixtures
├── test_analyze_blog.py       # unit tests for scoring/parsing
└── evaluations.json           # behavior expectations per command
```

**Apply**: We have **zero skill tests** in our workspace. Add `tests/social/` with:

- `evaluations.json` — what `/social_strategy` should produce given fixture intake
- `conftest.py` — sample state files, sample raw JSON
- `test_aggregate.py` — deterministic aggregator (Phase C) is the easiest to test

Add to **Phase C** of the proposal.

### H. PDF Report Infrastructure (claude-seo)

Path: `claude-seo/scripts/google_report.py`

Stack: weasyprint + matplotlib (200 DPI charts), A4, color palette, post-gen `_review_pdf()` quality check.

**Apply**: Phase 6 PDF report. Currently planned as "clone Next.js print template". Alternative: use claude-seo's weasyprint pipeline — simpler, no Next.js build step. Worth deciding which.

### I. SQLite State for Drift Tracking

claude-seo stores drift baselines in SQLite (`~/.cache/claude-seo/drift/baselines.db`) with normalized URL keys.

**Apply**: A `social-drift.db` per channel for engagement baselines, post snapshots, follower trajectory. Lives in `~/.cache/claude-social/`, not in the repo.

---

## 3. Specific Patterns Worth Backporting to Existing Local Skills

| Local skill                 | Borrow from                                    | What                                                                                              |
| --------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `seo-orchestrator`          | `claude-seo/skills/seo/SKILL.md`               | "15 parallel subagent" spawn pattern + industry-aware delegation                                  |
| `blogger/blog-orchestrator` | `claude-blog/skills/blog/SKILL.md` lines 59–87 | Subcommand parsing + on-demand reference loading                                                  |
| `blogger/blog-write`        | `claude-blog/skills/blog-persona/`             | Replace voice "rules" with structured 4-dimension persona JSON                                    |
| `blogger/blog-audit`        | `claude-blog/scripts/analyze_blog.py`          | 5-category 100-point scoring rubric (Content 30 / SEO 25 / E-E-A-T 15 / Tech 15 / AI Citation 15) |
| `seo` skill family          | `claude-seo/extensions/dataforseo/`            | Wrap our Apify scripts as a true "extension" with install/uninstall                               |

---

## 4. Updates to the Implementation Proposal

Add the following items to [social-agents-implementation-proposal.md](social-agents-implementation-proposal.md):

### Phase A (Foundation) additions

- [ ] **A11** Create `.claude-plugin/plugin.json` for the social-agents stack — version, keywords, license (mirror `claude-blog/.claude-plugin/plugin.json`)
- [ ] **A12** Add `hooks/hooks.json` PostToolUse pattern for social content validation (banned language, char limits per platform)
- [ ] **A13** Decide PDF stack: Next.js (current plan) vs weasyprint+matplotlib (claude-seo pattern). Document choice.

### Phase B (Atomic Skills) additions — **5 new skills inspired by community repos**

- [ ] **B13** `social-persona` — structured voice JSON (4-dim NNGroup model). Replaces ad-hoc voice_rules in state.meta.intake.
- [ ] **B14** `social-factcheck` — claim extraction + WebFetch source verification + confidence scoring
- [ ] **B15** `social-cannibalization` — semantic overlap detection across channels (replaces Gate B manual check)
- [ ] **B16** `social-drift` — SQLite baseline + comparison rules; runs nightly to flag engagement regressions, deleted posts, caption edits
- [ ] **B17** `social-sxo` — platform-fit analysis ("does this post deserve to engage?") reading native ranking signals backwards

### Phase D (Strategy Pipeline) additions

- [ ] **D15** Adopt 15-parallel-subagent spawn pattern from claude-seo `/seo audit` for Phase 1 (DISCOVER) — one subagent per platform per channel
- [ ] **D16** Industry-aware delegation: detect channel type (founder/product/utility) → activate relevant subagents only
- [ ] **D17** Implement tiered credentials in `social-discover` (Tier 0/1/2 like blog-google)

### Phase G (Pilot) additions

- [ ] **G8** Set up `tests/social/` with `evaluations.json` + `conftest.py` (claude-blog test pattern)
- [ ] **G9** Test `social-aggregate` deterministic script against fixture data
- [ ] **G10** Add `validate-schema.py`-style hook for social-meta files

### New Phase J — Extension Wrapping (parallelizable)

- [ ] **J1** Wrap Apify SEO/Social scripts as `extensions/apify-social/` (claude-seo pattern)
- [ ] **J2** Wrap Celavii API as `extensions/celavii/` with install.sh + MCP merge
- [ ] **J3** Wrap Banana image gen as `extensions/banana/` (verbatim port from claude-seo)
- [ ] **J4** Document extension manifest format in [openclaw/.system/architecture/](../../architecture/)

---

## 5. Patterns to Skip

| Pattern                                       | Why skip                                       |
| --------------------------------------------- | ---------------------------------------------- |
| `claude-seo/translations/`                    | i18n not relevant to internal tooling          |
| `claude-seo/claude-seo-slides/`               | YouTube promo — not our use case               |
| `claude-blog/.github/ISSUE_TEMPLATE/`         | We're internal, not OSS-distributed            |
| Banana extension _if we keep nano-banana-pro_ | Overlaps with existing `celavii-social` Step 5 |

---

## 6. Decisions Needed

- [ ] **D1** Adopt the hooks/ system for content validation? (recommend yes — high ROI, low effort)
- [ ] **D2** Adopt extensions/ pattern? (recommend yes — better isolation than current symlink approach)
- [ ] **D3** PDF stack — Next.js or weasyprint+matplotlib? (recommend weasyprint for speed, Next.js for client-facing polish)
- [ ] **D4** Add 5 new community-inspired skills (B13–B17)? (recommend yes — biggest unlock is `social-persona` and `social-drift`)
- [ ] **D5** Backport patterns to existing local SEO/blogger? (recommend separate ticket — don't bundle with social work)
- [ ] **D6** License compliance — both repos are MIT/CC BY 4.0; safe to copy with attribution. Add NOTICE file if we ship.

---

## 7. Top 5 Highest-Value Extracts

If we do nothing else from this review, do these:

1. **`social-persona` skill** (from `blog-persona`) — structured voice JSON beats hand-rolled rules
2. **`social-drift` skill** (from `seo-drift`) — SQLite engagement-regression detector, fills a gap nothing else covers
3. **Hooks system** (from `claude-seo/hooks/`) — pre-write validation prevents banned language and char-limit overruns
4. **Extensions pattern** (from `claude-seo/extensions/`) — proper isolation for Celavii API + Apify + Banana
5. **`social-cannibalization`** (from `blog-cannibalization`) — automated, replaces Gate B manual check
