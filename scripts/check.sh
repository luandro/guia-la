#!/usr/bin/env bash
# One check command for this repo. Exits non-zero on any failure.
# Agents run it before reporting done; pre-commit and CI run it too.
set -euo pipefail
cd "$(dirname "$0")/.."
./scripts/check-docs.sh
bash ./scripts/check-legacy.sh
python3 -I planning/tools/build.py >/dev/null
python3 -I planning/tools/check.py
bash ./scripts/hooks/test-hooks.sh

# Workspace checks (Phase 02): only when dependencies are installed, so the
# docs-only checks above still work on a fresh clone before `pnpm install`.
if [ "${CHECK_DOCS_ONLY:-}" = "1" ]; then
  echo "note: CHECK_DOCS_ONLY=1 — workspace checks left to the per-file hooks and pre-push."
elif [ -d node_modules ] && command -v pnpm >/dev/null 2>&1; then
  pnpm check
else
  echo "note: node_modules missing (or no pnpm) — workspace checks skipped."
  echo "note: run 'pnpm install && pnpm check' to run them."
fi

echo "check: OK"
