#!/usr/bin/env bash
# PreToolUse hook (Edit|Write|MultiEdit), Phase 02 task 02-2 (D-15).
# Reads the tool input JSON on stdin and blocks (exit 2, reason on stderr):
#   - edits under generated paths: apps/app/src/generated/, dist/,
#     planning/phases/, planning/index.html
#   - edits to any test file listed in the bug-fix lock (one path per line;
#     absent file = no lock) — the "never edit the failing test during a bug
#     fix" rule. Lock path: BUGFIX_TESTS_FILE, default .state/bugfix-tests
#     (tests point the env var at a temp file so they never touch live state).
# Paths are normalized (realpath -m) and a leading .worktrees/<slug>/ is
# stripped, so the rules also hold for worktree paths (AGENTS.md runs every
# task in .worktrees/<slug>) and for ..-bearing paths like
# apps/../planning/index.html (PR #12 review).
# Anything else exits 0.
set -euo pipefail

# Fail closed: Claude Code blocks only on exit 2, so any other error would let
# the edit through silently.
for tool in jq realpath; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "blocked: $tool is required by scripts/hooks/guard-paths.sh (install $tool)." >&2
    exit 2
  fi
done
input=$(cat)
if ! file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null); then
  echo "blocked: guard-paths could not parse the tool input JSON." >&2
  exit 2
fi

if [ -z "$file" ]; then
  exit 0
fi

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

repo_rel() { # repo_rel <path>: normalized (realpath -m), repo-relative, worktree prefix stripped
  local p rel rest
  p=$(realpath -m -- "$1")
  rel="${p#"$root"/}"
  case "$rel" in
    .worktrees/*)
      rest="${rel#.worktrees/}"
      case "$rest" in
        */*) rel="${rest#*/}" ;; # drop the <slug> component
      esac
      ;;
  esac
  printf '%s\n' "$rel"
}

file_norm=$(realpath -m -- "$file")
rel=$(repo_rel "$file")

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

lock_file="${BUGFIX_TESTS_FILE:-$root/.state/bugfix-tests}"
if [ -f "$lock_file" ]; then
  while IFS= read -r locked; do
    [ -z "$locked" ] && continue
    locked="${locked#./}"
    case "$locked" in
      /*) locked_abs=$(realpath -m -- "$locked") ;;
      *) locked_abs=$(realpath -m -- "$root/$locked") ;;
    esac
    locked_rel=$(repo_rel "$locked_abs")
    if [ "$file_norm" = "$locked_abs" ] || [ "$rel" = "$locked_rel" ]; then
      echo "blocked: ${rel} is locked as a failing bug-fix test (${lock_file}) — fix the code, not the test (D-15)." >&2
      exit 2
    fi
  done <"$lock_file"
fi

exit 0
