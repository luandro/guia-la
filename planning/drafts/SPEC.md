# guia.la — platform spec (draft)

> **DRAFT — not in force until approved in Phase 00.** Feedstock for the future
> guia.la application repository's `SPEC.md`. Derived from master plan v0.2 §01–§04,
> [review.md](../review.md), [decisions.md](../decisions.md).
>
> **Decision status rule:** a proposal tagged with a decision ID (D-xx) carries that
> decision's status in [decisions.md](../decisions.md) — only D-00 (platform identity)
> and D-13a (no account required to read public destination information) are
> `approved`; every other D-xx is
> `proposed`/`validated` and becomes real only after its user decision and phase gate.

## 1. Goals

- One shared core for web, Android and iOS, with native exceptions only where
  justified (client stack proposed, D-02).
- Fast onboarding for destinations: not bespoke engineering per destination.
- Verified local content, community ownership, practical information.
- Low, predictable infrastructure and operational cost.
- Agent-driven delivery with automated, inspectable quality evidence.

## 2. Non-goals

- No wholesale copy of legacy Cotiju schema, services or auth system.
- Not three separately maintained apps before evidence demands them (D-07
  proposed: one flagship app + destination web profiles).
- No marketplace or dynamic plugin loader in v1.
- Accounts never required to read public destination information (D-13a,
  approved by charter).
- No unverified schedules, made-up data, or silent stale fallbacks.
- No expensive native build on every trivial PR (D-08 proposed).

## 3. Personas

- **Destination operator** — a local person or organization publishes and
  maintains places, services and schedules without developers.
- **Visitor** — finds reliable information quickly, shares a page, navigates
  and uses core content without an account.
- **Developer/agent** — a new widget or destination is a bounded change with
  explicit contracts, builds, tests and QA artifacts.

## 4. Glossary

- **Destination** — a deployment of the platform for one place (brand, locale,
  widget allowlist, app identities, runtime configuration). Cotijuba is the
  first (approved identity, D-00).
- **Widget** — a versioned, testable feature package, not necessarily a tiny
  card: can contribute a card, route, map layer, editorial form and backend
  schema. Beaches and waterfalls share one configurable Places domain.
- **Build profile** — the list of destinations a single build serves; the
  widget set of a build is the union of its destinations' allowlists.
- **Flagship** — the one multi-destination native store app containing the
  union of destination features (proposed, D-07).
- **Runtime flag** — per-destination server-fetched flag that can only
  hide/reorder widgets already compiled into the build (the registry is a
  closed set; unknown IDs ignored and logged).
- **Snapshot** — a versioned, per-destination export of public JSON used for
  offline use; shows users its max-age (offline rule, D-10 proposed).
- **Provenance** — the record of where a fact came from and when it was last
  checked: `source`, `sourceUrl`, `checkedAt`, `validFrom`/`validUntil`,
  `license`, `correctionContact`; the API adds derived `stale: boolean` and
  `ageSeconds`.

## 5. Widget contract (illustrative)

```ts
// ILLUSTRATIVE — validates the shape, not a final API. Real contract is
// proposed (D-06) and proven by Phase 06 exclusion gates.
import type { ZodSchema } from "zod";

export interface WidgetDefinition<C> {
  id: string;                    // stable id, e.g. "places"
  version: string;               // semver, monotonic
  configSchema: ZodSchema<C>;    // validated against manifest at compose time
  capabilities: Capability[];    // e.g. "location" | "maps" | "offlineMaps"
  cards: WidgetCard[];           // destination home / section cards
  routes: WidgetRoute[];         // e.g. app/(widgets)/<id>/... stubs
  stories: Story[];              // required, incl. error + offline states
  analyticsEvents: EventName[];  // named events only
  // Outputs also include tests + bundle proof (CI), not part of the type.
}
```

## 6. Destination manifest (illustrative)

