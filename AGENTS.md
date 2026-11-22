# Agent notes

## XERJ (code search)

This project uses XERJ for reference coding. Before writing code that touches
unfamiliar territory: `xerj def "<symbol>"` for go-to-definition, or
`xerj search "<plain words>"` for ranked, definition-first passages.
Index a repo with `xerj autoindex <folder>`. Cite file:line for anything you rely on.

## Orchestration model

Claude is the orchestrator and reviewer of record: it plans, splits, delegates,
reviews, and integrates. It conserves its own context — delegate bulk work,
keep its own reads small, and do not implement what a junior can implement.

Delegation ladder (cheapest that fits the job):

1. **glm-flash** — fast junior for scoped, mechanical edits.
   Run: `glm-flash -p "<brief>"`
2. **glm** — senior-grade implementer for larger scoped work (Claude still
   reviews its diff).
   Run: `glm -p "<brief>"`
3. **opencode** — junior on free models. Pick the current free models with
   `free-models` (current picks live in `.state/harnesses.md`), then:
   `opencode run --model <provider/model> "<brief>"`
4. **agy swarm** — complex work that parallelizes. Start
   `agy --model gemini-pro-orchestrator-neon` and run `/swarm` to split the
   task across named agents coordinating on a shared message board. Give each
   agent its own brief and worktree.

Write briefs like a peer: goal, what is already ruled out, files to touch,
definition of done. Never hand a junior your conclusions as facts to confirm.
Always review a junior's diff yourself before trusting or committing it.

## Worktrees

Every task runs in its own worktree under `.worktrees/`:

    git worktree add .worktrees/<task-slug> -b <task-slug>

`.worktrees/` is gitignored; never commit it. One worktree per task, not per
junior — juniors work inside the task's worktree; a swarm agent gets its own
only when it would conflict. Work merges back through the PR review cycle
below. Remove the worktree after merge.

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

## PR review cycle

The full cycle below is for hard PRs only: production code paths, security,
money, concurrency, data handling, or wide/risky diffs. Do not spend codex or
ohmybug reviews on setup, docs, config, or scaffolding PRs — self-review
those, note the skip in `.state/goal.md`, and merge. The OhMyBug pre-PR gate
hook refuses `gh pr merge` until a hunt has run; for these PRs use its
documented escape hatch: `SKIP_BUGHUNT=1 gh pr merge <n> --merge --delete-branch`.
Never use it on a hard PR. Two limits apply:

- A setup or config PR that touches auth, tenancy, secrets, deploy, billing
  or CI workflow files is a hard PR.
- A PR that changes governance files (`AGENTS.md`, `SPEC.md`,
  `docs/security/`, `planning/decisions.md`, `docs/adr/`,
  `.github/workflows/`) needs a recorded owner approval before merge.

If a hard PR does not trigger the hunt (step 2), stop: the owner merges it or
authorizes `SKIP_BUGHUNT=1` for it on the PR. Every hard PR goes
through, in order:

1. **codex review** — `codex review` (config already pins `gpt-6.2-sol`,
   effort `low`). If usage or quota is unavailable, note the skip in
   `.state/goal.md` and continue.
2. **ohmybug review, mode lite** — run the `bughunter` skill's hunt with
   `submit_review` and `hunt_mode: "lite"`, and quote the price `get_balance`
   reports. It is paid; the owner pre-authorizes lite hunts on the triggers
   below (standing exception in `docs/security/APPROVAL-LIST.md`). Run it only after codex review and only when either:
   codex reported a critical or high finding, or the diff exceeds ~300 changed
   lines touching auth, payments, or concurrency. This cycle overrides the
   bughunter skill's own trigger: the hunt is never the first response to a
   review request and never runs before codex review. Address confirmed
   findings before merge.
3. **RevEngine GitHub Action (`/review`)** — `.github/workflows/review.yml`
   runs `laude-institute/rev-engine` on the Claude subscription
   (`CLAUDE_CODE_OAUTH_TOKEN` repository secret) when a collaborator with write
   access comments `/review` (or `/review agent`) on a PR, or triggers the
   workflow manually via `workflow_dispatch`.

Use the `.claude/skills/pr-cycle/SKILL.md` (`pr-cycle` skill) to drive the PR
review loop: triage findings, push fixes, reply using RevEngine's decision
prefixes (`Fixed in <sha>:`, `Partly fixed in <sha>:`, `Won't fix:`,
`Deferred:`, `Wrong:`) and resolve handled threads, re-run `/review` until
nothing is pending at the current head commit (clean recommendation, zero
unresolved threads, green checks), and conclude with either `auto-merge` (only
when explicitly authorized and no human-review gates apply) or
`needs-human-review` (default, and mandatory on RevEngine fit concerns or
human-approval boundaries).

## Task tracking

Track this repo's tasks on the tsk board under the `guia.la` project (this
repo's path). Keep `.state/goal.md` in sync with the active task.

## Project records

- Platform spec, non-goals and vocabulary: [SPEC.md](SPEC.md).
- Actions that always need a human: [docs/security/APPROVAL-LIST.md](docs/security/APPROVAL-LIST.md). Stop and ask before any of them.
- Autonomy defaults: without asking, an agent may read anything in scope, edit files in its task worktree, run local builds and tests, open PRs, and merge non-hard, non-governance PRs per the review cycle above. Everything on the approval list needs a recorded owner yes: an owner comment or approval on the GitHub PR or issue, or an entry in `planning/decisions.md`.
- Decisions: [planning/decisions.md](planning/decisions.md) is the register; [docs/adr/](docs/adr/) mirrors it. Copy statuses verbatim; never upgrade one.
- Evidence: every PR fills [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) per [docs/evidence/PR-EVIDENCE.md](docs/evidence/PR-EVIDENCE.md). Never write "passed", "works" or "verified" unless a run exists; quote its output, with secrets and personal data redacted.
- Handoffs: [docs/evidence/HANDOFF-STATE.md](docs/evidence/HANDOFF-STATE.md). Terms: [docs/glossary.md](docs/glossary.md).
- Phases: [docs/roadmap.md](docs/roadmap.md); tasks live in `planning/src/phases/phase-NN.md`. Code is MIT ([LICENSE](LICENSE)).

## Global config

Machine-wide harness rules live in `~/.claude/CLAUDE.md`; this file never
repeats them.
