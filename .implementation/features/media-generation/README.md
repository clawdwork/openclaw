# Media Content Generation — Reference Knowledge Base

> Extracted from source documentation for use in building the `media-content` agent skills.
> **Target pipeline**: Gemini 3 Pro (image) → seed images → Veo 3 / Sora 2 (video)

---

## Document Index

| File                                                                     | Content                                                                                                                                                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [PROPOSAL.md](PROPOSAL.md)                                               | Implementation proposal — architecture, phases, agent config, skill structure, workspace design (validated)                                                                           |
| [PROPOSAL-TRACKER.md](PROPOSAL-TRACKER.md)                               | Step-by-step tracker — 68 steps across 5 phases with status checkboxes                                                                                                                |
| [01-image-prompting-fundamentals.md](01-image-prompting-fundamentals.md) | Core image prompting principles — structure, weighting, prompt length, detail layering (model-agnostic)                                                                               |
| [02-visual-asset-reference.md](02-visual-asset-reference.md)             | Exhaustive reference tables — cameras, lenses, film stocks, lighting, composition, color grading, shot types, motion, depth of field                                                  |
| [03-video-prompting-fundamentals.md](03-video-prompting-fundamentals.md) | Video prompting for Veo 3 & Sora 2 — platform rules, dialogue formatting, duration, action-in-beats, continuity, Scenebuilder                                                         |
| [04-character-consistency.md](04-character-consistency.md)               | Master Descriptor Protocol — Visual & Vocal character sheets, shot splitting, visual anchors, multi-character scenes                                                                  |
| [05-commercial-styles.md](05-commercial-styles.md)                       | Commercial ad genres — Outdoor/Adventure, Health/Wellness, Futuristic Tech, Cinematic Product Showcase, Fresh Market, Mood Boards, Food/Beverage Photography, Brand Identity Workflow |
| [06-prompt-examples.md](06-prompt-examples.md)                           | Curated example prompts for image and video generation across multiple genres and styles                                                                                              |
| [07-persona-patterns.md](07-persona-patterns.md)                         | System prompt architecture patterns distilled from existing creative personas (Chain-of-Thought, OBSERVE→REASON→ACT)                                                                  |

---

## Source Material Inventory

### Already-Processed Markdown (from `/Downloads/midjourney/`)

- `1_Core_Prompting_Principles.md` — Veo 3 prompt anatomy
- `2_Character_Consistency_Protocol.md` — Master Descriptor Protocol
- `3_Narrative_Continuity_And_Shot_Splitting.md` — Every Prompt is an Island
- `4_Advanced_Techniques_And_Troubleshooting.md` — Implicit Director, troubleshooting
- `5_Commercial_And_Ad_Styles.md` — Ad genre patterns
- `6_Visual_And_Cinematic_Vocabulary.md` — Director's Lexicon quick-reference
- `Sora2_Prompting_Guide.md` — Sora 2 API params, remix workflow
- `Visual_Asset_Definitions.md` — Midjourney V6 photorealistic cheat sheet

### Persona TypeScript Files (from `/Downloads/personas/`)

- `creative-director.ts` — Character consistency, shot splitting, visual anchors
- `inspiration.ts` — Creative catalyst, style mashups, trending aesthetics
- `photorealism.ts` — Camera/lens matching, prompt formulas, troubleshooting
- `technical.ts` — Describe/Diagnose/Specify, lighting ratios, color temperature
- `video-director.ts` — Six Key Aspects, action-in-beats, duration strategy

### PDF Extractions (from `/Downloads/Inspiration/`)

- Flow Introduction — Veo 3 Scenebuilder tutorial (Text-to-Video, Frames-to-Video, Ingredients-to-Video)
- Veo 3 Prompt Guide — Eight Essentials framework
- VEO3 Automated Prompt Generator — ChatGPT automation patterns
- VEO3 Prompts Early Access — 50 cinematic prompt pack
- Viral Veo3 Starter Prompts — Tested viral prompts with continuity chains
- Google Veo 3 Cinematic Product Ad Prompts — Skincare, Tech, Cinematic, Market themes
- Midjourney Photorealistic CheatSheet — Visual asset definitions (PDF version)

### PDF Extractions (from `/Downloads/Midjourney-Files/`)

- Midjourney V6 Prompting — Text prompts, image prompts, parameters, structure
- Midjourney Prompt Structuring — Structured vs unstructured comparison
- Midjourney V6 Parameters — Aspect ratio, stylize, chaos, no, repeat, version, tile, weird, style raw
- Why Details Matter — Progressive detail layering demonstration
- Creating Photorealistic Images — Camera, lens, DoF, lighting, perspective selection
- 5 Stupidly Simple Tips — Explore page, /describe, powerful words
- Time Saving Features — /describe, --repeat, permutation prompts, --tile, /prefer suffix
- Reviewing /shorten Feature — Token weighting analysis, prompt condensation
- Midjourney Upscaling — 2x/4x resolution, DPI, pixel density
- Midjourney Weird Parameter — --weird 0-3000 progression guide
- Midjourney Ristra ChatGPT — Extended ChatGPT integration
- Style Reference Guide — --sref, --sw parameters, weighted multi-style blending
- Everything About Midjourney V6 — V5.2→V6 comparison, text generation, coherence
- Mood Board Exploration — Style exploration techniques
- Ultimate Midjourney Cheat Sheet — Commands, parameters, interface, prompt elements
- ChatGPT System Prompt (docx) — Midjourney Visual Creator GPT instructions

---

## Key Constraints

- **No Midjourney**: We use Gemini 3 Pro for image generation, not Midjourney. The image prompting knowledge is model-agnostic.
- **Video models**: Veo 3 (primary), Sora 2 (secondary). Platform-specific rules apply.
- **Pipeline**: Images generated first as seed frames → fed into video models for motion.
- **No IP references**: All models reject copyrighted character/show/movie names.
- **Stateless AI**: Every prompt must be self-contained. No memory between generations.
