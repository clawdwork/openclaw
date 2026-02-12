# Skills, Cron & UX Audit — February 12, 2026

> Architecture review + QA audit across intel-ingest, proposal generation, heartbeat/cron, and Telegram UX.

**Baseline**: `arch-verify.sh` — all checks passed (port 19400, 27 skills, 8 API keys, gateway up, VALUES.md consistent).

---

## 1. Daily Intelligence Hub

### 1.1 Cron Payload Contradicts SKILL.md (CRITICAL)

The daily cron job (`Daily Intel Ingest`, id `13708b7a`) payload still instructs:

```
Use 'sag' (ElevenLabs) to generate a summary audio file and save to
knowledge/intel-hub/audio/{{date}}.mp3
```

But `intel-ingest/SKILL.md` Phase 4.2 Step 2 now says:

```
**DO NOT generate ElevenLabs or single-narrator TTS audio.**
Use the `podcast-gen` skill to create a two-host podcast discussion...
--tts minimax --minimax-model speech-02-turbo
--filename "{delivery.hub_directory}/audio/YYYY-MM-DD-podcast.mp3"
```

**Root cause**: The cron payload was written before the SKILL.md was updated to use podcast-gen. The agent reads BOTH and gets conflicting instructions.

**Fix**: Update the cron job payload to remove the ElevenLabs reference and instead say:

```
Read skills/marketing/intel-ingest/SKILL.md and follow ALL phases exactly.
```

### 1.2 Edition Quality Inconsistency

| Edition               | Lines  | Fonts                             | Layout                                     | Audio Pattern               |
| --------------------- | ------ | --------------------------------- | ------------------------------------------ | --------------------------- |
| Feb 9 (gold standard) | 406    | Charter serif + sticky audio      | Narrative editorial w/ citations           | Dual player (podcast + TTS) |
| Feb 10                | 177    | Charter serif + sticky audio      | Narrative editorial w/ citations           | Single podcast player       |
| Feb 11                | **78** | **Playfair Display** + pill audio | Minimal — no citations, no synergy section | Single pill player          |
| Feb 12                | 218    | Charter serif + sticky audio      | Narrative editorial w/ citations           | Single podcast player       |

**Issues**:

- **Feb 11 is half the quality** of other editions — different font family (Playfair Display vs Charter), different audio player style (pill vs sticky bar), missing citation system, missing footer structure.
- No enforced HTML template or style validation between editions.
- The SKILL.md references a "Gold Standard" (`edition-2026-02-09.html`) but compliance is not validated.

**Fix**: Add a post-generation validation checklist to the SKILL.md:

```
After generating edition HTML, verify:
- [ ] Uses Charter/Inter fonts (NOT Playfair Display)
- [ ] Sticky audio player with podcast MP3
- [ ] Numbered citation system
- [ ] Cross-domain synergy section
- [ ] Footer with sources and methodology
- [ ] Minimum 150 lines of HTML
```

### 1.3 Index.html Clearing / Stacking

Current `index.html` state:

- Feb 12 featured card (red border, `border-2 border-red-400`) ✅
- Feb 11 **full card** below it ❌ (should be archive row only)
- Archive section has Feb 11 **again** as a compact row ❌ (duplicate)

**Root cause**: SKILL.md says "Move yesterday's featured card into the Archive section as a compact row, NOT as a full card." But the agent left Feb 11 as a full card AND added it to archive.

**Fix**: Strengthen the SKILL.md instruction:

```
VALIDATION: After updating index.html, count the number of <article> cards
with class "bg-white rounded-2xl". There must be EXACTLY ONE (today's edition).
All previous days must be compact archive rows only.
```

### 1.4 Repetitive Content Across Days

| Topic             | Feb 10       | Feb 11                    | Feb 12            |
| ----------------- | ------------ | ------------------------- | ----------------- |
| Sheetz expansion  | ✅ Michigan  | ✅ Limerick PA + Michigan | ✅ Michigan $500M |
| Casey's stores    | ✅ 80 stores | ✅ 80 stores              | ✅ 80 stores      |
| 7-Eleven closures | -            | ✅ 1,300 new stores       | ✅ 444 closures   |
| xAI funding       | -            | ✅ $20B                   | ✅ $20B           |
| FDA pouches       | -            | ✅ 6 authorized           | ✅ 6 authorized   |

