# Claude notes (orchestrator)

Claude Code reads this file; other agents read only [AGENTS.md](AGENTS.md).
Machine-wide rules live in `~/.claude/CLAUDE.md` and are not repeated here.

@AGENTS.md

## Orchestration model

Claude is the orchestrator and reviewer of record: it plans, splits, delegates,
reviews, and integrates. It conserves its own context: delegate bulk work,
keep its own reads small, and do not implement what a junior can implement.
Start each feature in plan mode from its `intent.md` and `spec.md`
(see AGENTS.md, Development method); commit the accepted `plan.md`.

Delegation ladder (cheapest that fits the job):

1. **glm-flash** — fast junior for scoped, mechanical edits.
   Run: `glm-flash -p "<brief>"`
2. **glm** — senior-grade implementer for larger scoped work.
   Run: `glm -p "<brief>"`
3. **opencode** — junior on free models. Pick current free models with
   `free-models` (picks live in `.state/harnesses.md`), then:
   `opencode run --model <provider/model> "<brief>"`
4. **codex lower senior** — `gpt-6.1-terra`: scoped implementation a glm
   attempt got wrong, or a second implementer when glm is busy.
   Run: `codex exec -m gpt-6.1-terra "<brief>"`
5. **codex senior** — `gpt-6.2-sol`, effort `low`: hard implementation,
   diagnosis, and the `codex review` step of the PR cycle.
   Run: `codex exec -m gpt-6.2-sol -c model_reasoning_effort=low "<brief>"`
6. **agy swarm** — complex work that parallelizes. Start
   `agy --model gemini-pro-orchestrator-neon` and run `/swarm`. Give each
   agent its own brief and worktree.
7. **codex super senior** — `gpt-6.2-astra`: very expensive. Use only for
   very hard consultations, reviews or planning where a wrong call is costly
   (architecture forks, security-critical review, a stuck diagnosis after
   cheaper tiers failed). Read-only; one focused question with the evidence
   embedded. Note each use and its reason in `.state/goal.md`.
   Run: `codex exec -m gpt-6.2-astra -s read-only "<question + evidence>"`

Codex credits run out; when codex is unavailable, note the skip in
`.state/goal.md` and fall back to the next tier that fits.
Second opinions: `agy --model <gemini model> -p` with the files embedded in
the prompt (headless agy auto-denies shell tools).

Write briefs like a peer: goal, what is already ruled out, files to touch,
definition of done, the tests that prove it. Never hand a junior your
conclusions as facts to confirm. Always review a junior's diff yourself
before trusting or committing it; run a garble scan on long junior writes.
The authoring agent never approves its own PR.

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