```ts
// ILLUSTRATIVE — from master plan §04; zod-validated by the compose tool.
export default defineDestination({
  id: "cotijuba",
  brand: { name: "Cotijuba", locale: "pt-BR" },
  timezone: "America/Belem",            // per-destination timezone
  includedWidgets: ["places", "transport", "tides", "local-services"],
  config: {
    places: { categories: ["beaches", "restaurants", "stays"] },
    transport: { modes: ["boat"] },
    "local-services": { categories: ["moto-taxi"] },
  },
});
// Build profiles (e.g. profiles/flagship.ts, profiles/cotijuba-web.ts) list
// the destinations a build serves; widget set = union of their allowlists.
// Generator emits explicit static imports — no wildcard registry, and a
// disabled widget is never imported (cannot be bundled).
```

## 7. API principles

- **Public reads need no account** (D-13a, approved): every public GET endpoint
  is anonymous and cacheable; visitors never authenticate.
- **Writes are tenant-scoped and server-checked**: roles (`editor`, `admin`)
  scoped to `destinationId`, checked on every write; D1 has no RLS, so
  isolation lives in one repository layer (D-04/D-09, proposed).
- **Freshness fields on every public entity**: `source`, `sourceUrl`,
  `checkedAt`, `validFrom`/`validUntil`, `license`, `correctionContact`, plus
  derived `stale` and `ageSeconds`. No silent stale fallbacks — a stale value is
  shown as stale.
- **Explicit error semantics**: every public API response has explicit error
  and freshness semantics (plan §03 hard constraint).
- **Upstream calls are server-side** (D-04 proposed): no third-party keys in
  client bundles; scheduled ingestion for tides/weather, never device-clock
  schedule math.

## 8. Timezone rule

- Each destination manifest declares its IANA timezone; Cotijuba uses
  `America/Belem`.
- All schedule/tide/departure math is computed server-side in the destination
  timezone (never the device clock — legacy bug class #64); cron schedules run
  in UTC with Belém conversion in code.
- Property tests around 21:00 local and validity edges (`validFrom`/`validUntil`)
  are required for any schedule/tide code.

## 9. Offline rule

- Web (D-10, proposed): Workbox precache of the app shell plus public JSON
  snapshots per destination — versioned, max-age shown to users.
- Native (D-10, proposed): SQLite/file cache of the same public snapshots.
- Never cache authenticated responses (legacy incident #65 cached them).
- No `expo-sqlite` on web until spike S8 proves COOP/COEP is workable.

## 10. Quality gates summary

- **Fast PR gate** (every PR, < 10 min target): `tsc --noEmit`, ESLint +
  boundary rules, Vitest unit/contract, zod schema checks, compose per profile
  + widget-exclusion assertions, `expo export -p web`, Playwright smoke incl.
  JS-disabled OG checks, API tests on local D1 incl. tenant A/B, secret scan.
- **Visual gate** (UI/widget PRs): Storybook web build + screenshot diff + axe.
- **Native gate** (D-08, proposed): label/path-filtered builds + nightly;
  never per-trivial-PR; budget ceiling set by user.
- **Nightly/RC**: per-profile native builds, Maestro, WebKit Playwright,
  weekly automated restore drill (latest R2 export into a scratch D1) plus a
  quarterly human-witnessed drill.
- **Human release gate**: real-device checks (low-end Android on 3G in
  Cotijuba), content validation, store metadata; store publication itself is
  a stop-and-ask action.
- Flaky protocol: quarantine label + linked issue + 7-day expiry; never
  delete or skip a failing test without human approval.

## 11. Open decisions

Statuses live in [decisions.md](../decisions.md) — nothing here is approved
except D-00 and D-13a. Open, ranked: D-03 (SEO rendering), D-06 (widget
exclusion scope), D-09 (editor auth), D-05 (map tiles), D-08 (CI/build
spend), D-01 (names/IDs/domain), D-11 (licensing), D-12 (legacy key
rotation — owner action).
