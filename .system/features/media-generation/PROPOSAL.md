# Media Content Agent — Implementation Proposal

> **Status**: Draft (validated against architecture 2026-02-09)  
> **Author**: System Architect  
> **Date**: 2026-02-09  
> **Location**: `.system/features/media-generation/`  
> **Validated against**: `agents.md`, `skills.md`, `org-structure.md`, `README.md`, `VALUES.md`, `skill-creator/SKILL.md`  
> **Tracker**: [PROPOSAL-TRACKER.md](PROPOSAL-TRACKER.md) (68 steps across 5 phases)

---

## Executive Summary

Commission a new **`media-content`** domain sub-agent that orchestrates AI-powered image, video, and audio generation. The agent uses knowledge skills to craft optimized prompts, execution skills to generate media, and a per-project workspace to accumulate brand assets, feedback, and style preferences over time.

**Agent model**: `google/gemini-3.1-pro-preview` (primary), `google/gemini-3-flash-preview` (fallback / test baseline)  
**Image execution**: Gemini 3 Pro via `nano-banana-pro` (exists)  
**Video execution**: Veo 3, Sora 2 (future — Phase 3)  
**Audio execution**: MiniMax via Replicate, ElevenLabs (future — Phase 3)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     MEDIA CONTENT AGENT                           │
│               Model: google/gemini-3.1-pro-preview (or Flash)        │
│               ID: media-content                                   │
│               Identity: 🎬 Media                                  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  KNOWLEDGE SKILLS (how to prompt)                  Phase 1   │ │
│  │  ├── media-content/image-prompting                           │ │
│  │  ├── media-content/video-prompting                           │ │
│  │  ├── media-content/character-consistency                     │ │
│  │  ├── media-content/commercial-styles                         │ │
│  │  └── media-content/creative-direction                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  EXECUTION SKILLS (what generates)                           │ │
│  │  ├── nano-banana-pro    Gemini 3 Pro image gen       ✅ Now  │ │
│  │  ├── veo3-gen           Veo 3 / 3.1 video gen       🔜 Ph3  │ │
│  │  ├── sora2-gen          Sora 2 video gen             🔜 Ph3  │ │
│  │  ├── minimax-voice      MiniMax via Replicate        🔜 Ph3  │ │
│  │  └── sag                ElevenLabs TTS               ✅ Now  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  PROJECT WORKSPACE (persistent context)              Phase 2  │ │
│  │  projects/{project}/media/                                    │ │
│  │  ├── sources/         Brand assets, logos, reference photos   │ │
│  │  ├── generated/                                               │ │
│  │  │   ├── approved/    User-approved outputs ✅ + prompts      │ │
│  │  │   ├── rejected/    User-rejected outputs ❌ + feedback     │ │
│  │  │   └── drafts/      Work in progress                        │ │
│  │  ├── characters/      Master Descriptor sheets                │ │
│  │  ├── prompts/         Prompt log (prompt → result → rating)   │ │
│  │  └── config.md        Project style profile                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Coordinator Routing

```
Flash (coordinator) receives user message
        │
        ├── Media generation task? ──▶ Spawn Media Content Agent
        │   (image, video, mood board, product shot, character design,
        │    commercial ad, visual asset, brand identity visual)
```

### Agent Config (openclaw.json)

```json
{
  "id": "media-content",
  "name": "Media Content",
  "model": {
    "primary": "google/gemini-3.1-pro-preview",
    "fallbacks": ["google/gemini-3-flash-preview"]
  },
  "identity": { "name": "Media", "emoji": "🎬" },
  "skills": [
    "media-content/image-prompting",
    "media-content/video-prompting",
    "media-content/character-consistency",
    "media-content/commercial-styles",
    "media-content/creative-direction",
    "nano-banana-pro",
    "sag"
  ]
}
```

