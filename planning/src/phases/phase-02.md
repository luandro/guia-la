---
id: 02
title: Bootstrap Expo universal monorepo with a walking skeleton
short: Create the pinned SDK 58 Expo Router workspace that builds one reference Places journey from fixtures on web, Android and iOS — and prove raw-HTML SEO on the static web export (spike S1).
tag: Build
status: draft
complexity: High (foundational)
depends: 00
inspect: The guia-la monorepo, a runnable web export with per-route OG tags, and Android or iOS boot evidence — all reproducible from a clean clone with documented commands
exit: Clean clone reproduces the web export with raw-HTML OG assertions passing for list and detail routes; native boot evidenced or recorded as credential-blocked with exact setup steps; S1 result recorded against D-03
---

Phase 02 turns the guia.la platform from documents into a building repo. Per
the review's proposal (§8 edit 1, [review.md](../review.md)), this phase
absorbs two things the master plan originally deferred: the **SEO spike S1**
(the riskiest web assumption) and a **walking skeleton** — one real Places
list/detail journey over fixture data — so the first end-to-end slice exists
before infrastructure phases 03–06 deepen.

Everything here runs **free and local first**: no paid cloud builds (that is
Phase 04b), no backend (Phase 07), no store submission (Phase 10). Native
verification is honest about hardware: if no Apple hardware or EAS account is
available, the gate records the exact blocker instead of pretending.

> [!NOTE] Versions below were verified against npm and Expo docs on
> 2026-11-21 ([expo-stack research](../research/expo-stack.md)). Re-verify
> with `npx expo-doctor` at execution time; pin what is current then unless
> an SDK 59 exists and a fresh compatibility check says otherwise.

## Phase identity

- **Number:** 02 — third phase. The S1 spike may start in parallel with
  [01](phase-01.html) per [review §10](../review.md); only the fixture wiring
  (task 02-5) truly needs 01's outputs.
- **Objective:** a pnpm monorepo whose Expo Router app renders one Places
  list and detail journey from synthetic fixtures on web (static export with
  per-route OG in raw HTML) and boots on Android (and iOS where hardware
  allows), with versions pinned and every command documented.
- **Prerequisites:** Phase [00](phase-00.html) decisions recorded — D-01
  names before identifiers are pinned; D-02/D-03 carry `proposed` status and
  this phase produces their evidence.
- **Dependencies:** 00. Phase 01 runs in parallel; only the fixture wiring
  (task 02-5) consumes 01's outputs, and a temporary seed covers 01 lagging.
- **Expected contributors:**

| Role | Human or agent | Responsibility |
|---|---|---|
| Product owner | Human | Approves stack pin (D-02) and reacts to the S1 result (D-03); provides hardware/accounts if native boot needs them |
| Implementation agent | Agent | Monorepo setup, app config, walking skeleton, spike, docs |
| Orchestrator agent | Agent | Reviews diffs, keeps scope at one journey, guards the forbidden list |
| Junior implementation agent | Agent | Mechanical pieces (package skeletons, config plumbing) via the ladder |

- **Complexity/risks:** High; risk note **foundational** — every later phase
  inherits these pins and layout, and the two known traps (Router static
  output semantics; env handling) both bite here first.

## Why this stage exists

The stack choice — one Expo/React Native codebase for web, Android and iOS —
is still a **hypothesis** until it builds and boots from this repo
([decisions D-02](../decisions.md)). The review verified versions and
documentation ([expo-stack §1](../research/expo-stack.md)) but nothing was
run; that is precisely what this phase is for.

The riskiest single assumption is SEO: Expo Router's `static` output promises
per-route HTML with OG tags emitted by `generateMetadata()`, but dynamic
routes need `generateStaticParams` (so every published place requires a
re-export), the SDK 58 docs contradict themselves on the default
`web.output`, and `<Head>`-based patterns from older tutorials silently stop
working in static HTML ([expo-stack §1.3](../research/expo-stack.md)). Moving
S1 here — proposed in [review §8](../review.md) — means the go/no-go evidence
for D-03 exists before any content architecture is built on top of it.

