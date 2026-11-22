---
id: 04
title: GitHub previews, native builds and artifact pipeline
short: Ship 04a (fast web gate plus PR previews with provenance) and 04b (path-filtered, budget-capped Expo native builds) so every meaningful change is remotely inspectable.
tag: Ship
status: draft
complexity: High (spend)
depends: 02,03
inspect: A draft PR with a green fast gate, a live web preview URL, an Android artifact and an iOS build link, and a PR comment listing all of them
exit: 04a is required (PR web preview plus fast gate, no secrets in bundle, provenance recorded); 04b completes when one native build per platform succeeds within the recorded budget ceiling
---

## Phase identity

Phase **04** builds the delivery pipeline. Split (proposed in [../review.md](../review.md) §8.3, numbering unchanged):

- **04a — web previews and fast gate (required):** a GitHub Actions fast gate on every PR (typecheck, lint, unit tests, web export), a deployed web preview per PR, an automated PR comment with QA links, and build provenance on every artifact.
- **04b — native build and artifact pipeline (budget-capped):** Expo Android/iOS development builds triggered by path filters or labels rather than every PR, artifact retention, provenance and checksums, simulator strategy groundwork, and a recorded spend ceiling.

- **Objective:** any reviewer opens a PR and inspects the change running — web by URL, Android by artifact, iOS by Expo build link — and can tell exactly which commit produced each artifact.
- **Prerequisites:** Phase 02 exit (monorepo, pinned SDK 58, working web export) is enough to start 04a; Phase 03's typecheck/test/storybook commands wire into the gate when they land — only those slots wait for 03.
- **Dependencies:** Phase 02, Phase 03 — 04a starts as soon as Phase 02 exits; only the Storybook/snapshot gate slots depend on Phase 03; 04b may complete in parallel with Phases 05/06 (review §8.3 proposal).
- **Expected contributors:** senior coding agent (workflow implementation), orchestrator agent (review), human product owner (approves spend and credentials: Expo account linkage, GitHub secrets, any paid plan — D-08).
- **Complexity and risks:** High, and the risk is money and queue behavior, not code. The Expo free plan allows 15 Android + 15 iOS builds per month on a low-priority queue with 90+ minute peak waits, a 45-minute build timeout, and no Maestro jobs; Starter is $19/month with $45 build credit and a 2-hour timeout ([../research/expo-stack.md](../research/expo-stack.md) §1.8). Per-PR native builds are therefore forbidden by design. **No hour estimates.**

## Why this stage exists

The platform's operating model is agents shipping evidence, not claims ([../review.md](../review.md) §1). That requires a pipeline before it requires features: previews are how a human reviews UI without a toolchain, and artifacts with provenance are how an incident investigator answers "which commit is live" — the question the legacy incident #63 could not answer, with two live hosts and unclear provenance ([../research/legacy-cotiju-audit.md](../research/legacy-cotiju-audit.md) §9, #63).

The legacy repo also demonstrates the cost model this phase must avoid: it ran seven workflow files (including a Surge deploy) while PR #52 additionally configured Cloudflare Workers Builds triggers — not a workflow — so two deploy paths were live simultaneously, which is exactly how "what is live" became ambiguous ([../research/legacy-cotiju-audit.md](../research/legacy-cotiju-audit.md) §2). One deploy target per environment, one provenance record per artifact.

The 04a/04b split is a review proposal (R6, D-08), incorporated here as a proposal: web-only per-PR gating, native builds path-filtered and nightly, budget ceiling recorded before the first paid minute.

## Inputs and source references

Proposed paths in the future `guia-la` repository:

- `.github/workflows/fast-gate.yml` (proposed) — 04a gate
- `.github/workflows/web-preview.yml` (proposed) — 04a preview deploy and PR comment
- `.github/workflows/native-builds.yml` (proposed) — 04b path-filtered/nightly builds
- `eas.json` (proposed) — build profiles (`development`, `preview`)
- `.eas/workflows/*.yml` (proposed) — Expo Workflows definitions
- `docs/pipeline/provenance.md` (proposed) — artifact naming, checksum, live-commit record
- `docs/pipeline/budget.md` (proposed) — ceiling, alert threshold, first-month actuals

