# guia.la — platform spec

> Phase 00 deliverable (PR 00-4). It comes into force when the owner approves it.
> Decision statuses are copied verbatim from the register, [planning/decisions.md](planning/decisions.md), as of 2026-11-21. The register is the source of truth. Never upgrade a status here.

## 1. Identity

- Platform: **guia.la**. Repository: `luandro/guia-la` (this repo).
- Pilot destination: **Cotijuba** (D-00, approved).
- Demo destination: **Serra**, a synthetic mountain destination. Serra uses synthetic fixture data only.
- **Cotiju** is the legacy app only: `luandro/cotiju-app`. It is never renamed. Historical URLs stay as they are.
- Names (D-01, approved 2026-11-21): npm scope `@guia-la/*`; bundle/package ID candidate `la.guia.app`. The owner does not own `guia.la` yet. The owner must buy it before the first store release. The first white-label web deploy (Cotijuba) goes on `cotiju.app`.

## 2. Goals

- One shared core for web, Android and iOS. Native exceptions only where justified (client stack proposed, D-02).
- Fast onboarding for destinations. Not bespoke engineering per destination.
- Verified local content, community ownership, practical information.
- Low, predictable cost. All free tiers for now (D-08, approved): no Workers Paid, no Expo Starter.
- Agent-driven delivery with automated, inspectable quality evidence.

## 3. Non-goals

- No wholesale copy of the legacy Cotiju schema, services or auth system.
- Not three separately maintained apps before evidence demands them (D-07 proposed: one flagship app plus destination web profiles).
- No marketplace or dynamic plugin loader in v1.
- No account is ever required to read public destination information (D-13a, approved).
- No unverified schedules, made-up data, or silent stale fallbacks.
- No native build on every trivial PR (D-08, approved: builds run by label or path filter only).

## 4. Personas

- **Destination operator** — a local person or organization. They publish and maintain places, services and schedules without developers.
- **Visitor** — finds reliable information fast, shares a page, navigates, and uses core content without an account.
- **Developer/agent** — a new widget or destination is a bounded change with explicit contracts, builds, tests and QA artifacts.

## 5. Glossary

- **Destination** — one deployment of the platform for one place: brand, locale, widget allowlist, app identities, runtime configuration. Cotijuba is the pilot (D-00, approved). Serra is the synthetic demo destination.
- **Widget** — a versioned, testable feature package. A widget is not necessarily a tiny card. One widget can contribute a card, a route, a map layer, an editorial form and a backend schema. Beaches and waterfalls share one configurable Places domain.
- **Widget ids** — `places`, `transport`, `tides`, `local-services`, `trails`, `guides`. Boats and ferries are not a widget. The id is `transport`; a boat is a mode (`modes: ["boat"]`).
- **Build profile** — the list of destinations one build serves. The widget set of a build is the union of its destinations' allowlists. Known profiles: `flagship`, `cotijuba-web`, `serra-web`.
- **Environment variables** — `APP_ENV` selects the environment: development, preview, staging or production. `APP_VARIANT` selects the build profile: `flagship`, `cotijuba-web`, `serra-web`. Both are zod-validated. A build fails on a missing variable. Never key config off `NODE_ENV`; Expo CLI forces it.
- **Flagship** — the one multi-destination native store app. It contains the union of destination features (D-07, proposed).
- **Runtime flag** — a per-destination, server-fetched flag. It can only hide or reorder widgets already compiled into the build. The registry is a closed set. Unknown ids are ignored and logged.
- **Snapshot** — a versioned, per-destination export of public JSON for offline use. It shows users its max-age (D-10, proposed).
- **Provenance** — the record of where a fact came from and when it was last checked: `source`, `sourceUrl`, `checkedAt`, `validFrom`, `validUntil`, `license`, `correctionContact`. The API adds derived `stale: boolean` and `ageSeconds`.

## 6. Widget contract (illustrative)

```ts
// ILLUSTRATIVE — it validates the shape, not a final API. The exclusion
// scope is approved (D-06); Phase 06 proves it with exclusion gates.
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

## 7. Destination manifest (illustrative)

```ts
// ILLUSTRATIVE — from master plan §04; zod-validated by the compose tool.
export default defineDestination({
  id: "cotijuba",
  brand: { name: "Cotijuba", locale: "pt-BR" },
  timezone: "America/Belem",            // per-destination timezone
  includedWidgets: ["places", "transport", "tides", "local-services"],
  config: {
    places: { categories: ["beaches", "restaurants", "stays"] },
    transport: { modes: ["boat"] },     // boats are a mode of `transport`
    "local-services": { categories: ["moto-taxi"] },
  },
});

