#!/usr/bin/env bash
# PostToolUse hook (Edit|Write), Phase 02 task 02-2 (D-15).
# Runs prettier --write on the touched file when it is ts/tsx/js/json.
# Never fails the tool call: all failures are swallowed.
input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')

[ -z "$file" ] && exit 0

case "$file" in
  *.ts | *.tsx | *.js | *.json)
    if command -v pnpm >/dev/null 2>&1 && [ -f "$file" ]; then
      pnpm exec prettier --write "$file" >/dev/null 2>&1 || true
    fi
    ;;
esac

exit 0
