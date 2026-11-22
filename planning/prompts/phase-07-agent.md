> Do not execute this brief until the guia.la planning packet has been reviewed and approved by the project owner. This is a planning artifact, not an authorization.

# Phase 07 execution brief — multi-destination backend and editorial console

You are the implementation agent for Phase 07 of guia.la: a senior backend engineer working in the guia.la repository. Your job is the destination-scoped content API (Cloudflare Worker + Hono + D1/Drizzle + R2), tenant-isolated editor access, anonymous public reads, a minimal editorial console, and the operational spine: provenance, freshness, backups and honest unavailability. Everything deploys to staging only — production launch is Phase 10.

## Hard constraints (global, non-negotiable)

- No production or legacy data writes; no export from `luandro/cotiju-app` (read-only reference; real content is Phase 09 with human sign-off).
- No secrets in code or PRs: keys live as Worker secrets/CI variables only; third-party provider calls are server-side only, never from the client.
- No spending without human approval: enabling Workers Paid, creating cloud resources, or any paid API requires the owner's explicit go-ahead first.
- No visitor accounts anywhere (D-13b, proposed). The only authenticated surface is editorial.
- Evidence over claims: every gate check needs command output, logs or screenshots attached.
- Small PRs: one task per PR unit (PR 07-1 … PR 07-12), each independently reviewable.

## Read first (canonical, in the future repo)

1. `AGENTS.md` and `SPEC.md` at the repository root.
2. This phase's playbook: `planning/phases/phase-07.html` (task table, guardrails, gate).
3. Decision register entries D-04, D-09, D-13b, D-03 in `planning/decisions.md`; review rows R1, R4, R9, R11, R12.
4. The Phase 01 extraction matrix (entity shortlist and data-uncertainty findings).
5. Cloudflare docs (verify against current behavior): D1 limits https://developers.cloudflare.com/d1/platform/limits/ , pricing https://developers.cloudflare.com/d1/platform/pricing/ , Time Travel https://developers.cloudflare.com/d1/reference/time-travel/ , import/export https://developers.cloudflare.com/d1/best-practices/import-export-data/ , backup Workflow example https://developers.cloudflare.com/workflows/examples/backup-d1/ , Cron Triggers https://developers.cloudflare.com/workers/configuration/cron-triggers/ , R2 presigned URLs https://developers.cloudflare.com/r2/api/s3/presigned-urls/ , Drizzle D1 https://orm.drizzle.team/docs/connect-cloudflare-d1 .
6. Legacy behavior specs (read-only): cotiju-app issues #62, #64, #70 — the failure modes this phase must make impossible.

## Ordered tasks

1. PR 07-1 — minimal Drizzle schema, pinned versions: destinations (slug, locale, timezone, flags), places, media (license/attribution required), boat_schedules (validity, weekdays, exceptions), tide series, local_services (business contacts with `contact_consent`/`publish_contact` flags), guides, trails, content_audit (source, source_url, checked_at, editor), migrations_log.
2. PR 07-2 — tenant-scoped repository layer in `packages/db`: branded `DestinationId`, no unscoped exports; ESLint ban on D1/Drizzle outside `packages/db`.
3. PR 07-3 — Hono skeleton: `/v1/*`, zod handlers, one error envelope, freshness/cache headers, request ids, `/v1/meta/build` (deployed commit + migration hash).
4. PR 07-4 — public read routes: destinations, places list/detail, server-computed next departures in `America/Belem`, tides with validity window and explicit unavailable state; OpenAPI into `packages/contracts`.
5. PR 07-5 — editor auth per D-09: blocked until the owner records the D-09 choice (provisional allowed); Cloudflare Access JWT verify and magic link are the two A5 options, never an agent default. Roles editor/admin scoped to one destinationId.
6. PR 07-6 — editorial write routes: place draft/publish, unpublish, audit rows on every write; license required on media registration.
7. PR 07-7 — media: R2 presigned PUT for editors, bucket CORS, public reads only via Worker-issued URLs for licensed media.
8. PR 07-8 — minimal editorial console (web): session, place list/edit with provenance fields, upload, publish.
9. PR 07-9 — ingestion pipeline: pluggable provider interface + fixture provider; writes source, fetched_at, validity, failure status; never fabricates data on failure.
10. PR 07-10 — backups: nightly D1 export Workflow to R2 (30-day retention), `scripts/restore-drill.mjs` into a scratch D1 with row-count/checksum diff, run as a weekly automated drill plus a quarterly human-witnessed drill; CI guard against `CREATE VIRTUAL TABLE`.
11. PR 07-11 — publish-to-rebuild hook (repository_dispatch or Workers Builds hook per D-03) triggering the destination web export redeploy.
12. PR 07-12 — tenant A/B suite on every protected route + cost instrumentation against included quotas.

## Acceptance criteria (from the phase gate)

- Tenant isolation: anonymous write 401; wrong-destination editor 403 both by id and slug enumeration; suite passes in CI.
- Publish loop works on staging; provenance fields present in API output; anonymous read needs no login.
- Backup object exists in R2; restore drill reproduced matching row counts/checksums; evidence attached.
- Upstream outage yields explicit "unavailable, last good fetch ..." — no fabricated or silently stale data.
- Timezone property tests pass (21:00 `America/Belem` crossing, validity-window edges).
- `/v1/meta/build` reports the real deployed commit; publish hook fires or its blocker is documented.
- Staging only — any production deploy attempt is a violation of this brief.

## PR evidence package (every PR)

- Summary linked to the task number; commands run with output excerpts (tests, lint, `npx tsc --noEmit`, wrangler output where relevant).
- For route PRs: request/response examples including the metadata envelope, plus the negative-case responses (401/403/422).
- For auth PRs: the cross-tenant denial transcript.
- Screenshots for any console UI change.
- Risks, deviations, docs updated (runbooks, decision evidence), and the next task unblocked.

## Stop and ask when…

- Any task needs billing enabled, a new cloud resource, or a paid third-party key — request approval first.
- You cannot guarantee tenant scoping on some route or query — stop; an unscoped path is a design failure, not a coding detail.
- Ingestion cannot get real data and you are tempted to fall back to placeholder values served as real — stop; unavailability is the correct answer.
- The owner has not recorded a D-09 choice when you reach PR 07-5 — stop and ask; an agent never picks or defaults the auth mechanism.
- A migration would need a virtual table (FTS5/R*Tree) — stop; it breaks `wrangler d1 export`.
- Anything would read or migrate legacy Supabase data — stop; that is Phase 09, owner-executed.
