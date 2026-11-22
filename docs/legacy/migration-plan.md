# Migration plan — Phase 09 draft (task 01-9)

- Baseline commit: `c0c99077593a870ba4295798f0471a66288a6c4c` (2026-11-21);
  written 2026-11-22. This is a draft gating Phase 09, not an execution
  plan for today.
- **Hard rule: no real legacy content imports anywhere before Phase 09.**
  Not into fixtures, not into seeds, not into staging, not "temporarily".
  Phase 01 produces verdicts, synthetic fixtures and this plan only.

## 1. What may import (the allowlist)

Only rows verdicted `data` in the
[extraction matrix](extraction-matrix.md) **and** cleared in the
[rights matrix](rights-matrix.md) — licence status `known` with a citable
source, owner ruling `keep` — **and** counted by the owner-run export
([legacy-export.md](../runbooks/legacy-export.md)):

| Source | Target in Phase 09 | Conditions |
|---|---|---|
| `places` table | staging destination's place records (no photos yet) | Strip personal columns (`business_phone`, `business_email`, `owner_id`, `created_by`) unless each contact carries fresh consent per the approval-list privacy baseline; every row enters with provenance (source, verified_at) and editorial review before serving |
| `boat_schedules` table | transport widget data | Freshness check per row: a schedule whose `valid_until` passed is imported as historical reference only, never served; each row re-verified by the editorial routine |
| `src/data/locations.ts` + `src/data/beachLocations.ts` coordinates | merge candidate into the same place records | Treated as unverified suggestions until an editor confirms each one; image URLs are not imported (rights unknown); each applied merge journals the prior value of every place field it overwrites so rollback restores it (§3) |
| `src/i18n/locales/{pt,en}.json` strings | terminology reference for translation memory | Only if the owner confirms authorship and licenses reuse; guia.la's key structure differs, so strings are a reference, not a drop-in |

Everything else in the legacy repo stays not-migrated: all personal-data
classes ([privacy-classification.md](privacy-classification.md)), all
media with unverified rights, all audit tables, ephemeral or stale content
(tides, weather, events), and the deprecated `beach_locations` table.

`parseTidePdf.py` (verdict `code`) may be adapted with attribution in
Phase 09 only if the fresh tide pipeline still wants PDF parsing, after
review and tests of its own.

## 2. ID and URL mapping

- **IDs:** legacy UUIDs never become guia.la public identifiers. The import
  writes a mapping table (`legacy_id → new_id`) kept in the staging
  database, not in this repo. Synthetic fixtures already use `fx-*` ids;
  imported records use guia.la's own id scheme from Phase 07.
- **URLs:** legacy public routes are Portuguese with English redirects
  (`src/App.tsx:128-377` PT routes, `:380-394` EN→PT redirects). New routes
  are locale-prefixed. The mapping approach:

  | Legacy route (App.tsx line) | New shape |
  |---|---|
  | `/` (128) | `/{locale}` |
  | `/mapa` (171) | `/{locale}/map` |
  | `/locais` (235), `/locais/:id` (185) | `/{locale}/places`, `/{locale}/places/{slug}` — legacy UUID to new slug via the ID map |
  | `/transporte` (212) | `/{locale}/transport` |
  | `/mare` (226) | `/{locale}/tides` |
  | `/clima` (219) | `/{locale}/weather` |
  | `/evento/:id` (293) | no target — events are not in the migration allowlist |

  The full table (including placeholders like `/hospedagem`, `/sobre` and
  the EN redirect aliases) is produced during Phase 09 from
  `src/App.tsx:128-394` at the then-current baseline, and the 301 redirect
  map ships in Phase 10, not before.

## 3. Rollback

- The import runs into a **staging destination first** (Phase 09 exit
  gate: pilot users on staging, never production).
- Each import batch records: date, source commit, batch id, per-table row
  counts, the manifest checksums from the owner's export, and — for the
  coordinate merge — the prior value of every place field the batch
  updates.
- Import is additive and reversible, with one updating step. Inserts
  (`places`, `boat_schedules`) reverse by deleting the batch's rows by
  batch id. The coordinate merge updates existing place rows instead of
  inserting; rollback restores each merged field's recorded prior value
  first, then deletes the batch's rows. Rollback = restore merged fields,
  delete the batch's rows, rebuild the static export, purge caches. The
  legacy repo and the owner-held export are never modified by a rollback.
- If counts or checksums disagree with the manifest at any point: stop,
  record, escalate to the owner (phase-01 error-state rule; never retry
  with elevated credentials).

## 4. Gates before any import step

1. Rights matrix rows for every allowlist source carry licence `known` +
   owner ruling `keep` (D-11 closed for those rows).
2. Owner-run export completed with the backup gate confirmed before it;
   counts recorded in the extraction matrix.
3. Phase 07's schema exists with provenance columns (source, verified_at)
   and the editorial console can review imported rows before they serve.
4. Owner approval recorded for the import run itself (production-data
   writes are approval-list item 1; legacy production is item 8).
