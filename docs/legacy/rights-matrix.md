# Legacy content and media rights matrix

- Baseline commit: `c0c99077593a870ba4295798f0471a66288a6c4c` (2026-11-21);
  matrix written 2026-11-22.
- Purpose: the D-11 input. For each reusable legacy asset class, its licence
  status and what the owner must rule on. This matrix never grants rights.
- Rule: a licence status is `known` only with a verifiable source. No
  licence has been verified for any row below, so every row is `unknown`.
  Unknown is the honest default; upgrading a row requires the owner's ruling
  plus a citable source, never an agent assumption.
- Owner ruling column: `deferred (owner, 2026-11-22)` — the owner deferred
  all rulings to before Phase 09 (the D-11 input); until then every row
  stays unrated and nothing may import. A ruling records
  keep / ask / drop; "ask" means: ask the rights holder or collect
  consent before any use.

| asset | what it covers | source in legacy | licence status | attribution needs | owner ruling (keep / ask / drop) |
|---|---|---|---|---|---|
| User photos | `user-photos` bucket, `user_photos` and `business_photos` tables; photos of users and businesses uploaded without recorded consent | supabase/migrations/20251226133726_restore_storage_buckets_and_policies.sql:20-31 | unknown | uploader consent absent; consent provenance required (approval-list privacy baseline) | deferred (owner, 2026-11-22) |
| Stock photos (hotlinked) | Unsplash URLs embedded as image references in static place data | src/data/locations.ts:37-48 | unknown (Unsplash hotlinking terms not verified here) | attribution per the hosting platform's terms, unverified | deferred (owner, 2026-11-22) |
| Place coordinates | lat/lng of island places and beaches in static data and the `places` / `beach_locations` tables | src/data/locations.ts:22-294; src/data/beachLocations.ts:1-51 | unknown (who compiled them and from what source is unrecorded) | none known; coordinates themselves are facts, but this compilation's provenance is unrecorded | deferred (owner, 2026-11-22) |
| Places descriptive content | Non-coordinate place content: names, descriptions and categories in the `places` table and the static data files | supabase/migrations/20251226131827_baseline.sql:1778; src/data/locations.ts:22-294; src/data/beachLocations.ts:1-51 | unknown (authorship of the descriptions is unrecorded) | none known; factual snippets may carry no copyright, but authorship is unconfirmed | deferred (owner, 2026-11-22) |
| `boat_schedules` content | Timetable rows for island boat transport (routes, departure times, fares as recorded) | supabase/migrations/20251226131827_baseline.sql:2103 | unknown (who compiled the schedules and from what source is unrecorded) | none known; timetables are factual data, but this compilation's provenance is unrecorded | deferred (owner, 2026-11-22) |
| i18n JSON | Portuguese and English UI translation strings | src/i18n/locales/pt.json; src/i18n/locales/en.json | unknown (presumed owner-authored; not confirmed) | none if owner-authored and the owner licenses reuse into guia.la | deferred (owner, 2026-11-22) |
| Tide dataset (OCA) | "cotijuba-tides-2025.json" tide table attributed to "Observatório da Costa Amazônica (OCA)", datum MSL, timezone UTC-3, year 2025 only | src/data/cotijuba-tides-2025.json:1-9 (copied at public/data/) | unknown (no licence statement found in the file or repo) | OCA attribution is present; redistribution permission is not | deferred (owner, 2026-11-22) |
| WorldTides API | Client-side tide fetches with a bundled `VITE_WORLDTIDES_API_KEY` | src/services/tideService.ts:59-74 | unknown (API terms not verified; key already public — see D-12 advisory in [README.md](README.md)) | provider terms if ever used again; guia.la proxies instead | deferred (owner, 2026-11-22) |
| StormGlass API | Client-side tide fallback with a bundled `VITE_STORMGLASS_API_KEY` | src/services/tideService.ts:138-197 | unknown (API terms not verified) | provider terms | deferred (owner, 2026-11-22) |
| OpenWeatherMap API | Weather refreshes in the `update-weather` Edge Function | supabase/functions/update-weather/index.ts (server-side) | unknown (API terms not verified) | provider terms | deferred (owner, 2026-11-22) |
| HG Brasil API | Brazilian weather source used by the same Edge Function | supabase/functions/update-weather/index.ts (server-side) | unknown (API terms not verified) | provider terms | deferred (owner, 2026-11-22) |
| OSM tiles | OpenStreetMap raster tiles cached by the service worker (CacheFirst, 30 days, 600 entries) | vite.config.ts:144-152 | unknown (OSM tile usage policy not verified against this caching profile) | OSM attribution and tile-policy compliance | deferred (owner, 2026-11-22) |

## Consequences while statuses stay unknown

- No asset above is copied into this repo — not into fixtures, docs, tests or
  chat. Fixtures are synthetic by contract.
- No `data`-verdict row of the
  [extraction matrix](extraction-matrix.md) may import before its rights
  rows here carry an owner ruling with a citable licence source
  ([migration-plan.md](migration-plan.md) gate 1).
- The OCA tide dataset and all third-party APIs additionally stay unused
  until their terms are read and recorded; guia.la's default is server-side
  proxying with its own keys (D-12 lesson).