> **Note**: Skills filter uses explicit skill names (no glob patterns). The gateway resolves
> each entry via `resolveAgentSkillsFilter()` in `src/agents/agent-scope.ts` using exact string match.

**Session type**: Ephemeral (like Marketing, Sales, Product — no persistent memory; project context lives in the workspace).

### Context Injection (3-Layer)

```
Layer 1: TOOLS.md
  → Add media-content file routing:
    "Media agents: save generated assets to ~/org/shared/projects/{project}/media/generated/drafts/
     Save approved assets to ~/org/shared/projects/{project}/media/generated/approved/
     Save character sheets to ~/org/shared/projects/{project}/media/characters/
     Read ~/org/shared/projects/{project}/media/MEDIA-CONFIG.md for project style preferences."
  → Backward compat: ~/agent-workspace/projects/ symlinks to ~/org/shared/projects/

Layer 2: agents.list config (above)
  → Model: google/gemini-3.1-pro-preview (primary), Flash (fallback)
  → Skills: 5 knowledge + 2 execution (explicit names, no globs)
  → Identity: 🎬 Media

Layer 3: Task field (per-spawn from coordinator)
  → "Read skills/media-content/image-prompting/SKILL.md.
     Create a product shot for Max Kick energy drink can (2.75 inch).
     Read ~/org/shared/projects/max-kick/media/MEDIA-CONFIG.md for brand style.
     Use nano-banana-pro to generate the image.
     Save to ~/org/shared/projects/max-kick/media/generated/drafts/"
```

---

## Phase 1: Knowledge Skills

**Goal**: Create the 5 knowledge skills that teach the agent how to craft optimized prompts. No code changes — skills only.

**Source material**: The 7 consolidated reference docs already created in this directory.

### Skill Creation Workflow

Per the `/architecture` New Skill Checklist and `skill-creator/SKILL.md`:

1. **Create in repo** (source of truth): `skills/media-content/{skill}/SKILL.md`
2. **Copy to managed dir** (runtime): `cp -r skills/media-content ~/agent-workspace/skills/media-content`
3. **Verify symlink**: `ls ~/.openclaw/skills/media-content/`
4. **Update architecture docs**: See § Architecture Documentation Updates below

### Skill 1: `media-content/image-prompting`

**Triggers**: image generation, photo, picture, visual, portrait, product shot, editorial  
**Source**: `01-image-prompting-fundamentals.md`, `02-visual-asset-reference.md`

```
image-prompting/
├── SKILL.md                         ← ~300 lines
│   Core workflow:
│   1. Analyze user intent (what, who, where, why, mood)
│   2. Select prompt formula (photorealistic, character, cinematic, etc.)
│   3. Choose equipment (camera + lens matched to scenario)
│   4. Layer detail progressively (subject → environment → lighting → technical)
│   5. Apply physical format specs if user specifies dimensions
│   6. Execute via nano-banana-pro
│   7. Offer 2-3 alternative directions
│
└── references/
    ├── visual-assets.md             ← Cameras, lenses, film stocks, lighting, composition tables
    │                                   (from 02-visual-asset-reference.md — too large for SKILL.md)
    └── dimensions-formats.md        ← Physical format specs: banners, cans, print, digital, apparel
                                        (from 01 § User-Defined Dimensions)
```

### Skill 2: `media-content/video-prompting`

**Triggers**: video, clip, motion, animation, commercial, reel, short, Veo, Sora  
**Source**: `03-video-prompting-fundamentals.md`

```
video-prompting/
├── SKILL.md                         ← ~350 lines
│   Core workflow:
│   1. Determine platform (Veo 3 vs Sora 2) and constraints
│   2. Apply Six Key Aspects framework (Shot, Scene, Action, Characters, Camera, Audio)
│   3. Structure action in beats (2-3 per 8-sec clip)
│   4. Format dialogue per platform rules (Veo 3: "says:" format, no quotes)
│   5. Plan duration strategy (content complexity → clip length)
│   6. Execute via appropriate execution skill
│   7. For multi-shot: plan continuity with repeated descriptors
│
└── references/
    ├── veo3-rules.md                ← Veo 3 specifics: Scenebuilder, dialogue format, 200-word limit
    └── sora2-rules.md               ← Sora 2 specifics: API params, remix workflow, image input
```

