---
id: 06
title: Widget contract, compiler and two destination builds
short: Prove typed widget composition and genuine build-time exclusion with two destination web profiles and the flagship union, before any real feature work exists.
tag: Core
status: draft
complexity: High (tooling risk)
depends: 02, 03, 04, 05
inspect: Generated registry and route stubs for three profiles, two web exports plus flagship, exclusion assertion report, side-by-side previews
exit: Excluded widgets are provably absent from destination web bundles and runtime flags cannot bypass build-time exclusion
---

## Phase identity

Phase **06** proves the platform's central structural claim: a destination manifest decides what is *compiled into* an app, not what is merely hidden. It delivers the typed widget contract, the build-time composition generator, and three build profiles — Cotijuba web, Serra demo web, and the flagship union — with automated negative assertions that excluded widgets are absent from bundles, routes and native configuration.

- **Objective:** make "build only what the destination needs" a verified mechanical fact, demonstrated on cheap placeholder widgets, so Phase 08 can fill in real features without re-architecting.
- **Prerequisites:** the Phase 02 monorepo with pinned SDK 58 toolchain, Phase 03 UI primitives and Storybook wiring, Phase 04a web preview pipeline, Phase 05 fast gate with its red/green protocol. The Phase 01 extraction matrix informs the widget taxonomy but is not a blocker.
- **Dependencies:** phases 02, 03, 04, 05 (see index). Phase 04b native builds are optional here and used only for the de-scoped native spike.
- **Expected contributors:** senior implementation agent (contract SDK, generator, assertions); junior agents (placeholder widget packages, boundary lint config — mechanical, well-bounded); CI as reviewer of record for the exclusion matrix; one human reviewer for gate sign-off and any build-spend approval.
- **Complexity and risks:** High, dominated by custom-tooling risk (generator drift, SDK upgrade breakage) rather than UI difficulty. No hour estimates are attached to any task.

> [!DECISION] This phase's scope is shaped by D-06 (proposed): web/JS exclusion is required and gated; per-destination native exclusion is de-scoped to a one-module spike, with the general mechanism deferred until a partner native app is approved. Do not treat the wider native-exclusion goal as approved.

## Why this stage exists

