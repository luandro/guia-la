# Legacy audit: luandro/cotiju-app (read-only)

- Audited: 2026-11-21 (planning baseline). Repo is **private**; links below need repo access.
- Commit inspected: `c0c99077593a870ba4295798f0471a66288a6c4c` (main HEAD, "fix: QA follow-ups ... (#52)", 2026-11-21 15:37 -0300).
- Method: shallow clone + `gh issue view` / `gh pr view`. No writes to the repo. Personal data, secrets and private records were not copied.
- Scope: stack, layout, Supabase, migrations, caching, tests, features, data sources, issues #57-#71, PR #39, PR #52. Not built or run.

## Confirmed (with source)

### 1. Stack and versions (`package.json` at HEAD, caret ranges, not lockfile-resolved)

| Area | Package (declared) |
|---|---|
| UI runtime | react / react-dom ^19.1.1, react-router-dom ^7.8.2 |
| Build | vite ^7.1.5, @vitejs/plugin-react-swc ^4.0.1, typescript ^5.9.2 |
| Styling | tailwindcss 3.x, shadcn/ui on 27 @radix-ui/* pkgs, lucide-react ^0.543.0 |
| State/data | @tanstack/react-query ^5.87.4, zustand ^5.0.8, dexie ^4.2.0 |
| Forms | react-hook-form ^7.62.0, zod ^4.1.5 |
| Maps | leaflet ^1.9.4, react-leaflet ^5.0.0 (OSM raster tiles) |
| i18n | i18next ^25.5.2, react-i18next ^15.7.3 (pt, en) |
| Backend SDK | @supabase/supabase-js ^2.57.4 (**listed in devDependencies**) |
| PWA | vite-plugin-pwa ^1.0.3 (Workbox, `registerType: autoUpdate`) |
| Tests | vitest ^3.2.4 (+coverage-v8, jsdom ^26), @playwright/test ^1.55.0 |
| Hosting | Surge workflow (`deploy-surge.yml`, PR previews) **and** Cloudflare Workers static assets (`wrangler.jsonc`, SPA fallback, compat date 2025-09-09); PR #52 configures Workers Builds triggers |

- README still claims React 18.3, Vite 5.4, Router 6.30, Zustand 4.5, React Leaflet 3.2. **Docs drifted from code.**
- No `typecheck` script. PR #52 reports `tsc --noEmit` = 455 errors while `vite build` passes (https://github.com/luandro/cotiju-app/pull/52, https://github.com/luandro/cotiju-app/issues/69).

### 2. Directory structure (file counts per dir)

| Path | Content |
|---|---|
| `src/pages` (25) | Route screens: Index, Map, Places, LocationDetail, Transport, Tide, Weather, Events, EventDetail/Form, MotoTaxi, RegisterMotoTaxi, Profile, Admin, BusinessOwnerDashboard, MyBusinessesDashboard, LinkBusiness, OwnershipRequestForm, PlaceFormPage, Login, Settings, UserEvents, UserReviews, PlaceholderPage, NotFound |
| `src/services` (22) | One service per domain; mock + fallback services for tide/weather |
| `src/hooks` (26), `src/contexts` (5), `src/stores` (3) | React Query hooks, Auth/Realtime/WidgetData contexts, Zustand stores |
| `src/components/ui` (58) | shadcn primitives |
| `src/data` | Static `locations.ts`, `beachLocations.ts`, tide JSON 2025 |
| `supabase/` | 9 active migrations, 147 archived/backup SQL files, 5 Edge Functions, 4 SQL tests, `seed-test-data.sql` |
| `scripts/` (~40) | Setup, seed, verify, migration-lint, tide-PDF parser (`parseTidePdf.py`) |
| `tests/` | Playwright suites: core, features, integration, mobile, visual, analysis |
| `.github/workflows` (7) | tests, playwright, qa-smoke, staging-smoke, db-verify, deploy-surge, white-label-build |

### 3. Supabase usage

| Concern | Finding |
|---|---|
| Auth | Email+password and Google OAuth (`src/contexts/AuthContext.tsx`); PKCE `flowType` set in `src/integrations/supabase/client.ts`. Global `fetchWithTimeout` with 8 s abort (comment on https://github.com/luandro/cotiju-app/issues/60). |
| WhatsApp login | Edge Function `wa-magic-link` **disabled (410 Gone)**: legacy Zapier flow allowed account takeover by pairing attacker phone with victim email (`supabase/functions/wa-magic-link/README.md`). Replaced by a `wa.me` bot deep link (PR #55). |
| Realtime | 9 `postgres_changes` channels: user_photos, photo_likes, location_reviews, profile, boat_schedules, place_suggestions, ownership requests, moto_taxi_drivers, business. `RealtimeContext` pings `profiles` for status. |
| RLS | Baseline migration: 23 `ENABLE ROW LEVEL SECURITY`, 146 `CREATE POLICY`; +10 storage policies, +1 weather policy. 59 SQL functions in baseline. |
| Storage | Buckets `user-photos`, `place-suggestions`, `ownership-documents`. |
| Edge Functions | `update-weather` (OpenWeatherMap + HG Brasil, server cache), `events-rate-limit`, `ownership-notifications`, `wa-magic-link` (disabled), `_shared/log.ts`. |
| Cron | `pg_cron` only for weather (`20251230000001_schedule_weather_update.sql`, `20260103223516_weather_monitoring.sql`); skips silently if service-role setting absent. **No tide cron.** |

### 4. Migrations and entities

- Active: 9 files; `20251226131827_baseline.sql` (4,681 lines) squashes history. 147 older SQL files under `archive/` and `backup/` (PR #50 "consolidate migrations").
- **Tables (23):** admin_audit_log, admin_users, audit_log, beach_locations, boat_schedules, business_edit_audit, business_photos, events, event_updates, location_reviews, moto_taxi_drivers, owner_requests, photo_likes, place_edit_suggestions, place_reviews, places, place_suggestions, profiles, rate_limits, review_comments, tide_data, user_photos, weather_data.
- View: `weather_system_health`. PR #39 counted 24 tables for D1.
- Observed duplication: `places` vs `beach_locations` (two place systems), `location_reviews` vs `place_reviews`, `audit_log` vs `admin_audit_log` vs `business_edit_audit`.

### 5. Caches and service worker

| Layer | Config | Risk |
|---|---|---|
| Workbox precache | `**/*.{js,css,html,ico,png,svg}`, 3 MiB max file | Stale-chunk risk after deploy (https://github.com/luandro/cotiju-app/issues/60) |
| `supabase-rest` | **NetworkFirst for every `*.supabase.co/rest/` URL**, 5 s timeout, 200 entries, 24 h | Public and authenticated reads share one cache (https://github.com/luandro/cotiju-app/issues/65) |
| `supabase-storage` | NetworkFirst, 100 entries, 7 d | Same concern for private files |
| `osm-tiles` | CacheFirst, 600 entries, 30 d | OSM tile policy not checked here |
| Dexie `cotiju_app_db` | v2: beachLocations, places, mutations (offline queue) | No per-user partition seen |
| localStorage | auth, language, intention manager, install prompt, notifications | - |
| `public/service-worker.js` | Inert legacy stub (2 lines) | - |

CSP is injected into `<meta>` by a Vite plugin and keeps `'unsafe-inline'` for scripts (Leaflet, Recharts, PWA register script) (`vite.config.ts`).

### 6. Tests (static count of `it(`/`test(` calls, not a run)

| Suite | Files | Cases | Coverage focus |
|---|---|---|---|
| Vitest `src/tests` | 28 | ~234 | intentionManager 19, input sanitization 23, ownership service (validation-bypass 15, fallback 10, pagination 2), whatsappAuth 16, supabase client 17 (1 skip), weather api/integration 27, events critical paths 13, realtime context 10, places 10, i18n/language 12, auth context 6 |
| Playwright `tests/` | 26 specs | ~136 | core (a11y, auth, errors, nav, PWA, widgets), place suggestions (+auth, text limits), integration against live Supabase (33), mobile map/responsive, 3 visual screenshot specs, `first-load.spec.ts` |
| SQL `supabase/tests` | 4 | - | audit security, ownership approval flow, ownership view security, public-location ownership block |

- Playwright: Chromium desktop only, retries 0. Only 5 `@smoke` tags (auth 3, navigation 2). The `first-load` spec gates staging (`staging-smoke.yml`).
- PR #52 reports `vitest run` 191 passed, 1 skipped, plus one timing-flaky weather test.
- `tests/analysis/*` are exploratory UX scripts, not assertions of product behaviour.

### 7. Features (routes in `src/App.tsx`)

| Status | Features |
|---|---|
| Built | Home widget dashboard, map (`/mapa`, static + DB markers), place detail + reviews + review comments, places directory `/locais` (added by PR #52), place suggestions + edit suggestions with admin moderation, photos (upload, likes, carousel), events (CRUD, updates, rate limit), boat schedules `/transporte`, tide `/mare`, weather `/clima`, moto-taxi directory + driver self-registration, business ownership claim + owner dashboard, admin dashboard, profile, PT/EN toggle, PWA install prompt, white-label env flags (`VITE_FEATURE_MOTO_TAXI/TIDE/TRANSPORT`, map centre, brand) |
| Placeholder (`PlaceholderPage`) | `/hospedagem`, `/restaurantes`, `/atividades`, `/taxi`, `/emergencia`, `/menu`, `/sobre`, `/desconectado` |
| Open/incomplete | Signup phone validation (#57), "check your email" step (#58), admin auto-approval (#21), places redesign (#18), deterministic seeds (#42, PR #56 open), privacy/terms pages (#68), SEO/OG (#67) |

- Routes are Portuguese with English redirects (PR #32). Keep this as a legacy-URL map for 301s.

### 8. Data sources

| Domain | Source in code | State |
|---|---|---|
| Tides | Client calls WorldTides v3 then StormGlass with `VITE_*` keys shipped to browser (`src/services/tideService.ts`); then Supabase `tide_data`; then static `public/data/cotijuba-tides-2025.json` (attributed to "Observatório da Costa Amazônica (OCA)", datum MSL, UTC-3) | 2025-only file; prod `tide_data` newest row 2026-06-08 per PR #52; no cron |
| Weather | Edge Function `update-weather` (OpenWeatherMap, HG Brasil) + pg_cron, `weather_data` table | Server-side since PR #51; working per #63 report |
| Boats | Supabase `boat_schedules` (route, `departure_time`, `days_of_week`, `valid_from`, `valid_until`, `is_active`), realtime | 0 anon-visible rows in prod per PR #52 |
| Places | Static TS files + `places` + `beach_locations` tables | 0 anon-visible `beach_locations` rows per PR #52 |
| Tide PDF | `scripts/parseTidePdf.py` + fixture test | Origin of the static JSON (inferred from name) |

Build workflow injects tide/weather API keys as `VITE_*` env (`deploy-surge.yml`). Those values ship in the public JS bundle.

### 9. Issues #57-#71, PR #39, PR #52 (all issues OPEN, filed 2026-11-21)

| # | Title (short) | Gist | Lesson for guia.la |
|---|---|---|---|
| 57 | Signup phone validation | Phone parse fails; spec: implicit +55, one field with DDD, optional international picker | Use a tested lib (libphonenumber-class) and E.164 storage; avoid collecting phone unless needed |
| 58 | "Verify your email" screen | After signup the form stays; needs resend/limits/correct-email path | Auth UX is product scope. Defer public accounts (RFC #71) |
| 59 | P0 Supabase public data missing | Anon reads see 0 rows in 5 tables; cause unknown (empty vs RLS vs `is_active` vs wrong env) | Separate admin count from visible count in health checks; seed migrations must not be the content source; back up before any write |
| 60 | P0 infinite spinner / freeze | Map, places, profile hang; Suspense without chunk-failure recovery; queries without deadline despite 8 s fetch timeout | Render shell first; every async view has timeout, empty, error and retry states; test with backend down |
| 61 | P1 map + places directory | `/locais` was a placeholder; map waited on DB | Ship static/public content path first. Partly fixed by PR #52 |
| 62 | P1 tides | Fallback hard-codes 2025 file; out-of-range date returns empty "success" with fresh `lastUpdated`; empty result can be cached | Tide = server job with provenance, validity window and explicit "unavailable"; never fabricate; test year rollover and America/Belem |
| 63 | P0 incident (umbrella) | Home/map/places/profile/tides broken in prod; root cause unconfirmed; investigator could not reach prod | Need: known deployed SHA, one host, prod smoke on the real domain, observability. Two deploy targets (Surge + Workers) blurred "what is live" |
| 64 | P0 next boat | `getNextBoat` uses device clock, ignores weekday/validity; if none today returns `schedules[0]` as "tomorrow"; `isValidForToday()` exists but unused | Model schedules with validity, weekdays, exceptions, tz `America/Belem`, source and last-verified date; pure function + table tests |
| 65 | P0 audit: PWA cache privacy | NetworkFirst caches all Supabase REST 24 h, public and private alike; leak unconfirmed | Allowlist only public GETs in SW; never cache authed API; purge on logout; A then B session test |
| 66 | P1 offline home categories | `HomeButtons` blocks navigation when `!navigator.onLine` although map has offline data | `navigator.onLine` is not backend health; offline paths must be tested end-to-end |
| 67 | P1 SEO / share previews | `lang="en"`, missing `og-image.jpg`, no sitemap, SPA has generic meta | Public pages need server/static HTML with per-page OG; verify with raw HTTP fetch (no JS) |
| 68 | P1 privacy/terms/LGPD | No privacy, terms or contact pages; app collects email, phone, photos, maybe location | Data map + LGPD pages are launch gates; minimise personal data |
| 69 | P1 TypeScript debt | 455 `tsc` errors hidden because Vite build skips typecheck | `typecheck` in CI from day one, strict mode, no ratchet-by-`any` |
| 70 | P1 verified catalogue | Value = verified places/boats/contacts/photos with source and date; no invented data | Editorial workflow (source, verified_at, rights) is core schema, not an afterthought |
| 71 | RFC: v2 rebuild | New clean repo; Workers/Hono/D1/Drizzle/R2; no client DB access; defer public login (Better Auth suggested); MVP = places+map, verified boats, honest weather/tides; 4 vertical spike slices. Comment pivots to **Expo + RN Web + Expo Router**, widget packages, build-time manifest, tenant_id rows, one flagship store app (Apple 4.2.6/4.3(a)) | guia.la is this RFC. Its own gates are acceptance criteria: per-tenant bundle diffs, no-JS previews, cross-tenant isolation, cloud E2E for both widget sets |
| PR 39 | D1 schema migration "TRULY CLEAN" | **CLOSED unmerged 2025-11-06**. +99,141/-6,655 across 371 files despite claiming 30. 24-table Drizzle schema, Postgres to SQLite (UUID, JSONB to TEXT), Better Auth plan, R2 plan. Workers build failed. Closing comment: "Not migrating to D3" | Reference for type mapping only. Do not port 24 tables. Gate PR size; verify bot-written PR claims. Preceded by closed PRs #36-#38 |
| PR 52 | QA follow-ups | **MERGED 2026-11-21 18:37Z** (= inspected HEAD). +3,404/-263, 53 files. Non-blocking auth, map draws static first, `/locais` real, PT/EN toggle, `first-load.spec.ts`, build env guard, staging-smoke, PR template | Patterns to keep: fail build on missing env, cold-load smoke against preview, time-to-usable under 5 s with backend down |

Status of issue claims at HEAD (after PR #52 merged): `/locais` now renders `Places` (#61 partly done). `getNextBoat` is unchanged (#64 still valid). `HomeButtons` still checks `navigator.onLine` (#66 still valid). Fallback still loads `cotijuba-tides-2025.json` (#62 still valid).

## Inference

- **Root failure mode is content and operations, not framework.** PR #52 found empty anon-visible tables and stale tides. Any stack would show the same blank home. guia.la needs content provenance, freshness SLOs and prod smoke before a new stack can help.
- **Supabase coupling is wide.** 22 services and 9 realtime channels call the SDK directly, with RLS as the only authz layer. A Workers API swap would touch most of `src/services` and `src/hooks`. This supports RFC #71's clean-repo choice over an in-place refactor.
- **Over-scoped v1.** 23 tables and 146 policies serve events, likes, review comments, ownership claims and moto-taxi self-registration. The catalogue itself is not populated. guia.la MVP should be read-only public content plus an admin path.
- **Timezone bugs are systemic.** `fallbackTideService.getTideDataForDate` keys by `date.toISOString()` (UTC date). After 21:00 local (UTC-3) it would show the next day's tides. `getNextBoat` uses the device clock. guia.la should store tenant timezone and compute in it on the server.
- **Secrets exposure by design.** `VITE_WORLDTIDES_API_KEY` and `VITE_STORMGLASS_API_KEY` are bundled to the client. guia.la should proxy third-party APIs through Workers.
- **White-label was env-flag only.** The `white-label-build.yml` flags toggle UI but do not remove code from the bundle. This matches the RFC #71 comment's demand for build-time manifests.
- **Reusable assets:** PT route map (for redirects), i18n JSON, static place/beach coordinates, tide PDF parser, SQL security test ideas, `first-load` Playwright pattern, build env guard. Licensing and accuracy of each must be re-verified.

## Unverified / needs spike

- Which host and commit serve `cotiju.app` now (Surge vs Workers). Not checked; #63 investigator also could not reach prod.
- Real row counts with service role (#59). Only PR #52's anon-key read is known.
- Whether Workbox actually serves one user's `profiles` response to another (#65). Code risk only; no repro.
- Licence and redistribution terms of the OCA tide dataset, WorldTides, StormGlass, HG Brasil, OSM tiles. Not researched here.
- Test counts are static `grep` counts; the suites were not run. Flakiness and true pass rate unknown beyond PR #52's report.
- Whether Supabase Realtime is enabled for each table (no `ALTER PUBLICATION supabase_realtime` found in active migrations; may live in dashboard config).
- Data worth migrating (places, photos with rights, accounts): needs an inventory and backup before any export (RFC #71 checklist).
- PR #39 reported "24 tables" vs 23 found here: the extra table may be auth/user mapping for Better Auth (inferred, not checked).
