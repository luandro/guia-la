# Agent notes

## XERJ (code search)

This project uses XERJ for reference coding. Before writing code that touches
unfamiliar territory: `xerj def "<symbol>"` for go-to-definition, or
`xerj search "<plain words>"` for ranked, definition-first passages.
Index a repo with `xerj autoindex <folder>`. Cite file:line for anything you rely on.

## Development method (D-15)

- **Artifacts per feature**: `docs/features/<slug>/intent.md` (problem,
  outcome, users, constraints, open questions) -> `spec.md` -> `plan.md`
  (files that change, order, risks, the tests that prove it). Update
  `plan.md` in the same commit when the implementation diverges.
- **TDD**: red, green, refactor. Commit the failing test first; quote the red
  run and the green run in the PR evidence.
- **Bug fix**: commit a failing test that reproduces it; confirm it fails for
  the expected reason; fix without editing that test.
- **Guardrails first**: each phase lands its gates (pre-commit, CI, hooks)
  before or with its first feature PR. A gate must name the failure class it
  catches; fix or remove a gate that is flaky or never catches anything.
- **i18n (D-14)**: no hardcoded user-facing string. Locales `en`, `pt-BR`,
  `es`, `fr`, `nl`, `de` are all required; a missing key fails CI.
- Never skip, delete or weaken a failing test (approval list item 12).

## Verification

Run the check command before you report done, and paste its output.
Today (docs-only repo):

    ./scripts/check.sh

Healthy output ends with:

    check-docs: OK
    OK: 12 file(s) validated (11 phase page(s)), no problems.
    check: OK

`./scripts/check.sh` exits non-zero on any failure. Pre-commit runs it plus
trufflehog: `pre-commit install` once per clone. CI runs the same checks.
When application code exists, Phase 02 replaces this with the workspace
check command (lint, typecheck, unit, i18n keys, e2e smoke).

## Worktrees

Every task runs in its own worktree under `.worktrees/`:

    git worktree add .worktrees/<task-slug> -b <task-slug>

`.worktrees/` is gitignored; never commit it. One worktree per task, not per
junior — juniors work inside the task's worktree; a swarm agent gets its own
only when it would conflict. Work merges back through the PR review tiers
above. Remove the worktree after merge.

## State files

Machine-local, gitignored; rebuild rather than trust stale entries.

- `.state/harnesses.md` — which harnesses, models, and providers are currently
  available and the role each can play. Rebuild it from live CLI checks when
  something in it fails, and at least monthly: `free-models` for free-model
  candidates, `agy models`, `codex doctor`.
- `.state/goal.md` — the goal, the current task, and a progress log. Update it
  at every task start, milestone, and finish. The `goal-progress` mod renders
  this file as a band above the prompt; it parses exactly: the `Goal:` single
  line, `Progress:` with an integer percent (`Progress: 40%`), and tasks as
  `- [x] title` / `- [ ] title` under `## Tasks`. The `Task:` line is for
  humans only, not parsed.

If `.state/goal.md` has no real goal yet (says TBD), ask the user for the goal
once, record it, and proceed.

## Review tiers (all agents)

- **Hard PR**: production code paths, security, money, concurrency, data
  handling, auth, tenancy, secrets, deploy, billing, CI workflow files, or a
  wide/risky diff. Full review cycle (run by the orchestrator, see CLAUDE.md).
- **Non-hard PR**: docs, setup, config, scaffolding. Self-review; merge with
  `SKIP_BUGHUNT=1 gh pr merge <n> --merge --delete-branch` (the OhMyBug pre-PR
  hook's escape hatch). Never on a hard PR.
- **Governance files** (`AGENTS.md`, `CLAUDE.md`, `SPEC.md`, `REVIEW.md`,
  `docs/security/`, `planning/decisions.md`, `docs/adr/`, `.github/workflows/`,
  `.claude/`): a recorded owner approval before merge.
- Review passes and severity are defined in [REVIEW.md](REVIEW.md).

## Task tracking

Track this repo's tasks on the tsk board under the `guia.la` project (this
repo's path). Keep `.state/goal.md` in sync with the active task.

## Project records

- Platform spec, non-goals and vocabulary: [SPEC.md](SPEC.md).
- Actions that always need a human: [docs/security/APPROVAL-LIST.md](docs/security/APPROVAL-LIST.md). Stop and ask before any of them.
- Autonomy defaults: without asking, an agent may read anything in scope, edit files in its task worktree, run local builds and tests, open PRs, and merge non-hard, non-governance PRs per the review tiers above. Everything on the approval list needs a recorded owner yes: an owner comment or approval on the GitHub PR or issue, or an entry in `planning/decisions.md`.
- Decisions: [planning/decisions.md](planning/decisions.md) is the register; [docs/adr/](docs/adr/) mirrors it. Copy statuses verbatim; never upgrade one.
- Evidence: every PR fills [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) per [docs/evidence/PR-EVIDENCE.md](docs/evidence/PR-EVIDENCE.md). Never write "passed", "works" or "verified" unless a run exists; quote its output, with secrets and personal data redacted.
- Handoffs: [docs/evidence/HANDOFF-STATE.md](docs/evidence/HANDOFF-STATE.md). Terms: [docs/glossary.md](docs/glossary.md).
- Phases: [docs/roadmap.md](docs/roadmap.md); tasks live in `planning/src/phases/phase-NN.md`. Code is MIT ([LICENSE](LICENSE)).

## Global config

Machine-wide harness rules live in `~/.claude/CLAUDE.md`; this file never
repeats them.
