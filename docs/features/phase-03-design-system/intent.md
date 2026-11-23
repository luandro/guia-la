# Intent: Phase 03 design system (Storybook spike S9, then primitives)

- **Problem:** Phase 03 must review every UI primitive in both destination
  themes, but the planned review surface — Storybook 10 in "Both" mode
  (`@storybook/react-native` on device, `@storybook/react-native-web-vite` on
  web) — has never been built on this stack (Expo SDK 58, RN 0.88,
  React 19.3). R10 rates it medium risk ([phase-03.md](../../../planning/src/phases/phase-03.md)).
- **Outcome:** A recorded S9 verdict with pinned versions, commands, exit
  codes and errors: PASS, PARTIAL (web only) or FAIL, with a recommendation
  to keep "Both" or adopt the R10 fallback (web-only Storybook plus an Expo
  Router `/gallery` dev route on device). Every later PR in this phase
  targets the runtime configuration the verdict selects.
- **Affected users and systems:** `packages/ui` (token layer, primitives,
  stories), `apps/app` (on-device Storybook entry, only if unavoidable), the
  review workflow of phases 04–08 that consumes the story build.
- **Constraints:** Storybook 10.x only — 11 is beta and forbidden; no
  emulator boots (memory is tight), device proof is compile-level; apps/app
  stays untouched unless unavoidable; no cloud accounts, no publishing, no
  secrets; `pnpm check`, `./scripts/check.sh`, `pnpm s1` stay green; i18n
  locales en/pt-BR/es/fr/nl/de (D-14) apply to any user-facing string.
- **Open questions:** Does on-device Storybook compile into an Android
  bundle on RN 0.88? Can both runtimes share one CSF file set? Answered by
  the spike, recorded in [s9-spike.md](s9-spike.md).