### Skill 3: `media-content/character-consistency`

**Triggers**: character, consistency, recurring character, series, multi-shot, sequence, descriptor  
**Source**: `04-character-consistency.md`

```
character-consistency/
└── SKILL.md                         ← ~250 lines
    Core workflow:
    1. Create Visual Character Sheet (age, face, hair, eyes, wardrobe, props, marks)
    2. Create Vocal Character Sheet if video (voice quality, tone, pace, accent)
    3. Enforce "Every Prompt is an Island" — full descriptor in EVERY prompt
    4. Define Visual Anchors (color motif, prop, lighting pattern)
    5. For multi-shot: split into shots varying only action + camera
    6. Store character sheets in ~/org/shared/projects/{project}/media/characters/
    7. Never paraphrase — copy-paste verbatim between prompts
```

### Skill 4: `media-content/commercial-styles`

**Triggers**: ad, commercial, brand, product ad, campaign visual, mood board, food photo, packaging  
**Source**: `05-commercial-styles.md`

```
commercial-styles/
├── SKILL.md                         ← ~300 lines
│   Core workflow:
│   1. Identify genre (Outdoor, Wellness, Tech, Cinematic, Market, Mood Board, Food, Brand Identity)
│   2. Load genre-specific vocabulary bank + sound design palette
│   3. Apply product prompt template (suspended, macro, rotation, lifestyle, unboxing)
│   4. For mood boards: multi-panel grid with color swatches + product shots
│   5. For brand identity projects: follow 5-step workflow (concept → formula → variations → consistency → iterate)
│   6. Consider platform (TikTok 9:16, YouTube, Instagram, landscape 16:9)
│
└── references/
    └── genre-templates.md           ← Per-genre vocabulary banks, sound design palettes, prompt templates
                                        (Outdoor, Wellness, Tech, Cinematic, Market, Food, Mood Board)
```

### Skill 5: `media-content/creative-direction`

**Triggers**: inspiration, ideas, creative, alternatives, style mashup, explore, brainstorm  
**Source**: `07-persona-patterns.md`, `06-prompt-examples.md`

```
creative-direction/
├── SKILL.md                         ← ~250 lines
│   Core workflow:
│   1. Analyze user's starting point (reference image, brief, or concept)
│   2. Use OBSERVE → REASON → ACT thinking pattern
│   3. Generate minimum 3 radically different creative directions
│   4. For each direction: style, mood, technical approach, example prompt
│   5. If reference image provided: extract composition, palette, equipment, mood
│   6. Suggest unexpected combinations (genre mashups, trending aesthetics)
│   7. Iterate based on user feedback
│
└── references/
    └── prompt-examples.md           ← Curated example prompts across genres (action, sci-fi, comedy,
                                        drama, product, portrait, editorial, character study, viral)
```

### Command Templates

```
media-content/commands/
├── generate-image.md        ← "Generate an image for [brief]"
├── generate-video.md        ← "Create a video prompt for [brief]"
├── mood-board.md            ← "Create a mood board for [brand/concept]"
├── product-shoot.md         ← "Design a product shot for [product]"
├── character-sheet.md       ← "Build a character descriptor for [character]"
└── shot-sequence.md         ← "Plan a multi-shot sequence for [concept]"
```

### Phase 1 Deliverables

| Deliverable         | Files        | Est. Lines |
| ------------------- | ------------ | ---------- |
| 5 SKILL.md files    | 5            | ~1,450     |
| 5 reference files   | 5            | ~1,200     |
| 6 command templates | 6            | ~300       |
| **Total**           | **16 files** | **~2,950** |

