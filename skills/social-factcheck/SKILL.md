---
name: social-factcheck
description: >
  Verify factual claims in social-media content before publish. Forks the Loki
  pipeline (claim decomposition → check-worthiness → query gen → evidence
  retrieval → verdict) and pairs with RefChecker for AI-fabricated stat
  detection. Catches hallucinated numbers, misquoted sources, and outdated
  industry data before they ship.
user-invocable: true
metadata:
  {
    "openclaw":
      {
        "emoji": "🔍",
        "requires": { "env": ["BRAVE_API_KEY", "FIRECRAWL_API_KEY"] },
        "primaryEnv": "BRAVE_API_KEY",
      },
  }
---

# social-factcheck

> **Phase B14.** Forks [`Libr-AI/OpenFactVerification (Loki)`](https://github.com/Libr-AI/OpenFactVerification) graph topology + [`BharathxD/ClaimeAI`](https://github.com/BharathxD/ClaimeAI) LangGraph reference + [`amazon-science/RefChecker`](https://github.com/amazon-science/RefChecker) for AI-fabricated stat detection.

## The Loki Pipeline

```
Input post  →  decompose into atomic claims
            →  classify check-worthiness (skip opinion / personal anecdote)
            →  generate verification queries
            →  retrieve evidence (web_search + web_fetch)
            →  judge verdict per claim (Supported / Refuted / Inconclusive)
            →  aggregate confidence
            →  emit per-claim citations + per-post verdict
```

## Modes

### Mode A — Verify a brief or script

```bash
social-factcheck verify --file content/social/briefs/celavii-ig-001-brief.md
# → content/social/research/celavii-ig-001-citations.md
# → state.gates.C.per_post[].factcheck = pass | warn | fail
```

### Mode B — Verify a single claim (one-shot)

```bash
social-factcheck claim "TikTok median ER is 3.7% in 2026"
```

Returns: `{ verdict: "supported", source: "Socialinsider 52M-post study", confidence: 0.92 }`

### Mode C — RefChecker pass on AI-generated content

After any LLM-generated draft (script, brief), run RefChecker to detect fabricated stats.

```bash
social-factcheck refcheck --file content/social/scripts/celavii-tt-001-script.md
```

Returns list of `(claim, hallucination_risk: 0-1)` pairs. Threshold ≥0.7 = block at Gate C.

## Decomposition Rules

A "claim" qualifies for fact-checking only if it's:

- **Atomic**: single proposition, not compound
- **Falsifiable**: testable against external evidence
- **Stat-bearing OR named-entity-bearing**: numbers, dates, named people/companies/products

Skip:

- Opinions ("This is the best tool")
- Personal anecdotes ("I tried this last week")
- Hypotheticals ("If you were a creator...")
- Aesthetic claims ("This looks clean")

## Source Tier Policy (Article 3 of Constitution)

Every supported claim cites a source from the tiered list:

| Tier | What                                                                       | Trust                     |
| ---- | -------------------------------------------------------------------------- | ------------------------- |
| 1    | Peer-reviewed papers, primary platform analytics, first-party Celavii data | High — auto-pass          |
| 2    | Buffer / Sprout / Socialinsider / vidIQ / Animalz industry studies         | Medium — pass if ≤6mo old |
| 3    | Practitioner blogs (Welsh / Hormozi / etc.) — only with attribution        | Low — flag for review     |
| 0    | Generated content, content farms, no clear author                          | Reject                    |

## Verdict Classes

| Verdict          | Meaning                                   | Gate C action                      |
| ---------------- | ----------------------------------------- | ---------------------------------- |
| **Supported**    | Tier-1 or Tier-2 source ≤6mo old confirms | Pass                               |
| **Inconclusive** | No source found OR source ambiguous       | Warn — request author add citation |
| **Refuted**      | Tier-1/2 source contradicts               | Fail — must revise                 |
| **Stale**        | Source >12mo old, may be outdated         | Warn — request fresh source        |
| **Hallucinated** | RefChecker flag + no source found         | Fail (hard)                        |

## Output Schema

`content/social/research/{post-id}-citations.md`:

```markdown
## Fact-Check Report — celavii-ig-001

**Overall**: PASS (4/5 claims supported, 1 inconclusive)
**Run at**: 2026-04-28T15:00:00Z

### Claim 1 — Supported

> "TikTok median ER is 3.7% in 2026"

- **Source (T1)**: https://www.digitalinformationworld.com/2026/03/2026-social-media-benchmark-tiktok.html
- **Date**: 2026-03 (current)
- **Confidence**: 0.92
- **Evidence quote**: "TikTok median engagement rate hit 3.70% (+49% YoY)..."

### Claim 2 — Inconclusive

> "Most marketers waste 40% of their time on dashboard switching"

- **Source**: not found
- **Recommendation**: provide attribution OR remove claim
- **Suggested rewrite**: "Anecdotally, multi-tool fatigue is widely reported"

[...]

### Citations file

| Claim | URL                                                                | Tier | Date    |
| ----- | ------------------------------------------------------------------ | ---- | ------- |
| 1     | https://digitalinformationworld.com/...                            | T1   | 2026-03 |
| 3     | https://buffer.com/resources/state-of-social-media-engagement-2026 | T2   | 2026-02 |
```

## Tools Used

| Tool                        | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `web_search` (Brave)        | Find candidate evidence URLs                  |
| `web_fetch` (Firecrawl)     | Retrieve full source content for verification |
| Local LLM (Sonnet)          | Decomposition + verdict judgment              |
| Cross-model verifier (Opus) | Critic pass on verdict (cross-model rule)     |

## Integration

- Called by `social-quality` Gate C as a sub-step
- Called by `/social_curate` weekly cycle for every script + brief
- Outputs feed `state.gates.C.per_post[].factcheck`
- Citation doc accompanies the brief in handoff bundles

## References

- `references/decomposition-prompt.md` — atomic claim extraction prompt (Phase B14.1)
- `references/refchecker-integration.md` — how to invoke amazon-science/RefChecker (Phase B14.1)
- `references/source-tier-list.md` — full Tier 1/2/3 catalog with examples
- `references/loki-graph.md` — port of OpenFactVerification topology

## Status

- [x] SKILL.md scaffold (this file) — Phase B14 contract
- [ ] `scripts/factcheck.py` — Loki-style pipeline (Phase B14.1)
- [ ] RefChecker integration (Phase B14.1)
- [ ] Source tier classifier (Phase B14.1)
- [ ] Smoke test against 5 published Celavii blog posts (Phase B14.2)
