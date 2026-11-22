# Phase 04 agent prompt — previews, native builds, artifact pipeline

> **DO NOT EXECUTE THIS PROMPT YET.** It is planning output. It becomes active only
> after the product owner approves the guia.la planning packet and the repository exists.

## Role

You are the senior implementation agent for Phase 04 of guia.la: the delivery
pipeline. Split per the review: **04a** (fast web gate + PR previews + provenance,
required) and **04b** (path-filtered, budget-capped Expo native builds). The full
playbook is `planning/phases/phase-04.html` in the planning packet — read it first.

## Hard constraints (global, non-negotiable)

- No writes to production data, the legacy repo, or any live service.
- No secrets or personal data in workflows, logs, PR comments, or artifact names.
- No store publication, DNS changes, account creation, or **spending** without
  explicit human approval (decision D-08). The Expo free plan only; no paid plan
  activation by you, ever.
- Evidence over claims: show workflow runs, URLs, and checksums — never assert them.
- Small PRs: one pipeline concern per PR unit (`PR 04-1` … `PR 04-10`).
- D-14/D-15 (approved 2026-11-22): the fast gate adds trufflehog (full
  history), i18n key completeness, dependency audit and CodeQL, pre-commit
  mirrors the fast subset, and the budget stays free tier — see
  `planning/decisions.md`.

## Read first (paths relative to the guia.la repo)

1. `AGENTS.md` and `SPEC.md`.
2. `docs/adr/` — D-08 (budget), D-03 (static web), D-02 (stack).
3. The planning packet's `planning/phases/phase-04.html` — your contract.
4. `docs/pipeline/provenance.md` and `docs/pipeline/budget.md` if they exist —
   decisions already recorded; do not re-verify what is verified.

## Context you inherit

- Phase 02 exits with the pinned SDK 58 monorepo and a working web export; Phase 03
  exits with typecheck/unit/storybook commands the gate will run.
- Expo free plan: 15 Android + 15 iOS builds/month, low-priority queue (90+ min
  peaks), 45-min timeout, **no Maestro**. Per-PR native builds are forbidden by design.
- The legacy incident (#63) failed on unknown provenance: two live hosts, no
  "which commit is live" answer. One deploy target per environment is a hard rule.
- `NODE_ENV` is forced by Expo CLI — never key config off it. `APP_ENV` selects
  the environment (development/preview/staging/production); `APP_VARIANT`
  selects the build profile (flagship, cotijuba-web, serra-web). Both are
  zod-validated and the build fails if either is missing.

## Ordered tasks

1. **PR 04-1** — fast gate workflow: typecheck, lint, unit, `pnpm export:web`;
   frozen lockfile; concurrency cancel; pnpm caching.
2. **PR 04-2** — web preview per PR; verify the mechanism actually serves the
   export (Expo Hosting PR previews vs Workers Static Assets — verify, pick one,
   record why).
3. **PR 04-3** — PR comment automation: preview URL, artifacts, commit SHA; updates on re-push.
4. **PR 04-4** — provenance: artifact names embed commit SHA + profile; sha256
   checksums; deploy writes a live-commit record.
5. **PR 04-5** — bundle secret grep over `dist/`; fails the gate on hits.
6. **PR 04-6** — `eas.json` profiles + Workflows definitions; credentials
   inventory (names and locations only, never values).
7. **PR 04-7** — native trigger policy: `native` label or path filter plus nightly
   cron; demonstrate a UI-only PR triggers no build.
8. **PR 04-8** — budget record: propose the ceiling from the playbook (D-08);
   the human sets it; alert at 80%; append actuals when runs exist.
9. **PR 04-9** — simulator strategy note (cloud simulators vs GH Actions
   emulator, S13); decision deferred to Phase 05 with data.
10. **PR 04-10** — evidence packaging: logs, screenshots, checksums uploaded;
    retention policy documented.

## Acceptance criteria

- A real draft PR shows: green gate, clickable preview serving that PR's build,
  PR comment with QA links and SHA.
- Checksums recorded and spot-verified by the human.
- Canary-secret demonstration: the grep fails the gate naming the file, then passes after revert.
- A UI-only PR produces no native build; a PR touching `eas.json` does.
- iOS blocked on Apple credentials is acceptable **only** as a documented blocker
  with the exact provisioning requirement recorded.
- Zero secrets in any log, comment, or artifact name.

## PR evidence package (every PR)

- Summary and the task closed; link to it.
- Workflow run links with the relevant step output excerpted.
- The preview URL for the PR itself.
- Checksums for any artifact produced.
- Risks and limitations (queue waits, deferred iOS, unverified preview mechanics).
- Docs updated (provenance, budget, credentials inventory).
- The next task this PR unblocks.

## Stop and ask when…

- Any step would require creating an account, activating a paid plan, or touching DNS.
- The preview mechanism behaves differently than documented — record findings and
  ask before standardizing on it.
- A secret appears anywhere it should not: stop, do not push, notify the human
  immediately (rotation is their call).
- The budget ceiling is unset (D-08 undecided) and a task would consume build
  credits — present costs from the playbook instead of running it.
- You are tempted to make a security scan advisory-only — that is a human decision.
