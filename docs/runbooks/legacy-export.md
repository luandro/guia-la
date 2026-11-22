# Legacy export runbook (stub)

> Phase 00 task 10 (PR 00-10). This is a stub, not a runnable runbook.
> No command below has been run. Phase 01 writes the real owner-executed
> runbook at `docs/legacy/export-runbook.md` (PR 01-6) and supersedes this stub.

## Purpose

- Record how legacy Cotiju Supabase data will be exported, before Phase 01 needs it.
- Fix the safety rules now: backup first, owner-run only, export stays outside git.
- Give Phase 01 agents one known pointer instead of improvised access.
- Sources: [legacy audit](../../planning/research/legacy-cotiju-audit.md) and
  [phase 01](../../planning/src/phases/phase-01.md).

## Who runs it

- The owner, and only the owner ([approval list item 8](../security/APPROVAL-LIST.md)).
- Agents never run the export and never hold the Supabase service key.
- Agents never write to `luandro/cotiju-app` or its database.
- Read access to the repo was confirmed on 2026-11-22; that changes nothing above.

## Preconditions

All three must hold before any export step.

1. A Supabase backup or point-in-time snapshot exists and was verified
   restorable. Record the confirmation date in the extraction matrix header.
2. Credentials are read-only (SELECT only) and held by the owner.
   `TODO phase 01: create a dedicated read-only role — unverified.`
3. The export lands in owner-chosen encrypted storage outside every repository.
   It is never committed, never attached to a PR, never pasted into chat.

## Steps

> Placeholder commands. TODO: verify against the live project in Phase 01.

1. Record the date, the Supabase project ref, and the backup confirmation.
2. Count rows per source table (23 tables; list in the phase-01 matrix lint):
   `TODO owner: read-only count query per table — unverified.`
3. Export each allowlisted table to its own file:
   `TODO owner: read-only export command (per-table CSV or pg_dump --data-only) — unverified.`
4. Compute a checksum per exported file:
   `TODO owner: sha256sum over each export file — unverified.`
5. Write a manifest: date, tables, row counts, checksums, tool and versions.
6. Move export files and manifest into the encrypted location from Preconditions.

## What must never be exported or committed

- Supabase auth users (`auth.*`). Account data is out of scope entirely.
- Personal data without a recorded consent basis: profiles, phones, emails,
  user photos, ownership documents. Default verdict is do not migrate.
- Media with unverified rights: `user-photos`, `place-suggestions`,
  `ownership-documents` buckets; the OCA tide dataset (licence unknown).
- Secrets: the service key, legacy `.env` values, bundled `VITE_*` API keys (D-12).
- Only aggregate counts and explicitly public fields may enter this repo.

## Verification

- Row count per exported table equals the source count from step 2.
  A delta is recorded and explained, never silently accepted.
- Service-role counts are expected to exceed anon-visible counts. Legacy PR #52
  saw zero anon-visible rows in several tables. That delta is itself an output.
- Every exported file's checksum matches the manifest.

## Hand-off to Phase 01 agents

- Agents receive the manifest (counts and checksums only) and the storage
  location path. They never receive the export files or any credential.
- Counts land in the extraction matrix header
  (`docs/legacy/extraction-matrix.md`, PR 01-2).
- This stub is superseded by `docs/legacy/export-runbook.md` (PR 01-6).

## Open questions

- Exact export tool and connection method. Decided in PR 01-6.
- The table allowlist beyond the obviously public tables. Decided with the matrix (PR 01-2).
- OCA tide dataset licence. Unknown; tracked by the rights matrix (PR 01-3).
- Whether Supabase Realtime publications match the migrations. Unknown.