The white-label promise must be structural, not cosmetic. In the legacy Cotiju app, white-label support was environment-flag toggling (`VITE_FEATURE_MOTO_TAXI/TIDE/TRANSPORT` and a `white-label-build.yml` workflow) that changed what the UI showed while leaving every feature compiled into the public bundle — exactly the weakness the rebuild RFC ([luandro/cotiju-app issue #71](https://github.com/luandro/cotiju-app/issues/71)) called out when it demanded build-time manifests ([legacy audit](../research/legacy-cotiju-audit.md)).

Store policy pushes the same conclusion from the other side. One flagship app containing the **union** of destination widgets is the distribution model with low review risk (Apple 4.2.6 "picker model", 4.3(a); Google repetitive-content guidance — [stores research §2](../research/backend-stores-starters.md)). Under that model, per-destination exclusion matters most where it is cheapest and most valuable: **web bundles**. That reframe is proposed in [review R2 and §8.5](../review.md) and recorded as decision D-06; this phase implements it as proposed, not as an approved final architecture.

Doing this now, on placeholder widgets, is deliberate: the contract, generator and assertions get proven while a mistake costs a regenerated file, not a half-built feature. Phase 08 then adds real widget verticals inside an already-verified container. Two distinct gates are enforced throughout — **build-time inclusion** (imports, routes, JS bundles, native config) and **runtime flags** (ordering and visibility of compiled-in widgets only), matching the master plan §04 "Two gates, not one".

## Inputs and source references

**This packet:**

- [Master plan §04 Composition and §05 phase 06](../../docs/guia-la-master-plan.html) — widget contract inputs/outputs/lifecycle, destination examples, two-gate rule.
- [Review §4](../review.md) — the build-time widget exclusion design this phase implements (manifests, generator, boundaries, negative assertions); [review R2](../review.md) and §8.5 for the de-scoped gate.
- [Decisions](../decisions.md) — D-02 (client stack), D-06 (exclusion scope), D-07 (flagship distribution), D-08 (build budget).
- [Expo stack research](../research/expo-stack.md) — §1.9 autolinking/tree-shaking/Atlas facts, §2 inference on the two-mechanism design, §3 spikes S5 and S10, §4 pinning risks.
- [Legacy audit](../research/legacy-cotiju-audit.md) — §7 feature inventory that seeds the widget taxonomy; env-flag white-label finding; issue #71 lesson row.

**Future guia.la repository paths (proposed — create in this phase):**

- `packages/widget-sdk/` — the typed contract package (`@guia-la/widget-sdk`).
- `packages/widgets/{places,transport,tides,local-services,trails,guides}/` — placeholder widget packages.
- `destinations/cotijuba/destination.ts` and `destinations/serra/destination.ts` — destination manifests (Serra is the synthetic mountain destination; synthetic fixture data only).
- `profiles/{flagship,cotijuba-web,serra-web}.ts` — build profiles listing the destinations each build serves; the widget set of a build is the union of its destinations' widgets.
- `tools/compose/` — the generator (`pnpm compose --profile <id>`).
- `apps/app/src/generated/` — generator output (git-ignored, regenerated in CI).

**Legacy references:** `luandro/cotiju-app` `.github/workflows/white-label-build.yml` and the `VITE_FEATURE_*` flags (read-only, as the negative example); issue #71 comment (widget packages, build-time manifest, one flagship store app).

**Authoritative documentation (as cited in the research files):**

- Autolinking and `expo.autolinking.exclude` in `package.json` only: https://docs.expo.dev/modules/autolinking/
- Tree shaking — stable vs experimental elimination: https://docs.expo.dev/guides/tree-shaking/
- Bundle analysis via `EXPO_ATLAS` and source maps: https://docs.expo.dev/guides/analyzing-bundles/
- App variants via env in `app.config.ts`: https://docs.expo.dev/build-reference/variants/
- Platform-specific modules (`.web.tsx` rules inside and outside `app/`): https://docs.expo.dev/router/advanced/platform-specific-modules/
- Build pricing (free tier limits that constrain the native spike): https://expo.dev/pricing

**Known unknowns:** S5 — whether autolinking exclusion works from an env-driven/generated `package.json` and what prebuild output looks like; S10 — experimental cross-module tree shaking stability (never load-bearing here: exclusion comes from not importing); S11 — Expo Go availability for SDK 58 on stores, which decides whether the Android flagship QA journey needs a development build instead of Expo Go. All three are recorded as spikes or checks, not assumptions.

**Credentials and tools:** none required for the web exclusion work. The optional native spike consumes Expo build quota — free plan is 15 Android + 15 iOS builds/month with a low-priority queue ([expo pricing, cited in research](https://expo.dev/pricing)) — and needs human approval under D-08.

## Task breakdown

| # | Task | Owner | PR unit | Depends on |
|---|---|---|---|---|
| 1 | Widget contract SDK: zod-validated `WidgetManifest` (id, version, capabilities, nativeDeps, configSchema, routes, cards), `defineWidget` / `defineDestination` helpers with literal-type inference, sentinel-export convention | Agent | PR 06-1 | Phase 03 |
| 2 | Six placeholder widget packages (places, transport, tides, local-services, trails, guides): one screen each with loading, empty, error and offline states; one Storybook story each; sentinel export; no business logic or network calls | Junior agent | PR 06-2 | 06-1 |
| 3 | Destination manifests (Cotijuba: places, transport, tides, local-services; Serra demo: places, trails, guides) plus the three build profiles; validation fails fast on unknown widget id, duplicate route pattern or undeclared capability | Agent | PR 06-3 | 06-1 |
| 4 | `tools/compose` generator: emits `apps/app/src/generated/registry.ts` with explicit static imports, route stubs under `apps/app/src/app/(widgets)/`, composed `app.config.ts` fragments (permissions and config plugins from selected widgets' capabilities), an input checksum stamped into output, and a human-readable manifest JSON per profile | Agent | PR 06-4 | 06-3 |
| 5 | Boundary enforcement: ESLint `no-restricted-imports` plus dependency-cruiser rules — widget-to-widget imports forbidden; app-to-widget imports only inside `generated/`; widgets may import only `@guia-la/widget-sdk`, `@guia-la/ui`, `@guia-la/core`, `@guia-la/map`, `@guia-la/api-client`, `@guia-la/contracts` | Junior agent | PR 06-5 | 06-2 |
| 6 | Runtime flags client: fetch per-destination flag set from the API (fixture provider until Phase 07); registry is the closed set; unknown ids from the server are ignored and logged; flags may only hide or reorder registered widgets | Agent | PR 06-6 | 06-4 |
| 7 | Exclusion assertion script (`tools/assert-exclusion.mjs`): per profile, grep source maps for sentinels and package paths of excluded widgets, assert excluded route HTML files do not exist, assert included sentinels do exist; emits a markdown report artifact | Agent | PR 06-7 | 06-4 |
| 8 | CI wiring in the fast gate: `compose` all three profiles, `compose --check` (regeneration is a no-op), exclusion assertions, `expo export -p web` per web profile; upload report and export logs as artifacts on failure | Agent | PR 06-8 | 06-7, Phase 05 |
| 9 | Native one-module exclusion spike (S5, proposed in review R2): generated `package.json` `expo.autolinking.exclude` for one widget with a native dependency; diff `npx expo-modules-autolinking resolve` output and prebuild files (`settings.gradle`, `Podfile.lock`, `AndroidManifest.xml`); record the result against D-06; no general mechanism | Agent, human approves any cloud build spend | PR 06-9 | 06-4 |
| 10 | Documentation: widget authoring guide (contract, boundaries, stories, sentinel convention, how to opt a widget into a destination), flagship-versus-dedicated-build policy note referencing D-06/D-07, and the D-06 evidence entry | Agent | PR 06-10 | 06-8 |

**Notes.** Each PR stays under roughly 400 changed lines; the generator (06-4) is the only one expected near that ceiling and must land with its own tests. Placeholder widgets are deliberately boring — Phase 08 owns real behavior. PR 06-9 is a spike: its deliverable is evidence and an ADR note, not a supported feature.

## Architecture choices and guardrails

**Code locations** are the proposed paths listed under Inputs. The generator owns `apps/app/src/generated/` and the route stub directory; nothing else may write there.

**Core contracts (illustrative, not final):**

```ts
// packages/widget-sdk/src/definition.ts (proposed — illustrative)
import { z } from "zod";

export const widgetManifestSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  version: z.string(),                  // semver of the widget package
  capabilities: z.array(z.enum(["location", "maps", "offlineMaps", "camera"])),
  nativeDeps: z.array(z.string()),      // expo package names, composed into app config
  configSchema: z.record(z.string(), z.unknown()),
  routes: z.array(z.object({ pattern: z.string(), titleKey: z.string() })),
});
export type WidgetManifest = z.infer<typeof widgetManifestSchema>;
```

```ts
// apps/app/src/generated/registry.ts — emitted by tools/compose (illustrative)
// cotijuba-web profile output:
import { places } from "@guia-la/widgets-places";
import { transport } from "@guia-la/widgets-transport";
import { tides } from "@guia-la/widgets-tides";
import { localServices } from "@guia-la/widgets-local-services";

export const widgets = {
  places, transport, tides, "local-services": localServices,
} as const;
// serra-web output imports places, trails, guides — never tides or transport.
```

```ts
// every widget package exports this sentinel (convention, checked in review):
export const __GUIA_WIDGET_TIDES__ = true;
```

**Patterns.** Exclusion happens by *not importing*: the registry contains explicit static imports of selected widgets only, and route stubs exist only for included widgets, so Expo Router's file-based routing cannot discover an excluded route. Generated files are regenerated in CI and verified with `pnpm compose --check` (byte-identical regeneration); the generator stamps an input checksum into its output so a build can always say which manifest inputs produced it. The flagship profile is simply the union of both destinations' widgets plus a destination switcher; `+not-found` renders a branded 404 for stale deep links to excluded routes.

> [!NOTE] Tree shaking is a bonus, never the mechanism. Cross-module unused-export elimination is still marked experimental in the Expo docs ([expo-stack research §1.9](../research/expo-stack.md)); the design must pass with it disabled.

**Forbidden:**

- Wildcard re-exports (`export *` from widget packages) in app code, and any dynamic `require` or `import()` of a widget package outside the generated registry.
- Widget-to-widget imports or deep imports into another widget's internals.
- Relying on Metro tree shaking, `__DEV__` folding or `EXPO_PUBLIC_*` guards as the *primary* exclusion mechanism.
- Presenting runtime-only hiding as "exclusion" in any doc, PR or gate claim.
- Native dependencies not declared in the widget's `nativeDeps`, or permissions not implied by a selected widget's `capabilities`.
- Secrets, private per-destination configuration, or licensed data in `EXPO_PUBLIC_*` values (they are inlined into the client bundle; the Atlas output that records them is treated as a secret artifact and never published).

**Security and privacy implications.** Capability-driven permission composition means a destination build ships only the permissions its selected widgets declare — the exclusion report doubles as a privacy audit of what each build can access on a device. The assertion report and per-profile manifest JSON are the reviewer-facing evidence; both are CI artifacts attached to the gate PR.

**Acceptable alternatives (if the primary design fails):** a Metro custom resolver (fragile across SDK upgrades — last resort, needs a decision note); separate repositories per destination (rejected: multiplies pipelines for no proven need); runtime flags as the only gate (rejected — the legacy app already proved that insufficient); hand-maintained per-destination route groups (rejected: non-deterministic, drifts, cannot support negative assertions).

## Deliverables

- `packages/widget-sdk/` with schema, helpers and type tests.
- Six placeholder widget packages under `packages/widgets/`, each with one screen, four states, one story, sentinel export.
- `destinations/cotijuba/destination.ts` and `destinations/serra/destination.ts`; `profiles/flagship.ts`, `profiles/cotijuba-web.ts`, `profiles/serra-web.ts`.
- `tools/compose/` generator with unit tests and `--check` mode.
- `tools/assert-exclusion.mjs` with the per-profile markdown report format.
- Boundary lint configuration (ESLint rule + dependency-cruiser config) wired into the fast gate.
- Fast-gate CI jobs: compose-check, exclusion assertions, web export per profile (report uploaded as artifact).
- S5 spike evidence: before/after `expo-modules-autolinking resolve` and prebuild diffs, in a PR description or `docs/spikes/S5-native-exclusion.md` (proposed path), plus the updated D-06 evidence entry in the decision register.
- `docs/widget-authoring.md` (proposed) and the flagship-versus-dedicated-build policy note.

## Visual and functional QA

Preview URL patterns are real only once Phase 04a's preview pipeline exists; until then record the pattern as TBD in Phase 04 and attach screenshots to the PRs.

**Manual journeys (human):**

1. Open the Cotijuba web preview: home shows places, transport, tides and local-services cards themed with Cotijuba tokens; the navigation exposes no trails or guides entry.
2. Open the Serra demo web preview: shows places, trails and guides with the Serra theme; no tides, transport or moto-taxi anywhere in the UI.
3. In the flagship web build, switch destinations Cotijuba to Serra from the picker; the union of widgets is present and the switch persists across a reload.
4. Visit a stale deep link to an excluded route (for example a trails URL on the Cotijuba build): a branded 404 renders, never a blank screen or spinner (the legacy indefinite-spinner failure mode, [issue #60](https://github.com/luandro/cotiju-app/issues/60)).
5. Spot-check the assertion report artifact against a fresh export: the human confirms the report's "absent" list matches what the previews actually show.

**Agent journeys:** run the full compose, export and assertion matrix; open each exported HTML route and confirm the sentinel strings of excluded widgets do not appear in view-source; file the screenshots and report as PR evidence. Then deliberately break the build (see Automated verification) and show the gate going red.

| Journey | cotijuba-web | serra-web | flagship web | Android flagship | iOS flagship |
|---|---|---|---|---|---|
| Destination-themed home with correct widget set | yes | yes | yes, both themes | if 04b available, else recorded blocker | build or documented credential blocker |
| Destination switcher | n/a | n/a | yes | if 04b available, else recorded blocker | as above |
| Excluded route deep link gives branded 404 | yes | yes | n/a (union) | if 04b available, else recorded blocker | as above |
| Native spike build proves module absence | n/a | n/a | n/a | spike only (PR 06-9) | optional, if quota allows |

**Error states to verify explicitly:**

- Invalid manifest (unknown widget id) fails compose with a named error.
- A manifest referencing a widget package missing from the workspace fails compose with the missing package name.
- A runtime flag referencing an excluded widget id is logged and ignored without crashing.
- A failed export leaves the previous build's routes intact (no half-exported state served).

## Automated verification

Statuses: **validated** means the command or behavior is verified in a research file (linked); **proposed** means defined here and not yet run. Nothing below has been executed in a guia.la repository.

| Command | Purpose | Status |
|---|---|---|
| `pnpm compose --profile <id>` (all three profiles) | Generate registry, route stubs, config fragments | proposed |
| `pnpm compose --check` | Assert regeneration is byte-identical (no hand edits, no drift) | proposed |
| `npx expo export -p web -s external` | Export each web profile with source maps for assertions | validated — flags verified against `@expo/cli@58.1.21 export --help` ([expo-stack §1.9](../research/expo-stack.md)); the export itself has not been run in this repo |
| `node tools/assert-exclusion.mjs --profile <id> --dist apps/app/dist` | Negative assertions: excluded sentinels, package paths and route HTML absent; included ones present | proposed |
| `EXPO_ATLAS=true npx expo export -p web` | Module-level bundle proof from `.expo/atlas.jsonl`; the file inlines env values, so it is a secret artifact and is never uploaded | validated as documented behavior ([analyzing bundles](https://docs.expo.dev/guides/analyzing-bundles/), cited in [expo-stack §1.9](../research/expo-stack.md)); not yet run here |
| `pnpm lint:bounds` | ESLint + dependency-cruiser boundary rules | proposed |
| `npx tsc --noEmit` | Strict typecheck across the workspace | proposed |
| `npx expo-modules-autolinking resolve` (S5 spike, before/after diff) | Evidence for native exclusion spike | proposed |

**Positive tests:** compose succeeds for all three profiles; flagship registry is exactly the union; each included sentinel appears exactly once per export; destination switcher journey passes the web Playwright smoke from Phase 05.

**Negative tests:** serra-web export contains zero occurrences of the tides, transport and local-services sentinels and zero route files or HTML under their route prefixes; cotijuba-web export contains zero trails and guides sentinels; no excluded package path appears in any source map.

**Deliberate-failure demonstrations (at least one lands in the gate PR):**

1. Add `import "@guia-la/widgets-tides"` to the Serra app shell on a scratch branch: `pnpm lint:bounds` fails, and if forced past it the exclusion assertion fails on the sentinel — evidence the gate cannot silently pass the exact regression this phase exists to prevent.
2. Reference a misspelled widget id in a destination manifest: compose exits non-zero with the offending id and file in the message.
3. Serve a runtime flag set containing `{"tides": true}` to the serra-web build: the client logs the unknown id and renders nothing for it (asserted in a unit test and shown in a screenshot).

## Acceptance gate

> [!GATE] Exclusion is proven, not asserted. The gate passes only when the automated negative assertions pass for both web profiles, the union flagship builds, and a deliberate regression demonstrably turns the gate red.

- [ ] `pnpm compose` and `pnpm compose --check` pass for `flagship`, `cotijuba-web`, `serra-web`.
- [ ] `npx expo export -p web -s external` succeeds for both web profiles and the flagship.
- [ ] Exclusion assertions pass: excluded sentinels, package paths and route HTML absent from each destination web export (report artifact attached to the gate PR).
- [ ] Flagship registry contains exactly the union of both destinations' widgets; destination switcher works in preview.
- [ ] Runtime flags cannot surface an excluded widget (demonstrated with a hostile flag fixture; unknown ids logged and ignored).
- [ ] Boundary lint fails on a widget-to-widget import and on an app-to-widget import outside `generated/` (red demonstration recorded).
- [ ] A deliberate excluded-widget import turns the fast gate red in the correct job (red/green evidence, Phase 05 protocol).
- [ ] S5 spike evidence recorded against D-06 (prebuild and autolinking diffs), or the spike is explicitly marked blocked with what is needed.
- [ ] Widget authoring doc and flagship-versus-dedicated-build policy note merged; D-06 evidence entry updated.
- [ ] Human reviewer signs off the side-by-side previews against the QA journeys.

**Blocks progression if:** any excluded sentinel, package path or route file appears in a destination web export; runtime toggles can bypass build exclusion; boundary rules are absent or untested; the generator's output can drift without `compose --check` failing; or D-06 is treated as settled without the S5 spike being either recorded or explicitly blocked.

**If the owner rejects D-06 / review §8.5:** the master-plan baseline gate is restored — build-time exclusion must then be proven for per-destination *native* builds as well (destination-scoped autolinking exclusion and per-destination native profiles), not for web bundles only, and this phase's gate does not pass on the web-only evidence above.

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Generator drift or non-deterministic output poisons builds | Medium | High | `compose --check` in CI, checksum stamped in output, generator unit tests with golden files |
| SDK upgrade changes autolinking or export behavior (S5, S10 territory) | Medium | Medium | Exclusion never depends on tree shaking; spike re-run listed as an SDK-upgrade checklist item |
| Custom tooling grows beyond maintainable size | Medium | Medium | Scope frozen at compose + assert scripts; anything beyond is a new decision, not silent growth |
| Placeholder widgets accrete real features early | Medium | Medium | Review rejects business logic in `packages/widgets/*` until Phase 08 |
| Native spike consumes build quota or queue stalls (free tier: 15+15 builds/month, low-priority queue per [expo pricing](https://expo.dev/pricing)) | Low | Low | Spike is optional for the gate; human approves spend under D-08; document blocker instead of waiting |
| Route stub deletion breaks stale deep links | Low | Medium | `+not-found` branded 404 journey is part of the gate |

**Sensitive operations needing human approval:** any Expo cloud build spend beyond the free tier (D-08); adding any new native dependency or permission to a shipped profile; relaxing a boundary rule. No production systems exist in this phase — there is nothing to deploy.

**Budget impact:** web-only work runs on GitHub Actions (free for public repos; private-repo allowance to be verified per [review §5](../review.md)). The optional native spike uses free-tier Expo quota; the alert threshold and ceiling come from D-08 when approved.

**Rollback:** every deliverable is a normal PR; revert restores the previous compose output. Generated files are disposable — `pnpm compose` regenerates them — so rollback never depends on generated artifacts.

**Restart instructions for an agent picking up mid-phase:** read this page, [decisions D-06/D-07](../decisions.md) and the widget authoring doc if merged; run `pnpm compose --check` and the exclusion assertions to see the current state; check the gate PR's checklist for the first unchecked box; do not re-litigate settled structure — raise a decision note instead.

## Next phase handoff

To **Phase 07** (backend) and **Phase 08** (widget verticals), the handoff is:

- The `WidgetManifest` schema and the sentinel, route-stub and story conventions, in `@guia-la/widget-sdk` — Phase 08 widgets must satisfy them from their first commit.
- The per-profile manifest JSON and checksum output: Phase 07's `/v1/meta/build` "live commit" idea (proposed in [review R1](../review.md)) reuses the same checksum-and-provenance pattern for deploys.
- The runtime flags client and its closed-set rule: Phase 07's API must serve per-destination flag sets whose ids are validated against published manifests; unknown ids stay ignored-and-logged on the client.
- The exclusion assertion report format, which Phase 08 extends with per-widget bundle-size budgets.
- The capability vocabulary (`location`, `maps`, `offlineMaps`, `camera`) that Phase 08's real widgets will actually exercise (maps decision D-05 pending).
- Open items handed over, not solved here: S5 general native exclusion (deferred per D-06), S10 tree-shaking stability (informational only), tile-source choice for maps widgets (D-05).

The execution brief for this phase lives at [../prompts/phase-06-agent.md](../prompts/phase-06-agent.md); the phase 07 playbook is [phase-07.html](phase-07.html).