### Phase 1 Success Criteria

- Agent can craft a high-quality image prompt from a text brief
- Agent can craft a video prompt following Veo 3 / Sora 2 rules
- Agent can create and maintain character descriptors across a sequence
- Agent offers multiple creative directions per request
- Agent executes image generation via `nano-banana-pro`
- Agent respects physical dimension specifications (banners, cans, etc.)

---

## Phase 2: Workspace Commissioning + Feedback Loop

**Goal**: Per-project media workspace with asset management, feedback tracking, and style accumulation.

### Workspace Structure

Canonical path: `~/org/shared/projects/{project-name}/media/`  
Backward compat: `~/agent-workspace/projects/{project-name}/media/` (via symlink)

```
~/org/shared/projects/{project-name}/media/
├── sources/                    ← Brand assets uploaded by user
│   ├── logos/                  ← Logo files (SVG, PNG, etc.)
│   ├── brand-guide/            ← Brand guidelines docs
│   └── references/             ← Reference images/videos from user
│
├── generated/
│   ├── approved/               ← Auto-moved when user approves ✅
│   │   └── {timestamp}-{name}.png  (+ {timestamp}-{name}.prompt.md)
│   ├── rejected/               ← Auto-moved when user rejects ❌
│   │   └── {timestamp}-{name}.png  (+ {timestamp}-{name}.feedback.md)
│   └── drafts/                 ← Initial generation output
│       └── {timestamp}-{name}.png  (+ {timestamp}-{name}.prompt.md)
│
├── characters/                 ← Master Descriptor sheets
│   ├── {character-name}.md     ← Visual + Vocal sheets
│   └── ...
│
├── prompts/
│   └── prompt-log.md           ← Running log: prompt → result → rating → feedback
│
└── MEDIA-CONFIG.md             ← Project media style profile
```

> **Naming**: Uses `MEDIA-CONFIG.md` (not `config.md`) to follow the existing project convention where
> `PROJECT.md` is the project manifest. `MEDIA-CONFIG.md` is a domain-specific companion file,
> clearly scoped to the media workspace. Read by the agent via TOOLS.md file routing rules.

### MEDIA-CONFIG.md Template

```markdown
# Media Config — {Project Name}

## Brand Colors

- Primary: #XXXXXX
- Secondary: #XXXXXX
- Accent: #XXXXXX

## Preferred Aesthetic

- Photography style: [editorial/cinematic/documentary/etc.]
- Camera preference: [e.g., Leica M10-R for editorial feel]
- Film stock: [e.g., Kodak Portra for warm tones]
- Lighting: [e.g., natural, golden hour, dramatic side-lit]
- Color grading: [e.g., muted warm tones, high contrast]

## Dimensions / Formats

- Primary format: [e.g., Instagram 1080x1080, Banner 6ft x 2ft]
- Product packaging: [e.g., 2.75 inch aluminum can]

## Characters

- See characters/ directory for Master Descriptor sheets

## Style Notes

- [Accumulated from feedback — what works, what doesn't]
- [e.g., "Client prefers warmer tones over cool/clinical"]
- [e.g., "Avoid extreme close-ups — mid-shot minimum"]
```

### Feedback Auto-Move Mechanism

When the user provides feedback on a generated asset:

```
User: "This is great, approve it"
  → Agent moves file from drafts/ → approved/
  → Agent copies the prompt that generated it alongside as .prompt.md
  → Agent appends to prompt-log.md: ✅ {prompt summary} → {filename}

User: "This is too warm, the lighting is wrong — reject"
  → Agent moves file from drafts/ → rejected/
  → Agent creates .feedback.md: "Too warm, lighting is wrong"
  → Agent appends to prompt-log.md: ❌ {prompt summary} → {filename} → "too warm, lighting wrong"
  → Agent updates MEDIA-CONFIG.md style notes: "Avoid overly warm lighting for this project"
```