Casey's "80 stores" and xAI "$20B" appear in both Feb 11 and Feb 12 with near-identical framing. FDA pouch authorization appears with same data points.

**Fix**: Add a deduplication step to the SKILL.md:

```
Phase 2 Addition: Before finalizing insights, read the previous 2 days' briefs
({delivery.output_directory}/YYYY-MM-(DD-1).md and YYYY-MM-(DD-2).md).
Flag any insight that repeats the same data point verbatim.
Replace repeated insights with NEW developments or deeper analysis on the same topic.
```

---

## 2. Proposal Building Skills

### 2.1 No Vercel Deployment Lifecycle

The `generating-proposal-documents` SKILL.md (871 lines) covers:

- ✅ Brand integration
- ✅ Tech stack (Next.js 15 + React 19 + TailwindCSS 4)
- ✅ Layout patterns and print CSS
- ✅ Static chart patterns
- ❌ **No deployment instructions**
- ❌ **No update/redeploy workflow**
- ❌ **No link validation**

The agent can generate the code but has no instructions for:

1. Creating a new Vercel project
2. Deploying via `vercel --prod`
3. **Updating** an already-deployed project (the user's main complaint)
4. Validating the deployed URL returns 200

**Fix**: Add a "Deployment Lifecycle" section:

```markdown
## Deployment Lifecycle

### Initial Deploy

1. Create Vercel project: `vercel --yes --token $VERCEL_TOKEN`
2. Deploy: `vercel --prod --token $VERCEL_TOKEN`
3. Validate: `curl -sI <URL> | head -1` → must show `200 OK`
4. Record project ID and URL in workspace memory

### Update Existing Deploy

1. Make code changes in the project directory
2. Re-deploy: `vercel --prod --token $VERCEL_TOKEN`
3. Wait for build completion
4. Validate updated URL returns 200 and content reflects changes
5. Report URL to user

### Common Failures

- Build failure: Check `vercel logs` for errors
- Content not updating: Verify you're in the correct project directory
- 404 after deploy: Check `next.config.js` has `output: "export"` and
  `vercel.json` has correct build settings
```

### 2.2 Visual Consistency

The skill provides extensive design patterns but no enforcement mechanism. Each generation starts fresh, leading to:

- Different border radius values between pages
- Inconsistent font weight usage
- Color variations when brand.json isn't loaded

**Fix**: Add a validation step:

```markdown
### Post-Generation Checklist

After generating all pages, verify consistency:

- [ ] Same BRAND object used across all page components
- [ ] Same PageWrapper component with identical header/footer
- [ ] Same typography scale throughout
- [ ] Print CSS included on every page
- [ ] All Lucide icons (no other icon libraries)
```

### 2.3 Code Routing

No routing pattern exists for deciding whether to create a new Vercel project or update an existing one. The agent doesn't check for existing deployments before creating new ones.

**Fix**: Add a decision tree:

```markdown
### Deployment Routing

1. Check: Does the user reference an existing proposal URL?
   → YES: Find project dir, update code, redeploy
   → NO: Continue to step 2
2. Check: Does a project dir already exist for this client?
   → YES: Update existing project
   → NO: Create new project directory and Vercel project
```

---

## 3. HeartBeat & Cron

### 3.1 Cron Credit Consumption (CRITICAL)

The "Check Sheetz Following Discovery Jobs" cron (id `ffd78660`) is configured:

```json
{
  "schedule": { "kind": "every", "everyMs": 1800000 },
  "wakeMode": "now",
  "delivery": { "mode": "announce" }
}
```

This fires **every 30 minutes** with `wakeMode: "now"` (each fires an LLM call) and `delivery.mode: "announce"` (sends result to Telegram). Over 48 hours, this produced **25+ cron executions** — each consuming API credits and sending a Telegram message to the user.

The jobs completed within hours, but the cron kept firing **indefinitely** with the same "jobs complete" message.

**Root cause**: No completion detection or auto-disable. The cron fires on a timer with no awareness of whether the underlying task is done.

**Approved fix (Option A + self-disable pattern)**:

1. **`maxRuns` field** — Add to `CronJob` type. System auto-disables the job after N successful executions. Covers polling-style crons (like Sheetz) where the agent creates a cron with `maxRuns: 10` and it self-terminates. ~15 LOC in `applyJobResult()` in `src/cron/service/timer.ts`.
2. **Self-disable instruction** — As a belt-and-suspenders fallback, task-scoped cron payloads should include: _"If the task is complete and results delivered, disable this cron using `cron disable <job_id>`."_
3. **Webhook triggers deferred** — Most apps (including Celavii) don't expose webhooks. Webhook-triggered crons are a future consideration, not a near-term solution.

### 3.2 No /shutdown or /heartbeat Command

The gateway has `set-heartbeats` (system method in `src/gateway/server-methods/system.ts` line 13):

```typescript
"set-heartbeats": ({ params, respond }) => {
  setHeartbeatsEnabled(enabled);
  respond(true, { ok: true, enabled }, undefined);
}
```

But there is **no user-facing command** to toggle this from Telegram or CLI. The user said "we were done for the day" but the agent kept messaging.

**Evidence from session logs**:

```
[Telegram 11:15 EST] "Why are you keep messaging me back? I said we were done
for the day. That means that you're no[t supposed to message me]"
```

**Approved fix: Direct `/shutdown` command (not NLP/regex-based)**:

The user may say "we're done with this topic" without meaning "stop all notifications." Regex/NLP detection of session-end phrases is unreliable and will misfire. The shutdown trigger **must be an explicit command**.

| Command          | Action                                                               |
| ---------------- | -------------------------------------------------------------------- |
| `/shutdown`      | Disable heartbeat + pause all session-scoped crons. Confirm to user. |
| `/heartbeat off` | Disable heartbeat only (crons continue)                              |
| `/heartbeat on`  | Re-enable heartbeat                                                  |
| `/resume`        | Undo `/shutdown` — re-enable heartbeat + resume paused crons         |

**Implementation path**:

- Add `/shutdown`, `/heartbeat`, `/resume` to the channel command router (same pattern as `/new`, `/reset`)
- `/shutdown` calls `setHeartbeatsEnabled(false)` via gateway API + iterates cron jobs and pauses those with a `pauseOnShutdown` flag
- `/resume` reverses both
- Auto-resume on next user message is **configurable, not default** — user might send a quick message without wanting full automation to restart
- State must persist across gateway restarts (write to `~/.openclaw/state/shutdown.json` or equivalent)

**New `CronJob` field**: `pauseOnShutdown?: boolean`

- `true` = paused when `/shutdown` fires (task-scoped polling crons)
- `false` / undefined = always runs (persistent crons like Daily Intel Ingest, Morning Brief)

### 3.3 Task Management Gap

No skill exists for structured task management with follow-up tracking. The agent uses ad-hoc memory files but lacks:

- Task status tracking (assigned → in-progress → complete)
- Client follow-up reminders with context
- Cross-session task continuity

**Recommendation**: Create a `task-manager` skill that:

1. Maintains a structured `TASKS.md` in the workspace
2. Supports task lifecycle: create → assign → follow-up → complete
3. Integrates with cron for scheduled follow-ups
4. Provides client-facing status summaries on demand

---

## 4. User Experience (Telegram Audit)

### 4.1 Session Log Statistics (Feb 10–12)

| Metric                     | Count      |
| -------------------------- | ---------- |
| Total sessions             | 61         |
| Total messages             | 395        |
| Cron-triggered messages    | ~250 (63%) |
| Human user messages        | ~145 (37%) |
| Sheetz cron messages alone | 25+        |

**63% of all messages were cron-triggered** — the user's Telegram is dominated by automated updates rather than interactive conversation.

### 4.2 Responsiveness Issues

Multiple "Any update?" messages from the user indicate slow or unresponsive agent behavior:

| Time             | User Message                   | Gap                    |
| ---------------- | ------------------------------ | ---------------------- |
| Feb 10 02:33 EST | "Any update?"                  | 15 min after prior msg |
| Feb 10 03:08 EST | "Any update?"                  | 11 min after prior msg |
| Feb 10 03:16 EST | "Could it be a credits thing?" | 5 min wait             |
| Feb 10 03:17 EST | "?"                            | 1 min follow-up        |

**Root cause**: Agent was busy with long-running tasks (video generation) and messages were queued. The user has no visibility into whether the agent is working or stuck.

**Fix**:

- Add progress indicators for long-running tasks
- Send a "Working on it..." acknowledgment within 30 seconds of receiving a message if the task will take longer
- Expose queue status to the user (e.g., "I'm currently processing a video generation request, estimated 2-3 min remaining")

### 4.3 Media Generation Consistency

From Feb 10 video generation session:

```
User: "It turned the kick can into a beer can, the AI generation failed
to maintain consistency of the product."
```

```
User: "the can is not maintaining the 2.5\" diameter, also, let's think
of the perspective? Who is the character?"
```

```
User: "the issue here is video direction, loss of translation on the video"
```

**Issues**:

- Product identity lost during AI generation (branded can → generic beer can)
- No dimensional consistency enforcement in prompts
- Agent not proactively establishing creative direction before generation
- No iterative prompt refinement workflow

**Fix**: Update `media-content` skill to:

1. Always generate and confirm a reference image before video generation
2. Include product dimensions and brand details in every prompt
3. Establish POV/perspective/setting BEFORE generation (not after)
4. Add a "creative brief review" step: present the prompt plan to user before executing

### 4.4 Session End / Disengagement

User explicitly said "we were done for the day" but agent continued sending messages via heartbeat and cron. This is the most impactful UX issue.

**Fix**: See Section 3.2 — direct `/shutdown` command. NLP detection of "we're done" is explicitly rejected as unreliable. The user must issue `/shutdown` to stop notifications. The agent may _suggest_ running `/shutdown` if context seems right, but must not auto-trigger it.

---

## Priority Matrix

| #   | Issue                                           | Severity    | Effort | Fix Location                            |
| --- | ----------------------------------------------- | ----------- | ------ | --------------------------------------- |
| 1   | Cron payload contradicts SKILL.md (ElevenLabs)  | 🔴 Critical | Low    | Cron job update                         |
| 2   | Sheetz cron infinite loop (credit waste)        | 🔴 Critical | Low    | Disable cron + add self-disable pattern |
| 3   | No /shutdown command (can't stop notifications) | 🔴 Critical | Medium | New CLI/Telegram command                |
| 4   | Index.html card stacking (duplicate entries)    | 🟡 High     | Low    | SKILL.md validation step                |
| 5   | Edition quality inconsistency (Feb 11 outlier)  | 🟡 High     | Low    | SKILL.md post-gen checklist             |
| 6   | Content repetition across days                  | 🟡 High     | Low    | SKILL.md dedup step                     |
| 7   | No proposal deploy/update workflow              | 🟡 High     | Medium | SKILL.md deployment section             |
| 8   | Agent responsiveness / progress indicators      | 🟡 High     | Medium | Gateway/channel feature                 |
| 9   | Media generation consistency                    | 🟠 Medium   | Medium | media-content SKILL.md update           |
| 10  | Task management skill                           | 🟠 Medium   | High   | New skill                               |
| 11  | Proposal visual consistency validation          | 🟢 Low      | Low    | SKILL.md checklist                      |

---

## Immediate Actions (Can fix now)

1. **Update Daily Intel Ingest cron payload** — remove ElevenLabs reference
2. **Disable Sheetz Following Discovery cron** — jobs are complete
3. **Add validation checklist to intel-ingest SKILL.md** — enforce template compliance
4. **Add dedup step to intel-ingest SKILL.md** — prevent content repetition

## Next Sprint

5. Implement `/shutdown` and `/heartbeat` commands
6. Add deployment lifecycle to proposal skill
7. Add creative brief review to media-content skill
8. Build task-manager skill

---

_Generated: 2026-02-12 | Source: arch-verify.sh + code_search + session log audit (61 sessions, 395 messages)_
