# PR evidence contract

Every PR body carries evidence, using the template below. Empty sections
block merge. The contract comes from the Phase 00 playbook
([planning/src/phases/phase-00.md](../../planning/src/phases/phase-00.md)).

## Wording rules (claim vs evidence)

- Never write "passed", "works", or "verified" unless a run exists and is
  quoted in this PR. No run, no such word.
- List only commands that were actually run. Quote their output verbatim.
  Do not retype output from memory.
- A green check mark with no quoted command is a claim, not evidence.
- If a check did not run, write "not run" and say why. That answer is
  acceptable. A hidden gap is not.
- Any behavioral claim ("the export builds", "isolation holds") needs at
  least one artifact: screenshot, recording, report, or link.

## Template

Copy this into the PR body and fill it in. Keep the field names.

```yaml
summary: one paragraph, what and why
phase-task: "PR 00-3 AGENTS.md"
commands:                        # only commands actually run, with real excerpts
  - run: <command>
    excerpt: "<verbatim output lines>"
artifacts:                       # at least one for any behavioral claim
  - kind: screenshot|recording|report|link
    path: docs/evidence/2026-12/...
risks: what could still be wrong
docs-updated: [AGENTS.md]
next-unblocked: "PR 01-2 entity matrix"
```

Field notes:

- `phase-task` — the PR unit from the phase playbook, as `PR NN-M <name>`.
- `commands` — real runs only. The excerpt is verbatim output, in quotes.
- `artifacts` — `kind` is one of `screenshot`, `recording`, `report`, `link`.
- `docs-updated` — files this PR changed or had to update.
- `next-unblocked` — the PR unit this work unblocks, or `none`.

## Where artifacts live

Put durable artifacts under `docs/evidence/YYYY-MM/<pr-slug>/` (for example
`docs/evidence/2026-12/pr-06-evidence-rules/`). Commit them with the PR.
Link them from the `artifacts` list. Do not describe an artifact without
linking it.
