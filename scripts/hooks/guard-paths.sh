#!/usr/bin/env bash
# PreToolUse hook (Edit|Write|MultiEdit), Phase 02 task 02-2 (D-15).
# Reads the tool input JSON on stdin and blocks (exit 2, reason on stderr):
#   - edits under generated paths: apps/app/src/generated/, dist/,
#     planning/phases/, planning/index.html
#   - edits to any test file listed in .state/bugfix-tests (one path per
#     line; absent file = no lock) — the "never edit the failing test
#     during a bug fix" rule.
# Anything else exits 0.
set -euo pipefail

# Fail closed: Claude Code blocks only on exit 2, so any other error would let
# the edit through silently.
if ! command -v jq >/dev/null 2>&1; then
  echo "blocked: jq is required by scripts/hooks/guard-paths.sh (install jq)." >&2
  exit 2
fi
input=$(cat)
if ! file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null); then
  echo "blocked: guard-paths could not parse the tool input JSON." >&2
  exit 2
fi

if [ -z "$file" ]; then
  exit 0
fi

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
rel="${file#"$root"/}"

case "$rel" in
  apps/app/src/generated | apps/app/src/generated/*)
    echo "blocked: ${rel} is generated output (Phase 06 composer) — edit the source instead." >&2
    exit 2
    ;;
  dist | dist/* | */dist | */dist/*)
    echo "blocked: ${rel} is build output (dist/) — edit the source instead." >&2
    exit 2
    ;;
  planning/phases/* | planning/index.html)
    echo "blocked: ${rel} is a generated planning view — edit planning/src/ and rebuild via scripts/check.sh." >&2
    exit 2
    ;;
esac

if [ -f "$root/.state/bugfix-tests" ]; then
  while IFS= read -r locked; do
    [ -z "$locked" ] && continue
    locked_rel="${locked#./}"
    if [ "$rel" = "$locked_rel" ] || [ "$file" = "$locked" ]; then
      echo "blocked: ${rel} is locked as a failing bug-fix test (.state/bugfix-tests) — fix the code, not the test (D-15)." >&2
      exit 2
    fi
  done <"$root/.state/bugfix-tests"
fi

exit 0
