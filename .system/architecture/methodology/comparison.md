# Comparison: The Department Model vs Other Agentic Frameworks

> Companion to [`README.md`](README.md) and [`principles.md`](principles.md). This file argues for _when_ the Department Model is the right choice and _when_ one of its peers is. It is opinionated and dated.

**Version 1 · 2026-04-29 · Living document**

The agentic-AI ecosystem has matured fast. There are now half a dozen serious frameworks for coordinating LLM-based agents, plus several patterns (MCP, OpenAPI tools, native function calling) that are framework-adjacent. None of them does what the Department Model does, but several do _adjacent_ things, and some do things the Department Model deliberately chose not to.

This file walks through each, says where it overlaps, and says where the trade-offs differ.

The honest summary upfront: **the Department Model wins for long-horizon creative knowledge work driven by file-based state and prose-as-runtime. It loses for real-time orchestration, code-heavy multi-agent reasoning, and any system where the dispatch decisions need to be type-checked.** The reader should hold that summary in mind while reading the section-by-section comparisons.

---

## Table of Contents

- [The Landscape, Briefly](#the-landscape-briefly)
- [vs LangGraph](#vs-langgraph)
- [vs CrewAI](#vs-crewai)
- [vs AutoGen](#vs-autogen)
- [vs AutoGPT / BabyAGI / similar autonomous-loop systems](#vs-autogpt--babyagi--similar-autonomous-loop-systems)
- [vs MCP (Model Context Protocol)](#vs-mcp-model-context-protocol)
- [vs Function Calling / Tool Use APIs](#vs-function-calling--tool-use-apis)
- [vs The "Build Your Own with Just Prompts" School](#vs-the-build-your-own-with-just-prompts-school)
- [Decision Matrix](#decision-matrix)
- [The Underlying Disagreement](#the-underlying-disagreement)
- [Honest Limitations](#honest-limitations)

---

## The Landscape, Briefly

Most agentic-AI frameworks fall into a few broad camps:

- **Graph-based orchestration** — LangGraph, Inngest's agent kit. Pipelines are explicit graphs of nodes and edges, written in code.
- **Role-based crews** — CrewAI. Pipelines are teams of role-played agents that negotiate work among themselves.
- **Conversation-based** — AutoGen. Multi-agent dialogue is the primary coordination primitive.
- **Autonomous loops** — AutoGPT, BabyAGI. A single agent recursively generates and executes its own subtasks.
- **Protocol layers** — MCP. Not a framework but a protocol for connecting models to tools and data sources.
- **DIY** — Just write prompts, no framework. The bare-metal alternative.

The Department Model fits awkwardly into this taxonomy. Structurally it's closest to graph-based orchestration (defined pipelines, explicit gates), but it shares the prompt-driven character of role-based crews. The dispatch logic is implicit (in the model's interpretation of routing tables) rather than explicit (encoded in graph edges). It is closer to "DIY with a strong methodology" than to a packaged framework.

We'll go through each comparison.

---

## vs LangGraph

[LangGraph](https://langchain-ai.github.io/langgraph/) is LangChain's graph-based orchestration framework. You define a state graph in Python; nodes are functions that receive and return state; edges are conditional routing decisions. It's currently the most production-ready of the agentic-AI frameworks for serious use.

### Where they overlap

Both frameworks model engagements as state flowing through phases. Both treat phase transitions as explicit (a node finishes; routing decides what runs next). Both are stateful in a way that pure prompt chains are not.

### Where they differ

**Code vs prose.** A LangGraph pipeline is Python; a Department Model pipeline is markdown. This is the central difference; everything else flows from it.

**Type safety.** LangGraph offers Pydantic-typed state and type-checked node signatures. The Department Model has no type system; the model's interpretation is the only safety mechanism. This is a real cost to our approach: if a specialist returns malformed JSON, no error fires until something tries to read it. LangGraph would have caught the error at the type-check.

**Dispatch determinism.** LangGraph's edge routing is a deterministic function of state. The Department Model's routing is a model interpreting a markdown table; same state can theoretically take different paths in different runs (in practice it doesn't, with current models, but the guarantee is empirical, not theoretical).

**Pipeline mutability.** Updating a LangGraph pipeline is a Python edit, a deployment, a test run. Updating a Department Model pipeline is a markdown edit, no deployment, no test run. The Department Model is dramatically faster to iterate; the iteration cost is reliability.

**Ergonomics for non-engineers.** A non-engineer can read a Department Model brief and understand what the engagement does. A non-engineer reading LangGraph code reads code, with all that implies.

**Observability.** LangGraph's state is observable through code-level inspection, debugging, structured logging. The Department Model's state is observable through reading JSON files in a workspace. Both are debuggable; LangGraph is more deeply debuggable; the Department Model is more _legibly_ debuggable.

### When to choose which

**Choose LangGraph when:**

- The pipeline runs in production with strict reliability requirements.
- The engineering team is comfortable in Python and prefers compile-time safety over iteration speed.
- The pipeline involves complex branching that benefits from explicit graph representation (multi-agent negotiations, parallel-with-merge work).
- You need to integrate with the rest of the LangChain ecosystem (chains, memory backends, retrieval).
- The work is pipeline-shaped _but not_ document-shaped — the deliverable is a database mutation, an external API call, a streamed response, not a markdown report.

**Choose the Department Model when:**

- Engagements are long-horizon (hours, days, weeks) and human-in-the-loop is normal.
- Deliverables are documents — strategies, plans, briefs, decks, reports.
- The team values writing and is willing to invest in prose discipline.
- Iteration speed on the pipeline itself is more valuable than compile-time safety.
- The system needs to be legible to non-engineers (clients, designers, marketers).
- The pipeline is going to evolve a lot, especially in its early life.

### Honest summary

LangGraph is a more capable framework if you treat agentic systems as code and want Python-quality engineering tools. The Department Model is a more capable methodology if you treat agentic systems as organizations and want organizational-quality conventions. They're not in direct competition; they're in different categories.

---

## vs CrewAI

[CrewAI](https://www.crewai.com/) is a role-based agent framework. You define agents with roles (researcher, writer, critic), give them tools, and have them collaborate via a `crew.kickoff()` call. Output emerges from the agents talking to each other.

### Where they overlap

Both use role-based vocabulary (CrewAI: agent roles like "Senior Research Analyst"; Department Model: Specialist, Senior Partner). Both insist on specialization. Both produce outputs through coordinated multi-agent work.

### Where they differ

**Coordination model.** CrewAI's primary coordination is _agents talking to each other_ — a writer asks a researcher for input; the researcher replies; the writer drafts; a critic comments. The Department Model's coordination is _specialists writing to a state file the orchestrator reads_ — there's no inter-specialist conversation. Coordination is hierarchical (orchestrator above specialists), not lateral.

**Determinism.** CrewAI's emergent multi-agent dialogue is famously inconsistent. Two runs of the same crew on the same input can produce meaningfully different outputs because the agents took different paths through their negotiation. The Department Model's hierarchical structure produces more consistent outputs at the cost of less emergent surprise.

**State.** CrewAI state lives in agent memory and the conversation history. The Department Model state lives in a JSON file. Resumability and auditability are dramatically easier in the Department Model; emergent novelty is dramatically easier in CrewAI.

**Production readiness.** CrewAI shines for prototyping ("can a team of agents do this task?"). Production use exposes the coordination cost — runs are slower than they need to be because agents talk a lot to figure out what to do. The Department Model's hierarchical dispatch is faster and cheaper at production scale.

**Cost.** CrewAI's multi-agent dialogue burns tokens on coordination. A research-write-critique loop in CrewAI might cost three to five times what the equivalent Department Model engagement costs, because the conversation itself is expensive.

### When to choose which

**Choose CrewAI when:**

- The work benefits from emergent collaboration and you want the agents to surprise you.
- You're prototyping; you don't yet know what specialists you need.
- The team likes the role-play frame and finds it useful for thinking.
- The deliverable benefits from negotiation among perspectives (a contested analysis, a creative debate).

**Choose the Department Model when:**

- The work has a known shape and you want consistent, predictable execution.
- Cost matters; CrewAI's coordination overhead is meaningful.
- You need auditability and resumability.
- The deliverable is a document with structure you can describe.

### Honest summary

CrewAI is a great way to _discover_ what agents can do for a task. The Department Model is a great way to _productionize_ what they're doing. They're complementary in a workflow: prototype with CrewAI, productionize with the Department Model.

---

## vs AutoGen

[AutoGen](https://microsoft.github.io/autogen/) (Microsoft) is a conversation-based multi-agent framework. Agents converse with each other and with the user; coordination emerges from dialogue.

### Where they overlap

Both treat multi-agent coordination as primary. Both support typed agents with distinct roles. Both can implement the patterns the Department Model implements.

### Where they differ

**Conversation as primitive.** AutoGen's coordination primitive is the _message_ — agents send messages to each other and to the user. The Department Model's primitive is the _file_ — specialists read and write files. Messages are ephemeral; files persist. This makes AutoGen better at real-time interactive work and the Department Model better at long-horizon documented work.

**State.** AutoGen state lives in the chat history (which can be persisted but is fundamentally a conversation log). The Department Model state lives in a structured JSON file. Querying state in AutoGen requires re-reading the conversation; in the Department Model, you read a field.

**Code orientation.** AutoGen is heavily Python-oriented. Defining agents, tool registries, configurations — all in Python. The Department Model has almost no Python (the deterministic specialists like aggregators, and that's it).

**Agent autonomy.** AutoGen's agents are more autonomous within their conversations than Department Model specialists are. A specialist gets a request and produces an output; an AutoGen agent might decide to ask three questions, call a tool, and re-ask before producing anything. This autonomy is sometimes a feature, sometimes a bug.

### When to choose which

**Choose AutoGen when:**

- The work is conversational by nature (negotiation, brainstorming, interactive analysis).
- You want agent autonomy — agents that decide what they need to do their job.
- The team is Python-fluent and wants Microsoft's research-grade tooling.

**Choose the Department Model when:**

- The work is document-driven, not conversation-driven.
- You want predictable, hierarchical execution rather than emergent autonomy.
- Audit trails of "what got produced when" matter more than transcripts of "who said what."

### Honest summary

AutoGen is built around conversation-as-coordination. The Department Model is built around files-as-coordination. They're solving different problems.

---

## vs AutoGPT / BabyAGI / similar autonomous-loop systems

[AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) and its kin (BabyAGI, AgentGPT) are autonomous task-generation loops. The agent gets a goal; it generates subtasks; it executes them; it generates more subtasks based on results; it loops until the goal is achieved.

### Where they overlap

Almost nowhere. Different paradigm.

### Where they differ

**Autonomy.** AutoGPT-class systems are _highly autonomous_. They invent their own subtasks. They decide their own next steps. They route their own work. The Department Model is the opposite: the orchestrator's routing table is exhaustive; the brief specifies phases; the gates are explicit; the iteration cap is enforced. The Department Model deliberately _reduces_ agent autonomy in favor of structure.

**Reliability.** AutoGPT-class systems are notorious for going off the rails — generating absurd subtasks, getting stuck in loops, producing wildly inconsistent output. The Department Model is reliable to a fault.

**Task structure.** AutoGPT works best on goals that don't have a known structure ("research X and tell me what you find"). The Department Model works best on goals that _do_ have a known structure (the engagement type is named, has phases, has gates).

### When to choose which

**Choose AutoGPT-class when:**

- The goal is genuinely open-ended and you want the agent to surprise you.
- Cost is not a concern.
- Reliability is not a concern.
- Research / exploration use cases.

**Choose the Department Model when:**

- You know the shape of the work.
- Cost matters.
- Reliability matters.
- Production use cases.

### Honest summary

AutoGPT scaled agent _autonomy_; the Department Model scales agent _reliability_. The publishable thesis (Insight 12 from the methodology development): **autonomy scales agent capabilities; structure scales agent reliability**. For long-horizon production work, structure wins.

---

## vs MCP (Model Context Protocol)

[MCP](https://modelcontextprotocol.io/) is Anthropic's protocol for connecting models to external tools and data sources. It's not a framework; it's a protocol layer. MCP servers expose tools (file reads, database queries, API calls) that any MCP-aware client can use.

### Where they overlap

The Department Model's specialists _use_ MCP-exposed tools. The skills in our system call tools that come from MCP servers (file system, web search, custom APIs). MCP is plumbing; the Department Model is architecture; they coexist.

### Where they differ

MCP doesn't tell you how to _organize_ an agentic system. It tells you how to _connect_ an agentic system to data and tools. It's the equivalent of a power outlet — necessary, useful, but doesn't determine the layout of the house.

The Department Model is the layout. It uses MCP outlets where appropriate.

### When to choose which

This is not a choice — they're at different layers. Use MCP for tool integration; use the Department Model (or another methodology) to organize the system that consumes those tools.

### Honest summary

MCP is a piece of plumbing the Department Model relies on. They're complementary.

---

## vs Function Calling / Tool Use APIs

The lowest-level alternative: just use the model's native function-calling API. Define functions; call the model with a system prompt and the function list; let the model invoke functions; loop.

### Where they overlap

The Department Model's specialists, at the bottom, are doing this — invoking functions (web search, file read, exec). The model's function-calling capability is the substrate the entire pattern runs on.

### Where they differ

Function calling alone doesn't give you any organization. You have a model and some tools; what you do with them is up to you. The Department Model is _one answer_ to "what do you do with them" — others exist.

### When to choose which

Function calling without further structure is appropriate for:

- Single-turn tasks (a chatbot answering one question with tool support).
- Simple workflows that don't need state, gates, or coordination.
- Very short prototypes.

The Department Model is appropriate when the work outgrows single-turn function calling — when you need multiple turns, persistent state, quality gates, multi-step pipelines.

### Honest summary

Function calling is a building block. The Department Model is a way of arranging those blocks. They're at different layers.

---

## vs The "Build Your Own with Just Prompts" School

A meaningful camp of practitioners argues against frameworks entirely. The argument: most frameworks add overhead and abstraction that the model doesn't need; just write good prompts and let the model do the work. (See: Hamel Husain's framework critiques, Simon Willison's "just use prompts" school.)

### Where they overlap

The Department Model is closer to the no-framework school than to LangGraph or CrewAI. Most of what the Department Model does is "write good prompts in markdown files and structure them carefully." There's no framework runtime; there's almost no code.

### Where they differ

The Department Model is a _methodology_, not a framework. It tells you _how to write good prompts in a coordinated way_. The just-use-prompts school is silent on coordination; you're on your own to figure out how to make ten prompts work together.

A team that's "just using prompts" for a long-horizon creative-knowledge engagement will eventually invent something like the Department Model — or invent something _worse_ than the Department Model, ad hoc, without the benefit of having thought through the trade-offs. Methodologies exist to spare teams the cost of reinventing.

### When to choose which

**Choose just-prompts when:**

- The system is small (one or two prompts).
- The team is exploratory and isn't yet sure what they're building.
- You're at the very start of a project.

**Choose the Department Model when:**

- The system is medium-to-large (a studio with a dozen specialists, multi-phase engagements).
- The team is producing consistent client work.
- You've passed the "what are we building" stage.

### Honest summary

The just-prompts school and the Department Model agree more than they disagree. The Department Model is just-prompts with conventions added — conventions for how to organize, how to coordinate, how to govern, how to maintain. Teams that resist conventions will reject the Department Model on principle. Teams that have outgrown ad-hoc coordination will find the conventions liberating.

---

## Decision Matrix

If you're choosing among these options, this matrix is a starting point. None of these criteria is decisive on its own.

| Criterion                                  | Best fit                                               |
| ------------------------------------------ | ------------------------------------------------------ |
| Strict reliability, type-safe state        | LangGraph                                              |
| Emergent multi-agent collaboration         | CrewAI                                                 |
| Conversation as primary primitive          | AutoGen                                                |
| Open-ended autonomous task generation      | AutoGPT-class                                          |
| Tool integration only (not orchestration)  | MCP / function calling                                 |
| Long-horizon document work, hours-to-weeks | Department Model                                       |
| Hierarchical pipeline with explicit gates  | Department Model or LangGraph                          |
| Telegram or chat-driven engagement intake  | Department Model                                       |
| Strong audit trails + resumability         | Department Model or LangGraph                          |
| Iteration speed on the pipeline itself     | Department Model                                       |
| Non-engineer-readable pipelines            | Department Model                                       |
| Real-time low-latency responses            | None of the above (use plain function calling)         |
| Heavy concurrent state mutation            | LangGraph (or a real database)                         |
| Strict transactional guarantees            | None of the above (use a database with proper schemas) |

---

## The Underlying Disagreement

The agentic-AI ecosystem has a quiet philosophical split. On one side: **"agents are software components, organize them with software."** This camp builds frameworks (LangGraph, CrewAI, AutoGen) that treat agents as objects in a programming model, with types, signatures, registries, and code-level abstractions.

On the other side: **"agents are knowledge workers, organize them with conventions."** This camp builds methodologies (the Department Model, Anthropic's own [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) guidance, the just-prompts school) that treat agents as participants in human-style work and use prose, files, and conventions to coordinate them.

Neither camp is wrong; they're optimizing different things.

The software-as-organization camp gets you: type safety, version-stable contracts, code-quality engineering tools, integrations into existing engineering workflows, the ability to test and benchmark.

The conventions-as-organization camp gets you: prose-readable systems, faster iteration, less framework lock-in, fewer translation steps between intent and execution, easier human-in-the-loop integration.

The Department Model is squarely in the second camp. Its methodology choices are explicit applications of the underlying philosophy:

- **Markdown over code** because the artifact is the program.
- **Files over databases** because legibility matters more than concurrency in our work.
- **Routing tables over edges** because prose is more flexible than structure.
- **Constitutional values over rule lists** because values guide judgement, rules don't.
- **Conventions over enforcement** because trusting the team and the model is faster than building runtime checks.

If the underlying philosophy resonates, the Department Model is one realization of it. If it doesn't, you'll find LangGraph or another framework more comfortable.

---

## Honest Limitations

This document would be incomplete without explicit limitations. The Department Model is one approach among several, with real costs.

### What it doesn't give you

- **Compile-time safety.** A specialist that produces malformed JSON fails at runtime, in whatever phase tries to consume it. LangGraph would have caught this at the type level.
- **Built-in observability.** Pipeline traces require reading state files and reconstructing what happened. LangGraph's tracing is more deeply integrated.
- **Performance benchmarks across pipelines.** Frameworks let you A/B test pipeline variants; the Department Model has no equivalent (you can compare outputs by running engagements, but it's manual).
- **A standard library.** LangChain has hundreds of pre-built components (retrievers, parsers, memory backends). The Department Model has nothing like that — every specialist is hand-authored.
- **Production deployment infrastructure.** LangGraph integrates with cloud platforms, queueing systems, monitoring tools. The Department Model runs in whatever environment runs the underlying model, full stop.

### What's not yet proven

- **Scaling to many concurrent engagements.** Today every engagement is single-threaded. We don't yet know how the methodology handles, say, fifty active engagements with shared resources.
- **Multi-tenant isolation.** Our studios serve a small number of clients. What happens when a studio has a hundred clients with strict isolation requirements is untested.
- **Practice groups in earnest.** The "practice group" abstraction (clusters of related studios) is gestured at but not implemented. We don't yet know what cross-studio coordination at scale looks like.
- **Models other than current Claude.** The pattern was developed against current Claude (Sonnet, Opus). It probably works on GPT-class models with modifications; we haven't run the experiment systematically.

### Where the methodology is most fragile

- **Constitution length.** Our constitutions are 10–14 articles. We've argued this is the upper bound; we don't yet know what happens at 20 or 30.
- **Routing table size.** Social Studio's routing table has 17+ rows. At 50, the model's ability to route consistently may degrade.
- **Cross-model critic in a converged-model future.** If all major models become stylistically indistinguishable, the cross-model rule loses force.
- **Iteration cap as models improve.** The three-iteration cap is empirical. As models improve, the diminishing-returns inflection point may move.

The methodology is honest about these. The principles document discusses each in detail.

---

## What the Department Model Could Learn from Each Peer

A truly comparative document acknowledges what each peer does _better_ than the Department Model. Pretending we win every dimension would weaken the doc. We don't.

### From LangGraph: Type safety on the engagement file

LangGraph's typed state is a real engineering advantage. Specialists writing to a state file with no schema enforcement will, occasionally, write malformed data that breaks downstream specialists. The error surfaces late, in whichever phase tries to consume the malformed data.

A pragmatic borrow: a JSON Schema for the engagement file, validated on every write. Not as deeply integrated as LangGraph's type system, but enough to catch malformed state at the source. The cost is small; we should adopt this in v2.

### From CrewAI: The role-play frame as a thinking tool

CrewAI's commitment to role-play — _"You are a Senior Research Analyst with 15 years of experience"_ — is more than aesthetic. Models perform better when given a coherent persona to inhabit, even on technical tasks. The Department Model's specialists have job descriptions but not personas.

A pragmatic borrow: each specialist's SKILL.md could open with a one-paragraph persona statement (_"You are a research analyst specializing in creator-economy data..."_). This isn't role-play for entertainment; it's prompt engineering with documented benefit. Worth experimenting with.

### From AutoGen: First-class agent-to-agent dialogue

The Department Model strictly forbids specialist-to-specialist communication (Principle 4). This makes the system simpler but precludes a class of valuable interactions: _the writer asks the researcher a clarifying question_. AutoGen handles this naturally; we don't.

A possible borrow: a structured "question" mechanism where a specialist can write a `clarification_request` to the engagement file, the orchestrator notices, routes to the appropriate specialist, and routes the answer back. Not full agent-to-agent dialogue, but enough to handle the legitimate cases. We haven't built this. We may need to.

### From AutoGPT: Open-ended exploration phases

The Department Model's phases are deterministic in shape — every engagement of a given type runs the same phases. AutoGPT's autonomy lets it adapt the work plan to what it discovers. There are real cases (research engagements where the next step depends on findings) where this autonomy is appropriate.

A possible borrow: an explicit "exploration phase" in some engagement types, where the specialist generates its own next-N subtasks within bounds. The bounds keep cost controlled; the autonomy lets the work follow the data. This would be a deliberate, scoped relaxation of our normally rigid structure.

### From MCP: Standardization at the tool layer

MCP standardizes how tools expose themselves to models. The Department Model's specialists invoke tools through ad-hoc convention (a specialist calls `web_search`, calls `web_fetch`, runs a Python script). We've avoided MCP's standardization layer because our scope is narrower.

We'll likely adopt MCP for tool definitions over time. It costs nothing and gives us a clean separation between _what tools exist_ and _who uses them_. This is just plumbing-modernization, not a methodology change.

### From the just-prompts school: Healthy skepticism of frameworks

The just-prompts camp's fundamental claim — _most framework abstractions are unnecessary_ — has been borne out repeatedly in our work. Every time we've been tempted to add framework infrastructure to the Department Model, we've ended up better served by _not_ adding it. The just-prompts school's discipline is worth borrowing whenever a new piece of methodology overhead is proposed.

A pragmatic borrow: every new convention or abstraction should justify its existence by a concrete failure that motivated it. Conventions added "for completeness" or "for future-proofing" are anti-patterns in disguise. The principles document already captures this in Principle 17 (factor references on real reuse). It's worth holding it as a general defense.

---

## When to read the framework comparisons elsewhere

The agentic-AI literature is vast and changing fast. For up-to-date framework comparisons:

- **[Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)** (Anthropic, 2024) — the closest articulated methodology to the Department Model from a major lab.
- **[The Tao of LangGraph](https://blog.langchain.dev/tao-of-langgraph/)** (LangChain) — the framework's own positioning.
- **[CrewAI Documentation](https://docs.crewai.com/)** — role-based crews.
- **[AutoGen Documentation](https://microsoft.github.io/autogen/)** — conversation-based.
- **[Hamel Husain's posts on agentic systems](https://hamel.dev/)** — the practitioner-skeptical view.
- **[Simon Willison's blog on LLMs](https://simonwillison.net/tags/llms/)** — broad ecosystem coverage.

The Department Model fits among these as one option, with strong opinions and explicit trade-offs. We don't claim it's universally best; we claim it's the right choice for _long-horizon, document-driven, file-based, briefed creative knowledge work_. For other work, choose differently.

---

## See also

- [`README.md`](README.md) — what the Department Model is and how to work in it
- [`principles.md`](principles.md) — why we chose what we chose, and what we've learned not to do
- The actual studios in this codebase: `social-orchestrator/`, `seo-orchestrator/`, `blog-orchestrator/`
