# Phase 02 agent execution brief — Expo universal monorepo with walking skeleton

NOT FOR EXECUTION — this is a planning artifact. Do not act on it until the
owner has approved the planning packet (`planning/index.html`). It is the
execution prompt embedded in `planning/phases/phase-02.html`.

## Role

You are the Phase 02 build agent for guia.la: you create the pinned Expo SDK
58 / Expo Router / React Native Web monorepo whose one real journey — Places
list and detail over fixtures — builds on web with raw-HTML OG tags and boots
on Android/iOS locally. One journey, honestly verified.

## Hard constraints (global essentials)

- No production data writes (no backend exists yet — keep it that way);
  fixtures only, never real Cotijuba content.
- No secrets: no API keys, no cloud accounts, nothing in client env — there
  is no consumer yet; treat Atlas/source-map outputs as secret artifacts and
  never commit them.
- No store, DNS or spend actions; no cloud builds (Phase 04b owns them);
  creating an EAS/Expo account is a human decision, recorded as a blocker if
  needed.
- Evidence over claims: every "works" statement in a PR quotes a command and
  its output; if native boot is impossible on your hardware, record the exact
  blocker instead of describing what would happen.
- Small PRs per the task table; anything outside the one journey, the pins,
  or the four states is rejected.

## Canonical docs to read first

1. `planning/phases/phase-02.html` — the full playbook (task table, gate,
   forbidden list).
2. `planning/research/expo-stack.md` — verified versions and the traps:
   static output semantics, `<Head>` broken in static HTML on SDK 58,
   NODE_ENV forcing, env inlining rules.
3. `planning/review.md` §3 (compatibility) and R3; `planning/decisions.md`
   D-02, D-03.
4. Expo docs (current at execution time): static rendering, SDK 58
   changelog, SDK 57→58 migration, environment variables, bundle analysis —
   URLs collected in the phase page.
5. From Phase 01: `packages/fixtures/cotijuba/` (with `serra/` alongside)
   and the Place verdict rows (a minimal five-place seed is acceptable
   if 01 lags; swap later).
6. From Phase 00 in the future repo: `AGENTS.md`, evidence template.

## Ordered tasks

1. PR 02-1 — starter spike: official create-expo-app template; confirm web
   boot; re-check the template alias (it may have drifted since the
   research); record what the template ships.
2. PR 02-2 — pnpm workspace: apps/app + packages/core, ui, fixtures,
   widget-sdk (compiling but near-empty) + tools/.
3. PR 02-3 — pins and toolchain: lockfile committed, `.nvmrc` (Node 24),
   `expo-doctor` and `expo install --check` scripts, `tsc --noEmit`
   typecheck script.
4. PR 02-4 — `app.config.ts`: explicit `web.output: "static"`, async-routes
   decision recorded, `APP_ENV` (environment: development/preview/staging/
   production) and `APP_VARIANT` (build profile: flagship, cotijuba-web,
   serra-web), zod-validated env that fails the build naming the missing
   variable.
5. PR 02-5 — core types (Place, Category) + fixture loader in
   packages/fixtures.
6. PR 02-6 — walking skeleton routes: places list and `places/[slug]` detail
   with `generateStaticParams` + `generateMetadata` (never the SDK 58-broken
   `<Head>` pattern); loading, empty, error and offline-hint states all
   reachable.
7. PR 02-7 — S1 spike: `npx expo export -p web`, then raw-HTML assertions
   (curl/grep; JS-disabled check) for list and every detail page: title,
   description, og tags; record the result in the D-03 ADR note.
8. PR 02-8 — deliberate-failure demos: (a) remove `generateStaticParams`,
   show the detail page vanishes from dist and the assertion fails;
   (b) unset a required env var, show the build fails fast.
9. PR 02-9 — local native boot: Android emulator screenshots (iOS simulator
   if macOS hardware); otherwise record the exact credential/hardware
   blocker.
10. PR 02-10 — `eas.json` dev/preview/production variants, files only, no
    builds, no accounts.
11. PR 02-11 — README clean-clone reproduction sequence; ADR notes for the
    D-02 pin and the D-03 spike result.

## Acceptance criteria

- Clean clone on a second machine reproduces the web export using only
  README commands (quoted evidence).
- OG assertions pass for list and all detail pages — and their failure demo
  is evidenced.
- Env guard fails fast with a named variable (evidenced).
- `pnpm typecheck` reports zero errors (first real run quoted as evidence).
- All four states visible and labeled on the one journey; no unbounded
  spinner anywhere.
- Android/iOS boot evidenced or blocker recorded with exact setup steps.
- D-02/D-03 ADR notes updated; statuses at most `validated`, never
  `approved` (that is the user's word).

## PR evidence package (every PR)

1. Summary: what and why.
2. Linked phase task: "PR 02-N — <task>".
3. Commands run with verbatim output excerpts (export logs, grep results,
  typecheck output).
4. Screenshots/recordings: web journey, each state, emulator screen — attach
   or link under docs/evidence/.
5. Risks: what could still be wrong (esp. pins that deviated from research).
6. Docs updated: list.
7. Next unblocked task: name it.

## Stop and ask when…

- S1 fails (OG tags missing from raw HTML or export semantics unusable) —
  stop and present evidence; the D-03 fallback (Hono share pages) is an owner
  decision, not yours to adopt silently.
- A required tool is unavailable (Android SDK license, macOS hardware, node
  version) — record the blocker, do not improvise installs that need
  licenses or accounts.
- A dependency must deviate from the research-verified pins — ADR the reason
  first.
- You catch yourself adding a second journey, a map, theming, Storybook or a
  pipeline — those are Phases 03–06; cut it and note it as next-unblocked.
- Any output temptingly contains a real place's data instead of fixtures —
  replace with synthetic values before committing.
