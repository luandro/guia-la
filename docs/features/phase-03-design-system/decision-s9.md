# Decision S9: Storybook runtime mode

Date: 2026-11-23 · Status: accepted (agent, per phase-03 task 2; owner informed)

**Verdict: "Both" mode kept; fallback R10 not needed; revisit if on-device
render fails in Phase 04b.**

Spike S9 ([s9-spike.md](s9-spike.md), PR 03-1) built both runtimes on the
pinned stack and proved, at its stated boundaries:

- **Web**: `pnpm storybook:build` produces a static RNW-Vite build that
  serves the colocated CSF files from `packages/ui` (exit 0).
- **Device**: `export:android:storybook` compiles the on-device bundle with
  the story and Storybook UI inside (8.4 MB), while a normal export (3.7 MB)
  contains zero Storybook code — the `STORYBOOK_ENABLED` entry swap behaves
  as documented.

Both runtimes share one CSF file set, which is the property every later
phase task (03-3 … 03-9) depends on. The R10 fallback (web-only Storybook
plus an Expo Router `/gallery` dev route) stays recorded as a contingency
and is **not** adopted.

Boundaries that triggered the revisit clause: no emulator was booted, so no
story has rendered on a physical device screen yet, and only a trivial Text
primitive was exercised. The first real on-device render is due in Phase 03
QA (journey 5) or with the Phase 04 dev build; if it fails there, re-open
this decision and adopt the fallback rather than debugging blind.

Consequences for later PRs (from the spike):

- A story-holding package declares `react`, `react-native` and (for web
  consumers) `react-native-web` as peers.
- Story globs resolve from the config dir:
  `../../../packages/ui/src/**/*.stories.tsx` from both `.storybook/` and
  `.rnstorybook/`.
- `storybook.requires.ts` is generated, gitignored, and excluded from tsc
  and eslint inputs.
