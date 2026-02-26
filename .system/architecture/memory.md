# Memory System Architecture

> Part of [System Architecture](README.md)
> Last Updated: 2026-02-25

---

## Overview

OpenClaw uses a file-backed, embedding-indexed memory system. Agents write markdown files to disk; the memory indexer chunks, embeds, and stores them in per-agent SQLite databases for semantic search.

```
~/agent-workspace/
├── MEMORY.md                  ← Long-term memory (persistent facts, project state, config)
└── memory/
    ├── 2026-02-05.md          ← Daily session logs
    ├── 2026-02-06.md
    ├── ...
    └── 2026-02-25.md

~/.openclaw/memory/
├── main.sqlite                ← Primary index (coordinator)
├── marketing.sqlite           ← Per-agent index (marketing)
├── seo.sqlite                 ← Per-agent index (seo)
├── sales.sqlite               ← ...
├── legal.sqlite
├── finance.sqlite
├── data.sqlite
├── media-content.sqlite
├── quality-critic.sqlite
├── dev-coder.sqlite
├── prod-coder.sqlite
├── planner.sqlite
├── grunt.sqlite
├── workspace-auditor.sqlite
├── product.sqlite
├── support.sqlite
└── search.sqlite
```

---

## How It Works

### Write Path

1. Agent (or user via coordinator) writes/updates a `.md` file in `~/agent-workspace/memory/` or `~/agent-workspace/MEMORY.md`
2. Files are plain markdown — no special format required
3. Changes are NOT automatically indexed (the index must be triggered)

### Index Path

1. `openclaw memory index` scans `~/agent-workspace/memory/` and `~/agent-workspace/MEMORY.md`
2. Each file is chunked (split into semantic sections by headings/paragraphs)
3. Each chunk is embedded via `openai/text-embedding-3-small`
4. Chunks + embeddings are stored in SQLite (one DB per agent + main)
5. FTS (full-text search) index is also built for keyword search

### Read Path

1. Agent receives a task from the coordinator
2. Memory system performs semantic search against the agent's SQLite DB
3. Relevant chunks are injected into the agent's context
4. Only the coordinator sees `MEMORY.md` directly (sub-agents search their index)

---

## File Conventions

### MEMORY.md (Long-Term)

Persistent facts that should survive across all sessions:

```markdown
# Long-term Memory

## User Preferences
- **Links**: Always provide live/clickable links. (Added: YYYY-MM-DD)

## Active Projects
### Project Name
- **Domain**: example.com
- **Phase**: Strategy → Implementation
- (Updated: YYYY-MM-DD)

## Configuration
### OpenClaw Gateway
- **Config**: ~/.openclaw/openclaw.json
- **Model**: google/gemini-3.1-pro-preview
- (Updated: YYYY-MM-DD)

## Infrastructure Alerts
- **Issue**: Description. ❓ VERIFY status. (Added: YYYY-MM-DD)
```

### Daily Logs (memory/YYYY-MM-DD.md)

Session-specific context that gets indexed for later retrieval:

```markdown
# Session Log: YYYY-MM-DD
> Domain: Topic1, Topic2, Topic3

## Status Summary
One paragraph of what was accomplished.

## Key Actions
### Action 1
- Details...

### Action 2
- Details...

## Files Created/Modified
- `path/to/file.md` (NEW/UPDATED)

## TODO
- [ ] Pending item
- [x] Completed item
```

---

## Maintenance

### Check Index Health

```bash
openclaw memory status
```

Look for:
- **Dirty: yes** → Index is stale, needs reindex
- **Indexed: 0/N files** → Agent can't search memory
- **Embedding cache: 0 entries** → Embeddings haven't been generated

### Reindex (fixes dirty/empty stores)

```bash
openclaw memory index --force
```

This reindexes ALL agent stores. Run after:
- Adding/editing memory files
- Gateway restart (if index seems stale)
- Memory audit reveals dirty stores

### Search Memory

```bash
openclaw memory search "query text"
```

### Quick Health Check (one-liner)

```bash
openclaw memory status 2>&1 | grep -E "Dirty: yes|Indexed: 0/"
```

If this produces output, memory is unhealthy. If empty, all stores are clean.

---

## Known Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| All agent stores dirty after gateway restart | `Indexed: 0/N files` for all agents | `openclaw memory index --force` |
| New memory files not searchable | Agent can't find recent context | `openclaw memory index` (no --force needed) |
| Embedding cache miss | Slow first search after reindex | Normal — cache builds on first query |
| Daily log gap | Missing days in `memory/` directory | Create backfill entries for significant work |

---

## Audit Checklist

Run this during architecture reviews or maintenance:

- [ ] `openclaw memory status` shows all stores indexed and clean (Dirty: no)
- [ ] File count matches: `ls ~/agent-workspace/memory/*.md | wc -l` matches indexed file count (minus 1 for MEMORY.md at workspace root)
- [ ] No daily log gaps > 3 days during active work periods
- [ ] `MEMORY.md` has been updated within the last 7 days
- [ ] `MEMORY.md` Active Projects section matches actual project state
- [ ] `MEMORY.md` Configuration section matches `~/.openclaw/openclaw.json`
- [ ] Stale TODOs in daily logs are resolved or marked done
- [ ] Infrastructure Alerts in `MEMORY.md` have been verified or resolved

---

## Integration with Architecture Workflow

The `/architecture` review workflow includes memory health as a maintenance check:

1. **arch-verify.sh** checks for dirty memory indexes automatically
2. If dirty indexes are found, the script reports them as a ❌ MISMATCH
3. Fix: `openclaw memory index --force`

See: [MAINTENANCE.md](MAINTENANCE.md) for the broader documentation maintenance strategy.