Legacy references (read-only): `.github/workflows/` in `luandro/cotiju-app` (seven workflows, dual hosting — cautionary reference only); PR #52's cold-load staging smoke pattern is the one worth porting (smoke against a deployed preview, not localhost).

Authoritative documentation (from research, retrieved 2026-11-21/22):

- Expo pricing and plan limits — [../research/expo-stack.md](../research/expo-stack.md) §1.8 (figures cited below)
- Maestro on Workflows: `.maestro/*.yml`, `e2e-test` profile, `eas workflow:run --non-interactive --wait --json`; runs on PRs only when the GitHub repo is linked in the Expo dashboard — same section
- Cloudflare Workers Static Assets for static sites; static-asset requests are free and do not invoke the Worker; Workers Paid is $5/month minimum — [../research/backend-stores-starters.md](../research/backend-stores-starters.md) §1
- Expo Hosting free tier: 100k requests/month, PR preview URLs, no custom domain — [../research/expo-stack.md](../research/expo-stack.md) §1.4
- `NODE_ENV` forcing and env/variant separation — [../research/expo-stack.md](../research/expo-stack.md) §1.1: Expo CLI forces `NODE_ENV`, and every non-debug build including a custom Staging config uses production env, so config must never key off `NODE_ENV`. Canonical variables: `APP_ENV` = environment (development/preview/staging/production); `APP_VARIANT` = build profile (flagship, cotijuba-web, serra-web — per-destination config keys off this, per the same section); both zod-validated, build fails if either is missing

Decisions and review rows: D-08 (CI/build budget, proposed — this phase supplies its evidence), D-03 (static web export, approved 2026-11-21; S1 pending), R6 (native builds per PR), R1 (provenance pulled forward here), §8.3 (the split).

Known unknowns:

- Preview URL mechanics on Workers (version-scoped preview URLs) — proposed, verify in this phase before relying on the pattern; the documented alternative is Expo Hosting PR previews with its free-tier limits
- GitHub Actions minute allowance for a private repo — unknown; verify the account plan (public repos are free)
- Real build minutes per workflow (S12) and GH Actions emulator flake rate (S13) — unknown, measure when 04b runs
- Whether GH Actions cache eviction under quota pressure makes cold runs routine — unknown; the budget doc records gate duration p50/p95 once running
- iOS build requires Apple developer credentials provisioning — exact requirement recorded in this phase; provisioning itself is a human action

Credentials and tools needed (names only, values never in repo): `EXPO_TOKEN`, GitHub Actions secrets store, Cloudflare API token (if Workers previews), Expo account linked to the GitHub repo. Human creates and injects all of these; the agent never sees the values.

## Task breakdown

| # | Task (bounded) | Owner | PR unit | Depends on |
| --- | --- | --- | --- | --- |
| 1 | Fast gate workflow: typecheck, lint, unit tests, `pnpm export:web` on every PR (Storybook build and snapshot slots are added when Phase 03 lands); pnpm store caching; concurrency cancel on new push | Agent | PR 04-1 | Phase 02 |
| 2 | Web preview deploy per PR; verify the chosen mechanism actually serves the export; record the URL pattern | Agent | PR 04-2 | 1 |
| 3 | PR comment automation listing preview URL, artifact links, commit SHA; update on re-push | Agent | PR 04-3 | 2 |
| 4 | Provenance: artifact names embed commit SHA and profile; sha256 checksums recorded; deploy step writes a live-commit record (file plus workflow summary) | Agent | PR 04-4 | 2 |
| 5 | Secret hygiene on the built bundle: grep the exported web dist for secret-shaped strings; fail on hits | Agent | PR 04-5 | 2 |
| 6 | `eas.json` profiles and first Workflows definitions; document required credentials and account linkage | Agent | PR 04-6 | 1 |
| 7 | Native trigger policy: builds on `native` label or path filter (native config, native deps, `apps/app/**` platform files) plus a nightly schedule; never per-PR | Agent | PR 04-7 | 6 |
| 8 | Budget record: free tiers only per D-08 (approved 2026-11-21) — track EAS build count against 15 Android + 15 iOS/month, Workers/D1 free daily limits, alert at 80% of each; first actuals appended when available | Agent, human approves any upgrade | PR 04-8 | 6 |
| 9 | Simulator strategy note: options are Expo cloud simulators ($0.10/min, 60 min/month included on paid plans until 2027) versus GH Actions emulator (S13); decision deferred to Phase 05 with 04b measurements attached | Agent | PR 04-9 | 7 |
| 10 | Evidence packaging: workflows upload logs, screenshots where produced, artifact checksums; retention policy documented | Agent | PR 04-10 | 7 |

