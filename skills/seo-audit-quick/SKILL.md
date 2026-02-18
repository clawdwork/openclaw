---
name: seo-audit-quick
description: Quick site SEO health check — Lighthouse, broken links, sitemap, schema, content quality in 10 minutes
argument-hint: "<domain>"
---

# /seo-audit-quick

Run a quick SEO health check on any domain. Uses 7 tools to produce a scored assessment covering technical health, content quality, and schema markup.

**Read the full instructions:** `skills/seo/commands/seo-audit.md`

## Quick Usage

```
/seo-audit-quick maxkickusa.com
```

## What It Produces

1. Lighthouse scores (Performance, SEO, Accessibility, Best Practices)
2. Broken link scan (total links, broken count, 404s)
3. Sitemap validation (page count, lastmod, priority)
4. Schema markup detection (JSON-LD types found)
5. Content quality snapshot (headings, word count, meta tags)
6. Robots.txt analysis
7. Scored summary with PASS/WARN/FAIL per category
