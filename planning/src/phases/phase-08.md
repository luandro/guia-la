---
id: 08
title: First production-grade widget verticals
short: Ship the first real end-to-end visitor journeys - places with map, boat transport, tides and weather, local services, and the Serra trails demo - each with truthful offline, error and freshness behavior.
tag: Product
status: draft
complexity: High (external-data)
depends: 02,03,04,05,06,07
inspect: Storybook stories per widget, two destination web previews, exported web bundles passing exclusion greps, Playwright and Maestro run reports, fixtures with provenance fields
exit: Every widget vertical has docs, stories, tests and provenance evidence on web and Android, with truthful empty, error, offline and stale states - no infinite spinners
---

## Phase identity

Phase **08** turns the platform built in phases 02–07 into the first thing a visitor can actually use: complete widget verticals for real journeys on Cotijuba plus the synthetic Serra demo slice.

- **Objective:** deliver production-grade `places` (with map), `transport` (boat schedules), `tides`/`weather`, `local-services`, and the Serra `trails`/`guides` demo — each an independently reviewable PR series with docs, stories, tests, offline/error states and data provenance (order proposed in [review §8](../review.md)).
- **Prerequisites (must be true before starting):** Phase 02 SDK-58 monorepo and static web export; Phase 03 design tokens and state components; Phase 04 web previews and budgeted native builds; Phase 05 regression gates incl. red/green demos; Phase 06 widget contracts, `compose` generator and exclusion assertions; Phase 07 API with tenant scoping, freshness/provenance columns, ingestion framework and editor console.
- **Dependencies:** phases 02, 03, 04, 05, 06, 07 (see the [index](../index.html)). Widget work parallelizes across PR series once 08-1 (map foundation) lands.
- **Expected contributors:** human — product owner (scope calls), destination editor (fixture accuracy, Cotijuba copy), QA reviewer (manual journeys); agent — widget implementer (one PR series per widget), test writer (Playwright/Maestro/Vitest), reviewer agent (diff + evidence audit).
- **Complexity/risks:** High. Dominant risks: MapLibre on RN 0.88 New Architecture with offline packs is unproven (S6, [expo-stack §3](../research/expo-stack.md)); tide/weather upstream licensing and cost are unresolved; offline caching policy interacts with COOP/COEP headers (D-10, S8). No hour estimates; each widget is sized as its own PR series.

| Phase | What it must provide before 08 starts |
| --- | --- |
| 02 | Pinned SDK 58 monorepo, explicit `web.output: "static"` export, three-target boot evidence |
| 03 | Design tokens, state components, Storybook settled (S9 or its fallback chosen) |
| 04 | Web previews per PR, path-filtered native builds, artifact checksums and retention |
| 05 | Fast gate including red/green demonstrations and the flaky-test protocol |
| 06 | Widget SDK contracts, `tools/compose` generator, exclusion assertions and sentinels |
| 07 | Tenant-scoped API, freshness and provenance schema, ingestion framework, editor console |

## Why this stage exists

Phases 02–07 produce infrastructure; no visitor-facing journey exists until now. The review's executive assessment ([review §1](../review.md)) calls this the pipeline-before-value problem: the only test that matters — *do visitors in Cotijuba trust and use it?* — first becomes answerable here, before real content lands in Phase 09.

Each vertical encodes one legacy defect class as a first-class requirement, so the rewrite cannot silently repeat it:

