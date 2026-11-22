#!/usr/bin/env bash
# PreToolUse hook (Read|Edit|Write|MultiEdit|NotebookEdit|Bash), PR #12 review.
# Blocks (exit 2, reason on stderr) any tool call whose file path
# (file_path/notebook_path) or shell command references a secrets file:
# .env, .env.*, .dev.vars, .dev.vars*  — except .env.example, the committed
# non-secret template (kept via !.env.example in the root .gitignore).
# Fails closed: missing jq, missing perl, or unparsable tool input
# also blocks the call (Claude Code only blocks on exit 2; anything else
# would let the call through silently).
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "blocked: jq is required by scripts/hooks/guard-secrets.sh (install jq)." >&2
  exit 2
fi
# perl (not GNU grep -P) so the hook also works on macOS.
if ! command -v perl >/dev/null 2>&1; then
  echo "blocked: perl is required by scripts/hooks/guard-secrets.sh." >&2
  exit 2
fi

input=$(cat)
if ! subjects=$(printf '%s' "$input" | jq -r '[.tool_input.file_path, .tool_input.notebook_path, .tool_input.command] | map(. // "") | .[]' 2>/dev/null); then
  echo "blocked: guard-secrets could not parse the tool input JSON." >&2
  exit 2
fi

# One secrets-file reference per line (empty when the call references none).
# Token boundaries stop plain words like "dotenv" or ".environment" matching;
# ".env.example" is extracted too and exempted in the loop below.
refs=$(printf '%s\n' "$subjects" | perl -ne 'print "$1\n" while /(?<![A-Za-z0-9_.-])((?:\.env|\.dev\.vars)(?:\.[A-Za-z0-9_~-]+)?)(?![A-Za-z0-9_-])/g')

while IFS= read -r ref; do
  [ -z "$ref" ] && continue
  case "$ref" in
    .env.example) continue ;; # committed template — allowed
    *)
      echo "blocked: '${ref}' is a secrets file reference — .env/.dev.vars files hold real secrets; .env.example is the shareable template." >&2
      exit 2
      ;;
  esac
done <<<"$refs"

exit 0
