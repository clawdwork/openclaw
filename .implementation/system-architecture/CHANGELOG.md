# Architecture Changelog

> Part of [System Architecture](README.md)

---

| Date       | Change                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-04 | Initial setup - multi-model, heartbeat, caching                                                                                                     |
| 2026-02-04 | Architecture document created                                                                                                                       |
| 2026-02-04 | Added routing instructions to SOUL.md and TOOLS.md                                                                                                  |
| 2026-02-04 | **Architecture revision**: Sonnet as main agent, Opus for planning, Flash for search, Haiku for tools                                               |
| 2026-02-05 | Configured Telegram channel with allowlist policy                                                                                                   |
| 2026-02-05 | Installed voice skills: whisper, sag, sherpa-onnx-tts                                                                                               |
| 2026-02-05 | Installed dev tools: gh, netlify, pi, jq, ripgrep                                                                                                   |
| 2026-02-05 | Added custom skills: shadcn-ui, brand-identity, proposals                                                                                           |
| 2026-02-05 | Authenticated GitHub (`clawdwork`) and Netlify accounts                                                                                             |
| 2026-02-05 | Added capabilities matrix and skill inventory                                                                                                       |
| 2026-02-05 | Installed 46 Anthropic domain skills across 8 categories                                                                                            |
| 2026-02-05 | Fixed tool call visibility in Telegram (pruning placeholder)                                                                                        |
| 2026-02-06 | **Architecture revision v2**: Flash as coordinator, Sonnet as coder, Opus 4.6 as planner                                                            |
| 2026-02-06 | Added 8 domain sub-agents: marketing, sales, legal, finance, data, product, support, search                                                         |
| 2026-02-06 | Added project-first file organization with domain research folders                                                                                  |
| 2026-02-06 | Enterprise Search agent configured with file-based persistent memory                                                                                |
| 2026-02-06 | Self-documenting domain agents: MUST save findings before reporting                                                                                 |
| 2026-02-06 | **Codebase verification**: sub-agents cannot spawn (1-level only)                                                                                   |
| 2026-02-06 | **Codebase verification**: sub-agents see only AGENTS.md + TOOLS.md                                                                                 |
| 2026-02-06 | Added 3-layer context injection pattern (TOOLS.md + agents.list + task field)                                                                       |
| 2026-02-06 | Added multi-coordinator architecture for team scaling                                                                                               |
| 2026-02-06 | Documented `agentId` routing via `sessions_spawn` for domain agents                                                                                 |
| 2026-02-06 | **Org-scale team architecture**: role-based naming protocol (`admin-NNN`, `member-NNN`, `guest-NNN`)                                                |
| 2026-02-06 | Designed `~/org/` directory structure: shared/, workspaces/, config/                                                                                |
| 2026-02-06 | Access matrix: sandbox isolation + Docker bind mounts per role                                                                                      |
| 2026-02-06 | Role permissions: admin (full), member (sandboxed rw), guest (sandboxed ro), service (automated)                                                    |
| 2026-02-06 | Channel routing plan: separate Telegram bots per agent, WhatsApp DM-split                                                                           |
| 2026-02-06 | Migration path: agent-workspace → ~/org/workspaces/admin-001/ + symlinks                                                                            |
| 2026-02-06 | Docker Desktop installed via Homebrew (arm64)                                                                                                       |
| 2026-02-06 | Env siloing architecture: sandbox already isolates; Phase 1 config + Phase 2 env file hierarchy                                                     |
| 2026-02-06 | Phase 2 integration roadmap: envFile, env hierarchy, workspace wizard, folder-ACL, migration                                                        |
| 2026-02-06 | **Workspace Wizard skill spec**: admin-only provisioning wizard with templates + deactivation flow                                                  |
| 2026-02-06 | **Structural audit**: fixed 6 stale refs (old paths, personal names, outdated security notes, model table)                                          |
| 2026-02-06 | WhatsApp channel linked (dedicated number), LaunchAgent installed for boot persistence                                                              |
| 2026-02-06 | **Channel bindings**: per-sender session isolation, binding patterns, DM policy + bindings flow diagram                                             |
| 2026-02-07 | **Git & Deployment Integration**: GitHub repo structure, Vercel/Netlify platform assessment, deployment routing                                     |
| 2026-02-07 | **Token Security Architecture**: credential isolation matrix, injection model, access tiers, leakage prevention                                     |
| 2026-02-07 | **Member Self-Service Deploys**: agent-driven repo creation + Vercel deploy flow, templates, data isolation                                         |
| 2026-02-07 | GitHub PAT `org-agent-deploy` created (fine-grained, expires 2026-12-31), saved to `shared.env`                                                     |
| 2026-02-07 | **deploy-and-publish skill**: unified generate → git → deploy → URL pipeline for member agents                                                      |
| 2026-02-07 | **Proposal template**: `~/org/shared/templates/proposal-template/` (Next.js + Tailwind + Lucide, 8.5x11 print)                                      |
| 2026-02-07 | **Provisioning script**: auto-creates Vercel tokens via API, injects GH_TOKEN from shared.env                                                       |
| 2026-02-07 | **Sandbox network security**: default `network:none`, bridge for deploy-enabled only, skills can't be installed                                     |
| 2026-02-07 | **Deactivation protocols**: disable/archive/delete/purge tiers, Vercel token revocation, repo+deploy cleanup                                        |
| 2026-02-07 | **Deploy routing**: Vercel-first (no build minute cap), Netlify only for existing commercial sites                                                  |
| 2026-02-07 | **Netlify→Vercel migration**: All 4 Netlify sites migrated to Vercel with dedicated GitHub repos                                                    |
| 2026-02-07 | **GitHub repos created**: client-celavii-seo-proposal, client-maxkick-seo-proposal, client-kick-sheetz-presentation, client-maxkick-war-room        |
| 2026-02-07 | **Skills symlink**: `~/.openclaw/skills/` → `~/agent-workspace/skills/` — all 50 skills globally accessible                                         |
| 2026-02-07 | **shadcn-ui relocated**: `skills/shadcn-ui.md` → `skills/ui/shadcn-ui/SKILL.md` (proper skill directory)                                            |
| 2026-02-07 | **Skills inventory**: 50 skills across 13 categories. Full inventory documented in WORKSPACE.md                                                     |
| 2026-02-07 | **WORKSPACE.md**: Created canonical workspace map with file save decision tree, project/deployment/git registries                                   |
| 2026-02-07 | **Personal workspace dirs**: Added daily/, todos/, intel/daily/, audio/ to provisioning                                                             |
| 2026-02-07 | **Intel hub pipeline fixes**: hub-sync.sh pre-flight checks, Vercel token auth, removed stale Netlify refs                                          |
| 2026-02-07 | **SKILL.md (intel-ingest)**: Consolidated duplicate Phase 4/5, added HTML edition generation step                                                   |
| 2026-02-07 | **Architecture refactor**: Split monolithic SYSTEM-ARCHITECTURE.md (2033 lines) into 9 focused modules under `.implementation/system-architecture/` |
| 2026-02-07 | **Windsurf workflow**: Created `/architecture` workflow for review and update operations                                                            |
| 2026-02-07 | **Architecture audit**: Fixed 9 discrepancies from monolithic→modular transcription                                                                 |
| 2026-02-07 | **channels.md**: Anonymized real phone number consistently across all 3 occurrences (+15555555555)                                                  |
| 2026-02-07 | **README.md**: Fixed Overview diagram — regrouped Support/Search as Flash, Legal/Finance/Data as Sonnet                                             |
| 2026-02-07 | **org-structure.md**: Restored missing Granular Project Access JSON examples (member + guest bind-mount patterns)                                   |
| 2026-02-07 | **deployments.md**: Restored missing data isolation explanatory bullets + Agent deploy workflow 4-step flow                                         |
| 2026-02-07 | **security.md**: Restored missing "complete agent sandbox" paragraph + sandbox config summary bullets                                               |
| 2026-02-07 | **agents.md**: Fixed example skill path `seo-optimization` → `content-creation` (valid marketing skill)                                             |
| 2026-02-07 | **README.md**: Restored inline comments in Cache Configuration JSON (`// Extended TTL`, etc.)                                                       |