| Legacy failure | Cotiju reference | Phase 08 countermeasure |
| --- | --- | --- |
| Infinite spinners on slow/failed loads | [#60](https://github.com/luandro/cotiju-app/issues/60) | Every async view renders timeout, empty, error, retry and offline states; time-to-usable under 5 s with the API down (pattern from [PR #52](https://github.com/luandro/cotiju-app/pull/52)) |
| Fabricated stale tide fallback | [#62](https://github.com/luandro/cotiju-app/issues/62) | No fallback data, ever; explicit "unavailable" state with validity window and source |
| Next-boat math ignores weekday, validity, timezone | [#64](https://github.com/luandro/cotiju-app/issues/64) | Server-computed next departure in `America/Belem`; property tests around 21:00 local and validity edges (review R11) |
| Offline blocks navigation via `navigator.onLine` | [#66](https://github.com/luandro/cotiju-app/issues/66) | Offline = cached public snapshots with a visible stale indicator; never a hard block |
| Unverified catalogue values | [#70](https://github.com/luandro/cotiju-app/issues/70) | Provenance (source, checked-at) rendered in the UI, not buried in the schema |

The Serra trails/guides slice exists to prove the white-label claim cheaply: a second destination with *different* widgets (trails, guides; no tides, no boats) riding the same contracts, using synthetic data only.

## Inputs and source references

Paths in the future `guia-la` repository are **proposed**; nothing exists yet.

- Widget packages (proposed): `packages/widgets/places`, `packages/widgets/transport`, `packages/widgets/tides`, `packages/widgets/local-services`, `packages/widgets/trails`, `packages/widgets/guides`; shared map contract `packages/map` (`@guia-la/map`); shared schemas `packages/contracts` (zod + OpenAPI) with the generated client in `packages/api-client`; fixtures `packages/fixtures/cotijuba/`, `packages/fixtures/serra/`.
- App wiring (proposed, generated by Phase 06 `tools/compose`): `apps/app/src/app/(widgets)/<widget>/...` route stubs; `apps/app/src/generated/registry.ts`.
- Destination configs (proposed): `destinations/cotijuba/destination.ts` (adds `places`, `transport`, `tides`, `local-services`), `destinations/serra/destination.ts` (adds `trails`, `guides`); profiles `profiles/flagship.ts`, `profiles/cotijuba-web.ts`, `profiles/serra-web.ts`.
- API surfaces from Phase 07 (proposed): `apps/api/src/routes/v1/places.ts`, `.../transport.ts`, `.../tides.ts`, `.../services.ts`, `.../trails.ts`; freshness/provenance fields and `/v1/meta/build` as specced there.
- Legacy references (read-only): boat schedule columns in [baseline migration](https://github.com/luandro/cotiju-app) (`boat_schedules`: `days_of_week`, `valid_from`, `valid_until`, `is_active`); tide service chain in `src/services/tideService.ts` (audit §8, [legacy audit](../research/legacy-cotiju-audit.md)); static place coordinates in `src/data/locations.ts` and `beachLocations.ts`; PT route names for later 301 mapping (audit §7); `scripts/parseTidePdf.py` as provenance of the OCA tide file.
- Authoritative docs (from research): [Expo maps](https://docs.expo.dev/versions/latest/sdk/maps/) and [platform-specific modules](https://docs.expo.dev/router/advanced/platform-specific-modules/); [tree shaking](https://docs.expo.dev/guides/tree-shaking/) and [bundle analysis](https://docs.expo.dev/guides/analyzing-bundles/) ([expo-stack](../research/expo-stack.md)); [Workbox via Expo PWA guide](https://docs.expo.dev/guides/progressive-web-apps/); MapLibre packages `@maplibre/maplibre-react-native` 11.5.1 and `maplibre-gl` 6.19 (versions verified in [expo-stack §1.1](../research/expo-stack.md)).
- Known unknowns: S6 — MapLibre RN on RN 0.88 New Architecture + offline pack API has not been built (pass criterion: dev-client build on Android and iOS showing an offline region); tile source decision D-05 — hosted OSM-derived tiles vs PMTiles on R2, cost unknown — measure during 08-1; OCA tide dataset license unverified (audit §8) — do not copy the 2025 JSON; upstream tide/weather provider choice, pricing and ToS unreviewed; S8 — `expo-sqlite` on web stays out of scope (D-10).
- Credentials/tools needed: none in the client by policy (review R5 — legacy shipped WorldTides/StormGlass keys in public JS; guia.la forbids it). Any upstream data key is a Worker secret provisioned by the owner; if hosted map tiles require a key, it appears in the style URL and is therefore public-by-design — flag its rotation and budget in D-05 before choosing.

## Task breakdown

| # | Task (goal) | Owner | PR unit | Depends on |
| --- | --- | --- | --- | --- |
| 1 | Map foundation: run spike S6; implement `@guia-la/map` contract with MapLibre native and web impls; offline pack demo on dev builds; decide D-05 tile source with a measured cost note | agent + human (native builds, tile spend) | PR 08-1a contract, 08-1b impls, 08-1c offline demo | 06 |
| 2 | Places widget: directory with search and typed category filter; detail with photo gallery, provenance chip, share and open-in-maps actions; map tab consuming 08-1 | agent | PR 08-2a data+list, 08-2b detail+actions, 08-2c map | 1 |
| 3 | Transport widget: schedule model with weekday, validity window and exceptions; server-computed next departure in `America/Belem`; per-route detail | agent | PR 08-3 | 07 |
| 4 | Tides/weather widget: consume Phase 07 ingestion with validity window and source; explicit unavailable state; never a fabricated fallback | agent | PR 08-4 | 07 |
| 5 | Local services widget: moto-taxi directory with `tel:` actions, editorial-only entries with `contactConsent`/`publishContact` flags recorded by an editor (scope proposed in [review §8](../review.md); no self-registration in v1, D-13b) | agent | PR 08-5 | 07 |
| 6 | Offline behavior: web Workbox precache of shell + versioned public JSON snapshots; native SQLite/file cache of the same snapshots; visible fetched-at and stale indicator | agent | PR 08-6 | 2, 3, 4 |
| 7 | Serra demo slice: `trails` (synthetic GPX geometry, elevation, offline geometry policy) and `guides` directory on `destinations/serra` | agent | PR 08-7a trails, 08-7b guides | 1, 6 |
| 8 | State components pass: one shared `AsyncState` (loading/empty/error/retry/offline/stale) applied to every widget screen; deliberate-failure CI job from Phase 05 patterns | agent | PR 08-8 | 2, 3, 4, 5 |
| 9 | Freshness UX: render source and checked-at per record and per dataset; stale threshold configured per widget in destination config | agent + editor (thresholds) | PR 08-9 | 7, 8 |
| 10 | Exclusion regression: extend Phase 06 assertions to all six widgets — places, transport, tides, local-services, trails, guides; Phase 08 replaces the Phase 06 placeholders rather than adding widgets (sentinels, route absence, source-map greps across the three profiles) | agent | PR 08-10 | 7 |
| 11 | Docs: per-widget `README.md` (contract, config schema, stories index, offline policy); destination-onboarding notes updated | agent | PR 08-11 | 10 |

Notes: each numbered task is independently mergeable and reverses on its own. Task 1 gates every map surface — if S6 fails, task 1 ends with the fallback decision (static map image + deep link, review A4) instead of MapLibre, and tasks 2c/7 shrink accordingly. Content in fixtures is synthetic or explicitly public (Phase 01 classification); real content is Phase 09.

### Widget scope notes

| Widget | Destinations | Surfaces in v1 | Fixture basis | Legacy countermeasure |
| --- | --- | --- | --- | --- |
| places | cotijuba, serra | directory, search, category filter, detail, photos, share, open-in-maps, map tab | Phase 01 sanitized coordinates and categories | #60 states, #61 static-first |
| transport | cotijuba | schedule list, next departure, per-route detail | synthetic timetables incl. edge cases | #64 validity and timezone |
| tides | cotijuba | daily window, source and validity chip, unavailable state | generated series with an end date | #62 no fabricated fallback |
| local-services | cotijuba | moto-taxi directory, tel actions, editorial entries | synthetic contacts | #70 verified catalogue |
| trails and guides | serra | trail list, GPX detail, elevation, guides directory | synthetic GPX, clearly marked demo | offline policy proof |

The tides and weather surfaces share one widget package with separate cards; weather is display-only in v1 (no forecasting logic, only ingestion results from Phase 07).

## Architecture choices and guardrails

- **Widget boundaries:** widgets may import only `@guia-la/widget-sdk`, `@guia-la/ui`, `@guia-la/core`, `@guia-la/map`, `@guia-la/api-client` and `@guia-la/contracts` — never another widget, never the app, never D1. Enforced by the Phase 06 ESLint/dependency-cruiser rules.
- **Data flow:** widgets never fetch arbitrary URLs. All reads go through the generated API client to `/v1/...`; offline reads go through the snapshot store (versioned JSON with `generated_at`), never through ad-hoc caches. No widget ever writes (D-13b: no visitor accounts).
- **Maps:** one typed contract, two implementations, split outside `app/` per [Expo platform rules](https://docs.expo.dev/router/advanced/platform-specific-modules/). Illustrative only:

```ts
// packages/map/src/types.ts (illustrative, proposed)
export interface MapViewProps {
  center: LatLng; zoom: number; markers: MapMarker[];
  offlineRegion?: BBox;      // native only in v1
  onMarkerPress?: (id: string) => void;
}
```

- **Time correctness:** every "today"/"next" computation for schedules and tides happens server-side in the destination timezone (`America/Belem`; treated as fixed UTC-3 with no DST — to verify against the IANA tz database, https://www.iana.org/time-zones). The client renders precomputed strings and never applies device-clock arithmetic (review R11; Cron Triggers themselves run in UTC — [backend research §1](../research/backend-stores-starters.md)).
- **Offline (D-10):** web precaches the app shell and per-destination public JSON snapshots only — network-first for HTML, stale-while-revalidate for static chunks; nothing authenticated exists to cache, and `expo-sqlite`-on-web stays excluded until S8 passes. Native caches the same snapshots in SQLite/files. Cached views always show fetched-at.
- **Forbidden:** fabricated or hardcoded fallback data; third-party API keys in client bundles (R5); `navigator.onLine` as a health signal (legacy #66); infinite/indeterminate spinners as the only loading UI; direct widget-to-widget imports; adding a map dependency other than the two MapLibre packages without a new decision.
- **Security/privacy:** all fixture and API data is public destination content; no personal data, no UGC photos until Phase 09 consent re-collection; `tel:` and share actions are user-initiated only; share URLs are public web routes (SEO surface from D-03).
- **Acceptable alternatives:** static map images + "open in Google/Apple Maps" deep link if S6 fails (review A4); tides widget reading a manually uploaded, provenance-stamped table if no upstream provider is approved — the honest-unavailable state is always acceptable; web-only Storybook galleries if on-device stories prove flaky (S9 fallback).

### Per-widget design notes

- **places** — one configurable domain covers beaches, restaurants, stays and waterfalls (master plan §04); categories are typed unions, not free strings; v1 search runs client-side over the destination snapshot and moves server-side only when content size demands it (measure first).
- **transport** — schedules carry `daysOfWeek`, `validFrom`, `validUntil` and exception dates; the API returns a precomputed departures array for "now"; the client never derives today's date arithmetic itself.
- **tides** — the widget renders a series with source, fetched-at and valid-until; a date outside validity renders the unavailable state even when an older cached series exists.
- **local-services** — entries are editorially verified businesses with `contactConsent` and `publishContact` recorded by an editor; the call action is a plain `tel:` link; nothing about the call is tracked.
- **trails** — geometry is GeoJSON inside the snapshot; the map renders it like any other layer; offline geometry rides the same snapshot cache, with no separate offline pack in v1.

> [!NOTE] Two implementation details from research that agents keep getting wrong: platform-specific files inside `app/` require a non-platform sibling ([platform rules](https://docs.expo.dev/router/advanced/platform-specific-modules/)), and `EXPO_PUBLIC_*` inlining only works with dot access ([env vars](https://docs.expo.dev/guides/environment-variables/)) — both bite widget code first.

> [!DECISION] D-05 (maps and tiles) and D-10 (offline v1) are `proposed` in [decisions.md](../decisions.md). Task 08-1 produces the evidence (S6 result + measured tile cost) but does not mark either approved; only the user does.

## Deliverables

- [ ] `packages/map/` — contract plus `.web.tsx`/`.native.tsx` implementations, S6 spike report appended to `docs/spikes/S6.md` (proposed)
- [ ] `packages/widgets/{places,transport,tides,local-services,trails,guides}/` — each with `README.md`, stories, Vitest suites, widget manifest updated
- [ ] `packages/fixtures/cotijuba/` and `packages/fixtures/serra/` — synthetic or explicitly-public datasets with provenance fields
- [ ] Updated `destinations/cotijuba/destination.ts` and `destinations/serra/destination.ts`; recomposed profiles regenerate route stubs
- [ ] CI: exclusion assertions extended to all six widget sentinels (guides included); offline and error journeys in the Playwright suite; `.maestro/places.yaml` and `.maestro/transport.yaml` flows (proposed paths)
- [ ] Docs: `docs/widgets/*.md` set; destination-onboarding notes updated with the trails precedent
- [ ] Spike artifacts: tile-cost measurement note for D-05; upstream provider comparison (license, price unknown until quoted — mark "unknown — measure in 08-1")

### Fixture data rules

1. Every fixture record is synthetic or drawn from the Phase 01 explicitly-public set; no legacy row is copied verbatim into git.
2. Fixtures mirror the API schema exactly — same field names, same nullability — so Phase 09 imports without widget changes.
3. Edge cases are mandatory, not decorative: a place with no photos, a category with one entry, a route with no Sunday service, a tide series that ends mid-month, a service with no published contact.
4. Every fixture dataset carries a `generated_at` and a fake source name so provenance UI is exercised truthfully.
5. Serra fixtures are visually distinct (mountain names, waterfall categories) so cross-destination leakage is obvious in review.

### Definition of done for every widget PR

1. Fast gate green: types, lint, boundary rules, unit and contract tests.
2. Stories added or updated for every new visual state, including the failure states.
3. Exclusion assertions still pass for all three profiles (a new widget means a new sentinel).
4. The deliberate-failure run for the touched surface is part of the PR evidence.
5. Docs updated in the same PR — contract, config schema, offline policy.

## Visual and functional QA

Manual journeys a human runs on the web preview and an Android emulator (iOS simulator where Phase 04b provides one). Preview URL patterns are whatever Phase 04 established — pattern TBD in Phase 04 if none.

1. **Places:** search a fixture place by name, filter by category, open detail, swipe photos, verify the provenance chip ("source · checked DATE"), share the public URL, open coordinates in the device maps app, switch to the map tab and tap a marker.
2. **Transport:** open transport on a date with departures — verify the next-departure card names the correct weekday; simulate a day with no service — verify an honest "no departures today" state, not tomorrow's first boat mislabeled (legacy #64).
3. **Tides:** check today's curve with source and validity window shown; set the device date beyond the table's end — verify "unavailable after DATE", not an empty success with a fresh timestamp (legacy #62).
4. **Local services:** browse the moto-taxi list, place a `tel:` call on a real device (emulator: verify intent), confirm no login prompt exists anywhere (D-13b).
5. **Offline:** enable airplane mode on the emulator after a first visit — cached places and schedules render with the stale indicator; the map may degrade (acceptable, must say so visually).
6. **Failure:** QA kills the API (or the preview points at an unreachable base) — every screen shows an error card with retry within 5 s; nothing spins forever (legacy #60).
7. **Serra:** switch the Serra profile preview — trails render synthetic GPX tracks and a guides list; tides and transport routes do not exist there (404 via `+not-found`).

| Surface | Web (Chromium) | Android (emulator) | iOS (simulator) |
| --- | --- | --- | --- |
| Places list, detail, map | required | required | required if 04b active |
| Transport next departure | required | required | same |
| Tides with provenance | required | required | same |
| Offline snapshot + stale chip | required | required | same |
| Trails GPX on map | required | required | same |
| Error/empty states | required | required | same |

Expected artifacts: Playwright traces and screenshots per journey, Maestro recordings for Android flows, Storybook story exports per widget, and the JS-disabled OG spot check for one place detail page (D-03 surface).

### Error-state matrix

| Injected condition | Required rendering | Must never happen |
| --- | --- | --- |
| API unreachable (bad base URL) | error card with retry within 5 s | infinite spinner, blank screen |
| API 5xx on one endpoint | that widget degrades, the rest keep working | whole-app failure |
| Empty dataset (no places yet) | honest empty state with an editor hint | fabricated rows or stale legacy data |
| Stale snapshot past threshold | content plus stale indicator with fetched-at | silent presentation as fresh |
| Offline after first visit | cached snapshot plus offline banner | hard block, crash, emptied app |
| Date beyond tide validity | explicit unavailable-after state | yesterday's curve relabelled as today |

## Automated verification

Nothing below has been run; commands marked **validated** exist as verified in research, everything else is **proposed** until a PR links real output.

| Command | Purpose | Status |
| --- | --- | --- |
| `pnpm compose --profile cotijuba-web && pnpm compose --profile serra-web && pnpm compose --profile flagship` | regenerate registries and route stubs | proposed |
| `npx expo export -p web -s external` | export with source maps for exclusion greps | validated (flag verified, [expo-stack §1.9](../research/expo-stack.md)) |
| `EXPO_ATLAS=true npx expo export -p web` | module graph; `.expo/atlas.jsonl` is a secret artifact | validated as documented (same source) |
| `node tools/assert-exclusion.mjs dist/` | sentinel, route and source-map assertions per profile | proposed |
| `pnpm vitest run packages/widgets/transport` | schedule property tests (21:00 local, validity edges, empty day) | proposed |
| `pnpm playwright test e2e/widgets/` | journeys incl. offline (context offline) and JS-disabled OG | proposed |
| `pnpm playwright test e2e/widgets/error.spec.ts` (Playwright route interception to a dead port, or a rebuild with a bad `EXPO_PUBLIC_API_BASE`) | deliberate failure: unreachable API must yield error+retry under 5 s — an exported bundle inlines `EXPO_PUBLIC_*`, so setting an env var at test time cannot redirect it; intercept routes or rebuild | proposed |
| `pnpm exec maestro test .maestro/places.yaml` | Android smoke (local emulator or GH Actions per S13; Expo free tier has no Maestro jobs) | proposed |

Positive and negative pairs: for each widget, one green journey test and one red test that proves the failure state renders (error, empty, stale beyond threshold, offline). The unreachable-port run above is the phase's deliberate-failure demonstration and must be part of the PR evidence, not only local.

### Deliberate-failure demonstrations

1. Unreachable API base across all widget routes (the error.spec.ts run above) — no screen may spin past 5 s.
2. Truncated tide series: a fixture that ends mid-month; out-of-range dates must render the unavailable state, not an empty success with a fresh timestamp (the exact legacy #62 failure shape).
3. Airplane-mode journey in Playwright with the context set offline after a seeded cache; the run fails if any journey hard-blocks on connectivity (legacy #66).
4. Exclusion sabotage: temporarily add the tides sentinel import to the serra profile locally and confirm `assert-exclusion` fails — proving the assertion can actually fail (the Phase 05 red/green pattern applied to composition).

## Acceptance gate

> [!GATE] Phase 08 passes only if every item below is observable in linked evidence. Claims without artifacts fail the phase.

- [ ] All five verticals usable on web and Android: places, transport, tides, local-services (Cotijuba) and trails/guides (Serra) with stories, tests and docs
- [ ] S6 spike closed: MapLibre offline region demo on a dev build, or the fallback decision recorded and applied
- [ ] No fabricated data anywhere: tides beyond validity show "unavailable", transport with no service shows "no departures today"
- [ ] Next-departure correctness tests pass including after 21:00 local, weekday and validity edges
- [ ] Offline first-visit-then-airplane-mode passes on web and Android with a visible stale indicator
- [ ] Deliberate-failure run shows error+retry under 5 s on every widget screen; no infinite spinner survives QA
- [ ] Exclusion assertions pass for all three profiles with all six widget sentinels
- [ ] Provenance (source, checked-at) visible in every record-bearing UI
- [ ] No third-party key appears in any client bundle (grep over exported bundles in CI)
- [ ] D-05 evidence note (tile cost measured or bounded) attached to the decision entry

**Blocks progression if:** S6 is unresolved *and* no fallback chosen; any widget ships without offline/error states; exclusion or secret-scan assertions fail; the tides vertical has no approved upstream source or honest-unavailable design.

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| MapLibre New Arch / offline packs broken (S6) | medium | high | spike first (08-1) before any map UI; fallback static maps + deep links (A4) |
| Tile cost or terms unacceptable (D-05) | medium | medium | PMTiles-on-R2 alternative priced in 08-1; budget ceiling per D-08 |
| Tide/weather upstream licensing unclear (OCA file unverified) | high | medium | honest-unavailable state is shippable; manual provenance-stamped upload path as alternative |
| Widget scope creep into Phase 09 content work | high | medium | fixtures only; content tasks are explicitly out of scope and deferred |
| Storybook/visual flakiness (S9 residue) | medium | low | quarantine protocol from Phase 05; never delete a failing test without human approval |
| Offline snapshot staleness misleads users | medium | high | fetched-at always rendered; stale threshold per widget; tests assert the indicator |

Sensitive operations needing human approval: provisioning any upstream API key; choosing/committing spend on hosted tiles; native build spend beyond the D-08 ceiling; adding any new runtime dependency beyond the pinned MapLibre pair.

Budget impact: tile serving and upstream data calls are the new unknowns — both must come out of 08-1 with a measured or bounded number ("unknown — measure in 08-1" until then). Maestro jobs, if run on Expo Workflows, cost $0.05/job plus minutes ([expo-stack §1.8](../research/expo-stack.md)); the S13 GH Actions emulator path avoids that.

Rollback: every widget is an independent package and PR series. Soft rollback = remove the widget from `includedWidgets` in the destination manifest and recompose (build-time) or flip its runtime flag (visibility only). API routes are additive and versioned, so client rollback never requires API rollback. No store or production-DNS action exists in this phase.

Restart instructions for an agent picking this phase up mid-flight: read `AGENTS.md`, this page, and [../prompts/phase-08-agent.md](../prompts/phase-08-agent.md); check `git log --oneline -- packages/widgets` for the last merged PR in each series; run `pnpm compose` for all three profiles and the fast gate locally before pushing; never proceed past a failing exclusion or secret-scan assertion — that is a stop condition, not a warning.

## Next phase handoff

Phase 09 (see [phase-09.html](phase-09.html)) receives:

- Fixture schemas identical to the production API schemas, so real content needs no widget changes — any divergence is a bug in this phase's contracts.
- Editorial fields (source, checked-at, license, correction contact) already rendered, so the Phase 09 editorial routine has a UI to drive.
- Freshness thresholds per widget configured in destination manifests, ready to be tuned by real editors.
- Open items handed over explicitly: final D-05 tile decision; chosen upstream tide/weather provider or the manual-upload alternative; any deferred iOS verification.
- The exclusion assertion set extended to all widgets, so Phase 09's content imports cannot regress bundle isolation.

Records: the PR evidence for each vertical links its stories, traces and the deliberate-failure output; the D-05/D-10 decision entries in [decisions.md](../decisions.md) gain their evidence links (status stays `proposed` until the user decides).
