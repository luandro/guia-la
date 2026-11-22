# Privacy and LGPD classification (task 01-8)

- Baseline commit: `c0c99077593a870ba4295798f0471a66288a6c4c` (2026-11-21);
  written 2026-11-22.
- Default for everything in this document: **NOT migrated**. Nothing below
  is copied into this repo, fixtures, docs, staging or PR artifacts
  ([approval list item 8](../security/APPROVAL-LIST.md)).
- LGPD context: every class below is *dados pessoais* (LGPD Art. 5º, items
  I–II) or personal sensitive-adjacent documentation. The legacy app kept no
  consent records for any of it (issue #68: no privacy or terms pages
  existed), so no legal basis for re-use is on file. Manufacturing a basis
  now is not allowed; the honest status is "no basis recorded".
- Re-collection with consent, if the owner ever wants these features, is
  deferred to **Phase 09** and follows the approval-list privacy baseline
  (consent provenance — `consentedAt`, `recordedBy`, scope — plus a
  takedown path).

## Classes and their fate

| Class | Legacy carriers (baseline.sql line) | Personal data | LGPD basis today | Migration verdict | Future (Phase 09+, owner decision) |
|---|---|---|---|---|---|
| Profiles | profiles (1970): display_name, avatar_url, id → auth users | yes | none recorded | NOT migrated | Not re-collected unless visitor accounts ever ship (D-13 says none) |
| Phones and emails | moto_taxi_drivers (2332): phone NOT NULL, whatsapp; places (1778): business_phone, business_email; admin_users (2020): email | yes | none recorded | NOT migrated | Natural-person contacts (e.g. moto-taxi drivers) re-collected only with documented consent; business contacts published only with `contactConsent` + `publishContact` flags (approval-list privacy baseline) |
| User photos | user-photos bucket (restore_storage_buckets_and_policies.sql:21, public=false); user_photos table (2554) | yes | none recorded | NOT migrated | Consent re-collection in Phase 09 at the earliest; media rights also unknown ([rights-matrix.md](rights-matrix.md)) |
| Ownership documents | ownership-documents bucket (restore_storage_buckets_and_policies.sql:29-30, private PII); owner_requests table (79) | yes (identity documents) | none recorded | NOT migrated | Never copied; any future claim flow re-collects documents under a published policy |
| Admin and audit tables | admin_users (2020), admin_audit_log (1956), audit_log (2054: old_data/new_data jsonb snapshots), business_edit_audit (2134: changes jsonb) | yes (actor identities; jsonb snapshots can embed any personal column) | none recorded | NOT migrated | guia.la builds its own minimal editor audit in Phase 07; legacy history stays in the legacy backup |
| Reviews and social feedback | location_reviews (2306), place_reviews (2441), review_comments (2512), photo_likes (2401) | yes (authorship and content) | none recorded | NOT migrated | Re-collection only with consent and a moderation policy |
| Community suggestions | place_suggestions (2467) + bucket, place_edit_suggestions (2412) | yes (submitter identity and content) | none recorded | NOT migrated | Editor-side workflows in Phase 07 collect afresh |
| Event authorship | events (2219: created_by), event_updates (2166) | yes | none recorded | NOT migrated (content also ephemeral/stale) | — |

## What this means concretely

1. The owner-run export
   ([legacy-export.md](../runbooks/legacy-export.md)) exports **counts** for
   the carriers above and nothing else, with one carve-out: `places` is in
   the export allowlist for its non-personal content, and the runbook
   selects **only explicitly non-personal columns** there —
   `business_phone`, `business_email`, `owner_id`, `created_by` and any
   other personal column the live schema shows are never selected into any
   export file. Phones, emails, owner and creator identifiers never leave
   the legacy database.
2. The extraction matrix marks every carrier above `reject`
   ([extraction-matrix.md](extraction-matrix.md)); no verdict upgrades
   without a recorded owner ruling (approval list).
3. Fixtures for phases 02–08 are synthetic by contract and contain no
   names, phones, emails, photos or documents of any real person; the
   privacy scan in `scripts/check-legacy.sh` enforces this in CI shape.
4. If a future phase wants any of this data, the path is: publish the
   privacy notice → collect consent with provenance → then process. There
   is no path from the legacy rows to guia.la content.
