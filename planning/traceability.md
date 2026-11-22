# guia.la — requirements traceability

Planning baseline 2026-11-21. **Status legend:** `planned` (defined in a phase, no tool has run), `spike` (needs a spike result before design is fixed), `blocked` (needs a human decision/credential/payment before it can run), `evidence` (a tool ran and output is linked — none yet). No row is passing: nothing has been built or run in this pass.

Phase pages: [index](index.html). Decisions: [decisions.md](decisions.md). Review: [review.md](review.md).

| # | Core requirement | Phase(s) | Owner (widget / subsystem) | Test(s) — proposed | Evidence artifact — expected | Status |
|---|---|---|---|---|---|---|
| T01 | Web + Android + iOS from one codebase | 02, 04 | `apps/app` shell | `expo export -p web`; Expo Android/iOS build; Maestro launch smoke | Web preview URL, APK/AAB, iOS simulator build + screenshot of same reference screen | planned; native builds **blocked** on Expo account/credentials (D-08) |
| T02 | Accessible UI | 03, 05, 08 | `packages/ui`, every widget | axe on Storybook stories + key pages; RN accessibilityLabel lint; keyboard Playwright journey; screen-reader manual check | axe report, story gallery, VoiceOver/TalkBack notes | planned |
| T03 | Native maps (and web map) | 08 | `@guia-la/map` contract, `places` widget | Map renders pins on web/Android/iOS; offline region (Android); fallback when tiles fail | Screenshots ×3 platforms, Maestro video | spike (S6, D-05 tile source) |
| T04 | Real SEO / social previews | 02 (spike), 07 (publish→rebuild), 10 | web build, `tools/seo-check` | JS-disabled Playwright + `curl` asserting title/description/canonical/og:image per route; sitemap check | HTML assertions report; WhatsApp preview screenshot (manual) | spike (S1, D-03) |
| T05 | Strict per-build widget exclusion | 06 | `tools/compose`, generated registry | Sentinel-string + source-map negative assertions per web profile; route-file absence; permission diff | CI log of assertions; size diff table | planned (JS); native = spike only (D-06) |
| T06 | Runtime flags cannot exceed build set | 06 | registry + flags client | Unit: unknown/excluded flag ignored; E2E: flag on for excluded widget shows nothing | Test report | planned |
| T07 | Multi-tenant isolation | 07 | API repository layer | Tenant A/B read/write tests per route; editor of A → 403 on B; lint banning raw D1 | API test report; threat-model note | planned |
| T08 | Public browsing without login | 02, 07, 08 | app shell, public API | Playwright anonymous journeys; API public GET without auth header | Report + screenshots | planned (D-13a approved; D-13b proposed) |
| T09 | Offline behaviour | 08, 05 | snapshot service, Workbox SW, native cache | Playwright offline reload; airplane-mode Maestro; private responses never in SW cache | Videos, cache inventory dump | planned (S8 for web SQLite) |
| T10 | Data freshness + timezone correctness | 07, 08 | ingestion jobs, `transport`, `tides` | Property tests in `America/Belem` (21:00 boundary, validity dates, weekdays); stale-data UI shows age; upstream-down shows honest empty state | Test report; stale/empty state screenshots | planned |
| T11 | Preserve original Cotiju application (no writes) | 01, 09 | Phase 01 auditor | Read-only access only; audit log of commands; no PR/commit to `cotiju-app` | Extraction matrix with source SHA | planned |
| T12 | Backend backup / restore | 07, 10 | D1 export Workflow → R2 | Weekly automated restore drill (R2 export → scratch D1) with row-count + checksum compare; quarterly human-witnessed drill | Drill log | planned; **blocked** on Cloudflare account (D-04) |
| T13 | Reliable error states (no permanent spinners) | 03, 05, 08 | `packages/ui` state components, every widget | Error-injection tests (API 500/timeout/offline) asserting final state < N s | Screenshots of error/empty/offline per widget | planned |
| T14 | Releases + rollback | 04, 10 | CI/CD | Simulated release + rollback (web: previous deploy; app: OTA/channel rollback) | Release/rollback log | planned; store publication **blocked** on human approval |
| T15 | Agent continuation | 00, 10 | AGENTS.md, PR evidence template, state files | Handoff test: a different agent adds a small widget from spec to green PR | PR link + evidence package | planned |
| T16 | No secrets in client bundles | 04, 05 | CI | gitleaks on repo; grep built bundles/source maps for key patterns | CI log | planned |
| T17 | Live-commit provenance on real domain | 04, 07, 10 | `/v1/meta/build`, web footer meta | Post-deploy smoke compares deployed SHA with merged SHA | Smoke log | planned (from legacy #63 lesson) |
| T18 | Content rights / consent | 01, 09 | content model (licence, source, consent fields) | Schema requires licence+source for media; import refuses rows without consent | Import report | planned; **blocked** on owner content review |
| T19 | Store-policy-compliant distribution | 10 | release | Checklist vs Apple 4.2.6/4.3, Google repetitive content | Signed checklist | planned (D-07) |
| T20 | Cost tracking | 04, 10 | ops | Monthly usage report (Workers, D1, R2, Expo) vs ceiling | Cost sheet | **blocked** on budget decision (D-08) |
| T21 | Internationalization from day one (D-14) | 02, 04, 05 | i18n layer, fast gate, test traps | i18n key completeness fails CI on a missing key in any of the six locales; locale-prefixed export carries hreflang + per-locale OG (S1 per locale); compose refuses widget strings missing a locale | CI gate logs, per-locale export assertion report | planned |
| T22 | Guardrails-first + TDD (D-15) | 02, 04, 05 | pre-commit, CI fast gate, test protocol | Pre-commit (trufflehog staged, formatter, lint, typecheck) and CI gates (trufflehog full history, i18n completeness, dependency audit, CodeQL) all red-tested; every behavior change and bug fix shows red-then-green evidence with the failing test committed first and untouched by the fix | PR evidence quoting red and green runs | planned |
