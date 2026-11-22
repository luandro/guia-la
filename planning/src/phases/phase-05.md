---
id: 05
title: Tests, regression traps and security guardrails
short: Teach CI to catch the failure classes the legacy app actually had — async-state spinners, timezone rollover, validity windows, hidden type debt, secret leaks — with red/green proof and a flaky-test protocol.
tag: Prove
status: draft
complexity: Medium (flakiness)
depends: 04
inspect: A red/green PR demonstrating four deliberate failures caught by the gate, plus the test report and quality-budgets doc
exit: The fast gate fails correctly on each planted failure class and an agent can diagnose any failure from saved evidence without re-running locally
---

## Phase identity

Phase **05** installs the regression traps. It adds the test layers the fast gate runs (unit, component, contract-shaped, web E2E, accessibility, visual, security scans), encodes the legacy app's real failure classes as fixtures and named traps, proves the gate fails when it must (red/green demonstrations), and writes the quality budgets and flaky-test protocol that govern everything after.

- **Objective:** CI that cannot silently pass the failure classes guia.la has already seen: indefinite spinners on failed loads, stale or wrongly-dated tide data, boat schedules ignoring weekday/validity, type errors hidden by the build, secrets in bundles, and authenticated responses entering shared caches.
- **Prerequisites:** Phase 04a exit (fast gate workflow exists and runs per PR; preview deploys work).
- **Dependencies:** Phase 04. Native E2E (Maestro) placement uses 04b's S12/S13 measurements; per the review §8.4 proposal, native Maestro runs nightly/on release candidates, not per PR.
- **Expected contributors:** senior coding agent (suites and traps), orchestrator agent (verifies red/green evidence honestly), human product owner (approves the flaky-test protocol and the real-device smoke list; only the human permits skipping or deleting a test).
- **Complexity and risks:** Medium, and the risk is flakiness and scope creep, not difficulty. Visual and E2E suites are where CI credibility goes to die; the protocol and the web-first bias are the mitigations. **No hour estimates.**

## Why this stage exists