Notes:

1. Tasks 1–5 are 04a and are required before any later phase claims CI evidence. Tasks 6–10 are 04b and may land during Phase 05/06 (review §8.3).
2. Task 8's ceiling is a human decision (D-08). The agent proposes numbers from research; the user sets the ceiling. No paid plan is activated without that approval.
3. One deploy target per environment is a hard rule (legacy #63 lesson): previews go to the preview target, staging to staging, production does not exist yet in this phase.

## Architecture choices and guardrails

Pipeline shape:

```yaml
# Illustrative only — the implementing PR owns the real workflow syntax.
# fast-gate.yml (every PR): pnpm install --frozen-lockfile ->
#   typecheck -> lint -> unit -> export:web -> bundle secret grep
# native-builds.yml (label 'native' OR paths: eas.json, app.config.*,
#   package.json native deps; plus cron nightly):
#   eas build --profile development --platform android (then ios)
```

Workflow inventory (proposed; one concern per file, no mega-workflow):

- `fast-gate.yml` — every PR and push to main; the only required check that blocks merge
- `web-preview.yml` — on PR open/synchronize; deploys preview, posts/updates the PR comment, tears down on close
- `native-builds.yml` — on `native` label, path filter, or nightly cron; never per PR by default
- Cache and concurrency are settings on these files, not separate workflows

Preview lifecycle (proposed):

1. Created on first successful export in a PR; URL recorded in the PR comment
2. Updated in place on every re-push; a failed export leaves the previous preview but the comment marks it stale with the failing SHA
3. Deleted on PR close or merge; deletion is verifiable (URL returns a clear gone response, not a stale build)

Guardrails:

- Node pinned via `.nvmrc` to a supported LTS (research: SDK 58 needs Node 22.13+/24.3+/26+; odd releases unsupported — [../research/expo-stack.md](../research/expo-stack.md) §1.1)
- Lockfile frozen in CI; dependency bumps are explicit PRs, never side effects
- `EXPO_PUBLIC_*` values are the only vars allowed in client bundles; the secret grep (task 5) treats anything else found in `dist/` as a failure. Research warns the Atlas file also inlines env values and must be treated as a secret artifact, never published (§1.9)
- Preview deploys are ephemeral and clearly labeled non-production; no production DNS, no custom domain, no store submission in this phase
- Concurrency: one in-flight run per PR, superseded runs cancelled

Forbidden:

- Per-PR native builds (free-plan quota exhausts in days and the low-priority queue makes them useless as gates — R6)
- Activating paid plans, purchasing anything, or linking store credentials without the human's explicit approval (D-08)
- Secrets echoed into logs, PR comments, or artifact names
- Deploying anything labeled production; publishing to an app store
- Caching that spans lockfile changes

Security and privacy implications: workflow logs are the main leak surface; the secret grep and `EXPO_PUBLIC_` discipline are the countermeasures. PR comments must contain URLs and SHAs only, never env values.

Acceptable alternatives:

- Preview host: Expo Hosting PR previews (documented, free 100k req/month, no custom domain) versus Workers Static Assets with version previews (production-aligned, mechanism unverified). Recommended: verify both in task 2, pick one, record why in `docs/pipeline/provenance.md`. Not a user decision unless cost differs from zero.
- Native gate placement: Expo Workflows versus GH Actions emulator — explicitly deferred to Phase 05 with S12/S13 data (task 9).

## Deliverables

- [ ] `.github/workflows/fast-gate.yml` green on a real PR
- [ ] Web preview deployed per PR with a documented, verified URL pattern
- [ ] PR comment bot listing preview URL, artifacts, commit SHA, and known limitations
- [ ] Provenance record: artifact naming scheme, checksums, live-commit record for every deploy
- [ ] Secret grep step failing the gate on bundle hits
- [ ] `eas.json` with development/preview profiles; Workflows definitions; credentials inventory (names and where they live, no values)
- [ ] Native trigger policy implemented (label/path filter plus nightly) — not per-PR
- [ ] `docs/pipeline/budget.md` with the user-set ceiling, 80% alert, and failure-alert channel recorded
- [ ] Simulator strategy note with costs and the open S13 question
- [ ] Retention policy for artifacts and logs
- [ ] Preview teardown on PR close verified (URL returns a gone response, not a stale build)

## Visual and functional QA

Manual journeys (human):

1. Open a draft PR that changes a UI primitive. The PR comment shows: preview URL (clickable, loads the walking-skeleton Places page), commit SHA matching the branch head, and — for an Android-flagged PR — an artifact link.
2. Download the Android artifact; confirm its name embeds the commit SHA and the checksum in the provenance record matches a local `sha256sum`.
3. Break the export deliberately (invalid env var): the gate fails, the PR comment or check run shows the failing step, and no stale preview is left serving the old build as if current.
4. On the Expo dashboard (if 04b is live): confirm the build queue position and total minutes for one Android dev build; append actuals to `docs/pipeline/budget.md`.

Agent journeys:

1. From a clean checkout, re-run the gate locally with the same commands the workflow uses; outputs match.
2. Curl the preview URL with JavaScript disabled; the exported HTML still renders the shell (static output sanity, ties to D-03).

Platform matrix:

| Surface | Web | Android | iOS |
| --- | --- | --- | --- |
| Fast gate + preview | required per PR | n/a | n/a |
| Dev build artifact | n/a | required (one 04b run) | required (one 04b run; blocked-with-reason acceptable if Apple credentials absent) |

Error states to verify: gate failure surfaces the failing command and first error line in the check run; a cancelled superseded run leaves no half-deployed preview; a secret grep hit fails closed.

## Automated verification

Nothing has been run in the future repo; statuses below reflect research only. The source-map flag form is **validated** (verified against the CLI in research); everything else is **proposed**.

| Command | Purpose | Status |
| --- | --- | --- |
| `pnpm export:web` (wrapping `npx expo export -p web`) | produce the static bundle for preview and grep | proposed (command form documented in research §1.3) |
| `pnpm export:web -- --source-maps external` | emit source maps for later exclusion assertions | **validated** (flag verified in research §1.9; not yet run on our repo) |
| `pnpm dlx expo-doctor` | SDK alignment check in CI | proposed |
| `pnpm dlx actionlint` | workflow syntax check | proposed |
| `eas build --profile development --platform android --non-interactive` | 04b dev build | proposed; credential-gated (EXPO_TOKEN, account linkage) |
| `sha256sum` over artifacts vs recorded checksums | provenance match | proposed |
| secret grep script over `dist/` | fail on secret-shaped strings | proposed |

Positive tests: a UI-only PR triggers exactly the fast gate and a preview, never a native build; artifact SHA matches commit; preview serves the new build.

Negative tests: a PR touching `eas.json` without the native label still triggers a native build (path filter works); a workflow with an undefined secret fails closed with a clear message; the secret grep fails on a planted canary string in a throwaway branch (demonstrate once, revert).

Deliberate-failure demonstration: plant a canary secret in the branch, show the grep step failing the gate with the file named, revert. Keep the output excerpt as the PR's evidence artifact. Phase 05 formalizes this as a standing protocol.

## Acceptance gate

> [!GATE] 04a: every PR ships a fast gate result and a live, provenance-stamped web preview with zero secrets in the bundle. 04b: at least one Android and one iOS build produced through the pipeline within the recorded budget, or an explicit credentials blocker documented.

Checklist (observable pass/fail):

- [ ] A real PR shows: green fast gate, clickable preview URL, PR comment with QA links and commit SHA
- [ ] Preview URL pattern documented and verified to serve the PR's build (not a stale one)
- [ ] Artifact checksums recorded and spot-verified by the human
- [ ] Secret grep demonstrated failing on a canary, then passing after revert
- [ ] Native builds fire only on label/path filter or nightly — demonstrated by a UI-only PR producing none
- [ ] Budget ceiling recorded with user approval; 80% alert configured; first actuals appended if 04b ran
- [ ] Credentials inventory lists every secret by name and location, with zero values in repo or logs
- [ ] No production DNS, store submission, or paid activation exists in the diff

Blocks progression if:

- The fast gate can be merged while red (required check missing) — every later phase's evidence claim becomes unreliable
- A secret reaches a preview URL or PR comment — stop, rotate, and notify the human immediately
- The preview serves stale content after re-push — reviewers would approve the wrong build
- Native spend begins with no recorded ceiling (D-08 violated)

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Free-tier native queue (90+ min peaks) stalls 04b for days | high | medium | 04b is not a blocker for 05/06; nightly cadence accepted; Starter activation is a priced, human-approved option |
| Preview mechanism on Workers does not behave as expected | medium | medium | Verify in task 2 before standardizing; Expo Hosting PR previews are the documented fallback |
| Spend overrun (build overage: Android $1–$2, iOS $2–$4 per build; Maestro $0.05/job; cloud simulators $0.10/min — research §1.8) | medium | high | Path-filtered triggers, nightly cap, 80% alert, hard ceiling; free plan cannot incur overage (research §1.8) |
| Secret leak via logs or Atlas artifact | low | high | Secret grep, log hygiene, Atlas treated as secret per research §1.9; canary demo proves detection |
| iOS blocked on Apple credentials | high | low | Acceptable: record the blocker as the gate result; iOS evidence deferred to when the human provisions credentials |
| GH Actions private-repo allowance exhausted | medium | medium | Verify plan in task 1; keep the gate under the 10-minute target; cache aggressively |
| Parallel agents collide on workflow files | medium | low | One concern per workflow file (inventory above); PR units are sequential per the task table |

Sensitive operations needing human approval: activating any paid plan (Expo Starter, Workers Paid beyond free); creating/linking accounts or credentials; anything touching DNS or stores (none is planned in this phase).

Budget impact: zero — all free tiers per D-08 (approved 2026-11-21). Expo Starter ($19/month) or Workers Paid ($5/month) need a new owner decision. GitHub Actions cost depends on repo visibility and plan (verify).

Rollback: workflows are declarative; reverting the PR disables the pipeline. 04a and 04b revert independently — disabling native builds never touches the web gate. Preview targets are ephemeral; deleting them destroys nothing tracked.

Restart instructions for an agent picking up mid-phase:

1. Read `docs/pipeline/provenance.md` and `docs/pipeline/budget.md` for decisions already recorded
2. Check which of PRs 04-1..04-10 are merged; the table defines order and 04a/04b membership
3. Never re-verify a preview mechanism already verified — read the note instead
4. If credentials are missing, record the blocker and continue with 04a work; do not wait idle

## Next phase handoff

Phase 05 (tests and guardrails) needs from this phase:

- The fast-gate workflow structure and slot ordering (typecheck, lint, unit, export — test layers insert here)
- The provenance and evidence-packaging pattern its test reports reuse
- S12/S13 measurements (build minutes, emulator feasibility) feeding the simulator-strategy decision (task 9 hands the decision over)
- The budget record it must not blow: nightly Maestro lives inside the ceiling

Records to hand over: workflow files, verified preview URL pattern, credentials inventory, budget sheet with actuals, the canary demonstration output. Next phase page: [phase-05.html](phase-05.html). Agent prompt: [../prompts/phase-05-agent.md](../prompts/phase-05-agent.md). This phase's own prompt: [../prompts/phase-04-agent.md](../prompts/phase-04-agent.md).
