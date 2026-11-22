#!/usr/bin/env bash
# pre-push hook: scan the commits being pushed for secrets (D-15).
# pre-commit sets PRE_COMMIT_FROM_REF (remote sha) and PRE_COMMIT_TO_REF
# (local sha). A new branch has no remote sha, so scan from origin/main.
set -euo pipefail
from="${PRE_COMMIT_FROM_REF:-}"
to="${PRE_COMMIT_TO_REF:-HEAD}"
if [ -z "$from" ] || [ "$from" = "0000000000000000000000000000000000000000" ] || ! git cat-file -e "$from^{commit}" 2>/dev/null; then
  from=$(git merge-base origin/main "$to" 2>/dev/null || git rev-list --max-parents=0 "$to" | tail -1)
fi
if [ "$(git rev-parse "$from")" = "$(git rev-parse "$to")" ]; then
  exit 0
fi
exec trufflehog git file://. --since-commit "$from" --branch "$to" \
  --results=verified,unknown,unverified --fail --no-update
