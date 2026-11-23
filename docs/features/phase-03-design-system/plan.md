# Plan: token layer + theme engine (phase 03 tasks 3–4)

Spec: [spec.md](spec.md). Runs in worktree `phase-03-tokens`; two PR units
(03-3 tokens, 03-4 theme engine) landing from this branch in order.
Tasks 5–6 (primitives) run in worktree `phase-03-primitives` as PR #19 —
see the section at the end.

## Files

New (`packages/ui`):

| File | Content |
| --- | --- |
| `src/tokens/types.ts` | role/step const arrays + TypeScript token contract (`ColorRole`, `TypographyToken`, `ThemeTokens`, `ThemeMode`, `ModeSetting`, …) |
| `src/tokens/contrast.ts` | `contrastRatio()`, `relativeLuminance()`, hex parser, `WCAG_AA_TEXT` |
| `src/tokens/schema.ts` | zod schemas for hex, color sets, scales, presets; `parseThemePreset()` |
| `src/theme/presets.ts` | `cotijuba`, `serra`, registry, `defaultPreset` |
| `src/theme/resolve.ts` | `resolveMode`, `resolvePreset` (warn-once fallback), `selectTokens` |
| `src/theme/ThemeProvider.tsx` | context + `ThemeProvider` + `useTheme` |
| `src/tokens/Tokens.stories.tsx` | swatch/scale sheet story per preset × mode + interactive args |
| tests: `src/tokens/contrast.test.ts`, `src/tokens/schema.test.ts`, `src/theme/theme.test.ts` | see below |

Changed:

| File | Change |
| --- | --- |
| `packages/ui/src/index.ts` | export tokens, theme, Text (replaces `export {}`) |
| `packages/ui/src/components/Text.tsx` | default color from `useTheme()` tokens (explicit style still wins) |
| `packages/ui/src/components/Text.stories.tsx` | stories under both presets × both modes + provider-less default |
| `packages/ui/package.json` | add `zod` dependency |
| `apps/app/package.json` | add `@guia-la/ui` workspace dependency |
| `apps/app/src/app/_layout.tsx` | nest `@guia-la/ui` `ThemeProvider` (preset from `expo.extra.destinationId`, mode `system`) |
| `pnpm-lock.yaml` | via `pnpm install` |

## Order (TDD)

1. Red: `contrast.test.ts` (known WCAG values) → implement `contrast.ts` → green.
2. Red: `schema.test.ts` (missing role / bad hex / unknown key rejected; presets accepted) → implement `types.ts` + `schema.ts` → green.
3. Red: `theme.test.ts` (role coverage both modes; AA ratios per preset × mode; resolve functions; warn-once fallback) → implement `presets.ts` + `resolve.ts` → green.
4. `ThemeProvider.tsx` + `index.ts` exports (typecheck-proven; provider logic is the already-tested pure functions plus `useState`/`useMemo` wiring).
5. Stories (Tokens sheet; Text under presets/modes), `Text.tsx` token default.
6. App wiring (`_layout.tsx`, package deps) + `pnpm install`.
7. Full gates: `pnpm check`, `./scripts/check.sh`, `pnpm s1`, `pnpm storybook:build`.

Red and green runs are appended to the orchestrator scratchpad log
(`p03-34-tdd.txt`), quoted in the PR evidence per docs/evidence/PR-EVIDENCE.md.

## Risks

- **Zod record semantics** (v4 exhaustiveness of `z.record(z.enum(…), …)`):
  pinned by the explicit "rejects a missing role" test; if the installed
  zod disagrees, fall back to a strict object schema built from the role
  arrays.
- **Metro resolving `react-native` from `packages/ui`** (first RN import
  inside a workspace package consumed by the app): same layout already
  proven by Vite (S9) and by `@guia-la/core` under metro; `pnpm s1` is the
  gate that proves it. If it fails, the fix is metro/watchfolder config,
  not a token change.
- **Contrast floor vs palette taste**: initial values were picked to pass
  with headroom (≥ 5.3:1 for the muted pairs; ≥ 6.6:1 for `onPrimary`);
  owner tuning must keep the tests green — they are the guardrail, not the
  taste.
- **App bundle size**: `ThemeProvider` adds zod to the app graph via
  `@guia-la/ui`. The app already depends on zod directly (config validation),
  so no new top-level dependency enters the bundle — but the shared import
  must not drift versions (both `^4.6.7`).

## Deferred (recorded decisions)

