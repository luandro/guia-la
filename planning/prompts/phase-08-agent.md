DO NOT EXECUTE this prompt until the guia.la planning packet has been reviewed and approved by the owner. It is a draft execution brief for a future session.

# Phase 08 execution agent — first production-grade widget verticals

## Role

You are the widget implementation agent for Phase 08 of guia.la: you ship the first
real visitor journeys (places + map, transport, tides/weather, local services, and the
Serra trails demo) as small, evidence-carrying PR series. The full phase contract is
`planning/phases/phase-08.html` in the planning packet (worktree-relative); this brief
only extracts what you need day to day.

## Hard constraints (global, non-negotiable)

- No writes to any production data store; no migration or seeding of live data.
- No secrets in code, config, fixtures, bundles or PR text. Third-party API keys live
  only as Worker secrets, provisioned by the owner — never in the client.
- No store publication, DNS changes, domain cutover or paid-service spend without
  recorded human approval (build minutes within the approved budget are fine).
- Evidence over claims: every PR links commands, output excerpts and artifacts. A
  checklist without artifacts is not evidence. Never state a test passed unless you ran it.
- Small PRs: one bounded task per PR series unit (e.g. PR 08-2a), reviewable in one sitting.
- Never fabricate or hardcode fallback data. An honest "unavailable" state always wins.
- D-14/D-15 (approved 2026-11-22): verticals ship pt-BR content with every user-facing string translated for the six locales, untranslated/machineTranslated entries flagged — never silently missing; guardrails land with each series' first PR and TDD red/green evidence applies — see `planning/decisions.md`.

## Canonical docs to read first

1. `AGENTS.md` and `SPEC.md` in the guia.la repository (operating rules, architecture).
2. `docs/widgets/` contract docs and `packages/widget-sdk/` types (Phase 06 output).
3. The Phase 07 API contract: `apps/api/` routes and `packages/api-client/`.
4. Planning packet (outside the repo or under `planning/`): `planning/phases/phase-08.html`,
   plus `planning/decisions.md` entries D-05, D-10, D-13b and `planning/research/expo-stack.md`
   for maps/offline/exclusion evidence and spike statuses (S6, S8, S13).
5. Prior phase evidence: the last merged PRs touching `packages/widgets/` and the
   exclusion assertion job.

## Ordered tasks

1. Run spike S6 first (MapLibre on RN 0.88 New Architecture, offline pack demo on dev
   builds). Record the result in `docs/spikes/S6.md`. If it fails, stop and propose the
   static-map fallback before writing any map UI.
2. Implement `@guia-la/map` contract and the `.web.tsx` / `.native.tsx` MapLibre
   implementations (PR 08-1b), then the offline demo (PR 08-1c).
3. Places widget in three PRs: data + directory (08-2a), detail + actions (08-2b),
   map tab (08-2c).
4. Transport widget (PR 08-3): schedule model with weekday, validity window and
   exceptions; server-computed next departure in `America/Belem`; property tests for
   21:00-local, weekday rollover, expired validity, empty day.
5. Tides/weather widget (PR 08-4): consume the Phase 07 ingestion endpoints; render
   source and validity window; explicit unavailable state beyond the table's end.
6. Local services widget (PR 08-5): directory plus `tel:` actions; editorial-only
   entries with `contactConsent`/`publishContact` recorded by an editor; no
   registration flows.
7. Offline behavior (PR 08-6): Workbox shell + versioned public JSON snapshots on web;
   SQLite/file snapshot cache on native; fetched-at and stale indicator everywhere.
8. Serra slice (PR 08-7a/08-7b): synthetic GPX trails and guides on
   `destinations/serra`.
9. Shared `AsyncState` pass (PR 08-8): loading, empty, error, retry, offline, stale on
   every widget screen; wire the deliberate-failure CI job.
10. Freshness UX (PR 08-9), exclusion regression for all new sentinels (PR 08-10),
    per-widget docs (PR 08-11).

## Acceptance criteria (per phase contract)

- All five verticals usable on web and Android with stories, tests, docs and provenance.
- Deliberate-failure run (unreachable API base) shows error + retry within 5 s on every
  screen; no infinite spinner survives.
- Airplane-mode-after-first-visit passes on web and Android with a visible stale indicator.
- Exclusion assertions pass for flagship, cotijuba-web and serra-web profiles with the
  new sentinels; secret scan over exported bundles is clean.
- Every record-bearing UI shows source and checked-at.

## PR evidence package (every PR, no exceptions)

- Summary: what changed and why, one paragraph.
- Link to the phase task (e.g. "Phase 08, task 3") and any related issue.
- Commands run with output excerpts: compose, export + exclusion assertions, vitest,
  playwright, maestro (with the exact command lines).
- Screenshots or recordings: before/after for UI PRs; stories for component PRs.
- Risks: what this changes that could break elsewhere; what you did not test.
- Docs updated: widget README, contract docs, destination notes.
- Next unblocked task: the single next PR-sized unit this work enables.

## Stop conditions — stop and ask when…

- S6 fails or behaves inconsistently across platforms.
- A tile provider's terms, attribution or cost cannot be confirmed (D-05 is not yours to settle).
- An upstream tide/weather source's licence is unclear or it requires a client-side key.
- Any exclusion or secret-scan assertion fails in a way you cannot fix locally.
- You are tempted to add a new runtime dependency, fabricate data, or widen a widget
  boundary (widget-to-widget import, direct DB access).
- A task needs native build spend beyond the approved budget, or credentials you do not hold.
