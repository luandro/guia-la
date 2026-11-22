#!/usr/bin/env bash
# Phase 00 documentation checks — see planning/src/phases/phase-00.md,
# "Automated verification". Run from the repository root. Exits 0 only when
# every check passes.
set -euo pipefail

# Structure check: every expected document exists.
for f in AGENTS.md SPEC.md docs/roadmap.md docs/glossary.md \
         docs/evidence/PR-EVIDENCE.md docs/security/APPROVAL-LIST.md \
         .github/PULL_REQUEST_TEMPLATE.md; do
  test -f "$f" || { echo "missing $f"; exit 1; }
done

# ADR status lint: every ADR except the template carries a status line of
# the form "- **Status:** <proposed|validated|approved|rejected> — <note>".
# The template is skipped: its status line is a placeholder. A trailing
# note after an em dash is allowed because statuses are copied verbatim
# from the decision register.
status_ok='Status:\*{0,2} ?(proposed|validated|approved|rejected)( —.*)?$'
for adr in docs/adr/ADR-*.md; do
  case "$adr" in
    docs/adr/ADR-0000-template.md) continue ;;
  esac
  lines=$(grep -cE '^(Status: |- \*\*Status:\*\*)' "$adr" || true)
  if [ "$lines" -eq 0 ]; then
    echo "FAIL $adr: no status line"
    exit 1
  fi
  bad=$(grep -E '^(Status: |- \*\*Status:\*\*)' "$adr" \
        | grep -vE "$status_ok" || true)
  if [ -n "$bad" ]; then
    echo "FAIL $adr: invalid status line:"
    echo "$bad"
    exit 1
  fi
done

# Decision consistency: every D-id in planning/decisions.md has an ADR
# whose "Decision register" line names it. Unanchored on both sides, so a
# heading-format drift in decisions.md cannot silently empty the list and
# turn the check into a vacuous pass.
ids=$(grep -oE 'D-[0-9]{2}[ab]?' planning/decisions.md | sort -u)
test -n "$ids" || { echo "no D-id parsed from planning/decisions.md"; exit 1; }
registered=$(grep -h '^- \*\*Decision register:\*\*' docs/adr/ADR-*.md \
             | grep -oE 'D-[0-9]{2}[ab]?' | sort -u)
missing=$(comm -23 <(printf '%s\n' "$ids") <(printf '%s\n' "$registered"))
test -z "$missing" || { echo "no ADR Decision register line names: $(echo $missing)"; exit 1; }

echo "check-docs: OK"
