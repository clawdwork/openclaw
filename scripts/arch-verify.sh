#!/usr/bin/env bash
# scripts/arch-verify.sh — Verify system state matches architecture documentation
# Run before any /architecture update to detect drift.
set -euo pipefail

ARCH_DIR=".system/architecture"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✅${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠️${NC}  $1"; }
fail() { echo -e "  ${RED}❌${NC} $1"; FAILURES=$((FAILURES + 1)); }

FAILURES=0

echo "╔══════════════════════════════════════════════════╗"
echo "║   Architecture Verification (arch-verify.sh)    ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# --- Gateway Port ---
echo "=== Gateway Port ==="
ACTUAL_PORT=""
if [ -f "$HOME/Library/LaunchAgents/ai.openclaw.gateway.plist" ]; then
  ACTUAL_PORT=$(plutil -extract EnvironmentVariables.OPENCLAW_GATEWAY_PORT raw \
    "$HOME/Library/LaunchAgents/ai.openclaw.gateway.plist" 2>/dev/null || echo "")
fi
if [ -z "$ACTUAL_PORT" ]; then
  ACTUAL_PORT=$(grep -oP '"OPENCLAW_GATEWAY_PORT"\s*=>\s*"\K\d+' \
    "$HOME/Library/LaunchAgents/ai.openclaw.gateway.plist" 2>/dev/null || echo "unknown")
fi

DOC_PORT=$(grep -oE 'ws://127\.0\.0\.1:[0-9]+' "$ARCH_DIR/README.md" 2>/dev/null \
  | head -1 | grep -oE '[0-9]+$' || echo "not found")

echo "  Actual (LaunchAgent): $ACTUAL_PORT"
echo "  Documented (README):  $DOC_PORT"
if [ "$ACTUAL_PORT" = "$DOC_PORT" ]; then
  ok "Port matches"
else
  fail "Port MISMATCH — update README.md, channels.md"
fi

# Check channels.md too
CHAN_PORT=$(grep -oE 'ws://127\.0\.0\.1:[0-9]+' "$ARCH_DIR/channels.md" 2>/dev/null \
  | head -1 | grep -oE '[0-9]+$' || echo "not found")
if [ "$ACTUAL_PORT" = "$CHAN_PORT" ]; then
  ok "channels.md port matches"
else
  fail "channels.md port MISMATCH (has $CHAN_PORT, should be $ACTUAL_PORT)"
fi

echo ""

# --- Skill Count ---
echo "=== Skill Count (Managed Dir) ==="
ACTUAL_COUNT=0
if [ -d "$HOME/.openclaw/skills" ]; then
  ACTUAL_COUNT=$(ls -1d "$HOME/.openclaw/skills"/*/ 2>/dev/null | wc -l | tr -d ' ')
fi

DOC_COUNT=$(grep -oE '[0-9]+ skills' "$ARCH_DIR/skills.md" 2>/dev/null \
  | head -1 | grep -oE '^[0-9]+' || echo "not found")

echo "  Actual (managed dir): $ACTUAL_COUNT"
echo "  Documented (skills.md): $DOC_COUNT"
if [ "$ACTUAL_COUNT" = "$DOC_COUNT" ]; then
  ok "Skill count matches"
else
  fail "Skill count MISMATCH — update skills.md (4 locations), README.md"
fi

echo ""

# --- Celavii Skills ---
echo "=== Celavii Skills ==="
CELAVII_SKILLS="celavii-discover celavii-profiles celavii-campaigns celavii-crm celavii-analytics celavii-knowledge celavii-data-ops celavii-strategy celavii-outreach celavii-reporting"
for skill in $CELAVII_SKILLS; do
  if [ -d "$HOME/.openclaw/skills/$skill" ]; then
    ok "$skill"
  else
    fail "$skill MISSING from managed dir (~/.openclaw/skills/)"
  fi
done

echo ""

# --- API Keys ---
echo "=== API Keys (~/.openclaw/.env) ==="
ENV_FILE="$HOME/.openclaw/.env"
if [ ! -f "$ENV_FILE" ]; then
  fail "~/.openclaw/.env not found"
else
  KEYS="ANTHROPIC_API_KEY OPENAI_API_KEY GEMINI_API_KEY CELAVII_API_KEY ELEVENLABS_API_KEY BRAVE_API_KEY FIRECRAWL_API_KEY REPLICATE_API_TOKEN APIFY_API_TOKEN"
  for key in $KEYS; do
    LINE=$(grep "^${key}=" "$ENV_FILE" 2>/dev/null || echo "")
    if [ -z "$LINE" ]; then
      warn "$key (not in file)"
    else
      VAL=$(echo "$LINE" | cut -d= -f2-)
      if [ -n "$VAL" ]; then
        ok "$key (set)"
      else
        warn "$key (empty)"
      fi
    fi
  done
fi

echo ""

# --- Shared external API keys passthrough check ---
# CELAVII_API_KEY is a shared external API key (not a provider/channel auth var),
# so it doesn't get auto-registered via listKnownProviderAuthEnvVarNames /
# listKnownChannelEnvVarNames. We just verify it's set in ~/.openclaw/.env so
# unsandboxed agents inherit it via process.env.
echo "=== Shared API key passthrough ==="
if grep -q "^CELAVII_API_KEY=cvii_live_" "$HOME/.openclaw/.env" 2>/dev/null; then
  ok "CELAVII_API_KEY present in ~/.openclaw/.env (live key format)"
elif grep -q "^CELAVII_API_KEY=" "$HOME/.openclaw/.env" 2>/dev/null; then
  warn "CELAVII_API_KEY entry exists but value is empty or non-standard"
else
  fail "CELAVII_API_KEY MISSING from ~/.openclaw/.env"
fi

echo ""

# --- Gateway Status ---
echo "=== Gateway Status ==="
if [ -n "$ACTUAL_PORT" ] && [ "$ACTUAL_PORT" != "unknown" ]; then
  if lsof -iTCP:"$ACTUAL_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    ok "Gateway listening on port $ACTUAL_PORT"
  else
    fail "Gateway NOT listening on port $ACTUAL_PORT"
  fi
else
  warn "Could not determine gateway port"
fi

echo ""

# --- VALUES.md check ---
echo "=== VALUES.md Consistency ==="
VALUES_FILE="$ARCH_DIR/VALUES.md"
if [ -f "$VALUES_FILE" ]; then
  VALUES_PORT=$(grep 'Gateway port' "$VALUES_FILE" 2>/dev/null \
    | head -1 | awk -F'|' '{print $3}' | tr -d ' ' || echo "not found")
  VALUES_SKILLS=$(grep 'managed top-level dirs' "$VALUES_FILE" 2>/dev/null \
    | head -1 | awk -F'|' '{print $3}' | tr -d ' ' || echo "not found")

  if [ "$VALUES_PORT" = "$ACTUAL_PORT" ]; then
    ok "VALUES.md port matches actual"
  else
    fail "VALUES.md port ($VALUES_PORT) != actual ($ACTUAL_PORT)"
  fi

  if [ "$VALUES_SKILLS" = "$ACTUAL_COUNT" ]; then
    ok "VALUES.md skill count matches actual"
  else
    fail "VALUES.md skill count ($VALUES_SKILLS) != actual ($ACTUAL_COUNT)"
  fi
else
  warn "VALUES.md not found (create it for single-source-of-truth)"
fi

# --- Memory Index Health ---
echo "=== Memory Index Health ==="
MEMORY_DIR="$HOME/.openclaw/memory"
MEMORY_SOURCE="$HOME/dev/workspace/memory"

if [ -d "$MEMORY_DIR" ]; then
  # Check main.sqlite exists
  if [ -f "$MEMORY_DIR/main.sqlite" ]; then
    ok "main.sqlite exists"
  else
    fail "main.sqlite missing — run 'openclaw memory index --force'"
  fi

  # Count memory source files
  if [ -d "$MEMORY_SOURCE" ]; then
    SOURCE_COUNT=$(find "$MEMORY_SOURCE" -name "*.md" -maxdepth 1 2>/dev/null | wc -l | tr -d ' ')
    # +1 for MEMORY.md at workspace root
    if [ -f "$HOME/dev/workspace/MEMORY.md" ]; then
      SOURCE_COUNT=$((SOURCE_COUNT + 1))
    fi
    echo "  Memory source files: $SOURCE_COUNT"
  else
    warn "Memory source dir not found ($MEMORY_SOURCE)"
  fi

  # Check for dirty indexes using openclaw memory status
  DIRTY_COUNT=0
  DIRTY_STORES=""
  while IFS= read -r line; do
    if echo "$line" | grep -q "^Memory Search"; then
      CURRENT_STORE=$(echo "$line" | sed 's/Memory Search (\(.*\))/\1/')
    fi
    if echo "$line" | grep -q "Dirty: yes"; then
      DIRTY_COUNT=$((DIRTY_COUNT + 1))
      DIRTY_STORES="$DIRTY_STORES $CURRENT_STORE"
    fi
  done < <(openclaw memory status 2>&1)

  if [ "$DIRTY_COUNT" -eq 0 ]; then
    ok "All memory stores clean (Dirty: no)"
  else
    fail "$DIRTY_COUNT memory store(s) dirty:$DIRTY_STORES — run 'openclaw memory index --force'"
  fi

  # Check for empty indexes (0 indexed files)
  EMPTY_COUNT=0
  EMPTY_STORES=""
  while IFS= read -r line; do
    if echo "$line" | grep -q "^Memory Search"; then
      CURRENT_STORE=$(echo "$line" | sed 's/Memory Search (\(.*\))/\1/')
    fi
    if echo "$line" | grep -q "Indexed: 0/"; then
      EMPTY_COUNT=$((EMPTY_COUNT + 1))
      EMPTY_STORES="$EMPTY_STORES $CURRENT_STORE"
    fi
  done < <(openclaw memory status 2>&1)

  if [ "$EMPTY_COUNT" -eq 0 ]; then
    ok "All memory stores have indexed files"
  else
    fail "$EMPTY_COUNT memory store(s) empty:$EMPTY_STORES — run 'openclaw memory index --force'"
  fi

  # Check MEMORY.md freshness (warn if > 7 days old)
  if [ -f "$HOME/dev/workspace/MEMORY.md" ]; then
    MEMORY_MTIME=$(stat -f %m "$HOME/dev/workspace/MEMORY.md" 2>/dev/null || echo "0")
    NOW=$(date +%s)
    AGE_DAYS=$(( (NOW - MEMORY_MTIME) / 86400 ))
    if [ "$AGE_DAYS" -le 7 ]; then
      ok "MEMORY.md updated within last 7 days ($AGE_DAYS days ago)"
    else
      warn "MEMORY.md is $AGE_DAYS days old — consider updating"
    fi
  else
    warn "MEMORY.md not found at ~/dev/workspace/MEMORY.md"
  fi
else
  warn "Memory directory not found ($MEMORY_DIR)"
fi

echo ""
echo "════════════════════════════════════════════════════"
if [ "$FAILURES" -eq 0 ]; then
  echo -e "${GREEN}All checks passed.${NC}"
else
  echo -e "${RED}$FAILURES check(s) failed.${NC} Review and update architecture docs."
fi
exit "$FAILURES"
