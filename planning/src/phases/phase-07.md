---
id: 07
title: Small multi-destination backend and editorial console
short: Stand up the destination-scoped content API on Cloudflare Workers, D1 and R2 with tenant-isolated editor access, anonymous public reads, provenance, backups and honest failure semantics.
tag: Data
status: draft
complexity: High (security risk)
depends: 01, 02, 04, 05
inspect: Hono API on staging, D1 schema and migrations, tenant A/B test report, backup and restore drill logs, editor UI screenshots
exit: Tenant isolation, backup and restore drills and unavailability tests pass with no public visitor login anywhere
---

## Phase identity

Phase **07** builds the small backend the platform actually needs: one Cloudflare Worker API (Hono) over one D1 database (Drizzle) with R2 media, destination-scoped everything, a minimal editorial console for publishing, and operational hygiene — provenance, freshness, backups, and honest unavailability — designed in from the start. All deploys in this phase target a staging environment; production launch is Phase 10.

- **Objective:** a destination editor can publish a place, a visitor can read it with no account, and an editor from another destination provably cannot touch it — with the whole loop verified by automated tests and a restore drill.
- **Prerequisites:** Phase 01 extraction matrix (entity shortlist, data-uncertainty findings); Phase 02 monorepo (the API lives beside the app); Phase 05 fast gate (API tests run per PR). Phase 06 is useful for the flags client contract but not a hard dependency.
- **Dependencies:** phases 01, 02, 04 (staging previews — the publish-to-rebuild hook and its QA depend on them), 05.
- **Expected contributors:** senior implementation agent (schema, repository layer, auth, ingestion); junior agents (route handlers against the established repository pattern, fixture seeds); CI as reviewer of record for the tenant A/B suite; humans — the data owner signs off the editorial workflow, provenance fields and media licensing defaults, and the account owner approves any deploy credentials (all free tiers per D-08).
- **Complexity and risks:** High, dominated by security risk: D1 has no row-level security, so every tenancy rule lives in API code and tests. No hour estimates.

> [!RISK] The single largest risk is silent cross-tenant access. Mitigation is structural, not procedural: one tenant-scoped data-access layer, a lint rule banning raw D1/Drizzle usage outside it, and a tenant A/B suite that runs on every API PR (proposed in [review R4](../review.md)).

## Why this stage exists

