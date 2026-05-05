# Principles & Anti-Patterns

> Companion to [`README.md`](README.md). The README explains _what_ the Department Model is and _how_ to work in it. This file explains _why_ every load-bearing decision was made the way it was — and what we've already learned not to do.

**Version 1 · 2026-04-29 · Living document**

This is for the engineer who comes back six months from now wondering "why did we do it this way?" Each principle gets: the statement, the reasoning, the alternatives we considered, and a half-life — when we should expect this principle to need revisiting.

The anti-patterns are dated. What's wrong today may be right in eighteen months as models change. Read every entry alongside its date and don't apply yesterday's anti-pattern to tomorrow's tools without checking.

---

## Table of Contents

- [How to read this document](#how-to-read-this-document)
- [Part I — Architectural Principles](#part-i--architectural-principles)
- [Part II — Governance Principles](#part-ii--governance-principles)
- [Part III — Workflow Principles](#part-iii--workflow-principles)
- [Part IV — Knowledge Principles](#part-iv--knowledge-principles)
- [Part V — Anti-Patterns](#part-v--anti-patterns)
- [Part VI — Open Questions](#part-vi--open-questions)
- [Maintenance](#maintenance)

---

## How to read this document

Each principle has the same structure:

> **Principle** — One sentence claim.
>
> **The reasoning** — Why we chose this. The argument as it stood when we made the decision.
>
> **Alternatives considered** — What we looked at and rejected, and why.
>
> **Half-life** — When this principle might need revisiting. Models, costs, tools, and norms all change.

Each anti-pattern has the same structure too:

> **Anti-pattern** — One-sentence "do not."
>
> **Why it's wrong (as of date)** — The failure mode we observed or the principled argument against it.
>
> **What to do instead** — The right pattern.
>
> **Watch for changes** — When this anti-pattern might stop being one.

Read this file alphabetically through Part V if you want to absorb it cold. Read it as a reference if you have a specific question — search for the topic and the principle's reasoning will be there.

---

## Part I — Architectural Principles

### 1. Markdown is the runtime

> **Principle** — Every load-bearing artifact in the system — orchestrator, specialist, brief, constitution, gate — is a markdown file the model reads and acts on. There is no compiled program; the prose is the program.

**The reasoning.** We started by trying to write a small Python framework for routing tasks to skills. After three weeks we had a working framework and a hundred lines of glue code that was already showing signs of becoming opinionated about things we didn't yet understand. Meanwhile, the orchestrator-as-skill pattern (which we'd been using ad hoc for SEO) was _just working_. The model loaded the orchestrator's SKILL.md, read the routing table, and went. We deleted the framework.

The properties this gives you are unusual:

- **No version coupling.** A SKILL.md doesn't depend on any library version.
- **Composability without imports.** The orchestrator routes by _naming a file path_, not by registering a class.
- **Diff-able pipelines.** Every change to how the system works is a `git diff` on prose.
- **One source of truth per concept.** The brief that describes the engagement is also the brief that runs the engagement.

**Alternatives considered.**

- **A Python orchestration framework** (LangGraph-style). Rejected: tight coupling between framework version and pipeline; framework opinions baked in before we understood our problem; the dispatch logic the framework would solve is _not actually a hard problem_ when the model is a competent reader of routing tables.
- **A YAML/JSON DSL for pipelines.** Rejected: prose is more expressive than structure for the kind of conditional, contextual decisions skills make. A DSL forces premature codification of decisions we still want to make in natural language.
- **Code with markdown comments**. Rejected: code requires execution; markdown is read directly by the model. The fewer translation steps between _what we wrote_ and _what the model interprets_, the fewer places drift can occur.

**Half-life.** As long as models can read and follow long markdown documents reliably, this is the right choice. If model context windows shrink or instruction-following regresses, parts of this could need revisiting. Watch: if Anthropic / OpenAI / others release a model where dispatch tables in markdown stop working consistently, we'd need to add a code layer. That seems unlikely; the trend is the other direction.

---

### 2. State lives in files, not in process memory

> **Principle** — Every long-running engagement has a state file. Specialists read the state, mutate it, write it back. State never lives only in process memory.

**The reasoning.** When the SEO pipeline first ran, an early prototype kept the engagement state in a Python dictionary held by the running process. The first time we hit a five-minute Apify scrape that backgrounded, the process timed out and we lost the dictionary. We put the state in a JSON file. The pattern proved itself within a week — the engagement could be resumed from any session, audit trails fell out for free, and inter-agent handoffs became _file reads_ instead of _protocol design_.

Files give you four properties that no in-process state can:

- **Resumability.** The engagement file is the checkpoint. Any session can resume by reading the phase statuses.
- **Auditability.** `git log social-strategy-state.json` shows every decision made over the engagement's lifetime.
- **Handoffs.** A different agent (different session, different model, different process) can pick up the engagement by reading the file. No inter-agent messaging is needed; the file is the message.
- **Survives restarts.** Process state is volatile; files persist.

**Alternatives considered.**

- **Redis/Memcached.** Rejected: another service to deploy, monitor, and reason about; doesn't survive crashes the way files do; not naturally diff-able; the latency advantage is irrelevant for hours-long engagements.
- **Postgres/SQLite.** Rejected: schema rigidity bites you when you want to add a phase or change a gate; needs a migration path; transactions are unnecessary for one-writer-at-a-time engagements; harder for a model to "see all the state" than reading a single JSON file.
- **An event log (event sourcing).** Considered but rejected for v1: the abstraction is more powerful than what we need today. Most engagements are linear; the ability to time-travel state by replaying events is overkill. May reconsider for engagements that genuinely branch.

**Half-life.** When concurrent writes become normal — multiple specialists racing to update the same engagement file — files start to bite. We'll know we've reached this point when state collisions show up in real engagements. Today, every engagement is single-threaded; one specialist runs at a time. Until that changes, files are right.

---

### 3. One orchestrator per studio, never two

> **Principle** — A studio has exactly one Studio Director (orchestrator skill). Adding a second introduces ambiguity that the model handles inconsistently.

**The reasoning.** Early in Social Studio development we briefly had two orchestrators: a `social-orchestrator` for strategy work and a `social-curator` for weekly work. The model would sometimes load both, sometimes load only one, and the routing table in each pointed at different specialists for the same task. This produced visible inconsistency — different sessions would do the same task differently, depending on which orchestrator they loaded first.

We collapsed them. One orchestrator, three commands (`/social_strategy`, `/social_curate`, `/social_post`) under the single orchestrator's `commands/` directory. Behavior stabilized immediately.

**Alternatives considered.**

- **Two orchestrators with namespaced names** (`social-strategy-orchestrator`, `social-curate-orchestrator`). Rejected on the principle that the user-facing entry point is _one studio_; splitting it across orchestrators leaks an internal detail.
- **A meta-orchestrator that routes to orchestrators.** Rejected: adds a layer of indirection without solving anything. The Studio Director already does this — its routing table maps tasks to commands or sub-skills.

**Half-life.** This principle is durable. The fundamental claim is that a _firm_ has one studio per domain, and a _studio_ has one director. That's a structural claim about organizations, not about models, and structural claims age well.

---

### 4. Specialists do not call each other

> **Principle** — A specialist knows only what the orchestrator (or the calling brief) passes to it. Specialists do not import, invoke, or message other specialists directly.

**The reasoning.** In a real organization, a junior associate doesn't pick up the phone to call another junior associate to delegate part of their work. They surface what they need to a partner, who decides whether to hand off the work, to whom. This isn't bureaucracy for its own sake — it's how knowledge of who-can-do-what stays consolidated in the management layer, where it belongs.

The same applies here. If `social-brief` could call `social-research` directly, we'd have a coupled mesh: changing `social-research`'s interface ripples to every specialist that calls it. With orchestrator-mediated calls, _only the orchestrator knows about specialists_. Each specialist is a leaf node, callable through a known interface, with no awareness of the rest of the system.

This is the _tree, not mesh_ principle. The Department Model is a tree: orchestrator at the root, specialists at the leaves. Trees compose, evolve, and reason cleanly; meshes don't.

**Alternatives considered.**

- **Direct sub-skill invocation** (a specialist calls another specialist's CLI). Rejected: every coupling point becomes a place where the calling specialist needs to know the called specialist's interface, and where interface drift causes bugs.
- **An event bus where specialists publish/subscribe.** Rejected: introduces async coordination problems that don't exist in our synchronous tree model; obscures who does what when.
- **Specialists composing into pipelines via a DAG library.** Rejected: same reason as the Python framework rejection above — premature codification.

**Half-life.** Durable. This is the principle that lets specialists evolve independently. If we ever build an agentic system where a specialist genuinely needs to invoke another specialist mid-task (not "produce output for the orchestrator to pass downstream"), we'd reconsider — but we have not encountered that case.

---

### 5. Files are timestamped, never overwritten

> **Principle** — The filing cabinet (`raw/` directory) holds tool outputs. New runs make new files; old files stay. The naming convention is `raw/{tool}-{target}-{ts}.{ext}`.

**The reasoning.** Two real failures motivated this. In the early SEO pipeline, an Apify scrape returned malformed JSON. We retried; the second scrape overwrote the first; the malformed file vanished and we lost the ability to debug what had failed. In another incident, a report-generator had a bug; we re-ran the aggregator and lost the (correct) prior aggregation, with no way to recover until the bug was fixed.

Both failures share a root cause: _we treated raw outputs as disposable_. They aren't. They are evidence. A real organization keeps every email, every contract draft, every memo. The studio does the same.

The timestamp convention is also load-bearing: it lets you ask "what did the world look like on date X?" by listing files matching `*-2026-04-25-*.json`. This is invaluable for debugging "why did Gate A pass last week and fail this week?" — the inputs are right there.

**Alternatives considered.**

- **Always overwrite, rely on git for history.** Rejected: not all tool outputs go into git (raw scrapes are too large), and git's history of a single file is harder to grep than a directory of dated files.
- **Mark files with a "current" / "archive" status, prune old ones.** Rejected: pruning policy becomes a thing to debate; better to never prune and let disk be cheap.
- **Named files (`profile.json`) without timestamps.** Rejected: same overwrite problem in disguise.

**Half-life.** Disk is cheap and getting cheaper. This principle gets stronger over time, not weaker.

---

### 6. The state file references files, not data

> **Principle** — When a specialist produces a large output (a scraped JSON, a report, a draft), the engagement file _references_ the path of that output, not the output itself. State stays small and readable.

**The reasoning.** The engagement file is read by the model on every phase. If the file is fifty megabytes of inlined scrape data, the model burns context window every time. If it's a few kilobytes of pointers, the model can hold it in context cheaply and load only what each phase needs.

Concretely: `state.phases.acquire.raw_files: ["raw/celavii-celaviihq-instagram-profile-2026-04-28.json", ...]` not `state.phases.acquire.raw_data: { instagram: {...}, tiktok: {...} }`.

**Alternatives considered.**

- **Inline data in the state file.** Rejected as above; killed by the realities of the model's context budget.
- **Content-addressed storage (the state file holds hashes, not paths).** Considered for v2. Doesn't solve a current problem and would add a content-addressing layer. Defer.
- **A dedicated cache directory the orchestrator manages.** Effectively what `raw/` is, but without the "cache invalidation" overhead — `raw/` is forever.

**Half-life.** Until model context windows are effectively infinite (which is closer than it used to be but not yet here for the cost levels we use), this principle holds.

---

### 7. The engagement file is one file per engagement

> **Principle** — One engagement, one state file. Don't spread engagement state across multiple files; don't combine multiple engagements into a shared file.

**The reasoning.** Atomicity. When the orchestrator updates state, it should update one file. When it reads state, it reads one file. When `git log` audits the engagement, it audits one file. Splitting state across files multiplies the surfaces that can drift, and combining engagements creates contention.

For studios that run many engagements (Social Studio runs one strategy engagement plus weekly engagements), each engagement gets its own file: `social-strategy-state.json` for the strategy; weekly engagements append entries to that strategy file's `weekly_cycles[]` array. The strategy file is the _firm's record_ of one client's strategy work; weekly cycles are sub-records under it. This is one-file-per-engagement at the granularity of _the strategy as a whole_.

**Alternatives considered.**

- **One file per phase.** Rejected: makes resumability harder (you have to read N files instead of 1), and partial state across files invites consistency bugs.
- **One file per studio across all clients.** Rejected: client engagements should be isolated; one client's state shouldn't be a row in a shared file.

**Half-life.** Durable.

---

## Part II — Governance Principles

### 8. The constitution is values, not rules

> **Principle** — Constitutional articles encode the firm's values, not access controls or syntax checks. They are how the firm thinks, written down.

**The reasoning.** When we drafted the first version of the social constitution, we wrote articles like _"reject any post containing the word 'leverage'"_ — a syntactic rule. It worked, but it produced unhelpful gate output: "rejected because 'leverage' appears." The article didn't help anyone understand _why_ it mattered.

We rewrote the article as _"Specificity beats abstract verbs. 'Leverage,' 'utilize,' and 'navigate the landscape' are slop tells; they signal that the writer didn't have a concrete point to make."_ The same rule, expressed as a value. Now the gate's output explains: "Article 1 violation — the phrase 'leverage AI-powered creator intelligence' is abstract; concrete examples would say what the AI actually does." The output is teachable; a writer reading it understands not just that the line failed but _what the firm is asking for_.

The deeper point: **rules-as-syntax can be gamed; values cannot**. A writer who learns "don't say 'leverage'" will substitute "harness" — same slop, different word. A writer who learns "be specific" produces better writing on every axis.

This is the Constitutional AI insight (Bai et al., Anthropic 2022) applied to the firm level. Critics anchored to values produce more useful feedback than critics anchored to rules.

**Alternatives considered.**

- **Rule lists.** Tried first. Failed for the reasons above.
- **A single style guide (one big prose document).** Rejected: a critic needs to _cite_ what they're applying; numbered articles let them say "Article 5" and have that be unambiguous.
- **Per-skill rules** (each specialist has its own rules). Rejected: values are firm-level. A specialist enforcing its own value system is a specialist out of step with the rest of the firm.

**Half-life.** Durable as a principle. The specific articles will evolve, but the form (numbered articles, named, with rationale) holds.

---

### 9. Cross-model critic at every gate

> **Principle** — The generator and the critic must be different models. Default: Sonnet generates, Opus critiques. Same-model self-critique produces false agreement.

**The reasoning.** When we ran early versions of Gate A with the same model generating _and_ critiquing, the critic was systematically too kind. It would catch obvious failures (banned language, missing citations) but miss subtle ones (whether the strategy actually addressed the client's stated goal). The model's own output is, to itself, persuasive.

When we routed the critic to a different model, this changed. The new model didn't have the generator's frame; it read the work fresh and applied the constitution against it independently. False positives went up — sometimes the critic flagged things that were actually fine — but false _negatives_ (slop that passed) dropped substantially. Catching slop that would have shipped matters more than the cost of re-running borderline cases.

The principle generalizes: any reviewer system whose reviewer shares a substantial bias with the producer will under-catch errors. Cross-model critic is one form of bias-isolation; another would be cross-prompt critic (same model, different system prompts) but the empirical signal is weaker. Different models is a stronger guarantee.

**Alternatives considered.**

- **Same model with explicit "critique your own output" instruction.** Tried, failed as above.
- **Same model with chain-of-thought reasoning.** Slightly better than the above but still meaningfully under-catches.
- **Three-model jury** (one generator, two critics, vote). Considered. Nice in theory; expensive in practice; saves probably nothing once cross-model critic is in place.

**Half-life.** This principle is empirically grounded and may need revisiting if all major models converge stylistically (a real concern; alignment training pulls them toward each other). If Sonnet and Opus produce indistinguishable critiques in 2027, the cross-model rule weakens. Watch the Reflexion / Self-Refine literature for updated benchmarks.

---

### 10. Three iterations, then escalate

> **Principle** — A gate runs at most three times. After three fails, the engagement escalates to human review. The system does not auto-iterate beyond three.

**The reasoning.** Reflexion (Shinn et al., 2023) showed that LLM self-improvement loops have rapidly diminishing returns past three to five iterations. Our internal experience matches: gate failures that aren't fixed by the third iteration are usually structural — the brief is wrong, the source data is missing, the constitution conflicts with the request. More iterations don't fix structural problems.

The three-iteration cap forces escalation when escalation is appropriate. It also caps cost: a failing gate doesn't run thirty times in a runaway loop.

**Alternatives considered.**

- **No iteration cap.** Rejected: cost runaway, plus the marginal return after three iterations is approximately zero.
- **Five iterations** (the upper bound of the Reflexion finding). Rejected: in our experience the marginal value at iteration four is already very small. Three is conservative.
- **Adaptive cap based on gate type.** Considered. Defer until we have evidence that some gate types benefit from more iterations.

**Half-life.** Empirical claim, model-dependent. Watch the literature.

---

### 11. The critic reads the brief first

> **Principle** — Before any gate scores work, the critic must load `state.intake` (the brief) and the constitution. A critic that scores without reading the brief produces generic feedback that doesn't reflect the engagement's actual goals.

**The reasoning.** This was a hard-won lesson from the SEO pipeline. Gate A in the original SEO `/seo_strategy` would routinely produce strong-sounding feedback that turned out, on inspection, to be _generic SEO advice_ rather than _advice for this client's strategy_. The critic was reading the strategy draft and scoring it against general SEO principles, not against what _this client_ had asked for.

We added the rule: every gate, before scoring, loads the intake. The critic's output must cite at least two specific elements from the intake (a phrase from the channel identities, a competitor name, the goal verb, a banned-language item). If it cites zero, the gate is contaminated and re-run.

The shift was dramatic. Generic feedback disappeared. Critics started saying things like "the brief asked for a 90-day plan to drive 300 demos via TikTok+IG; the calendar over-indexes on YouTube — three of the seven YouTube posts should move to TikTok or IG to align with the goal." Specific, actionable, anchored.

This is encoded as Article 6 of the Social Constitution and as a parallel rule in SEO's constitution. It's the most important governance rule in the methodology. Skipping it gives you slop critics.

**Alternatives considered.**

- **Pass the intake summary as a parameter.** Considered. The model didn't reliably _re-read_ the parameter mid-critique; once the model started scoring, it would lose the intake context. Forcing a fresh load before scoring is more reliable.
- **Have the critic produce two outputs: one against intake, one against constitution.** Rejected: doubles cost, doesn't materially improve quality over a single intake-aware critique.

**Half-life.** Durable as a principle. The specific verification (cite-two-elements) might tighten or loosen as we learn more.

---

### 12. Constitutional articles must be operationalizable

> **Principle** — Every constitutional article must give a critic enough to apply it without further interpretation. Vague articles produce inconsistent gate outputs.

**The reasoning.** We tried writing articles like _"Posts should be high quality."_ This is unfalsifiable; every critic interprets it differently. We rewrote it as _"≥7 specifics per 100 words. Specifics = real numbers + named entities + concrete examples."_ Now the rule is testable; critics produce consistent verdicts across runs.

Operationalization doesn't mean _quantification_ in every case. It means _the rule is precise enough that two readers applying it would agree on what passes and what fails_. _"Avoid banned phrases (see voice.json)"_ is operationalized — there's a specific list. _"Be authentic"_ is not — there's no list, no test, no way for a critic to apply it without inventing their own definition.

**Alternatives considered.**

- **Aspirational articles** (ones meant to inspire rather than enforce). Considered for "soft principles." Rejected: every article that's in the constitution gets applied at every gate. If an article isn't enforceable, it shouldn't be in the constitution; put it in the studio's identity prose instead.
- **Articles with "guidance" rather than "rules"**. Rejected: blurs what a gate is doing. A gate either applies an article or it doesn't.

**Half-life.** Durable.

---

## Part III — Workflow Principles

### 13. Intake gathers intent, not parameters

> **Principle** — The first interaction with a client is a five-or-so-question conversational intake. It builds the brief through dialogue, not through a form.

**The reasoning.** A five-field web form gives you _data_. A five-question conversation gives you _intent_. The downstream work is dramatically better when the brief carries intent, because intent is what guides every subsequent decision.

Concretely: the intake question _"Single sentence: what should this strategy accomplish in 90 days?"_ produces answers that drive Gate A reviews ("the calendar indexes too heavily on YouTube; goal is TikTok + IG demos"). The form-equivalent — a checkbox list of "platforms to focus on" — produces an answer that the model can't apply contextually. Same data, different shape, different downstream behavior.

The five-question constraint is also load-bearing. More than five and the intake becomes onerous; fewer than five and important context is missing. The exact count varies by domain (Social uses five, Blog uses four, SEO uses six), but the order of magnitude is small.

One question at a time matters. Asking all questions at once is a form by another name; the client batch-answers and the model loses the conversational context. One at a time, with the model reading each answer before asking the next, lets the questions adapt.

**Alternatives considered.**

- **Web form intake.** Tried. Produced lower-quality briefs as above.
- **Free-form text intake** ("describe your project"). Tried. The model has to extract structure from unstructured text, which works inconsistently. Structured questions, conversationally asked, gets the best of both.
- **Adaptive intake** (questions depend on prior answers). Considered. Adds complexity; probably has value but defer.

**Half-life.** Durable.

---

### 14. Phases are linear; gates iterate

> **Principle** — An engagement walks through its phases in order. A gate failure routes back to the most recent producing phase, not back to the start. Phases don't run twice in the same engagement (except via gate-driven remediation).

**The reasoning.** Real organizations work this way: a draft goes back to the writer if review fails, not back to the strategist. Going back further is _escalation_, not iteration.

In Department Model terms: Gate A failure (after Aggregate phase) routes back to Phase 2B (targeted remediation), which produces a new aggregate, which Gate A re-reviews. It does _not_ route back to the intake or to acquire phase. Those are upstream of where the failure was detected; rerunning them won't help.

This linear-phases-iterating-gates pattern keeps the engagement bounded. Without it, gate failures could cascade upward through phases, and an engagement could spend hours re-acquiring data because of a writing-quality issue at Phase 5.

**Alternatives considered.**

- **Always rerun from the failed phase.** This is what we do — but the principle is that gate failures route to _the phase that produced the input the gate evaluated_, which is usually the most recent agentic phase, not the deterministic ones (deterministic phases produce identical output on the same input; rerunning them is wasted work).
- **Branch-and-merge** (try multiple alternatives in parallel). Considered. Adds engineering complexity for marginal value; defer.

**Half-life.** Durable.

---

### 15. Idempotency by checkpoint

> **Principle** — Re-running a command on a completed engagement does the right thing without explicit "is this already done?" checks: skip-already-done is built in by reading state status.

**The reasoning.** Users will re-run commands. They forget what they ran. They pipe-up an old terminal. They mash the up arrow. The system should handle this gracefully: re-running `/social_curate week=2026-W18` after it completed should not re-do the work, re-bill the user, or produce a different bundle.

The pattern: every command's pseudocode starts with _read state, find what's already done, skip those, run the rest_. For weekly curation, this means checking each post's `gate_c` score; if it's ≥7.5 and the brief exists, skip. For strategy, it means checking phase statuses; resume at the first incomplete phase.

This isn't "idempotency by transaction" (which would require atomicity primitives we don't have). It's "idempotency by checkpoint" — _read the most recent durable state, do the right thing relative to that_.

**Alternatives considered.**

- **Hard-fail re-runs unless `--force` is passed.** Considered, rejected. Surprises the user; they expect re-run-friendly behavior, not gates.
- **Always re-do (no checkpoint).** Rejected: cost runaway and breaks weekly work where you want partial completion to persist.

**Half-life.** Durable.

---

### 16. Cost estimates before execution

> **Principle** — Every command supports a `dry-run` mode that estimates LLM cost, wall time, and any external API costs (Apify, scrape credits) _before_ the user confirms execution.

**The reasoning.** Long-horizon engagements cost real money. A `/social_strategy` run for a new client is on the order of $13. A weekly curation is $7. A user who runs the command without knowing the cost can be surprised. Surprise is bad, especially when the surprise costs $50 because they meant to test something small and ran the full strategy by mistake.

Dry-run mode reads the same inputs as the real run and produces a cost estimate, then prompts for confirmation. The user always knows the bill before the bill is rung up.

This is also part of the firm-as-org metaphor: real PSFs send engagement letters with cost estimates before work begins. The dry-run is the engagement letter.

**Alternatives considered.**

- **Trust the user.** Tried implicitly. Lost money to surprise costs early on.
- **Hard cap on per-run cost.** Considered. Doesn't surface the _intent_ problem (user didn't realize they were running the full thing). Plus arbitrary caps cause real-but-small engagements to fail.

**Half-life.** Durable.

---

## Part IV — Knowledge Principles

### 17. References are written when they're factored out, not preemptively

> **Principle** — Don't pre-emptively split a brief into a brief plus references. Write the brief inline; when a section is genuinely reused across briefs, factor it into a reference doc.

**The reasoning.** Early in Phase D we pre-factored: every conceivable reference doc got its own file (cadence rules, hook archetypes, format-fit rules) before any brief actually used them. The result was a sea of small files, half of which were never referenced; readers had to chase across files to assemble understanding.

We rewrote: the orchestrator's SKILL.md and the strategy brief inlined the relevant content. References were created only when _two or more briefs needed the same content_ (the Gary Vee fan-out rule, the parallel-subagent spawn pattern, the format-as-channel rule). Reading flow improved markedly.

The general principle: _write inline first, factor out when reuse appears_. This is a software-engineering principle (don't extract abstractions before you have three call sites) applied to prose.

**Alternatives considered.**

- **Reference-first** (every concept in its own file). Rejected as above.
- **Single-file** (everything inlined, no references). Works for small studios; fails for larger ones because the orchestrator file becomes unreadable.

**Half-life.** Durable.

---

### 18. Fixtures are contracts, not tests

> **Principle** — A `fixtures/` directory under a specialist holds frozen example inputs and outputs that _define_ the specialist's contract. When the specialist's script ships, its output must match the fixture. The fixture isn't a test; it's the specification.

**The reasoning.** Most projects write tests after implementation. The Department Model writes fixtures before implementation. The fixture is _what good output looks like for this input_ — written carefully, agreed-on by the team, then preserved.

When `social-repurpose`'s `scripts/repurpose_blog.py` ships, it must produce output that matches `fixtures/agentic-shift-fanout.md` — a hand-authored spec for what the script should do given the agentic-shift blog post. The fixture isn't a regression test; it's the script's job description in concrete form.

This shifts the workflow: the spec gets written, then the implementation gets written against the spec. Implementation drift is detected by running the implementation against the fixture. If the implementation diverges, the implementation is wrong (not the fixture).

**Alternatives considered.**

- **Tests after** (write the script, then write tests). Tried. The tests ended up testing what the script actually did, not what it should do — the fixture-as-contract idea was lost.
- **No fixtures, document everything in SKILL.md prose.** Tried. Prose alone isn't precise enough for subtle output-format questions.

**Half-life.** Durable.

---

### 19. Memory is for facts that survive the conversation

> **Principle** — The persistent memory system holds facts that should be available across future sessions. Things specific to one engagement go in the engagement file, not in memory.

**The reasoning.** Memory was tempting to over-use early on. We were saving to memory things like "the user just asked about Phase B" — ephemeral conversational state that has no value outside the current session. The memory store filled with noise; future sessions retrieved low-signal facts; the user was not better served.

The rule: memory is for _durable facts_ (the user is a data scientist; the celavii author is elioth-fraijo; the Sales studio runs on a different state schema). Engagement-specific things (which post is currently being curated; what gate just failed) belong in the engagement file, not in memory.

The two stores serve different purposes: memory is the firm's _persistent knowledge of the world_; the engagement file is the _current project's record_. They don't overlap.

**Alternatives considered.**

- **Memory as universal store.** Tried. Fails as above.
- **Memory by salience score** (only save facts the model thinks are important). Tried. Salience is noisy; better to use explicit categories (user, feedback, project, reference) and let humans curate what gets saved.

**Half-life.** Durable.

---

### 20. Knowledge management is per-studio first, shared second

> **Principle** — A studio's `references/` and `fixtures/` are its own institutional knowledge. Cross-studio sharing happens only when the same content is genuinely used by multiple studios.

**The reasoning.** Each studio has its own conventions, vocabulary, and concerns. A `cadence-rules.md` for Social Studio is about TikTok / IG / X / YouTube cadence; a hypothetical `cadence-rules.md` for Sales Studio would be about outreach cadence. They share a name but nothing else. Putting them in a shared location would force one to live where it doesn't belong.

When two studios genuinely need the same content (the social constitution and the SEO constitution share an Article 6 — the critic-reads-intake rule), refactor _upward_: a shared `references/critic-intake-rule.md` (or a top-level `references/` directory if multiple studios cite it) becomes shared infrastructure, with each studio's constitution citing it. But only do this once the duplication is real.

**Alternatives considered.**

- **Shared knowledge base from the start.** Rejected: most knowledge is studio-specific; sharing forces premature taxonomy.
- **No sharing.** Rejected for the obvious reason: real duplications waste effort.

**Half-life.** Durable.

---

## Part V — Anti-Patterns

What follows is a list of failure modes — patterns we've tried, observed others try, or seen flagged in the literature. Each is dated. Some will become obsolete; check the watch-for-changes line.

### A1. Don't put orchestration logic in Python

> **Anti-pattern** — Writing a Python class or function that imports specialist skills and dispatches to them.

**Why it's wrong (as of 2026-04-29).** Once you start, you're in framework-land. The dispatch becomes opinionated about specialist signatures, error handling, return types — opinions that hardcode assumptions you may want to revise. The markdown-as-runtime advantages disappear: you now have a Python codebase to maintain, version, test, and document, alongside the markdown that was the original artifact.

**What to do instead.** The orchestrator is a SKILL.md. Its routing table is a markdown table. The model is the dispatcher.

**Watch for changes.** If you find yourself wishing for type checking, hot reload, or compiler-level safety in the orchestrator, you're feeling the lack of code. Reconsider only if the markdown approach has actually broken. So far, it hasn't.

---

### A2. Don't make sub-skills aware of each other

> **Anti-pattern** — A specialist's SKILL.md or scripts directly reference another specialist's interface.

**Why it's wrong (as of 2026-04-29).** Coupling. Every cross-reference is a place where one specialist evolving forces another to evolve. The tree structure of the Department Model becomes a mesh; reasoning about changes becomes harder; the orchestrator's job (knowing who does what) is partially relocated to the specialists themselves.

**What to do instead.** Specialists know only their own contract. The orchestrator knows the whole studio. Information flows through the orchestrator (or through shared state files), never specialist-to-specialist.

**Watch for changes.** If a future framework lets specialists communicate without coupling (some kind of pure interface that doesn't rot when implementations change), reconsider. We're not there yet.

---

### A3. Don't treat the state file as an ORM

> **Anti-pattern** — Adding derived fields, computed values, or "convenience caches" to the state file.

**Why it's wrong (as of 2026-04-29).** Derived fields go stale. A state file that has `total_cost_usd: 5.20` (a value computed from sub-fields) gets out of sync the first time someone updates a sub-field without updating the total. Then debugging starts.

**What to do instead.** The state file holds _declarative state_ — what was decided, what was produced, what was scored. Derived values get computed on read by whichever specialist needs them. If a specialist computes the same value many times, write a small helper, not a cache field.

**Watch for changes.** If we move to a real database with computed columns, the constraint relaxes. As long as it's a JSON file, this anti-pattern holds.

---

### A4. Don't add a 17th constitutional article

> **Anti-pattern** — Padding the constitution to enforce more rules.

**Why it's wrong (as of 2026-04-29).** Critics reading a 17-article constitution apply each article more weakly. There's a real cap on how many distinct principles a critic can hold in mind while scoring; past around ten, articles start to blur. The 17th article isn't enforced; it's noise.

**What to do instead.** When a new principle wants to be added, audit the existing constitution. Is there an article that's redundant? Combine. Is there an article that's too narrow? Generalize. Only add a new article if no existing article covers the new ground.

The Social Constitution has 10 articles. SEO has 14 (a slight overrun; we should probably consolidate). Hold the line.

**Watch for changes.** Models with much larger context budgets or much better attention may handle longer constitutions. Watch the empirical signal: gate quality should track constitution length up to a point and then degrade.

---

### A5. Don't auto-iterate beyond three

> **Anti-pattern** — Removing the iteration cap because "this case really seems fixable with one more iteration."

**Why it's wrong (as of 2026-04-29).** Reflexion finding (Shinn et al., 2023): diminishing returns past 3-5. Our internal experience says three is the right cap. Removing it doesn't fix the case; it _shifts the failure to a slightly different point_ and burns money. The cases that pass at iteration 4 are mostly cases where iteration 4 is a coin-flip away from another fail.

**What to do instead.** When a gate hits three iterations, escalate to human review. The escalation path is the answer; not "one more try."

**Watch for changes.** Empirical claim. If model improvements move the diminishing-returns inflection point to a higher number, we'll move the cap. Watch the literature.

---

### A6. Don't build the orchestrator before the specialists exist

> **Anti-pattern** — Authoring `studio-orchestrator/SKILL.md` first, with a routing table pointing at specialists that haven't been written yet.

**Why it's wrong (as of 2026-04-29).** Premature abstraction. The orchestrator's value is _its accurate model of the studio's specialists_. Without specialists to model, the orchestrator becomes a guess at what specialists might exist, and the actual specialists end up shaped by the guess rather than by the real work.

**What to do instead.** Write at least three to five specialists first. The orchestrator falls out naturally once you have specialists to coordinate. Phase A of building a new department (Foundation: identity, constitution, voice, state schema) precedes Phase D (the orchestrator) for exactly this reason.

**Watch for changes.** Very stable principle.

---

### A7. Don't share intake across studios

> **Anti-pattern** — Two studios pointing at the same `intake-questions.md` because "it's the same conversation."

**Why it's wrong (as of 2026-04-29).** It isn't the same conversation. Social Studio's intake gathers channels, identities, goals, competitors, voice. SEO Studio's intake gathers domain, business concept, themes, competitors, content silos. Blog Studio's intake gathers pillar topic, audience, voice, goal. The shape rhymes but the questions don't. Forcing them onto a shared intake makes one fit poorly.

**What to do instead.** Each studio has its own intake. They may share conventions (one question at a time, locked once captured, Telegram-friendly), but the actual questions are studio-specific.

**Watch for changes.** If someone discovers a _truly_ universal intake that works for all knowledge-work studios, the principle shifts. Don't expect this; the questions encode domain understanding that can't generalize away.

---

### A8. Don't try to make the state schema match an SQL schema

> **Anti-pattern** — Modeling the state file as if it were a relational database — primary keys, foreign keys, normalization.

**Why it's wrong (as of 2026-04-29).** JSON isn't a relational store. Trying to make it one produces ugly nested structures (`state.gates[A].iterations[2].critic_findings[3].cited_intake_elements[0].source_field` — actual structure that emerges if you over-normalize). The model has trouble navigating it; the human has trouble reading it.

**What to do instead.** Embrace denormalization. Duplicate small data freely. Keep the state file _readable as a document_, not as a database snapshot.

**Watch for changes.** If we move state to a real database, normalization becomes appropriate. As long as it's JSON, denormalize.

---

### A9. Don't put credentials in skills

> **Anti-pattern** — Embedding API keys in a SKILL.md or in a `references/` doc.

**Why it's wrong (as of 2026-04-29).** Skills are versioned in the repo; credentials shouldn't be. The first time a skill with a credential gets shared (a teammate clones the repo, a collaborator gets a copy) you've leaked a key.

**What to do instead.** Skills declare what env keys they need (`metadata.requires.env: ["CELAVII_API_KEY"]`). The keys live in `~/.openclaw/.env` (or equivalent) outside the repo. The skill reads the key at runtime via the gateway.

**Watch for changes.** Stable. A version of this anti-pattern will always exist.

---

### A10. Don't rely on the LLM for deterministic data work

> **Anti-pattern** — Asking the model to compute pairwise cosine similarity, count tokens, hash files, or do any operation that has a correct answer the model can't reliably produce.

**Why it's wrong (as of 2026-04-29).** Models hallucinate numbers. They miscount tokens. They invent statistics. For any operation where there's a _correct_ answer that math (or `wc`) can produce, asking the model is slow, expensive, and wrong.

**What to do instead.** A deterministic specialist (a Python script). The Phase C aggregator pattern exists exactly for this.

**Watch for changes.** As models get better at arithmetic and code execution, the line between "obvious script work" and "model work" shifts. The general principle (use the right tool) holds; the specific work that's "right for the model" will move.

---

### A11. Don't use the same model as generator and critic

> **Anti-pattern** — Same model, two prompts: one for generation, one for critique.

**Why it's wrong (as of 2026-04-29).** Same-model self-critique is too kind. Empirical observation, well-documented in the literature.

**What to do instead.** Cross-model critic — Article 7 of the Social Constitution.

**Watch for changes.** As models converge stylistically, the cross-model rule weakens. Watch alignment-training trajectory.

---

### A12. Don't add a phase mid-engagement

> **Anti-pattern** — While an engagement is in progress, deciding the strategy needs an additional phase, and inserting it.

**Why it's wrong (as of 2026-04-29).** State schema instability. The engagement file's phase keys become inconsistent across engagements (some have phase X, some don't). Specialists that read state can't rely on the schema. Audit and resume break.

**What to do instead.** Decide on phases at studio-design time (Phase A foundation work). To revise, finish the in-flight engagement on the old schema, then bump the schema version, then start new engagements on the new schema. Treat schema like a database migration, even though it isn't one.

**Watch for changes.** Stable.

---

### A13. Don't use the orchestrator as a dumping ground

> **Anti-pattern** — When you can't decide where a piece of logic belongs, putting it in the orchestrator's SKILL.md.

**Why it's wrong (as of 2026-04-29).** The orchestrator's job is _routing and identity_. Adding domain logic (how to score a hook, how to compute cadence) makes the orchestrator long, hard to navigate, and entangled with specialist concerns. The model loading the orchestrator gets distracted from its routing job by the domain detail.

**What to do instead.** Domain logic goes in specialists' SKILL.md or in `references/` docs. The orchestrator routes to them.

**Watch for changes.** Stable.

---

### A14. Don't write briefs that auto-iterate

> **Anti-pattern** — A command brief that loops "until quality threshold X" without an iteration cap.

**Why it's wrong (as of 2026-04-29).** Cost runaway. Same logic as the gate iteration cap: returns diminish, costs don't.

**What to do instead.** Brief specifies a maximum iteration count or a budget cap. The brief is allowed to fail with "max iterations reached" and surface to the user.

**Watch for changes.** Stable.

---

### A15. Don't gate-stack

> **Anti-pattern** — Adding a fourth gate, then a fifth, until every phase has a gate.

**Why it's wrong (as of 2026-04-29).** Each gate doubles potential cost (it has up to 3 iterations, each with cross-model critique). Three gates per engagement is the upper bound that hasn't broken cost or wall-time targets. Beyond three, engagements become slow and expensive without measurably better output.

**What to do instead.** Three gates: one strategic alignment (A), one plan quality (B), one per-output quality (C). New quality concerns get folded into existing gates as new criteria, not as new gates.

**Watch for changes.** As model speed improves, more gates become viable. Watch wall-time and cost; if the engagement budget allows more gates without breaking the user experience, the constraint loosens.

---

## Part VI — Open Questions

These are decisions we haven't resolved. Listed for transparency, not for prescription.

### Q1. How many specialists is too many?

We have 17 in Social Studio, 19 in SEO Studio. There's some friction at this size — the orchestrator's routing table is long; new joiners have to scan it carefully. But there's no observed quality degradation. The right number is probably "as many as you need" with the discipline of merging when two specialists' jobs blur.

### Q2. Should studios share a state file format across the firm?

Right now each studio has its own `state.json` shape. SEO and Social have similar but non-identical shapes. A unified state schema would enable cross-studio tooling but force premature standardization. We're holding off until the duplication causes a real problem.

### Q3. When should commands have GUIs?

A Telegram intake works for power users; less technical users would benefit from a web form (with all the trade-offs we noted in Principle 13). The right answer is probably _both_ — Telegram for the conversation, a web form for users who prefer it, with both producing the same intake structure. Not a priority.

### Q4. How do we handle multi-tenant studios?

Each engagement currently has one client. A studio that takes engagements from many clients (a real PSF would have a dozen active engagements at once) introduces concurrency, conflicts checks across clients, knowledge-management questions ("can intake X reference learnings from intake Y?"). We haven't hit this case yet. When we do, the methodology will need extension.

### Q5. When should we adopt a real database?

JSON state files are working. They'll continue to work as long as engagements are single-writer. The instant we have concurrent writes (two specialists racing to update the same field), we need either a database or a careful application-level lock. Watch the signal; don't over-build.

### Q6. Practice groups

The methodology gestures at "practice groups" (clusters of related studios) but doesn't specify how they're managed. A Content Practice Group of SEO + Social + Blog studios would benefit from a shared knowledge base, shared intake conventions, maybe a shared meta-orchestrator for cross-studio engagements. We don't have one yet. The shape is unclear.

### Q7. Versioning the constitution

The constitution evolves. A Gate C run on date X says it applied constitution v3.2; in date Y a new article exists. How do we audit-resolve "did this engagement satisfy the _current_ constitution or the _constitution at the time of the engagement?_" Both answers are useful in different contexts; we haven't picked one.

### Q8. Cross-model critic in a converged-model future

If Sonnet and Opus produce indistinguishable critiques in 2027, the cross-model rule weakens. We'd need a different bias-isolation mechanism. Possibilities: prompt-style isolation (intentionally asking critics to adopt different framings), retrieval-grounded critique (the critic references specific external evaluations), or specialized critic models trained explicitly to disagree with generation models. Unresolved.

---

## Maintenance

This document is updated whenever:

- A new principle is identified (a decision becomes load-bearing and worth documenting).
- An anti-pattern is added (we learn what not to do).
- An existing principle's half-life is reached and we either re-validate it or revise it.
- An open question gets answered.

When you update this document, **date the change** at the top of the affected entry. The dating is what makes a "living document" honest; without it, readers can't tell what's still current.

---

## See also

- [`README.md`](README.md) — the methodology itself
- [`comparison.md`](comparison.md) — how the Department Model differs from other agentic frameworks
- [`../../../skills/social-orchestrator/references/social-constitution.md`](../../../skills/social-orchestrator/references/social-constitution.md) — example of a constitution
- [`../skills.md`](../skills.md) — current skill inventory
