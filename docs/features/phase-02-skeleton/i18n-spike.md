# i18n spike: i18next/react-i18next + expo-localization vs Lingui (02-6, D-14)

Date: 2026-11-22 · Stack context: Expo SDK 58 (58.0.26), Expo Router static
web export, Metro, React 19.3, `reactCompiler` experiment on, six locales
(en, pt-BR, es, fr, nl, de) required by [ADR-0016](../../adr/ADR-0016-d14-i18n.md).

## What the spike did

1. Read both libraries' primary docs (sources below) against this stack's
   four hard constraints: static-export rendering, Metro bundling, key
   completeness in CI, plural/ICU needs.
2. Ran a real minimal trial of the chosen library (i18next 27.2.3 +
   react-i18next 18.0.3 + expo-localization 58.0.5, installed via
   `npx expo install`): synchronously-initialized instances per locale,
   translation + interpolation asserted by
   `apps/app/src/i18n/trial/i18next-trial.test.ts` (green in `pnpm test`).
   The production wiring (`apps/app/src/i18n/`) follows the same pattern.

## Comparison

| Criterion (this stack) | i18next + react-i18next + expo-localization | Lingui (v6) |
| --- | --- | --- |
| Static export rendering | Sync init from inline JSON resources; `t()` usable inside `generateMetadata` at build time (trial proves sync init) | Catalogs are compiled JS; works, but adds a compile artifact to every content change |
| Metro / toolchain | Zero Metro or Babel changes; catalogs are plain JSON imports | Needs the babel macro + `@lingui/metro-transformer` for `.po`, and a Metro cache clear on setup ([RN tutorial](https://lingui.dev/tutorials/react-native)); one more moving part beside the React Compiler experiment |
| Bundle size | Runtime library + JSON catalogs; measured on disk (unminified ESM): i18next ~96 kB, react-i18next ~35 kB; catalogs are tiny at skeleton scale | Smaller runtime (compiled, tree-shaken catalogs — [bundle-size guide](https://lingui.dev/guides/optimizing-bundle-size)); the stronger choice if bundle budget ever dominates |
| Extraction | None built in; keys are hand-maintained JSON — our `tools/i18n-check` gate enforces six-locale completeness in CI (D-14) | First-class extraction (`lingui extract`) with ICU-aware macros |
| Plural / ICU | Built-in plurals via `Intl.PluralRules`; ICU via `i18next-icu` if ever needed | ICU MessageFormat native |
| Device locale (native) | expo-localization `getLocales()` ([docs](https://docs.expo.dev/versions/latest/sdk/localization/)) — the same package Lingui's own tutorial tells you to use for locale detection | Same; Lingui ships no locale detection ([RN tutorial](https://lingui.dev/tutorials/react-native)) |
| Maintenance / ecosystem | Largest ecosystem; react-i18next 18 supports React 19 (installed and type-checked here); i18next since 2011 | Smaller ecosystem; v6.0 is a fresh major (release banner on [lingui.dev](https://lingui.dev/)) — churn risk early in a platform's life |
| Intl on RN/Hermes | Uses `Intl`; Hermes on SDK 58 covers what we use (plural rules, number/date format) | Explicitly requires `Intl` polyfills on React Native as of 08/2024 ([RN tutorial](https://lingui.dev/tutorials/react-native)) — extra bundle weight |

## Verdict

**i18next 27 + react-i18next 18 + expo-localization 58** (ADR-0016 option 1).

Deciding factors on this stack: no Babel/Metro changes next to the React
Compiler experiment, synchronous init that works under static-export build
rendering (proven by the trial), JSON catalogs that Metro and the i18n
completeness checker both consume directly, and the largest maintenance
surface. Lingui's advantages (compile-time catalogs, smaller runtime,
extraction) are real but pay off at a string volume and bundle-budget
strictness this platform has not reached; revisiting Lingui is legitimate if
Phase 03's design system work introduces a bundle budget that i18next breaks.

Accepted trade-offs: hand-maintained keys (mitigated by the CI
completeness gate) and a larger runtime library (measured in S1's export).

## Sources

- Lingui React Native tutorial: <https://lingui.dev/tutorials/react-native>
  (babel/metro setup, cache clear, Intl polyfills, no built-in locale
  detection, points to Expo localization)
- Lingui bundle size guide: <https://lingui.dev/guides/optimizing-bundle-size>
- i18next getting started (sync init with inline resources, runtime JSON):
  <https://www.i18next.com/overview/getting-started>
- Expo localization SDK reference: <https://docs.expo.dev/versions/latest/sdk/localization/>
- Installed versions (this repo, 2026-11-22): i18next 27.2.3,
  react-i18next 18.0.3, expo-localization 58.0.5 (`npx expo install`),
  recorded in `pnpm-lock.yaml`.

## Open Questions

- None blocking. ICU message needs (if tides/transport schedules ever need
  complex messages) would prompt an `i18next-icu` evaluation rather than a
  library switch. (inferred)
