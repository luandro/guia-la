# Spec: token layer + theme engine (phase 03 tasks 3–4)

Scope: PRs 03-3 and 03-4; the vocabulary and accessibility floor below are
updated through the primitives PRs (tasks 5–6, PR #19 review). Intent:
[intent.md](intent.md). Runtime verdict these build on:
[decision-s9.md](decision-s9.md) ("Both" mode kept).

## Problem

Phase 03 must turn the S9 story pipeline into a reviewable design system:
a token layer as data (no primitive ever hardcodes a color or size), and a
theme engine that switches destination preset and color mode at runtime so
one story set reviews every destination. Nothing like this exists yet —
`packages/ui` holds only the spike's pass-through Text.

## Outcome

- `packages/ui/src/tokens/` defines semantic color roles, a typography
  scale, spacing, radius and elevation scales, with a zod schema that
  rejects an invalid preset (missing role, malformed hex, unknown key).
- `packages/ui/src/theme/` provides `ThemeProvider` / `useTheme` with
  runtime switching of preset (`cotijuba`, `serra`) and mode
  (`system` / `light` / `dark`), backed by pure, unit-tested resolution
  functions.
- Stories in `packages/ui` render token swatches and the Text primitive
  under both presets in light and dark, on both Storybook runtimes.
- `apps/app` wires `ThemeProvider` at the root layout with the preset
  derived from `APP_VARIANT` (via `expo.extra.destinationId`).
- An unknown preset id falls back to a named default and warns once —
  never a crash (phase-03.md negative test).

## Users

Widget authors (Phase 06+) consume `useTheme().tokens` and never write a
brand color; reviewers (human owner) sign off both presets visually via
the Storybook URL; Phase 04's pipeline reuses the same build commands.

## Contract details

Color roles (exactly these thirteen, every one present in light **and**
dark): `background`, `surface`, `text`, `textMuted`, `primary`,
`onPrimary`, `accent`, `border`, `danger`, `success`, `warning`, `focus`,
`shadow`. `shadow` was added with the primitives (task 5) as the shadow
color role; in the shipped presets it is mode-independent — a shadow is
cast, not read, so it stays dark in dark mode (a light shadow gave dark
cards a halo).

- Colors are `#RGB`/`#RRGGBB` hex strings; data lives only under
  `src/tokens/` and `src/theme/` — never in `src/components/**`.
- Typography roles: `display`, `title`, `heading`, `body`, `bodySmall`,
  `caption`, `label` — each `{ fontSize, lineHeight, fontWeight,
  letterSpacing }`. Spacing steps: `xs 4, sm 8, md 12, lg 16, xl 24,
  2xl 32`. Radius: `none 0, sm 4, md 8, lg 12, xl 16, full 9999`.
  Elevation levels (RN `elevation` numbers): `none 0, low 2, mid 6,
  high 12`. Scales are mode-independent; only colors pair light/dark.
- `ThemePreset = { id, defaultMode, colors: { light, dark },
  typography, spacing, radius, elevation }`.
- Presets `cotijuba` (deep teal / lime / warm off-white, from the planning
  packet's visual language) and `serra` (synthetic slate-indigo / amber —
  demo palette, no real-branding claim). Default preset: `cotijuba`.

Accessibility floor (unit-enforced, WCAG 2.x contrast): in every preset and
mode, `text`/`background`, `text`/`surface`, `textMuted`/`background`,
`textMuted`/`surface` and `onPrimary`/`primary` all ratio ≥ 4.5:1.

Non-text contrast (WCAG 1.4.11, added in PR #19 review round 2): the idle
field boundary — the `border` role — must ratio ≥ 3:1 against **both**
adjacent colors, the `surface` fill inside and the `background` outside,
in every preset and mode. Both presets therefore carry darker light-mode
borders and lighter dark-mode borders than a hairline would be; the tests
in `fieldStyles.test.ts` are the guardrail and owner tuning must keep them
green.

## Constraints

- `packages/ui` depends only on `react`, `react-native` (+ `zod` for the
  schema; `react-native-web` as web peer). No imports from `apps/*` or
  widgets. No hardcoded user-facing strings inside `packages/ui`; story
  labels are dev-only review surfaces, not shipped UI.
- i18n (D-14) unaffected: the app wiring adds no user-facing strings and
  touches no locale catalogs.
- Gates that must stay green: `pnpm check`, `./scripts/check.sh` (ends
  `check: OK`), `pnpm s1`, `pnpm storybook:build`.
- The human owns visual sign-off of both presets; the agent does not
  self-approve aesthetics (listed as pending in [plan.md](plan.md)).

## Tests that prove it

- Zod schema rejects a preset with a missing role (light or dark), a
  malformed hex value, and an unknown extra role; it accepts both shipped
  presets.
- Every role exists in both light and dark of every shipped preset.
- Contrast ratios meet the floor above in every preset and mode, using a
  small `contrastRatio()` helper with its own unit tests against known
  WCAG values (21:1 black/white, 1:1 equal colors, ≈4.54:1 `#767676` on
  white, symmetry, shorthand hex, throw on invalid input).
- Pure theme functions: `resolveMode` (`system` follows the OS scheme with
  preset default fallback), `resolvePreset` (unknown id → default + one
  warning, never two), `selectTokens` (mode-specific colors, shared
  scales, no aliasing into the preset).

## Open questions

- ~~Elevation on iOS needs shadow triples (`shadowColor`/`shadowRadius`/
  `shadowOffset`) beyond the Android `elevation` number; deferred to the
  primitives PRs that first render shadows (batch 1/2), where the mapping
  can be judged on real components.~~ **Resolved** by the primitives
  (task 5, `elevation.ts`): the iOS shadow triple is derived from the same
  token number — `shadowRadius` = elevation × 1.5, `shadowOffset.height` =
  elevation / 2, `shadowColor` from the mode-independent `shadow` role,
  `shadowOpacity` a rendering constant — so depth stays one datum per
  level, judged on Card/Chip in Storybook.
- Whether `serra`'s synthetic palette survives owner review unchanged —
  expected: values will be tuned after visual sign-off; the schema and
  tests make that a data edit.
