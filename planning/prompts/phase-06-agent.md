> Do not execute this brief until the guia.la planning packet has been reviewed and approved by the project owner. This is a planning artifact, not an authorization.

# Phase 06 execution brief — widget contract, compiler, two destination builds

You are the implementation agent for Phase 06 of guia.la: a senior React Native/Expo engineer working in the guia.la repository. Your job is the typed widget contract, the build-time composition generator, three build profiles (Cotijuba web, Serra demo web, flagship union), and the automated negative assertions that prove excluded widgets are absent from web bundles.

## Hard constraints (global, non-negotiable)

- No writes to production data or legacy systems; `luandro/cotiju-app` is read-only reference.
- No secrets, keys or personal data in code, config, `EXPO_PUBLIC_*` values, PRs or artifacts.
- No store submission, DNS change, domain purchase or paid-service spend without explicit human approval; any Expo cloud build beyond free-tier quota needs approval first (D-08).
- Evidence over claims: run the commands, attach output. Never state a check passed without its output linked.
- Small PRs: one task per PR unit (PR 06-1 … PR 06-10), each independently reviewable, roughly under 400 changed lines.

## Read first (canonical, in the future repo)

1. `AGENTS.md` and `SPEC.md` at the repository root.
2. This phase's playbook: `planning/phases/phase-06.html` (task table, guardrails, gate).
3. Decision register entries D-02, D-06, D-07, D-08 in `planning/decisions.md`.
4. Widget authoring doc once merged: `docs/widget-authoring.md`.
5. Expo docs (verify they match the pinned SDK): autolinking https://docs.expo.dev/modules/autolinking/ , tree shaking https://docs.expo.dev/guides/tree-shaking/ , bundles https://docs.expo.dev/guides/analyzing-bundles/ , variants https://docs.expo.dev/build-reference/variants/ .
6. Phase 05's fast-gate workflow files in `.github/workflows/` — you extend them, you do not replace them.

## Ordered tasks

1. PR 06-1 — `@guia-la/widget-sdk`: zod `WidgetManifest` (id, version, capabilities, nativeDeps, configSchema, routes, cards), `defineWidget`/`defineDestination`, sentinel-export convention, type tests.
2. PR 06-2 — six placeholder widget packages (places, transport, tides, local-services, trails, guides): one screen with loading/empty/error/offline states, one story each, sentinel export. No business logic, no network calls.
3. PR 06-3 — destination manifests (`destinations/cotijuba`, `destinations/serra`) and profiles (`flagship`, `cotijuba-web`, `serra-web`); compose-time validation fails fast on unknown widget ids, duplicate routes, undeclared capabilities.
4. PR 06-4 — `tools/compose` generator: explicit static imports registry, route stubs under `apps/app/src/app/(widgets)/`, app-config fragments from capabilities, input checksum, per-profile manifest JSON; `--check` mode asserts byte-identical regeneration. Unit tests with golden files.
5. PR 06-5 — boundary lint: ESLint `no-restricted-imports` + dependency-cruiser; widget→widget forbidden; app→widget only inside `generated/`; widgets may import only `@guia-la/widget-sdk`, `@guia-la/ui`, `@guia-la/core`, `@guia-la/map`, `@guia-la/api-client`, `@guia-la/contracts`.
6. PR 06-6 — runtime flags client: closed set from registry; unknown server ids ignored and logged; flags only hide/reorder.
7. PR 06-7 — `tools/assert-exclusion.mjs`: source-map sentinel and package-path greps, route-HTML absence, markdown report artifact.
8. PR 06-8 — CI wiring: compose all profiles, `compose --check`, assertions, `expo export -p web` per web profile; artifacts on failure.
9. PR 06-9 — native one-module exclusion spike (S5): generated `package.json` `expo.autolinking.exclude`; diff `expo-modules-autolinking resolve` and prebuild output; record evidence against D-06. Spike only — no general mechanism. Human approval required before any cloud build.
10. PR 06-10 — docs: widget authoring guide, flagship-vs-dedicated-build policy note, D-06 evidence entry.

## Acceptance criteria (from the phase gate)

- Exclusion assertions pass for both web profiles: excluded sentinels, package paths and route HTML provably absent; report attached.
- Flagship registry is exactly the union; destination switcher works in preview.
- A runtime flag cannot surface an excluded widget (hostile-flag fixture test).
- Boundary lint and the fast gate demonstrably fail on a deliberate violation (red/green evidence).
- S5 spike evidence recorded or explicitly blocked with what is missing.
- No placeholder widget contains business logic; no new native dependency beyond declared `nativeDeps`.

## PR evidence package (every PR)

- Summary of what changed and why, linked to the task number above.
- Commands run with output excerpts: compose, compose --check, export, assertions, lint, `npx tsc --noEmit`.
- Screenshots: preview of the affected profile(s), plus any error-state journey you touched.
- The exclusion report artifact when the PR affects composition.
- Risks and deviations from this brief, stated plainly.
- Docs updated (widget guide, decision evidence) when the PR changes behavior a future agent must know.
- The next task this PR unblocks.

## Stop and ask when…

- Exclusion assertions would need tree shaking, a Metro resolver hack, or any undocumented Expo behavior to pass — stop; that is a D-06/D-02-level decision.
- A task seems to require spending (cloud builds, new services) — stop and request approval.
- You are tempted to add real features to a placeholder widget — stop; that is Phase 08.
- The SDK behaves contrary to the pinned documentation in the research notes — stop; record the discrepancy with links instead of working around it silently.
- Generator output cannot be made deterministic — stop and surface it; do not commit generated files as a workaround.
