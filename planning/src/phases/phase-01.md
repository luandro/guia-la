---
id: 01
title: Legacy extraction and preservation audit
short: Produce a read-only, source-linked inventory of everything in luandro/cotiju-app worth keeping — entities, data, media, business rules, tests — with a rights and privacy verdict per item.
tag: Learn
status: draft
complexity: Medium (privacy)
depends: 00
inspect: The extraction matrix, sanitized fixtures, owner-run export runbook and the migration-plan draft inside the guia-la repo docs
exit: Every legacy entity and asset class has a recorded verdict (concept, code, data, fixture, reject); owner has confirmed a backup before any export; no write ever touched the legacy repo or database
---

Phase 01 is a **read-only audit plus sanitized extraction** of the legacy
Cotiju application. It does not migrate anything, does not fix the legacy app,
and does not import real content into guia.la — real-data import is Phase 09,
and only for items this phase has cleared.

The planning pass already produced a first audit
([research/legacy-cotiju-audit.md](../research/legacy-cotiju-audit.md),
baseline commit `c0c9907`, 2026-11-21). This phase deepens it into per-item
verdicts, obtains real row counts through an owner-run export, and turns
reusable knowledge into synthetic fixtures and test scenarios for phases
02–08.

> [!RISK] The single worst outcome of this phase is a privacy leak into the
> new repository: a phone number, profile row or user photo copied "because it
> was useful". Default verdict for anything personal is **do not migrate**
> ([review §6](../review.md)); re-collection with consent happens in Phase 09.

## Phase identity

- **Number:** 01 — second phase; runs after [00](phase-00.html) and may run
  in parallel with the [02](phase-02.html) spike.
- **Objective:** classify every legacy entity, data source, media asset,
  business rule and test scenario into concept / code / data / fixture /
  reject, with provenance, freshness and rights recorded; obtain an owner-run
  read-only data export; ship synthetic fixtures guia.la can legally use.
- **Prerequisites:** Phase 00's approval list and evidence template; confirmed
  read-only access to `luandro/cotiju-app`; owner awareness of D-12 (leaked
  keys in legacy bundles).
- **Dependencies:** 00.
- **Expected contributors:**

| Role | Human or agent | Responsibility |
|---|---|---|
| Data owner (product owner) | Human | Confirms backup exists before export; runs the export personally; rules on rights and licensing (D-11 input) |
| Audit agent | Agent | Read-only repository analysis, matrix rows, scenario extraction, fixture generation |
| Orchestrator agent | Agent | Reviews every matrix row for privacy leakage before merge; owns the verdict vocabulary |
| Junior implementation agent | Agent | Mechanical reformatting, link-checking of matrix rows — never verdicts |

- **Complexity/risks:** Medium; risk note **privacy**. The codebase is small
  enough to read; the danger is data handling and unverified rights, not
  volume.

## Why this stage exists

The master plan ([§02 legacy lessons](../../docs/guia-la-master-plan.html))
makes extraction a dedicated early phase because the legacy app mixes three
things that must be separated before guia.la's schema exists: genuine domain
knowledge (boat schedules with validity periods, tide data with sources,
place coordinates), disposable accidental complexity (a 4,681-line baseline
migration, 146 RLS policies, 59 SQL functions — [legacy audit §4](../research/legacy-cotiju-audit.md)),
and unowned liabilities (2025-only tide fallback data, user photos with no
consent record, API keys bundled into public JavaScript).

Designing Phase 07's schema without this audit would repeat PR #39 — the
legacy repo's closed, unmerged D1 migration that ported all 24 tables and
ballooned to +99k lines before being abandoned ([legacy audit, PR 39](../research/legacy-cotiju-audit.md)).
The audit is the countermeasure: minimum viable v2 models justified row by
row.

It is also where guia.la's trust model starts. Legacy issues #62, #64 and #70
([legacy audit §8-9](../research/legacy-cotiju-audit.md)) all reduce to "data
without provenance or freshness is worse than no data". The extraction matrix
introduces the columns — source, verified date, rights — that Phase 07's
schema and Phase 09's editorial workflow inherit.

