# Handoff state convention

Two kinds of file hold agent state. They are not the same thing.

| File | Committed? | Purpose |
|---|---|---|
| `.state/goal.md` | No — gitignored, per machine | Live progress for that machine only |
| `docs/evidence/handoffs/*.md` | Yes | Checkpoint when work stops or moves to another agent |

## `.state/goal.md` — live, never committed

Machine-local state. The goal-progress band renders it above the prompt.
It parses exactly these parts: a `Goal:` single line, `Progress:` with an
integer percent (for example `Progress: 40%`), a `Task:` line for humans
only, and tasks as `- [x] title` / `- [ ] title` under `## Tasks`.

Update it at task start, at milestones, and at finish. It does not travel
with the repository. Another machine must not rely on it.

## Handoff checkpoint — committed

Checkpoints live in `docs/evidence/handoffs/` and are committed with the
branch, as append-only history (see Rules below). When a task stops before
merge, or one agent hands work to another, write
`docs/evidence/handoffs/YYYY-MM-DD-<slug>.md` and commit it on the branch:

```markdown
# Handoff — <phase-task, e.g. PR 00-6 evidence rules> — <date>

Done: what is finished, with links to evidence (same rules as
  [PR-EVIDENCE.md](../PR-EVIDENCE.md))
Next: the lowest-numbered unfinished step, as one action
Blocked on: what is needed and from whom; write "none" if nothing
Not yet recorded: open proposals and owner decisions not yet recorded in
  planning/decisions.md — never mark one approved without a recorded owner
  yes
Files touched: paths
```

## Rules

- A checkpoint states facts and quotes evidence. It approves nothing and
  upgrades no decision status.
- Do not edit an old checkpoint. Write a newer one; the old one stays in
  history.
- A fresh agent resumes like this: read AGENTS.md and docs/roadmap.md, list
  merged PRs for the phase, read the active playbook
  `planning/src/phases/phase-NN.md` (its task table), read the newest
  checkpoint, then resume at the lowest-numbered unfinished task. It does
  not re-decide recorded decisions.
