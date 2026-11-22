---
id: 09
title: Selective migration, field pilot and content operations
short: Bring verified, consented Cotijuba content into a staging destination through an owner-run export, run the editorial routine for real, and pilot with people on the island.
tag: Field
status: draft
complexity: High (rights/people)
depends: 01,07,08
inspect: Populated staging destination preview, content-verification matrix, import dry-run reports, editorial activity log, field-pilot report with fixes
exit: Verified content with recorded rights serves anonymous visitors in staging, pilot users complete the core journeys, and no anonymous-access or tenancy regression exists
---

## Phase identity

Phase **09** is where guia.la stops running on fixtures. Only content that is verified, consented and rights-recorded moves across — and the humans who will keep it true take over the routine.

- **Objective:** selectively import audited Cotijuba content into the *staging* destination; run the editorial process live; pilot with visitors, businesses and transport providers in Cotijuba; leave content operations documented and monitored.
- **Prerequisites:** Phase 01 extraction matrix with per-item classification and provenance; Phase 07 API, editorial console, tenant isolation and ingestion; Phase 08 widget surfaces whose fixture schemas equal production schemas.
- **Dependencies:** phases 01, 07, 08. The *verification campaign* (task 1) is human-paced and may start in parallel with 07/08 — proposed in [review §8](../review.md); the *import* itself cannot.
- **Expected contributors:** human — data owner (runs the export, holds the service key, approves imports), local editors (verify and maintain content), field testers (residents, business owners, boat providers), product owner (D-11 licensing, go/no-go); agent — import tooling, regression suites, report assembly. This is the most human-dependent phase; agents never touch the legacy database.
- **Complexity/risks:** High, dominated by people and rights rather than code: production data truth is unknown (legacy anonymous reads returned 0 rows in 5 tables — [legacy audit §8](../research/legacy-cotiju-audit.md)); media and dataset licensing is unverified (D-11); editorial capacity is the platform's real availability risk (review R1). No hour estimates; the campaign length is set by content volume, not engineering.

| Phase | What it must provide before 09 import starts |
| --- | --- |
| 01 | Extraction matrix with per-item verdicts, provenance and rights fields |
| 07 | Editorial console, tenant isolation, freshness schema, ingestion jobs, backups |
| 08 | Widget surfaces whose fixture schema equals the production schema |

## Why this stage exists

