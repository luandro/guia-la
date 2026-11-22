---
name: pr-cycle
description: Drive a PR through RevEngine review rounds, fix and resolve findings using RevEngine's decision protocol, loop until nothing is pending at head, and conclude with auto-merge (when authorized) or needs-human-review.
---

# PR Review Cycle

Drive **every** pull request through pre-PR checks and GitHub RevEngine `/review` rounds until nothing is pending at the current `HEAD` commit, then finish cleanly with either `auto-merge` or `needs-human-review`.

**Rule:** No PR merges until RevEngine `/review` completes at the current `headRefOid` with zero unresolved review threads, all configured checks passing, and either `**Recommendation: merge.**` (eligible for `auto-merge` when authorized and no human-review gates apply) or explicit maintainer approval on `needs-human-review` (when the only open item is a fit question or maintainer-accepted deferral). **Outage / workflow-repair override:** if RevEngine itself is broken or unavailable (expired `CLAUDE_CODE_OAUTH_TOKEN`, quota exhaustion, GitHub outage, or a PR repairing `review.yml` on `main`), use `workflow_dispatch` if possible, and otherwise allow an explicit maintainer override on `needs-human-review` with the failed/skipped run URL and reason recorded on the PR and in `.state/goal.md`. Setup, docs, config, and scaffolding PRs skip only local `codex` / `ohmybug` reviews (noting the skip in `.state/goal.md`), never RevEngine unless that outage override applies.

## Inputs & Mode Selection

- **PR target**: existing PR number (`gh pr view`) or create a PR from the current task worktree branch (`.worktrees/<slug>`).
- **Merge policy**:
  - `needs-human-review` (**default**): label and summarize for a human merge decision once reviews converge (or immediately when a human gate triggers).
  - `auto-merge`: merge only when **explicitly authorized** for the PR/task, all convergence checks pass at the exact `headRefOid`, and **zero** hard human-review gates fire.
