---
name: product-page-report
description: Full product page SEO pipeline — audit, spec, cluster plan, print-ready PDF proposal
argument-hint: "<url> [competitor1] [competitor2] ..."
---

# /product-page-report

End-to-end product page SEO report. Takes a product URL and produces a client-facing, print-ready PDF proposal.

**Read the full pipeline instructions:** `skills/seo/commands/product-page-report.md`

## Quick Usage

```
/product-page-report https://example.com/products/my-product
```

## What It Produces

1. Phase 0: Pre-audit checks (platform, YMYL, Lighthouse, OOS)
2. Phase 1-3: Research — keyword analysis, competitor gap, content audit
3. Phase 4: Print-ready proposal (Next.js, 8.5"×11" PDF)
4. Phase 4.5: Automated validation (12 checks)
5. Phase 5: Quality critic review
6. Phase 6: Delivery with preview URL

Runs autonomously — single command triggers full pipeline.
