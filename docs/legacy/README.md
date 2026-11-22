# Legacy audit outputs (Phase 01)

- Audit date: 2026-11-22.
- Legacy repo: `luandro/cotiju-app` (private, read-only access).
- Baseline commit: `c0c99077593a870ba4295798f0471a66288a6c4c`
  ("fix: QA follow-ups ... (#52)", 2026-11-21).
- Task 01-1 refresh delta: **no change**. The read-only clone was re-verified
  at HEAD `c0c99077593a870ba4295798f0471a66288a6c4c` on 2026-11-22, the same
  commit the planning audit inspected, so every finding in
  [legacy-cotiju-audit.md](../../planning/research/legacy-cotiju-audit.md)
  still describes the audited tree. No commits, issues or PRs were written on
  the legacy repo during this phase.
- No personal data, no media and no secret values were copied out of the
  legacy repo. Only file:line references, table names and aggregate facts.

## File index

| File | Phase 01 task | What it holds |
|---|---|---|
| [extraction-matrix.md](extraction-matrix.md) | 01-2 / 01-3 | One verdict row per legacy table (23), storage bucket (3) and static data file; backup-gate line; owner-export row counts (pending) |
| [rights-matrix.md](rights-matrix.md) | 01-3 / 01-11 | Licence status per content and media asset; owner keep/ask/drop ruling (deferred by owner 2026-11-22, to before Phase 09) — the D-11 input |
| [scenario-port-list.md](scenario-port-list.md) | 01-4 / 01-5 | Business rules as Given/When/Then scenarios with file:line sources, and the test port list for phases 05 and 08 |
| [privacy-classification.md](privacy-classification.md) | 01-8 | Personal-data classes, LGPD basis, default not-migrated list; consent re-collection deferred to Phase 09 |
| [migration-plan.md](migration-plan.md) | 01-9 | Phase 09 draft: what may import, ID/URL mapping, rollback, the not-before-Phase-09 rule |
| [../runbooks/legacy-export.md](../runbooks/legacy-export.md) | 01-6 | The owner-run read-only export runbook (backup gate first). It supersedes the Phase 00 stub at the same path; the phase file's proposed `docs/legacy/export-runbook.md` path is not used |
| `packages/fixtures/{cotijuba,serra}/` (repo root) | 01-7 | Synthetic fixture datasets; see the shared fixture contract |

## Verdict vocabulary (fixed)

Exactly one verdict per matrix row; defined by
[phase-01.md](../../planning/src/phases/phase-01.md):

```text
concept   design knowledge only; nothing copied
code      legacy source adapted with attribution into guia.la (rare)
data      real content may migrate in Phase 09, pending rights + freshness
fixture   becomes synthetic test data now (shapes real, values fake)
reject    neither ported nor migrated; reason recorded
```

Where each asset class is recorded: tables, buckets and static data files
carry verdicts in the extraction matrix; business rules and test scenarios
carry `concept` verdicts (port as scenarios, never code) in the scenario port
list; the legacy route map carries its `concept` treatment in the migration
plan; third-party API and dataset rights live in the rights matrix.

## D-12 advisory (owner action)

Legacy `VITE_WORLDTIDES_API_KEY` and `VITE_STORMGLASS_API_KEY` are read from
the client environment and sent to the browser in the public JS bundle
(`src/services/tideService.ts:60` reads the key; the build workflow injects
it; see [legacy audit §8](../../planning/research/legacy-cotiju-audit.md)).
These keys must be treated as public and rotated at their providers.

- Status: **deferred by owner (2026-11-22)** — key rotation remains owner
  action, pending until the owner schedules it (decision D-12, approval-list
  item 2; tracked as tsk #297). Deferral changes nothing about the exposure:
  the keys are public and must still be rotated at their providers.
- No agent action is authorized or performed: agents do not create, rotate,
  view or transmit these keys, and this repo never writes key values
  anywhere.
