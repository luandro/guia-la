# Scenario port list — business rules and tests

- Baseline commit: `c0c99077593a870ba4295798f0471a66288a6c4c` (2026-11-21);
  written 2026-11-22. File paths are relative to the legacy repo root.
- Rule: **port scenarios, never code** ([review R15](../../planning/review.md)).
  Every entry below is plain-language behavior with its legacy file:line
  evidence. Nothing here licenses copying legacy test code, which encodes
  455 hidden type errors' worth of drift.
- Verdict for both asset classes below: `concept` (design knowledge only,
  nothing copied) — recorded here because the
  [extraction matrix](extraction-matrix.md) lists only tables, buckets and
  static files.

## Business rules as scenarios (task 01-4)

### S1. Next boat respects weekday and validity window (#64)

Legacy defect: `getNextBoat` runs on the device clock, filters only
`is_active` and `days_of_week` in its query, and when no boat remains today
it returns `schedules[0]` labelled "tomorrow" regardless of weekday or
validity (`src/services/boatScheduleService.ts:58-94`, device clock at :73,
`schedules[0]` at :88, query filters at :41-48). The correct check
`isValidForToday()` — validity window plus weekday, at
`src/services/boatScheduleService.ts:290-309` — exists but has no call site
in `src/` at the baseline commit.

- Given boat schedules that each carry a route, departure time,
  `days_of_week`, `valid_from`, `valid_until` and `is_active`;
- When the visitor asks for the next departure and today is outside a
  schedule's validity window, or is not one of its weekdays, or the last
  departure of the day has passed;
- Then the next-boat answer is computed in the destination's timezone
  (`America/Belem`), skips schedules invalid for that local calendar day,
  and "next boat tomorrow" means the first departure of the next *valid*
  day — never a blind `schedules[0]`.
- Target: Phase 05 unit suite — pure function plus table-driven tests
  (weekday boundaries, validity edges, timezone).
- Issue: https://github.com/luandro/cotiju-app/issues/64

### S2. Tide date-keying is local-calendar, and gaps are explicit (#62)

Legacy defect: fallback tides are keyed by
`date.toISOString().split('T')[0]`, a UTC date
(`src/services/fallbackTideService.ts:52-59`, keying at :54). In UTC-3, any
request after 21:00 local silently rolls to the next day's tides. A date
outside the 2025-only dataset (`/data/cotijuba-tides-2025.json`, fetched at
:37) returns an empty array as success (:57-59) while `lastUpdated` is
stamped fresh (`:111`). The live chain tries WorldTides, then StormGlass,
then this fallback, then mocks (`src/services/tideService.ts:204-246`).

- Given tide data with a provenance source, datum and validity window;
- When the local time in `America/Belem` is after 21:00, or the requested
  date crosses a year boundary, or falls outside the dataset's window;
- Then "today" means the local calendar date, and out-of-window dates
  surface an explicit "unavailable" state with the window shown — never an
  empty result presented as fresh success.
- Target: Phase 05 unit suite — timezone rollover, year rollover,
  out-of-window honesty.
- Issue: https://github.com/luandro/cotiju-app/issues/62

### S3. Offline never gates content that is already local (#66)

Legacy defect: home category buttons refuse to navigate when
`navigator.onLine` is false, even though map data is cached locally
(`src/components/dashboard/HomeButtons.tsx:21-28`).

- Given a public screen whose content is available in the local cache;
- When `navigator.onLine` is false (which says nothing about backend
  health);
- Then navigation to that content proceeds from cache; offline state is
  communicated honestly per screen, and only genuinely remote-only actions
  are blocked with a retry.
- Target: Phase 08 — offline states of the widget verticals.
- Issue: https://github.com/luandro/cotiju-app/issues/66

### S4. Cold load with the backend down stays usable (#60)

