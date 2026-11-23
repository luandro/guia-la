# S9 spike: Storybook "Both" mode on Expo SDK 58 (PR 03-1)

Date: 2026-11-22 · Verdict: **PASS — keep "Both"; no R10 fallback needed**
(compile-level on device, static-build level on web — boundaries below).

Question ([expo-stack.md §3 S9](../../../planning/research/expo-stack.md)):
do `@storybook/react-native` 10.x on device and
`@storybook/react-native-web-vite` 10.x on web work on this exact stack —
RN 0.88.1, React 19.3.0, Reanimated 4.7.1, Expo Router (SDK 58), pnpm 12
strict `node_modules`? Answer found by building it, not by reading docs.

## Versions (exact, from the lockfile)

| Package | Version | Note |
| --- | --- | --- |
| `@storybook/react-native` | 10.7.2 | latest dist-tag; peers RN >=0.72, reanimated >=3 (optional), gesture-handler >=2 (optional), bottom-sheet >=4 (optional, not installed) |
| `@storybook/react-native-web-vite` | 10.6.8 | latest dist-tag; peers vite ^5\|\|^6\|\|^7, RNW ^0.19.12\|\|^0.20\|\|^0.21 |
| `storybook` (core) | 10.6.8 | **core's latest 10.x is 10.6.8** — 10.7.x exists only for the RN family; peer `^10.5.4` satisfied |
| `@storybook/react` | 10.6.8 | CSF types for stories |
| `@storybook/addon-ondevice-controls` / `-actions` | 10.7.2 | device addons |
| `vite` | 7.3.8 | |
| react / react-dom | 19.3.0 | |
| react-native | 0.88.1 | |
| react-native-web | 0.21.4 | |
| expo / expo-router | ~58.0.26 / ~58.0.32 | |
| Node / pnpm | 22.22.3 / 12.8.1 | **Node 22, not 24** (engines want >=24.3): the sandbox exposes no Node 24 binary. Engine-strict is off; everything below ran on 22 |

Storybook 11 (`next: 11.0.0-beta.3` on both dist-tags) was **not** used.

Not `npm create storybook` (interactive, writes into the app): installed
manually, contained. Web runtime lives in a new workspace package
`apps/storybook`; stories live in `packages/ui`, colocated. The device
runtime necessarily touches `apps/app` (`.rnstorybook/`, `metro.config.js`,
one route) — that much was unavoidable.

## What runs where

- **Web**: `pnpm storybook:build` (root script) → `apps/storybook` →
  `storybook build --output-dir dist` on `@storybook/react-native-web-vite`.
- **Device**: `apps/app/metro.config.js` wraps Expo's default config with
  `withStorybook(config, { enabled: process.env.STORYBOOK_ENABLED === 'true' })`
  (README "Option 3: Expo Router (recommended for Expo)"): route
  `src/app/storybook.tsx` re-exports `.rnstorybook`, whose
  `storybook.requires.ts` is **generated at bundle time** (gitignored).
  Unset `STORYBOOK_ENABLED` → every Storybook module is replaced by a stub
  that renders "Storybook is disabled…".

## Commands, exit codes, errors (verbatim where short)

Web build attempts (all `pnpm --filter @guia-la/storybook storybook:build`):

1. Install with `storybook@10.7.2` → **exit 1**,
   `No matching version found for storybook@10.7.2 … The latest release of storybook is "10.6.8".`
   (dist-tags misread from registry output; core 10.x tops at 10.6.8.)
2. Build, stories glob `../../packages/ui/src/**` → **exit 0**, but
   `▲ No story files found for the specified pattern: ../packages/ui/src/**/*.stories.tsx`
   — globs resolve from the **config dir** (`.storybook/`), not the package
   root; my level count was one short.
3. Glob `../packages/ui/src/**` → same warning, **exit 0**, empty build
   (second lesson of the same class).
4. Glob `../../../packages/ui/src/**` (correct) → **exit 1**,
   `[vite]: Rollup failed to resolve import "react/jsx-runtime" from "…/packages/ui/src/components/Text.tsx".`
   — `packages/ui` did not declare `react`/`react-native`; pnpm's strict
   layout means Vite cannot resolve them from a package that lacks them.
5. After declaring `react`/`react-native` (+ `@storybook/react`,
   `@types/react` as devDeps) → **exit 1**,
   `[vite:load-fallback] Could not load react-native-web (imported by …/Text.tsx): ENOENT`
   — the framework's `react-native → react-native-web` alias resolves from
   the **importing** package; fixed by declaring `react-native-web@0.21.4`
   as a peer (true statement: web consumers must supply RNW).
6. Final build → **exit 0**. Vite 7.3.8, ~10 s, one warning about chunk
   size (>500 kB iframe bundle — expected for RNW).

Install-side error: `Error: ERR_PNPM_IGNORED_BUILDS × Ignored build scripts:
esbuild@0.28.2` — pnpm 12 blocks lifecycle scripts until allowlisted;
`pnpm approve-builds esbuild -y` wrote `allowBuilds: esbuild: true` into
`pnpm-workspace.yaml` (it rewrote a hand-added `onlyBuiltDependencies`
block; esbuild's postinstall only validates the prebuilt `@esbuild/*`
binary — vitest had already run on it before the allowlist existed).

Web verification (python http.server on the built `dist/`):

```
GET /            -> 200 (2955 bytes)
GET /index.json  -> 200 (329 bytes)
GET /iframe.html -> 200 (18601 bytes)
story served: Primitives/Text / Basic
```

