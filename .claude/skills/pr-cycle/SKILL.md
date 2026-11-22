---
name: pr-cycle
description: Drive a PR through RevEngine review rounds, fix and resolve findings using RevEngine's decision protocol, loop until nothing is pending at head, and conclude with auto-merge (when authorized) or needs-human-review.
---

# PR Review Cycle

Drive a pull request through local preflight checks and GitHub RevEngine review rounds until nothing is pending at the current head commit, then finish cleanly with either `auto-merge` or `needs-human-review`.

## Inputs & Mode Selection

- **PR target**: existing PR number (`gh pr view`) or create a PR from the current task worktree branch (`.worktrees/<slug>`).
- **Merge policy**:
  - `needs-human-review` (**default**): label and summarize for a human merge decision once reviews converge (or immediately when a human gate triggers).
  - `auto-merge`: merge only when **explicitly authorized** for the PR/task, all convergence checks pass at the exact `headRefOid`, and **zero** hard human-review gates fire.
- **Review mode**:
  - `/review` (**default**, `human` mode): inline comments on high/medium findings (up to 10), collapsed details, project-fit assessment, and merge advice.
  - `/review agent` (`agent` mode): single summary comment listing up to 80 findings across severities with no fit check (note: `RB_CONFIG_ENGINE=claude-code` disables RevEngine's swarm, so agent mode produces the single-comment agent format from Claude). If `auto-merge` is requested and a fit check is required, always run a final `/review` (`human` mode) round before merging.

## Hard Human-Review Gates

These rules **override `auto-merge`** and unconditionally require `needs-human-review`:

1. RevEngine summary opens with `**Recommendation: needs a maintainer's decision.**` (fit verdict is `fits_with_concerns`, `does_not_fit`, or `unclear`). Never write a `**Fit: yes.**` or `**Fit: no.**` answer on behalf of a human maintainer.
2. The PR touches auth, payments, credentials/secrets/permissions, privacy/security boundaries, destructive data/production changes, infra spending, store publication, or unresolved architecture decisions.
3. Any non-trivial finding is marked `Won't fix:` or `Deferred:` with a product or architecture trade-off.
4. The loop reaches **5 rounds** without converging, RevEngine fails or skips, or any human reviewer left `CHANGES_REQUESTED` or unresolved comments.

## Loop Procedure (Max 5 Rounds)

### 0. Pre-PR (once)

1. Confirm work lives in `.worktrees/<task-slug>` (not directly on `main`) and run local lint/typecheck/tests.
2. Follow `AGENTS.md`:
   - **Hard PR** (production code paths, security, money, concurrency, data handling, or wide/risky diffs): run local `codex review`, then conditional `ohmybug` (`lite`) if triggered, and fix confirmed findings before opening the PR.
   - **Setup/docs/config/scaffolding PR**: self-review the diff and record the skip in `.state/goal.md`.
3. Push the branch and open the PR (`gh pr create`) if one does not exist yet.

### 1. Trigger & Wait (each round)

1. Record the exact commit and UTC timestamp before commenting:
   ```bash
   HEAD_SHA=$(gh pr view "$PR" --json headRefOid --jq .headRefOid)
   TRIGGERED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
   gh pr comment "$PR" --body "/review"   # or "/review agent" for intermediate triage
   ```
2. Find the `Review` workflow run created at or after `$TRIGGERED_AT` and watch it to completion (never busy-poll with `sleep`). Note: `issue_comment` workflows run from the default branch (`main`), so do **not** filter `gh run list` by the PR branch:
   ```bash
   RUN_ID=""
   for _ in $(seq 1 10); do
     RUN_ID=$(gh run list --workflow review.yml --limit 10 --json databaseId,createdAt,event,url \
       --jq "[.[] | select(.event == \"issue_comment\" and .createdAt >= \"$TRIGGERED_AT\")] | sort_by(.createdAt) | last | .databaseId // \"\"")
     [ -n "$RUN_ID" ] && break
     sleep 3
   done
   [ -n "$RUN_ID" ] || { echo "No review.yml run found after $TRIGGERED_AT"; exit 1; }
   gh run watch "$RUN_ID" --exit-status
   ```
3. If `gh run watch` fails (e.g., missing/expired `CLAUDE_CODE_OAUTH_TOKEN`, quota exhaustion, workflow error) or the job skips without posting a review for `HEAD_SHA`, **stop immediately** and report the run URL and failure reason to the user.

### 2. Inspect All Pending State

Fetch the latest RevEngine review (`<!-- rev-engine-prime -->`), unresolved threads, human reviews, CI checks, and PR mergeability:

```bash
NWO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
OWNER=${NWO%%/*}
REPO=${NWO##*/}

# 1. Latest RevEngine review
gh api "repos/{owner}/{repo}/pulls/$PR/reviews?per_page=100" --paginate \
  --jq '[.[] | select(.user.login == "github-actions[bot]" and (.body | contains("<!-- rev-engine-prime -->")))] | sort_by(.submitted_at) | last | {id, submitted_at, commit_id, body}'

# 2. PR state + all review threads + human review states
gh api graphql -f query='
  query($owner: String!, $repo: String!, $pr: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        headRefOid
        isDraft
        mergeable
        mergeStateStatus
        latestReviews(first: 20) {
          nodes { author { login } state submittedAt }
        }
        reviewThreads(first: 100) {
          nodes {
            id
            isResolved
            isOutdated
            path
            line
            comments(first: 20) {
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
  }' -f owner="$OWNER" -f repo="$REPO" -F pr="$PR"

# 3. CI checks
gh pr checks "$PR"
```

Verify that the latest RevEngine review body cites `Reviewed commit ${HEAD_SHA:0:7}` (matching the current `headRefOid`). Extract its opening advice line:

- `**Recommendation: merge.**` — clean (nothing medium/high; fit passed or off)
- `**Recommendation: merge and fast-follow.**` — medium finding(s) remain
- `**Recommendation: fix, then merge.**` — high finding(s) remain
- `**Recommendation: needs a maintainer's decision.**` — fit verdict is not `fits` (or has an explicit maintainer question)

### 3. Check Convergence ("Nothing Pending")

The PR has **converged** if and only if, for the **exact current `headRefOid`**:

1. Latest RevEngine review reviewed the current `headRefOid` and opens with `**Recommendation: merge.**` (or if `**Recommendation: merge and fast-follow.**` only after every remaining medium item was explicitly verified & resolved as `Wrong:` or `Won't fix:` with zero human-gate triggers — even then, prefer one final `/review` round so RevEngine confirms `Recommendation: merge.`).
2. Zero unresolved review threads (RevEngine or human) and no outstanding `CHANGES_REQUESTED` review.
3. All CI checks pass (none pending or failing).
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

Only allowed when **explicitly authorized** for the PR/task, converged at the exact `headRefOid`, and **no hard human-review gate** applies:

1. Re-verify current state immediately before merging:
   ```bash
   gh pr view "$PR" --json headRefOid,isDraft,mergeable,mergeStateStatus,statusCheckRollup
   ```
2. Merge (note: GitHub rejects `--auto` on repos without blocking branch protections or pending required checks, so branch on pending checks):
   ```bash
   # If required checks are currently pending:
   gh pr merge "$PR" --auto --squash --delete-branch
   # If all checks are already green and PR is cleanly mergeable:
   gh pr merge "$PR" --squash --delete-branch
   ```
3. Sync local `main`, remove `.worktrees/<task-slug>`, update `.state/goal.md`, and set the corresponding `tsk` task to `review` (only the user sets `done`).

### Option B: `needs-human-review` (default)

Used whenever `auto-merge` is not explicitly authorized, any hard human-review gate triggers, or round 5 ends without convergence:

1. Ensure the `needs-human-review` label exists and apply it:
   ```bash
   gh label create needs-human-review --color D93F0B --description "PR ready for human review or merge decision" --force
   gh pr edit "$PR" --add-label needs-human-review
   ```
2. Post a concise handoff comment on the PR listing:
   - Current head commit SHA and rounds run
   - Latest RevEngine recommendation and fit verdict
   - Fixes pushed and any `Won't fix` / `Deferred` / `Wrong` decisions
   - CI check summary
   - Exact decision(s) needed from the human maintainer
3. Update `.state/goal.md`, leave the PR open and `.worktrees/<task-slug>` intact until the human merges.