- **`ThemedText`/`Screen` migration to `useTheme`**: deliberately **not** in
  these PRs. `Screen` takes its background from expo-router's theme while
  `ThemedText` takes its color from the same source; migrating only
  `ThemedText` would split the palette source across two systems inside one
  screen. Batch-1 PR (03-5) migrates `Screen`, `ThemedText` and the
  journey UI to `@guia-la/ui` tokens in one cut-over, when the real
  primitives exist.
- Elevation-on-iOS shadow triples (see spec open questions — resolved by
  task 5's `elevation.ts`; the spec entry is struck through).

## Tasks 5–6: primitives batches 1+2 (PR #19)

Spec updates for the vocabulary and floors live in [spec.md](spec.md);
this section records what the primitives PR changed, in what order, and
why it landed as one unit. Worktree `phase-03-primitives`.

### Files

New (`packages/ui/src/components/`), batch 1 (task 5): `Button.tsx` +
`buttonStyles(.test).ts`, `Card.tsx`, `Chip.tsx` + `chipStyles(.test).ts`,
`Heading.tsx` + `textStyles(.test).ts`, `ListRow.tsx`, `Text.tsx`
(token default), `elevation(.test).ts`, `hitSlop(.test).ts`,
`story-frame.tsx`, and one `.stories.tsx` per primitive.

New, batch 2 (task 6): `EmptyState.tsx`, `ErrorState.tsx`,
`MapPlaceholder.tsx`, `OfflineBanner.tsx`, `Skeleton.tsx` +
`useReduceMotionPreference.ts` + `reduceMotionStore(.test).ts` (added in
review round 1), `TextInput.tsx` + `fieldStyles(.test).ts`, plus stories.

Changed: `packages/ui/src/index.ts` (primitive exports),
`packages/ui/src/tokens/types.ts` (`shadow` role — thirteenth),
`packages/ui/src/theme/presets.ts` (shadow value; border values raised to
the 1.4.11 floor in review round 2), `apps/app` journey UI cut over to
`@guia-la/ui` tokens (`_layout.tsx`, `index.tsx`, places list/detail,
`journey-ui.tsx`, `not-found-view.tsx`, `screen.tsx`; `themed-text.tsx`
deleted; `navigation-theme(.test).ts` added), `tools/brand-colors-check/`
(gate + its own test file), `package.json` / `scripts/` wiring.

### Order

1. Pure style resolution first with tests: `buttonStyles`, `chipStyles`,
   `textStyles`, `elevation`, `hitSlop` (red → green each).
2. Batch 1 components + stories over those pure functions.
3. `fieldStyles` tests → batch 2 components + stories.
4. App cut-over in one move (no half-migrated palette source).
5. Brand-color gate last — it guards the finished surface.
6. Review rounds: round 1 added the shared reduce-motion store,
   navigation theme, `shadow` role; round 2 (this change) widened the
   gate to `packages/ui/src` + JSX attribute colors, raised the idle
   border to ≥ 3:1 (WCAG 1.4.11), and fixed Chip hitSlop, TextInput
   helper wiring and the reduce-motion ordering — red/green runs in the
   orchestrator's `p19c-tdd.txt`.

### Tests that prove it

Every style mapping is a pure function with per-preset × per-mode unit
tests (button/chip/text/elevation/hitSlop/field styles); contrast is
asserted with the tested `contrastRatio()` (AA text floor; idle border ≥
3:1 against surface and background). The gate has its own contract test
file, including a failable exclusion test and JSX attribute forms.

### Why one PR for tasks 5+6

Batch 2 builds directly on batch 1's scaffolding (`elevation`,
`hitSlop`, `fieldStyles` reuse the same pure-function pattern), the app
cut-over only makes sense once both batches exist — replacing
`Screen`/`ThemedText`/journey UI with a half-set of primitives would
split the palette source across two systems inside one screen (the exact
deferral recorded above) — and the brand-color gate is only enforceable
when the full primitive surface it scans exists.

## Pending owner sign-off

- [ ] Visual sign-off of the `cotijuba` preset (light and dark).
- [ ] Visual sign-off of the `serra` preset (light and dark) — synthetic
  palette, expected to be tuned.
- [ ] The thirteen-role semantic color vocabulary itself — `background`,
  `surface`, `text`, `textMuted`, `primary`, `onPrimary`, `accent`,
  `border`, `danger`, `success`, `warning`, `focus`, `shadow` (the
  `shadow` role was added with the primitives, task 5, and is
  mode-independent in the shipped presets; renaming a role later is a
  breaking change across all consumers).

