<!--
Evidence rules: docs/evidence/PR-EVIDENCE.md.
Never write "passed" unless a run exists in this PR, quoted verbatim.
-->

## Summary

One paragraph: what and why.

## Phase-task

<!-- The PR unit from the phase playbook, e.g. "PR 00-6 evidence rules". -->

## Commands run

<!-- Only commands actually run. Quote verbatim excerpts; do not retype
     from memory. If none: write "not run" and why. -->

- `<command>` — "<verbatim output excerpt>"

## Artifacts

<!-- At least one for any behavioral claim.
     kind: screenshot | recording | report | link
     Commit under docs/evidence/YYYY-MM/<pr-slug>/ and link here. -->

-

## Risks

What could still be wrong.

## Docs updated

<!-- Files this PR changed or had to update. Write "none" if none. -->

-

## Next unblocked

<!-- The PR unit this work unblocks, or "none". -->

## Review tier

<!-- Pick one per AGENTS.md. -->

- [ ] Docs-only — self-review; note the skip in `.state/goal.md`; merge via
  the AGENTS.md escape hatch
- [ ] Hard PR — full cycle per AGENTS.md: codex review, then bughunter lite
  if triggered, then `/review`
