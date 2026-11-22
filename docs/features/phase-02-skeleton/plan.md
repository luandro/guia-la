# Plan: Phase 02 walking skeleton — Places list/detail journey

- **Files that change:**
  - `packages/core/src/{content.ts,domain.ts,index.ts}` + tests — types, zod
    schemas, `resolveContent`.
  - `packages/fixtures/src/{loader.ts,index.ts}` + tests — `loadDestination`.
  - `tools/i18n-check/{i18n-check.mjs,package.json}` + test; root
    `package.json` scripts (`i18n:check`, `export:web`, `s1`).
  - `apps/app/src/i18n/` — provider, instance factory, six catalogs.
  - `apps/app/src/config/env.ts` — zod schemas + variant→destination map.
  - `apps/app/app.config.ts` (replaces `app.json`); `apps/app/eas.json`.
  - `apps/app/src/app/` — `index.tsx`, `[locale]/places/index.tsx`,
    `[locale]/places/[slug].tsx`, `+not-found.tsx`, `_layout.tsx` simplified;
    template demo screens/components removed.
  - `apps/app/src/state/journey.ts` — pure states reducer + tests.
  - `scripts/s1-assert.sh`; `docs/features/phase-02-skeleton/{i18n-spike,s1-result}.md`.
- **Order of work:** (D-15: failing test first for each behavior, red run
  quoted, then green.)
  1. 02-8 core schemas + `resolveContent` (red → green), fixtures
     `loadDestination` (red → green).
  2. 02-6 i18n spike (evaluation + minimal real trial), wire catalogs +
     provider, `tools/i18n-check` (red → green), root scripts.
  3. 02-7 `env.ts` (red → green for the pure mapping), `app.config.ts`,
     root `export:web`.
  4. 02-9 states reducer (red → green), routes + metadata + not-found +
     markers; remove template demo screens.
  5. 02-10 `export:web` → `scripts/s1-assert.sh` → measurements (2 runs) →
     curl check via `npx serve` → `s1-result.md`.
  6. 02-11 deliberate failures (a/b/c), evidence to scratchpad, revert each.
  7. 02-13 `eas.json` (files only).
- **Decisions recorded:**
  - **asyncRoutes: keep the SDK 58 default (enabled on web).** Each route is
    its own JS chunk, which keeps the per-page JS small across the ×6 locale
    tree; static export supports it. Fallback if the export misbehaves:
    `experiments.asyncRoutes.web: false` and re-export.
  - **i18n library: decided by the spike** — verdict and sources in
    [i18n-spike.md](i18n-spike.md).
  - **Offline hint: `navigator.onLine` on web, treated as online on native.**
    Fixture data is bundled, so offline never gates the journey; the hint is
    freshness-only and no new native dependency is added for it.
  - **Destination selection:** `app.config.ts` computes `destinationId` from
    `APP_VARIANT` at config time and publishes it through `expo.extra`;
    runtime code zod-validates `Constants.expoConfig.extra`. No
    `EXPO_PUBLIC_*` vars exist (SPEC.md: nothing to expose yet).
  - **PR #14 review fixes (02-12 follow-up):**
    - **hreflang cluster**: list pages pin `x-default` to `/` (the language
      picker) and `/` lists them back with no `x-default` of its own; detail
      pages pin `x-default` to the destination default-locale page (pt-BR
      today). `s1-assert` gained `scripts/s1-cluster-check.mjs`, which
      proves reciprocity, OG-form `og:locale` values, per-locale
      `<html lang>`, and full list→detail links on every export.
    - **`+html.tsx`**: custom static HTML shell (default Expo shell
      hard-codes `lang="en"`); sets `lang` from the route pathname.
    - **List rendering**: plain `ScrollView` + map, not `FlatList` —
      virtualization dropped detail links beyond the initial 10-row window
      from the raw HTML (proved with an 11-place fixture probe).
    - **`useDestination`**: load attempt extracted into
      `startJourneyAttempt` (fake-timer tested: deadline, cancellation,
      retry re-run).
    - **`i18n-check` CLI**: main-module detection via
      `pathToFileURL(realpathSync(argv[1]))` — the hand-built `file://` URL
      skipped all checks when the script path was a symlink.
    - **`expo-localization` config plugin removed** from `app.config.ts`:
      nothing imports the module and reading device locales needs no
      plugin; re-add only when code depends on the native localization
      metadata it pins.
- **Tests that prove it:** core `resolveContent` (exact locale, fallback
  marking, machineTranslated carry-through); fixtures loader (ok parse, error
  on malformed JSON/schema, no throw); i18n-check (missing key, extra key,
  happy path); env mapping (variant→destination, invalid variant); journey
  reducer (pending→loaded, deadline→error, empty, retry resets, offline
  hint); `pnpm i18n:check`; `scripts/s1-assert.sh` over `dist/`; deliberate
  failures (a)(b)(c) prove the gates can fail.
- **Risks and the riskiest step:** S1 itself — if `generateMetadata` does not
  emit `og:`/hreflang into raw static HTML, D-03's fallback discussion
  triggers. Second risk: Metro bundling of workspace TS + JSON in the app
  (watchFolders/babel coverage) — mitigated by consuming packages via their
  `src/` entry (no build step) which Expo's monorepo support handles.
- **Rejected options:** Lingui (see spike); `<Head>` component (not in SDK 58
  static HTML); per-destination env files keyed on NODE_ENV (SDK 58 forces
  NODE_ENV — use APP_VARIANT); second journey (tides/boats) — out of scope.
