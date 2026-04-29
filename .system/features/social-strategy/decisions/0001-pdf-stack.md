# Decision 0001 — PDF Stack for Phase 6 Reports

> **Status**: Decided
> **Date**: 2026-04-28
> **Driver**: A13 of [social-agents-implementation-proposal.md](../social-agents-implementation-proposal.md)

## Context

Phase 6 of `/social_strategy` produces a print-ready strategy report (10–14 pages). Two stacks were considered:

| Stack                                        | Pros                                                                                                    | Cons                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Next.js print template (clone seo-report-v3) | Polished, on-brand, reusable for client deliverables, designer-friendly                                 | Build step (npm install, dev server), heavier infra, slower iteration |
| weasyprint + matplotlib (claude-seo pattern) | One Python script, no build step, fast iteration, charts inline, post-gen `_review_pdf()` quality check | Less designer flexibility, harder to match Celavii brand fidelity     |

## Decision

**Use weasyprint + matplotlib for v0 (internal/dry-run reports). Defer Next.js print template until first client-facing strategy delivery.**

## Rationale

1. **v0 is internal**: Phase G pilot consumes the PDF for our own review, not clients. Speed > polish.
2. **Cost**: weasyprint adds ~2 hours of script work; Next.js adds ~1–2 days of design/build cycle and a build step that complicates iteration.
3. **Existing pattern**: claude-seo's `scripts/google_report.py` is a vetted blueprint we can fork directly (200 DPI matplotlib charts, A4 output, post-gen review). Reference: [docs/repos.md § 10](../docs/integration-recommendations.md).
4. **Upgrade path is clear**: when we hit "first client-facing social strategy" (post-pilot), clone the seo-report-v3 Next.js template. The data layer (state file → report) doesn't change; only the renderer.

## Implementation Notes (for Phase D12)

- Author `~/dev/openclaw/skills/social-orchestrator/scripts/generate_report.py`
- Reuse claude-seo color palette initially; swap to Celavii brand later
- Charts: matplotlib 3.8+ at 200 DPI, A4 portrait
- Layout: weasyprint 61+, navy/Celavii-blue headers (`#0066FF`), Inter (or fallback) body
- Post-gen: implement `_review_pdf()` that flags empty images, thin sections, duplicate pages
- Output path: `projects/celavii/deliverables/social-strategy-{date}/strategy.pdf`

## Reversal Conditions

Reconsider if any of these become true:

- First client deliverable lands and PDF needs heavy brand fidelity
- weasyprint blocks on a layout we can't reasonably script
- Phase F single-post output starts producing client-facing PDFs (then designer-friendly template wins)