### Workspace Commissioning

Triggered when a new project needs media capabilities. Can be initiated by:

- Coordinator task: `"Commission a media workspace for project Max Kick"`
- Manual: User asks the media-content agent to set up the workspace

The agent:

1. Creates the directory structure under `~/org/shared/projects/{project}/media/`
2. Creates `MEDIA-CONFIG.md` from a template, populated with any known brand info
3. Prompts user for brand assets to add to `sources/`
4. Records character descriptors if characters are defined

**Team member provisioning**: When a new team member agent is provisioned (via workspace-wizard), the media workspace for their assigned projects is included in their workspace config via Docker bind mounts (per `org-structure.md` § Granular Project Access). All team members working on the same project share the same `~/org/shared/projects/{project}/media/` directory.

**Member agent spawning**: `media-content` must be added to `subagents.allowAgents` for any member agents who need media generation capabilities. Per `org-structure.md`, the current member default is `["marketing", "sales", "product", "dev-coder", "grunt"]` — update to include `"media-content"`.

### Phase 2 Deliverables

| Deliverable         | Description                                        |
| ------------------- | -------------------------------------------------- |
| Workspace template  | Directory structure + MEDIA-CONFIG.md template     |
| Feedback commands   | approve/reject flow with auto-move                 |
| TOOLS.md update     | Media file routing rules                           |
| Agent config update | Add `media-content` to `openclaw.json` agents.list |
| AGENTS.md update    | Add media-content routing entry                    |
| Prompt log format   | Standardized prompt → result → feedback log        |

### Phase 2 Success Criteria

- New projects can be commissioned with a media workspace
- Generated assets are tracked with their source prompts
- User feedback (approve/reject) auto-moves files and logs feedback
- Agent reads MEDIA-CONFIG.md + approved/ history to inform future generations
- Style preferences accumulate over time via feedback loop
- Team members share project media workspaces

---

## Phase 3: Execution Skills (Future)

**Goal**: Add video and audio generation execution skills, mirroring `nano-banana-pro` pattern.

### 3A: Video Generation Skills

| Skill       | Backend            | API Key                        | Script                      |
| ----------- | ------------------ | ------------------------------ | --------------------------- |
| `veo3-gen`  | Google Veo 3 / 3.1 | `GEMINI_API_KEY` or Flow token | `scripts/generate_video.py` |
| `sora2-gen` | OpenAI Sora 2      | `OPENAI_API_KEY`               | `scripts/generate_video.py` |

**Pattern**: Mirror `nano-banana-pro` exactly:

- Python script with `--prompt`, `--filename`, `--resolution` flags
- SKILL.md with usage examples and API key config
- Script prints `MEDIA:` line for chat provider auto-attach
- Support `--duration` flag (5/8/10/15/20 sec)
- Support `--aspect` flag (16:9, 9:16, 1:1)

**Veo 3 specifics**:

- Scenebuilder support: `--continuity-frame` flag to pass a reference frame
- Dialogue: prompt must use `says:` format (enforced by video-prompting skill)
- Max 8 seconds per clip

**Sora 2 specifics**:

- API params: `model`, `size`, `seconds`, `n`
- Image input: `--reference-image` flag for first-frame seeding
- Remix: `--remix` flag to re-generate with modified prompt

### 3B: Audio / Voice Skills

| Skill            | Backend               | API Key               | Capabilities                                            |
| ---------------- | --------------------- | --------------------- | ------------------------------------------------------- |
| `minimax-voice`  | MiniMax via Replicate | `REPLICATE_API_TOKEN` | Voice cloning, audio generation, custom narrator voices |
| `sag` (existing) | ElevenLabs            | `ELEVENLABS_API_KEY`  | TTS, voice library                                      |

**MiniMax via Replicate**:

- Voice cloning: provide reference audio → clone voice → generate speech
- Audio generation: music, sound effects, ambient audio
- Integration with Vocal Character Sheets from character-consistency skill
- Script: `scripts/clone_voice.py`, `scripts/generate_audio.py`

**Audio workspace extension**:

```
~/org/shared/projects/{project}/media/
├── audio/
│   ├── voices/           ← Cloned voice models / reference clips
│   ├── generated/        ← Generated audio files
│   └── music/            ← Background music / soundscapes
```

### Phase 3 Deliverables

| Deliverable               | Scope                                             |
| ------------------------- | ------------------------------------------------- |
| `veo3-gen` skill          | SKILL.md + Python script + API wiring             |
| `sora2-gen` skill         | SKILL.md + Python script + API wiring             |
| `minimax-voice` skill     | SKILL.md + Python scripts (clone + generate)      |
| Audio workspace extension | `audio/` directory structure in project workspace |
| Skills filter update      | Add new execution skills to agent config          |

### Phase 3 Prerequisites

- Veo 3 / 3.1 API access (currently Flow UI only — may need API availability)
- Sora 2 API key
- Replicate API token for MiniMax
- User-provided MiniMax/Replicate documentation for voice cloning specifics

---

## Implementation Order

| Phase        | Scope                                                                                       | Dependencies                            | Est. Effort    |
| ------------ | ------------------------------------------------------------------------------------------- | --------------------------------------- | -------------- |
| **Phase 1**  | 5 knowledge skills + references + commands (repo + managed dir)                             | None — skills only                      | 1 session      |
| **Phase 1b** | Architecture doc updates (agents.md, skills.md, README.md, VALUES.md, CHANGELOG.md)         | Phase 1 complete                        | 30 min         |
| **Phase 2**  | Workspace commissioning, feedback loop, agent config, routing, TOOLS.md, member allowAgents | Phase 1b complete                       | 1–2 sessions   |
| **Phase 3A** | `veo3-gen` + `sora2-gen` execution skills                                                   | API access, mirror nano-banana-pro      | 1 session each |
| **Phase 3B** | `minimax-voice` skill                                                                       | Replicate API token, user documentation | 1 session      |

---

## Model Selection Strategy

### Primary: Gemini 3.0 Pro

| Advantage          | Why It Matters                                        |
| ------------------ | ----------------------------------------------------- |
| Multimodal input   | Natively analyzes reference images users provide      |
| Creative reasoning | Better at subjective visual composition decisions     |
| Same model family  | Tighter alignment with Gemini 3 Pro image gen backend |
| Longer context     | Handles large character descriptors + project config  |

### Testing with Flash First

Before committing to Pro costs, test whether Flash + detailed SKILL.md documentation produces comparable prompt quality:

1. Create all Phase 1 skills with Flash as the agent model
2. Run 20 test generations across different genres (portrait, product, commercial, character)
3. Compare prompt quality and output quality vs Pro
4. If Flash is ≥90% as good → keep Flash as primary (significant cost savings)
5. If Pro is notably better → switch to Pro for creative tasks

### Config

```json
{
  "model": {
    "primary": "google/gemini-3.1-pro-preview",
    "fallbacks": ["google/gemini-3-flash-preview"]
  }
}
```

Start with Flash as primary for testing, swap to Pro if needed.

### Cost Comparison

Per `README.md` § Model Hierarchy:

| Model          | Cost/1M Input | Cost/1M Output | Typical Media Task (~2K in, ~1K out) |
| -------------- | ------------- | -------------- | ------------------------------------ |
| **Flash**      | $0.50         | $3.00          | ~$0.004                              |
| **Pro**        | $2.00         | $12.00         | ~$0.016                              |
| **Difference** | 4x more       | 4x more        | **~4x per task**                     |

At 50 media tasks/day: Flash ≈ $0.20/day ($6/mo), Pro ≈ $0.80/day ($24/mo).  
Image generation cost (nano-banana-pro via Gemini API) is separate and identical regardless of agent model.

