# The Department Model

> A methodology for building long-horizon agentic systems by treating agents as a small, specialized firm — with roles, briefs, partners, and a shared operating model that scales without code changes.

**Version 1 · 2026-04-29 · Living document**

This is the methodology document. It explains _why_ the system is structured the way it is, _what vocabulary_ the team uses to talk about it, and _how_ a new joiner — human or agent — can be productive on day one.

It has three companion files in this directory:

- [`principles.md`](principles.md) — the decision rationales behind every architectural choice, including dated anti-patterns
- [`comparison.md`](comparison.md) — how the Department Model relates to (and differs from) LangGraph, CrewAI, AutoGen, AutoGPT, and other agentic frameworks
- [`department-model-diagrams.html`](department-model-diagrams.html) — visual companion: org chart, engagement lifecycle, per-post sub-skill chain, studio floor plan, gate mechanism, decision matrix. Open in any browser.

Read this README first. The other three are reference material.

---

## Table of Contents

- [Prologue: The Sculptor](#prologue-the-sculptor)
- [The Department Model in One Paragraph](#the-department-model-in-one-paragraph)
- [Vocabulary](#vocabulary)
- [Part 0 — Three Studios, One Pattern](#part-0--three-studios-one-pattern)
- [Part I — The Studio Tour](#part-i--the-studio-tour)
- [Part II — A Day in the Studio](#part-ii--a-day-in-the-studio)
- [Part III — How Work Flows](#part-iii--how-work-flows)
- [Part IV — Building a New Department](#part-iv--building-a-new-department)
- [Part V — Adding to an Existing Department](#part-v--adding-to-an-existing-department)
- [Part VI — When NOT to Use the Department Model](#part-vi--when-not-to-use-the-department-model)
- [Part VII — On Prose as a User Interface](#part-vii--on-prose-as-a-user-interface)
- [Part VIII — Glossary](#part-viii--glossary)
- [Epilogue: This Document Will Change](#epilogue-this-document-will-change)

---

## Prologue: The Sculptor

A sculptor needs tools. Chisels, mallets, calipers, sandpaper. None of them sculpt — _the sculptor sculpts_; the tools extend the sculptor's hand. A sculptor with the right tools and the right training will produce work that surpasses any tool used alone.

But a sculptor who tries to run a sculpting _business_ — accepting commissions, billing clients, sourcing marble, scheduling delivery, doing quality control, marketing the studio, mentoring apprentices — will produce less and worse work than a sculptor who does only sculpting in a studio that handles everything else.

This isn't a deficiency of the sculptor. It's the way attention works. Cognitive load is the bottleneck for craft, and a sculptor who is also doing five other jobs has less attention for the sculpture. So sculpting at scale, beyond the level of one person making one piece, becomes a question of organizational design.

Every craft eventually faces the same problem. Law firms exist because a lawyer who also does intake, billing, conflicts checks, and marketing is a worse lawyer. Newsrooms exist because a reporter who also does fact-checking, copy editing, and layout is a worse reporter. Design studios, ad agencies, accounting practices, architectural firms, consultancies — all variations on the same answer: **specialized practitioners, structured processes, shared values**.

LLM-based agents have the same problem. An agent asked to do strategy, research, drafting, critique, and delivery in a single prompt is a worse agent than a chain of specialists, each with one job, one operating procedure, and a senior reviewer.

The Department Model is what happens when you take that observation seriously and build the system to match.

---

## The Department Model in One Paragraph

The Department Model is a way to build agentic systems where each agent acts like a department in a small, specialized firm. The firm has a **studio** (a domain — SEO, social, blog production), staffed by **specialists** (atomic skills with one job each), coordinated by a **studio director** (an orchestrator skill that routes work and holds the firm's vocabulary), governed by **partners** (critic skills that review specialist output against the firm's values), and organized around **engagements** (long-running projects with intake, phases, gates, and deliverables) whose state lives in a **filing system** (a state file plus a `raw/` directory) that any specialist can read and write. The firm's identity, voice, ethics, and quality bar live in a **constitution** that every partner consults before approving any work. Communication between the firm and the outside world happens through **briefs** (commands), which are written in markdown and executed by the model itself. The whole system runs on prose: every artifact — orchestrator, specialist, brief, constitution, gate — is a markdown file the model reads and acts on.

That's it. Everything else in this document is detail.

---

## Vocabulary

A small set of terms, used precisely, throughout this doc and the codebase.

| Term                     | What it is                                                             | Concrete example                                                 |
| ------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Department Model**     | The methodology itself                                                 | This document                                                    |
| **Studio**               | A domain instance — one functional area of the firm                    | Social Studio, SEO Studio, Blog Studio                           |
| **Operating Model**      | The conventions every studio shares                                    | "Cross-model critic at every gate"; "State lives in a JSON file" |
| **Studio Director**      | The orchestrator skill that routes work within a studio                | `social-orchestrator/SKILL.md`                                   |
| **Specialist**           | An atomic skill with one job                                           | `social-discover/`, `social-brief/`, `social-aggregate/`         |
| **Senior Partner**       | A critic skill that reviews specialist work against firm values        | `social-quality` running `mode=gate-a`                           |
| **Engagement**           | A long-running project from intake to delivery                         | A run of `/social_strategy` for the celavii brand                |
| **Brief**                | A markdown command file describing a unit of work                      | `commands/social-curate.md`                                      |
| **Intake**               | The conversational scoping flow at the start of an engagement          | The five questions in `references/intake-questions.md`           |
| **Engagement File**      | The state file carrying an engagement's progress                       | `social-strategy-state.json`                                     |
| **Filing Cabinet**       | The `raw/` directory holding every tool output as durable evidence     | `projects/celavii/research/social/raw/*.json`                    |
| **Knowledge Management** | The firm's persistent memory — references, fixtures, prior engagements | Memory system, `references/*.md`, `fixtures/*`                   |
| **Constitution**         | The firm's values, expressed as numbered articles                      | `social-constitution.md`'s ten articles                          |
| **Conflicts Check**      | Detection of work that would duplicate or compete with prior work      | Cosine cannibalization in `social-aggregate`                     |
| **Practice Group**       | A cluster of related studios sharing a knowledge base                  | Content practice = SEO + Social + Blog studios                   |

The vocabulary is loosely borrowed from professional services firms (PSFs) — law firms, consultancies, design studios — because PSFs already have a hundred years of language for division of labor among knowledge workers. Where the borrowed term and the colorful sculptor metaphor disagree, this doc uses the PSF term, because the goal is precision.

When this doc says "the studio," it means a single domain — Social Studio, SEO Studio, Blog Studio. When it says "the firm," it means the whole workspace as an organization.

---

## Part 0 — Three Studios, One Pattern

The sculptor is the doc's spine, but the Department Model isn't _only_ a sculptor's pattern. Three illustrative examples — each a real kind of organization that already runs the way the methodology describes — show the range of work this pattern fits.

### The Sculpting Studio (the spine)

A working sculptor's studio is the cleanest illustration. A senior sculptor takes commissions; junior sculptors specialize (figurative work, abstract work, restoration); a workshop manager keeps the schedule; a sales lead closes the brief; a finishing specialist polishes finished work; the studio's house style — the thing that makes a piece recognizably _that studio's_ — lives in tradition and tooling. Every commission is a project file: the brief, the drafts, the photographs of the in-progress work, the client correspondence. When the studio takes on a new commission, the senior sculptor decides who works on it, in what order, with what tools. _Specialization makes the work better; coordination makes the firm scale._

This is the spine because it's the most _visceral_ illustration of why specialization matters. Every reader has watched a craftsperson at work and understood, intuitively, that someone doing only that one thing produces better work than a generalist trying to do everything.

### The Law Firm

A law firm is a Department Model in mature form. It has practice groups (litigation, corporate, IP, employment, tax) — each with its own conventions, knowledge base, and partners. It has a managing partner who allocates work. It has _engagement letters_ that scope each project. It has senior partners who review junior work — never the same partner who drafted, never on automatic approval. It has a _conflicts check_ before taking a new case. It has a _constitution_ (the firm's partnership agreement and code of conduct) that every partner consults when ethics are in question. Engagement files travel between offices, between associates, between partners — every memo timestamped and filed.

The law firm vocabulary is what we borrow most heavily, because law firms have a hundred years of accumulated wisdom about _how to coordinate skilled knowledge workers under uncertainty_. Every concept we need — engagement, partner review, conflicts, ethics, knowledge management, practice group, leverage — already has a precise definition.

### The Newsroom

A newsroom is the pattern's quality-and-fact-checking shape. A reporter has a beat; a fact-checker verifies claims; a copy editor edits for style and accuracy; a section editor approves the piece; the editor-in-chief sets the paper's identity. The _stylebook_ (AP, Chicago, the paper's own house guide) is a constitution: every story must satisfy its rules. The _correction policy_ is a partner-review function: when a published piece is wrong, the paper acknowledges and amends, not silently. The _sourcing standard_ — two independent sources for any contested claim — is a constitutional article applied to every piece.

The newsroom shows up in our system whenever quality, sourcing, fact-checking, and ethics matter — which, for content-producing studios, is constantly. The Senior Partner reviewing a Gate C looks more like a copy editor than a litigation partner.

### Why three illustrations matter

A single metaphor over-fits. _The sculptor_ gets the visceral truth of specialization; _the law firm_ gets the rigor of governance; _the newsroom_ gets the discipline of fact and correction. The Department Model takes from all three. When this doc is concrete about a topic — say, conflicts checks — the analogy that fits will appear; the reader can hold the appropriate frame in mind.

The reader who finds the sculptor too whimsical for their context can substitute _the consultancy_ (McKinsey-style); the reader who finds the law firm too dry can substitute _the design studio_. The pattern is the same. The vocabulary travels.

---

## Part I — The Studio Tour

Walk into the studio. Here's what's where, and who does what.

### 1. The Building

The studio occupies a workspace — a directory tree on disk. Here's the floor plan of one studio (Social), showing only what matters:

```
~/dev/workspace/                                    ← the firm's building
├── projects/
│   └── celavii/                                    ← one client
│       ├── research/social/
│       │   ├── social-strategy-state.json          ← the engagement file
│       │   ├── raw/                                ← the filing cabinet
│       │   ├── briefs/                              ← per-post deliverables
│       │   └── aggregate-report-{date}.md          ← intermediate artifact
│       ├── content/social/                          ← finished work
│       └── deliverables/handoffs/                   ← shipped engagements
│           └── social-week-2026W18.zip
├── .styles/celavii/
│   ├── voice.json                                  ← brand voice (NN/g 4-D)
│   └── brand.json                                  ← visual identity tokens
└── skills/                                          ← who works here

~/dev/openclaw/skills/                              ← source of truth for skills
├── social-orchestrator/                             ← Studio Director
│   ├── SKILL.md
│   ├── commands/                                   ← briefs
│   │   ├── social-strategy.md
│   │   ├── social-curate.md
│   │   ├── social-post.md
│   │   └── social-help.md
│   └── references/                                 ← knowledge management
│       ├── intake-questions.md
│       ├── parallel-subagent-spawn.md
│       ├── industry-aware-delegation.md
│       └── ...
├── social-aggregate/                                ← a specialist
│   ├── SKILL.md
│   ├── scripts/aggregate.py                         ← the specialist's tool
│   ├── references/scoring-rubric.md
│   └── fixtures/raw/                                ← test data
├── social-brief/                                    ← another specialist
├── social-quality/                                  ← Senior Partner (critic)
└── ...                                              ← 17 atomic skills total

~/dev/openclaw/.claude/rules/
└── social-constitution.md                           ← the firm's values
```

Three things to notice from the floor plan alone:

1. **Two repositories meet here.** `openclaw/skills/` is the source of truth — versioned, code-reviewed, the place where the studio's know-how is recorded. `workspace/` is where work happens for clients. Skills are symlinked from openclaw into workspace so changes propagate instantly.
2. **The state file is one file.** Every engagement's progress lives in a single JSON file. Not a database, not a Redis instance, not a queue. A file. We'll come back to why.
3. **The constitution is outside the studio.** It lives in `.claude/rules/`, not inside any one specialist's directory. That's deliberate: values are firm-level, not departmental.

### 2. The Studio Founder

Before any work happens, someone — a human, in version 1 — has to set up the studio. They write three things:

- **The constitution** (`.claude/rules/social-constitution.md`) — the firm's values, expressed as numbered articles. _"Every claim that survives Gate C must be specific."_ _"The critic and the generator must be different models."_ _"Save rate beats like rate."_ These are not access controls or guardrails. They are the firm's identity.
- **The voice spec** (`workspace/.styles/celavii/voice.json`) — the brand's personality, encoded as a four-dimensional vector (per the NN/g model: humor, formality, respectfulness, enthusiasm) plus channel overrides, banned phrases, and tone-by-context rules.
- **The brand spec** (`workspace/.styles/celavii/brand.json`) — visual tokens (colors, typography, taglines) — relevant any time the studio produces something visual.

The Studio Founder writes these once, then hands them to the studio. Every specialist, every partner, every brief loads them at runtime. They are _the_ singular source of identity for the firm.

A reasonable question: why not put values in code? Because values change with reasoning, not with versioning. When a new banned phrase comes up — say, an industry term that's gone toxic — the Founder edits the constitution, and the next engagement reads the new value. No deployment, no tests, no migration. The studio's values are mutable prose, like any company's values.

### 3. The Studio Director

The Studio Director is the agent that walks in the door when a client asks for work. In our system, they are a **single markdown file** — the orchestrator's `SKILL.md`.

For Social Studio, that's `social-orchestrator/SKILL.md`. It contains:

- **The studio's identity and competencies**, in prose. Who we are, what we do, how we think.
- **A pre-flight checklist**: load the engagement state, load the voice, load the constitution, load the intake. _No work starts before these are loaded_. A specialist that scores something without reading the firm's values is producing low-trust output.
- **A routing table** — the Director's mental model of who does what. _"If the request is about weekly content, read `commands/social-curate.md`. If it's about hooks, read `social-hooks/SKILL.md`."_ The routing table is exhaustive, by design — every plausible client request maps to a sub-skill.
- **An implementation status map** — which specialists have working tools today and which are contract-only (described in prose but not yet executable). When a specialist's tool is missing, the Director knows to fall back to underlying primitives. This is the explicit "harden as we go" mode, recorded in the orchestrator itself.
- **Constitutional principles, inlined for fast reference** — anti-slop rubric, hook archetype taxonomy, the firm's quality bar. These appear in the Director's own file because they're consulted constantly.
- **A list of references** — the studio's own knowledge base, read on demand.
- **A help block** — what to do if a client says "what can you do?"

The Director is, in technical terms, a long prompt. But functionally, the Director is the first agent the client meets and the last agent the client hears from. They speak for the studio.

### 4. The Account Executive

When the Director takes a request, the next thing they do is open the relevant brief. A **brief** is a markdown file in `commands/` describing one type of engagement: how to scope it, what phases it has, who works on it, what gets delivered. Examples:

- `commands/social-strategy.md` — full 7-phase strategy engagement, two-to-three hours of work, $11.70 LLM + $1 Apify
- `commands/social-curate.md` — weekly production engagement, twenty-two minutes, $6.80
- `commands/social-post.md` — single-post production engagement, four minutes, $0.66

Briefs are written like the engagement letters a law firm sends to a new client: scope, deliverables, cost, time, escalation paths. They are _not_ configuration files — they are _prose descriptions of how this kind of work gets done at this firm_. The model reads the brief and executes it.

Every brief has an **intake flow** if the engagement requires scoping. The intake flow is a sequence of questions, asked one at a time, that builds a scope. For Social Studio's full strategy engagement, the intake is five questions:

1. Channels — which brands or personas are we planning for?
2. Identities — for each channel, what's the handle on each platform and what's the one-line identity?
3. Goal — single sentence: what should this strategy accomplish in ninety days?
4. Competitors — top three per channel, any platform.
5. Voice rules — forbidden phrases, required terms; defaults from voice.json.

Five questions. Asked one at a time. Telegram-friendly.

This isn't a form. It's a sales call. The Account Executive — whose job is to gather the right brief — knows that _real briefs come from conversation_, not from parameters. A client who fills out a five-field form gives you data. A client who answers five questions in sequence gives you intent. The downstream work is dramatically better when the brief carries intent.

### 5. The Specialists

Once the brief is captured, the Director opens it and starts walking the engagement. Each step routes to a specialist.

A **specialist** is an atomic skill — one markdown file in its own directory, plus zero or more scripts, references, and fixtures. One job, one specialty, one set of tools. Examples from Social Studio:

- `social-discover` — pulls profiles, posts, hashtags from Celavii's scrape API
- `social-aggregate` — runs a deterministic Python script over raw data, produces a scored topic list
- `social-brief` — writes a per-post brief given research input
- `social-hooks` — generates five archetype-tagged hook variants per post
- `social-script` — writes long-form video scripts with an eight-pass humanizer
- `social-shotlist` — converts a script into a camera + b-roll + on-screen-text breakdown
- `social-quality` — applies the firm's quality rubric in three modes: silo-check, Gate A, Gate B, Gate C
- `social-cannibalization` — does conflicts checks (does this duplicate something we've already done?)
- `social-persona` — enforces voice on draft output
- `social-drift` — keeps an SQLite cache of historical baselines for engagement trend tracking

A specialist's `SKILL.md` is structured to teach the model how to do that specialist's job:

```markdown
---
name: social-aggregate
description: >
  Deterministic Phase 3 aggregator for the social-agents pipeline. Reads
  raw/*.json (profiles, posts, hashtags, competitors), scores topics,
  clusters posts by cosine similarity, tags hooks by archetype + 4E, ...
user-invocable: true
metadata: { ... }
---

# social-aggregate

> Phase C. Mirrors workspace/skills/seo/scripts/seo-aggregate.py ...

## CLI

social-aggregate run --social-dir projects/celavii/research/social

## Inputs

Reads from {social-dir}/raw/:
| Pattern | Source skill |
| celavii-{handle}-{platform}-profile-{ts}.json | social-discover |
| ...

## Outputs

aggregate-report-{date}.json (full structured payload)
aggregate-report-{date}.md (LLM-readable summary, ~2K tokens)

## Scoring rubric

...
```

A specialist's file always answers: who I am, what I do, what I read, what I write, how I'm called, what I cost, how I integrate with the rest of the studio. Reading a SKILL.md should feel like reading a job description — because it is one.

A specialist may have a script (`scripts/aggregate.py`) — that's their tool. Specialists without scripts are _contract-only_: described in prose, executed by the model itself reading the prose. We'll talk later about why both forms exist and when to upgrade from one to the other.

### 6. The Senior Partners

A specialist produces a draft. Before it ships, a **Senior Partner** reviews it.

In our codebase, partners are the `social-quality` skill, run in different modes. The same skill, different modes — like a senior associate who can wear different hats depending on what review is needed.

- **Silo Check** (light review) — does this stay within the pillar topic, or has it drifted into adjacent silos?
- **Gate A** (strategic alignment review) — does the strategy match the client's stated intake?
- **Gate B** (plan quality review) — does the calendar pass cannibalization checks, cadence rules, and repurposing-loop validity?
- **Gate C** (per-post quality review) — does the finished post meet the firm's eight-axis quality rubric?

Three rules govern partners:

1. **The partner reads the firm's values before reviewing.** Article 6 of the Social Constitution requires every gate to load `state.intake` first. A partner who scores without reading the brief is producing low-trust output. Verification: the partner's review must cite at least two specific elements from the intake. If they don't, the review is contaminated and re-run.
2. **The partner uses a different model than the specialist.** Article 7. The default in version 1 is Sonnet generates, Opus critiques. Same-model self-critique produces false agreement — the model is too kind to its own output. This rule is non-negotiable: if generator and critic are the same model, the gate fails before scoring even happens.
3. **The partner's verdict is final after three iterations.** Article 8 (the Reflexion finding). After three failed gate runs, the work escalates to human review. The system does not auto-iterate beyond that, no matter how clever it gets, because the research literature is clear: returns diminish past three to five iterations.

The partner doesn't gatekeep arbitrarily. They cite which constitutional articles the work satisfied or violated. A failed gate produces actionable findings, not just a score.

### 7. The Project Manager

Throughout the engagement, the Project Manager is keeping the file moving. In our system, the Project Manager is not a person — it is the **engagement file**, a single JSON document on disk.

```jsonc
// social-strategy-state.json
{
  "version": 3,
  "project": "celavii",
  "intake": { /* the brief */ },
  "phases": {
    "acquire":   { "status": "complete", "raw_files": [...] },
    "discover":  { "status": "complete", "baselines": {...} },
    "analyze":   { "status": "complete", "patterns": {...} },
    "aggregate": { "status": "complete", "report_path_md": "..." },
    "plan":      { "status": "complete", "publication_calendar": [...] },
    "deliver":   { "status": "complete", "briefs": [...] },
    "report":    { "status": "complete", "pdf_path": "..." }
  },
  "gates": {
    "A": { "iteration": 1, "status": "pass", "critic_model": "opus", ... },
    "B": { "iteration": 1, "status": "pass" }
  },
  "weekly_cycles": [ /* every weekly engagement that ran */ ]
}
```

Every specialist who works on the engagement reads this file and writes back to it. The Director reads it to know what phase to start. A partner reads it to know what to review. A weekly engagement (`/social_curate`) appends a record. A single-post regeneration (`/social_post`) updates one entry.

The engagement file is the project manager because:

- **It carries continuity.** Any session can pick up where the last left off by reading the phase statuses.
- **It enables handoffs.** If a specialist's run is interrupted, another specialist (or another model, or another agent process) can pick up by reading the file. No inter-agent messaging needed; the file is the message.
- **It's auditable.** `git log` on the engagement file shows every decision the system made.
- **It survives restarts.** Process state is volatile; files persist.

A common question: why not Redis, Postgres, an event log? Because none of those are _more shared_ than a file in a workspace. Every agent already knows how to read JSON. Every model already understands the structure. There's nothing to install, configure, or migrate. Files are the lowest-common-denominator coordination primitive.

The cost: files don't enforce schemas. We mitigate this with explicit schema docs (`SOCIAL-STRATEGY-STATE-SPEC.md` for Social Studio) and aggressive use of `jsonc` examples in the orchestrator and briefs. The model learns the schema from prose, not from a JSON Schema validator. So far, this works.

### 8. The Filing Cabinet

Alongside the engagement file is the **filing cabinet** — the `raw/` directory. Every tool output, every scrape, every API response is saved as a timestamped file:

```
raw/
├── celavii-celaviihq-instagram-profile-2026-04-28.json
├── celavii-celaviihq-instagram-posts-2026-04-28.json
├── celavii-celaviihq-tiktok-profile-2026-04-28.json
├── celavii-modaberlin-tiktok-posts-2026-04-28.json
├── celavii-hashtag-agentic-tiktok-2026-04-28.json
└── ...
```

Three rules govern the filing cabinet:

1. **Every tool output is saved.** No exceptions. The same scrape, run twice, produces two timestamped files.
2. **Files are never overwritten.** New runs make new files. The historical record is sacred.
3. **The engagement file references files, not data.** `state.phases.acquire.raw_files: ["raw/celavii-...json", ...]` — the JSON document doesn't embed the scrape data, it points at the file. This keeps the engagement file readable and lets specialists load only what they need.

This pattern matters for two reasons. First, it makes the studio's work _replayable_: a future engagement can re-run analysis against historical raw data without re-paying for the scrape. Second, it makes failures _recoverable_: if `social-aggregate` had a bug and produced a bad report, you can rerun it against the same raw files and get a fixed report — no need to re-scrape the world.

This is what real organizations do. Law firms keep every email, every contract draft, every memo, in a case folder. Design studios keep every revision in a project archive. _Data is never disposable._ The Department Model treats agentic work the same way.

### 9. Knowledge Management

A studio that's been operating for a while accumulates know-how. Hook archetypes that work in this industry. Cadence rules that hold up. Format-fit constraints per platform. The patterns of past engagements.

In a law firm, this is the _knowledge management_ function — the practice library, the precedent database, the senior partner's shelf of memos. In our system, it's distributed across three places:

- **`references/` directories under each skill** — the skill's own institutional knowledge. `social-orchestrator/references/intake-questions.md` describes how to run an intake well. `social-aggregate/references/scoring-rubric.md` describes how to weight composite scores.
- **`fixtures/` directories under each skill** — frozen examples that document the contract. `social-repurpose/fixtures/agentic-shift-fanout.md` describes what a good fan-out from a specific blog post should look like; the script must produce output matching it.
- **The memory system** — a persistent embedded vector store at `~/.claude/projects/.../memory/MEMORY.md` plus its source files. This holds user-level facts ("the user is a data scientist") and project-level facts ("the celavii blog uses elioth-fraijo as the canonical author"). Every conversation can read and update memory.

Knowledge management is what makes the studio _get better over time_. The first engagement is harder than the tenth, because the tenth has the references the first wrote, the fixtures the first verified, and the memory the first left behind.

A studio without knowledge management is a studio that re-learns the same lessons every engagement. The Department Model insists every studio invest in references and fixtures from the start.

### 10. The Wall Calendar — Operating Model

There's one more thing in the studio: the **operating model**, the conventions every studio shares. They aren't written down in any single file, because they're conventions, not code. But they're real, and a new joiner needs to know them:

- **Skills are markdown files with YAML frontmatter, executed by the model.** Every skill has a `name`, `description`, optional metadata, and prose body. The model reads the body and acts on it.
- **Every studio has one orchestrator and many specialists.** Never two orchestrators per studio. Never a specialist that doesn't have an orchestrator routing to it. (This is the firm's organizational chart, in convention form.)
- **Every long-horizon engagement has a state file.** Never engagement state in memory. Never engagement state spread across many files. One file, one engagement.
- **Cross-model critic at every gate. Three-iteration cap. Constitutional anchor.** These are the firm's quality rules; they hold across studios.
- **`raw/` is sacred. State references files, not data. Files are timestamped, never overwritten.** The filing convention.
- **The intake conversation gathers intent, not parameters.** Five questions, one at a time, Telegram-friendly. Always.

When a new studio is being designed (Part IV below), every one of these conventions transfers automatically. The new studio gets to focus on _what it does differently_ — its specialists, its briefs, its specific quality bar — without having to re-decide the conventions.

That's the value of an operating model. It's the studio's table of received decisions.

---

## Part II — A Day in the Studio

Let's watch a single engagement run. This is a real example, dated, with file paths a reader could click through. The engagement: a Telegram user asks Social Studio to plan next week's content for the celavii brand.

### The setup

- Today's date: 2026-04-29 (a Wednesday)
- Next week: 2026-W18 (Monday May 4 through Sunday May 10)
- The client has already run `/social_strategy` last quarter, so a publication calendar exists
- Calendar has eight posts scheduled for 2026-W18 across three channels
- Two of those posts are videos; six are static
- The user types into Telegram: _"Curate next week's content for celavii."_

### Minute 0 — The Telegram channel routes to a model agent

The agent receives the user's text. It scans available skills and recognizes that this is social work. It loads `social-orchestrator/SKILL.md`. (Loading a skill means: reading the markdown into the model's context window. There's no library to install.)

### Minute 0 — The Director's pre-flight

The orchestrator skill begins with a CRITICAL block that tells the model: before doing anything, load four things — the engagement file, the voice spec, the constitution, and the intake.

Here's the actual block from `social-orchestrator/SKILL.md`:

```markdown
## ⚠️ CRITICAL: Read State + Constitution Before Any Work

BEFORE any analysis, scoring, or content generation, you MUST load:

1. State file: ~/dev/workspace/projects/celavii/research/social/social-strategy-state.json (v3)
2. Voice spec: ~/dev/workspace/.styles/celavii/voice.json (NN/g 4-D vector + tone-by-context)
3. Constitution: ~/dev/openclaw/.claude/rules/social-constitution.md (anti-slop rubric, banned language, gate principles)
4. Intake: state.intake — channels, identities, goal, competitors, voice rules.
   Critic gates that score without reading intake fail.

If any of those are missing, stop and report the missing artifact. Do not guess.
```

The model loads all four. The intake says the client is celavii, the goal is _"300 qualified Celavii demos via TikTok + IG,"_ competitors are modaberlin, grin, and upfluence. The voice says snappy and demo-driven for CutMaster; educational and data-rich for Celavii; first-person and candid for Elioth. The constitution says the ten articles, including Article 5 which bans the phrase _"all-in-one"_.

Why this pre-flight matters: a partner who scores work _without_ reading the intake will score generically — they'll catch slop language but miss whether the work matches the client's actual goal. A partner who reads the intake first scores _this work, for this client, against this brief_. The difference is the difference between a junior associate's review and a senior partner's review.

### Minute 0 — Routing the request

The orchestrator's routing table maps _"curate next week's content"_ → `commands/social-curate.md`. Here's the relevant row:

```markdown
| Task Type       | Sub-Skill                                     | When to Use                             | Min Tools |
| --------------- | --------------------------------------------- | --------------------------------------- | --------- |
| Weekly curation | social-orchestrator/commands/social-curate.md | "this week's content", "curate week X", | 6+        |
|                 |                                               | /social_curate                          |           |
```

The routing table is exhaustive. Every plausible client phrasing has a row. The model picks the row whose "When to Use" column matches the user's text and follows the path in the second column. This is a deliberately _boring_ dispatch — no fuzzy matching, no learned classification, just a table the model reads top to bottom.

The model reads `commands/social-curate.md`. The brief tells the model: this is a weekly production engagement. Resolve the target week. Slice the calendar for that week. For each post, run the per-post sub-skill chain. Collect the results into a bundle. Update state. Hand off to the user.

### Minute 1 — Resolve the week and check idempotency

The model parses "next week" as 2026-W18 (using the alias `next` defined in the brief). It computes the ISO week bounds: Monday May 4, 00:00 to Sunday May 10, 23:59:59 in the user's timezone. It reads `state.phases.plan.publication_calendar`, filters to entries in those bounds. Eight posts.

It also reads `state.weekly_cycles[]` and checks: has 2026-W18 already been curated? No. Begin.

### Minute 1 — The first post

The first post, as it appears in the engagement file:

```jsonc
{
  "post_id": "celavii-ig-carousel-001",
  "channel": "celavii",
  "platform": "instagram",
  "format": "carousel",
  "scheduled_for": "2026-05-04T14:00:00-05:00",
  "pillar_id": "p-001-agentic-marketing",
  "e_tags": ["educate", "empower"],
  "hook_archetype_target": "authority",
}
```

Eight fields, deliberately small. Each field carries one constraint: the channel locks voice; the platform locks format constraints; the format locks the brief shape; the pillar locks the topic; the archetype target locks the hook style; the e-tags lock the 4E mix. None is redundant.

The orchestrator's routing table tells the model: a per-post production calls these specialists in order — research, citations, hooks, brief, (if video) script + shotlist, silo-check, Gate C.

Each specialist's SKILL.md tells the model how to do its specific job. The model walks the chain.

For this post, the model:

1. **Specialist: social-research.** The model reads `social-research/SKILL.md`. The SKILL says: pull background research on the pillar topic from web search and the client's existing blog, produce a research packet. The model invokes `web_search` and `web_fetch` (the firm's research tools), gets results, distills them into a packet, writes it to `briefs/celavii-ig-carousel-001-research.md`.
2. **Specialist: social-research, mode=citations.** Same skill, different mode. The model extracts every claim with a source, structures them into a citations file, writes `briefs/celavii-ig-carousel-001-citations.md`.
3. **Specialist: social-hooks.** The model reads `social-hooks/SKILL.md`. The SKILL describes five archetype patterns and a four-axis scoring rubric. The model generates five variants (one per archetype where channel-affinity allows), tags each, scores each. Writes `briefs/celavii-ig-carousel-001-hooks.md`. The primary hook (the highest scorer in the targeted archetype, _authority_): _"I scored 5,000 creator profiles last night. Here's what the agent found."_
4. **Specialist: social-brief.** The model reads `social-brief/SKILL.md`. It synthesizes research + citations + hooks into a per-post brief — eight-slide outline for the carousel, cover slide copy, CTA slide copy, hashtag mix, success metrics. Writes `briefs/celavii-ig-carousel-001-brief.md`.
5. **No video.** Format is carousel; the model skips `social-script` and `social-shotlist`.
6. **Senior Partner: social-quality, mode=silo-check.** The model loads the partner's SKILL.md. The SKILL says: read the pillar definition + the brief; verify the brief stays inside the pillar's silo. The model concludes the brief is within `p-001-agentic-marketing` (it doesn't drift into `p-007-creator-economy-trends`, an adjacent pillar). Pass.
7. **Senior Partner: social-quality, mode=gate-c.** Same skill, full review. The model loads the constitution, the intake, the voice. It scores the brief on eight axes: specificity, novelty, sourced claims, distinctive POV, no banned language, hook archetype fit, format fit, save-rate prediction. Composite: 8.4. Pass (threshold is 7.5). Writes `briefs/celavii-ig-carousel-001-gate-c.md` with the score breakdown and citations from the intake (per Article 6).

That's one post. The orchestrator updates `state.phases.deliver.briefs["celavii-ig-carousel-001"]` with paths and the Gate C score.

### Minutes 2–22 — The other seven posts

The same chain runs for the next seven posts. Two are videos (Tuesday's TikTok and Saturday's Reel), so for those the model also runs `social-script` and `social-shotlist` between brief and silo-check. One post fails Gate C with a score of 6.8 (a hook archetype mismatch — the targeted archetype was authority but the highest-scoring variant came in at curiosity gap, and the partner flagged it). The brief gets retried once with an explicit pillar reminder; the second attempt also misses 7.5. The post gets flagged for human review and the chain moves on.

### Minute 22 — Bundle assembly

All eight posts are processed. Seven passed Gate C; one is flagged. The orchestrator builds the handoff bundle:

```
deliverables/handoffs/social-week-2026W18/
├── README.md                      ← index
├── briefs/                        ← copies of week's briefs (7 + 1 flagged)
├── hooks/
├── citations/
├── scripts/                       ← only the 2 video posts
├── shotlists/
└── gate-c-scores.json             ← machine-readable per-post scoring
```

It zips the bundle (`social-week-2026W18.zip`), appends a record to `state.weekly_cycles[]` with `status: "partial"` (because of the one flagged post) and `cost_actual_usd: 5.20`, and reports back to Telegram:

> _Done. Curated 2026-W18: 7 of 8 posts passed Gate C; 1 flagged for human review (celavii-ig-reel-004 — hook score 5.2). Bundle: `deliverables/handoffs/social-week-2026W18.zip`. Want me to walk you through the flagged post, or push everything to celavii-social for execution?_

Total wall time: twenty-two minutes. Total cost: $5.20.

### What just happened

A user typed eight words. A studio did a week's worth of production. The studio ran on prose: every step the model took was driven by reading a markdown file and following its instructions. Every artifact produced is in a file the user can open. Every decision the system made is recorded in the engagement file. The user could have stopped the engagement halfway and resumed tomorrow; they could have asked Telegram for a status check at any point; they could have edited the calendar mid-engagement and the next run would have respected the edit.

This is what a Department Model studio looks like in motion. The point of the model is to make this kind of run _normal_, not exceptional.

---

## Part III — How Work Flows

The day-in-the-studio example shows one engagement type. Generalizing: every engagement in a Department Model studio follows the same lifecycle.

### The engagement lifecycle

```
                          ┌───────────────────────────────────────────────┐
                          │                                               │
                          ▼                                               │
   ┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌──────────┐       │
   │  INTAKE  │ ─▶ │   PHASE n    │ ─▶ │  GATE k  │ ─▶ │  PHASE   │ ─────┤
   │  (5 Qs)  │    │ (specialist  │    │ (partner │    │   n+1    │       │
   │          │    │   work)      │    │  review) │    │          │       │
   └──────────┘    └──────────────┘    └─────┬────┘    └──────────┘       │
                                             │                            │
                                       fail? ▼                            │
                                       ┌──────────┐                       │
                                       │ Re-do    │ (cap: 3 iterations)   │
                                       │ phase    │ then escalate          │
                                       └──────────┘                       │
                                                                           │
                                                       last phase complete │
                                                                           ▼
                                                                    ┌──────────┐
                                                                    │ DELIVERY │
                                                                    │  bundle  │
                                                                    └──────────┘

  All artifacts → ENGAGEMENT FILE (the project manager) + raw/ (the filing cabinet)
```

The lifecycle is iterative within phases (a gate failure routes back to the most recent producing phase) but linear across phases (once gate k passes, phase n+1 starts; the engagement doesn't wander backwards through earlier phases).

**Intake** — five-or-so questions, one at a time, that build the brief. Locked once captured (`intake.locked = true`). Subsequent runs against the same engagement reuse the intake unless the client explicitly resets.

**Phases** — the engagement's structured progression. Social Studio's full strategy engagement has seven: acquire, discover, analyze, aggregate, plan, deliver, report. SEO Studio has six. Blog Studio has five. The phase count is _domain-specific_; what's universal is that each phase reads from state, does its work, writes back to state, and surfaces a checkpoint for the user.

**Gates** — quality reviews, performed by Senior Partners, between certain phases. Gates are _cross-model_ (the partner uses a different model than the specialist), _intake-aware_ (the partner reads the brief first), and _capped at three iterations_ (after three fails, escalate to human). A gate that fails routes the engagement back to a remediation phase, not all the way back to the start.

**Delivery** — the final artifact handed to the client. A PDF, a zipped bundle, a calendar, a deck. Delivery includes the engagement file in some form, so the client can resume or reference the engagement later.

### The phase pattern

Every phase in the Department Model has the same shape:

1. **Read state.** What's already been done? What inputs are available? What's the current phase status?
2. **Do work.** Run specialists. Save outputs to the filing cabinet (`raw/`).
3. **Update state.** Mark this phase complete; record what was done; reference the new files.
4. **Checkpoint.** Surface a status to the user. Sometimes pause for confirmation; sometimes auto-continue.

Phases can be _deterministic_ (Phase 3 of Social Studio's strategy is a Python script that runs in five seconds) or _agentic_ (Phase 4 of the same engagement runs an LLM to produce a calendar). The pattern is the same either way.

### The gate pattern

Every gate has the same shape:

1. **Pre-flight: load constitution, intake, state.** Article 6 requires this. Skipping it produces low-trust output.
2. **Score against constitution articles, not just thresholds.** "Does this satisfy Article 1 (specificity)? Does it pass Article 5 (no banned language)? Does it match the goal stated in `intake.goal`?"
3. **Cite at least two intake elements in the output.** The verification rule: if the partner's review doesn't cite at least two of (a phrase from `intake.channel_identities`, a competitor name, the goal verb, a banned-language item), the review is contaminated and re-run.
4. **Cross-model.** Generator and critic must be different models. Default: Sonnet generates, Opus critiques.
5. **Cap at three iterations.** After three fails, escalate to human review. Do not auto-iterate further.
6. **Record the gate result in state.** `state.gates.{A,B,C}.iteration`, `status`, `score`, `findings`, `critic_model`, `generator_model`.

The gate pattern is the firm's _governance_. Every studio enforces it because it's part of the operating model.

### Idempotency and resumability

A property of the file-driven approach: every engagement is _idempotent_. Running `/social_curate week=2026-W18` twice produces the same bundle the second time, because the second run reads the engagement file, sees that 2026-W18 is already done, and skips. Re-running with `force=true` re-executes the work but produces the same output.

Resumability falls out of the same pattern. If an engagement is interrupted at phase three of seven, running `/social_strategy resume` reads the state, sees that phase three's status is `incomplete`, and resumes there. No special checkpoint logic; the state is the checkpoint.

### Conflicts checks

Some engagements need to ensure they don't duplicate prior work. Social Studio's calendar planner runs a _cannibalization check_ — cosine similarity between any two planned posts within a thirty-day window — to avoid shipping two near-duplicates that would split engagement signals. SEO Studio runs a similar check for keywords (don't optimize two pages for the same keyword). Blog Studio runs one for content topics.

This is the law-firm _conflicts check_: before taking on a new engagement, verify it doesn't conflict with existing engagements. The Department Model treats conflicts checks as a built-in studio function, not an afterthought.

### Communication between studios

In version 1, studios mostly don't communicate. Each studio runs its own engagements, manages its own state, ships its own deliverables. When studios _do_ need to share information — say, Social Studio wants to know what blog posts Blog Studio published last quarter, to use them as repurposing pillars — they do so by _reading each other's files_, not by calling each other.

This is how real departments work. Marketing and Engineering don't have an API; they have shared documents. A weekly meeting. Some Slack channels. Same here: studios share via the workspace's file system, not via an inter-skill protocol.

The benefit: no coupling. Studios can be added, removed, or revised without affecting other studios. The cost: some duplication (each studio has its own intake flow, even though they're similar). We accept the duplication.

---

## Part IV — Building a New Department

Suppose you want to start a new studio — say, Sales Studio (qualifying leads, building decks, drafting outreach) or Research Studio (long-form research engagements, market analysis, literature reviews) or Compliance Studio (contract review, regulatory analysis, audit prep). What do you do?

The Department Model has a six-phase pattern, refined through building Social Studio (and observing SEO and Blog studios that came before). It is prescriptive — every step matters and the order matters.

### Phase A — Foundation

Before a single specialist exists, lay down four artifacts:

1. **The studio's pre-flight identity.** A short prose statement of what the studio does, who it serves, what it's not. This becomes the opening of the orchestrator's SKILL.md. Length target: three to six paragraphs. It should make a new joiner feel oriented in under two minutes.
2. **The constitution.** Eight to ten articles, _no more_. Each article is a non-negotiable principle: an anti-slop rule, a quality threshold, a banned behavior, a value claim. The rule of thumb: every article must earn its place. Padding the constitution dilutes critic attention.
3. **The voice spec.** If the studio produces client-facing writing, encode the voice in a structured file (`voice.json`) — the NN/g 4-D vector plus channel overrides plus banned phrases. If the studio's output is mostly internal (Compliance Studio writing memos, say), this can be lighter.
4. **The state schema.** A `STATE-SPEC.md` file describing the engagement file's shape. Phases, gates, intake structure, deliverables. This is the project manager's job description, written down.

These four are written by a human. They aren't generated. They aren't auto-discovered. The Studio Founder authors them.

A Phase A constitution article looks like this — short, declarative, with a name and a justification:

```markdown
## Article 1 — Specificity (Anti-Slop)

Every claim that survives Gate C must be specific.
Specificity = (real numbers + named entities + concrete examples) per 100 words.
Minimum: 7 per 100 words.

Test: "AI is changing the landscape of marketing" → fails.
"Modash dropped Reels analytics in 2023; we never had to" → passes.
```

Three things to notice. First, the article _names itself_ — "Specificity (Anti-Slop)" — so a partner can cite it as "Article 1" or "the specificity rule." Second, the rule is _operationalized_ — there's a numeric threshold a critic can apply. Third, there's a _test_, an example of what passes and what fails. A partner reading the article gets enough to apply it without further interpretation.

When you write a constitution, every article should have those three properties. If you can't operationalize an article, soften it to a principle — but don't pretend a vague principle can be enforced as a hard rule.

For Social Studio, Phase A took about a week — partly because we were also figuring out the methodology itself. Subsequent studios should be faster, since the methodology is now codified in this document.

A reasonable scope check before leaving Phase A: read the constitution to a colleague who's never seen the studio. If they can predict what Gate C will reject, the constitution is operational. If they have to ask "what does that mean in practice?" — keep tightening.

### Phase B — Atomic Specialists

Now write SKILL.md files for the specialists. _Just the contracts, not the implementations._ Every specialist gets:

- YAML frontmatter (`name`, `description`, `user-invocable: true`, optional `metadata`)
- A short identity paragraph (who I am, what I do)
- Modes (if the specialist has more than one — e.g. `social-quality` has gate-a, gate-b, gate-c, silo-check)
- Inputs (what files I read)
- Outputs (what files I write)
- A CLI signature (how the orchestrator calls me)
- Cost estimate
- Integration notes (who calls me, who I call)
- A `## Status` block listing my current implementation state (`scaffold`, `partial`, `complete`)
- A `references/` subdirectory with my own knowledge base
- A `fixtures/` subdirectory if I have testable contracts

A specialist's frontmatter and identity paragraph look like this:

```markdown
---
name: social-aggregate
description: >
  Deterministic Phase 3 aggregator for the social-agents pipeline. Reads raw/*.json
  (profiles, posts, hashtags, competitors), scores topics, clusters posts by cosine
  similarity, tags hooks by archetype + 4E, computes velocity/acceleration/z-score
  trend signals, and emits a single LLM-readable markdown report (~2K tokens).
  No LLM in aggregation — this is the cost unlock.
user-invocable: true
metadata: { "openclaw": { "emoji": "📊", "requires": { "env": [] } } }
---

# social-aggregate

> Phase C. Mirrors workspace/skills/seo/scripts/seo-aggregate.py (1009 lines,
> deterministic). Same contract: many raw JSONs in → one structured report out.
> The LLM never reads raw files.
```

The `description` is what the gateway / orchestrator sees when it scans available skills. It needs to be specific enough that the routing decision is unambiguous. _"Aggregator"_ is too vague; _"Deterministic Phase 3 aggregator that reads raw/_.json and emits a scored report"\* is unambiguous.

_Don't write scripts yet._ Contract-only specialists are fine. The orchestrator's implementation status table tells the model when a specialist is contract-only and to fall back to underlying primitives.

How many specialists? Social Studio has seventeen. SEO Studio has nineteen. Blog Studio has fifteen. The rule of thumb: one specialist per atomic job. If a specialist's job description is more than three concise sentences, split it into two specialists. If two specialists' job descriptions blur into each other, merge them.

A common Phase B mistake is _over-decomposition_ — splitting work into more specialists than the studio can support. Twelve specialists, each doing a tiny piece, with so much coordination overhead that the orchestrator becomes a switchboard. Better to have eight or ten meaningful specialists than twenty small ones. Read the SKILL.md aloud: if the work could plausibly be done by one person in a week with the right tools, it's the right size for one specialist. If it sounds like a one-hour task, merge it.

This phase is the bulk of the Department Model setup. For Social Studio, it took about a week and produced thirteen new specialist contracts (in addition to four pre-existing ones).

### Phase C — A Deterministic Aggregator

Every studio benefits from at least one deterministic specialist that does heavy data-processing without an LLM. For Social Studio it's `social-aggregate`, a Python script that reads raw scrape data, scores topics, detects cannibalization clusters, tags hooks by archetype, computes velocity / acceleration / z-score on trend signals, and emits a single LLM-readable report (~2K tokens) plus a full structured JSON.

The deterministic aggregator matters because it is the _cost unlock_. Without it, downstream LLM calls have to read every raw JSON to do their analysis, paying for tokens on data the model doesn't need. With it, the LLM reads one short report. SEO Studio's aggregator is ~1000 lines of Python; Social Studio's is ~530. Both run in under five seconds on real-world inputs.

The trade-off the aggregator captures: _what is appropriate work for an LLM, and what isn't?_ Computing pairwise cosine similarity across 1,000 posts is not LLM work — it's a stdlib `math` operation, and asking an LLM to do it would be slow, expensive, and non-deterministic. Tagging which hook archetype a post uses, on the other hand, _could_ be LLM work, but if the archetype is detectable by regex against the hook text, the regex is faster and cheaper.

The aggregator is where you push every step that doesn't _require_ a model. The downstream LLM calls then do work that _only_ a model can do well: judgement, synthesis, prose generation, evaluation against context-dependent criteria.

Build this specialist _first_. It informs the schema for everything else: the raw-file naming convention, the topic-scoring rubric, the cannibalization threshold, the report format. Once the aggregator's outputs are stable, every downstream specialist is downstream of _one stable input_, not eight unstable raw inputs.

A useful sequencing tip: the deterministic aggregator forces you to commit to the _output_ schema before you build the consumers. Subsequent specialists can be authored against the aggregator's output JSON, with confidence that the input shape won't drift. This is the Department Model's equivalent of _contract-first development_.

### Phase D — The Studio Director and the First Brief

Now write the orchestrator's SKILL.md and the first command brief.

The orchestrator gets:

- The studio's identity
- The pre-flight checklist (state, voice, constitution, intake)
- The routing table (covering every plausible request)
- The implementation status map (what's callable today vs contract-only)
- Constitutional principles, inlined for fast reference
- The reference list
- A help block

The first command brief is usually the _full strategy_ engagement — the one that runs all phases end-to-end. It includes:

- The intake flow (the five-or-so questions)
- The phase-by-phase walkthrough
- Cost and time estimates
- The execution model (per-phase generator and critic models, thinking levels)
- Cross-model critic and iteration cap rules, encoded explicitly
- A help block

Author one or two reference docs the brief depends on (the intake questions, the parallel-spawn pattern, the format-as-channel rule, etc.) — but only if they're already factored out of the brief. Don't pre-emptively split prose.

### Phase E — The Recurring Brief

After the strategy brief works, write the recurring engagement: weekly curation, monthly audit, quarterly refresh — whatever the studio's cadence is. This brief reuses the strategy's intake but does a slice of work.

For Social Studio, this is `/social_curate week=YYYY-Wnn`. The user runs it once a week to produce that week's content bundle.

The recurring brief is dramatically cheaper to design than the strategy brief, because it inherits the strategy's intake, state schema, and specialist chain.

### Phase F — The Single-Unit Brief

Lastly, write the single-unit brief: regenerate one post, one page, one deck, one memo. This is what the user runs when something failed in the recurring engagement and they need to redo just that thing.

For Social Studio, this is `/social_post post_id={id}`. It shares the per-post chain with `/social_curate` but has different scope, output, and state target.

You now have three callable engagement types: full strategy, recurring weekly, single unit. That's enough to drive almost all client work.

### The cumulative result

After these six phases, the studio has:

- A constitution
- A voice spec
- A state schema
- An orchestrator
- Twelve to twenty specialist contracts (some implemented, most contract-only)
- A deterministic aggregator that runs in seconds
- Three command briefs covering the studio's main engagement types
- A help command that lists everything

The studio is _callable_. Maybe most specialists are still contract-only — that's fine. The first real engagement will surface which scripts to write next, and you write them on demand. This is _harden as we go_: contracts ship now, scripts ship as the pipeline assembles itself.

For Social Studio, this took six commits over a few sessions, each one self-contained and reviewable.

---

## Part V — Adding to an Existing Department

Once a studio exists, day-to-day work involves three kinds of additions.

### Adding a new specialist

A new tool the studio needs to use. Steps:

1. Create the directory: `skills/{your-studio}-{specialist-name}/`
2. Author `SKILL.md` with the standard structure (identity, modes, inputs, outputs, CLI, cost, integration, status, references)
3. Add a row to the orchestrator's routing table
4. Add a row to the orchestrator's implementation status map (with `🏗️ contract-only` and a fallback primitive note)
5. If the specialist needs references or fixtures, scaffold those subdirectories
6. If the specialist needs a script, write it; otherwise leave contract-only
7. Symlink the skill into the workspace for runtime visibility

That's it. No registration, no library updates, no DI container. The next time someone runs the studio's orchestrator, the new specialist is discoverable through the routing table.

### Adding a new command brief

A new engagement type — say, "monthly performance audit." Steps:

1. Author `commands/{command-name}.md` following the brief structure (Help block, Trigger, Intake if needed, Phases, Output, Cost)
2. Add a row to the orchestrator's routing table mapping user-likely phrases to the new brief
3. Update `social-help.md` to list the new command in the directory
4. If the brief depends on new conventions, factor them into a `references/` doc

### Adding a new gate

A new quality dimension to enforce. Steps:

1. Add a new mode to `social-quality` (or whatever your studio's partner skill is called)
2. Update the SKILL.md to describe the new mode's inputs, scoring rubric, and pass/fail thresholds
3. Add the new gate's mention to the constitution if it enforces a principle that wasn't already there
4. Update the relevant brief to invoke the new gate at the appropriate phase boundary
5. Update the engagement state schema to record the new gate's result

The lever between briefs and gates is the operating-model claim: every brief says _which gates run when_ and every gate says _what it scores_. They meet in the engagement file.

### Adding a new constitutional article

This is the rarest and most consequential change. A new article changes how every gate scores work, retroactively. Steps:

1. **Argue for it.** Open a discussion (an issue, a memo, a PR description) explaining what the article enforces, what gap in the existing constitution it closes, and what it costs to enforce. Write the article in the same format as existing articles: name, rule, justification, test case.
2. **Audit the constitution for redundancy.** A new article that duplicates an existing one weakens both. Either tighten an existing article, or write a clearly distinct new one.
3. **Update every Senior Partner skill** to load and apply the new article.
4. **Re-baseline existing engagements.** Recently-completed engagements may now fail the new article. Decide explicitly whether to re-run those engagements or grandfather them.
5. **Increment the constitution's version**. The constitution is a living document, but its version is a contract: a Gate C run on date X says it applied constitution v3.2; a future audit can verify that.

The constitution is the firm's identity. Adding articles is the equivalent of a partnership vote to change firm policy. Treat it as such.

### Cross-studio collaboration

Two studios sometimes need to share. The Department Model handles this through _files in the workspace_, not through inter-skill APIs.

A typical pattern: Social Studio's repurposing engagement reads a published blog post produced by Blog Studio. The blog post is at `projects/celavii/content/blog/published/agentic-shift-final.mdx`. Social Studio's `social-repurpose` skill reads that file directly. There's no API call, no message bus, no shared service. The studios are coupled only through the _workspace's filesystem_, which is the same way real departments coordinate (through shared documents).

If two studios genuinely need to _coordinate work in flight_ — say, Sales Studio sends a brief to Content Studio asking for collateral that supports a specific deal — the pattern is: Sales Studio writes a brief to a shared `inbox/` directory; Content Studio polls or is notified; Content Studio reads the brief, opens an engagement, ships the deliverable to a shared `deliverables/` directory; Sales Studio reads the deliverable. Same pattern as a real organization sending a request via email or a ticket.

What the Department Model does _not_ do: have studios call each other's skills directly. That would create coupling between studios — Studio A's evolution affects Studio B, and you've just rebuilt microservice hell with markdown. Each studio is a self-contained unit with its own orchestrator, specialists, conventions, and outputs. Studios share infrastructure (the workspace, the model, the constitution patterns), but not business logic.

### Promoting a contract-only specialist to a script

Most Phase B specialists ship as contract-only — described in prose, executed by the model reading the prose. Some need to graduate to scripts. When?

- **Cost**: when the LLM cost of doing a job in prose is higher than the engineering cost of writing a script. Aggregation work hits this threshold immediately (1000-post pairwise cosine in prose: prohibitive; in Python: trivial).
- **Determinism**: when the work needs to produce the _same_ output every time it's run on the same input. Compliance work, billing work, financial calculations.
- **Speed**: when the orchestrator calls the specialist many times in a chain and prose interpretation overhead matters. A specialist called 25 times in a single engagement (per-post brief generation) benefits from being a script that the model invokes, rather than prose the model re-reads each time.
- **Reliability**: when the prose interpretation has surfaced as flaky in real engagements. Two consecutive Phase G dry-runs producing different outputs from the same inputs is a sign the specialist needs to be a script.

Promotion path:

1. Author `scripts/<name>.py` (or `.sh`, depending on what the work needs).
2. Update SKILL.md's `## CLI` and `## Status` sections to reflect the new script.
3. Update the orchestrator's _implementation status table_ to flip from `🏗️ contract-only` to `✅ scripts/<name>.py`.
4. Run the script against a fixture and check the output matches what the contract says.
5. Run the script in a real engagement and verify it integrates with the chain.

A specialist that's been a script for a while can also be _demoted_ back to prose — usually when the script becomes a maintenance burden that doesn't justify its existence. Demotion is rarer than promotion but legal.

---

## Part VI — When NOT to Use the Department Model

Honest about limits. The Department Model is well suited to some kinds of work and badly suited to others.

### Where it works

- **Long-horizon engagements** — projects that take hours, days, weeks. The pattern was designed for work that doesn't fit in one prompt and doesn't need real-time response.
- **Creative knowledge work** — analysis, writing, design, planning, research. Work where the output is a document, a deck, a calendar, a brief. Work that benefits from review.
- **File-driven processes** — work where progress can be expressed as files-on-disk. Strategies, plans, reports, drafts.
- **Briefable work** — work where a five-question intake builds a useful scope. Most professional services work has this property.
- **Phase-shaped work** — work that decomposes into stages with clear boundaries. Strategy engagements, audit engagements, production engagements.

These map well: SEO strategy, social-media strategy, blog production, sales-deck creation, market research, legal research, technical writing, brand audits, product proposals.

### Where it doesn't work

- **Sub-second latency** — chatbots, autocomplete, real-time recommendation. The Department Model's pre-flight (load constitution, voice, state, intake) takes seconds. That's fine for an hours-long engagement. It's a deal-breaker for sub-second response.
- **Heavy concurrent state mutation** — live trading, multiplayer game state, real-time bidding. Files are the wrong primitive when many writers race for the same record.
- **Strict transactional guarantees** — financial settlements, medical records updates, regulatory filings. Files don't enforce schemas, atomicity, or rollback. Use a database.
- **Sub-second decision-making with real-world consequences** — autonomous vehicles, industrial control, medical triage. The model-as-interpreter pattern is too slow and too non-deterministic.
- **Operational, queue-based work** — customer support ticket routing, order fulfillment, dispatching. These are scheduling problems, not creative-knowledge problems. The Department Model has the wrong shape.

### How to recognize the right shape

If you can describe the work as _"a brief, gathered through conversation, that produces a deliverable, reviewed by a senior partner, with phases that take hours,"_ it fits.

If you can describe the work as _"a request that needs a response in milliseconds,"_ it doesn't.

There's a middle: work that has Department-Model shape (briefs, phases, reviews) but real-time elements (a live dashboard, a streaming pipeline). For these, build the Department-Model studio for the offline part — the planning, the briefs, the configuration — and let the real-time part run on a different infrastructure that consumes the studio's outputs. SEO Studio publishes a content calendar; the actual scheduled-publishing daemon runs separately. Same shape: planning is Department-Model; execution is whatever fits.

### Honest about model dependence

The Department Model is only as good as the model interpreting it. The first version of this pattern, written for a 2024 model, would have struggled because routing tables required strong instruction-following and consistent reasoning across long context. With current Claude (and increasingly capable peers), the pattern is robust. As models continue to improve, the pattern gets stronger — more reliable routing, better fallbacks, richer prose-as-runtime. As models _change_, however, parts of the pattern will need revision: the cross-model critic rule depends on having distinct models with different biases; if all major models converge stylistically, that rule weakens. The three-iteration cap is empirical, drawn from Reflexion (Shinn et al.), and may move as models change. We should expect to revisit these every six to twelve months.

This is not a critique of the pattern — it's a reminder that the pattern lives in the same world as the models, and patterns in that world have half-lives. We should write them down honestly and date them.

### Concrete misuse cases

Three real-shaped examples of what _not_ to build with the Department Model:

- **A live customer-support chatbot.** Customer types "where's my order"; needs an answer in under two seconds. The Department Model's pre-flight (load constitution, voice, state, intake) takes longer than the entire allowed response budget. _Wrong shape — use a single fast prompt with retrieval, not a multi-phase studio._
- **A real-time bidder for ad auctions.** Two hundred milliseconds to decide whether to bid on an impression. Files, gates, partners — all wrong primitives at this latency. _Wrong shape — use a tuned specialist model behind a fast inference endpoint, no orchestration._
- **A medical triage system.** Life-safety, regulatory, real-time, multi-modal sensor fusion. Files cannot be the source of truth for life-critical state; iteration caps cannot apply when the answer is _now or never_. _Wrong shape — domain demands transactional infrastructure, formal verification, and human-loop review at every step._

Three real-shaped examples of what _to_ build with it (beyond what we've already shown):

- **A long-form research engagement.** Client asks for a market analysis. Intake gathers scope, key questions, target audiences. Phases: literature review, primary research, synthesis, draft, review, deliver. Critic gates ensure citations and accuracy. Output: a forty-page report. _Right shape — file-driven, briefable, phase-based, review-heavy._
- **A regulatory-compliance audit.** Client has a new product; need to assess regulatory risk. Intake captures jurisdiction, product type, supply chain. Phases: scope, research, gap analysis, recommendation. Senior partner (real lawyer in the loop, possibly) reviews. Output: a memo plus a remediation plan. _Right shape — even though the work has high stakes, the time horizon is days, not seconds._
- **A brand-redesign engagement.** Client wants a new brand identity. Intake gathers the brand story, audience, competition, taste. Phases: discovery, mood-board, draft logos, draft palette, draft typography, full system, presentation. Senior partner reviews each phase. Output: a brand-system PDF + asset bundle. _Right shape — creative work, briefable, phased, partner-reviewed._

If your work fits the second list, build it as a studio. If it fits the first, don't.

---

## Part VII — On Prose as a User Interface

The Department Model has one technical claim that's easy to miss: **markdown is the runtime**. Not metaphorically — literally. The orchestrator skill is a markdown file. The brief is a markdown file. The constitution is a markdown file. Every specialist is described in markdown. The model reads these files and acts on them. There is no compiled artifact; there is no DSL. The prose is the program.

This is unusual enough to warrant its own section.

### What it means concretely

When a developer wants to add a new gate to Social Studio's quality reviews, they don't write Python. They edit `social-quality/SKILL.md` to add a `gate-d` mode and describe what it scores. They edit `commands/social-strategy.md` to call the new gate at the appropriate phase boundary. They edit `social-constitution.md` to add the article the gate enforces. Three markdown edits, and the new gate is operational.

Compare to a code-driven framework. The same change requires: a new class in the framework's gate hierarchy, a new method signature, registration in the dispatcher, an updated configuration schema, a new unit test, a regenerated documentation page. Six artifacts, four of which are derived from the others (and can drift). The markdown approach has _one source of truth per concept_.

### The properties this gives you

**Diffability.** Pipeline changes show up as `git diff` on prose. Anyone can review a pull request that adds a new gate or changes the intake flow — the change is in plain English, not in framework abstractions. This makes pipeline review a normal part of code review, not a separate specialty.

**No version coupling.** A markdown skill doesn't have a version. It doesn't depend on a library. It doesn't break when something is upgraded. The model's interpretation may evolve, but the file itself is unaffected. Compare to LangGraph or CrewAI users who must track framework versions and migrate code on upgrades.

**Composability without imports.** When the orchestrator routes to a specialist, it does so by _naming the file path_. There's no registration, no dependency injection, no service registry. The specialist exists as a file, the orchestrator points at the file, the model reads the file. Adding a new specialist is a `git add` plus a new row in the routing table.

**Documentation that can't drift.** The same prose that describes the system _is_ the system. There's no separate documentation that explains what the code does — because the code _is_ the documentation. When a brief is updated, the description of the work and the work itself update together, because they're the same string.

**Direct user inspection.** A user who wants to understand what `/social_strategy` does can read `social-strategy.md`. The brief tells them the phases, the gates, the cost, the time, the output. There's nothing hidden in the framework that they need to learn separately.

### The cost: prose discipline

The pattern has a non-obvious tax: _everything load-bearing must be explainable in prose_. If you can't write down what a specialist does in a SKILL.md, the model can't read it, so the orchestrator can't route to it. This forces the team to be unusually explicit about what they're building.

For teams that already document their work well, this feels natural — they were already writing those docs anyway, now the docs do double duty. For teams that don't, it can feel like overhead. The Department Model is, frankly, _not for teams that won't write_. The methodology cannot deliver its benefits without prose discipline.

The good news: the discipline produces real, observable improvements in clarity. A specialist whose SKILL.md isn't clear in prose is usually a specialist whose responsibilities aren't clear at all. Writing the SKILL.md surfaces the ambiguity, and the team is forced to resolve it. The artifact is documentation; the _act of producing it_ is a debugging tool for the team's mental model.

### Three readers, one prose

When you write `commands/social-strategy.md`, you're writing simultaneously for three readers:

1. **Yourself, now.** You need the brief to be clear enough that you can run the engagement.
2. **Other humans, later.** They need to understand what the engagement does so they can extend it, fix it, or copy the pattern to a new studio.
3. **The model, every time.** It needs to follow the brief precisely enough to execute it consistently.

These three are usually treated as separate concerns. You write code for the machine, comments for future humans, and READMEs for users. Three artifacts, three different registers, three opportunities for drift. The Department Model collapses them. The same prose serves all three readers, because all three readers are doing roughly the same thing — _understanding what work this is and how it gets done_.

Writing well for three readers at once is harder than writing for one. But it's a skill that improves with practice, and a team that develops it becomes durably more productive.

### Why this matters for the future

The most interesting property of _markdown-as-runtime_ may be its **forward compatibility**. As models improve, the same SKILL.md becomes a _better_ program — because the model interprets it more reliably, more flexibly, with better fallbacks. A code-driven pipeline, in contrast, gets the same speed it had at the time it was written.

This doc is dated 2026-04. The models reading it now do a workmanlike job. The models reading it in 2027 will do a better job, against the _same files_. There's nothing to upgrade. The pattern leans into the model's capabilities, and capability gains accrue automatically.

For teams thinking long-term about building agentic systems, this is a substantive argument for the prose-as-runtime approach: you're not just choosing a way to organize today's work, you're _positioning the system to benefit from improvements you don't yet know about_.

---

## Part VIII — Glossary

| Term                     | Plain definition                                                     | Where it lives in our system                                 |
| ------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Department Model**     | The methodology this document describes                              | This file                                                    |
| **Studio**               | A domain-specific instance of the methodology                        | `social-orchestrator/`, `seo-orchestrator/`, etc.            |
| **Operating Model**      | Conventions every studio shares                                      | Implicit in the codebase; documented in `principles.md`      |
| **Studio Director**      | The orchestrator skill that routes within a studio                   | `{studio}-orchestrator/SKILL.md`                             |
| **Account Executive**    | The intake-and-brief role; a function of the Director                | The intake flow in any command brief                         |
| **Specialist**           | An atomic skill with one job                                         | `social-discover/`, `social-brief/`, etc.                    |
| **Senior Partner**       | A critic skill that reviews specialist output                        | `social-quality` (multiple modes)                            |
| **Studio Founder**       | The human who authors the studio's identity, constitution, and voice | The repo's maintainers                                       |
| **Brief**                | A markdown command file describing a unit of work                    | `commands/*.md`                                              |
| **Engagement**           | A long-running project from intake to delivery                       | One run of a brief end-to-end                                |
| **Engagement File**      | The state file carrying an engagement's progress                     | `social-strategy-state.json` and equivalents                 |
| **Phase**                | A stage of an engagement (acquire, analyze, plan, etc.)              | Top-level keys in `state.phases.*`                           |
| **Gate**                 | A quality review between phases                                      | `state.gates.{A,B,C}`                                        |
| **Filing Cabinet**       | The `raw/` directory holding tool outputs                            | `projects/celavii/research/social/raw/`                      |
| **Knowledge Management** | The studio's persistent know-how                                     | `references/`, `fixtures/`, the memory system                |
| **Constitution**         | The studio's values, in numbered articles                            | `.claude/rules/{studio}-constitution.md`                     |
| **Conflicts Check**      | Detection of work that would duplicate prior work                    | `social-cannibalization`, similar in other studios           |
| **Cross-Model Critic**   | The rule that the partner uses a different model than the specialist | Article 7 of the Social Constitution                         |
| **Iteration Cap**        | The rule that no gate runs more than three times                     | Article 8                                                    |
| **Practice Group**       | A cluster of related studios sharing knowledge                       | Conceptual; SEO + Social + Blog are a Content Practice Group |

---

## Epilogue: This Document Will Change

The Department Model is _evolving_. We didn't sit down and design it; we built `seo-orchestrator` to solve a problem, noticed the pattern was working, mirrored it for blog, then for social, then started codifying it. This document is the first articulation. Expect it to evolve in three ways:

1. **New patterns will be added** as new studios surface them. When Sales Studio gets built, we'll learn things about lead-qualification engagements that don't show up in content engagements. Those lessons go into a future revision.
2. **Anti-patterns will be added** in `principles.md` as we discover them. Every "we tried X and it broke" goes there, with the date.
3. **Some current patterns will be retired** as models change or as we learn better. The cross-model critic rule, the three-iteration cap, the specific intake-question count — these are empirical claims, not eternal truths. They're dated and they'll move.

Read this document as the snapshot of _how we work today_. Treat it as authoritative for current engagements. Suggest revisions when reality and the doc diverge.

The companion documents in this directory go deeper:

- [`principles.md`](principles.md) — the decision rationales, the warts, the dated anti-patterns
- [`comparison.md`](comparison.md) — how the Department Model differs from LangGraph, CrewAI, AutoGen, AutoGPT, and other agentic frameworks; when to use which

If you're a new joiner, you've now done the orientation. Welcome to the studio.
