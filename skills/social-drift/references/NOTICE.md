# NOTICE — Vendored / Adapted Sources

## Pending Vendoring (Phase B16)

### claude-seo/skills/seo-drift

- **Source**: https://github.com/agriciDaniel/claude-seo (community fork at `~/dev/research/claude-seo/skills/seo-drift/`)
- **License**: MIT (verify on commit pin)
- **Status**: Scaffolded shell present. Phase B16 will port:
  - SQLite schema (`baselines.db`)
  - 17 comparison rules with severity tiers
  - URL normalization (lowercase, strip ports, sort params, remove UTM, strip trailing slashes)
  - Drift report formatter

### anthropics/knowledge-work-plugins/marketing/skills/brand-voice/brand-voice-enforcement

- **License**: MIT
- **Status**: Used by `social-persona enforce`, called as a sub-step of Mode D (voice-drift). No direct vendoring here.

## Frameworks (Public)

### Reflexion (iteration-cap rationale)

- Shinn et al., 2303.11366 — diminishing returns past 3–5 loops; informs drift-monitor backoff strategy

### Constitutional AI

- Bai et al. — informs the "voice constitution as drift target" model in Mode D

When Phase B16 lands, replace this with full attribution + commit-SHA pin from upstream sources.