## Inputs and source references

- Starting inventory (do not re-derive): [research/legacy-cotiju-audit.md](../research/legacy-cotiju-audit.md).
- Legacy repository `luandro/cotiju-app` (private; read-only). Key paths from
  the audit, re-verified at whatever HEAD is current during execution:

| Legacy path | What it holds | Why it matters here |
|---|---|---|
| `supabase/migrations/20251226131827_baseline.sql` | 4,681-line squashed schema, 23 tables, 146 policies | Entity inventory source; do not port |
| `supabase/archive/`, `supabase/backup/` | 147 older SQL files | History of intent; skim only |
| `src/services/` (22 files) | One service per domain; tide/weather fallbacks | Business rules to extract as scenarios |
| `src/data/locations.ts`, `src/data/beachLocations.ts` | Static place coordinates | Data candidates with unknown rights |
| `public/data/cotijuba-tides-2025.json` | OCA-attributed tide table, MSL datum | Provenance case study; 2025-only |
| `scripts/parseTidePdf.py` | Tide PDF parser | Possible code reuse candidate |
| `supabase/storage` buckets `user-photos`, `place-suggestions`, `ownership-documents` | User media and documents | Default: not migratable (rights/consent) |
| `src/tests/` (~234 Vitest), `tests/` (~136 Playwright) | Existing suites, 455 hidden tsc errors | Port scenarios, not test code ([review R15](../review.md)) |
| `src/App.tsx` route table | PT routes with EN redirects | Legacy-URL map for Phase 10 redirects |

