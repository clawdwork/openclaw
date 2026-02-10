# Media Content Agent — Implementation Tracker

> **Tracks**: [PROPOSAL.md](PROPOSAL.md)  
> **Last Updated**: 2026-02-09 (All phases implemented, 3 tests pending: 2 gateway restart, 1 voice clone audio sample)  
> **Legend**: ⬜ Not started · 🔲 In progress · ✅ Done · ⏸️ Blocked

---

## Phase 1: Knowledge Skills

> Create 5 knowledge skills + references + command templates in repo, then copy to managed dir.

### Skill Creation Workflow

| #   | Step                                                               | Status |
| --- | ------------------------------------------------------------------ | ------ |
| 1.0 | Create `skills/media-content/` directory in repo (source of truth) | ✅     |

### Skill 1: `media-content/image-prompting`

| #    | Step                                                                                             | Status |
| ---- | ------------------------------------------------------------------------------------------------ | ------ |
| 1.1a | Write `SKILL.md` (~300 lines) — prompt structure, formulas, equipment selection, dimensions      | ✅     |
| 1.1b | Write `references/visual-assets.md` — cameras, lenses, film stocks, lighting, composition tables | ✅     |
| 1.1c | Write `references/dimensions-formats.md` — physical format specs (banners, cans, print, digital) | ✅     |

### Skill 2: `media-content/video-prompting`

| #    | Step                                                                                              | Status |
| ---- | ------------------------------------------------------------------------------------------------- | ------ |
| 1.2a | Write `SKILL.md` (~350 lines) — Six Key Aspects, action-in-beats, duration strategy               | ✅     |
| 1.2b | Write `references/veo3-rules.md` — Veo 3 specifics: Scenebuilder, dialogue format, 200-word limit | ✅     |
| 1.2c | Write `references/sora2-rules.md` — Sora 2 specifics: API params, remix workflow, image input     | ✅     |

### Skill 3: `media-content/character-consistency`

| #    | Step                                                                                       | Status |
| ---- | ------------------------------------------------------------------------------------------ | ------ |
| 1.3a | Write `SKILL.md` (~250 lines) — Master Descriptor Protocol, shot splitting, visual anchors | ✅     |

### Skill 4: `media-content/commercial-styles`

| #    | Step                                                                                               | Status |
| ---- | -------------------------------------------------------------------------------------------------- | ------ |
| 1.4a | Write `SKILL.md` (~300 lines) — ad genres, mood boards, brand identity workflow, platform specs    | ✅     |
| 1.4b | Write `references/genre-templates.md` — per-genre vocabulary banks, sound design, prompt templates | ✅     |

### Skill 5: `media-content/creative-direction`

| #    | Step                                                                             | Status |
| ---- | -------------------------------------------------------------------------------- | ------ |
| 1.5a | Write `SKILL.md` (~250 lines) — OBSERVE→REASON→ACT, 3+ directions, style mashups | ✅     |
| 1.5b | Write `references/prompt-examples.md` — curated prompts across genres            | ✅     |

### Command Templates

| #    | Step                                | Status |
| ---- | ----------------------------------- | ------ |
| 1.6a | Write `commands/generate-image.md`  | ✅     |
| 1.6b | Write `commands/generate-video.md`  | ✅     |
| 1.6c | Write `commands/mood-board.md`      | ✅     |
| 1.6d | Write `commands/product-shoot.md`   | ✅     |
| 1.6e | Write `commands/character-sheet.md` | ✅     |
| 1.6f | Write `commands/shot-sequence.md`   | ✅     |

### Deploy to Managed Dir

| #    | Step                                                                     | Status |
| ---- | ------------------------------------------------------------------------ | ------ |
| 1.7a | Copy `skills/media-content/` → `~/agent-workspace/skills/media-content/` | ✅     |
| 1.7b | Verify symlink: `ls ~/.openclaw/skills/media-content/`                   | ✅     |

---

## Phase 1b: Architecture Documentation Updates

> Update system architecture docs to reflect the new domain agent + skills.

| #     | File                 | Section                        | Update                                                                           | Status |
| ----- | -------------------- | ------------------------------ | -------------------------------------------------------------------------------- | ------ |
| 1b.1  | `agents.md`          | § Task Routing                 | Add `├── Media content task? ──▶ Spawn Media Content Agent (Pro)`                | ✅     |
| 1b.2  | `agents.md`          | § Domain Sub-Agent Definitions | Add row: Media Content, media-content, Pro, Ephemeral                            | ✅     |
| 1b.3  | `agents.md`          | § When to Use Sub-Agents       | Add rows: Image gen, Video prompting, Mood board, Product shot, Character design | ✅     |
| 1b.4  | `agents.md`          | § Multi-Coordinator diagram    | Add `media-content` to shared domain agents list                                 | ✅     |
| 1b.5  | `README.md`          | § Overview diagram             | Change `8 Specialists` → `9 Specialists`                                         | ✅     |
| 1b.6  | `README.md`          | § Domain Sub-Agent Models      | Add row: Media Content, Pro, 5 skills, 6 commands                                | ✅     |
| 1b.7  | `skills.md`          | § Domain Skills table          | Add `Media Content` category with 5 skills                                       | ✅     |
| 1b.8  | `skills.md`          | § Voice & Media                | Add video generation capability (future)                                         | ✅     |
| 1b.9  | `skills.md`          | Access Matrix                  | Update managed skill counts                                                      | ✅     |
| 1b.10 | `VALUES.md`          | § Agent Counts                 | Domain: 8→9, total: 13→14                                                        | ✅     |
| 1b.11 | `VALUES.md`          | § Skill Counts                 | Managed dirs: 20→21, SKILL.md files: 57→62                                       | ✅     |
| 1b.12 | `CHANGELOG.md`       | (append)                       | New domain agent + 5 knowledge skills entry                                      | ✅     |
| 1b.13 | TOOLS.md (workspace) | File Routing                   | Add media-content save paths                                                     | ✅     |
| 1b.14 | —                    | Verification                   | Run `scripts/arch-verify.sh` — confirm no drift                                  | ✅     |

