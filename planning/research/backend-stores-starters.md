# Research slice: backend (Cloudflare), store policies, starters

Baseline date: 2026-11-21. Retrieved 2026-11-22 UTC. Scope: research only, no deliverables of the handoff.
Method: Cloudflare docs fetched as `index.md` from developers.cloudflare.com; GitHub data via `gh api`; npm data via `npm view`; Apple/Google pages fetched as HTML and converted to text.
The DeepSeek Search/Fetch API returned `HTTP 402 Insufficient Balance` on every call, so no search engine was used. All sources below are primary.

## 1. Cloudflare Workers + D1 + R2

### Confirmed (with source)

**D1 limits** (https://developers.cloudflare.com/d1/platform/limits/)

| Item | Workers Free | Workers Paid |
|---|---|---|
| Databases per account | 10 | 1,000,000 (100,000 included, then $0.10/DB-month) |
| Max DB size | 500 MB | 10 GB, "cannot be further increased" |
| Max storage per account | 5 GB | 1 TB |
| Time Travel (PITR) window | 7 days | 30 days |
| Queries per Worker invocation | 50 | 1,000 (a `db.batch()` counts as one) |
| Max row / string / BLOB | 2 MB | 2 MB |
| Max SQL statement | 100 KB | 100 KB |
| Bound params per query | 100 | 100 |
| Columns per table | 100 | 100 |
| Max query duration | 30 s | 30 s |
| Max result size | 50 MB | 50 MB |

- Each D1 database is single-threaded and backed by one Durable Object. Throughput is about `1 / query duration`. Overload returns an "overloaded" error after queueing. Same page.
- Large `UPDATE`/`DELETE` must be batched (about 1,000 rows per chunk). Same page.
- D1 is designed for "horizontal scale out across multiple, smaller (10 GB) databases, such as per-user, per-tenant". Same page.

**D1 pricing** (https://developers.cloudflare.com/d1/platform/pricing/)

| Metric | Free | Paid |
|---|---|---|
| Rows read | 5 M/day | 25 B/month included, then $0.001/M |
| Rows written | 100 k/day | 50 M/month included, then $1.00/M |
| Storage | 5 GB total | 5 GB included, then $0.75/GB-month |

- Rows read counts rows scanned, not rows returned. Unindexed filters bill full scans. Indexes add one written row per indexed write. Same page.
- No egress charge. Read replicas cost nothing extra; normal row billing applies. Same page.

**D1 read replication** (https://developers.cloudflare.com/d1/best-practices/read-replication/)
- Requires the Sessions API (`withSession`). Without it all queries go to the primary.
- Replicas are asynchronous; Sessions API gives sequential consistency per session via bookmarks.
- Enabled per database in dashboard Settings.
- Release notes list "D1 Read Replication Public Beta" on 2025-04-10 (https://developers.cloudflare.com/d1/platform/release-notes/). I found no GA entry in those notes.

**D1 Time Travel, backup, export** (https://developers.cloudflare.com/d1/reference/time-travel/, https://developers.cloudflare.com/d1/best-practices/import-export-data/)
- Time Travel is always on, free, minute granularity: `wrangler d1 time-travel restore DB --timestamp=...`.
- A restore returns the previous bookmark, so you can undo it. Limit: 10 restores per 10 minutes per DB.
- Restore is in place on the same database. Docs say fork/copy to a new database is "in the future".
- Retention beyond 30 days: the documented path is a Workflow that exports D1 into R2 (https://developers.cloudflare.com/workflows/examples/backup-d1/).
- `wrangler d1 export DB --remote --output=x.sql` gives a full SQL dump. You can also export one table, schema only, or data only.
- **Export limitations:** virtual tables are not supported, including any database that contains one, which covers FTS5 and R*Tree. The workaround is to drop the virtual tables, export, then recreate them. "A running export will block other database requests."

**Workers pricing and limits** (https://developers.cloudflare.com/workers/platform/pricing/, https://developers.cloudflare.com/workers/platform/limits/)

| Item | Free | Paid (Standard) |
|---|---|---|
| Base | $0 | $5/month minimum per account |
| Requests | 100,000/day | 10 M/month included, then $0.30/M |
| CPU | 10 ms per invocation | 30 M CPU-ms/month included, then $0.02/M CPU-ms. Default 30 s, max 5 min |
| Cron CPU | 10 ms | 5 min; 15 min for intervals of 1 h or more |
| Memory | 128 MB per isolate | 128 MB |
| Subrequests | 50/request | 10,000/request |
| Cron Triggers per account | 5 | 1,000 |
| Static asset files per version | 20,000 | 100,000 |

- No egress or bandwidth charges. Static-asset requests are free and do not invoke the Worker. The pricing examples show that an 80% static-asset share keeps cost at $5. Pricing page.
- A spending limit exists. It counts request and CPU overage, and it "can interrupt every Worker on your account". Pricing page.

**Cron Triggers** (https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- Cron Triggers run in UTC. For Brazil (BRT = UTC-3) you must offset tide and boat jobs by hand.
- A change can take up to 15 minutes to propagate. Scheduled runs can be missed until propagation completes.
- "Past Cron Events" can take up to 30 minutes to appear for new or renamed Workers. The cron CPU limits are in the table above.

**R2** (https://developers.cloudflare.com/r2/pricing/, https://developers.cloudflare.com/r2/api/s3/presigned-urls/)

| Item | Standard | Infrequent Access |
|---|---|---|
| Storage | $0.015/GB-month | $0.01/GB-month (30-day minimum) |
| Class A (writes, lists) | $4.50/M | $9.00/M |
| Class B (reads) | $0.36/M | $0.90/M |
| Egress | free | free (+ $0.01/GB retrieval) |
| Free tier (Standard only) | 10 GB-month, 1 M Class A, 10 M Class B | none |

- Presigned URLs allow GET, PUT, HEAD and DELETE, with expiry from 1 s to 7 days. They are signed locally with SigV4 and need no call to R2. They use the `<ACCOUNT_ID>.r2.cloudflarestorage.com` S3 endpoint, and browser use needs bucket CORS. The docs give examples for `@aws-sdk/s3-request-presigner` and `aws4fetch` in a Worker.

**SQL features, geospatial** (https://developers.cloudflare.com/d1/sql-api/sql-statements/)
- Documented extensions: FTS5 (plus `fts5vocab`), JSON1, and math functions. D1 has no PostGIS and no SpatiaLite.
- The workerd SQLite authorizer allows `CREATE VIRTUAL TABLE` only for modules `fts5`, `fts5vocab`, `rtree` and `rtree_i32`, and allowlists `rtreecheck`. Source: https://github.com/cloudflare/workerd/blob/main/src/workerd/util/sqlite.c++ (around lines 551 and 1405; last commit to the file b297f33, 2026-11-11). The D1 docs do not list R*Tree.

**Drizzle + D1** (https://orm.drizzle.team/docs/connect-cloudflare-d1, https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit)
- Drizzle has a first-class D1 driver (`drizzle-orm/d1`) on the Worker binding. It also has a Durable Objects SQLite driver.
- `drizzle-kit` supports `dialect: 'sqlite', driver: 'd1-http'` with account ID, database ID and token. This enables `push`, `migrate` and `studio` against remote D1.
- Releases (GitHub, drizzle-team/drizzle-orm): stable `0.45.4` (2026-10-08); `v1.0.0-rc.6` (2026-11-20, prerelease); `drizzle-kit@0.31.11` (2026-09-21). The D1 doc page tells readers to install `drizzle-kit@rc`, so the docs track 1.0 RC.

**Hono**: `honojs/hono` v4.13.19 released 2026-11-16. Patch releases came on 11-07, 11-11 and 11-16. The project is actively maintained (GitHub releases API).

**Hosted Postgres via Hyperdrive** (https://developers.cloudflare.com/hyperdrive/platform/pricing/)
- Hyperdrive is included in Workers plans. Free: 100,000 queries/day. Paid: unlimited. Pooling and caching are included.
- PlanetScale Postgres/MySQL can be billed through Cloudflare.
- Neon (https://neon.com/docs/introduction/plans, updated 2026-11-18):
  - Free: $0, 100 projects, 100 CU-h per project, 1 GB storage per project, 6 h restore window.
  - Launch: $0.106/CU-h, $0.35/GB-month, PITR at $0.20/GB-month, no monthly minimum.
  - The pricing page headline says "Typical Spend $15/Month".
- Supabase (https://supabase.com/pricing, https://supabase.com/docs/guides/platform/backups):
  - Free: $0, 500 MB DB, max 2 active projects. Projects are "paused after 1 week of inactivity". No managed backups; Supabase recommends regular exports.
  - Pro: $25/month, 8 GB disk, includes $10 of compute credit (one Micro), daily backups kept 7 days. PITR is an add-on.

### Comparison (D1 vs hosted Postgres)

| Axis | D1 (+Drizzle) | Neon / Supabase via Hyperdrive |
|---|---|---|
| Base cost, small app | inside $5 Workers Paid | Neon Launch usage-based (~$15 "typical", per Neon); Supabase Pro $25 + $5 Workers |
| Backup / PITR | free 30-day Time Travel; SQL export (no virtual tables, blocks DB); R2 Workflow for longer | Neon PITR window priced per GB; Supabase Pro daily x7, PITR add-on |
| Geo | no PostGIS; bbox on indexed lat/lng; R*Tree allowed in workerd (spike) | PostGIS available (Supabase/Neon extension) |
| Row-level security | none; enforce in Hono middleware | Postgres RLS (Supabase built around it) |
| Size ceiling | 10 GB per DB, hard | far larger |
| Lock-in | SQLite dialect is portable; D1 binding, Time Travel, Sessions API are CF-only | standard Postgres, portable; Hyperdrive optional |
| Ops surface | one vendor, one bill, one wrangler | two vendors, a connection string secret, an extra failure domain |

### Inference
- At guia.la's likely scale (thousands of POIs, schedules, tides per destination), D1's 10 GB cap and single-thread throughput are not binding. A full scan of a 5k-row `places` table costs 5k rows read against 25 B included per month.
- Multi-destination fits either one DB with a `destination_id` column or one DB per destination. D1 explicitly favours per-tenant DBs, but per-DB migrations multiply operations work. Start with one DB plus `destination_id`. Revisit only if a destination needs data isolation or contractual export.
- For geo, use `lat`/`lng` REAL columns with an index on `(destination_id, lat)`. Run a bbox `WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?`, then compute Haversine in JS or with D1 math functions. This is enough for "near me" queries over small sets. Avoid R*Tree unless measured need appears, because virtual tables break `wrangler d1 export`.
- Without RLS, every public/private visibility rule must live in API code and tests. This matters for cotiju issues #59 and #65 (visibility, cache privacy). The tests must cover each route plus cache headers.
- Lock-in is modest: Drizzle schema plus SQLite dialect can move to Turso or libSQL, or to Postgres with a schema port. Time Travel has no portable equivalent, so plan the R2 export job from day one.
- Cron in UTC plus up to 15 minutes of propagation is fine for daily tide and boat imports. It is not fine for anything needing minute accuracy right after a deploy.
- Use the Free plan only for previews. Production needs Paid: 10 ms CPU, 50 queries per invocation and 500 MB DB are too tight.

### Unverified / needs spike
- D1 read replication GA status and production readiness. Docs last record a public beta (2025-04-10). Inferred: not needed for a Brazil-only audience initially.
- Whether R*Tree `CREATE VIRTUAL TABLE ... USING rtree` works on remote D1, not only in workerd local. Source allows it; D1 docs silent. Spike: create, query, and confirm export fails.
- Time Travel restore to a new DB (fork) is not available today per docs wording. Verify before relying on it for staging refreshes.
- Drizzle 1.0 RC migration format changes vs 0.45 stable for D1. Pick one and pin it. Inferred risk: the RC churns until GA.
- Real Workers CPU per request for SSR/API of an Expo Router web build has not been measured.

## 2. Store policies: one flagship app vs per-destination apps

### Confirmed (with source)
Apple App Review Guidelines, "Last Updated: October 16, 2026" (https://developer.apple.com/app-store/review/guidelines/):
- **4.2.6:** "Apps created from a commercialized template or app generation service will be rejected unless they are submitted directly by the provider of the app's content." Such services "should not submit apps on behalf of their clients".
  - Acceptable alternative: "a single binary to host all client content in an aggregated or 'picker' model". Apple's examples are a restaurant finder with per-client pages, or an event app with per-event entries.
- **4.3(a):** "Don't create multiple Bundle IDs of the same app (for example, submitting a separate map app for every city in the world instead of a single worldwide map that allows users to search any city)". For location variants it says to "consider submitting a single app".
- **4.3(b):** no apps "indistinguishable from what's already widely available".
- **4.2 / 4.2.2:** an app must go beyond "a repackaged website". Other than catalogs, apps shouldn't be primarily "web clippings, content aggregators, or a collection of links".

Google Play, "Best Practices for White Label Developers" (https://support.google.com/googleplay/android-developer/answer/15884185):
- Recommends **decentralized accounts**: one developer account per client. Under a centralized account, "policy issues with one app can negatively impact all other apps", up to suspension or termination of the account.
- Each app needs a unique description, icon, screenshots and feature graphic. It lists reused descriptions, screenshots and graphics as common violations. Locale-specific apps should show the locale in the icon.
- Explain "why it's different from other versions (for example, regional variations)". Reviews take "typically ... within 7 days".

Google Play Spam policy, Repetitive Content (https://support.google.com/googleplay/android-developer/answer/9899034):
- Violations include "Creating multiple apps with highly similar functionality, content, and user experience. If these apps are each small in content volume, developers should consider creating a single app that aggregates all the content."
- The same page bans webview-only apps of a site without permission. That does not apply when guia.la owns the site, but 4.2 still requires app-like value on iOS.

### Inference
- **One flagship store app** ("guia.la" with a destination picker or deep-link selection) matches Apple's explicit "picker model" and 4.3(a). It also matches Google's "single app that aggregates" advice. Lowest review risk, one bundle ID, one review queue, one set of store assets.
- **Per-destination store apps published by guia.la** match the exact pattern 4.2.6 and 4.3(a) reject: a template service submitting for clients, and one app per city. High rejection risk on iOS. On Play, one centralized account puts every destination at risk from a single violation.
- **Per-destination apps are viable only if** the destination's own organization is the content provider and submits under its own Apple and Play developer accounts. Each app also needs distinct content, listing and assets. That turns guia.la into a tooling provider, with heavy support cost for a small team.
- **White-label branding without store risk:** keep per-destination branding on the **web**, with a subdomain or custom domain per destination served from the same Expo Router web build. Theme the flagship app per destination at runtime. Recommend: one flagship native app plus white-label web; defer per-destination native binaries until a partner asks and owns the account.
- Cotijuba-only content at launch is a thin catalog. Show offline schedules and tides, maps, and native features in review notes to clear 4.2 Minimum Functionality.

### Unverified / needs spike
- How Apple treats a flagship app whose runtime theme fully rebrands per destination. Inferred acceptable under the picker model, but not tested. Ask App Review early via a TestFlight external build.
- Whether Play's white-label guidance treats a single multi-destination app as "white label" at all. Inferred: no, it is a normal aggregator app.

## 3. Starters

### Confirmed (with source; GitHub API and raw package.json, fetched 2026-11-22)
Current Expo SDK on npm: `latest` = 58.0.26. SDK 58.0.0 was published 2026-09-29; SDK 57 on 2026-06-30, SDK 56 on 2026-05-20, SDK 55 on 2026-02-25 and SDK 54 on 2025-09-10 (`npm view expo time`).

| | infinitered/ignite | obytes/react-native-template-obytes | t3-oss/create-t3-turbo |
|---|---|---|---|
| Latest release | v11.5.0, 2026-03-18 | v9.0.0, 2026-01-27 | no GitHub releases |
| Last default-branch commit | 2026-11-11 (docs); last code release 2026-03-18 | 2026-06-02 (splash fix) | 2025-12-12 ("bump react") |
| repo `pushed_at` | 2026-11-11 | 2026-10-08 | 2026-11-20 (branch/PR activity, not main) |
| Stars / open issues+PRs | 19,953 / 40 | 4,377 / 8 | 6,114 / 66 |
| License (GitHub) | NOASSERTION | MIT | MIT |
| Expo SDK in template | 55 (`expo 55.0.5`, RN 0.83.2) | 54 (`expo ~54.0.32`, RN 0.81.5) | 54 (`expo ~54.0.20`, RN ~0.81.5) |
| Router | React Navigation 7 (no expo-router in deps) | expo-router ~6 | expo-router ~6 |
| Web | `react-native-web`, `expo export --platform web` scripts | `react-native-web`, `expo start --web` | Expo app native-focused; web is separate `apps/nextjs` and `apps/tanstack-start` |
| Notable inclusions | CLI generators, i18next, MMKV, apisauce, Jest + RNTL, **Maestro flows**, dependency-cruiser, EAS local build scripts | pnpm, Uniwind (Tailwind), TanStack Query + Form, zod, zustand, i18next, MMKV, FlashList, Husky + commitlint, env-validated `APP_ENV` profiles, EAS scripts, **Maestro**, Jest | Turborepo monorepo, tRPC, Better Auth, Drizzle + `@vercel/postgres`, NativeWind 5 preview, shared `packages/{api,auth,db,ui,validators}` |

Sources: https://github.com/infinitered/ignite (`boilerplate/package.json`), https://github.com/obytes/react-native-template-obytes (`package.json`), https://github.com/t3-oss/create-t3-turbo (`apps/expo/package.json`, `packages/db/package.json`).

### Inference
- All three lag the current SDK (58): Ignite by 3 SDKs, obytes and t3 by 4. Adopting any of them means an immediate multi-SDK upgrade. The official `create-expo-app` template tracks the current SDK by construction.
- **Ignite:** the most maintained brand, but it is built on React Navigation rather than Expo Router, which conflicts with the proposed stack. Its generators and MobX-era opinions add surface agents must learn. Borrow: `.maestro/` flow layout, the dependency-cruiser config idea, and the EAS profile naming.
- **obytes:** closest match to the stack: Expo Router, web, EAS, Maestro and env profiles. But it is SDK 54, has had no code since June, and is heavily opinionated (Uniwind, antfu eslint, Husky, react-query-kit). Borrow: the env-validation pattern (`APP_ENV` plus `STRICT_ENV_VALIDATION` at prebuild), `app.config` per environment, the `check-all` script, and Maestro `APP_ID` parameterisation. These map to per-destination build variants.
- **create-t3-turbo:** main has been stale for about 11 months, has 66 open issues and PRs, and is on SDK 54. It targets Next.js web plus Postgres/Vercel plus tRPC, not Workers/D1 or Expo web. Borrow only the monorepo layout idea (`packages/validators` with zod shared between the app and the Hono API) and the pnpm catalog usage.
- **Recommendation:** start from official `create-expo-app` (default or tabs template, Expo Router, TypeScript). Hand-port the small patterns listed above. Add a separate `api/` Hono Worker with Drizzle D1. Fewer inherited dependencies mean fewer SDK-upgrade conflicts for agents.

### Unverified / needs spike
- Whether Ignite's CLI offers an Expo Router option at generation time. I checked only the boilerplate's dependencies.
- The exact contents of the current `create-expo-app` default template for SDK 58. Not fetched here, because it is out of this slice. Verify with `npx create-expo-app@latest --template` and the Expo docs.
- Ignite license shows `NOASSERTION` in the GitHub API. Inferred: MIT in the repo text. Verify the LICENSE file before copying code.