- **Review mode**:
  - `/review` (**default**, `human` mode): inline comments on high/medium findings (up to 10), collapsed details, project-fit assessment, and merge advice.
  - `/review agent` (`agent` mode): single summary comment listing up to 80 findings across severities with no fit check (note: `RB_CONFIG_ENGINE=claude-code` disables RevEngine's swarm, so agent mode produces the single-comment agent format from Claude). Always run a final `/review` (`human` mode) round before declaring convergence or merging.

## Hard Human-Review Gates

These rules **override `auto-merge`** and unconditionally require `needs-human-review`:

1. RevEngine summary opens with `**Recommendation: needs a maintainer's decision.**` (fit verdict is `fits_with_concerns`, `does_not_fit`, or `unclear`). Never write a `**Fit: yes.**` or `**Fit: no.**` answer on behalf of a human maintainer.
2. The PR touches auth, payments, credentials/secrets/permissions, privacy/security boundaries, workflows/CI security, destructive data/production changes, infra spending, store publication, or unresolved architecture decisions.
3. Any non-trivial finding is marked `Won't fix:` or `Deferred:` with a product or architecture trade-off.
4. The loop reaches **5 rounds** without converging, RevEngine fails or skips, or any human reviewer left `CHANGES_REQUESTED` or unresolved comments.
5. The PR modifies non-doc files (anything outside `**/*.md`, `**/docs/**`, `**/skills/**`) and has no local OhMyBug hunt recorded for the current diff (including non-doc setup/config/scaffolding PRs, or hard PRs where `codex review` ran clean and OhMyBug's trigger conditions did not fire). The OhMyBug pre-PR hook (`pre-pr-gate.sh`) reserves `SKIP_BUGHUNT=1` for the human operator — agents must never attach `SKIP_BUGHUNT=1` to `gh pr merge`; either run `ohmybug` (`lite`) when authorized or escalate to `needs-human-review` so the owner merges.

## Loop Procedure (Max 5 Rounds)

### 0. Pre-PR (once)

1. Confirm work lives in `.worktrees/<task-slug>` (not directly on `main`) and run local lint/typecheck/tests.
2. Follow `AGENTS.md`:
   - **Hard PR** (production code paths, security, workflows/CI, money, concurrency, data handling, or wide/risky diffs): run local `codex review`, then conditional `ohmybug` (`lite`) if triggered, and fix confirmed findings before opening the PR. If `ohmybug` was not triggered (clean `codex` and `<300` changed lines touching auth/payments/concurrency), run the `lite` hunt before requesting `auto-merge` or escalate to `needs-human-review` (Gate #5).
   - **Setup/docs/config/scaffolding PR** (excluding workflows/CI): skip local `codex` and `ohmybug`, self-review the diff, and record the skip in `.state/goal.md`. Pure docs/skills diffs bypass `pre-pr-gate.sh` automatically; non-doc config/scaffolding PRs escalate via Option B after RevEngine passes.
3. Push the branch and open the PR (`gh pr create`) if one does not exist yet.

### 1. Trigger & Wait (each round)

1. Record the exact commit and UTC timestamp before commenting, then capture the created comment ID from the returned comment URL:
   ```bash
   HEAD_SHA=$(gh pr view "$PR" --json headRefOid --jq .headRefOid)
   TRIGGERED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
   COMMENT_URL=$(gh pr comment "$PR" --body "/review")   # or "/review agent" for intermediate triage
   COMMENT_ID=${COMMENT_URL##*#issuecomment-}
   [[ "$COMMENT_ID" =~ ^[0-9]+$ ]] || { echo "Unexpected comment URL: $COMMENT_URL"; exit 1; }
   ```
2. Wait briefly (up to ~30s) only for GitHub to enqueue the `Review` workflow run for this PR, then watch the run to completion with `gh run watch` (never `sleep`-poll for workflow completion). Note: `issue_comment` workflows run from the default branch (`main`), so do **not** filter `gh run list` by the PR branch:
   ```bash
   RUN_ID=""
   for _ in $(seq 1 10); do
     RUN_ID=$(gh run list --workflow review.yml --limit 20 \
       --json databaseId,displayTitle,createdAt,event,conclusion \
       --jq "[.[] | select(.event == \"issue_comment\" and .displayTitle == \"Review PR #$PR (comment-$COMMENT_ID)\" and .createdAt >= \"$TRIGGERED_AT\" and .conclusion != \"skipped\" and .conclusion != \"cancelled\")] | sort_by(.createdAt) | last | .databaseId // \"\"")
     [ -n "$RUN_ID" ] && break
     sleep 3
   done
   [ -n "$RUN_ID" ] || { echo "No review.yml run found for PR #$PR after $TRIGGERED_AT"; exit 1; }
   gh run watch "$RUN_ID" --exit-status
   ```
   *(If `review.yml` on `main` does not yet set `Review PR #<n> (comment-<id>)` in `displayTitle`, omit the `displayTitle` filter for that bootstrap run and verify in Step 2 that the posted review cites `HEAD_SHA`. If `gh run watch` exits because a newer `/review` superseded the watched run, re-run the lookup once before escalating.)*
3. If `gh run watch` fails (e.g., missing/expired `CLAUDE_CODE_OAUTH_TOKEN`, quota exhaustion, workflow error) or the job skips without posting a RevEngine review for `HEAD_SHA` with `submitted_at >= $TRIGGERED_AT`, **stop the loop immediately**, apply the **`needs-human-review`** disposition (label + PR handoff comment citing the run URL and failure/skip reason), and report the failure URL and reason to the user.

### 2. Inspect All Pending State

Fetch the latest RevEngine review (`<!-- rev-engine-prime -->`), paginated PR review state, unresolved threads, CI checks, and PR mergeability (`gh api --paginate --slurp` cannot be combined with `--jq`, so pipe to `jq` directly):

```bash
NWO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
OWNER=${NWO%%/*}
REPO=${NWO##*/}

# 1. Latest RevEngine review across all pages
gh api "repos/{owner}/{repo}/pulls/$PR/reviews?per_page=100" --paginate --slurp \
  | jq 'add | map(select(.user.login == "github-actions[bot]" and (.body | contains("<!-- rev-engine-prime -->")))) | sort_by(.submitted_at) | last | {id, submitted_at, commit_id, body}'

# 2a. PR metadata + paginated latestReviews
gh api graphql --paginate --slurp -f owner="$OWNER" -f repo="$REPO" -F pr="$PR" -f query='
  query($owner: String!, $repo: String!, $pr: Int!, $endCursor: String) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        headRefOid
        isDraft
        mergeable
        mergeStateStatus
        latestReviews(first: 100, after: $endCursor) {
          pageInfo { hasNextPage endCursor }
          nodes { author { login } state submittedAt }
        }
      }
    }
  }' | jq '{
    headRefOid: .[0].data.repository.pullRequest.headRefOid,
    isDraft: .[0].data.repository.pullRequest.isDraft,
    mergeable: .[0].data.repository.pullRequest.mergeable,
    mergeStateStatus: .[0].data.repository.pullRequest.mergeStateStatus,
    latestReviews: [.[].data.repository.pullRequest.latestReviews.nodes[]]
  }'

# 2b. Paginated reviewThreads (also verify no thread has truncated comments)
gh api graphql --paginate --slurp -f owner="$OWNER" -f repo="$REPO" -F pr="$PR" -f query='
  query($owner: String!, $repo: String!, $pr: Int!, $endCursor: String) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        reviewThreads(first: 100, after: $endCursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            isResolved
            isOutdated
            path
            line
            comments(first: 100) {
              pageInfo { hasNextPage endCursor }
              nodes {
                databaseId
                author { login }
                body
                createdAt
                url
              }
            }
          }
        }
      }
    }
  }' | jq '[.[].data.repository.pullRequest.reviewThreads.nodes[]]'

# 3. CI checks (exits 0 even when zero checks are configured)
gh pr view "$PR" --json statusCheckRollup --jq '.statusCheckRollup'
```

Verify that:
- The latest RevEngine review exists with `submitted_at >= $TRIGGERED_AT` and cites `Reviewed commit ${HEAD_SHA:0:7}` (matching `headRefOid`).
- No thread in query `2b` has `comments.pageInfo.hasNextPage == true` (if any does, fetch its remaining comments via GraphQL `node(id: $threadId)` before continuing).

Extract RevEngine's opening advice line:
- `**Recommendation: merge.**` — clean (nothing medium/high; fit passed or off)
- `**Recommendation: merge and fast-follow.**` — medium finding(s) remain
- `**Recommendation: fix, then merge.**` — high finding(s) remain
- `**Recommendation: needs a maintainer's decision.**` — fit verdict is not `fits` (or has an explicit maintainer question)

### 3. Check Convergence ("Nothing Pending")

The PR has **converged** if and only if, for the **exact current `headRefOid`**:

1. Latest RevEngine review reviewed the current `headRefOid` in `human` mode and opens with `**Recommendation: merge.**` (if it opened with `**Recommendation: merge and fast-follow.**` and remaining medium items were resolved as `Wrong:`/`Won't fix:`, re-run `/review` so RevEngine confirms `**Recommendation: merge.**` — never auto-merge on `merge and fast-follow.`, and only merge on `needs a maintainer's decision.` via explicit human approval in Option B).
2. Zero unresolved review threads (RevEngine or human) and no outstanding `CHANGES_REQUESTED` review.
3. CI checks (`statusCheckRollup`):
   - **Zero checks configured (`[]`)**: satisfies CI convergence (do not treat empty checks as a failure, and do not pass `--auto` when merging).
   - **One or more checks configured**: every `CheckRun` has `status == "COMPLETED"` and `conclusion` in `["SUCCESS", "NEUTRAL", "SKIPPED"]`, and every `StatusContext` has `state == "SUCCESS"` (zero pending or failing checks).
4. PR is non-draft and mergeable (`mergeable == "MERGEABLE"`).

- **If converged**: go to **Final Disposition**.
- **If `**Recommendation: needs a maintainer's decision.**`**: fix any standalone high/medium code defects first (push + reply + resolve), then escalate directly to **`needs-human-review`** with the fit question highlighted. Never answer a fit question on the maintainer's behalf.

### 4. Triage, Fix & Reply (RevEngine Decision Protocol)

For every open finding:

1. **Verify against actual code** before editing — confirm file, line numbers, callers, and whether the defect is real.
2. **Fix valid findings** (always fix `high` and `medium`; fix `low` items that are clear, cheap improvements). Re-run local checks/tests.
3. **Commit and push first** so the commit SHA exists on GitHub before replying:
   ```bash
   git push
   SHORT_SHA=$(git rev-parse --short HEAD)
   ```
4. **Reply on every inline RevEngine thread** using RevEngine's exact decision prefixes parsed by `action/decisions.ts` (a reply starting with anything else is ignored by `collect.ts`), then resolve handled threads:
   - `Fixed in <short-sha>: <concise summary of fix>` → resolve thread
   - `Partly fixed in <short-sha>: <what changed and what remains>` → leave open until finished
   - `Won't fix: <concrete rationale>` → resolve thread (check hard human-review gates)
   - `Deferred: <concrete rationale and follow-up>` → resolve thread (check hard human-review gates)
   - `Wrong: <file:line proof why the finding does not hold>` → resolve thread

   Reply & resolve commands:
   ```bash
   # Reply to the thread's first comment (databaseId)
   gh api "repos/{owner}/{repo}/pulls/$PR/comments/$FIRST_COMMENT_ID/replies" \
     -f body="Fixed in $SHORT_SHA: <concise reason>"

   # Resolve the review thread (thread id from GraphQL)
   gh api graphql -f query='
     mutation($threadId: ID!) {
       resolveReviewThread(input: {threadId: $threadId}) {
         thread { id isResolved }
       }
     }' -f threadId="$THREAD_ID"
   ```

5. **For `/review agent` findings or unplaced summary findings** (no inline thread to reply to), post one PR issue comment formatted for `action/decisions.ts` so `collect.ts` passes the decisions into `prior.json` on the next round:
   ```markdown
   ## Review evaluation
   Review: https://github.com/<owner>/<repo>/pull/<pr>#pullrequestreview-<review_id>

   - **valid**. <Title> `<file>:<line>`. Fixed in <short-sha>: <what changed>.
   - **invalid**. <Title> `<file>:<line>`. Wrong: <why it does not apply>.
   ```
   (Do **not** include a `### Fit and recommendation` / `**Fit: yes.**` section — reserve fit verdicts for human maintainers.)
6. If any code changed or findings needed verification, start the next round at **Step 1** (comment `/review`, max 5 rounds).

## Final Disposition

### Option A: `auto-merge`

Only allowed when **explicitly authorized** for the PR/task, converged at the exact `headRefOid`, all configured checks are completed/passing (Step 3), and **no hard human-review gate** applies (including Gate #5: either a pure docs/skills diff that `pre-pr-gate.sh` (`diff-id.sh`) exempts automatically, or a hard PR whose current diff already has a recorded OhMyBug hunt):

1. Resolve the main repository worktree path and branch name, and re-verify current PR state right before merging:
   ```bash
   MAIN_ROOT=$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)
   PR_BRANCH=$(gh pr view "$PR" --json headRefName --jq .headRefName)
   gh pr view "$PR" --json headRefOid,isDraft,mergeable,mergeStateStatus,statusCheckRollup
   ```
   If `headRefOid` changed, return to Step 2; if any check is currently pending, wait with `gh pr checks "$PR" --watch` and re-verify (`allow_auto_merge` is disabled on `luandro/guia-la`, so do not pass `--auto`).
2. Run `gh pr merge` from `$MAIN_ROOT` without `--delete-branch` and without `SKIP_BUGHUNT=1`:
   ```bash
   (cd "$MAIN_ROOT" && gh pr merge "$PR" --squash)
   ```
   *(Running in `$MAIN_ROOT` without `--delete-branch` avoids git worktree checkout conflicts while the branch is checked out in `.worktrees/<task-slug>`. It does not bypass OhMyBug: `pre-pr-gate.sh` inspects the Bash session's `cwd`, so stay in `.worktrees/<task-slug>` rather than bypassing from clean `main`. Never attach `SKIP_BUGHUNT=1` as an agent; if `pre-pr-gate.sh` blocks an unhunted non-doc PR, stop and escalate via Option B (`needs-human-review`) so the owner merges as operator.)*
3. **Verify merge completed before any cleanup** (never delete the worktree or update `.state/goal.md` while the PR is still `OPEN`):
   ```bash
   PR_STATE=""
   for _ in $(seq 1 5); do
     PR_STATE=$(gh pr view "$PR" --json state --jq '.state')
     [ "$PR_STATE" = "MERGED" ] || [ "$PR_STATE" = "CLOSED" ] && break
     sleep 3
   done
   [ "$PR_STATE" = "MERGED" ] || { echo "PR #$PR state is $PR_STATE; skipping cleanup and escalating to needs-human-review"; exit 1; }
   ```
   If `PR_STATE` is not `MERGED` (or `gh pr merge` was blocked by `pre-pr-gate.sh`), leave the worktree intact and switch to **Option B (`needs-human-review`)**.
4. Once `PR_STATE == "MERGED"`, clean up from `$MAIN_ROOT` (including a fallback remote branch delete in case `delete_branch_on_merge` was later disabled):
   ```bash
   git -C "$MAIN_ROOT" pull --ff-only origin main
   git -C "$MAIN_ROOT" worktree remove ".worktrees/<task-slug>"
   git -C "$MAIN_ROOT" branch -D "$PR_BRANCH" 2>/dev/null || true
   git -C "$MAIN_ROOT" push origin --delete "$PR_BRANCH" 2>/dev/null || true
   ```
   Then update `.state/goal.md` and set the corresponding `tsk` task to `review` (only the user sets `done`).

### Option B: `needs-human-review` (default)

Used whenever `auto-merge` is not explicitly authorized, any hard human-review gate triggers (including Gate #5 for unhunted non-doc PRs), a RevEngine run fails/skips (including an outage or `review.yml` repair override), or round 5 ends without convergence:

1. Ensure the `needs-human-review` label exists and apply it:
   ```bash
   gh label create needs-human-review --color D93F0B --description "PR ready for human review or merge decision" --force
   gh pr edit "$PR" --add-label needs-human-review
   ```
2. Post a concise handoff comment on the PR listing:
   - Current head commit SHA and rounds run
   - Latest RevEngine recommendation and fit verdict (or failure/skip run URL)
   - Fixes pushed and any `Won't fix` / `Deferred` / `Wrong` decisions
   - CI check summary
   - Exact decision(s) needed from the human maintainer (when handing off an unhunted non-doc PR after RevEngine passes, include the exact operator merge command: `(cd "$MAIN_ROOT" && SKIP_BUGHUNT=1 gh pr merge "$PR" --squash)`)
3. Update `.state/goal.md`, leave the PR open and `.worktrees/<task-slug>` intact until the human merges.
