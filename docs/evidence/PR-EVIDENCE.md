# PR evidence contract

Every PR body carries evidence, using the headings of
[.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md).
Empty sections block merge. The contract comes from the Phase 00 playbook
([planning/src/phases/phase-00.md](../../planning/src/phases/phase-00.md)).

## Wording rules (claim vs evidence)

- Never write "passed", "works", or "verified" unless a run exists and is
  quoted in this PR. No run, no such word.
- List only commands that were actually run. Quote their output verbatim.
  Do not retype output from memory.
- Redact secrets and personal data in every excerpt and every artifact —
  quoted output, screenshots, recordings, reports. Evidence must not leak
  either.
- A green check mark with no quoted command is a claim, not evidence.
- If a check did not run, write "not run" and say why. That answer is
  acceptable. A hidden gap is not.
- Any behavioral claim ("the export builds", "isolation holds") needs at
  least one artifact: screenshot, recording, report, or link.

## Canonical format — the template headings

The Markdown headings of
[.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md)
are the canonical format. Same section names, same order:

**Summary · Phase-task · Commands run · Artifacts · Risks · Docs updated ·
Next unblocked · Review tier.**

An empty section is never acceptable — write the placeholder instead:

- **Commands run** → `not run — <why>`
- **Artifacts** → `none (docs-only)` when the PR is docs-only, otherwise
  `none (no behavioral claim)`
- **Docs updated**, **Next unblocked** → `none`

Until a CI check exists, the empty-section and wording rules are enforced by
review, per the PR cycle in AGENTS.md.

Sections:

- **Summary** — one paragraph, what and why.
- **Phase-task** — the PR unit from the phase playbook, as `PR NN-M <name>`.
- **Commands run** — real runs only, each with a verbatim output excerpt.
- **Artifacts** — at least one for any behavioral claim; `kind` is one of
  `screenshot`, `recording`, `report`, `link`.
- **Risks** — what could still be wrong.
- **Docs updated** — files this PR changed or had to update, or `none`.
- **Next unblocked** — the PR unit this work unblocks, or `none`.
- **Review tier** — one of, per AGENTS.md: "Non-hard
  (docs/setup/config/scaffolding): self-review, `SKIP_BUGHUNT` merge;
  governance files need owner approval" or "Hard PR: full cycle".

The YAML block below is an optional illustration only — the headings above
are the contract:

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

## Where artifacts live

Put durable artifacts under `docs/evidence/YYYY-MM/<pr-slug>/` (for example
`docs/evidence/2026-12/pr-06-evidence-rules/`). Commit them with the PR.
Link them from the `artifacts` list. Do not describe an artifact without
linking it.
