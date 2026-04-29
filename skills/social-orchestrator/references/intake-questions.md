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

## Q3 — Goal

> "Single sentence: what should this strategy accomplish in the next 90 days? (Be specific — 'grow followers' is too vague. Try '300 qualified Celavii demos via TikTok + IG.')"

Specificity matters: this gets cited by Gate A (Article 6 verification rule). The verb + noun in the goal will be one of the four citations the critic must produce.

**Writes**: `intake.goal` (string).

## Q4 — Competitors

> "Top 3 competitors per channel, any platform. Format: `channel | handle1, handle2, handle3`"

These get scraped in Phase 0 (baseline) and Phase 2 (top-posts extraction). Cross-platform link extraction (Mode D of `social-competitor-scrape`) will enrich these into multi-platform handles automatically.

**Writes**: `intake.competitors_per_channel[channel] = [...]`.

## Q5 — Voice rules

> "Forbidden phrases + required terms. Pulls defaults from `voice.json`; this layers project-specific overrides. Reply 'defaults' to use voice.json as-is, or paste your overrides."

**Writes**: `intake.voice_rules = { forbidden_phrases[], preferred_terms{}, banned_language[] }`.

## Auto-derived (no user input)

After Q5, the command auto-fills without asking:

| Field                          | Source                                                                      |
| ------------------------------ | --------------------------------------------------------------------------- |
| `intake.channel_types[ch]`     | Heuristic on identity_line: founder \| product \| utility (drives D16)      |
| `intake.business_concept`      | LLM synth from identities + goal — used by Gate A; **mandatory for critic** |
| `intake.banned_language`       | Merge of voice.json `forbidden_phrases` + `ai_slop_tells` + Q5 overrides    |
| `intake.channel_e_mix_targets` | Default mix per channel type (per `4e-classifier.md` defaults table)        |
| `intake.locked = true`         | After all five answered                                                     |

## Skip logic

If `state.intake.locked == true`: ask "Resume {project} or start new?" Default to resume; only re-prompt the five Qs on explicit "start new". Refresh runs (`/social_strategy refresh`) keep intake locked.

## Anti-patterns

- ❌ Asking all five at once — overwhelming on Telegram, breaks chat-friendly flow
- ❌ Asking "anything else?" after Q5 — open-ended, low-signal; project notes belong in `intake.notes` filled later
- ❌ Auto-deriving `goal` from identity — defeats the purpose; goal must come from human