Legacy pattern to keep (PR #52's `first-load.spec.ts`) and defect to avoid:
a per-route cold-load test asserts usable content within 5 s, no full-screen
loader left, body text not stuck on "Conectando...", and zero uncaught page
errors (`tests/first-load.spec.ts:11,87,137,143-146`). The Supabase client
had an 8 s fetch timeout (`src/integrations/supabase/client.ts:60-74`) but
queries and Suspense boundaries had no deadline or chunk-failure recovery,
producing infinite spinners (issue #60).

- Given a cold load of any public route with the backend unreachable;
- When the page renders;
- Then a usable shell with real content appears within the time budget,
  every async region ends in one of timeout / empty / error / retry —
  never an unbounded spinner — and no uncaught error escapes.
- Target: async-state trap in Phase 05 (every async view must own all four
  end states); full cold-load journey in Phase 08 (time-to-usable with
  backend down, per route).
- Issue: https://github.com/luandro/cotiju-app/issues/60

### S5. Service-worker caches are public-GET-only (#65)

Legacy defect: the workbox config puts **every** `*.supabase.co/rest/` URL
in one NetworkFirst cache — 200 entries, 24 h — so public and authenticated
reads share storage (`vite.config.ts:127-135`; storage at :136-143). The
cross-user leak was code-risk only, never reproduced
([legacy audit §5](../../planning/research/legacy-cotiju-audit.md)).

- Given a service worker in front of the app's API;
- When a response is authenticated or may contain personal data;
- Then it is never written to a cache: only an explicit allowlist of public
  GET endpoints may persist, caches are purged on sign-out, and a static
  assertion fails the build if a non-allowlisted API route gains caching.
- Target: Phase 05 (guardrail assertion on the SW/cache configuration; the
  A/B two-session test is required only if any authenticated surface ever
  ships — then Phase 08).
- Issue: https://github.com/luandro/cotiju-app/issues/65

## Test port list (task 01-6)

Which legacy Vitest (`src/tests/`) and Playwright (`tests/`) scenarios
become guia.la tests, and in which phase. Static counts from the planning
audit §6; suites were not run.

### Ports to Phase 05 (tests, regression traps, security guardrails)

| Legacy source | Scenario that ports | Why |
|---|---|---|
| src/tests/security/inputSanitization.test.ts (~23 cases) | User-entered text is sanitized/escaped before any display; planted XSS-ish inputs fail the trap | Security guardrail class; guia.la renders editor-entered content |
| src/tests/services/businessOwnershipService.validation-bypass.test.ts (~15) | Ownership/claim-style flows reject forged or out-of-scope requests | Validation-bypass trap for Phase 07's editor claims, planted as a fast-gate failure |
| src/tests/emptyStates.test.ts | Every async view implements timeout, empty, error and retry (S4 unit half) | The #60 spinner class |
| src/tests/buildEnvGuard.test.ts | Build fails on missing required env; no secret ever lands in a public var (D-12 class) | Secret-leak guardrail |
| src/tests/i18n.test.ts + language.test.ts (~12) | Locale fallback is marked, default locale always resolves, missing keys fail CI (D-14) | guia.la ships six locales; fixtures exercise the marked-fallback path |
| src/tests/weather-api.test.ts (staleness subset) | Stale weather is displayed as stale with a timestamp, never as fresh (S2's freshness half) | Honest-freshness trap |

### Ports to Phase 08 (widget verticals)

| Legacy source | Scenario that ports | Why |
|---|---|---|
| tests/first-load.spec.ts | Per-route cold load with backend down: usable content within budget, no residual loader (S4 journey half) | The PR #52 pattern, applied per vertical |
| src/tests/places.test.ts + tests/features/pages.spec.ts | Public place list and detail render from local data with map markers | Places + map vertical |
| src/tests/map.test.ts, mapIcons.test.ts + tests/mobile/map-mobile*.spec.ts, responsive.spec.ts | Map renders, markers categorized, usable on small screens | Map vertical |
| tests/core/navigation.spec.ts | Primary navigation reaches every public route; no dead links | Vertical journeys |
| tests/core/accessibility.spec.ts | A11y assertions per vertical screen (with Phase 03 primitives) | A11y stays verified end to end |
| tests/core/error-handling.spec.ts | Per-vertical error states when a widget's source is down (S3/S4 adjacent) | Truthful error states |
| src/tests/motoTaxi.test.ts (directory subset only) | Local-services listing shows only consented, verified contacts with provenance | Local-services vertical; consent rules in the approval list |

### Not ported (with reasons)

| Legacy source | Reason |
|---|---|
| src/tests/whatsappAuth.test.ts (~16), authContext.test.ts, profile.test.ts, registerMotoTaxi.test.ts, photoUploadCta.test.ts, settingsPage.test.ts, tests/core/auth.spec.ts | guia.la v1 has no visitor accounts (D-13); these flows do not exist |
| src/tests/events/criticalPaths.test.ts, tests/features/place-suggestions*.spec.ts (as flows) | Public event CRUD and public suggestion flows are out of MVP; editor-side equivalents belong to Phase 07, fed by the sanitization/validation traps ported to 05 |
| src/tests/realtimeContext.test.ts, supabase.test.ts, beachLocationCache.test.ts | Supabase realtime/SDK specifics; guia.la's backend is Phase 07, tested there |
| src/tests/intentionManager.test.ts (~19), icons.test.ts | Legacy UX device / icon inventory with no guia.la counterpart |
| tests/integration/supabase-*.spec.ts, user-journey.spec.ts (~33) | Integration approach replaced by Phase 07's backend tests |
| tests/visual/*.spec.ts | Visual regression is re-founded on Phase 03 Storybook, not screenshot ports |
| tests/analysis/*.spec.ts | Exploratory UX scripts, not product assertions ([legacy audit §6](../../planning/research/legacy-cotiju-audit.md)) |
| supabase/tests/*.sql (4 files) | Neither Vitest nor Playwright; their tenant-isolation and ownership-security concepts feed Phase 07's backend test plan, not this list |

## Fresh guia.la scenarios with no legacy counterpart

The fixture contract (places missing some locales) deliberately exercises
D-14's marked-fallback path; its tests land with the consuming phases (02
skeleton, 05 trap suite) and are not legacy ports.
