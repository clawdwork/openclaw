#!/usr/bin/env bash
# social-aggregate smoke test — runs against bundled fixtures and asserts
# the contract that Phase C exit criteria require.
#
# Usage: bash scripts/smoke-test.sh
# Exits non-zero on any contract violation.

set -euo pipefail

cd "$(dirname "$0")/.."
SKILL_DIR="$(pwd)"

echo "▸ Running aggregate.py against fixtures…"
python3 scripts/aggregate.py --fixture > /tmp/social-aggregate-stderr.txt 2>&1 || {
  echo "✗ aggregator exited non-zero"
  cat /tmp/social-aggregate-stderr.txt
  exit 1
}

REPORT_JSON=$(ls fixtures/aggregate-report-*.json | head -1)
REPORT_MD=$(ls fixtures/aggregate-report-*.md | head -1)
[[ -f "$REPORT_JSON" ]] || { echo "✗ no JSON report"; exit 1; }
[[ -f "$REPORT_MD" ]] || { echo "✗ no MD report"; exit 1; }

# Contract assertions
python3 - <<PY
import json, sys
p = json.load(open("$REPORT_JSON"))
assert p["version"] == 1, "version mismatch"
assert p["stats"]["posts_processed"] >= 10, f"expected ≥10 posts, got {p['stats']['posts_processed']}"
assert len(p["scored_topics"]) >= 10, "scored_topics too thin"
assert any(c["status"] == "hard_fail" for c in p["cannibalization_clusters"]), "expected at least one cannib hard_fail (Cabc004 vs Cabc005)"
assert p["hook_archetype_distribution"], "no archetype distribution"
assert p["e_mix"], "no 4E distribution"
assert p["channel_baselines"], "no baselines"
assert p["runtime_sec"] < 5.0, f"runtime over budget: {p['runtime_sec']}s"
sd = p["state_delta"]
for k in ("report_path_md", "report_path_json", "scored_topics_count", "cannibalization_hard_fails", "trend_signals_exploding", "ran_at", "runtime_sec"):
    assert k in sd, f"state_delta missing {k}"
print(f"✓ all assertions passed · {p['stats']['posts_processed']} posts · {len(p['scored_topics'])} scored · {len(p['cannibalization_clusters'])} cannib · {p['runtime_sec']}s")
PY

echo "✓ smoke test passed"
