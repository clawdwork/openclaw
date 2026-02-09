# Architecture Documentation — Maintenance Proposal

> Problem: Architecture docs contain duplicated values across 9 files. Changes require updating N files manually, leading to stale data (wrong ports, wrong skill counts, unclear install paths).

---

## Pain Points (observed 2026-02-09)

| Issue                                                                              | Root Cause                                                                       | Files Affected                          |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| Gateway port was 49152 in docs, actual is 19400                                    | LaunchAgent plist overrides config                                               | README.md, channels.md, skills.md       |
| Skill count was 50, actual is 60                                                   | No automated count                                                               | README.md, skills.md (4 places)         |
| New skills created in repo `skills/` but gateway reads `~/agent-workspace/skills/` | Unclear install path                                                             | skills.md (documented but easy to miss) |
| API key location unclear                                                           | Multiple env mechanisms (`.env.example`, `~/.openclaw/.env`, config `env` block) | security.md, README.md                  |

---

## Proposal: 3 Changes

### 1. Add a verification script (`scripts/arch-verify.sh`)

A single script that checks actual system state against what the docs claim. Run it from the `/architecture` workflow before any update.

```bash
#!/usr/bin/env bash
# scripts/arch-verify.sh — Check actual state vs documented state
set -euo pipefail

echo "=== Gateway Port ==="
ACTUAL_PORT=$(plutil -extract EnvironmentVariables.OPENCLAW_GATEWAY_PORT raw \
  ~/Library/LaunchAgents/ai.openclaw.gateway.plist 2>/dev/null || echo "unknown")
DOC_PORT=$(grep -oP 'ws://127\.0\.0\.1:\K\d+' \
  .implementation/system-architecture/README.md | head -1)
echo "  Actual (LaunchAgent): $ACTUAL_PORT"
echo "  Documented (README):  $DOC_PORT"
[ "$ACTUAL_PORT" = "$DOC_PORT" ] && echo "  ✅ Match" || echo "  ❌ MISMATCH"

echo ""
echo "=== Skill Count ==="
ACTUAL_COUNT=$(ls ~/.openclaw/skills/ 2>/dev/null | wc -l | tr -d ' ')
DOC_COUNT=$(grep -oP '\d+ skills' .implementation/system-architecture/skills.md | head -1 | grep -oP '\d+')
echo "  Actual (managed dir): $ACTUAL_COUNT"
echo "  Documented (skills.md): $DOC_COUNT"
[ "$ACTUAL_COUNT" = "$DOC_COUNT" ] && echo "  ✅ Match" || echo "  ❌ MISMATCH"

echo ""
echo "=== Celavii Skills Installed ==="
for skill in celavii-discover celavii-profiles celavii-campaigns celavii-crm \
  celavii-analytics celavii-knowledge celavii-data-ops; do
  if [ -d ~/.openclaw/skills/$skill ]; then
    echo "  ✅ $skill"
  else
    echo "  ❌ $skill MISSING from managed dir"
  fi
done

echo ""
echo "=== API Keys in ~/.openclaw/.env ==="
for key in ANTHROPIC_API_KEY OPENAI_API_KEY GEMINI_API_KEY CELAVII_API_KEY \
  ELEVENLABS_API_KEY BRAVE_API_KEY; do
  if grep -q "^${key}=" ~/.openclaw/.env 2>/dev/null; then
    VAL=$(grep "^${key}=" ~/.openclaw/.env | cut -d= -f2)
    if [ -n "$VAL" ]; then
      echo "  ✅ $key (set)"
    else
      echo "  ⚠️  $key (empty)"
    fi
  else
    echo "  ❌ $key (missing)"
  fi
done

echo ""
echo "=== Gateway Status ==="
OPENCLAW_GATEWAY_PORT=$ACTUAL_PORT openclaw channels status 2>&1 | grep -E "reachable|not reachable" | head -1
```

**Add to `/architecture` workflow** as a pre-check step.

### 2. Reduce duplication with a single-source values file

Create `.implementation/system-architecture/VALUES.md` as the single source of truth for frequently-changing values. Other docs reference it instead of hardcoding.

```markdown
# System Values (Single Source of Truth)

| Key                       | Value                                           | Last Verified |
| ------------------------- | ----------------------------------------------- | ------------- |
| **Gateway port**          | 19400                                           | 2026-02-09    |
| **Skill count (managed)** | 60                                              | 2026-02-09    |
| **Skill count (domain)**  | 50                                              | 2026-02-07    |
| **Skill count (celavii)** | 7                                               | 2026-02-09    |
| **Skill count (custom)**  | 5                                               | 2026-02-07    |
| **Agent count**           | 13                                              | 2026-02-07    |
| **Gateway version**       | 2026.2.3                                        | 2026-02-07    |
| **WebSocket URL**         | ws://127.0.0.1:19400                            | 2026-02-09    |
| **WebChat URL**           | http://127.0.0.1:19400                          | 2026-02-09    |
| **Managed skills dir**    | ~/.openclaw/skills/ → ~/agent-workspace/skills/ | 2026-02-09    |
| **API keys location**     | ~/.openclaw/.env                                | 2026-02-09    |
```

This won't prevent duplication entirely, but it gives a single place to check/update and makes the `/architecture` workflow faster (update VALUES.md first, then grep for stale references).

### 3. Add a "New Skill Install" checklist to the `/architecture` workflow

```markdown
## Mode: New Skill Added

### Checklist (all steps required)

1. Create `skills/{name}/SKILL.md` in the repo (source of truth)
2. Copy to `~/agent-workspace/skills/{name}/` (runtime location)
3. Verify visible via `ls ~/.openclaw/skills/{name}/`
4. Update `skills.md` → add to appropriate section
5. Update `skills.md` → increment skill count (all 4 locations)
6. Update `README.md` → document index description + agent model table if applicable
7. If skill needs env vars → update `security.md` env vars section + `~/.openclaw/.env`
8. If skill needs env vars → add to `SHELL_ENV_EXPECTED_KEYS` in `src/config/io.ts`
9. Append to `CHANGELOG.md`
10. Run `scripts/arch-verify.sh` to confirm no drift
```

---

## Implementation Priority

| Step                              | Effort | Impact                                  |
| --------------------------------- | ------ | --------------------------------------- |
| **Verification script**           | 30 min | High — catches drift immediately        |
| **Install checklist in workflow** | 10 min | High — prevents mistakes for new skills |
| **VALUES.md single source**       | 20 min | Medium — reduces grep-and-update burden |

---

## Decision Needed

- **Option A**: Implement all 3 now (1 hour total)
- **Option B**: Just the verification script + checklist (40 min)
- **Option C**: Review and decide later
