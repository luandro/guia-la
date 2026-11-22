# guia.la — architecture review (planning pass 1)

Date: 2026-11-21 · Reviewer: Claude (orchestrator) with three research sub-agents · Scope: planning artifacts only.
Inputs: [master plan v0.2](../docs/guia-la-master-plan.html), [handoff prompt](../docs/guia-la-agent-handoff.md), and the research notes this pass produced:

- [research/legacy-cotiju-audit.md](research/legacy-cotiju-audit.md) — read-only audit of `luandro/cotiju-app` at `c0c9907` (main, 2026-11-21).
- [research/expo-stack.md](research/expo-stack.md) — Expo SDK 58, Router, maps, Storybook, Expo build pricing, exclusion mechanics (spikes S1–S13).
- [research/backend-stores-starters.md](research/backend-stores-starters.md) — Cloudflare D1/R2/Workers, Apple/Google store policy, starters.

Evidence labels used below: **[C]** confirmed from a primary source or the repository (link in the research file), **[I]** engineering inference, **[S]** hypothesis that needs a spike. Nothing in this packet was built, deployed or tested; every "pass" in later documents is a planned check, not a result.

Not inspected: the live production database (row counts need admin access), which host/commit serves production today, Expo/EAS and Cloudflare accounts, any native build. The DeepSeek search API returned HTTP 402 to the research agents, so sourcing came from direct fetches of primary pages.

---

## 1. Executive assessment

**Verdict: proceed, with revisions.** The core direction — one Expo/React Native codebase for web, Android and iOS, a small Cloudflare Worker API on D1/R2, build-time widget composition, one flagship store app — is sustainable for 2–3 years with a small agent-led team **if** four things change:

1. **The plan treats a content-operations failure as an architecture problem.** The legacy audit finds that the Cotiju incident (#63/#59) most likely came from empty or filtered tables, a tide table that stopped at 2026-06-08 with no ingestion job, and two live hosts (Surge and Workers) with unclear provenance — not from React/Vite/Supabase as such [C: legacy audit §incident]. A rewrite does not fix that. Freshness, provenance, deploy provenance ("which commit is live") and an editorial routine must be first-class deliverables, earlier than Phase 09.
2. **"Build-time native exclusion per destination" is expensive and mostly unneeded now.** The recommended distribution is one flagship app that must contain the *union* of destination widgets [C: Apple 4.2.6/4.3(a), Google repetitive-content policy]. Destination-specific exclusion then matters for **web bundles** (cheap, high value) and only hypothetically for partner native apps. Expo documents `expo.autolinking.exclude` only in `package.json`, so per-destination native exclusion needs a generated `package.json` before prebuild [C, S5]. Recommendation: prove web/JS exclusion fully in Phase 06; prove native exclusion with one module as a spike; defer the general mechanism until a partner app is approved.
3. **SEO via Expo Router static export couples content publishing to rebuilds.** `web.output: "static"` + `generateMetadata()` emits per-route OG tags in raw HTML, but dynamic routes need `generateStaticParams`, so each published place requires a re-export [C, S1]. In SDK 58 `<Head>` no longer reaches static HTML, so copied patterns silently lose OG tags [C]. That is workable (small sites rebuild in minutes) but must be designed: publish → rebuild/deploy hook, or a Worker that serves an OG-correct shell for not-yet-built pages. This is a decision gate in Phase 02, not Phase 10.
4. **Too much pipeline before value.** Phases 02–06 produce infrastructure; the first destination journey arrives in Phase 08 and real content in Phase 09. For a very small team working mostly through agents, that delays the only test that matters (do visitors in Cotijuba trust and use it?). Recommendation: keep 00–10 numbering but run a **walking skeleton** through Phases 02–05 (one real Places list/detail page with fixture data, shipped as a web preview), and keep native cloud gates thin until there are native-specific features.

**Highest-risk assumptions**, ranked: (a) Expo Router static SEO + per-publish rebuild is acceptable to editors [S1]; (b) a community editor workflow will keep boat/tide/service data fresh (human, not technical) [I]; (c) D1 without row-level security can hold tenant isolation through API code and tests alone [C: no RLS; I: feasible with a single scoped data-access layer]; (d) MapLibre on RN 0.88 New Architecture + web works with offline packs [S6]; (e) Expo free plan is enough — it is not for per-PR native: 15+15 builds/month, low-priority queue, no Maestro jobs [C].

**Alternatives considered and rejected for now**: Next.js web + separate RN app (two routing/rendering stacks; contradicts small-team goal) — keep only as the Phase 02 fallback if S1 fails; hosted Postgres (Neon/Supabase via Hyperdrive) — better RLS/PostGIS but +$15–25/month and a second vendor, not justified at this data size [C pricing; I]; separate native apps — no evidence of need.

---

## 2. Red-team table

| # | Sev | Claim / assumption in plan | Risk | Evidence | Recommended change | User decides? |
|---|---|---|---|---|---|---|
| R1 | High | Rebuild fixes the reliability problems | Incident root cause was content/ops (empty tables, stale tides, two hosts) | [legacy audit](research/legacy-cotiju-audit.md) #63/#59/#62 | Add freshness/provenance schema, "live commit" endpoint and smoke-on-real-domain to Phases 04/07; start editorial routine in 07, not 09 | No (safe default) |
| R2 | High | Per-destination native exclusion is a core gate (06) | Large custom tooling for a case the store policy discourages | [expo-stack](research/expo-stack.md) S5; [stores](research/backend-stores-starters.md) §2 | Phase 06 gate = web/JS exclusion + flagship union; native exclusion = one-module spike, general mechanism deferred | **Yes** (D-06) |
| R3 | High | Expo Router web is SEO-ready | Static export needs rebuild per publish; `<Head>` dropped from static HTML in SDK 58 | expo-stack §SEO, S1, migration notes | Make SEO/OG a Phase 02 spike with raw-HTML assertions; design publish→rebuild hook in 07 | **Yes** (D-03) |
| R4 | High | D1 tenancy is safe | No RLS; every query must filter tenant; legacy relied on 146 RLS policies | stores §1; legacy audit | Single data-access module that requires `destinationId`; lint rule banning raw D1 outside it; tenant A/B tests in every API PR | No |
| R5 | High | Bundled third-party keys acceptable | Legacy app ships WorldTides/StormGlass keys in public JS | legacy audit #62 | guia.la: all upstream calls server-side, CI secret scan on built bundle. **Legacy: owner should rotate those keys** (outside this repo's scope) | **Yes** (legacy action) |
| R6 | Med | Phase 04 builds Android+iOS for relevant PRs | Free plan: 15+15 builds, slow queue, no Maestro; Starter $19/mo | expo-stack §pricing | Per-PR: web only + JS tests. Native builds on label/`native/**` path filter and nightly/RC. Budget ceiling recorded in 04 | **Yes** (D-08 spend) |
| R7 | Med | Maps "may use .web/.native" | Neither `expo-maps` nor `react-native-maps` supports web | expo-stack §maps | MapLibre on both (`@maplibre/maplibre-react-native`, `maplibre-gl`) behind one `MapView` contract; choose a tile source (cost!) | **Yes** (D-05 tiles) |
| R8 | Med | Offline via service worker + SQLite | Expo has no built-in SW; `expo-sqlite` web needs COOP/COEP, which can block cross-origin tiles/images lacking CORP | expo-stack §offline, S8 | Web offline v1 = Workbox precache of shell + public JSON snapshots only; no SQLite-on-web until S8 passes | No |
| R9 | Med | Admin/CMS "small editorial interface" | Custom CMS + editor auth is the largest hidden scope | plan §07 | Editor auth via Cloudflare Access or email magic link [S]; editor UI as web-only route group in same app or minimal Hono pages; no visitor accounts | **Yes** (D-09) |
| R10 | Med | Storybook RN early (03) | RN 10.7 + RNW-Vite 10.6 with RN 0.88/React 19.3 untested; Storybook 11 in beta | expo-stack S9 | Phase 03 starts with S9 spike; fallback = web Storybook only + Expo Router "gallery" route on device | No |
| R11 | Med | Schedules/tides correctness | Legacy used device clock + UTC date; ignored weekday/validity | legacy #62/#64 | Server-computed "next departure"/tide day in `America/Belem`; property tests around 21:00 local and validity edges | No |
| R12 | Med | D1 backups | Time Travel restores in place only; `d1 export` blocks queries and refuses DBs with virtual tables (FTS5/R*Tree) | stores §1 | No virtual tables in primary DB; nightly export Workflow to R2; weekly automated restore drill into a scratch DB plus a quarterly human-witnessed drill; Time Travel is in-place only and is an incident tool, never a drill | No |
| R13 | Low | Ignite/Obytes as sources | Ignite on SDK 55 + React Navigation; Obytes SDK 54, stale; T3 on Next/Postgres | stores §3 | Official `create-expo-app`; borrow env-validation pattern and Maestro layout only | No |
| R14 | Low | Drizzle/Hono stable | Drizzle 1.0 RC churn; D1 docs already point to RC | stores §1 | Pin exact versions; Renovate-style update PRs gated by contract tests | No |
| R15 | Low | Legacy test reuse | ~234 Vitest / ~136 Playwright cases exist but app has 455 ignored `tsc` errors | legacy audit | Port *scenarios* (bug repros: tides after 21:00, boat validity, cold-load offline) as fixtures, not test code | No |
| R16 | Med | Naming / identity | App IDs, package scope, domain unverified | plan §01 | Phase 00 records candidates only (`guia-la`, `@guia-la/*`, `la.guia.app`) and an ownership check list | **Yes** (D-01) |

---

## 3. Dependency and compatibility check

Versions verified 2026-11-21 against npm/changelogs in [expo-stack.md](research/expo-stack.md) and [backend-stores-starters.md](research/backend-stores-starters.md). Pin exactly in Phase 02; re-verify then.

| Area | Verified state | Compatibility notes / risk | Plan action |
|---|---|---|---|
| Expo SDK | 58 (`expo` 58.0.26), RN 0.88.1, React 19.3.0, RNW 0.21.4, `expo-router` 58.0.32 [C] | New Architecture mandatory since SDK 55; Node 22.13+/24.3+/26+ | Every native dep must support New Arch; pin a supported Node (22.13+/24.3+) in `.nvmrc` |
| Router web output | `static` + `generateMetadata()` → per-route HTML with OG [C]; default when unset is contradictory in docs [S2] | `<Head>` no longer in static HTML (SDK 58); dynamic routes need `generateStaticParams` | Set `web.output: "static"` explicitly; S1 in Phase 02 |
| Web hosting | Cloudflare recommends Workers Static Assets for new projects [C]; `expo-server` workerd adapter undocumented [C, S3] | Expo Hosting free tier lacks custom domain | Static assets on Workers + separate Hono API Worker; SSR only if S3 passes |
| Maps | No web in `expo-maps` / `react-native-maps` [C]; MapLibre RN 11.5.1, `maplibre-gl` 6.19 [C versions, I fit] | New Arch + offline packs untested [S6]; `.web.tsx` in `app/` needs non-platform sibling | MapLibre behind contract; tile source decision |
| Offline | `expo-sqlite` web needs wasm + COOP/COEP [C]; no built-in SW [C] | COEP vs cross-origin tiles/images [I] | Workbox shell + public JSON; S8 before SQLite-on-web |
| Storybook | `@storybook/react-native` 10.7.2, `@storybook/react-native-web-vite` 10.6.8 [C] | Peers allow RN 0.88; untested [S9]; entry swap via `STORYBOOK_ENABLED` keeps it out of prod | S9 first in Phase 03 |
| Tree shaking | `EXPO_PUBLIC_*`, `__DEV__`, platform elimination stable; cross-module tree shaking experimental [C] | Do not rely on tree shaking for exclusion | Exclusion by *not importing* (generated registry) + Atlas/source-map assertions |
| Bundle proof | `EXPO_ATLAS=true npx expo export`; `npx expo export -s external` source maps [C] | Atlas file contains inlined env values → treat as secret artifact [C] | Grep source maps in CI; do not publish Atlas publicly |
| Native exclusion | `expo.autolinking.exclude` documented in `package.json` only [C] | Per-variant config unproven [S5] | Spike only (R2) |
| Native CI | Free: 15 Android + 15 iOS builds/mo, 45-min timeout, no Maestro; Starter $19/mo; Maestro $0.05/job + minutes [C] | Queue latency 90+ min at peak [C] | Path-filtered + nightly; S12/S13 measure cost & GH Actions emulator alternative |
| TypeScript | RN strict TS API; deep-import opt-out removed after RN 0.89 [C] | Libraries with deep imports break next SDK | `tsc --noEmit` in CI from day one (legacy had none, #69) |
| Env handling | `NODE_ENV` forced; staging builds load production `.env` [C] | Wrong API base in staging builds | Explicit `APP_ENV` + zod-validated config; fail build on missing vars |
| Backend | Workers Paid $5/mo; D1 10 GB/DB cap, single-threaded, Time Travel 30 d; R2 free egress; Hono 4.13.19; Drizzle 0.45.4 / 1.0.0-rc.6 [C] | Drizzle RC churn; Cron in UTC | Pin; schedule in UTC with Belém conversion in code |

---

## 4. Build-time widget exclusion design (proposal)

**Principle:** a disabled widget is never imported, so it cannot be bundled. Tree shaking is a bonus, not the mechanism.

1. **Manifests** — `destinations/<id>/destination.ts` uses `defineDestination()` (zod-validated) listing `includedWidgets` and per-widget config. **Build profiles** (`profiles/flagship.ts`, `profiles/cotijuba-web.ts`, `profiles/serra-web.ts`) list which destinations a build serves; the widget set is the union of those destinations.
2. **Generator** — `tools/compose` (small TS script, run by `pnpm compose --profile <p>`) writes `apps/app/src/generated/registry.ts` with explicit static imports of only the selected widget packages, plus the route stubs for each widget (`app/(widgets)/<widget>/...` re-exporting the widget's screens). Generated files are git-ignored and regenerated in CI; a checksum of inputs is stamped into the build.
3. **Routes** — Expo Router is file-based, so excluded widgets must have *no route files*. The generator creates/removes the route stubs; `+not-found` handles stale links.
4. **Boundaries** — widgets live in `packages/widgets/<name>`, depend only on `@guia-la/widget-sdk`, `@guia-la/ui`, `@guia-la/core`; ESLint `no-restricted-imports`/dependency-cruiser forbid widget→widget and app→widget imports outside `generated/`.
5. **Native capabilities** — each widget manifest declares `capabilities` (e.g. `location`, `maps`, `offlineMaps`) and `nativeDeps`. `app.config.ts` composes config plugins and permission strings from the selected widgets only. For the flagship (union) this is a correctness/audit tool; true native exclusion for partner builds = generated `package.json` `expo.autolinking.exclude` before `prebuild` [S5, deferred].
6. **Runtime flags** — fetched per destination from the API; can hide/reorder registered widgets only. The registry is the closed set; unknown IDs from the server are ignored and logged.
7. **Negative assertions (CI)** — for each web profile: `npx expo export -p web -s external` then a script asserts that a sentinel string exported by every widget (`__GUIA_WIDGET_<NAME>__`) appears only for included widgets, route HTML files for excluded widgets do not exist, and no excluded package path appears in source maps. Native: `npx expo config --type public` + prebuild output diff for permissions (Android `AndroidManifest.xml`, iOS `Info.plist` usage strings).

---

## 5. Testing strategy and cost

| Gate | Runs | Contents | Cost driver |
|---|---|---|---|
| **Pre-commit** (local, staged changes — D-15) | Developer/agent machine | trufflehog on staged changes, formatter, ESLint on staged files, fast typecheck; mirrors the CI fast subset | Local time only |
| **Fast PR gate** (every PR, < 10 min target) | GitHub Actions | `tsc --noEmit`, ESLint + boundary rules, Vitest unit/contract, zod schema checks, `compose` for each profile + exclusion assertions, `expo export -p web`, Playwright smoke (Chromium) incl. JS-disabled OG/HTML checks, API tests on Miniflare/local D1 incl. tenant A/B, gitleaks + built-bundle secret grep, i18n key completeness across all six locales (D-14) | GH Actions minutes (free for public repos; private repo has a monthly allowance — verify plan) |
| **Visual** (PRs touching `packages/ui`, widgets) | GH Actions | Storybook web build + Playwright screenshot diff of stories; axe accessibility on stories and key pages | Minutes; baseline storage |
| **Native PR gate** (label `native` or path filter on native config/deps) | Expo Workflows or GH Actions emulator [S12/S13] | Android dev/preview build + Maestro smoke; iOS build only when iOS-specific files change | Expo credits; Maestro $0.05/job |
| **Nightly / RC** | Expo Workflows | Android + iOS builds per profile, Maestro suite on both, WebKit Playwright, automated restore drill (weekly; human-witnessed quarterly) | Starter plan likely needed |
| **Release (human)** | Real devices | Low-end Android on 3G in Cotijuba, iPhone spot check, content validation, store metadata | Human time |

Flaky-test protocol: quarantine label with an issue link and 7-day expiry; never delete or skip a failing test without human approval (charter rule). Real-device exceptions: GPS accuracy, offline map packs, share sheets/WhatsApp previews, low-memory devices — always manual at RC.

---

## 6. Legacy extraction risks

- **Entities** worth carrying as concepts: places (merge legacy `places` + `beach_locations` duplication), categories, media with licence, boat routes/timetables with validity periods, tides (as an ingested series with source), local services (moto-taxi), guides, events. Reviews/audit triple tables: discard [C: legacy audit].
- **Data truth is unknown.** Anonymous reads returned 0 rows in 5 tables; admin counts not inspected [C/unverified]. Phase 01 must get a human-run, read-only export (owner runs it; agents never hold the service key).
- **Privacy/LGPD:** phone numbers, profiles and user-uploaded photos are personal data; no consent/licence record exists in the schema [I from audit]. Default: do not migrate personal records or UGC photos; re-collect consent in Phase 09.
- **Secrets:** legacy bundles third-party API keys (R5). Treat any legacy `.env` or key as compromised; never copy into guia.la.
- **Backups:** before *any* export, owner confirms a Supabase backup/point-in-time snapshot exists. Exports go to an encrypted, non-repo location; fixtures committed to guia.la are synthetic or explicitly public.
- **Avoid importing complexity:** do not port the 4,681-line baseline migration, RLS policies, 59 SQL functions or PR #39's 24-table D1 schema (371 files, +99k lines) [C].

---

## 7. Alternatives worth a short spike (≤ 1 day each)

| Spike | Question | Pass criterion | Fallback |
|---|---|---|---|
| A1 Starter | `create-expo-app` (SDK 58 default template) vs Obytes/Ignite | Official template boots web/Android/iOS with Router + static web; starters fail on SDK currency | Official template (expected) |
| A2 Universal SEO | Expo Router static vs thin Worker-rendered SEO pages (Hono JSX) | S1: OG/title/canonical in raw HTML for all place pages; rebuild < 5 min for 1k pages | Hono SSR "share pages" for public detail URLs + Expo web app for interaction |
| A3 DB | D1 vs Neon/Supabase via Hyperdrive | Tenant-scoped query set at fixture scale < 50 ms p95 on D1; backup/restore drill works without virtual tables | Postgres only if geospatial needs exceed bbox + haversine or RLS becomes mandatory |
| A4 Maps | MapLibre RN + maplibre-gl with one contract | Same place pins on web/Android/iOS; offline region on Android | Static map images + "open in maps" deep link for v1 |
| A5 Editor auth | Cloudflare Access (one-time PIN) vs app-built magic links | Editor of destination A cannot write B; no visitor login | Magic-link with D1 sessions |
| A6 Native-only? | Whether any feature needs separate native code | None identified | — (React Native retained) |

---

## 8. Proposed edits to the roadmap (numbering 00–10 retained)

1. **Phase 02** absorbs the SEO spike (S1/A2) and the first *walking skeleton* page (Places list/detail from fixtures). Exit gate adds "raw-HTML OG assertion passes for one dynamic route".
2. **Phase 03** starts with the Storybook compatibility spike (S9) and has an explicit fallback.
3. **Phase 04** is split into 04a (web previews + fast gate, required) and 04b (native cloud builds, path-filtered/nightly, budget-capped). 04b may complete in parallel with 05/06.
4. **Phase 05** keeps red/green demonstrations but native Maestro moves to nightly/RC.
5. **Phase 06** exit gate becomes: web/JS exclusion proven for two web profiles + flagship union; native exclusion demonstrated for one module (spike) — general mechanism deferred until a partner app is approved (D-06).
6. **Phase 07** gains freshness/provenance columns, a `/v1/meta/build` (live commit) endpoint, publish→rebuild hook and editorial checklist; the editorial routine begins here with fixtures.
7. **Phase 08** order: places/map → transport → tides/weather → local services → Serra trails/guides demo; each widget is its own PR series.
8. **Phase 09** may start content verification (not import) in parallel with 07/08 because it is human-paced.
9. No phases removed or merged.
10. **Phase 02** also lands the i18n layer from D-14 (approved 2026-11-22): all six locales (en, pt-BR, es, fr, nl, de) from the walking skeleton on — locale-prefixed routes with hreflang and per-locale OG, CI failing on a missing key in any locale, and a library spike (expo-localization + i18next/react-i18next vs Lingui) deciding the stack.
11. **Every phase** plans and lands its guardrails before or with its first feature PR (pre-commit, CI gates, hooks), and TDD red-green-refactor with quoted red/green evidence applies to every behavior change and bug fix (D-15, approved 2026-11-22).

---

## 9. Open decisions (ranked)

See [decisions.md](decisions.md) for full ADR candidates.

> **Update 2026-11-21:** the owner decided D-01, D-03, D-05, D-06, D-08 (all free tiers — supersedes item 5), D-09 and D-11 (MIT for code); D-12 is an owner TODO. The list below is the original ranking.

> **Update 2026-11-22:** the owner approved D-14 (internationalization from day one; UI locales en, pt-BR, es, fr, nl, de) and D-15 (guardrails first, TDD, AI-native SDLC). Roadmap edits 10–11 above fold them in.

1. **D-03 SEO rendering** — static export + rebuild-on-publish (recommended) vs Worker SSR share pages. Evidence: S1 result.
2. **D-06 Native exclusion scope** — defer general mechanism (recommended).
3. **D-09 Editor auth** — Cloudflare Access (recommended pending A5) vs built magic link.
4. **D-05 Map tiles** — hosted free/OSM-based vs self-hosted PMTiles on R2 (recommended to spike; cost + offline).
5. **D-08 CI/build spend ceiling** — Expo Starter ($19/mo) + Workers Paid ($5/mo) as initial budget (recommended).
6. **D-01 Names/IDs/domain** — confirm `guia.la` ownership, bundle IDs, GitHub repo name.
7. **D-11 License** — code license (e.g. AGPL vs MIT) after rights review; content license separate.
8. **D-12 Legacy key rotation and production banner** — owner action outside this repo.

---

## 10. Final recommendation

**REVISE, then proceed** — confidence **medium**: the direction is well supported by current docs, but five spike results (below) could still change it.

The stack is sound and current (SDK 58, Workers/D1/R2 within $5–25/month at pilot scale). The plan should be accepted with: the SEO gate moved to Phase 02, native exclusion de-scoped to a spike, native CI made path-filtered and budgeted, content freshness/provenance pulled forward into Phases 04/07, and an editor-auth spike before Phase 07.

Unknowns that could change the verdict: S1 (static OG + rebuild cost), S6 (MapLibre on New Architecture), S9 (Storybook on RN 0.88), real legacy row counts and content rights, and whether local editors can sustain data freshness.

**First execution step after approval:** Phase 00 — create the guia.la application repository skeleton docs only (`AGENTS.md`, `SPEC.md`, `docs/adr/`) from [drafts](drafts/), record decisions D-01/D-03/D-06/D-08/D-09, then Phase 01's read-only inventory and Phase 02's S1 spike can start in parallel.
