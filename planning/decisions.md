# guia.la — decision register (ADR candidates)

Statuses: `proposed` (recommendation, no user decision), `validated` (spike evidence supports it, still needs user), `approved` (explicit user decision or existing project record), `rejected`.
Nothing here is `approved` except D-03 and D-06 (owner decisions, 2026-11-21) and D-00 and D-13a, where the master plan v0.2 / handoff states a locked user constraint; those are cited. Evidence links: [review.md](review.md), [research/](research/).

| ID | Decision | Status | Phase gate |
|---|---|---|---|
| D-00 | Platform identity: guia.la platform, Cotijuba pilot, Cotiju = legacy only | approved (handoff "locked for this planning pass") | 00 |
| D-01 | Repository, package scope, app IDs, domain | proposed | 00 |
| D-02 | Client stack: Expo SDK 58 + Expo Router + RNW + TypeScript, official template | proposed | 02 |
| D-03 | Web rendering/SEO: Router static export + rebuild-on-publish | approved (owner, 2026-11-21); S1 must pass, else fallback to Worker share pages returns to the owner | 02 |
| D-04 | Backend: Cloudflare Workers + Hono + D1 (Drizzle) + R2 | proposed | 07 |
| D-05 | Maps: MapLibre native + web behind one contract; tile source TBD | proposed (needs S6, tile cost) | 08 |
| D-06 | Widget exclusion scope: web/JS exclusion required; native exclusion deferred | approved (owner, 2026-11-21) | 06 |
| D-07 | Distribution: one flagship native app with destination picker; destination web profiles | proposed (strongly supported by store policy) | 10 |
| D-08 | CI/build budget: GH Actions fast gate; Expo Starter for native; spend ceiling | proposed | 04 |
| D-09 | Editor authentication: Cloudflare Access vs built magic link | proposed (needs A5) | 07 |
| D-10 | Offline v1: Workbox shell + public JSON on web; SQLite cache on native | proposed | 08 |
| D-11 | Licensing of code and content | proposed (user) | 00/09 |
| D-12 | Legacy app: rotate leaked third-party keys; stale-data banner | proposed (owner action, outside this repo) | 01 |
| D-13a | No account required to read public destination information | approved (master plan §01 lists it as intentionally avoided) | 07 |
| D-13b | No visitor accounts at all in v1 | proposed (master plan §08 lists "No public account at first" as needing validation) | 07 |

---

## D-00 — Platform identity
- **Status:** approved — handoff: "Brand and naming (locked for this planning pass)".
- **Decision:** new platform = guia.la; Cotijuba = first destination config; `cotiju-app` = legacy only. Historical URLs are not renamed.
- **Reversal cost:** low now, high after store listing.

## D-01 — Names and identifiers
- **Status:** proposed.
- **Proposal:** repo `guia-la`, npm scope `@guia-la/*`, app slug `guia-la`, bundle/package ID candidate `la.guia.app` (reverse-DNS of an unverified domain — confirm ownership first).
- **Alternatives:** `app.guiala.*` if `guia.la` cannot be secured.
- **Evidence required:** WHOIS/registrar record of `guia.la`, GitHub org/repo availability, store name search.
- **Reversal cost:** bundle IDs are effectively permanent after first store release.

## D-02 — Client stack
- **Status:** proposed.
- **Rationale:** one codebase for web/Android/iOS; SDK 58 current (RN 0.88.1, React 19.3, RNW 0.21.4) [research/expo-stack.md]. Official `create-expo-app` over Ignite (SDK 55, React Navigation), Obytes (SDK 54, stale), T3 Turbo (Next/Postgres) [research/backend-stores-starters.md §3].
- **Alternatives:** Next.js web + RN app (two stacks); bare RN (no Router web).
- **Evidence required:** A1 spike — template boots on all three targets.
- **Reversal cost:** high after Phase 06.

## D-03 — Web rendering and SEO
- **Status:** approved by the owner on 2026-11-21. Spike S1 must still pass; if it fails, the fallback (a) returns to the owner as a new decision.
- **Proposal:** `web.output: "static"` explicitly; `generateMetadata()` for OG; `generateStaticParams` from the API at build; editor "publish" triggers a rebuild + deploy (GitHub `repository_dispatch` or Workers Builds hook). Deploy to Cloudflare Workers Static Assets.
- **Alternatives:** (a) Hono-rendered share pages for public detail routes, Expo web for the app shell; (b) `web.output: "server"` on Workers via undocumented `expo-server` workerd adapter [S3] — not recommended.
- **Evidence required:** raw-HTML assertions (`curl`, Playwright with JS disabled) for every place page; rebuild time at 1k pages; WhatsApp preview manual check.
- **Reversal cost:** medium (route layer only if contract kept).

