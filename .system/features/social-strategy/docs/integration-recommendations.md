# Integration Recommendations

> Synthesis of [repos.md](repos.md) + [frameworks.md](frameworks.md) into actionable items mapped to specific skills + pipeline phases.
> **Date**: 2026-04-28

---

## 1. Top-Priority Adoptions (do these first)

| #   | Action                                                                                           | From                                                                                                                                                                                                | Maps to                                  | Effort      |
| --- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------- |
| 1   | Vendor `brand-voice/discover-brand` + `brand-voice-enforcement` SKILL.md files                   | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)                                                                                                           | `social-persona`, `social-drift`         | 2–4 hrs     |
| 2   | Encode NN/g 4D voice schema as JSON                                                              | [NN/g 4 Dimensions](https://www.nngroup.com/articles/tone-of-voice-dimensions/)                                                                                                                     | `.styles/celavii/voice.json`             | 1 hr        |
| 3   | Adopt evaluator-optimizer + orchestrator-worker patterns                                         | [Anthropic Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)                                                                                              | All critic gates + `social-orchestrator` | Design only |
| 4   | Wire [trendsmcp/tiktok-trends-mcp](https://github.com/trendsmcp/tiktok-trends-mcp) as MCP server | trendsmcp                                                                                                                                                                                           | `social-trend-detect`                    | 2 hrs       |
| 5   | Build `social-cannibalization` on cosine-similarity + 30d temporal window                        | [The Ad Firm method](https://www.theadfirm.net/how-ai-tools-can-detect-cannibalization-and-fix-internal-competing-keywords-2/) + [jmelm93](https://github.com/jmelm93/seo_cannibalization_analysis) | `social-cannibalization`                 | 1 day       |
| 6   | Adopt cross-model critic (Sonnet generates, Opus critiques)                                      | [Self-Refine](https://arxiv.org/abs/2303.17651) + AI-slop literature                                                                                                                                | All gates                                | Config only |
| 7   | Hard-cap refinement loops at 3 iterations                                                        | [Reflexion](https://arxiv.org/pdf/2303.11366)                                                                                                                                                       | All gates                                | Config only |
| 8   | Build factcheck pipeline on Loki skeleton                                                        | [Libr-AI/OpenFactVerification](https://github.com/Libr-AI/OpenFactVerification)                                                                                                                     | `social-factcheck`                       | 1 day       |

---

## 2. Phase-by-Phase Integration

### Phase 0 ACQUIRE

| Add                                                      | Source                          | Why                            |
| -------------------------------------------------------- | ------------------------------- | ------------------------------ |
| Fallback chain: official OAuth → Apify (paid) → scrapers | OSS scraper reality             | Scrapers break every 2–4 weeks |
| Slack-channel-as-inbox for manual ingestion              | langchain-ai/social-media-agent | Cheap HITL ingestion path      |
| **Don't use snscrape**                                   | Dead since Q1 2025              | Avoid wasted work              |

### Phase 1 DISCOVER

| Add                                                        | Source                      | Why                               |
| ---------------------------------------------------------- | --------------------------- | --------------------------------- |
| Compute velocity + acceleration + z-score (not raw volume) | Industry trend math         | Platform-native lists are lagging |
| TikTok trends via MCP (trendsmcp)                          | trendsmcp/tiktok-trends-mcp | Drop-in trend feed                |
| ramekin z-score over rolling buckets                       | readikus/ramekin            | Lightweight algorithm to port     |

### Phase 2 ANALYZE

| Add                                                                           | Source                             | Why                                          |
| ----------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------- |
| Hashtag co-occurrence clustering                                              | bellingcat/tiktok-hashtag-analysis | Beyond string-matching                       |
| ER per-platform with correct denominator (TikTok = views, others = followers) | Industry standard formulas         | Standard requires platform-aware computation |
| 2026 benchmarks for ER comparison                                             | Socialinsider 52M-post study       | Quantitative baseline for scoring            |

### Phase 3 AGGREGATE (deterministic)

| Add                                           | Source             | Why                            |
| --------------------------------------------- | ------------------ | ------------------------------ |
| Cosine-similarity cannibalization check       | The Ad Firm method | Replaces manual Gate B check   |
| 5 hook archetypes as classification dimension | Industry consensus | Quantifiable hook taxonomy     |
| 4E framework as content-type tagger           | Foundation Inc     | Forces ≥2 E's per planned post |

### Gate A — Strategy Alignment

| Add                                                | Source                                                                                                  | Why                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Constitutional principle file                      | [Constitutional AI](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback) | Explicit rubric beats threshold checks |
| Cross-model critic                                 | Self-Refine + slop research                                                                             | Same-model critic = false agreement    |
| **Critic must read intake.business_concept first** | SEO dry-run lesson                                                                                      | Prevents context-free scoring          |

### Phase 4 PLAN

| Add                                      | Source                    | Why                                                     |
| ---------------------------------------- | ------------------------- | ------------------------------------------------------- |
| Hub vs Pillar separation                 | Animalz                   | Different post types serve different roles              |
| Format-as-channel model                  | Linus Media Group         | Channel split should be format-driven, not topic-driven |
| Gary Vee Reverse Pyramid for repurposing | GV Content Model          | Canonical 1→30+ atomization model                       |
| 2026 cadence rules per platform          | Buffer + Sprout 2026 data | Empirical, not guess                                    |

### Gate B — Calendar + Cannibalization

| Add                                       | Source      | Why                                                |
| ----------------------------------------- | ----------- | -------------------------------------------------- |
| Cosine-similarity + temporal window check | The Ad Firm | Catches social-specific dimension SEO tools miss   |
| Cadence sustainability check              | Buffer 2026 | "Highest cadence sustainable without quality drop" |

### Phase 5 DELIVER (Briefs + Scripts + Hooks)

| Add                                         | Source                      | Why                              |
| ------------------------------------------- | --------------------------- | -------------------------------- |
| 5+ hook variants per post, archetype-tagged | Hook archetype literature   | Variant generation > single-shot |
| 3s-retention rubric for video hooks         | Opus.pro research           | Quantifiable virality target     |
| 8-pass humanizer loop                       | OpenClaudia Humanizer skill | Adversarial editing pattern      |
| ClipsAI for transcript-aware shot lists     | ClipsAI/clipsai             | Open-source backbone             |

### Gate C — Per-Post Quality

| Add                                                                      | Source                       | Why                                  |
| ------------------------------------------------------------------------ | ---------------------------- | ------------------------------------ |
| RefChecker for AI-fabricated stat detection                              | amazon-science/RefChecker    | LLM-tuned hallucination detector     |
| Loki claim verification                                                  | Libr-AI/OpenFactVerification | Paper-backed pipeline                |
| Anti-slop rubric (specificity, novelty, sourced claims, distinctive POV) | AI slop literature           | Defensive against authenticity decay |
| Banned-language linter                                                   | claude-seo hooks pattern     | Pre-write blocking                   |

### Phase 6 REPORT

| Add                                          | Source              | Why                                    |
| -------------------------------------------- | ------------------- | -------------------------------------- |
| Benchmark comparison vs 2026 ER medians      | Socialinsider study | Anchored, not relative                 |
| **(Stretch) Publish a Celavii Social Score** | Market gap          | No public Lighthouse-equivalent exists |

---

## 3. Skill-Specific Integration Plan

### `social-persona` — vendor + extend

```
Source:  anthropics/knowledge-work-plugins/marketing/skills/brand-voice/discover-brand
Action:  Copy SKILL.md + references verbatim. Extend with NN/g 4D JSON schema.
Output:  .styles/celavii/voice.json (4D vector + tone-by-context matrix)
Effort:  4 hrs
```

### `social-drift` — vendor + extend

```
Source:  anthropics/knowledge-work-plugins brand-voice-enforcement (linter)
       + claude-seo/skills/seo-drift (SQLite baseline pattern)
Action:  Combine. Linter checks voice JSON; SQLite tracks engagement/post baselines.
Output:  ~/.cache/claude-social/drift/baselines.db
Effort:  1 day
```

### `social-factcheck` — fork Loki skeleton

```
Source:  Libr-AI/OpenFactVerification + BharathxD/ClaimeAI graph topology
Action:  Implement claim decomposition → check-worthiness → query gen → evidence retrieval → verdict
Output:  Per-post citation doc + fail-fast on unverified claims
Effort:  1 day
```

### `social-cannibalization` — embeddings + temporal

```
Source:  The Ad Firm cosine-similarity method
       + jmelm93 GSC analyzer pattern
Action:  Embed posts (text-embedding-ada-002 or Voyage), cosine matrix per channel, 30-day temporal window
Threshold: 0.85 cosine = flag
Output:  Pre-publish gate report
Effort:  1 day
```

### `social-trend-detect` — MCP + math

```
Source:  trendsmcp/tiktok-trends-mcp (drop-in)
       + readikus/ramekin (z-score math)
       + bellingcat/tiktok-hashtag-analysis (co-occurrence)
Action:  Wire MCP server. Compute velocity, acceleration, z-score. Cluster co-occurring hashtags.
Output:  raw/trend-{platform}-{topic}-{ts}.json + summary md
Effort:  1 day
```

### `social-repurpose` — fork ClipsAI

```
Source:  ClipsAI/clipsai (transcript-aware cuts)
       + Shaarav4795/ClippedAI (viral-title prompts)
Action:  Wrap ClipsAI as extension. Gary Vee Reverse Pyramid as planning rule (1 pillar → 30+ atomic).
Output:  Per-channel variants from each pillar input
Effort:  2 days
```

### `social-quality` (Gates A/B/C) — Self-Refine + Constitutional

```
Source:  Self-Refine + Reflexion + Constitutional AI patterns
Action:  Constitutional principle file at .claude/rules/social-constitution.md
        Cross-model critic (Sonnet ⊥ Opus)
        Hard cap: 3 iterations
        Anti-slop rubric: specificity, novelty, sourced claims, distinctive POV
Effort:  1 day per gate (3 days total)
```

### `social-hooks` — new sub-skill (not in original plan)

```
Source:  Hook archetype literature (Curiosity Gap, Contrarian, Story, Authority, Pattern Interrupt)
       + Justin Welsh templates + Opus.pro 3s-retention research
Action:  Generate 5+ hook variants per post, archetype-tagged
        Score each on: specificity, gap-size, archetype clarity, predicted 3s-retention
Effort:  1 day
```

→ **Add as B18 to implementation proposal Phase B**

---

## 4. Updates to Implementation Proposal

Items to add to [../social-agents-implementation-proposal.md](../social-agents-implementation-proposal.md):

### Phase A (Foundation)

- [ ] **A14** Vendor `anthropics/knowledge-work-plugins` brand-voice skills into `~/dev/openclaw/skills/social-persona/` and `social-drift/`
- [ ] **A15** Define `.styles/celavii/voice.json` schema (NN/g 4D + Mailchimp tone-by-context)
- [ ] **A16** Author `.claude/rules/social-constitution.md` (anti-slop rubric, banned language, voice principles)
- [ ] **A17** Wire trendsmcp/tiktok-trends-mcp into gateway MCP config

### Phase B (Atomic Skills)

- [ ] **B18** `social-hooks` — new skill, 5-archetype hook generator + scorer
- [ ] **B19** Integrate ClipsAI as extension for `social-repurpose` video lane
- [ ] **B20** Integrate Loki claim-verification as `social-factcheck` backbone
- [ ] **B21** Vendor RefChecker for AI-fabricated stat detection in `social-quality` Gate C

### Phase C (Aggregator)

- [ ] **C7** Implement cosine-similarity + 30-day temporal cannibalization detection
- [ ] **C8** Encode 4E framework + 5 hook archetypes as content-type taggers
- [ ] **C9** Compute velocity + acceleration + z-score (not raw volume) for trend signals

### Phase D (Strategy Pipeline)

- [ ] **D18** Adopt cross-model critic (Sonnet generates, Opus critiques) at all gates
- [ ] **D19** Hard-cap refinement loops at 3 iterations
- [ ] **D20** Format-as-channel rule for channel splits (Linus Media Group pattern)
- [ ] **D21** Gary Vee Reverse Pyramid as repurposing planning rule

### Phase E (Curate Command)

- [ ] **E8** Hook variant generation: 5+ per post, archetype-tagged

### Phase G (Pilot)

- [ ] **G11** Benchmark output against 2026 ER medians (TikTok 3.70%, Reels 7.5%, IG 0.48%, X 0.12%)
- [ ] **G12** Anti-slop self-review on first dry-run output

### New Phase K — Score Publishing (Stretch)

- [ ] **K1** Define Celavii Social Score formula (composite of ER, save-rate, follow-conversion, retention)
- [ ] **K2** Document publicly as a Lighthouse-equivalent for social
- [ ] **K3** Open-source the scoring methodology

---

## 5. What NOT to Do

| Don't                                                                  | Why                                      |
| ---------------------------------------------------------------------- | ---------------------------------------- |
| Build Acquire on snscrape                                              | Dead since Q1 2025                       |
| Use scrapers as primary path for IG/TikTok                             | ToS-violating + breaks every 2–4 weeks   |
| Lift CrewAI/LangGraph examples wholesale                               | Demos, not prod-ready                    |
| Same-model generator + critic                                          | Self-Refine literature: false agreement  |
| Optimize for like rate                                                 | 2026: replaced by save rate + retention  |
| Optimize for raw volume over quality                                   | 2026: "highest sustainable cadence" wins |
| Use "delve", "tapestry", "multifaceted", "navigate the landscape"      | AI-slop tells; -50% engagement           |
| Trust platform-native trend lists as leading indicators                | They surface peaked trends               |
| Vendor awesome-\* prompt lists without re-checking individual licenses | Chain-of-license rot                     |

---

## 6. Decisions Required (parked from earlier)

- [ ] **D1** Adopt hooks/ system for content validation? (recommend yes — high ROI)
- [ ] **D2** Adopt extensions/ pattern for Celavii API + Apify + Banana? (recommend yes)
- [ ] **D3** PDF stack — Next.js or weasyprint+matplotlib? (recommend weasyprint)
- [ ] **D4** Add 5 community-inspired skills (B13–B17)? (recommend yes)
- [ ] **D5** Vendor anthropics/knowledge-work-plugins brand-voice? (recommend yes — top priority)
- [ ] **D6** Build & publish a Celavii Social Score? (recommend yes — market gap)
- [ ] **D7** Cross-model critic config (Sonnet ⊥ Opus)? (recommend yes — slop defense)

---

## 7. License Compliance Summary

| Source                              | License                         | Action                                            |
| ----------------------------------- | ------------------------------- | ------------------------------------------------- |
| anthropics/knowledge-work-plugins   | MIT                             | Vendor + attribute in NOTICE                      |
| langchain-ai/social-media-agent     | MIT                             | Vendor patterns + attribute                       |
| Libr-AI/OpenFactVerification        | MIT                             | Vendor + attribute                                |
| ClipsAI/clipsai                     | Apache 2.0                      | Vendor + attribute                                |
| trendsmcp/tiktok-trends-mcp         | (verify)                        | Wire as MCP — no vendoring                        |
| Mailchimp content-style-guide       | Public domain–ish               | Reference, no vendoring needed                    |
| NN/g 4D framework                   | Industry standard, not licensed | Encode internally                                 |
| 2026 benchmark data (Socialinsider) | Industry data                   | Cite, don't redistribute                          |
| awesome-\* lists                    | Mixed/unclear                   | **Re-read each individual repo** before vendoring |

**Action item**: Add `NOTICE` file to social-strategy when first vendoring any third-party SKILL.md.