Because the legacy app passed green CI while broken. Its build skipped typecheck and hid 455 `tsc` errors (issue #69; PR #52 reported them); its ~234 Vitest and ~136 Playwright cases were static counts that never ran in this planning pass ([../research/legacy-cotiju-audit.md](../research/legacy-cotiju-audit.md) §6), and one timing-flaky weather test was already tolerated. The incidents this phase traps are documented, not hypothetical:

- #60: async views without deadline, empty, error, or retry states — infinite spinners when the backend is slow or down
- #62: tide fallback hard-codes a 2025 file; out-of-range dates return an empty "success" with a fresh `lastUpdated`; UTC date keys show the wrong day after 21:00 local (UTC-3)
- #64: next-boat logic uses the device clock, ignores weekday/validity windows, and labels a wrong departure "tomorrow"
- #65: the service worker cached authenticated Supabase responses for 24 hours beside public ones
- #66: navigation blocked on `navigator.onLine`, which is not backend health
- Secrets by design: third-party API keys shipped in the public bundle ([../research/legacy-cotiju-audit.md](../research/legacy-cotiju-audit.md) §8; R5, D-12)

Agents scaling output is the whole operating model; this phase is what makes that safe. The review's testing strategy (§5) and the master plan's phase 05 both make the red/green demonstration the exit proof: deliberately break things and show CI catching each one.

## Inputs and source references

Proposed paths in the future `guia-la` repository:

- `packages/testing/` — shared helpers only, no fixtures: render-with-theme, fixture loader, network-fail harness (proposed)
- `packages/fixtures/{cotijuba,serra}/` — synthetic fixtures only, extending Phase 01's sets: places, boat schedules with validity windows, tide series spanning a year boundary (proposed)
- `packages/testing/regressions/` — named traps, one per legacy failure class (proposed)
- `apps/app/e2e/` — Playwright suites (proposed)
- `.maestro/` — native smoke flows (proposed)
- `docs/quality/budgets.md`, `docs/quality/flaky-protocol.md`, `docs/quality/red-green-demo.md` (proposed)

Legacy references (read-only, `luandro/cotiju-app`): tests are ported as **scenarios, not code** (R15): `first-load.spec.ts` (cold load with backend down, time-to-useful under 5 s — PR #52 pattern), the tide rollover bug, boat validity, PWA cache privacy audit (#65). Do not copy Supabase-coupled test code.

Authoritative documentation (from research): Playwright and Maestro tool placement per review §5; Maestro on Workflows mechanics (`.maestro/*.yml`, `e2e-test` profile, `eas workflow:run`, PR-triggered only when the repo is linked — [../research/expo-stack.md](../research/expo-stack.md) §1.8); `navigator.onLine` unreliability (#66); timezone requirement `America/Belem` (legacy audit inference).

Decisions and review rows: D-08 (budget — Maestro at $0.05/job plus minutes lives inside the ceiling), D-10 (offline semantics — v1 web caching rules arrive in 08; this phase builds the harness that will verify them), D-13b (no visitor accounts — automated check), D-12 (legacy key rotation is an owner action outside this repo), R15 (fixtures not test code), review §5 (gate table), §8.4 (native Maestro on nightly/RC).

Known unknowns:

- S13: GH Actions emulator Maestro flake rate — prototype in this phase if 04b deferred it; unknown, measure
- WebKit Playwright stability in CI — nightly only (review §5); unknown until run
- The tide/boat pure functions themselves land in Phase 08; this phase ships the trap harness and fixtures with the tests marked to activate when the functions exist — an honest pending marker, not a skip
- Whether WebKit nightly results match Chromium closely enough to share baselines — unknown; assume separate baselines until measured

Credentials and tools needed: none new beyond Phase 04's. Maestro runs (if any) consume the Expo budget under D-08.

## Task breakdown

| # | Task (bounded) | Owner | PR unit | Depends on |
| --- | --- | --- | --- | --- |
| 1 | `packages/testing` helpers: render with ThemeProvider, synthetic fixture loader, deterministic clock (`FakeTimer` at a set America/Belem instant), network-fail harness | Agent | PR 05-1 | Phase 04 |
| 2 | Unit/component suites for Phase 03 primitives: state matrix assertions (loading/empty/error/offline render, retry fires) | Agent | PR 05-2 | 1 |
| 3 | Regression traps named for legacy classes: `legacy-60-spinner`, `legacy-62-tide-rollover`, `legacy-64-boat-validity`, `legacy-66-offline-nav` — fixtures now, pending markers where logic lands in 08 | Agent | PR 05-3 | 1 |
| 4 | Playwright web suite: smoke journeys on fixture data (home, places list/detail), JS-disabled raw-HTML assertion kept from the Phase 02 gate, backend-down error journey with time-to-useful budget | Agent | PR 05-4 | 1 |
| 5 | Accessibility automation: axe on key pages and on the story set from Phase 03; zero-critical policy | Agent | PR 05-5 | 2 |
| 6 | Visual regression: Chromium screenshots of stories and key pages against Phase 03 baselines; threshold and update policy in docs | Agent | PR 05-6 | 2 |
| 7 | Security scans: gitleaks in CI, extend Phase 04's bundle secret grep to a standing rule, dependency review on lockfile changes, no-credential-prompt check on public pages (D-13b) | Agent | PR 05-7 | Phase 04 |
| 8 | Maestro smoke flows (`.maestro/`): app opens, destination renders, a place detail opens; wired to nightly/RC per review §8.4 — not per PR; placement decision recorded with S12/S13 data | Agent | PR 05-8 | 04b (or explicitly deferred) |
| 9 | Red/green demonstrations: four planted failures — broken error state, type error, canary secret, stale preview/OG regression — each shown failing the correct gate step, then reverted; evidence archived | Agent, human reviews evidence | PR 05-9 | 4, 7 |
| 10 | Quality budgets and flaky protocol docs: fast-gate time target (review §5 proposes under 10 minutes), trap coverage over vanity percentages, quarantine label with issue link and 7-day expiry, never delete or skip without human approval | Agent, human approves protocol | PR 05-10 | 9 |
| 11 | Test report artifact: HTML report generated in CI and linked from the PR alongside the preview URL | Agent | PR 05-11 | 4 |

Notes:

1. Task 3's traps are the phase's core deliverable. Each names its legacy issue, carries a fixture reproducing the bug shape, and asserts the honest behavior (visible error, explicit "unavailable", correct local date) rather than a mocked success.
2. Task 8 may be explicitly deferred if 04b has not produced measurements; the gate then records "native E2E pending — S13/budget" as a blocker with a reason, which is an acceptable, honest state (quality standard: mark gates blocked rather than paper over).
3. Task 9 is the exit proof. The demonstrations run on a throwaway branch; the evidence (failing output excerpts per gate step) is archived in `docs/quality/red-green-demo.md` and the PR description.

## Architecture choices and guardrails

Test layering (all proposed until run):

```text
fast gate (every PR, target < 10 min, review §5):
  typecheck -> lint -> unit/component (Vitest) -> regression traps
  -> export:web -> Playwright smoke (Chromium, incl. JS-disabled HTML)
  -> axe on pages and stories -> visual diff (Chromium)
  -> gitleaks + bundle secret grep + dependency review
nightly / RC:
  WebKit Playwright -> Android + iOS Maestro -> (restore drills arrive in 07)
```

Contracts and patterns:

- Determinism first: no real network in unit/component suites; the network-fail harness simulates down/slow/hanging backends — the #60 class must be testable without a flaky proxy
- Deterministic clock: timezone-sensitive traps pin an America/Belem instant (e.g. 21:30 local) rather than relying on wall time; legacy #62/#64 are clock bugs and must not be tested with a live clock
- Fixtures are synthetic and versioned; importing legacy data into fixtures is forbidden (privacy and licensing unverified — D-11)
- Trap naming convention `legacy-<issue>-<slug>` keeps each trap traceable to its documented failure

Trap index (starter set; extend, never duplicate — each row names its legacy issue and its honest assertion):

| Trap | Legacy failure it encodes | Fixture needed | Status at phase exit |
| --- | --- | --- | --- |
| `legacy-60-spinner` | async view without deadline/empty/error/retry (#60) | network-fail harness over the places page | active |
| `legacy-62-tide-rollover` | UTC date key shows the wrong tide day after 21:00 local (#62) | tide series spanning a year boundary, clock pinned 21:30 America/Belem | pending marker until Phase 08 function exists |
| `legacy-64-boat-validity` | next-boat ignores weekday and validity window (#64) | schedules with weekday masks and expired validity ranges | pending marker until Phase 08 function exists |
| `legacy-66-offline-nav` | `navigator.onLine` blocked navigation (#66) | page journey with network down but shell cached | active |

Forbidden:

- Skipping, deleting, or `todo`-ing a failing test without the human's approval (charter rule; the quarantine label is the only sanctioned relief and it expires in 7 days)
- Snapshot tests that assert mock implementations rather than behavior
- Real credentials, real personal data, or live third-party APIs in any suite
- Vanity coverage percentages as a gate metric; the gate counts trap classes covered
- `navigator.onLine` as a proxy for backend health in any test or product code (#66)
- Per-PR native builds or Maestro jobs (R6, §8.4)

Security and privacy implications: suites must not log fixture tokens resembling real secrets into CI output (the gitleaks step would fail the run — test that too); dependency review gates on lockfile diffs to catch supply-chain drift early.

Acceptable alternatives:

- Maestro alternatives (Detox, Appium): acceptable only with evidence of lower flake or cost; Maestro is the default per tooling research; the choice is recorded, not debated per PR
- Web-only visual diffs now, per-platform baselines later (when native E2E lands) — accepted explicitly rather than by omission

## Deliverables

- [ ] `packages/testing` helpers with the deterministic clock and network-fail harness
- [ ] Synthetic fixture sets under `packages/fixtures/{cotijuba,serra}/`: places, boat schedules with validity windows and weekday masks, tide series spanning a year boundary in America/Belem
- [ ] Regression traps `legacy-60`, `legacy-62`, `legacy-64`, `legacy-66` (pending markers where Phase 08 logic is required)
- [ ] Playwright web suite with JS-disabled HTML assertions and the backend-down time-to-useful journey
- [ ] Axe integration over pages and stories; zero-critical policy in docs
- [ ] Visual regression wired to Phase 03 baselines with an update policy
- [ ] Security layer: gitleaks, standing bundle secret grep, dependency review, no-login check
- [ ] `.maestro/` smoke flows wired to nightly/RC, or a recorded deferral with reason
- [ ] `docs/quality/red-green-demo.md` with the four demonstrations' evidence
- [ ] `docs/quality/budgets.md` and `docs/quality/flaky-protocol.md` approved by the human
- [ ] Test report artifact linked from every PR

## Visual and functional QA

Manual journeys (human):

1. Open the red/green evidence PR: read `docs/quality/red-green-demo.md`; every demonstration shows a failing gate step with the exact error, and the follow-up green run after revert. The human confirms the failures are the *right* failures (correct gate step, diagnosable message).
2. Open a PR comment: preview URL, test report link, and trap summary all present; open the report and find the backend-down journey result with its time-to-useful number.
3. Attempt a keyboard-only pass of the Places page on the preview; confirm focus visibility matches the axe-clean story set.
4. Review the trap list: each names its legacy issue and shows its fixture; none contains legacy data.

Agent journeys:

1. Introduce a deliberate spinner (remove an error state) on a branch; the Playwright backend-down journey must fail with the trap name in the output.
2. Set the fixture clock to 21:30 America/Belem on December 31; the tide-rollover trap must assert the correct local date (pending-marker logic permitting).
3. Plant a canary secret; gitleaks and the bundle grep both fail; the report names the file.
4. Verify a quarantined test still appears in the report with its label, issue link, and expiry — and that the expiry, once past, fails the run.

Platform matrix:

| Surface | Web | Android | iOS |
| --- | --- | --- | --- |
| Unit, traps, a11y, visual, security | required per PR | n/a | n/a |
| Playwright Chromium smoke | required per PR | n/a | n/a |
| Playwright WebKit | nightly | n/a | n/a |
| Maestro smoke | n/a | nightly/RC | nightly/RC (or recorded deferral) |

Error states to verify: backend down (visible error, retry, time-to-useful within budget), fixture empty (EmptyState, not a skeleton forever), year-boundary date rollover, and a quarantined test showing its label and expiry in the report rather than vanishing. Trap pending markers surface as explicit "pending — Phase 08" entries in the report — never as green checkmarks.

## Automated verification

Nothing has run; all commands are **proposed** except where research verified the form. Per the quality standard, planning documents define expected output and may not claim a pass.

| Command | Purpose | Status |
| --- | --- | --- |
| `pnpm typecheck` | strict TS gate (the #69 trap) | proposed |
| `pnpm test` | unit, component, regression traps (Vitest) | proposed |
| `pnpm test:e2e` | Playwright Chromium smoke incl. JS-disabled HTML | proposed |
| `pnpm test:a11y` | axe over pages and stories | proposed |
| `pnpm test:visual` | screenshot diff against baselines | proposed |
| gitleaks GitHub Action (or installed Go binary) running `gitleaks detect --redact` | secret scan of the repo | proposed |
| bundle secret grep (from Phase 04) | scan `dist/` for secret-shaped strings | proposed |
| `eas workflow:run .eas/workflows/e2e-test-android.yml --non-interactive --wait --json` | Maestro on Workflows (nightly) | proposed; form documented in research §1.8; budget- and credential-gated |

Positive tests: each suite green on main; report artifact published; traps assert honest behaviors (error surfaces, explicit unavailability, correct local dates).

Negative tests (the phase's core): the four red/green demonstrations of task 9 — broken error state, type error, canary secret, stale-HTML/OG regression — each must fail the correct gate step. A demonstration that fails the *wrong* step is itself a defect to fix before exit.

Deliberate-failure demonstrations are not extra credit here; they are the acceptance gate (master plan phase 05: "deliberately break a widget and demonstrate the CI fails in the correct place").

## Acceptance gate

> [!GATE] The gate fails on every planted failure class at the correct step, an agent can diagnose each failure from saved evidence alone, and no test is skipped outside the quarantine protocol.

Checklist (observable pass/fail):

- [ ] Four red/green demonstrations archived with failing and passing evidence
- [ ] Fast gate runs within the documented time budget on a typical PR
- [ ] Backend-down journey asserts visible error and time-to-useful (no spinner trap regressed)
- [ ] Timezone traps use a deterministic America/Belem clock; no test depends on wall time
- [ ] Fixtures contain zero legacy personal data or media (reviewer spot-check)
- [ ] Quarantine protocol written and approved; no test currently skipped without a label, issue link, and expiry
- [ ] Native E2E wired to nightly/RC, or a deferral recorded with the blocking reason (S13, budget, or credentials)
- [ ] Test report linked from a real PR alongside the preview URL
- [ ] Pending traps display as pending in the report; none displays as passed
- [ ] Quarantine list at RC is empty or every entry justified with an issue link
- [ ] Quality budgets doc approved by the human

Blocks progression if:

- Any planted failure passes the gate — CI evidence is untrustworthy and Phase 06's exclusion assertions (which depend on this gate) would be meaningless
- A regression trap asserts a mocked success instead of honest behavior — the legacy #62 failure mode, rebuilt as a test
- Visual or E2E flakiness exceeds the protocol's tolerance with no quarantine path — review velocity collapses
- Security scans are advisory-only (warn but not fail) — secrets ship (R5)

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| E2E/visual flakiness erodes trust | high | high | Web-first, deterministic harnesses, thresholds, quarantine with 7-day expiry; never auto-accept baseline updates |
| Maestro cost and flake on nightly (at $0.05/job plus minutes — research §1.8) | medium | medium | Nightly cadence, minimal flow set, S13 emulator comparison; stays inside D-08 ceiling |
| Trap scope creep into Phase 08 business logic | high | medium | Traps ship fixtures and pending markers, not implementations; reviewer enforces the boundary |
| Suites slow the gate past budget | medium | medium | Sharding, targeted runs by path, budgets doc tracks the number per PR |
| WebKit nightlies unstable in CI | medium | low | Nightly-only placement isolates it from PR flow; quarantine protocol applies |
| Quarantine abused to silence real failures | low | high | 7-day expiry auto-fails the run afterwards; human audits the quarantine list at every RC |

Sensitive operations needing human approval: deleting or skipping any test; relaxing a security scan to advisory; approving the flaky protocol and budgets; any real-device testing arrangements (later, at RC).

Budget impact: intended zero beyond Phase 04's pipeline; Maestro nightly jobs bill per research §1.8 rates inside the D-08 ceiling — record monthly actuals in `docs/pipeline/budget.md`.

Rollback: every suite is additive and independently disableable via config (not deletion). The red/green evidence PR is throwaway by design. Disabling a suite is a documented, reversible config change — never a `git rm`.

Restart instructions for an agent picking up mid-phase:

1. Read `docs/quality/budgets.md` and `flaky-protocol.md` first; they bind you
2. Check `packages/testing/regressions/` for existing traps before adding one; extend, do not duplicate
3. The task table above is the order; PRs 05-1 and 05-7 unblock the most
4. If a demonstration already exists in `red-green-demo.md`, do not redo it; verify and move on

## Next phase handoff

Phase 06 (widget contract and exclusion) needs from this phase:

- The fast-gate slot structure its exclusion assertions (compose checks, source-map greps) plug into
- The contract-test pattern widgets must satisfy before opting into a destination manifest
- The evidence/report template its negative assertions reuse
- Confidence that a gate pass means something — which is exactly what the red/green demonstrations bought

Records to hand over: trap index with statuses, fixture inventory, protocol and budgets docs, the red/green evidence, nightly job definitions, and any deferral with its blocking reason. Phase 08 activates pending traps rather than rewriting them — the index is the contract. This phase's prompt: [../prompts/phase-05-agent.md](../prompts/phase-05-agent.md). Next phase page: [phase-06.html](phase-06.html).
