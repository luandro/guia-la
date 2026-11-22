#!/usr/bin/env bash
# One check command for this docs-only repo. Exits non-zero on any failure.
# Agents run it before reporting done; pre-commit and CI run it too.
set -euo pipefail
cd "$(dirname "$0")/.."
./scripts/check-docs.sh
python3 -I planning/tools/build.py >/dev/null
python3 -I planning/tools/check.py
echo "check: OK"