The walking skeleton exists because of the legacy lesson: Cotiju's home page
waited on empty database tables and spun forever ([legacy #60](../research/legacy-cotiju-audit.md)).
guia.la's first screen is therefore fed by local fixtures with explicit
loading/empty/error states wired from day one — the failure modes are part of
the skeleton, not an afterthought.

## Inputs and source references

- Decision inputs: [decisions D-02, D-03](../decisions.md); red-team rows
  [R3 (SEO)](../review.md) and the compatibility table in
  [review §3](../review.md).
- Verified version baseline ([expo-stack §1.1](../research/expo-stack.md)):
  expo 58.0.26, react-native 0.88.1, react/react-dom 19.3.x (SDK pin),
  react-native-web 0.21.4, expo-router 58.0.32; Node 22.13+/24.3+ (24 LTS
  chosen, `.nvmrc`); New Architecture is mandatory and not disableable on
  SDK 55+.
- Authoritative docs used as the source for each mechanism:
  [static rendering](https://docs.expo.dev/router/web/static-rendering/),
  [SDK 58 changelog](https://expo.dev/changelog/sdk-58),
  [SDK 57→58 migration](https://docs.expo.dev/router/migrate/sdk-57-to-58/),
  [environment variables](https://docs.expo.dev/guides/environment-variables/),
  [bundle analysis](https://docs.expo.dev/guides/analyzing-bundles/).
- Fixtures and domain shapes from Phase [01](phase-01.html)
  (`packages/fixtures/cotijuba/` with `packages/fixtures/serra/` alongside,
  Place verdict rows). If 01 lags, a minimal built-in seed of five synthetic
  places stands in and is swapped later.
- Legacy contrast cases (why states matter): issues
  [#60](https://github.com/luandro/cotiju-app/issues/60) and
  [#66](https://github.com/luandro/cotiju-app/issues/66) — spinner and
  offline-gating failures the skeleton must visibly not reproduce.
- **Known unknowns:** whether the SDK 58 default template alias is still
  `default@sdk-58` at execution time ([expo-stack S11](../research/expo-stack.md));
  whether `web.output` unset behaves as `single` or `server` (S2 — made
  irrelevant by setting it explicitly); real OG output of our build (S1 —
  this phase answers it); Android SDK/emulator availability on the working
  machine; iOS tooling (needs macOS hardware — EAS deferred to Phase 04b).
- **Credentials/tools needed:** Node 24, pnpm, git; optionally Android SDK +
  emulator for local boot; optionally Xcode on macOS. **No cloud accounts,
  no API keys, no secrets** — there is no backend yet, so nothing has
  business being in `EXPO_PUBLIC_` variables.

## Task breakdown

| # | Task and goal | Owner | PR unit | Depends on |
|---|---|---|---|---|
| 1 | Starter spike A1: scaffold with the official create-expo-app template, confirm it boots web, and record what the template ships ([review §7 A1](../review.md)) | Agent | PR 02-1 | Phase 00 |
| 2 | pnpm workspace + package skeleton per the canonical layout below: Phase 02 creates apps/app plus packages/core, ui, fixtures, widget-sdk (empty but compiling) and tools/; the remaining tree names are reserved for their owning phases | Agent | PR 02-2 | 02-1 |
| 3 | Version pinning and toolchain: lockfile committed, `.nvmrc` Node 24, `expo install --check` and `expo-doctor` scripts, `tsc --noEmit` typecheck script | Agent | PR 02-3 | 02-2 |
| 4 | App config: app.config.ts with explicit `web.output: "static"`, async-routes decision recorded, `APP_ENV` (environment: development/preview/staging/production) and `APP_VARIANT` (build profile: flagship, cotijuba-web, serra-web) — both zod-validated, build fails on a missing var (pattern credited to Obytes, [starters §3](../research/backend-stores-starters.md)) | Agent | PR 02-4 | 02-3 |
| 5 | Domain core + fixtures wiring: Place and Category types in packages/core, fixture loader in packages/fixtures (from Phase 01, or the temporary seed) | Agent | PR 02-5 | 02-2, Phase 01 |
| 6 | Walking skeleton routes: places list at a stable URL and `places/[slug]` detail with `generateStaticParams` + `generateMetadata`, plus visible loading, empty, error and offline-hint states | Agent | PR 02-6 | 02-4, 02-5 |
| 7 | S1 spike: static web export, then raw-HTML assertions (curl/grep and a JS-disabled check) that list and every detail page carry title, description and `og:` tags; record result against D-03 | Agent | PR 02-7 | 02-6 |
| 8 | Deliberate-failure demonstrations: remove `generateStaticParams` and show the detail page vanishes from dist while the assertion fails; unset a required env var and show the build fails fast | Agent | PR 02-8 | 02-7 |
| 9 | Local native boot: Android emulator run of the skeleton with screenshots; iOS simulator if macOS hardware exists; otherwise record the exact credential/hardware blocker per the honesty rule | Agent (+ human if hardware) | PR 02-9 | 02-6 |
| 10 | EAS configuration files: eas.json with dev/preview/production variants and APP_ENV/APP_VARIANT wiring — files only, no builds, no accounts (builds are Phase 04b) | Agent | PR 02-10 | 02-4 |
| 11 | Docs: README clean-clone reproduction commands, getting-started notes, ADR updates recording D-02 pin and the D-03 spike result | Agent | PR 02-11 | 02-7, 02-9 |

The one journey rule: if a change is not needed by the Places list/detail
slice, the pins, or the states, it does not belong in Phase 02. Maps,
Storybook, CI pipelines, theming and the widget compiler are phases 03–06.

## Architecture choices and guardrails

- **Workspace layout (proposed; canonical — defined once here, referenced by
  every later phase):**

```text
guia-la/
  apps/app/                  Expo Router application (the only runnable app)
    app.config.ts            static web output, variants, env validation
    src/app/                 route tree (places list + [slug] detail first)
    src/app/(widgets)/       widget route stubs (created in Phase 06)
    src/generated/           reserved for the Phase 06 composer output
  apps/api/                  Hono Worker (created in Phase 07)
  packages/core/             domain types (Place, Category, Destination)
  packages/ui/               shared primitives (starts nearly empty)
  packages/widget-sdk/       widget contract types (empty until Phase 06)
  packages/widgets/<id>/     one package per widget (Phase 06+)
  packages/map/              map layer (Phase 08)
  packages/contracts/        zod schemas + OpenAPI (Phase 07)
  packages/api-client/       generated typed client (Phase 07)
  packages/db/               D1 access only (Phase 07)
  packages/fixtures/
    cotijuba/                synthetic Cotijuba-shaped datasets (Phase 01)
    serra/                   synthetic Serra-demo datasets (Phase 01)
  packages/testing/          test helpers only, never fixtures (Phase 05)
  destinations/<id>/         destination manifests (Phase 06)
  profiles/                  build profiles (Phase 06)
  tools/compose              widget composer script (Phase 06)
  eas.json                   dev/preview/production variants (files only)
  .nvmrc                     node 24
  pnpm-workspace.yaml
```

Phase 02 creates only what it needs (task 02-2); every other entry is a
reserved canonical name created by its owning phase, so no later phase renames
a directory.

- **Route and metadata contract (illustrative):**

```tsx
// illustrative — apps/app/src/app/places/[slug].tsx
import type { Metadata } from "expo-router/server";

export function generateStaticParams() {
  return allFixtures().places.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }): Metadata {
  const place = placeBySlug(params.slug);
  return {
    title: `${place.name} — guia.la pilot`,
    description: place.summary,
    openGraph: { title: place.name, description: place.summary },
  };
}
```

- **Patterns adopted deliberately:** explicit `web.output: "static"` (never
  rely on the contradictory default, [expo-stack §1.3](../research/expo-stack.md));
  `generateMetadata()` for OG and **never** the SDK 58-broken `<Head>` pattern
  ([migration notes](https://docs.expo.dev/router/migrate/sdk-57-to-58/));
  env access only through a zod-validated config module; states-first data
  loading (every async view renders loading, empty, error).
- **Forbidden in this phase:** cloud accounts, CI credentials, paid builds,
  real Cotijuba content (fixtures only), any second journey (tides, boats,
  maps), native config plugins beyond the template set, secrets or API keys
  anywhere (there is no consumer yet), adopting Ignite/Obytes/T3 templates
  ([review R13](../review.md)) — patterns are hand-ported, not inherited.
- **Security/privacy implications:** nothing secret exists to leak yet, which
  is the point of doing this phase before a backend: the secret-handling
  habits (no values in configs, no keys in client env) are set while the cost
  of enforcing them is zero. Atlas/source-map outputs from bundle analysis
  contain inlined env values and are treated as secret artifacts, never
  committed ([expo-stack §1.9](../research/expo-stack.md)).
- **Acceptable alternatives:** Next.js web + separate RN app (fallback per
  [review §1](../review.md) **only if S1 fails** — two rendering stacks, the
  thing this platform exists to avoid); `web.output: "server"` via the
  undocumented workerd adapter (rejected — "no continuous tests" warning in
  the Expo docs); Expo Hosting free tier instead of Cloudflare (possible, but
  custom domains are paid and the review recommends Workers Static Assets).

## Deliverables

- [ ] Monorepo with the layout above, lockfile committed, `.nvmrc` set (PR 02-2/02-3)
- [ ] `pnpm typecheck` (tsc --noEmit) script passing on the skeleton — first run is the evidence (PR 02-3)
- [ ] `app.config.ts` with explicit static web output and env validation that fails on missing vars (PR 02-4)
- [ ] Places list + detail routes rendering fixtures with all four states reachable (PR 02-6)
- [ ] `dist/` static export where list and every detail page carry OG tags in raw HTML (PR 02-7)
- [ ] S1 spike result recorded in the ADR for D-03 with go/fallback recommendation (PR 02-7/02-11)
- [ ] Deliberate-failure demos evidenced in PR 02-8 (route vanishes; env guard trips)
- [ ] Android boot screenshots or the exact recorded blocker; iOS same (PR 02-9)
- [ ] `eas.json` variants present, untouched by any build run (PR 02-10)
- [ ] README documents the full clean-clone reproduction sequence (PR 02-11)

## Visual and functional QA

Preview patterns that are real in this phase: local only —
`http://localhost:8081` via `npx expo start`, and the exported
`dist/` served locally (for example `npx serve dist`). Remote preview
patterns are TBD in Phase 04.

- **Human journey (web):** clean clone, run the README commands, open the
  local preview, walk list → detail → back; force each state (empty fixture
  set, malformed fixture, offline via devtools) and confirm a visible,
  labeled state — never a spinner with no deadline ([legacy #60](../research/legacy-cotiju-audit.md)
  is the anti-example).
- **Human journey (share preview):** paste a detail page URL into a
  link-preview tool (or WhatsApp draft) from the locally served export and
  confirm the card shows title/description — this is the human version of S1.
- **Agent journey:** from a clean clone, reproduce the export and re-run the
  OG assertions; then delete one fixture place, re-export, and confirm the
  detail page for it is gone while others remain.
- **Platform matrix:**

| Target | Expected in this phase | Evidence |
|---|---|---|
| Web (static export) | Full journey + raw-HTML OG | curl output, screenshots |
| Android (local emulator/dev client) | Skeleton boots, list/detail navigable | Screenshots or recording |
| iOS (simulator on macOS, if available) | Same as Android | Screenshots, or recorded blocker |
| Native cloud builds | Not attempted | Deferred to Phase 04b per review §8.3 (proposal) |

- **If the owner rejects §8.3 (the 04a/04b split):** the master-plan baseline
  is restored — native cloud builds become a required part of Phase 04's own
  exit gate instead of a deferrable 04b (still budget-capped by D-08); record
  the ruling in an ADR before relying on the deferral.

- **Error states required:** fixture load failure (error state with retry),
  empty fixture set (empty state with explanation), unknown slug (branded
  not-found), missing env at build time (hard failure with a named variable).
  Any unbounded spinner anywhere fails QA.

## Automated verification

Markers: **validated** = the command/mechanism is verified in the research
files (still to be run on guia.la code); **proposed** = invented for this
repo, flags may need adjusting at first run.

```bash
# proposed — scaffold (template alias re-check is part of the task; S11)
npx create-expo-app@latest apps/app --template default@sdk-58
```

```bash
# proposed (inference) — doctor and pin checks follow the recommended CI
# pattern ([expo-stack §2.7](../research/expo-stack.md)); not run in research
npx expo-doctor
npx expo install --check
```

```bash
# validated — static export is the documented mechanism; source-map mode's
# flags were verified via --help ([expo-stack §1.9](../research/expo-stack.md))
npx expo export -p web
npx expo export -p web -s external
```

```bash
# validated — Atlas bundle listing exists and writes .expo/atlas.jsonl;
# the artifact is SECRET (inlined env values) — never commit it
EXPO_ATLAS=true npx expo export -p web
```

```bash
# proposed — S1 raw-HTML assertions (the spike's core check). Expected:
# every grep finds its tag; a miss prints the file and exits 1.
test -f dist/index.html || exit 1
for f in dist/places/index.html dist/places/*.html; do
  grep -q 'og:title' "$f" || { echo "$f"; exit 1; }
  grep -q '<title>' "$f" || { echo "$f"; exit 1; }
done
```

- **Deliberate-failure demonstration 1 (evidence in PR 02-8):** remove `generateStaticParams` from the detail route and re-export — the expected observable is `dist/places/<slug>.html` missing from dist (or the assertion failing), proving the S1 check can actually fail.
- **Deliberate-failure demonstration 2 (evidence in PR 02-8):** unset a required env var and run the build — the expected observable is an immediate, named-variable failure from the zod guard, not a runtime surprise later (a pattern legacy PR #52 proved valuable).
- **Positive + negative pairing:** every assertion above has a demonstrated
  failure mode or is paired with one in PR 02-8; a check that has never
  failed is not yet evidence.

## Acceptance gate

> [!GATE] Phase 02 passes when a clean clone reproduces the web export and
> its raw-HTML OG assertions, the skeleton shows all four states on the one
> journey, and native boot is either evidenced or blocked with the exact
> requirement recorded. S1's result must exist as a recorded ADR note —
> "seemed fine" is not a result.

- [ ] Clean clone + README commands produce the export on a second machine (or a fresh container) — recorded in PR evidence
- [ ] OG assertions pass for list and all detail pages; deliberate-failure demo shows them failing when the route is removed
- [ ] Env guard fails fast on a missing variable (demo evidenced)
- [ ] `pnpm typecheck` runs and reports zero errors on the skeleton (first real run = the evidence; no prior run is claimed)
- [ ] Android boot evidenced, or blocker recorded with exact setup steps; iOS likewise
- [ ] D-02 and D-03 ADRs updated with execution-time evidence and honest statuses (`validated` at most — never `approved` without the user)
- [ ] No cloud accounts, no secrets, no real content, one journey only

**Blocks progression if:** S1 fails and no fallback decision is recorded
(blocks Phase 03+ web assumptions and forces the D-03 alternative discussion
now — by design); typecheck is not wired (every later phase inherits the
legacy 455-hidden-errors failure mode, [review §3](../review.md)); the states
are missing (Phase 08's reliability work would build on a spinning
foundation).

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| S1 fails: no OG in raw HTML or unusable rebuild semantics | Medium | High | This is why the spike is here; fallback (Hono share pages) is pre-written in [D-03](../decisions.md); owner decides with spike data |
| Template/SDK drift since 2026-11-21 research | Medium | Medium | Task 02-1 re-verifies; expo-doctor gate; pins follow whatever is current-and-compatible, recorded in the ADR |
| Metro/env traps (NODE_ENV forcing, staging loading prod env) | Medium | Medium | Explicit APP_ENV/APP_VARIANT + zod guard; documented SDK 58 behavior in [expo-stack §1.1](../research/expo-stack.md) |
| Native hardware unavailable | Medium | Low-Medium | Local emulator or recorded blocker; cloud builds already deferred to 04b with budget gate D-08 |
| Scope creep beyond one journey | High | Medium | One-journey rule in the task table; orchestrator rejects additions to this phase's PRs |
| Monorepo layout churn later | Low-Medium | Medium | Layout matches the Phase 06 composer plan ([review §4](../review.md)); changes go through ADRs |

- **Sensitive operations needing human approval:** none inherent — no
  accounts, spend or publication exist here. If native boot turns out to
  require an EAS account or Android SDK license acceptance, that is a human
  decision recorded as a blocker, not something the agent creates alone.
- **Budget impact:** zero required. Optional local emulator usage is free;
  anything billable is out of scope by the forbidden list.
- **Rollback:** the phase is a repo state — revert PRs. The export and Atlas
  artifacts are disposable. If S1 fails catastrophically, the repo remains
  useful for the native track while the D-03 fallback is decided.
- **Restart instructions for an agent picking up mid-phase:** read the README
  and this page; check merged `PR 02-*` units and `docs/evidence/`
  artifacts; run `pnpm install && pnpm typecheck` first — a typecheck that
  does not reproduce the last recorded state means someone changed pins
  without a PR; then resume the lowest unfinished task. If mid-spike (02-7),
  re-run the export before touching assertions — never trust a stale `dist/`.

## Next phase handoff

- To Phase 03 (design system/Storybook): the compiling `packages/ui` shell,
  the skeleton screens as first story candidates, and the S9 compatibility
  spike warning ([review R10](../review.md)) — Storybook setup starts with a
  spike and a fallback, not an assumption.
- To Phase 04 (pipeline): the exact reproduction commands from the README
  become the fast-gate script; the recorded native blockers become 04b's
  credential setup list; nothing in 02 may have assumed CI.
- To Phase 06 (widget composer): the reserved `src/app/(widgets)/` and
  `src/generated/` directories, and the fixture-loader seam (fixtures are
  consumed, not imported ad hoc).
- Records required by all later phases: D-02/D-03 ADR notes with execution
  evidence; the pinned dependency set as committed lockfile; the states
  inventory (which views implement which states) so Phase 05 can test them.
- Open items handed forward explicitly: iOS evidence if blocked; async-routes
  decision note; any pins that had to deviate from the research baseline and
  why.