// The Serra demo manifest uses the same shape:
//   id: "serra", includedWidgets: ["places", "trails", "guides"],
//   synthetic fixture data only.
//
// Build profiles (e.g. profiles/flagship.ts, profiles/cotijuba-web.ts) list
// the destinations a build serves; widget set = union of their allowlists.
// The generator emits explicit static imports — no wildcard registry, and a
// disabled widget is never imported (cannot be bundled).
```

## 8. API principles

- **Public reads need no account** (D-13a, approved): every public GET endpoint is anonymous and cacheable. Visitors never authenticate.
- **Editors sign in through Cloudflare Access**, configured with the `cf` CLI (D-09, approved).
- **Writes are tenant-scoped and server-checked**: roles (`editor`, `admin`) scoped to `destinationId`, checked on every write. D1 has no RLS, so isolation lives in one repository layer (D-04, proposed).
- **Freshness fields on every public entity**: `source`, `sourceUrl`, `checkedAt`, `validFrom`, `validUntil`, `license`, `correctionContact`, plus derived `stale` and `ageSeconds`. No silent stale fallbacks — a stale value is shown as stale.
- **Explicit error semantics**: every public API response has explicit error and freshness semantics (plan §03 hard constraint).
- **Upstream calls are server-side** (D-04, proposed): no third-party keys in client bundles; scheduled ingestion for tides and weather, never device-clock schedule math.
- **Maps** (D-05, approved): MapLibre native and web behind one `@guia-la/map` contract. OSM-derived tiles for now. The hosted-tiles-versus-PMTiles question is revisited later; spike S6 still runs. Follow the OSM tile usage policy and attribution rules.

## 9. Timezone rule

- Each destination manifest declares its IANA timezone. Cotijuba uses `America/Belem`.
- All schedule, tide and departure math runs server-side in the destination timezone. Never use the device clock (legacy bug class #64). Cron schedules run in UTC with Belém conversion in code.
- Property tests around 21:00 local and validity edges (`validFrom`/`validUntil`) are required for any schedule or tide code.

## 10. Offline rule

- Web (D-10, proposed): Workbox precache of the app shell plus public JSON snapshots per destination — versioned, max-age shown to users.
- Native (D-10, proposed): SQLite/file cache of the same public snapshots.
- Never cache authenticated responses (legacy incident #65 cached them).
- No `expo-sqlite` on web until spike S8 proves COOP/COEP is workable.

## 11. Quality gates summary

- **Fast PR gate** (every PR, < 10 min target): `tsc --noEmit`, ESLint + boundary rules, Vitest unit/contract, zod schema checks, compose per profile + widget-exclusion assertions, `expo export -p web`, Playwright smoke incl. JS-disabled OG checks, API tests on local D1 incl. tenant A/B, secret scan.
- **Visual gate** (UI/widget PRs): Storybook web build + screenshot diff + axe.
- **Native gate** (D-08, approved): label/path-filtered builds plus a weekly or manual cadence. Never one per trivial PR. Free tiers only, about 15 Android + 15 iOS EAS builds per month. Any paid upgrade is a new owner decision.
- **Nightly/RC**: per-profile native builds (inside the free build quota), Maestro on a GitHub Actions emulator (spike S13; the free Expo plan has no Maestro), WebKit Playwright, weekly automated restore drill (latest R2 export into a scratch D1) plus a quarterly human-witnessed drill.
- **Human release gate**: real-device checks (low-end Android on 3G in Cotijuba), content validation, store metadata. Store publication itself is a stop-and-ask action — see [docs/security/APPROVAL-LIST.md](docs/security/APPROVAL-LIST.md).
- Flaky protocol: quarantine label + linked issue + 7-day expiry. Never delete or skip a failing test without human approval.

## 12. Decision status

As of 2026-11-21, copied verbatim from [planning/decisions.md](planning/decisions.md):

- **Approved:** D-00, D-01, D-03, D-05, D-06, D-08, D-09, D-11 (code only), D-13a.
- **Owner TODO:** D-12 (legacy key rotation, tsk #297, outside this repo).
- **Proposed:** D-02, D-04, D-07, D-10, D-13b.

Licensing (D-11, approved for code): MIT for code. The content license is separate and still open (Phase 09 rights review).

The register holds the full status text and conditions. Copy statuses verbatim from it. Never upgrade one.

## 13. Where the plan lives

- Decision register: [planning/decisions.md](planning/decisions.md).
- Review: [planning/review.md](planning/review.md).
- Phase playbooks (source): `planning/src/phases/phase-00.md` through `phase-10.md`.
- Phase playbooks (generated views): [00](planning/phases/phase-00.html) · [01](planning/phases/phase-01.html) · [02](planning/phases/phase-02.html) · [03](planning/phases/phase-03.html) · [04](planning/phases/phase-04.html) · [05](planning/phases/phase-05.html) · [06](planning/phases/phase-06.html) · [07](planning/phases/phase-07.html) · [08](planning/phases/phase-08.html) · [09](planning/phases/phase-09.html) · [10](planning/phases/phase-10.html).
