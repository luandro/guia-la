# Legacy export runbook (owner-run)

> Phase 01 deliverable (task 01-6, PR 01-6). This replaces the Phase 00
> stub at the same path. Every command below is **unverified until the
> owner runs them** — no agent has executed or validated any of them
> against the live project. The phase file's proposed
> `docs/legacy/export-runbook.md` path is not used; this file is the
> runbook of record.

- Written 2026-11-22 against legacy baseline
  `c0c99077593a870ba4295798f0471a66288a6c4c`.
- Who runs it: **the owner, and only the owner**
  ([approval list item 8](../security/APPROVAL-LIST.md)). Agents never run
  the export, never hold or transmit the Supabase service key or any
  legacy credential, and never write to `luandro/cotiju-app` or its
  database.
- What may enter this repository afterwards: **aggregate row counts**,
  recorded in [docs/legacy/extraction-matrix.md](../legacy/extraction-matrix.md).
  Nothing else — no rows, no media, no credentials, no export file paths
  with sensitive content.

## Step 1 — Backup gate (nothing proceeds before this)

1. In the Supabase dashboard, take a backup or point-in-time snapshot of
   the project (Storage included if dashboards allow it).
2. Verify the backup is restorable (restore to a scratch project or use
   the dashboard's verified-restore indicator). An unverified backup does
   not open the gate.
3. Record the confirmation in the extraction matrix header by replacing
   `owner confirmation: PENDING (no export has run)` with the confirmation
   date and method. That line must predate every export artifact.

## Step 2 — Read-only connection (owner-held)

Preferred: a dedicated read-only role. Owner runs this once in the
Supabase SQL editor (unverified — owner validates against the live
project):

```sql
-- unverified until the owner runs it
create role cotiju_export readonly nologin;
grant usage on schema public to cotiju_export;
grant select on all tables in schema public to cotiju_export;
```

Then connect with a session-pooler connection string bound to that role
(the owner obtains it from the dashboard; agents never see it):

```bash
export COTIJU_RO='postgresql://cotiju_export:<password>@<pooler-host>:5432/postgres'
```

The role password is created and held by the owner, stored in the owner's
password manager, and dropped after the export:

```sql
-- unverified until the owner runs it
drop role cotiju_export;
```

If creating a role is not possible, the owner may run step 3's counts in
the dashboard SQL editor instead; the file export (step 4) still needs a
psql connection. Never use the service key to export.

## Step 3 — Row counts, all 23 tables (read-only)

One query, run by the owner (unverified until the owner runs it):

```sql
select 'admin_audit_log' as table, count(*) from admin_audit_log
union all select 'admin_users', count(*) from admin_users
union all select 'audit_log', count(*) from audit_log
union all select 'beach_locations', count(*) from beach_locations
union all select 'boat_schedules', count(*) from boat_schedules
union all select 'business_edit_audit', count(*) from business_edit_audit
union all select 'business_photos', count(*) from business_photos
union all select 'event_updates', count(*) from event_updates
union all select 'events', count(*) from events
union all select 'location_reviews', count(*) from location_reviews
union all select 'moto_taxi_drivers', count(*) from moto_taxi_drivers
union all select 'owner_requests', count(*) from owner_requests
union all select 'photo_likes', count(*) from photo_likes
union all select 'place_edit_suggestions', count(*) from place_edit_suggestions
union all select 'place_reviews', count(*) from place_reviews
union all select 'place_suggestions', count(*) from place_suggestions
union all select 'places', count(*) from places
union all select 'profiles', count(*) from profiles
union all select 'rate_limits', count(*) from rate_limits
union all select 'review_comments', count(*) from review_comments
union all select 'tide_data', count(*) from tide_data
union all select 'user_photos', count(*) from user_photos
union all select 'weather_data', count(*) from weather_data
order by 1;
```

Service-role counts are expected to exceed the anon-visible counts from
legacy PR #52 (which saw 0 rows for `boat_schedules` and
`beach_locations`). The delta is a recorded output, not an error.

## Step 4 — File export, allowlist tables only (read-only)

Export **only** the extraction matrix's `data`-verdict tables. At the
time of writing that allowlist is `places` and `boat_schedules`; if the
matrix's verdicts change, this allowlist changes with them and nothing
else. The owner runs, from an empty working directory
`~/cotiju-export-2026-11/` (owner-chosen; must be outside every
repository) on an encrypted volume (unverified until the owner runs it):

```bash
mkdir -p ~/cotiju-export-2026-11 && cd ~/cotiju-export-2026-11

for t in places boat_schedules; do
  psql "$COTIJU_RO" -v ON_ERROR_STOP=1 -c "\copy (select * from $t) to '$t.csv' with (format csv, header true)"
done
```

`COPY ... TO STDOUT` is the equivalent one-liner form if the owner
prefers stdout redirection:

```bash
psql "$COTIJU_RO" -c "copy (select * from places) to stdout with (format csv, header true)" > places.csv
```

Personal-data columns inside `places` (`business_phone`, `business_email`,
`owner_id`, `created_by`) are exported to the owner-held file for
inspection; they are never imported and never quoted into this repo
([privacy-classification.md](../legacy/privacy-classification.md)).

## Step 5 — Checksums (owner-run, unverified)

```bash
cd ~/cotiju-export-2026-11
sha256sum *.csv | tee sha256sums.txt
```

## Step 6 — Manifest (owner-held)

Write `manifest.txt` in the same directory: date, Supabase project ref,
baseline commit `c0c99077593a870ba4295798f0471a66288a6c4c`, table list,
row counts from step 3, checksums from step 5, tool versions
(`psql --version`). Keep the manifest with the export.

## Step 7 — Storage and cleanup

- Move the export directory to its permanent owner-chosen encrypted
  location. It is never committed, attached to a PR, uploaded or pasted
  into any chat or agent session.
- Drop the `cotiju_export` role (step 2).
- Agents receive only: the counts (step 3) and checksums (step 5). The
  owner records the counts into the extraction matrix's "row count"
  column, replacing `owner export: pending`.

## What is never exported (regardless of counts)

- `auth.*` — account data is out of scope entirely.
- All personal-data classes in
  [privacy-classification.md](../legacy/privacy-classification.md):
  profiles, phones, user photos, ownership documents, reviews, audit
  tables, suggestions.
- Media buckets `user-photos`, `place-suggestions`, `ownership-documents`.
- The OCA tide dataset and any API-cached content (rights unknown).
- Secrets: the service key, legacy `.env` values, bundled `VITE_*` keys
  (D-12).

## If something goes wrong

- Errors, or a table returning zero rows where rows were expected: stop,
  record what happened in the manifest, escalate to the owner's own notes.
  Never retry with elevated
  credentials (service key) — that is the one forbidden fix.
- Counts disagree with checksums or the manifest: stop; a delta is
  recorded and explained, never silently accepted.
