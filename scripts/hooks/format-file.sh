#!/usr/bin/env bash
# PostToolUse hook (Edit|Write|MultiEdit), Phase 02 task 02-2 (D-15).
# Runs prettier --write --ignore-unknown on the touched file; prettier and
# .prettierignore decide what is formatted, so this matches the prettier gate.
# Runs from the repo root (derived from the script's own location), so the
# root .prettierignore applies whatever directory the session invoked the
# hook from (PR #12 review: prettier resolves ignore files from the cwd).
# Never fails the tool call: all failures are swallowed.
command -v jq >/dev/null 2>&1 || exit 0
input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0

[ -z "$file" ] && exit 0

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if command -v pnpm >/dev/null 2>&1 && [ -f "$file" ]; then
  (cd "$root" && pnpm exec prettier --write --ignore-unknown "$file" >/dev/null 2>&1) || true
fi

exit 0