The legacy post-mortem says the Cotiju incident (#63/#59) was most plausibly a content-operations failure — empty or filtered tables, a tide table that stopped at 2026-06-08 with no ingestion job, and two live hosts with unclear provenance — not a framework failure ([legacy audit](../research/legacy-cotiju-audit.md); [review R1](../review.md)). A rewrite does not fix that. So this phase makes freshness, provenance and deploy provenance first-class schema and API concerns *before* real content arrives in Phase 09, and it starts the editorial routine on fixtures — proposed in [review §8.6](../review.md).

Three more constraints shape the design. First, D1 has no PostgreSQL-style RLS ([backend research §1](../research/backend-stores-starters.md)), so isolation must come from a single disciplined data-access path — the legacy app's 146 RLS policies are exactly what we are not rebuilding. Second, the value of guia.la is *verified* information (legacy issue #70: source, verified date, rights), so editorial metadata is core schema, not an afterthought. Third, visitors never log in (D-13b, proposed); the only authenticated role is editorial.

## Inputs and source references

**This packet:**

- [Master plan §05 phase 07](../../docs/guia-la-master-plan.html) and §03 architecture (Worker API, server-side authorization, error/freshness semantics).
- [Review](../review.md) — R1 (content-ops root cause), R4 (D1 tenancy), R5 (secrets server-side), R9/D-09 (editor auth), R11 (timezone correctness), R12 (backups), §8.6 (this phase's scope additions), A3 and A5 spikes.
- [Decisions](../decisions.md) — D-04 (backend choice), D-09 (editor auth), D-13b (no visitor accounts, proposed), D-03 (static web + rebuild-on-publish, feeds the hook task), D-11 (licensing, pending), D-12 (legacy key rotation, owner action, not this repo).
- [Backend research](../research/backend-stores-starters.md) — D1 limits/pricing, Time Travel, export limitations, Cron UTC behavior, R2 presigned URLs, Drizzle pinning, store-policy context.
- [Expo stack research](../research/expo-stack.md) — web hosting and publish flow context for the rebuild hook.
- [Legacy audit](../research/legacy-cotiju-audit.md) — §4 tables/entities (what to shrink from 23 tables), §8 data sources, issues #62 (tide fallback fabrication), #64 (boat validity/timezone), #70 (verified catalogue), PR #39 (the 24-table D1 attempt not to repeat).

**Future guia.la repository paths (proposed — create in this phase):**

- `apps/api/` — the Hono Worker (`@guia-la/api`), entry `src/index.ts`, routes under `src/routes/v1/`.
- `packages/db/` — Drizzle schema (`src/schema/`), migrations (`drizzle/`), and the **only** module allowed to touch D1.
- `packages/contracts/` — zod schemas plus generated OpenAPI document.
- `packages/api-client/` — the generated typed client (the Phase 06 flags client and Phase 08 widgets consume this, never hand-rolled fetches).
- `apps/admin/` or a web-only route group in the app (decided by the A5 spike outcome) — the minimal editorial console.
- `packages/fixtures/{cotijuba,serra}/` — synthetic seed data per destination (Cotijuba-shaped and Serra-shaped, all invented; no legacy rows).

**Legacy references:** `luandro/cotiju-app` `supabase/` baseline migration (4,681 lines, 23 tables, 146 policies — reference for entity names only); closed PR #39 (24-table D1 schema, +99k lines, never merged — a type-mapping reference, not a base); issues #62/#64/#70 as behavior spec for tides, validity and provenance.

**Authoritative documentation (as cited in the research files):**

- D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Time Travel: https://developers.cloudflare.com/d1/reference/time-travel/
- Import/export and its virtual-table limitation: https://developers.cloudflare.com/d1/best-practices/import-export-data/
- Backup-D1-to-R2 Workflow example: https://developers.cloudflare.com/workflows/examples/backup-d1/
- Cron Triggers (UTC): https://developers.cloudflare.com/workers/configuration/cron-triggers/
- R2 presigned URLs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- Workers pricing and limits: https://developers.cloudflare.com/workers/platform/pricing/ and https://developers.cloudflare.com/workers/platform/limits/
- Drizzle D1 driver: https://orm.drizzle.team/docs/connect-cloudflare-d1

**Known unknowns:** A5 — Cloudflare Access vs built magic link for editors (decide before PR 07-5); Drizzle stable `0.45.x` vs `1.0.0-rc` migration format (pick one and pin — churn noted in [backend research](../research/backend-stores-starters.md)); real Workers CPU per request at our payload sizes (measure during staging, per A3's < 50 ms p95 criterion); upstream tide/weather providers and their licensing (decided in Phase 08/09 — this phase builds a pluggable provider interface with a fixture provider only).

**Credentials and tools needed:** a Cloudflare account with wrangler CLI authenticated; D1 database and R2 bucket for **staging**; Workers Free plan per D-08 (approved 2026-11-21); Workers Paid ($5/month, [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)) would be a new owner decision. Free-plan CPU (10 ms per invocation, inferred — verify) is tighter than A3's &lt; 50 ms p95 criterion: measure early. Third-party provider keys, when they exist, live only as Worker secrets; nothing that touches the legacy Supabase is needed or wanted in this phase.

## Task breakdown

| # | Task | Owner | PR unit | Depends on |
|---|---|---|---|---|
| 1 | Minimal D1 schema with Drizzle (pinned): `destinations` (slug, default locale — Cotijuba: pt-BR — timezone, flag set), localized content fields on text-bearing tables with per-locale values and a `machineTranslated` flag (D-14), `places` (+ categories), `media` (license, attribution, rights note), `boat_schedules` (valid_from, valid_until, days_of_week, exceptions), `tide_observations` (series with source and validity window), `local_services` (business contact fields carrying `contact_consent`/`publish_contact` flags), `guides`, `trails` (Serra fixtures), `content_audit` (source, source_url, checked_at, editor), `migrations_log` | Agent | PR 07-1 | Phase 01 matrix |
| 2 | Tenant-scoped repository layer in `packages/db`: every exported query takes a branded `DestinationId`; app code cannot construct one without the request context; ESLint rule bans `drizzle-orm/d1` and raw `env.DB` outside `packages/db` | Agent | PR 07-2 | 07-1 |
| 3 | Hono skeleton: `/v1/*` route mounting, zod-validated handlers, one error envelope shape, `Cache-Control` and freshness headers per route class, request ids, and `/v1/meta/build` returning the deployed commit, build time and migration hash injected at deploy | Agent | PR 07-3 | 07-2 |
| 4 | Public read routes (no auth): destination info, places list/detail, boat "next departures" computed **server-side** in the destination timezone (`America/Belem` for Cotijuba), tides with explicit validity window and an honest unavailable state; every response carries the requested locale plus fallback info — a missing translation serves the destination's default locale marked untranslated, never a silent fallback, and machineTranslated text stays flagged until reviewed (D-14); per-route OpenAPI annotations into `packages/contracts` | Agent | PR 07-4 | 07-3 |
| 5 | Editor auth behind the A5 spike decision: Cloudflare Access JWT verification in front of the Worker (recommended in [review R9](../review.md)) or magic-link sessions in D1; roles `editor`/`admin` scoped to one `destinationId`; sessions/roles tested | Agent, human approves the D-09 choice | PR 07-5 | 07-3 |
| 6 | Editorial write routes: place create/update with draft and published states, publish/unpublish, media registration (license and attribution required, enforced), audit rows on every write | Agent | PR 07-6 | 07-5 |
| 7 | Media handling: R2 presigned PUT issuance for editors (per [presigned URL docs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)), bucket CORS, public reads only through Worker-issued URLs for media that carry license metadata | Junior agent | PR 07-7 | 07-6 |
| 8 | Minimal editorial console: login/session, place list, place edit form with provenance fields, media upload, publish action, translation review queue (editors clear `machineTranslated` flags field by field, D-14) — implemented per the A5 outcome as a web-only route group or minimal Hono-served pages; no native-specific UI | Agent | PR 07-8 | 07-6, 07-7 |
| 9 | Scheduled ingestion pipeline: cron-triggered fetch job with a pluggable `TideProvider`/`WeatherProvider` interface and a fixture provider; writes series rows with source, fetched_at, validity window and failure status; no fabricated fallback data on failure, ever (legacy #62 rule) | Agent | PR 07-9 | 07-4 |
| 10 | Backup and restore: nightly D1 export Workflow to R2 (modeled on the [documented example](https://developers.cloudflare.com/workflows/examples/backup-d1/)), 30-day retention; restore drill script that restores into a scratch D1 and compares row counts and checksums — run as a weekly automated drill plus a quarterly human-witnessed drill (Time Travel is never the drill; it is in-place only); CI guard rejecting `CREATE VIRTUAL TABLE` in migrations (it breaks `d1 export` per [import/export docs](https://developers.cloudflare.com/d1/best-practices/import-export-data/)) | Agent | PR 07-10 | 07-1 |
| 11 | Publish-to-rebuild hook: editorial publish emits a GitHub `repository_dispatch` (or Workers Builds hook — chosen with D-03) that triggers the destination web export redeploy; failure of the hook is visible in the console | Agent | PR 07-11 | 07-8, D-03 outcome |
| 12 | Tenant A/B test suite and cost instrumentation: automated cross-tenant denial tests on every protected route; a `/v1/meta/cost` or dashboard note recording request, row-read and R2 operation counts per day against the included quotas | Agent | PR 07-12 | 07-6, 07-9 |

**Notes.** The schema (07-1) is deliberately a fraction of the legacy 23 tables — reviews, likes, comments, ownership claims and similar v1 surface are out of scope until a phase asks for them. PR 07-5 blocks 07-6/07-8 until the owner records a D-09 choice (provisional allowed) — an agent never defaults D-09 to Cloudflare Access or any other mechanism; if A5 evidence is late, the block stands and the owner records the provisional choice. Fixture seeds are synthetic; nothing reads legacy production.

## Architecture choices and guardrails

**Tenancy model:** one D1 database with `destination_id` on every content row (per [backend research inference](../research/backend-stores-starters.md) — D1's own docs favor per-tenant databases, but per-DB migrations multiply operations work at our size; revisit only if a destination needs contractual data isolation). All access flows through one repository module:

```ts
// packages/db/src/repository.ts (proposed — illustrative)
import { DrizzleD1 } from "./client";

export type DestinationId = string & { readonly __brand: "DestinationId" };

export function forDestination(db: DrizzleD1, slug: string) {
  // Resolves and caches the destination row; every handler calls this once
  // per request. All list/get helpers below REQUIRE the resolved id —
  // there is no unscoped export.
  return {
    places: {
      list: () => db.select().from(places).where(eq(places.destinationId, id)),
      bySlug: (slug: string) => { /* ...same implicit filter... */ },
    },
    // transport, tides, media, ... all shaped the same way
  } as const;
}
```

**Error and freshness envelope (illustrative):** every API response carries explicit semantics so clients can render honest states:

```json
{
  "data": { "items": [] },
  "meta": {
    "destination": "cotijuba",
    "locale": "pt-BR",
    "fallback": false,
    "generated_at": "2026-11-21T12:00:00-03:00",
    "source": "fixture",
    "valid_until": null,
    "cache": "public, max-age=300, stale-while-revalidate=600"
  }
}
```

Tide and boat endpoints add `data_available: false` with a reason when upstream is stale or down — an explicit unavailable payload, never yesterday's data relabeled as fresh (the exact failure in legacy [#62](https://github.com/luandro/cotiju-app/issues/62)).

**Locale semantics (D-14):** localized fields serve the requested locale; a missing translation returns the destination's default locale value with `fallback: true` and an untranslated marker, and machine-translated text carries `machineTranslated` until an editor reviews it — visible, never silent.

**Timezone rule:** store UTC; compute "today", "next departure" and tide-day boundaries on the server in the destination's timezone from `destinations.timezone` (Cotijuba: `America/Belem`). Property tests cover 21:00 local crossings and validity-window edges — the two bugs legacy shipped ([#64](https://github.com/luandro/cotiju-app/issues/64)). Crons run in UTC ([cron docs](https://developers.cloudflare.com/workers/configuration/cron-triggers/)); schedules are defined with that offset encoded and tested.

**Forbidden:**

- Any SQL or Drizzle call outside `packages/db` (lint-enforced; the legacy app's 22 services with direct SDK access are the counter-example).
- Client-side access to D1/R2 from the app; the app talks only to this API.
- Third-party provider keys in client bundles or `EXPO_PUBLIC_*` — upstream calls are server-side only (legacy shipped WorldTides/StormGlass keys in public JS, [review R5](../review.md)).
- `CREATE VIRTUAL TABLE` (FTS5, R*Tree) in the primary database — it disables `wrangler d1 export` ([import/export docs](https://developers.cloudflare.com/d1/best-practices/import-export-data/)); search stays plain `LIKE` until measured need.
- Fabricated, cached-fresh or placeholder-fallback data served as real (fixture responses are labeled `"source": "fixture"`).
- Personal or visitor data of any kind in fixtures or seeds (LGPD caution per [review §6](../review.md)); personal/visitor data is never modeled. Business/service contact numbers are allowed only as an explicit field carrying `contact_consent` and `publish_contact` flags recorded by an editor.
- Visitor accounts or any anonymous-write route (D-13b).
- Migration of legacy production data (Phase 09, human-approved, from the audited inventory only).

**Security and privacy implications:** authorization is checked server-side on every protected route (editor role + destination scope); media without license metadata is never publicly readable; session/auth choices and their trade-offs go through D-09; secrets live as Worker secrets and CI variables, never in the repo. The tenant A/B suite is the regression trap for all of it.

**Acceptable alternatives:** Neon or Supabase Postgres via Hyperdrive if the A3 spike criteria fail (RLS and PostGIS are the real gains, at ~$15–25/month more and a second vendor — [backend research comparison](../research/backend-stores-starters.md)); Supabase-legacy-style direct client access with RLS — explicitly rejected (the coupling we left). Magic-link auth is the fallback if Cloudflare Access proves unusable for editors (A5 decides).

## Deliverables

- `packages/db/` schema and migrations; pinned Drizzle versions recorded in the lockfile and decision note.
- Localized content fields with a declared default locale per destination (Cotijuba: pt-BR), untranslated markers, `machineTranslated` flags and the editor translation-review queue (D-14).
- `apps/api/` Hono Worker deployed to **staging** with `/v1/meta/build` live.
- `packages/contracts/` zod schemas and generated OpenAPI document; `packages/api-client/` generated typed client consumed by the app.
- Editorial console (web) with login, place editing including provenance fields, media upload with license requirement, publish action.
- `packages/fixtures/{cotijuba,serra}/` synthetic seeds; `scripts/seed.mjs`.
- `.github/workflows/api-tests.yml` running unit, contract and tenant A/B suites per PR on a local D1 (Miniflare).
- Backup Workflow, restore drill script `scripts/restore-drill.mjs`, and `docs/runbooks/backup-restore.md` (proposed) including the drill's latest evidence.
- Publish-to-rebuild hook wired to the web deploy pipeline (mechanism per D-03).
- Decision register updates: D-04 evidence, D-09 resolved (or provisionally Access), A5 spike note.

## Visual and functional QA

**Manual journeys (human):**

1. As a Cotijuba editor on the staging console: create a place with a synthetic photo, fill source and license, publish it. Screenshot the editor flow.
2. In a private browsing session with no login: load the Cotijuba staging web preview and API URL; the published place appears; raw JSON shows provenance and freshness metadata. Screenshot both.
3. As a Serra editor: attempt to open and to edit the Cotijuba place by id — both denied; the denial is logged. Screenshot.
4. Break the fixture tide provider (or point it at a dead URL): the tide endpoint and UI show an explicit "unavailable, last good fetch at ..." state — no fabricated values, no spinner (legacy #62/#60 counter-evidence). Screenshot.
5. Watch the publish-to-rebuild hook fire: editing a place triggers a staging web redeploy; the updated content and a fresh `/v1/meta/build` commit appear together.

**Agent journeys:** run the tenant A/B suite and the contract tests; run the restore drill end-to-end and diff row counts; exercise every route class with an expired session, a wrong-destination editor and an anonymous writer; capture outputs as PR evidence.

| Check | Web | Android | iOS |
|---|---|---|---|
| Anonymous read of published content | yes | via API client (same build) | via API client |
| Editor console | web-only, desktop and mobile width | not applicable | not applicable |
| Honest unavailable states surfaced in UI | places/tides/transport | same components | same components |

**Error states to verify explicitly:** expired or missing editor session on a write (401 with the envelope); right-role-wrong-destination (403, logged); upstream ingestion failure (data_available false with reason); restore drill mismatch (drill fails loudly); publish hook failure (visible in console, retryable, content stays consistent with last good build).

## Automated verification

Statuses: **validated** means the command or behavior is verified in a research file (linked); **proposed** means defined here, not yet run. Nothing below has been executed against a guia.la deployment.

| Command | Purpose | Status |
|---|---|---|
| `pnpm --filter @guia-la/api test` | Unit, contract and tenant A/B suites on local D1 (Miniflare/workers test pool) | proposed |
| `pnpm --filter @guia-la/api dev` | Local Worker + D1 via wrangler for manual journeys | proposed |
| `wrangler d1 export guia-staging --remote --output=backup.sql` | Portable backup; blocks queries while running; refuses databases containing virtual tables | validated as documented behavior ([import/export docs](https://developers.cloudflare.com/d1/best-practices/import-export-data/), cited in [backend research §1](../research/backend-stores-starters.md)); not yet run here |
| `wrangler d1 time-travel restore guia-staging --timestamp=...` | In-place point-in-time recovery (30-day window on Paid; restore is to the same database, and a restore returns the previous bookmark) — a production incident tool needing human approval, never used as a drill | validated as documented behavior ([Time Travel docs](https://developers.cloudflare.com/d1/reference/time-travel/)); not yet run here |
| `node scripts/restore-drill.mjs --target scratch` | Restore latest R2 backup into a scratch D1 and compare row counts/checksums | proposed |
| `pnpm lint:db-boundary` | ESLint rule: no D1/Drizzle usage outside `packages/db` | proposed |
| `npx tsc --noEmit` | Workspace typecheck | proposed |
| `curl -s https://api.staging.example/v1/meta/build` (real staging URL TBD) | Deploy provenance: commit, build time, migration hash | proposed |

**Positive tests:** editor A full publish loop; anonymous read of published place; next-departure computation across a 21:00 `America/Belem` boundary; validity window edges (valid_from/valid_until, weekday sets); publish hook dispatches with the expected payload shape.

**Negative tests:** anonymous write (401); Serra editor reading/writing Cotijuba resources by id and by slug enumeration (403 both ways); expired session; media registration without license (422); migration containing `CREATE VIRTUAL TABLE` fails CI; ingestion outage yields `data_available: false` and no cached-fresh masquerade.

**Deliberate-failure demonstrations (at least one lands in the gate PR):**

1. Remove the destination filter from one repository query on a scratch branch: the tenant A/B suite fails naming the route — proof the trap catches the one-bug class this phase fears most.
2. Point the fixture tide provider at a dead endpoint: the API responds unavailable-with-reason within its freshness contract; a UI screenshot shows the honest empty state.
3. Attempt `wrangler d1 export` against a scratch DB containing a virtual table: export refuses (per [docs](https://developers.cloudflare.com/d1/best-practices/import-export-data/)) — recorded as the reason the CI guard exists.

## Acceptance gate

> [!GATE] Isolation, recoverability and honesty are demonstrated, not claimed. The gate passes only when the tenant A/B suite, the restore drill and the unavailability tests all have run with output attached.

- [ ] Public reads work with no authentication anywhere; no visitor-account surface exists in API or console (D-13b).
- [ ] Every protected route denies anonymous (401) and wrong-destination editors (403); the tenant A/B suite passes in CI on the gate PR.
- [ ] Editor publish loop completes on staging; provenance fields (source, checked_at, license) are required and present in API output.
- [ ] Cross-tenant denial demonstrated live in the QA journeys with screenshots.
- [ ] Nightly backup Workflow has produced at least one R2 object; the restore drill restored it into a scratch D1 with matching row counts and checksums; drill evidence attached.
- [ ] Ingestion outage produces explicit unavailability with reason — no fabricated or silently stale data (demonstration 2).
- [ ] Locale semantics hold (D-14): responses carry locale + fallback info; missing translations serve the default locale marked untranslated; `machineTranslated` cleared only by editor review.
- [ ] Timezone property tests (21:00 crossing, validity edges) pass.
- [ ] `/v1/meta/build` reports the actual deployed commit; publish-to-rebuild hook fires or its blocker is documented against D-03.
- [ ] No `CREATE VIRTUAL TABLE` in migrations; DB-boundary lint active and red-tested.
- [ ] D-09 resolved or provisionally recorded; D-04 evidence entry updated; human data owner has signed off the editorial workflow and licensing defaults.

**Blocks progression if:** any cross-tenant read or write succeeds; backups or the restore drill cannot be demonstrated; any route serves fabricated or masquerading-fresh data; visitor login appears anywhere; or the editor-auth decision is neither made nor recorded. A production deploy attempt in this phase is itself a blocker — staging only.

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cross-tenant leak via a missed scoping bug | Medium | Critical | Single repository layer, branded `DestinationId`, lint ban, tenant A/B suite per PR, deliberate-failure demo 1 |
| Editor auth choice stalls (A5/D-09) | Medium | High | PR 07-5 blocks until the owner records a D-09 choice (provisional allowed); an agent never defaults the mechanism |
| Drizzle 1.0 RC migration churn breaks deploys | Medium | Medium | Pin one line exactly; contract tests gate dependency updates ([review R14](../review.md)) |
| D1 single-threaded throughput or CPU limits bite at real payload sizes | Low | Medium | A3 criteria checked in staging; per-request query count within the ≤1,000 queries per Worker invocation (Paid) limit ([D1 limits](https://developers.cloudflare.com/d1/platform/limits/)); revisit D-04 if unmet |
| Cron UTC offset mistakes corrupt "today" logic | Medium | High | Timezone property tests; schedules encoded as data with tests, not scattered literals |
| Cost overrun (row reads bill scanned rows; unindexed filters scan) | Low | Low | Indexes on `(destination_id, ...)` keys; daily cost instrumentation against included quotas (25B reads/month on Paid per [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)); Cloudflare spending limit set by owner |
| Backup path silently rots (Time Travel is in-place and 30-day capped) | Medium | High | Nightly R2 export Workflow plus weekly automated and quarterly human-witnessed restore drills (Time Travel is never the drill); drill failure is a gate item, not a log line |

**Sensitive operations needing human approval:** any move off free tiers (D-08); creating staging D1/R2 resources under the Cloudflare account; the D-09 auth choice if it deviates from the recommendation; any relaxation of the DB-boundary lint; anything touching real Cotijuba content (not this phase — Phase 09). Rollback of a bad deploy uses `wrangler rollback` (unverified — not confirmed in the research files; verify against Workers docs before relying on it) plus Time Travel for data (in-place restore, previous bookmark retained per [docs](https://developers.cloudflare.com/d1/reference/time-travel/)); migrations are forward-only with a written down-path in each migration header.

**Budget impact:** zero — Workers Free and D1 Free per D-08 (static-asset requests are free per [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)); fixture-scale D1 usage should fit Free daily row caps (free-tier limits inferred, not yet verified here — confirm against [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) in Phase 04); Paid would add 25B rows read, 50M rows written, 5 GB storage per [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/); R2 free tier covers staging media (10 GB-month storage, 1M Class A, 10M Class B operations, egress free per [R2 pricing](https://developers.cloudflare.com/r2/pricing/)). Real numbers get measured, not assumed — the cost instrumentation task exists for that.

**Restart instructions for an agent picking up mid-phase:** read this page, [decisions D-04/D-09/D-13b](../decisions.md) and `docs/runbooks/backup-restore.md` if present; check `wrangler d1 list` (or the state file) for which staging resources exist; run the API test suite to see current health; find the first unchecked gate box and its PR; never re-create staging resources without checking what exists; never "helpfully" migrate or seed from legacy sources — that path is Phase 09 with human sign-off.

## Next phase handoff

To **Phase 08** (production widget verticals):

- The OpenAPI document in `packages/contracts/` and the generated typed client in `packages/api-client/` — widgets must consume the client, not hand-rolled fetches.
- The response envelope with freshness and provenance metadata — widget UI states (fresh, stale, unavailable, empty, error) map one-to-one onto it, so no widget invents its own semantics.
- The fixture seeds for both destinations, including tide series with validity windows and boat schedules with validity/weekday data that exercise the property tests.
- The ingestion provider interface: Phase 08/09 selects and rights-checks real upstream providers behind it; the no-fabrication rule is already enforced by tests here.
- The publish-to-rebuild hook and `/v1/meta/build` — Phase 08's widget QA depends on knowing which commit a preview serves.

To **Phase 09** (real content):

- The provenance schema and editorial workflow signed off here; Phase 09 imports only content that can populate its fields.
- The backup/restore drill, which must be re-run after any real-content migration.
- Open items handed forward, not solved here: real upstream provider choice and licensing (with D-11), legacy export execution (owner-run, read-only), and the production environment (Phase 10).

The execution brief for this phase lives at [../prompts/phase-07-agent.md](../prompts/phase-07-agent.md); the preceding playbook is [phase-06.html](phase-06.html).
