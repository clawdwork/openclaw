---
name: brand-identity
description: >
  Provides the single source of truth for brand guidelines, design tokens, 
  technology choices, and voice/tone. Use this skill whenever generating UI 
  components, styling applications, writing copy, or creating user-facing 
  assets to ensure brand consistency. Invoked automatically by @generating-proposal-documents.
---

# Brand Identity & Guidelines

**Brand Name:** [INSERT BRAND NAME HERE]

This skill defines the core constraints for visual design and technical implementation for the brand. You must adhere to these guidelines strictly to maintain consistency.

## Reference Documentation

Depending on the task you are performing, consult the specific resource files below. Do not guess brand elements; always read the corresponding file.

### For Visual Design & UI Styling

If you need exact colors, fonts, border radii, or spacing values, read:
👉 **[`resources/design-tokens.json`](resources/design-tokens.json)**

### For Coding & Component Implementation

If you are generating code, choosing libraries, or structuring UI components, read the technical constraints here:
👉 **[`resources/tech-stack.md`](resources/tech-stack.md)**

### For Copywriting & Content Generation

If you are writing marketing copy, error messages, documentation, or user-facing text, read the persona guidelines here:
👉 **[`resources/voice-tone.md`](resources/voice-tone.md)**

---

## Quick Reference

### Primary Colors

- **Primary**: See `design-tokens.json` → `colors.primary`
- **Secondary**: See `design-tokens.json` → `colors.secondary`
- **Background**: See `design-tokens.json` → `colors.background`

### Typography

- **Headings**: See `design-tokens.json` → `typography.font_family_headings`
- **Body**: See `design-tokens.json` → `typography.font_family_body`

### Tech Stack Summary

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS (mandatory)
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts

---

## Integration with Other Skills

This skill is automatically referenced by:

- `@generating-proposal-documents` — pulls design tokens for proposals
- Any UI generation task — ensures brand consistency

When `@brand-identity` is invoked alongside another skill, this skill's constraints take **precedence** for all visual and copy decisions.
