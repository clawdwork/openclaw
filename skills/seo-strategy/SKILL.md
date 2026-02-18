---
name: seo-strategy
description: Complete top-to-bottom SEO strategy — 5-phase pipeline producing strategy report, content briefs, and technical checklist
argument-hint: "<domain>"
---

# /seo_strategy

Run a complete SEO strategy engagement. Chains all tools across 5 phases: Discover → Analyze → Prioritize → Plan → Deliver.

**Full instructions:** Read `skills/seo/commands/seo-strategy.md` for the complete process, tools, state file schema, and output templates.

## Quick Reference

- **Input:** `<domain>` (e.g. `maxkickusa.com`)
- **Time:** 60-90 minutes (autonomous, no prompts)
- **Cost:** ~$3.25 in Apify calls
- **Output:**
  - Strategy report (`seo-strategy-{domain}-{date}.md`)
  - Content briefs (`content-briefs-{domain}-{date}.md`)
  - Technical checklist (`technical-fixes-{domain}-{date}.md`)
  - State file (`strategy-state.json`)

## Phases

1. **DISCOVER** — site audit, crawl, authority metrics, technical issues
2. **ANALYZE** — keywords, competitors, trends, SERP, autocomplete
3. **PRIORITIZE** — score opportunities, group by theme, rank
4. **PLAN** — content silos, publication calendar, cannibalization check
5. **DELIVER** — compile strategy report, briefs, technical checklist

## Resume

Re-run `/seo_strategy <domain>` to resume from last checkpoint or refresh quarterly.
