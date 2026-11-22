# Phase 03 agent prompt — design system, Storybook and theming

> **DO NOT EXECUTE THIS PROMPT YET.** It is planning output. It becomes active only
> after the product owner approves the guia.la planning packet and the repository exists.

## Role

You are the senior implementation agent for Phase 03 of guia.la: design tokens,
primitives, React Native Storybook, and destination theming. You implement, you do
not redesign the stack. The full playbook is `planning/phases/phase-03.html` in the
planning packet — read it before writing code.

## Hard constraints (global, non-negotiable)

- No writes to production data, the legacy `luandro/cotiju-app` repo, or any live service.
- No secrets, API keys, or personal data in code, stories, fixtures, or PR descriptions.
- No store publication, DNS changes, or spending without explicit human approval.
- Evidence over claims: never state a command ran or passed unless you show its output.
- Small PRs: one task from the playbook's table per PR unit (`PR 03-1` … `PR 03-10`).

## Read first (paths relative to the guia.la repo)

1. `AGENTS.md` and `SPEC.md` — working agreement and platform spec.
2. `docs/adr/` — decisions D-02 (client stack), D-00 (identity: guia.la platform,
   Cotijuba pilot, Cotiju is legacy only).
3. The planning packet's `planning/phases/phase-03.html` — your contract for this phase.
4. `docs/spikes/S9-storybook.md` if it exists — the Storybook verdict; do not re-litigate.

## Context you inherit

- Phase 02 exits with a pinned Expo SDK 58 monorepo (`apps/app`, `packages/*`),
  `web.output: "static"` export, and a fixture-driven Places walking skeleton.
- Spike S9 is unresolved: Storybook RN 10.7 + RNW-Vite 10.6 on RN 0.88 / React 19.3
  has never been built by us. PR 03-1 runs it. Nothing else merges before its verdict.
- Fallback if S9 fails (from review R10): web-only Storybook plus an Expo Router
  `/gallery` dev route on device. Adopting it is a recorded decision, not a defeat.
- Starters (Ignite, Obytes, T3) lag SDK 58 by 3–4 SDKs — borrow patterns, adopt nothing.

## Ordered tasks

1. **PR 03-1** — S9 spike: add Storybook in "Both" mode; pin exact versions; record
   errors and verdict in `docs/spikes/S9-storybook.md`.
2. **PR 03-2** — verdict recorded; fallback chosen only if the spike failed.
3. **PR 03-3** — token layer (color, type, space, radius, elevation, dark pairs) as
   TypeScript + zod schema.
4. **PR 03-4** — `ThemeProvider`, `useTheme`, runtime switching; presets `cotijuba`
   and `serra` (synthetic palettes; no real-branding claims).
5. **PR 03-5** — primitives batch 1: Text, Heading, Button, Card, Chip, ListRow.
6. **PR 03-6** — primitives batch 2: TextInput, field scaffolding, Skeleton,
   EmptyState, ErrorState (retry), OfflineBanner, MapPlaceholder.
7. **PR 03-7** — state-matrix stories: each primitive in loading/empty/error/offline,
   light/dark, both themes.
8. **PR 03-8** — accessibility: labels not color alone, target sizes, focus order;
   axe checks on web stories; zero critical accepted.
9. **PR 03-9** — visual baselines (Chromium) with an update policy.
10. **PR 03-10** — `docs/ui/usage.md`: consumption rules, forbidden list, addition checklist.

## Acceptance criteria

- Storybook (or the recorded fallback) reviews every primitive in both themes,
  light and dark, at one URL.
- No hardcoded colors or the strings `cotijuba`/`serra` under `packages/ui/src/components`.
- Every primitive has loading, empty, error, and offline stories.
- The deliberate-failure demo (low-contrast token flagged by axe) is recorded, then reverted.
- Human sign-off on both theme presets is requested explicitly, not assumed.

## PR evidence package (every PR)

- Summary: what changed, why, which task it closes.
- Link to the phase task or issue.
- Commands run with output excerpts (typecheck, unit, storybook build, axe, snapshot).
- Screenshots: at least one story per new component, both themes.
- Risks and known limitations stated plainly.
- Docs updated (usage guide, spike note where relevant).
- The next task this PR unblocks.

## Stop and ask when…

- S9 fails in a way the fallback cannot cover (e.g. web Storybook also breaks).
- A primitive seems to need widget- or destination-specific behavior — that is a
  Phase 06+ concern; do not invent a hook into it here.
- A dependency outside the pinned set looks required — propose it with evidence,
  do not add it silently.
- You are asked to approve your own visual design — human sign-off is not delegable.
