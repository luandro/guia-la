---
id: 03
title: Design system, Storybook and theming
short: Spike S9, then build token-driven UI primitives with per-destination themes, stories, and accessibility checks that every later phase reuses.
tag: See
status: draft
complexity: Medium (compatibility)
depends: 02
inspect: Storybook web build, on-device story list, Cotijuba and Serra demo themes switching live in one URL
exit: Storybook runs in both runtimes or the fallback is recorded as a decision, and no primitive hardcodes destination branding
---

## Phase identity

Phase **03** turns the Phase 02 shell into a reviewable design system: a token layer, a small set of primitive components with complete interactive states, React Native Storybook on device and web, and destination theming demonstrated with Cotijuba (pilot destination) and the Serra demo (synthetic mountain destination).

- **Objective:** a human who cannot run a simulator opens one URL and reviews every primitive in both destination themes, light and dark; a widget author in Phase 06+ composes screens from these primitives without ever writing a brand color.
- **Prerequisites:** Phase 02 exit — pinned Expo SDK 58 monorepo (proposed naming `guia-la`, packages `@guia-la/*`), `web.output: "static"` export working, walking-skeleton Places page from fixture data.
- **Dependencies:** Phase 02 (repo layout, pinned versions, export pipeline). See [../decisions.md](../decisions.md) D-02 (client stack, proposed).
- **Expected contributors:** senior coding agent (implementation), orchestrator agent (code review), human product owner (visual sign-off on themes; no designer is assumed — initial tokens derive from the planning packet's own visual language: deep teal, lime accent, warm off-white).
- **Complexity and risks:** Medium, dominated by toolchain compatibility. `@storybook/react-native` 10.7.2 and `@storybook/react-native-web-vite` 10.6.8 have peer ranges that admit RN 0.88 / React 19.3 / RNW 0.21, but the combination was never built — that is spike S9 ([../research/expo-stack.md](../research/expo-stack.md) §3). Storybook 11 is in beta and must not be adopted ([../research/expo-stack.md](../research/expo-stack.md) §4). Mitigation: spike first, explicit fallback, nothing in this phase assumes on-device Storybook works. **No hour estimates.**

## Why this stage exists

Every later phase reviews UI through these primitives. Phase 04's pipeline publishes story builds as review surfaces; Phase 06's widget contract requires that widgets contain no styling of their own; Phase 08's widgets must ship honest empty, error, loading, and offline states. Establishing that grammar once, with themes as data, is what makes a second destination cheap instead of a fork.

The legacy app is the counterexample. Its 58 shadcn/Radix primitives are DOM-only and unportable to React Native ([../research/legacy-cotiju-audit.md](../research/legacy-cotiju-audit.md) §2), and its missing async states produced the indefinite spinners of issue #60: views with no timeout, empty, error, or retry state ([../research/legacy-cotiju-audit.md](../research/legacy-cotiju-audit.md) §9). White-labeling was env-flag only — the flags toggled UI but removed no code ([../research/legacy-cotiju-audit.md](../research/legacy-cotiju-audit.md) §inference). This phase makes the state matrix and the theme data first-class so those classes of failure are visible in a story before they reach a device.

Storybook placement here follows the master plan (phase 03, tag See), with one edit proposed in [../review.md](../review.md) §8.2: start with the S9 compatibility spike and keep a named fallback, because R10 rates the untested peers as a medium risk.

## Inputs and source references

Proposed paths in the future `guia-la` repository (marked proposed; nothing exists yet):

- `packages/ui/` — primitives, tokens, theme engine (proposed)
- `packages/ui/src/tokens/` — token definitions and generated sheets (proposed)
- `packages/ui/src/theme/` — `DestinationTheme` type, presets (proposed)
- `apps/app/.rnstorybook/` — on-device Storybook config (proposed)
- `.storybook/` — web (RNW-Vite) config at repo or app root (proposed)
- Stories colocated with components as `*.stories.tsx` (proposed)

Legacy references (read-only, `luandro/cotiju-app` at `c0c9907`):

- `src/components/ui/` — 58 shadcn primitives; concept reference for naming and state coverage only; the DOM implementation is not portable
- Issue #60 — async views without timeout/empty/error/retry; drives the required state matrix
- Issue #67 — missing OG/social preview basics; not this phase's scope, but story metadata habits start here

Authoritative documentation (from research, retrieved 2026-11-21/22):

- Storybook RN setup incl. Expo Router entry-point swapping via `STORYBOOK_ENABLED` — [../research/expo-stack.md](../research/expo-stack.md) §1.7
- Storybook RNW-Vite peers and the "use both runtimes" recommendation — same section
- Expo platform-specific file extensions (`.web.tsx` needs a non-platform sibling inside `app/`) — same, §1.5

Decisions and review rows:

- D-02 client stack (proposed) — this phase must not revisit it; raise blockers, not redesigns
- R10 (Storybook risk), R13 (starters lag SDK 58 by 3–4 SDKs — borrow patterns, adopt nothing) — [../review.md](../review.md) §2

Known unknowns:

- S9 outcome: whether `npm create storybook` in "Both" mode builds on the SDK 58 template (RN 0.88, React 19.3, Reanimated 4.7, Expo Router modules needing Vite transpilation) — unknown, measure in S9
- Visual snapshot stability across platforms — unknown; this phase baselines web only
- Dark mode depth: whether every primitive needs a dark variant now — proposed: light-first, dark tokens defined but only exercised where cheap
- Whether on-device Storybook and the `/gallery` fallback can share one component index — proposed: one story list, two renderers, so the fallback is a runtime swap rather than a second catalog to maintain

Credentials and tools needed: none. Everything in this phase runs locally; no accounts, no network services, no spend.

## Task breakdown

| # | Task (bounded) | Owner | PR unit | Depends on |
| --- | --- | --- | --- | --- |
| 1 | Run spike S9: add Storybook in "Both" mode to the Phase 02 template; record exact versions, errors, and verdict in the spike note | Agent | PR 03-1 | — |
| 2 | Record the verdict as a decision note (S9 pass, or fallback per R10: web-only Storybook plus an Expo Router `/gallery` dev route on device) | Agent, human informed | PR 03-2 | 1 |
| 3 | Token layer: colors, typography, spacing, radius, elevation, dark-mode pairs; token schema as TypeScript plus zod | Agent | PR 03-3 | 2 |
| 4 | Theme engine: `ThemeProvider`, `useTheme`, runtime switching; presets `cotijuba` and `serra` (synthetic palettes, no real-branding claims) | Agent | PR 03-4 | 3 |
| 5 | Primitives batch 1 with stories: Text/Heading, Button, Card, Chip/Badge, ListRow | Agent | PR 03-5 | 4 |
| 6 | Primitives batch 2 with stories: TextInput + field scaffolding, Skeleton, EmptyState, ErrorState with retry, OfflineBanner, MapPlaceholder | Agent | PR 03-6 | 4 |
| 7 | State matrix stories: each primitive rendered in loading, empty, error, offline, light, dark; themes switchable per story | Agent | PR 03-7 | 5, 6 |
| 8 | Accessibility pass: labels not color alone, minimum target sizes, focus order stories; axe checks wired on web stories | Agent | PR 03-8 | 7 |
| 9 | Visual diff baseline: screenshot the story set on Chromium; store baselines; threshold policy documented | Agent | PR 03-9 | 7 |
| 10 | Usage docs and guardrails: how a widget consumes tokens, what is forbidden, how to add a primitive | Agent | PR 03-10 | 8, 9 |

Notes on boundaries:

1. Task 1 is deliberately first and separate: nothing else in the phase may merge before the S9 verdict exists, because PRs 03-3 through 03-9 must target the runtime configuration the verdict selects.
2. Tasks 5 and 6 are two PRs to keep diffs reviewable; a third batch (navigation shells, headers) is explicitly deferred to Phase 06 widget scaffolding, where real routes exist.
3. The human owns visual sign-off of both theme presets (PR 03-4) and the accessibility bar (PR 03-8); the agent does not self-approve aesthetics.

## Architecture choices and guardrails

Locations and contracts (proposed):

- `packages/ui` depends only on `react`, `react-native`, and its own token module. It must not import from `apps/*`, `packages/widgets/*`, or any widget.
- Themes are data: a destination manifest (Phase 06) references a theme id; components read tokens from context. Illustrative sketch:

```ts
// Illustrative only — final types land in the implementing PR.
export type ThemeTokens = {
  colors: { bg: string; surface: string; ink: string; accent: string; danger: string };
  radius: { sm: number; md: number; lg: number };
  space: (step: 1 | 2 | 3 | 4 | 6 | 8) => number;
  type: { heading: object; body: object; caption: object };
};
export type DestinationTheme = {
  id: 'cotijuba' | 'serra' | (string & {});
  defaultMode: 'light' | 'dark';
  tokens: { light: ThemeTokens; dark: ThemeTokens };
};
```

Patterns:

- StyleSheet at module scope, tokens resolved at render via context — avoids per-render style creation without introducing a CSS-in-RN runtime
- On-device Storybook via entry-point swap (`STORYBOOK_ENABLED=true`), which keeps Storybook code out of production bundles per the RN setup docs ([../research/expo-stack.md](../research/expo-stack.md) §1.7)
- Web stories run on `@storybook/react-native-web-vite`; both runtimes consume the same CSF files

Forbidden:

- Porting shadcn/Radix primitives (DOM-only; the lesson is the state matrix, not the code)
- Hardcoded hex colors, font sizes, or the strings `cotijuba`/`serra` inside `packages/ui/src/components/**`
- Widget-to-widget or app-to-widget imports from `packages/ui`
- Storybook 11 (beta) or any beta-tagged peer
- `Platform.OS` styling forks without a comment justifying why tokens cannot express it

Security and privacy implications: none directly — no network, no accounts, no personal data. Fixture content in stories is synthetic; do not copy legacy photos, names, or phone numbers into stories.

Acceptable alternatives if the primary path fails:

- Fallback A (R10): web-only Storybook plus an Expo Router `/gallery` route rendered on device in dev builds — accepts slower device review to keep the phase moving
- Alternative styling engines (NativeWind/Tailwind, styled-components): rejected for now — token functions plus StyleSheet have no extra runtime and work identically on RNW; revisit only with evidence of real cost

## Deliverables

- [ ] `packages/ui` package with token layer, theme engine, and both presets (proposed paths above)
- [ ] Primitive components: Text, Heading, Button, Card, Chip, ListRow, TextInput, field scaffolding, Skeleton, EmptyState, ErrorState, OfflineBanner, MapPlaceholder
- [ ] Colocated CSF stories for every primitive, covering the state matrix
- [ ] Storybook configuration for the runtime(s) the S9 verdict selected (`.rnstorybook/` and/or `.storybook/`)
- [ ] If fallback chosen: `/gallery` dev route in `apps/app` rendering the same component set
- [ ] Visual baselines stored in-repo with a README stating how to update them deliberately
- [ ] `docs/ui/usage.md` (proposed) — consumption rules, forbidden list, addition checklist
- [ ] Spike note `docs/spikes/S9-storybook.md` (proposed) — versions pinned, errors hit, verdict, decision reference
- [ ] Decision-register update: S9 outcome recorded against D-02's evidence list (status stays proposed unless the user decides)

## Visual and functional QA

Manual journeys (human, no simulator required for the web path):

1. Open the web Storybook build (local or the Phase 04 preview URL once it exists — pattern TBD in Phase 04). Switch theme cotijuba to serra; every story re-skins with no reload or layout break.
2. Toggle light/dark in a theme toolbar knob; confirm dark is not "inverted light" — surfaces and ink swap deliberately.
3. Keyboard-navigate the Button and TextInput stories: visible focus, logical order, Enter/Space activation.
4. Force the ErrorState story's retry action; confirm it fires visibly (a counter or log line in the story), not a silent no-op.
5. Run the on-device (or `/gallery` fallback) surface on an Android emulator and, if available, an iOS simulator; confirm the same stories render and themes switch.

Agent journeys:

1. Render every story headlessly; capture screenshots web (Chromium) — artifacts land in the PR.
2. Axe scan over all stories; findings listed with severity, zero critical accepted.
3. Grep `packages/ui/src/components` for hardcoded hex values and destination ids; expect zero hits.

Platform matrix:

| Surface | Web | Android | iOS |
| --- | --- | --- | --- |
| Storybook web build | required | n/a | n/a |
| On-device stories or `/gallery` | n/a | required (emulator) | best-effort (simulator; record if unavailable) |
| Theme switching | required | required | with above |

Error states to verify explicitly: ErrorState with retry, OfflineBanner, EmptyState with a call-to-action, Skeleton-to-content transition. A story that renders none of these is incomplete, not optional.

Required state matrix (every primitive is story-rendered against each row; a cell marked "n/a" must be justified in the story file):

| State | Expectation | Applies to |
| --- | --- | --- |
| loading | Skeleton or stable placeholder; no layout shift when data lands | data-bound components |
| empty | EmptyState with one clear next action, never a bare blank | lists, cards, directories |
| error | ErrorState naming what failed plus a retry that visibly fires | anything async |
| offline | OfflineBanner; cached/last-known content where it exists, explicit unavailability where not | shell, lists, detail views |
| dark | Surfaces and ink swap deliberately; contrast holds (axe) | all |
| reduced motion | Animations degrade to instant state changes | Skeleton, transitions |

## Automated verification

Nothing in this phase has been run; every command below is **proposed** until executed in the future repo. The only command form verified in research is the export source-map flag (not needed here). Commands:

| Command | Purpose | Status |
| --- | --- | --- |
| `pnpm --filter @guia-la/ui typecheck` | strict TS on the new package | proposed |
| `pnpm --filter @guia-la/ui test` | unit tests for token resolution and theme switching | proposed |
| `pnpm --filter @guia-la/ui storybook:build` | static web story build (RNW-Vite path, S9-dependent) | proposed |
| `pnpm --filter @guia-la/ui storybook:test` | interaction/a11y (axe) checks over stories | proposed |
| `pnpm --filter @guia-la/ui snapshot` | screenshot diff against stored baselines (Chromium) | proposed |
| `grep -R -n -E '#[0-9a-fA-F]{3,8}' packages/ui/src/components` | no hardcoded colors (expect no output) | proposed |

Positive tests: token resolution returns preset values; theme context switches re-render consumers; each primitive's happy-path story renders.

Negative tests: unknown theme id falls back to a named default and logs once (never crash); missing token key fails typecheck, not silently at runtime.

Deliberate-failure demonstration: temporarily add a low-contrast token pair and a story using it; the axe run must flag the contrast violation. Record the failing output in the PR, then revert. Phase 05 turns this habit into a standing red/green protocol.

## Acceptance gate

> [!GATE] Storybook (or its recorded fallback) reviews every primitive in both destination themes, and the design system contains zero destination-specific code.

Checklist (observable pass/fail):

- [ ] S9 spike note exists with pinned versions and a verdict; fallback chosen only if the spike failed
- [ ] Every primitive has stories covering loading, empty, error, offline, light, dark
- [ ] Theme switch (cotijuba to serra, light to dark) works in the review URL without reload
- [ ] Axe scan reports zero critical findings; findings list attached to the PR
- [ ] Grep finds no hardcoded colors or destination ids under `packages/ui/src/components`
- [ ] Visual baselines committed with an update policy
- [ ] Human sign-off recorded on both theme presets

Blocks progression if:

- The S9 verdict is missing — Phase 04 cannot wire previews, and Phase 06 cannot define widget styling rules
- Any primitive ships without error/empty/loading states — Phase 08 widgets would inherit the legacy #60 spinner class
- Destination branding leaks into `packages/ui` — the white-label claim (D-00) becomes false at the first destination

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| S9 fails: peers break on RN 0.88 / Expo Router modules | medium | medium | Fallback A defined before work starts (R10); spike is PR 03-1, nothing else merges first |
| Storybook 11 churn invalidates config | medium | low | Pin 10.x exact; treat major bumps as a decision, not a dependency update |
| Visual diffs flake (fonts, antialiasing) | medium | low | Web/Chromium only this phase; thresholds documented; baselines updated deliberately, never auto-accepted |
| Scope creep into widget components | high | medium | Primitives only; navigation shells and real screens belong to Phase 06/08; reviewer rejects scope in PR review |
| Dark mode doubles every task | medium | low | Light-first; dark tokens defined, exercised where cheap, completed as a follow-up PR if needed |

Sensitive operations needing human approval: none in this phase (no accounts, no spend, no production systems). The human approves aesthetics and the a11y bar only.

Budget impact: zero — local builds only.

Rollback: `packages/ui` is additive to the Phase 02 repo; any PR reverts independently. If the whole approach fails, the Phase 02 shell is untouched.

Restart instructions for an agent picking up mid-phase:

1. Read `docs/spikes/S9-storybook.md` (if present) for the runtime verdict; do not re-litigate it
2. Check merged PRs labeled `03-*` for completed tasks; the table above defines the order
3. Every task maps to one PR; resume at the first unmerged task whose dependencies are merged

## Next phase handoff

Phase 04 (pipeline) needs from this phase:

- The storybook build command and output directory that previews will publish (`storybook:build` output path)
- The unit/typecheck commands to slot into the fast gate
- Baseline locations so the pipeline can run snapshot diffs without re-baselining

Phase 06 (widget contract) needs:

- The `DestinationTheme` / token types as the styling contract widgets must consume
- The forbidden list in `docs/ui/usage.md` as the basis for boundary lint rules

Records to hand over: S9 spike note; theme preset files; axe findings list; the deliberate-failure demonstration output. Next phase page: [phase-04.html](phase-04.html). Agent prompt: [../prompts/phase-04-agent.md](../prompts/phase-04-agent.md). This phase's own prompt: [../prompts/phase-03-agent.md](../prompts/phase-03-agent.md).
