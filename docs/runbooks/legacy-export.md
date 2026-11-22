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
create role cotiju_export login;
alter role cotiju_export set default_transaction_read_only = on;
grant usage on schema public to cotiju_export;
grant select on all tables in schema public to cotiju_export;
```

`login` is required for the role to connect (the connection below uses
it); `default_transaction_read_only = on` makes its sessions read-only
even if a write statement is ever pasted in. Before connecting, set the
role's
password in psql — never in this file, a shell history or a shared
command: the owner runs `\password cotiju_export` in a psql session, which
prompts for it and transmits only the hash. Then connect with a
session-pooler connection string bound to that role (the owner obtains it
from the dashboard; agents never see it):

```bash
export COTIJU_RO='postgresql://cotiju_export:<password>@<pooler-host>:5432/postgres'
```

The role password is created and held by the owner, stored in the owner's
password manager. After the export, revoke the grants before dropping the
role — PostgreSQL refuses `drop role` while the role still holds
privileges:

```sql
-- unverified until the owner runs it
revoke select on all tables in schema public from cotiju_export;
revoke usage on schema public from cotiju_export;
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
set -euo pipefail

# Column list for places: every live column except the personal-data ones,
# built from information_schema so a column the audit never catalogued
# cannot leak into the export either.
PLACES_COLS=$(psql "$COTIJU_RO" -Atc "
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
  from information_schema.columns
  where table_schema = 'public' and table_name = 'places'
    and column_name not in ('business_phone', 'business_email', 'owner_id', 'created_by')")

psql "$COTIJU_RO" -v ON_ERROR_STOP=1 -c "\copy (select $PLACES_COLS from places) to 'places.csv' with (format csv, header true)"
psql "$COTIJU_RO" -v ON_ERROR_STOP=1 -c "\copy (select * from boat_schedules) to 'boat_schedules.csv' with (format csv, header true)"

# Both files must exist and be non-empty before step 5 touches them.
test -s places.csv && test -s boat_schedules.csv
```

`set -euo pipefail` stops the run at the first failed command — the export
never continues past a failed copy — and the final `test` refuses to hand
a missing or empty file to the checksum step.

`COPY ... TO STDOUT` is the equivalent one-liner form if the owner
prefers stdout redirection:

```bash
psql "$COTIJU_RO" -c "copy (select $PLACES_COLS from places) to stdout with (format csv, header true)" > places.csv
```

Personal-data columns inside `places` (`business_phone`, `business_email`,
`owner_id`, `created_by`) are **never selected into any export file**; they
stay in the legacy database
([privacy-classification.md](../legacy/privacy-classification.md)).
`boat_schedules` carries no personal-data column per the extraction
matrix, so its full row set exports. If the live `places` schema shows
further personal columns beyond the four excluded above, the owner adds
them to the exclusion list and records the final exported column list in
the manifest (step 6).

## Step 5 — Record counts and checksums (owner-run, unverified)

Count the exported records with a CSV-aware tool (quoted fields may
contain newlines, so counting lines is wrong), and hash exactly the two
expected files — never a glob over whatever happens to exist:

```bash
cd ~/cotiju-export-2026-11
for t in places boat_schedules; do
  python3 - "$t" <<'PY'
import csv, sys
t = sys.argv[1]
with open(f"{t}.csv", newline="", encoding="utf-8") as fh:
    print(f"{t}: {sum(1 for _ in csv.reader(fh)) - 1} data rows")
PY
done
sha256sum places.csv boat_schedules.csv | tee sha256sums.txt
```

The CSV record count is the manifest's row count for that table. Each
must equal its step 3 database count; any mismatch trips the stop rule
below. Deriving manifest counts from the exported files themselves (not
from a second database session) is what keeps the manifest and the files
beside it consistent even if the data moved between sessions.

## Step 6 — Manifest (owner-held)

Write `manifest.txt` in the same directory: date, Supabase project ref,
baseline commit `c0c99077593a870ba4295798f0471a66288a6c4c`, table list,
the exported `places` column list (step 4's `PLACES_COLS`), row counts
from step 5's CSV records (each equal to its step 3 count), checksums
from step 5, tool versions (`psql --version`, `python3 --version`).
Keep the manifest with the export.

## Step 7 — Storage and cleanup

- Move the export directory to its permanent owner-chosen encrypted
  location. It is never committed, attached to a PR, uploaded or pasted
  into any chat or agent session.
- Drop the `cotiju_export` role (step 2).
- Agents receive only: the counts (steps 3 and 5) and checksums (step 5).
  The owner records the counts into the extraction matrix's "row count"
  column, replacing `owner export: pending`.

## Static-file counts (owner-run; no database, no export files)

The extraction matrix's four static `data` rows (`locations.ts`,
`beachLocations.ts`, `pt.json`, `en.json`) also carry `owner export:
pending` row counts. They never pass through the export directory; the
owner counts them once in the legacy checkout at baseline
`c0c99077593a870ba4295798f0471a66288a6c4c` (unverified until the owner
runs it):

```bash
cd <legacy-checkout>   # at the baseline commit above
grep -cE '\bid[[:space:]]*:' src/data/locations.ts        # entry count (audit: 13)
grep -cE '\bid[[:space:]]*:' src/data/beachLocations.ts   # entry count (audit: 4)
jq '[.. | strings] | length' src/i18n/locales/pt.json     # translated string count
jq '[.. | strings] | length' src/i18n/locales/en.json
```

Record each number in the matrix's "row count" column together with the
command used, so the count definition stays reproducible. If a command
matches nothing or a count disagrees with the audit's expectation
(13 and 4 above), stop and record the discrepancy instead of switching
commands until a nicer number appears.

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
- Counts disagree — step 3 database counts vs step 5 CSV record counts,
  or counts vs what the manifest records: stop; a delta is recorded and
  explained, never silently accepted.
