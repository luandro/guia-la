# Legacy extraction matrix

- Baseline commit: `c0c99077593a870ba4295798f0471a66288a6c4c` (2026-11-21);
  re-verified unchanged on 2026-11-22 (task 01-1 delta: no change).
- Backup gate: owner confirmation: PENDING (no export has run).
- Verdict vocabulary: `concept`, `code`, `data`, `fixture`, `reject` —
  exactly one per row ([phase-01.md](../../planning/src/phases/phase-01.md)).
- `anon-visible` records a known fact with its source, or `unknown` when no
  anon-read fact exists. Known facts come from legacy PR #52 (2026-11-21).
- `row count` stays `owner export: pending` until the owner runs
  [legacy-export.md](../runbooks/legacy-export.md) and records counts here.
- Personal-data defaults and LGPD reasoning:
  [privacy-classification.md](privacy-classification.md). Rights status per
  asset: [rights-matrix.md](rights-matrix.md).

## Tables (23)

| name | kind | personal data | anon-visible | verdict | target phase | source | row count |
|---|---|---|---|---|---|---|---|
| places | table | yes (business_phone, business_email, owner_id, created_by) | unknown (#59 reports 0 anon rows in 5 tables; which 5 is not recorded) | data | 09 | supabase/migrations/20251226131827_baseline.sql:1778 | owner export: pending |
| beach_locations | table | yes (owner_id) | 0 rows (PR #52 anon read, 2026-11-21) | reject | — | supabase/migrations/20251226131827_baseline.sql:2068; deprecated by places per comment at :1815 | owner export: pending |
| boat_schedules | table | no | 0 rows (PR #52 anon read, 2026-11-21) | data | 09 | supabase/migrations/20251226131827_baseline.sql:2103 | owner export: pending |
| tide_data | table | no | unknown; newest row 2026-06-08 per PR #52 (stale at audit date) | reject | — | supabase/migrations/20251226131827_baseline.sql:2531; https://github.com/luandro/cotiju-app/issues/62 | owner export: pending |
| weather_data | table | no | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2599 | owner export: pending |
| moto_taxi_drivers | table | yes (name, phone NOT NULL, whatsapp, license_plate, photo_url, user_id) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2332; see privacy-classification.md | owner export: pending |
| events | table | yes (created_by) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2219 | owner export: pending |
| event_updates | table | yes (created_by, reviewed_by) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2166 | owner export: pending |
| profiles | table | yes (display_name, avatar_url, id links to auth users) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:1970 | owner export: pending |
| user_photos | table | yes (user_id, uploaded media) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2554 | owner export: pending |
| business_photos | table | yes (photo_url, uploader linkage) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2148; media rights unverified | owner export: pending |
| location_reviews | table | yes (user_id, approved_by) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2306 | owner export: pending |
| place_reviews | table | yes (user_id, approved_by) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2441 | owner export: pending |
| review_comments | table | yes (user_id) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2512 | owner export: pending |
| photo_likes | table | yes (user_id) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2401 | owner export: pending |
| place_suggestions | table | yes (user_id, submitter content) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2467 | owner export: pending |
| place_edit_suggestions | table | yes (user_id, reviewed_by) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2412 | owner export: pending |
| owner_requests | table | yes (user_id, reviewed_by, linked identity documents) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:79 | owner export: pending |
| admin_users | table | yes (email, user_id) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2020 | owner export: pending |
| admin_audit_log | table | yes (admin_user_id, action details) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:1956 | owner export: pending |
| audit_log | table | yes (user_id, old_data/new_data jsonb snapshots) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2054 | owner export: pending |
| business_edit_audit | table | yes (user_id, changes jsonb) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2134 | owner export: pending |
| rate_limits | table | yes (user_id) | unknown | reject | — | supabase/migrations/20251226131827_baseline.sql:2499; operational table, rebuilt fresh if needed | owner export: pending |

## Storage buckets (3)

| name | kind | personal data | anon-visible | verdict | target phase | source | row count |
|---|---|---|---|---|---|---|---|
| user-photos | storage bucket | yes (user-uploaded photos) | unknown; bucket is not public | reject | — | supabase/migrations/20251226133726_restore_storage_buckets_and_policies.sql:21 (public=false) | owner export: pending |
| place-suggestions | storage bucket | yes (submitter photos) | unknown | reject | — | supabase/migrations/20251226133726_restore_storage_buckets_and_policies.sql:25 | owner export: pending |
| ownership-documents | storage bucket | yes (sensitive PII documents) | unknown; private bucket | reject | — | supabase/migrations/20251226133726_restore_storage_buckets_and_policies.sql:29-30 (private, PII) | owner export: pending |

## Static data files

| name | kind | personal data | anon-visible | verdict | target phase | source | row count |
|---|---|---|---|---|---|---|---|
| locations.ts | static data file (13 places) | no phone or email fields found; hotlinked Unsplash image URLs (rights unknown) | shipped in bundle, so fully visible | data | 09 | src/data/locations.ts:22-294 (13 id fields); image URLs at :37-48 | owner export: pending |
| beachLocations.ts | static data file (4 beach entries) | no personal fields found | shipped in bundle, so fully visible | data | 09 | src/data/beachLocations.ts:1-51 (4 id fields) | owner export: pending |
| cotijuba-tides-2025.json | static data file (tide table) | no | shipped in bundle, so fully visible | reject | — | src/data/cotijuba-tides-2025.json:1-9 (source "Observatório da Costa Amazônica (OCA)", year 2025); identical copy at public/data/cotijuba-tides-2025.json; 2025-only and OCA licence unknown (https://github.com/luandro/cotiju-app/issues/62) | owner export: pending |
| i18n pt.json | static data file (pt translations) | no (UI strings) | shipped in bundle, so fully visible | data | 09 | src/i18n/locales/pt.json; reuse only if the owner confirms authorship and licence — see rights-matrix.md | owner export: pending |
| i18n en.json | static data file (en translations) | no (UI strings) | shipped in bundle, so fully visible | data | 09 | src/i18n/locales/en.json; same owner-ruling condition as pt.json | owner export: pending |
| parseTidePdf.py | script (tide PDF parser) | no | n/a (dev tool) | code | 09 | scripts/parseTidePdf.py:39 (writes src/data/cotijuba-tides-2025.json); adapt with attribution only after review and tests, and only if a fresh tide pipeline still needs PDF parsing | owner export: pending |

## Verdict summary

- `data`: 6 rows (places, boat_schedules tables; locations.ts,
  beachLocations.ts, pt.json, en.json static files). Every one is blocked
  from import until the rights matrix carries an owner ruling and the
  owner-run export records real counts ([migration-plan.md](migration-plan.md)).
- `code`: 1 row (parseTidePdf.py, Phase 09 review gate).
- `reject`: 25 rows. Reject reasons, by class: personal data without consent
  records (privacy-classification.md); media with unverified rights;
  ephemeral or stale content (tides, weather, events); deprecated duplicate
  (beach_locations); operational/audit tables rebuilt fresh rather than
  ported.
- `concept` and `fixture` verdicts for this phase's asset classes are
  recorded in [scenario-port-list.md](scenario-port-list.md) (business rules
  and test scenarios) and [migration-plan.md](migration-plan.md) (route
  map); the synthetic fixtures themselves live in
  `packages/fixtures/{cotijuba,serra}/` and copy no legacy values.