- Legacy issues that define the scenario list: [#59](https://github.com/luandro/cotiju-app/issues/59)
  (public data missing), [#60](https://github.com/luandro/cotiju-app/issues/60)
  (infinite spinner), [#62](https://github.com/luandro/cotiju-app/issues/62)
  (tides), [#63](https://github.com/luandro/cotiju-app/issues/63) (incident),
  [#64](https://github.com/luandro/cotiju-app/issues/64) (next-boat logic),
  [#65](https://github.com/luandro/cotiju-app/issues/65) (cache privacy),
  [#66](https://github.com/luandro/cotiju-app/issues/66) (offline gating),
  and [PR #52](https://github.com/luandro/cotiju-app/pull/52) (last merged QA
  pass, source of the anon-read row-count facts).
- **Known unknowns:** real row counts with service-role access (only
  anon-visible zero-row facts are known — [legacy audit §8](../research/legacy-cotiju-audit.md));
  which host/commit serves production; licensing of OCA tide data, WorldTides,
  StormGlass, HG Brasil and OSM tiles; whether Supabase Realtime publications
  match the migrations. Each gets a matrix row marked unknown.
- **Credentials/tools needed:** read-only GitHub access to the private repo
  (`gh` auth, read scope). **Agents never hold the Supabase service key**;
  the owner runs any authenticated export personally. Encrypted storage
  outside any repository for export output — path chosen by the owner, never
  committed.

## Task breakdown

| # | Task and goal | Owner | PR unit | Depends on |
|---|---|---|---|---|
| 1 | Refresh the audit at current HEAD: shallow clone, diff against the `c0c9907` baseline findings, record deltas (issues may have moved since 2026-11-21) | Agent | PR 01-1 | Phase 00 |
| 2 | Backup gate: owner confirms an existing Supabase backup/point-in-time snapshot and records confirmation; nothing exports before this | Human | recorded in matrix header | PR 01-1 |
| 3 | Entity inventory matrix: one row per table (23), bucket and static file — columns for personal-data flag, anon-visible state, verdict, target phase | Agent | PR 01-2 | 01-1 |
| 4 | Content and media rights matrix: photos, coordinates, i18n JSON, tide dataset — licence status, attribution needs, D-11 input | Agent + human ruling | PR 01-3 | 01-2 |
| 5 | Business-rule scenario extraction: next-boat weekday/validity logic (#64), tide date-keying after 21:00 local (#62), offline gating (#66), cold-load with backend down (#60) — written as plain-language test scenarios with file:line sources | Agent | PR 01-4 | 01-1 |
| 6 | Test port list: which Vitest/Playwright scenarios become guia.la tests in phases 05/08, with links; port scenarios, never code ([review R15](../review.md)) | Agent | PR 01-5 | 01-4 |
| 7 | Owner-run export runbook: exact read-only SQL export commands the owner executes; output lands encrypted outside repos; row counts recorded back into the matrix | Agent writes runbook, human executes | PR 01-6 | 01-2, 01-3 |
| 8 | Sanitized fixtures: synthetic places/boats/tides datasets for Cotijuba-shaped and Serra-demo-shaped data, committed under `packages/fixtures/{cotijuba,serra}/` for phases 02–08 | Agent | PR 01-7 | 01-3 |
| 9 | Privacy and LGPD classification: profiles, phones, user photos, ownership documents → default not-migrated list; consent re-collection deferred to Phase 09 | Agent + human ruling | PR 01-8 | 01-3 |
| 10 | Migration-plan draft for Phase 09: what may import, ID/URL mapping approach, rollback, and the explicit "not before Phase 09" rule | Agent | PR 01-9 | 01-7, 01-8 |
| 11 | D-12 advisory to the owner: rotate the WorldTides/StormGlass keys bundled in legacy public JS; no agent action authorized | Human | outside this repo | PR 01-3 |

Splitting rule: the matrix (01-2/01-3) merges early even with unknowns
recorded as unknown — waiting for perfect knowledge is how PR #39-style
big-bangs happen.

## Architecture choices and guardrails

- **Location of outputs (proposed, in the guia-la repo):**
  `docs/legacy/extraction-matrix.md`, `docs/legacy/rights-matrix.md`,
  `docs/legacy/scenario-port-list.md`, `docs/legacy/export-runbook.md`,
  `docs/legacy/migration-plan.md`, and fixtures under
  `packages/fixtures/cotijuba/` and `packages/fixtures/serra/`
  (consumed by [Phase 02](phase-02.html)).
- **Verdict vocabulary (fixed; exactly one per row):**

```text
concept   design knowledge only; nothing copied
code      legacy source adapted with attribution into guia.la (rare)
data      real content may migrate in Phase 09, pending rights + freshness
fixture   becomes synthetic test data now (shapes real, values fake)
reject    neither ported nor migrated; reason recorded
```

- **Fixture shape contract (illustrative):**

```ts
// illustrative — final types land in packages/core in Phase 02
type FixturePlace = {
  id: string;            // synthetic, e.g. "fx-cotijuba-001"
  slug: string;
  name: string;          // invented or public-knowledge names only
  category: "beach" | "restaurant" | "stay" | "waterfall" | "trail";
  location: { lat: number; lng: number };  // plausible, not exact personal data
  source: "synthetic";   // fixtures are never real rows
};
```

- **Forbidden:** any write to `luandro/cotiju-app` (issues/comments included,
  beyond what the owner posts); agents holding or transmitting the Supabase
  service key or legacy `.env` values; copying personal data or user media
  into any repo or chat; running the legacy app against production; publishing
  export contents; porting the 24-table PR #39 schema wholesale
  ([review §6](../review.md)).
- **Security/privacy implications:** the export contains personal data by
  construction (profiles, phones). It stays in owner-controlled encrypted
  storage; the only values that enter the guia-la repo are aggregate counts
  and explicitly public fields. Fixtures pass an automated privacy scan
  (below) before merge.
- **Acceptable alternatives:** skip the audit and design schema fresh
  (rejected — loses verified domain rules and the URL map); full data
  migration now (rejected — rights unknown, and Phase 09 exists for this);
  using legacy test code directly (rejected — it encodes 455 type errors'
  worth of drift; scenarios port instead).

## Deliverables

- [ ] `docs/legacy/extraction-matrix.md` — every table, bucket and static data file has a verdict row (PR 01-2/01-3)
- [ ] `docs/legacy/rights-matrix.md` — per-asset licence status with unknowns marked unknown (PR 01-3)
- [ ] `docs/legacy/scenario-port-list.md` — business rules and test scenarios with file:line citations (PR 01-4/01-5)
- [ ] `docs/legacy/export-runbook.md` — owner-executed, read-only, with the backup gate as step one (PR 01-6)
- [ ] Owner-run export completed (or explicitly deferred with reason) and row counts recorded in the matrix
- [ ] `packages/fixtures/cotijuba/` and `packages/fixtures/serra/` synthetic datasets for Cotijuba-shaped and Serra-demo-shaped content (PR 01-7)
- [ ] `docs/legacy/migration-plan.md` draft gating Phase 09 (PR 01-9)
- [ ] Privacy classification list: personal data default not-migrated (PR 01-8)
- [ ] D-12 advisory delivered to the owner, response recorded (or marked pending)

## Visual and functional QA

No UI is produced. The inspectable surfaces are the matrix documents and the
fixtures as data files.

- **Human journey:** open `extraction-matrix.md`, pick three random rows, and
  for each click through to the cited legacy file:line or issue — every
  verdict must be traceable. Open the rights matrix and mark each row
  keep/ask/drop as the rights ruling (this is the D-11 input). Confirm the
  backup confirmation line exists and predates any export artifact.
- **Agent journey:** from the matrix alone, generate one fixture set and
  answer: which verdicts did you use, and what did you refuse to copy? The
  refusal list must match the privacy classification.
- **Spot-check journey:** trace one real concept end to end — boat schedule
  validity (#64) → scenario text → planned test location in Phase 08 — and
  confirm nothing in the chain invents legacy behavior.
- **Platform matrix:** not applicable (documents and JSON only).
- **Error states:** audit refresh finds the repo has moved materially →
  re-baseline the matrix against new HEAD and note deltas rather than
  silently mixing commits; export returns errors or zero rows → stop, record,
  escalate to owner — never retry with elevated credentials.

## Automated verification

```bash
# validated — this exact method was used by the planning research pass
# ([legacy audit header](../research/legacy-cotiju-audit.md)); re-run at current HEAD
git clone --depth 1 https://github.com/luandro/cotiju-app /tmp/cotiju-readonly
gh issue view 63 --repo luandro/cotiju-app
gh pr view 52 --repo luandro/cotiju-app
```

```bash
# proposed — fixture privacy scan: expects no output.
# Brazilian mobile pattern and generic emails; extend as false positives surface.
grep -RE '(\+55|559[0-9]{8}|55 9[0-9]{2} [0-9]{4}-[0-9]{4}|@gmail|@outlook|@hotmail)' \
  packages/fixtures/ && { echo "personal data in fixtures"; exit 1; }
```

```bash
# proposed — matrix completeness lint: each of the 23 legacy table names
# must appear as a row carrying a verdict; a table absent from the matrix
# fails the lint, not just a malformed row. Expected: no output.
for t in places beach_locations boat_schedules tide_data weather_data \
         moto_taxi_drivers events profiles user_photos business_photos \
         location_reviews place_reviews review_comments photo_likes \
         place_suggestions place_edit_suggestions owner_requests admin_users \
         admin_audit_log audit_log business_edit_audit rate_limits event_updates; do
  grep -E "^\| $t \|" docs/legacy/extraction-matrix.md \
    | grep -qE '\| (concept|code|data|fixture|reject) \|' \
    || { echo "$t: row missing or lacks a verdict"; exit 1; }
done
```

- **Deliberate-failure demonstration (proposed):** temporarily add a fixture
  record containing a realistic fake phone number, run the privacy scan,
  confirm it fails with the file and line named, then remove the record and
  confirm the scan passes. The scan's failure mode must be observed once, or
  it cannot be trusted.
- **Negative test (fact reported by legacy PR #52, not re-run in planning):**
  anon-visible reads of `boat_schedules` and `beach_locations` returned 0
  rows per PR #52 at the planning baseline
  ([legacy audit §8](../research/legacy-cotiju-audit.md)).
  The owner-run export's service-role counts are expected to differ; the
  delta between the two is itself a recorded output, not an error.

## Acceptance gate

> [!GATE] Phase 01 passes when every legacy item has a traceable verdict,
> fixtures contain no personal data, and the owner has personally confirmed
> the backup and (if run) executed the export. Nothing in this phase wrote to
> the legacy repo or database — that is a gate condition, not a hope.

- [ ] All 23 tables, 3 storage buckets and static data files have verdict rows; none blank
- [ ] Every verdict row links to its source (file:line, issue, or runbook output)
- [ ] Backup confirmation recorded **before** any export timestamp; export (if run) executed by the owner only
- [ ] Privacy scan passes on committed fixtures; its deliberate-failure demo is evidenced in a PR
- [ ] Rights matrix delivered with unknowns explicitly marked unknown — no invented licences
- [ ] Migration-plan draft states its Phase 09 gate; no real content imported anywhere
- [ ] Zero writes to `luandro/cotiju-app` (PR history and issue history show none from agents)

**Blocks progression if:** fixtures leak personal data (blocks Phase 02's
walking skeleton until regenerated); the backup gate is unconfirmed (blocks
the export and therefore real row counts); rights are recorded as known when
they are not (blocks D-11 and Phase 09 planning).

## Risks, rollback and handoff

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Personal data leaks into fixtures or docs | Medium | High | Privacy scan in CI-shaped check, deliberate-failure demo, orchestrator reviews every matrix PR |
| Media/data rights are assumed instead of verified | High | Medium-High | Rights matrix defaults to unknown; human ruling required to upgrade; D-11 stays open |
| Audit goes stale (legacy repo moves) | Medium | Low | Task 01-1 re-baselines; deltas recorded, never silently merged |
| Owner unavailable for export/backup steps | Medium | High | Everything except real counts proceeds with anon-visible facts; export is explicitly deferrable |
| Scope creep into executing migration | Medium | High | Hard rule: migration happens in Phase 09; this phase's PRs touching real data are rejected |
| Legacy secrets exposure during handling | Low | High | Agents never touch service keys; any legacy `.env` treated as compromised ([review R5](../review.md)) |

- **Sensitive operations needing human approval:** the export run (owner
  executes); any rights ruling; any exception to the not-migrated defaults;
  contacting legacy users for consent (Phase 09, not here).
- **Budget impact:** none. GitHub read access and local tooling only.
- **Rollback:** all outputs are docs and fixtures in the guia-la repo —
  revert PRs. The owner-held export can be deleted by the owner; its absence
  does not break anything already merged (counts are recorded copies).
- **Restart instructions for an agent picking up mid-phase:** read this page
  and the [agent prompt](../prompts/phase-01-agent.md); open
  `docs/legacy/extraction-matrix.md` and find the last completed row group;
  check merged `PR 01-*` units; re-run the audit-refresh delta check if the
  clone is older than the current task; resume the lowest unfinished task.
  If the backup confirmation is missing, stop at the backup gate (task 2,
  recorded in the matrix header) — do not proceed to export-adjacent work.

## Next phase handoff

- To [Phase 02](phase-02.html): `packages/fixtures/{cotijuba,serra}/` datasets (the
  walking skeleton consumes them; if 01 lags, 02 boots with a minimal
  built-in seed and swaps later), plus the Place-shape verdicts that inform
  `packages/core` types.
- To Phase 05/08: `scenario-port-list.md` — each scenario names its target
  suite (tide timezone tests, boat validity tests, offline cold-load,
  cache-privacy A/B) so those phases implement tests, not archaeology.
- To Phase 07: minimum-viable entity list (the non-reject rows) and the
  provenance/freshness column definitions the schema must carry
  ([review R1](../review.md)).
- To Phase 09: `migration-plan.md` with rights-cleared candidates, ID/URL
  mapping approach and rollback; everything else stays not-migrated.
- To the owner: D-12 key-rotation advisory; D-11 licensing decision request
  with the rights matrix as input.
- Open items handed forward explicitly, never silently: real row counts (if
  export deferred), production host/commit identity, OCA tide licence.