---

## Phase 2: Workspace Commissioning + Feedback Loop

> Per-project media workspace with asset management, feedback tracking, and style accumulation.

### Agent Config

| #   | Step                                                                              | Status |
| --- | --------------------------------------------------------------------------------- | ------ |
| 2.1 | Add `media-content` agent entry to `openclaw.json` agents.list                    | ✅     |
| 2.2 | Add `"media-content"` to member `subagents.allowAgents` for relevant team members | ✅     |
| 2.3 | Test agent spawning via coordinator                                               | ⏸️     |

### Workspace Template

| #   | Step                                                                                      | Status |
| --- | ----------------------------------------------------------------------------------------- | ------ |
| 2.4 | Create workspace directory template (`sources/`, `generated/`, `characters/`, `prompts/`) | ✅     |
| 2.5 | Create `MEDIA-CONFIG.md` template                                                         | ✅     |
| 2.6 | Commission workspace for Max Kick project                                                 | ✅     |
| 2.7 | Commission workspace for Celavii project                                                  | ✅     |

### Feedback Loop

| #    | Step                                                        | Status |
| ---- | ----------------------------------------------------------- | ------ |
| 2.8  | Implement approve flow (drafts/ → approved/ + .prompt.md)   | ✅     |
| 2.9  | Implement reject flow (drafts/ → rejected/ + .feedback.md)  | ✅     |
| 2.10 | Implement prompt-log.md append on approve/reject            | ✅     |
| 2.11 | Implement MEDIA-CONFIG.md style notes auto-update on reject | ✅     |

### Routing & Context

| #    | Step                                                                                            | Status |
| ---- | ----------------------------------------------------------------------------------------------- | ------ |
| 2.12 | Update TOOLS.md with media file routing rules                                                   | ✅     |
| 2.13 | Update AGENTS.md with media-content routing entry                                               | ✅     |
| 2.14 | Test end-to-end: user request → coordinator spawn → skill read → nano-banana-pro execute → save | ⏸️     |

---

## Phase 3A: Video Execution Skills (Future)

> Mirror `nano-banana-pro` pattern for video generation.

### `veo3-gen`

| #    | Step                                      | Status |
| ---- | ----------------------------------------- | ------ |
| 3A.1 | Confirm Veo 3 API availability            | ✅     |
| 3A.2 | Write `scripts/generate_video.py` (Veo 3) | ✅     |
| 3A.3 | Write `SKILL.md` with usage examples      | ✅     |
| 3A.4 | Test video generation end-to-end          | ✅     |
| 3A.5 | Add to agent skills filter                | ✅     |

### `sora2-gen`

| #     | Step                                       | Status |
| ----- | ------------------------------------------ | ------ |
| 3A.6  | Confirm Sora 2 API key                     | ✅     |
| 3A.7  | Write `scripts/generate_video.py` (Sora 2) | ✅     |
| 3A.8  | Write `SKILL.md` with usage examples       | ✅     |
| 3A.9  | Test video generation end-to-end           | ✅     |
| 3A.10 | Add to agent skills filter                 | ✅     |

---

## Phase 3B: Audio / Voice Skills (Future)

> Voice cloning and audio generation via MiniMax/Replicate.

### `minimax-voice`

| #     | Step                                                | Status |
| ----- | --------------------------------------------------- | ------ |
| 3B.1  | Receive MiniMax/Replicate documentation from user   | ✅     |
| 3B.2  | Obtain `REPLICATE_API_TOKEN`                        | ✅     |
| 3B.3  | Write `scripts/clone_voice.py`                      | ✅     |
| 3B.4  | Write `scripts/generate_speech.py`                  | ✅     |
| 3B.5  | Write `SKILL.md` with usage examples (both skills)  | ✅     |
| 3B.6  | Add skills to agent config + deploy                 | ✅     |
| 3B.7  | Test TTS generation end-to-end                      | ✅     |
| 3B.8  | Test voice cloning end-to-end                       | ⏸️     |
| 3B.9  | Fix Python 3.14 compat (pin <3.14)                  | ✅     |
| 3B.10 | Update architecture docs (new API key, skill count) | ✅     |

---

## Summary

| Phase        | Total Steps | Done   | In Progress | Blocked |
| ------------ | ----------- | ------ | ----------- | ------- |
| **Phase 1**  | 20          | 20     | 0           | 0       |
| **Phase 1b** | 14          | 14     | 0           | 0       |
| **Phase 2**  | 14          | 12     | 0           | 2       |
| **Phase 3A** | 10          | 10     | 0           | 0       |
| **Phase 3B** | 10          | 9      | 0           | 1       |
| **Total**    | **68**      | **65** | **0**       | **3**   |