The agent reports measured contrast ratios per preset and mode; aesthetics
remain with the owner per phase-03.md.

## Tasks 7–8: state-matrix stories + accessibility pass (PR 03-7 / 03-8)

Spec: [spec.md](spec.md). Runs in worktree `phase-03-states`, stacked on
PR #19. Two task units, one branch. The S9 runtime ("Both" mode) is
unchanged; these add the review matrix and the axe gate on top of it.

### Deferred findings fixed first (TDD, from PR #19 review)

- **03-78a TextInput helper live region**: the helper `Text` now stays
  mounted even when empty (`fieldHelperLiveRegion()` → always
  `accessibilityLiveRegion="polite"`), so a new validation error lands in a
  region that already existed and is announced on Android (W3C ARIA22);
  previously the region mounted with its message and was read unreliably.
  `aria-describedby` still only points at a non-empty helper.
- **03-78b heading level**: `EmptyState` and `ErrorState` take a
  `headingLevel` prop (default 2); the app's list/detail empty+error
  branches pass level 1 so each page keeps exactly one h1. Proven by
  `pnpm s1` ("exactly one h1 per page").
- **03-78c brand-colors-check extensions**: `SOURCE_EXTENSIONS` now also
  scans `.mjs/.cjs/.mts/.cts` (and `TEST_FILE` covers them), so a color
  literal in an ESM/CommonJS module no longer slips past the gate. New
  `collectFindings` test plants a hex in each extension under a scan root.

### Task 7 — state-matrix stories

- `packages/ui/src/stories/fixtures.ts`: per-locale story copy (en, pt-BR,
  de) for every primitive; de is the long-text overflow locale.
- `story-frame.tsx` gains `LocaleMatrix` + re-exports the fixtures, so a
  reviewer sees en/pt-BR/de side by side in every text-bearing primitive's
  `Locales` story.
- `StateMatrix.stories.tsx`: the loading / empty / error / offline /
  loaded matrix, each state rendered per locale, plus a `GermanLongText`
  story under all four preset×mode frames for overflow, and a
  `MapPlaceholderState`.
- `apps/storybook/.storybook/preview.tsx`: a global preset/mode switcher
  decorator driven by a Storybook toolbar (cotijuba/serra × light/dark),
  so a reviewer re-skins every story live without editing it. Per-preset
  matrix stories keep their own `ThemeStoryFrame` (inner provider wins).

### Task 8 — accessibility pass

- `@storybook/addon-a11y` added to `apps/storybook`; axe runs in the panel
  and `pnpm a11y` asserts over the built Storybook.
- `tools/a11y-check/a11y-check.mjs` + root `pnpm a11y`: serves
  `apps/storybook/dist`, drives the installed Chromium (Playwright, no
  download — uses `~/.cache/ms-playwright`), runs axe (wcag2a/2aa/21a/21aa)
  over every story, fails on any serious/critical. `--grep` isolates a
  story; `--storybook <dir>` points at a build.
- Two real violations surfaced and fixed: the Button loading spinner
  (RNW `role="progressbar"` with no name — now `accessibilityHidden`,
  hidden because the button already announces busy) and the pressable
  ListRow's `label-content-name-mismatch` (a hand-built `", "`-joined label
  did not contain the rendered, space-less text — now RNW composes the name
  from children, WCAG 2.5.3). Deliberate red/green demonstrated with a
  planted empty pressable (`button-name`, critical) then reverted; runs in
  the orchestrator `p03-78-tdd.txt`.
- `FocusOrder.stories.tsx`: TextInput + Button focus-order stories (web
  react-native-web real DOM) for the phase QA journey 3.

### Proposed CI step (not wired here — .github/ is out of scope for agents)

After the existing `pnpm storybook:build` job, add a step:

    pnpm a11y   # fails on any serious/critical axe violation over the build

`pnpm a11y` needs the Playwright Chromium cache present (it reuses
`~/.cache/ms-playwright`); CI should run `npx playwright install chromium`
once (or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`) before the step.

### Gates kept green

`pnpm check`, `./scripts/check.sh` (ends `check: OK`), `pnpm s1`,
`pnpm storybook:build`, `pnpm a11y` — all exit 0; red/green runs quoted in
the orchestrator `p03-78-tdd.txt`.
