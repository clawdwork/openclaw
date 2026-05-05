# Intake Questions (D2)

Five questions, asked one at a time, Telegram-friendly (each answerable in ≤140 chars). Pattern from [`workspace/skills/seo/commands/seo-strategy.md` § Intake](file:///Users/operator/dev/workspace/skills/seo/commands/seo-strategy.md).

## Q1 — Channels

> "Which brand/persona channels are we planning for? Comma-separated. Example: `elioth, celavii, cutmaster`"

**Validation**: at least 1 channel. Each must already exist as a directory under `~/dev/workspace/.styles/{channel}/` (skill checks; if not, prompts to scaffold).

**Writes**: `intake.channels[]`.

## Q2 — Identities

> "For each channel, give me: handle per platform (IG/TT/X/YT) + 1-line identity. Format: `channel | ig:@... tt:@... x:@... yt:@... | identity`"

Optional platform handles can be omitted (just leave the prefix off). YouTube channels marked `yt:tbd` activate later under Phase H-YT.

**Writes**: `intake.identities[channel] = { handles: {ig, tt, x, yt}, identity_line }`.

## Q2.5 — Product (conditional)

**Asked when**: `channel_types[ch] ∈ {product, utility}` for any channel. Skipped for pure `founder` channels.

> "What does the product actually do? One paragraph, technical specifics. Include: what it integrates with, how it's distributed (open-source, SaaS, paid, free tier), the primary surface(s) users interact with, and the differentiator a competitor couldn't fake. If it's pre-launch, describe what it WILL do at v1."

This question exists because the cutmasterai dry-run (2026-05-04) revealed that intake.business_concept generated from Q2 + Q3 was too vague — it described "an open-source AI video editing tool" when the actual product is a DaVinci Resolve MCP server with three surfaces, Gemini frame analysis, and Claude Code agents. The agent had to do five web queries to recover the specifics that should have come from the user.

The answer drives:

- `intake.product_description` (verbatim, used as Gate A context)
- `intake.differentiators[]` (pipeline derives 3–5 from the description; surfaces them back to user for confirmation)
- Phase 0.5a competitor discovery search seeds (more specific descriptions yield more relevant candidates)

**Validation**: ≥80 words, ≥3 specific nouns (product names, technologies, integration points). Generic answers ("AI tool for X") trigger a follow-up: "Be more specific — what specifically does it integrate with, and what's the unique differentiator?"

**Writes**: `intake.product_description` (string), `intake.differentiators[]` (auto-derived, user-confirmed).

## Q3 — Goal

> "Single sentence: what should this strategy accomplish in the next 90 days? (Be specific — 'grow followers' is too vague. Try '300 qualified Celavii demos via TikTok + IG.')"

Specificity matters: this gets cited by Gate A (Article 6 verification rule). The verb + noun in the goal will be one of the four citations the critic must produce.

**Writes**: `intake.goal` (string).

## Q4 — Competitors

> "Top 3 competitors per channel, any platform. Format: `channel | handle1, handle2, handle3`. Reply `unknown` if you don't know — the pipeline will research and propose them. Reply `partial: handle1, handle2` to seed some and have the pipeline find the rest."

These get scraped in Phase 0 (baseline) and Phase 2 (top-posts extraction). Cross-platform link extraction (Mode D of `social-competitor-scrape`) will enrich these into multi-platform handles automatically.

### Three answer modes

| Mode              | Trigger              | Pipeline behavior                                                                                                                                                                             |
| ----------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user_provided`   | 1–3 named handles    | Status set to `user_provided`. Phase 0.5 baseline runs immediately on listed handles.                                                                                                         |
| `research_needed` | `unknown` (or empty) | Status set to `research_needed`. Phase **0.5a Competitor Discovery** inserts before 0.5 baseline. Surfaces top 5 candidates via Telegram. User confirms 3 → status flips `research_complete`. |
| `partial`         | `partial: h1, h2`    | Status set to `research_needed_partial`. Phase 0.5a runs but seeded with the 1–2 user handles; surfaces remaining candidates to round out to 3.                                               |

A pre-launch channel (no audience yet, no obvious peers) is the most common case for `unknown`. Forcing the user to fabricate 3 competitors when they don't know any is what surfaced this gap (cutmasterai dry-run, 2026-05-04).

**Writes**: `intake.competitors_per_channel[channel] = { handles: [...], status: "user_provided" | "research_needed" | "research_needed_partial" | "research_complete", confirmed_at: <iso|null>, hypotheses: [...], off_platform: [...] }`.

The `hypotheses` array (optional) captures user-supplied candidates that aren't being locked in yet — Phase 0.5a treats them as priors but does not skip its own search.

The `off_platform` array (optional, populated by Phase 0.5a) captures real competitors that don't have a presence on the target platform but matter strategically. Each entry is `{name, platform: "github" | "newsletter" | "podcast" | "discord" | "{other}", url, threat_level: "high" | "medium" | "low", target_platform_channel: null | "@handle", monitor: bool, rationale}`. These do NOT count toward the 3-handle minimum required by Article 6 — they're carried as context for Gate A and re-checked at refresh.

## Q5 — Voice rules

> "Forbidden phrases + required terms. Pulls defaults from `voice.json`; this layers project-specific overrides. Reply 'defaults' to use voice.json as-is, or paste your overrides."

**Writes**: `intake.voice_rules = { forbidden_phrases[], preferred_terms{}, banned_language[] }`.

## Auto-derived (no user input)

After Q5, the command auto-fills without asking:

| Field                          | Source                                                                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intake.channel_types[ch]`     | Heuristic on identity_line: founder \| product \| utility (drives D16; determines whether Q2.5 is asked)                                                                                       |
| `intake.business_concept`      | LLM synth from identities + product_description (Q2.5, when asked) + goal — used by Gate A; **mandatory for critic**. For pure founder channels (no Q2.5), synth from identities + goal alone. |
| `intake.banned_language`       | Merge of voice.json `forbidden_phrases` + `ai_slop_tells` + Q5 overrides                                                                                                                       |
| `intake.channel_e_mix_targets` | Default mix per channel type (per `4e-classifier.md` defaults table)                                                                                                                           |
| `intake.locked = true`         | After all questions answered (5 for founder, 6 for product/utility with Q2.5)                                                                                                                  |

## Skip logic

If `state.intake.locked == true`: ask "Resume {project} or start new?" Default to resume; only re-prompt the five Qs on explicit "start new". Refresh runs (`/social_strategy refresh`) keep intake locked.

## Anti-patterns

- ❌ Asking all five at once — overwhelming on Telegram, breaks chat-friendly flow
- ❌ Asking "anything else?" after Q5 — open-ended, low-signal; project notes belong in `intake.notes` filled later
- ❌ Auto-deriving `goal` from identity — defeats the purpose; goal must come from human
