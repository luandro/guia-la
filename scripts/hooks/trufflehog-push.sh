#!/usr/bin/env bash
# pre-push hook: scan the commits being pushed for secrets (D-15).
# pre-commit sets PRE_COMMIT_FROM_REF (remote sha) and PRE_COMMIT_TO_REF
# (local sha). The scan target comes from the pushed ref — PRE_COMMIT_TO_REF,
# else PRE_COMMIT_LOCAL_BRANCH — never from HEAD: on an initial push
# pre-commit passes no target ref, and HEAD is the checked-out branch, which
# may differ from the pushed one (PR #12 review round 3). With no usable
# target at all, fail the push instead of scanning the wrong history.
# A new branch has no remote sha, so scan from origin/main. With no usable
# base at all (no remote sha and no origin/main), scan the whole history:
# --since-commit scans only commits after its argument, so the root commit's
# own content would never be scanned (PR #12 review).
set -euo pipefail
zero=0000000000000000000000000000000000000000
from="${PRE_COMMIT_FROM_REF:-}"
to="${PRE_COMMIT_TO_REF:-${PRE_COMMIT_LOCAL_BRANCH:-}}"
if [ "$to" = "$zero" ]; then
  exit 0 # branch deletion — nothing new is being pushed to scan
fi
if [ -z "$to" ] || ! git cat-file -e "$to^{commit}" 2>/dev/null; then
  echo "pre-push: no usable pushed ref (PRE_COMMIT_TO_REF/PRE_COMMIT_LOCAL_BRANCH) — refusing to fall back to HEAD." >&2
  exit 1
fi
if [ -z "$from" ] || [ "$from" = "$zero" ] || ! git cat-file -e "$from^{commit}" 2>/dev/null; then
  if from=$(git merge-base origin/main "$to" 2>/dev/null) && [ -n "$from" ]; then
    :
  else
    exec trufflehog git file://. --branch "$to" \
      --results=verified,unknown,unverified --fail --no-update
  fi
fi
if [ "$(git rev-parse "$from")" = "$(git rev-parse "$to")" ]; then
  exit 0
fi
exec trufflehog git file://. --since-commit "$from" --branch "$to" \
  --results=verified,unknown,unverified --fail --no-update
