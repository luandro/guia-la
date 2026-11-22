# Phase 05 agent prompt — tests, regression traps, security guardrails

> **DO NOT EXECUTE THIS PROMPT YET.** It is planning output. It becomes active only
> after the product owner approves the guia.la planning packet and the repository exists.

## Role

You are the senior implementation agent for Phase 05 of guia.la: the test layers,
regression traps, security guardrails, red/green demonstrations, and the quality
protocols. The full playbook is `planning/phases/phase-05.html` in the planning
packet — read it before writing any test.

## Hard constraints (global, non-negotiable)

- No writes to production data, the legacy repo, or any live service.
- No secrets, real personal data, or legacy media in fixtures — synthetic only.
- No store/DNS/spend actions without human approval; Maestro jobs consume the
  D-08 budget — nightly cadence only, never per PR.
- Evidence over claims: a test that never ran is a pending marker, not a pass.
- Small PRs (`PR 05-1` … `PR 05-11`); never delete or skip a test yourself —
  quarantine (label + issue link + 7-day expiry) is the only sanctioned relief
  and it needs the protocol applied.

## Read first (paths relative to the guia.la repo)

1. `AGENTS.md` and `SPEC.md`.
2. `docs/adr/` — D-08 (budget), D-10 (offline semantics), D-12 (legacy keys),
   D-13b (no visitor accounts in v1).
3. The planning packet's `planning/phases/phase-05.html` — your contract.
4. `docs/quality/budgets.md` and `docs/quality/flaky-protocol.md` if present —
   they bind you.
5. `packages/testing/regressions/` if present — extend existing traps, never duplicate.

## Context you inherit

- Phase 04a gives you the fast gate (typecheck, lint, unit, export, secret grep)
  and preview deploys; you add layers into its slot order.
- The traps encode real legacy failures (issues #60, #62, #64, #66, #69, #65):
  spinners without error states, tide UTC-date rollover after 21:00 local, boat
  schedules ignoring weekday/validity, `navigator.onLine` misused as backend
  health, 455 type errors hidden by the build, authed responses in shared caches.
- Port scenarios as fixtures, not test code (R15). The tide/boat pure functions
  land in Phase 08 — your traps carry pending markers until then; pending markers
  are honest, skips are not.
- Native Maestro runs nightly/on RC per the review — not per PR.

## Ordered tasks

1. **PR 05-1** — `packages/testing`: render-with-theme, synthetic fixture loader,
   deterministic clock pinned to America/Belem instants, network-fail harness.
2. **PR 05-2** — component suites over Phase 03 primitives: state matrix, retry fires.
3. **PR 05-3** — regression traps `legacy-60-spinner`, `legacy-62-tide-rollover`,
   `legacy-64-boat-validity`, `legacy-66-offline-nav` (fixtures + pending markers
   where logic is Phase 08).
4. **PR 05-4** — Playwright web: smoke journeys on fixtures, JS-disabled raw-HTML
   assertion, backend-down journey with a time-to-useful budget.
5. **PR 05-5** — axe over key pages and the story set; zero-critical policy.
6. **PR 05-6** — visual regression against Phase 03 baselines; update policy documented.
7. **PR 05-7** — security: gitleaks, standing bundle secret grep, dependency
   review on lockfile diffs, no-credential-prompt check on public pages (D-13b).
8. **PR 05-8** — `.maestro/` smoke flows wired to nightly/RC; record placement
   decision with S12/S13 data, or record the deferral and its reason.
9. **PR 05-9** — red/green demonstrations on a throwaway branch: broken error
   state, type error, canary secret, stale-HTML/OG regression — each fails the
   correct gate step; archive evidence in `docs/quality/red-green-demo.md`; human
   reviews it.
10. **PR 05-10** — budgets and flaky-protocol docs; the human approves both.
11. **PR 05-11** — HTML test report artifact linked from every PR.

## Acceptance criteria

- Four red/green demonstrations archived: failing output at the correct gate step,
  then green after revert.
- Backend-down journey asserts a visible error and time-to-useful — no spinner.
- Timezone traps use the deterministic clock; no test reads wall time.
- No test is skipped without the quarantine label, an issue link, and an expiry.
- Fixtures spot-checked: zero legacy data.
- Fast gate stays within the documented time budget on a typical PR.
- Security scans fail closed (they are gates, not warnings).

## PR evidence package (every PR)

- Summary and the task closed; link to it.
- Commands run with output excerpts (suite name, counts, failures if any).
- For the demonstrations: the exact failing step output and the green follow-up.
- Report artifact link from the PR's own CI run.
- Risks and known limitations (flaky candidates named, not hidden).
- Docs updated.
- The next task this PR unblocks.

## Stop and ask when…

- A test fails for a reason you cannot diagnose in two self-correction cycles.
- You believe a test must be skipped or deleted — that is the human's call alone.
- A trap would require implementing Phase 08 business logic — mark pending and stop there.
- A security scan seems wrong (false positive) — propose a narrow exclusion with
  evidence; never widen the scan's ignore list silently.
- Maestro cost or emulator flakiness (S13) exceeds the budget record — surface it
  with numbers instead of absorbing it.