The legacy incident ([#63](https://github.com/luandro/cotiju-app/issues/63)) was, most plausibly, a content-operations failure: empty or filtered tables, a tide table that stopped mid-2026 with no ingestion job, and two live hosts of unclear provenance — not a framework defect ([review §1](../review.md), [legacy audit §inference](../research/legacy-cotiju-audit.md)). A clean rewrite fixes none of that. Phase 09 exists to prove the platform's real availability driver: a working editorial routine on verified data.

It is also the trust gate. Legacy issue [#70](https://github.com/luandro/cotiju-app/issues/70) names the product's actual value: verified places, boats, contacts and photos with source and date — no invented data. Everything in this phase enforces that: nothing is imported without source, checked-at and rights recorded; anything unverifiable is dropped or re-collected, never guessed.

Finally, the field pilot tests the only hypothesis planning cannot: whether people in Cotijuba find the app worth using — offline on the ferry, on low-end Android, over 3G, sharing links on WhatsApp.

### Content scope verdicts (defaults from the audit)

| Legacy entity | Default verdict | Handling |
| --- | --- | --- |
| places and beach_locations | verify, then import | merge the two overlapping systems into one places domain; field-check coordinates |
| boat_schedules | verify, then import | re-verify every route with operators; validity windows required on every row |
| tide_data | never import as content | re-ingest from the chosen upstream with provenance; the legacy table ends 2026-06-08 |
| moto_taxi_drivers | re-collect | editorial consent per driver (`contactConsent` + `publishContact` recorded by an editor); numbers stay personal data until consent and publication are recorded |
| user_photos, photo_likes | drop | no consent or licence record exists in the schema ([review §6](../review.md), inference) |
| profiles, reviews, audit tables | drop | over-scoped for v1; no visitor accounts (D-13b); audit trio discarded per [review §6](../review.md) |
| events | defer | no events widget in the Phase 08 set; revisit after the pilot with real demand |

## Inputs and source references

Paths in the future `guia-la` repository are **proposed**.

- Phase 01 outputs (proposed): `docs/legacy/extraction-matrix.md` (per-item classification: concept, code, data, fixture, reject) plus the owner's admin-vs-visible row-count record (task 3), sanitized sample records.
- Import tooling (proposed): `tools/import/` with `map.ts` (mapping table), `dry-run.report.md` output, idempotency on `legacy_id`; imports write only to the staging D1 database via the Phase 07 repository layer.
- Content operations (proposed): `docs/content/editorial-checklist.md`, `docs/content/freshness-slas.md`, per-record fields `source`, `source_url`, `checked_at`, `valid_from`/`valid_until` where applicable, `license`, `correction_contact` (schema established in Phase 07).
- Legacy references (read-only, private repo): issues [#59](https://github.com/luandro/cotiju-app/issues/59) (public data missing — separate admin count from visible count), [#62](https://github.com/luandro/cotiju-app/issues/62) (tide staleness), [#63](https://github.com/luandro/cotiju-app/issues/63) (incident umbrella), [#64](https://github.com/luandro/cotiju-app/issues/64) (boat validity), [#70](https://github.com/luandro/cotiju-app/issues/70) (verified catalogue); [PR #39](https://github.com/luandro/cotiju-app/pull/39) as the cautionary 24-table over-import; [PR #52](https://github.com/luandro/cotiju-app/pull/52) anon-read observations; PT route names for the 301 map ([legacy audit §7](../research/legacy-cotiju-audit.md)).
- Authoritative context: D1 Time Travel and export behavior ([backend research §1](../research/backend-stores-starters.md)) — restores are in-place, 30-day window on paid plans, exports refuse virtual tables; LGPD applies to any personal data (phones, photos, profiles) — see risks.
- Known unknowns: real row counts behind the legacy tables (only the owner's export can answer — until then every count is "unknown"); accuracy of legacy coordinates and schedules (field verification required); whether OCA tide data or any legacy media may be redistributed (D-11); editor availability and cadence.
- Credentials/tools: the legacy Supabase service key never reaches an agent — the owner runs the export and places the encrypted artifact outside the repository (review §6). Cloudflare and GitHub access as provisioned in Phase 07. No store, DNS or production credentials are involved in this phase.

## Task breakdown

| # | Task (goal) | Owner | PR unit | Depends on |
| --- | --- | --- | --- | --- |
| 1 | Verification campaign: for every candidate record capture source, last-checked date, correction contact, rights, and a verdict (import, adapt, re-collect, drop) | human (editors) + agent (matrix tooling) | PR 09-1 matrix tooling | 01 |
| 2 | Licensing decision D-11: code license and content license decided and recorded; media redistribution rules settled | human | ADR commit | 1 (partial) |
| 3 | Backup and owner-run export: owner confirms a Supabase backup/PITR snapshot, runs the read-only export, delivers it encrypted outside the repo, plus an admin-vs-visible row-count manifest | human (owner) | no PR — evidence artifact | 1 |
| 4 | Import tooling: `tools/import` dry-run-by-default, mapping table `legacy_id` to new id, refusal rules (no checked_at or source means drop), idempotent re-runs, diff report | agent | PR 09-4 | 1, 3 |
| 5 | Staging import: run approved batches into the staging destination; spot-check journeys; tenant A/B and anonymous-access regression suites green | agent + human (approval per batch) | PR 09-5 (import records, not data, in git) | 4 |
| 6 | Editorial routine live: editors publish, correct and re-verify via the Phase 07 console; freshness SLAs per widget (boats re-verified weekly, tides ingestion monitored, places quarterly) with alerts | human (editors) + agent (alert wiring) | PR 09-6 alerts | 5 |
| 7 | Consent re-collection: business contacts and photos re-collected with explicit permission via editorial flow; legacy UGC, profiles, phone numbers and review tables are not migrated | human | PR 09-7 flow docs | 5 |
| 8 | Field pilot in Cotijuba: low-end Android on 3G, offline legs (ferry), GPS accuracy, WhatsApp share previews, readability; structured feedback log; fixes triaged | human (testers) + agent (fix PRs) | PR 09-8 fixes series | 6 |
| 9 | Destination metadata backfill: OG images per place category, search-preview polish, QR codes linking place pages (proposed), 301 map for legacy PT routes | agent + human (artwork) | PR 09-9 | 5 |
| 10 | Pilot readout and rollback rehearsal: content-accuracy status page, export-before-import proof, reverse-mapping deletion drill on staging, go/no-go input to Phase 10 | agent + human | PR 09-10 report | 8, 9 |

Notes: task 3 is the only task that touches legacy production, and it is read-only, owner-run and backup-first. Nothing in this phase writes to the legacy database, promotes staging to production, or touches DNS/stores — production promotion is a Phase 10, human-approved event.

## Architecture choices and guardrails

- **One-way, staged pipeline:** legacy export (encrypted, out-of-repo) → `tools/import` (dry-run default) → staging D1 through the Phase 07 repository layer with `destinationId` always set. There is no code path from guia.la to the legacy database in either direction.
- **Content contract:** every imported record carries `source`, `source_url` where public, `checked_at`, `correction_contact`, and `license`. Records missing source or checked date are dropped by the importer, not patched afterwards. Illustrative:

```ts
// tools/import/src/record.ts (illustrative, proposed)
export interface ImportableRecord {
  legacyId: string;          // mapping-table key, idempotency anchor
  destinationId: 'cotijuba'; // staging scope, single tenant in v1
  checkedAt: string;         // ISO date from the campaign matrix
  source: string;            // named person, business or dataset
  license: string;           // D-11 vocabulary entry
}
```

- **Privacy defaults (LGPD):** personal data is minimized by construction. Profiles, user photos, reviews and phone numbers from legacy are *not* migrated — the audit found no consent or licence record in the schema ([legacy audit §inference](../research/legacy-cotiju-audit.md), review §6). Public business contacts (e.g. moto-taxi numbers) are re-collected with permission, recorded with `contactConsent`/`publishContact` flags by an editor, and marked as business data. Fixture commits remain synthetic or explicitly public.
- **Freshness as a contract:** editorial SLAs are enforced by the same freshness fields the widgets render (Phase 08), so a stale boat schedule is visible in the UI *and* raises an alert — not silently swallowed as the legacy tide job was ([#62](https://github.com/luandro/cotiju-app/issues/62)).
- **Forbidden:** migrating personal records or UGC media; importing unverified records to "fill" the app; writing to legacy production; holding the legacy service key in any agent environment; committing export artifacts (even sanitized) to the repository; enabling production promotion inside this phase.
- **Acceptable alternatives:** smaller verified set over larger unverified set, always; manual re-entry through the editorial console instead of automated import where volume is small (preferred below ~100 records per type); re-collecting content at source instead of migrating it. The 24-table wholesale port ([PR #39](https://github.com/luandro/cotiju-app/pull/39)) is the rejected extreme.

### Privacy handling rules

1. Anything that identifies a person (name, phone, photo, location history) is personal data until a recorded consent or a legitimate business-contact publication exists.
2. Consent is collected by a human, in person or by direct message, and recorded with date, scope and the consenting party — never inferred from legacy data.
3. A consent withdrawal deletes the record and its snapshots; the importer's reverse mapping makes this a batch operation, not archaeology.
4. The repo never holds raw exports: sanitized excerpts used in issues or PRs are stripped of identifying fields before pasting, and the personal-data scanner runs in CI to catch slips.
5. Doubt means drop: an unverifiable record is re-collected or discarded, never "temporarily" imported.

### Import pipeline stages

1. Receive — the owner places the encrypted export outside the repo; the row-count manifest is filed as evidence.
2. Classify — records join the verification matrix; anything without a verdict stays out, by rule.
3. Dry-run — `tools/import` diffs against staging and emits per-batch inserts, updates and refusals.
4. Approve — a human approves the batch; that approval record is the only apply authorization.
5. Apply — the importer writes through the repository layer with `legacy_id` idempotency.
6. Verify — journeys and regression suites run against staging; the diff report is attached.
7. Retain — batch artifacts and reverse mappings are kept for rollback for the life of the phase.

### Editorial routine (draft cadence, tuned in the pilot)

- Daily glance: the freshness digest — any dataset past its SLA, any correction requests waiting.
- Weekly: boat schedules re-verified against operators; tide ingestion spot-checked against the harbour board.
- Quarterly: places sweep — photos, opening hours, contacts; stale records are archived visibly, never silently kept.
- Always: every edit records editor, source and date; corrections from the field flow through the same console, never through ad-hoc database access.

### Correction and moderation flow

1. A visitor or tester reports a correction through the public contact path on the record's page (no account needed).
2. The report lands in the editor console queue with the record, the claim and the reporter contact (optional).
3. An editor verifies against the source of record — operator, business owner, harbour board — and either applies the fix with a new verified date or rejects with a note.
4. Applied corrections bump `checked_at` and appear anonymously within the freshness window; rejected reports close with the reason kept in the log.
5. Moderation disputes (conflicting claims, business complaints) escalate to the product owner — the console has no delete-without-trace path.

> [!DECISION] D-11 (licensing) is the phase's hard gate: import batches of third-party-sourced content cannot run before the license vocabulary exists. D-12 (legacy key rotation) remains an owner action outside this repo — recommended before the export, not after.

## Deliverables

- [ ] `docs/content/verification-matrix.md` — every candidate record classified with verdict and rights (proposed path; content itself lives in the staging DB, not git)
- [ ] `tools/import/` — dry-run-first importer with mapping table, refusal rules, idempotency and diff reports
- [ ] Staging destination populated via approved batches; import records and diff reports attached to the approving tickets
- [ ] `docs/content/editorial-checklist.md` and `docs/content/freshness-slas.md`, wired to live alerts
- [ ] Consent artifacts: permission records for re-collected business contacts and photos (stored with the content, referenced in docs)
- [ ] Field-pilot report: device matrix, journeys, defects found and fixed, quotes usable for launch notes (with permission)
- [ ] 301 map `docs/web/legacy-redirects.md` covering legacy PT routes (proposed)
- [ ] Pilot readout with go/no-go recommendation for Phase 10

## Visual and functional QA

Human journeys in staging (preview pattern as established in Phase 04), then in the field:

1. **Editor:** sign in per D-09, edit a place's opening hours, re-verify a boat schedule (sets `checked_at`), see the change anonymously a minute later; attempt to touch Serra content and be refused (tenant A/B, Phase 07 suite green).
2. **Anonymous visitor (staging):** complete every Phase 08 journey against real content — search a real beach, read real departures for today's weekday, see today's real tide window with its source.
3. **Honesty states:** find a category with no verified content — it must show an honest empty state, never placeholder rows or stale legacy data.
4. **Field (Cotijuba):** low-end Android on 3G loads the home and transport screens usefully; airplane mode after first visit still shows cached schedules and tides with fetched-at; GPS locates the visitor relative to the pier; a place link shared to WhatsApp renders the OG card (manual check — D-03 surface).
5. **Correction loop:** a tester reports a wrong phone number through the correction contact path; an editor fixes it; the fix is visible and the correction is logged.

### Editor console journeys (run before the field pilot)

1. Sign in with the D-09 mechanism; land on the Cotijuba queue, not a global dashboard.
2. Create a place from scratch with source and checked date; see it render anonymously after publish.
3. Correct a boat time; confirm the change and the editor attribution appear in the log.
4. Handle a filed correction: apply one, reject one, both with reasons.
5. Attempt an out-of-scope action (delete without reason, edit another destination) and be refused with a clear message.

| Check | Staging (web) | Field low-end Android | Field iPhone spot |
| --- | --- | --- | --- |
| Core journeys complete | required | required | recommended |
| Offline cached content + stale chip | required | required | recommended |
| 3G usability (time-to-usable) | n/a | required | n/a |
| GPS accuracy near pier | n/a | required | optional |
| WhatsApp share preview | required | required | recommended |

Expected artifacts: screenshots/recordings from the field matrix, the feedback log with triage status, before/after evidence for each fix PR, and the editor-activity log excerpt showing the routine operating without developer help.

### Field-pilot protocol

- Devices: one low-end Android (2 GB RAM class) on 3G, one mid-range Android on Wi-Fi and 3G, one iPhone spot-check device; anything rarer is a bonus, not a requirement.
- Every tester runs the same seven-journey checklist — find a place, share a place, next boat, today's tides, call a service, an offline leg, report a correction — and notes friction verbatim.
- Defects are triaged the same day: blocking (journey impossible), major (possible but painful), minor (cosmetic or copy). Blocking items are fixed and that journey re-run before the readout.
- No tester's name, contact or photo is stored beyond the feedback log without explicit permission; the log itself stays out of the public repository.

## Automated verification

Nothing below has been run; all commands are **proposed** until a PR links real output. No command in this phase touches legacy production.

| Command | Purpose | Status |
| --- | --- | --- |
| `pnpm tsx tools/import/dry-run.ts --batch boats-2026-11` | diff report: inserts, updates, refusals with reasons | proposed |
| `pnpm tsx tools/import/apply.ts --batch boats-2026-11 --yes` | apply an approved batch to staging (requires recorded human approval) | proposed |
| `pnpm vitest run apps/api --tenant-matrix` | tenant A/B and anonymous-access regression suites | proposed |
| `pnpm playwright test e2e/content/` | real-content journeys incl. honest-empty and correction loop | proposed |
| `pnpm tsx tools/import/reverse.ts --batch boats-2026-11` | rollback drill: reverse-mapping deletion on staging restores pre-batch state | proposed |
| `pnpm tsx tools/scan-personal-data.ts packages/fixtures` | zero personal data in repo-committed fixtures | proposed |

Positive and negative pairs: the importer's refusal path is a feature — a fixture batch containing one record without `checked_at` must refuse that record and report it (deliberate-failure demonstration for this phase), while valid siblings import. The reverse-mapping drill is the phase's rollback proof and must show the staging byte-count returning to pre-batch state.

Negative tests that must stay red until fixed: a record with a future `checked_at`; a cross-destination write attempted by the importer; a personal-data pattern (phone or email) appearing in any repo-committed fixture outside the allowlisted, consented business-contact format; a batch apply attempted without an approval record.

## Acceptance gate

> [!GATE] Phase 09 passes only with linked evidence for every item. "It worked locally" is not evidence; field artifacts are.

- [ ] Owner-run export completed after backup confirmation; encrypted artifact never entered the repo; admin-vs-visible row-count manifest exists ([#59](https://github.com/luandro/cotiju-app/issues/59) lesson)
- [ ] Every imported record carries source, checked_at, correction contact and license; refusal report shows what was dropped and why
- [ ] No personal records, UGC photos, profiles or legacy phone numbers migrated; consent artifacts exist for re-collected content
- [ ] D-11 recorded with the user's decision; import batches referencing third-party datasets ran only after it
- [ ] Editorial routine demonstrably operating: at least one editor completes verify, correct and publish cycles unaided; freshness alerts wired and test-fired
- [ ] Field pilot completed on the device matrix; core journeys pass on low-end Android over 3G; offline legs pass with stale indicators
- [ ] Tenant A/B and anonymous-access regression suites green; honest-empty states verified on at least one unpopulated category
- [ ] 301 map covers every legacy PT route that will have an equivalent page
- [ ] Rollback drill: reverse-mapping deletion restored staging pre-batch state; export-before-import artifacts retained

**Blocks progression if:** licensing is undecided for content already staged; any personal data landed in staging without consent; tenancy or anonymous-access regressions appear; the editorial routine cannot run without developer help; the field pilot's blocking defects remain unfixed.

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Export reveals data is unusable (empty or wrong) | high | high | matrix-first workflow means empty tables are discovered early, not at import; re-collection path exists per record |
| Rights unclear for media or datasets | high | medium | D-11 before third-party batches; default is drop, not assume |
| Editors cannot sustain the routine (platform's real availability) | medium | high | SLAs sized to minutes per week; alerts make staleness visible; pilot measures actual cadence |
| Import tooling corrupts staging (duplicates, bad mapping) | medium | medium | idempotency on `legacy_id`, dry-run diffs, batch approval, reverse-mapping drill |
| Field logistics slip (weather, availability) | medium | low | journeys are checklist-driven; a partial matrix is honest evidence, an invented one is not |
| Scope creep into production promotion | medium | high | promotion is explicitly Phase 10 and human-approved; no code path exists here |
| Row-count manifest contradicts the matrix | medium | medium | stop at stage 1 of the pipeline; reconcile with the owner before any dry-run |
| Field-defect fix PRs destabilize Phase 08 widgets | medium | medium | fixes ride the same fast gate and exclusion assertions; widget owners review |

Sensitive operations requiring human approval: running the legacy export (owner); approving each import batch; deciding D-11; any contact with businesses for consent; publishing anything about pilot participants.

Budget impact: negligible infrastructure change (staging rides existing Workers Paid $5/mo, [backend research §1](../research/backend-stores-starters.md)); tile and API usage grows modestly with real content — watch the D-08 ceiling. Field-visit costs are human and out of scope for this budget.

Rollback: every batch is reversible via the reverse mapping; a full staging reset is a D1 Time Travel restore (in-place, 30-day window on paid plans) plus re-import from retained batch artifacts. Nothing in this phase affects legacy production, so the worst-case rollback boundary is staging-only.

Restart instructions for an agent picking this phase up mid-flight: read `AGENTS.md`, this page and [../prompts/phase-09-agent.md](../prompts/phase-09-agent.md); check the verification matrix for which batches are approved; never run `apply.ts` without a recorded approval; if the export artifact is missing or stale, stop and ask the owner — do not improvise data.

## Next phase handoff

Phase 10 (see [phase-10.html](phase-10.html)) receives:

- A staging destination with verified, rights-recorded content and an operating editorial routine — the release candidate's content set.
- The go/no-go readout with field-fix status and any deferred iOS verification.
- Freshness SLAs and their alerts, ready to be pointed at production once it exists.
- The 301 map and OG/QR assets, ready for the production web surface.
- Closed or explicitly-deferred decisions: D-11 recorded; D-12 confirmed done or explicitly accepted as open by the user.
- Explicit statement of what promotion requires: a human-approved production promotion checklist (defined in Phase 10), not an agent decision.

Records: import batch reports, consent artifacts and the pilot report are the evidence trail; [decisions.md](../decisions.md) gains the D-11 outcome and any new entries this phase forced.

### Handoff records checklist

1. Go/no-go readout with field-fix status, signed by the product owner.
2. Final verification matrix export (verdict per record, batch per verdict).
3. Import batch reports with approvals attached and reverse mappings retained.
4. Editorial SLA sheet as configured, with the first month of digest history.
5. Open-items list: deferred iOS checks, unresolved upstream choices, editor capacity notes.