---

## Reference Documentation Index

All source knowledge for the skills lives in this directory:

| Doc                                  | Content                                             | Maps To                                            |
| ------------------------------------ | --------------------------------------------------- | -------------------------------------------------- |
| `01-image-prompting-fundamentals.md` | Prompt structure, weighting, formulas, dimensions   | `image-prompting` SKILL.md                         |
| `02-visual-asset-reference.md`       | Cameras, lenses, film stocks, lighting, composition | `image-prompting/references/visual-assets.md`      |
| `03-video-prompting-fundamentals.md` | Veo 3 + Sora 2 rules, Six Key Aspects, beats        | `video-prompting` SKILL.md + references            |
| `04-character-consistency.md`        | Master Descriptor Protocol, shot splitting          | `character-consistency` SKILL.md                   |
| `05-commercial-styles.md`            | Ad genres, mood boards, food, brand identity        | `commercial-styles` SKILL.md + references          |
| `06-prompt-examples.md`              | Curated prompts across genres                       | `creative-direction/references/prompt-examples.md` |
| `07-persona-patterns.md`             | System prompt architecture, OBSERVE→REASON→ACT      | `creative-direction` SKILL.md                      |

---

## Architecture Documentation Updates (Phase 1b)

Required per `/architecture` workflow when adding a new domain agent + skills:

| File                 | Section                        | Update                                                                                                                                  |
| -------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `agents.md`          | § Task Routing                 | Add `├── Media content task? ──▶ Spawn Media Content Agent (Pro)`                                                                       |
| `agents.md`          | § Domain Sub-Agent Definitions | Add row: Media Content \| media-content \| Pro \| Image/video/audio prompt crafting \| Ephemeral                                        |
| `agents.md`          | § When to Use Sub-Agents       | Add rows: Image generation, Video prompting, Mood board, Product shot, Character design                                                 |
| `agents.md`          | § Multi-Coordinator diagram    | Add `media-content` to shared domain agents list                                                                                        |
| `README.md`          | § Overview diagram             | Change `8 Specialists` → `9 Specialists`                                                                                                |
| `README.md`          | § Domain Sub-Agent Models      | Add row: Media Content \| Pro \| Creative reasoning, multimodal \| 5 skills, 6 commands                                                 |
| `skills.md`          | § Domain Skills table          | Add `Media Content` category: 5 skills (image-prompting, video-prompting, character-consistency, commercial-styles, creative-direction) |
| `skills.md`          | § Voice & Media                | Add video generation capability (future)                                                                                                |
| `skills.md`          | Access Matrix                  | Update managed skill counts                                                                                                             |
| `VALUES.md`          | § Agent Counts                 | Domain: 8→9, total in agents.list: 13→14                                                                                                |
| `VALUES.md`          | § Skill Counts                 | Managed top-level dirs: 20→21, managed SKILL.md files: 57→62                                                                            |
| `CHANGELOG.md`       | (append)                       | `YYYY-MM-DD \| **Media Content**: New domain agent + 5 knowledge skills for image/video/audio prompt crafting`                          |
| TOOLS.md (workspace) | File Routing                   | Add media-content save paths (see § Context Injection above)                                                                            |

> Run `scripts/arch-verify.sh` before AND after these updates to confirm no drift.

---

## Open Items

- [ ] Confirm Veo 3 API availability (vs Flow UI only) before Phase 3A
- [ ] User to provide MiniMax/Replicate documentation for Phase 3B
- [ ] Decide Flash vs Pro after Phase 1 testing
- [ ] Define which existing projects get commissioned media workspaces first (Max Kick, Celavii, etc.)
- [ ] Add `"media-content"` to member agent `subagents.allowAgents` for relevant team members
- [ ] Run `scripts/arch-verify.sh` after all Phase 1b doc updates
