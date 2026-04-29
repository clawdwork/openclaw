# NOTICE — Vendored / Adapted Sources

This skill draws on the following upstream sources. Attribution is required by their licenses.

## Pending Vendoring (Phase B13)

### anthropics/knowledge-work-plugins

- **Source**: https://github.com/anthropics/knowledge-work-plugins
- **Path**: `marketing/skills/brand-voice/{discover-brand,brand-voice-enforcement}/SKILL.md`
- **License**: MIT
- **Status**: Scaffolded shell present. Phase B13 will port the SKILL.md content (discover-brand → Mode A, brand-voice-enforcement → Mode B) with attribution preserved.

When Phase B13 lands:

1. Copy SKILL.md content from upstream paths
2. Replace this NOTICE.md with full MIT attribution + commit-SHA pin
3. Add Anthropic copyright line at the top of vendored sections

## Frameworks (Public, Not Vendored)

### NN/g — 4 Dimensions of Tone of Voice

- **Source**: https://www.nngroup.com/articles/tone-of-voice-dimensions/
- **Status**: Industry-standard framework. Encoded as 4 floats in `voice.json`. Not copyrighted as a model.

### Mailchimp — Voice and Tone

- **Source**: https://styleguide.mailchimp.com/voice-and-tone/ + https://github.com/mailchimp/content-style-guide
- **Status**: Public reference. Pattern (voice constant, tone flexes) inspires `tone_by_context` map. Not vendored.