## D-04 — Backend
- **Status:** proposed.
- **Rationale:** Workers Paid $5/mo covers pilot; D1 10 GB/DB; Time Travel 30 d; R2 free egress [research/backend-stores-starters.md §1].
- **Guardrails:** one tenant-scoped repository layer; no FTS5/R*Tree virtual tables in the primary DB (blocks `d1 export`); nightly export to R2; pinned Drizzle.
- **Alternatives:** Neon/Supabase via Hyperdrive (+$15–25/mo, RLS, PostGIS).
- **Evidence required:** A3 spike; tenant A/B test suite; restore drill.
- **Reversal cost:** medium if all access goes through the repository layer.

## D-05 — Maps
- **Status:** proposed.
- **Proposal:** `@maplibre/maplibre-react-native` (native) and `maplibre-gl` (web) behind `@guia-la/map` contract; tiles from an OSM-derived source.
- **Open:** hosted tiles (free tier limits, attribution) vs PMTiles on R2 (one-time extract, cheap, offline-friendly).
- **Evidence required:** S6 (New Arch + offline pack), tile cost estimate for pilot traffic.
- **Fallback:** static map image + "open in Google/Apple Maps" deep link.

## D-06 — Widget exclusion scope
- **Status:** approved by the owner on 2026-11-21.
- **Proposal:** Phase 06 must prove JS/route exclusion for two web profiles with negative assertions, and permission/config composition for the flagship. Per-destination native module exclusion: one-module spike only; general mechanism deferred until a partner native app is approved.
- **Rationale:** flagship app must contain the union; `expo.autolinking.exclude` only documented in `package.json` [S5].
- **Reversal cost:** low — generator already emits capability lists.

## D-07 — Distribution
- **Status:** proposed.
- **Rationale:** Apple 4.2.6 allows a single "picker" app, 4.3(a) calls "a separate map app for every city" spam; Google repetitive-content policy pushes aggregation [research/backend-stores-starters.md §2].
- **Exception path:** partner app only when the partner organization owns its store account and content.

## D-08 — CI and build budget
- **Status:** proposed.
- **Proposal:** fast gate on GitHub Actions every PR; native builds via path filter/label + nightly; Expo Starter ($19/mo) once native work starts; hard monthly ceiling set by user; alert at 80%.
- **Evidence required:** S12 (minutes per workflow), S13 (GH Actions emulator Maestro flake rate).

## D-09 — Editor authentication
- **Status:** proposed — needs A5.
- **Options:** Cloudflare Access (one-time PIN, no auth code in app; JWT verified in Worker) vs magic link stored in D1.
- **Guardrail:** roles (`editor`, `admin`) scoped to `destinationId`; server checks on every write; visitors never authenticate.

## D-10 — Offline v1
- **Status:** proposed.
- **Proposal:** web = Workbox precache of app shell + public JSON snapshots per destination (versioned, max-age shown to users); never cache authenticated responses; native = SQLite/file cache of the same snapshots. No `expo-sqlite` on web until S8.
- **Rationale:** legacy cached all Supabase responses for 24 h incl. authenticated (#65).

## D-11 — Licensing
- **Status:** proposed — user decision.
- **Note:** code license and content license are separate; legacy media/data rights unverified; do not presume redistributability.

## D-12 — Legacy key rotation
- **Status:** proposed — owner action outside guia.la.
- **Finding:** legacy public JS bundles WorldTides/StormGlass keys [research/legacy-cotiju-audit.md]. Recommend rotation and moving calls server-side; no agent action authorized.

## D-13a — No account required to read
- **Status:** approved — master plan §01 "What we intentionally avoid: Accounts required to read public destination information".

## D-13b — No visitor accounts at all in v1
- **Status:** proposed — master plan §08 marks "No public account at first" as an open decision to validate against real visitor journeys.
- **Proposal:** ship v1 with editor accounts only; introduce visitor accounts only when a concrete feature needs them.
