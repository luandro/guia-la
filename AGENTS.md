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

**No PR merges until RevEngine `/review` completes at the current `HEAD` commit
with zero unresolved review threads, all configured checks passing, and either
`**Recommendation: merge.**` (eligible for `auto-merge` only when explicitly
authorized and no human-review gates apply) or explicit maintainer approval on
`needs-human-review` (when the only open item is a fit question or
maintainer-accepted deferral, or under an explicit maintainer outage/repair
override when RevEngine itself is unavailable or `review.yml` on `main` is
broken — try `workflow_dispatch` first, and record the failed/skipped run URL
and reason in the PR and `.state/goal.md`).** This applies to **every PR**,
including setup, docs, config, and scaffolding PRs.

Local pre-PR reviews depend on scope:
- **Setup, docs, config, or scaffolding PRs** (excluding workflows/CI security):
  skip local `codex` and `ohmybug` reviews, self-review the diff, and note the
  skip in `.state/goal.md` before opening the PR for RevEngine `/review`.
  OhMyBug's `pre-pr-gate.sh` (`diff-id.sh`) exempts pure docs/skills diffs
  (`**/*.md`, `**/docs/**`, `**/skills/**`) automatically so plain
  `gh pr merge <n> --squash` works after RevEngine passes. For non-doc
  setup/config/scaffolding diffs (such as YAML or JSON), `pre-pr-gate.sh` blocks
  agent merges without a hunt and reserves `SKIP_BUGHUNT=1` for the human
  operator — agents must never attach `SKIP_BUGHUNT=1`, so hand off via
  `needs-human-review` for the owner to merge as operator
  (`SKIP_BUGHUNT=1 gh pr merge <n> --squash` from the main worktree, only after
  RevEngine passes).
- **Hard PRs** (production code paths, security, workflows/CI, money, concurrency,
  data handling, or wide/risky diffs): run steps 1–2 locally before opening or
  updating the PR, then complete step 3 on GitHub. Hard PRs where OhMyBug was
  **not** triggered (clean `codex review` and `<300` changed lines touching
  auth/payments/concurrency) cannot `auto-merge` without a recorded hunt —
  either run the `ohmybug` (`lite`) hunt first or hand off via
  `needs-human-review` so the owner merges as operator (optionally with
  `SKIP_BUGHUNT=1`, only after RevEngine passes). Never use `SKIP_BUGHUNT=1` as
  an agent, and never skip OhMyBug when its trigger conditions fired:

1. **codex review** — `codex review` (config already pins `gpt-6.2-sol`,
   effort `low`). If usage or quota is unavailable, note the skip in
   `.state/goal.md` and continue.
2. **ohmybug review, mode lite** — run the `bughunter` skill's hunt with
   `submit_review` and `hunt_mode: "lite"`, and quote the price `get_balance`
   reports. It is paid; run it only after codex review and only when either:
   codex reported a critical or high finding, or the diff exceeds ~300 changed
   lines touching auth, payments, or concurrency. This cycle overrides the
   bughunter skill's own trigger: the hunt is never the first response to a
   review request and never runs before codex review. Address confirmed
   findings before merge.
3. **RevEngine GitHub Action (`/review`)** — required on **every PR** before
   merge. `.github/workflows/review.yml` runs `laude-institute/rev-engine` on
   the Claude subscription (`CLAUDE_CODE_OAUTH_TOKEN` repository secret) when a
   collaborator with write or admin access comments `/review` (or
   `/review agent`) on a PR, or triggers the workflow manually via
   `workflow_dispatch`. Defaults to model `opus` and effort `high` (override
   repo-wide with Actions variables `REV_ENGINE_MODEL` / `REV_ENGINE_EFFORT`,
   or per run via `workflow_dispatch` inputs). Fork PRs are skipped for
   security. Because `issue_comment` runs restore the Buildx cache read-only,
   and `workflow_dispatch` requires `pr-number` and runs a full Claude review
   on that PR (there is no build-only mode), warm the cache by running
   `workflow_dispatch` on a real PR after bumping `REV_ENGINE_SHA` or
   `CLAUDE_CODE_VERSION` (otherwise cold builds still succeed).

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

## Global config

Machine-wide harness rules live in `~/.claude/CLAUDE.md`; this file never
repeats them.