`dist/index.json` entry `primitives-text--basic` points at
`../../packages/ui/src/components/Text.stories.tsx`, and the fixture text
is bundled in `dist/assets/Text.stories-*.js`.

Device (no emulator booted, per brief; compile-level proof via export):

7. `pnpm --filter app run export:android:storybook`
   (`STORYBOOK_ENABLED=true expo export -p android`) → **exit 0**:
   `Android Bundled 87438ms … (2721 modules)`, hermes bundle
   `entry-9205ffa….hbc` **8.4 MB**. Bundle grep: `"Sphinx of black quartz"`
   1 hit, `"Primitives/Text"` 1 hit — the story and Storybook UI are in the
   on-device bundle; ondevice-controls assets appear in the export asset
   list.
8. `pnpm --filter app run export:android` (variable unset) → **exit 0**,
   bundle **3.7 MB** (−4.7 MB). Grep: story strings **0** hits;
   `"Storybook is disabled"` 1 hit (the stub). Zero Storybook code leaks
   into a normal build, exactly as the README claims.
9. `pnpm s1` (web export, variable unset) → **exit 0**:
   `s1-assert: OK — 49 journey pages … 54 HTML files total`; web JS bundle
   grep: `"Primitives/Text"` 0, stub 1.

Gates after the change: `pnpm check` → **exit 0** (format, lint, typecheck
×6 packages, i18n ×6 locales, 107 tests); `./scripts/check.sh` →
`check: OK`. Two fixes were needed on the way:
`error TS18003: No inputs were found in config file 'apps/storybook/tsconfig.json'`
(a dot-directory `include` needs `".storybook/**/*"`), and one transient
`apps/app typecheck: Failed — Command failed with exit code signal SIGKILL`
(OOM under parallel `tsc` runs right after the metro export; deterministic
pass on rerun — watch for recurrence). The generated
`storybook.requires.ts` produced one lint warning
(`@typescript-eslint/no-require-imports`); scoped out in
`eslint.config.js` like the existing `reset-project.js` precedent — the
gate itself is untouched.

## What was NOT proven (honest boundaries)

- The story was never **rendered on a device screen** — no emulator was
  booted (memory constraint). Proven: the device bundle compiles with
  Storybook enabled and contains the story. First real render happens in
  Phase 03 QA (journey 5) or with the Phase 04 dev build.
- The web build was verified by build output + HTTP, not by a browser
  rendering the iframe. Story test-runner/axe arrives with phase tasks
  7–9.
- Only a trivial Text primitive was exercised. Expo Router/expo-* module
  transpilation **under Vite** (the other half of S9's wording) is not
  tested by this story; it first matters when app screens become stories
  (Phase 03 tasks 5–7). Web story imports stay inside `packages/ui`
  (react + react-native only) by phase rule anyway.

## Recommendation

**Keep "Both".** Web runtime (`apps/storybook`) and device runtime
(`.rnstorybook` + route + metro wrapper) share one CSF file set in
`packages/ui`. The R10 fallback (web-only + `/gallery` dev route) stays
recorded as the contingency, not adopted.

Rules that fell out of the spike (for later PRs in this phase):

- A story-holding package must declare `react`, `react-native`, and (for
  web consumers) `react-native-web` as peers — pnpm + Vite resolve from
  the importer, not the Storybook app.
- Story globs resolve from the config dir (`.storybook/` and
  `.rnstorybook/`): `../../../packages/ui/src/**/*.stories.tsx` from both.
- `storybook.requires.ts` is generated, gitignored, and excluded from tsc
  root inputs + eslint.

## Proposed CI step (NOT added — workflows are governance)

When a PR touches `packages/ui/**`, `apps/storybook/**` or
`apps/app/.rnstorybook/**`: run `pnpm storybook:build` and
`pnpm --filter app run export:android:storybook` (compile guard, ~2 min).
Add `storybook test` (test-runner + axe) when phase task 8 wires it.

## Sources

- npm registry metadata (versions, peer ranges, dist-tags), queried
  2026-11-22 via `npm view` / `npm dist-tag` — recorded above.
- Installed package sources (the actual authority for what ran):
  `apps/app/node_modules/@storybook/react-native/readme.md` (v10.7.2 —
  Expo Router route setup "recommended for Expo", `enabled` semantics),
  `…/dist/metro/withStorybook.js` (options + stub behavior),
  `…/template/cli/` (`.rnstorybook` config shape).
- Storybook RN Expo Router docs (context; behavior verified against the
  installed package instead):
  <https://storybookjs.github.io/react-native/docs/intro/getting-started/expo-router>
- Spike origin and fallback: [expo-stack.md](../../../planning/research/expo-stack.md)
  §1.7, §3 (S9), §4; [phase-03.md](../../../planning/src/phases/phase-03.md)
  task 1 and R10.

## Orchestrator review fix: no dev route in production (2026-11-23)

The first build leaked the on-device route into the production web export: `dist/storybook.html` rendered an untranslated "Storybook is disabled" stub, which broke D-14 and was public. Fixed test-first:
- **Red:** `scripts/s1-assert.sh` now fails if a dev-only route (`storybook.html`) is in the export. `pnpm s1` → `[ELIFECYCLE] Command failed with exit code 1.`
- **Green:** `apps/app/metro.config.js` blocklists `src/app/storybook.tsx` unless `STORYBOOK_ENABLED=true`, so Expo Router never discovers the route. Now `pnpm s1` → `s1-assert: OK … 53 HTML files` (no storybook page), and `export:android:storybook` still exports.
