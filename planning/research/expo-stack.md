# Expo client stack: verification (as of 2026-11-21)

Scope: client-side stack slice for guia.la (Expo + RN + RN Web + Expo Router + TS, maps, offline, Storybook, Expo/EAS CI, build-time exclusion).
Method: npm registry (`npm view`, run 2026-11-21/22 UTC), Expo docs served as Markdown (`Accept: text/markdown`), official changelogs, Cloudflare docs, Storybook source docs.
DeepSeek Search/Fetch returned HTTP 402 (balance exhausted), so every claim here comes from a primary page that was fetched directly.
Naming note: Expo renamed "EAS" services to "Expo Build / Expo Update / Expo Workflows / Expo Hosting"; the `eas` CLI, `eas.json` and `/eas/` doc URLs keep the old name ([pricing.md](https://expo.dev/pricing.md)).

---

## 1. Confirmed (with source)

### 1.1 Versions (npm `latest` dist-tag and Expo SDK 58 `bundledNativeModules.json`)

| Package | Current stable | SDK 58 pin | Source |
|---|---|---|---|
| expo | 58.0.26 (58.0.0 published 2026-09-29) | n/a | `npm view expo` |
| SDK 58 announcement | 2026-10-15 | n/a | [expo.dev/changelog/sdk-58](https://expo.dev/changelog/sdk-58) |
| react-native | 0.88.1 (next: 0.89.0-rc.2) | 0.88.1 | npm + [bundledNativeModules.json](https://unpkg.com/expo@58.0.26/bundledNativeModules.json) |
| react / react-dom | 19.3.1 | 19.3.0 | same |
| react-native-web | 0.21.4 (2026-10-08); 0.22.0 canaries daily | ~0.21.4 | same |
| expo-router | 58.0.32 | ~58.0.32 | same |
| expo-maps | 58.0.11 | ~58.0.11 | same |
| react-native-maps | 1.29.11 | 1.29.11 | same |
| expo-sqlite | 58.0.18 | ~58.0.18 | same |
| react-native-reanimated / worklets | n/a | 4.7.1 / 0.13.0 | same |
| expo-server (server adapters) | 58.1.0 | n/a | `npm view expo-server` |
| eas-cli | 27.11.0 | n/a | `npm view eas-cli` |
| @storybook/react-native (on-device) | 10.7.2 (next 11.0.0-next.2) | n/a | `npm view` |
| storybook / @storybook/react-native-web-vite | 10.6.8 (next 11.0.0-beta.3) | n/a | `npm view` |
| @maplibre/maplibre-react-native | 11.5.1 (peer: expo >=54, RN >=0.80, React >=19.1) | n/a | `npm view` |
| maplibre-gl (web) | 6.19.0 | n/a | `npm view` |
| @vis.gl/react-maplibre | 8.1.3 (peer maplibre-gl >=4) | n/a | `npm view` |
| workbox-cli | 7.4.1 | n/a | `npm view` |

SDK 58 facts ([changelog](https://expo.dev/changelog/sdk-58)):
- It ships React Native 0.88 and is built for iOS 27. It needs Node 22.13+, 24.3+ or 26+; odd-numbered Node releases are unsupported.
- At announcement, `create-expo-app` still created SDK 57 projects until the new Expo Go shipped. The SDK 58 template was `npx create-expo-app --template default@sdk-58`.
- RN 0.87 made the Strict TypeScript API the default. Deep imports from `react-native/Libraries/*` are now type errors. The opt-out (`customConditions: ["react-native-legacy-deep-imports"]`) is "set to be removed after React Native 0.89".
- Removed APIs: `InteractionManager`, the `Touchable` root export, the `Modal` `animated` prop, and some `StatusBar` props. `ImageBackground` is deprecated.
- R8 minify is on by default in Android release builds. Libraries that use reflection may need keep rules.
- Expo CLI now forces `NODE_ENV` to development or production. For example, `NODE_ENV=test` loads `.env.development`. Every non-Debug build, including a custom "Staging" config, uses production.
- expo-sqlite: libSQL support is removed. `configureWeb()` loads your own wa-sqlite WASM build, for example to get FTS on web.
- `@expo/metro-config` now records inlined `EXPO_PUBLIC_*` values in the transform cache. Changing a value invalidates the cached output (#47750).

### 1.2 New Architecture
- "SDK 55 and later run entirely on the New Architecture... always enabled and cannot be disabled." The legacy architecture was frozen in June 2025 ([guide](https://docs.expo.dev/guides/new-architecture/)).
- Consequence: every native dependency (maps, storage, Storybook peers) must support the New Architecture. There is no `newArchEnabled: false` escape hatch on SDK 55+.

### 1.3 Expo Router web output modes

| `web.output` | What it produces | Hosting | Source |
|---|---|---|---|
| `single` | SPA: one `index.html` | any static host | [Expo Hosting intro](https://docs.expo.dev/eas/hosting/introduction/) |
| `static` | one HTML file per route at export time; `generateStaticParams` for dynamic routes; data loaders run at build time | any static host; "not a single-page application", no SPA redirects needed | [static-rendering](https://docs.expo.dev/router/web/static-rendering/) |
| `static` + `apiRoutes: true` (expo-router plugin, SDK 58+) | prerendered HTML plus API routes in `dist/server`, client assets in `dist/client` | needs a deployed server | same, and [migrate 57 to 58](https://docs.expo.dev/router/migrate/sdk-57-to-58/) |
| `server` | SDK 58: renders HTML **on every request** (SSR is stable, no flag). `dist/client` + `dist/server/_expo/server/render.js` | needs `expo-server` adapter or Expo Hosting | [server-rendering](https://docs.expo.dev/router/web/server-rendering/) |

- The default changed in SDK 58, and the official pages contradict each other.
  - The changelog says Router projects "use `web.output: "server"` when `web.output` is not set" ([changelog](https://expo.dev/changelog/sdk-58)).
  - [Publish websites](https://docs.expo.dev/guides/publishing-websites/) says the default and tabs templates set `"server"`, and that omitting the field still falls back to `single`.
  - Either way, **set `web.output: "static"` explicitly**.
- Async routes on web are on by default in SDK 58. Each route becomes its own JS chunk. Turn this off with `asyncRoutes: { web: false }`.

**Per-route `<head>` metadata and OG tags in raw HTML (no JS):**
- SDK 58+: export `generateMetadata()` (type `Metadata` from `expo-router/server`) from a route.
  - In `static` mode, Expo CLI resolves it **at build time for each static path**.
  - The function gets `undefined` as its request and the route params ([static-rendering](https://docs.expo.dev/router/web/static-rendering/)).
- The documented fields include `title`, `description` and `openGraph: { title, description, images }` ([server-rendering, Metadata](https://docs.expo.dev/router/web/server-rendering/)).
- **Breaking:** in SDK 58 static mode, `<Head>` from `expo-router/head` is **no longer included in the initial static HTML**. It only updates tags after hydration ([migrate 57 to 58](https://docs.expo.dev/router/migrate/sdk-57-to-58/)). Older blog posts and templates that use `<Head>` for OG tags are now wrong.
- A custom `app/+html.tsx` **must** render `headNodes` and `bodyNodes` from `useServerDocumentContext()`. If it does not, the metadata, styles and bundles are missing.
- `public/` is copied into `dist/`, for example `.well-known/apple-app-site-association`. `/assets` is a reserved path.

### 1.4 Deploying the web build to Cloudflare
- Cloudflare's own docs say Pages is legacy for new projects: "Are you sure you want to use Pages?... Start new projects with Workers" ([pages](https://developers.cloudflare.com/pages/)).
- Workers Static Assets for SSG: set `assets.directory`, plus optional `not_found_handling = "404-page"` or `"single-page-application"` and `html_handling` ([SSG guide](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/), [static assets](https://developers.cloudflare.com/workers/static-assets/)).
- Requests for static assets are free, as on Pages ([migrate from Pages](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)).
- A `_headers` file in the assets directory sets custom headers ([headers](https://developers.cloudflare.com/workers/static-assets/headers/)). Use it for the COOP and COEP headers that expo-sqlite web needs (see 1.6).
- Static export → `wrangler deploy` with `assets.directory = "./dist"` is the documented SSG path; Expo lists Cloudflare Pages among valid static hosts ([static-rendering](https://docs.expo.dev/router/web/static-rendering/)).
- SSR or API routes on your own Cloudflare account:
  - `expo-server@58.1.0` ships `adapter/workerd` and `environment/workerd` modules (package file listing on unpkg).
  - The Expo docs document only the Bun, Express, Netlify and Vercel adapters. They warn: "Third-party adapters are subject to breaking changes. We have no continuous tests against them." ([api-routes](https://docs.expo.dev/router/web/api-routes/)).
- **Expo Hosting (formerly EAS Hosting)** is the alternative.
  - It runs on the Cloudflare Workers runtime with partial Node support and supports `single`, `static` and `server` output. Deploy with `eas deploy`. PR preview URLs are available ([intro](https://docs.expo.dev/eas/hosting/introduction/)).
  - Free plan: 100k requests/month, 1M CPU-ms, 10 CPU-ms per request, 10 subrequests, no custom domain.
  - Paid plans: $2 per 1M requests beyond the allowance and 1 custom domain per project ([pricing.md](https://expo.dev/pricing.md)).

### 1.5 Maps

| Library | Platforms (Expo docs) | Notes |
|---|---|---|
| `expo-maps` | Android, iOS (no web) | Apple Maps on iOS only (iOS 17+; some tap callbacks need iOS 18). Google Maps on Android only; Google Maps on iOS is unsupported ([maps](https://docs.expo.dev/versions/latest/sdk/maps/)) |
| `react-native-maps` 1.29.11 | Android, iOS, in Expo Go (no web listed) | Google on Android; Apple or Google on iOS ([map-view](https://docs.expo.dev/versions/latest/sdk/map-view/)) |
| `@maplibre/maplibre-react-native` 11.5.1 | Android, iOS (MapLibre Native) | open-source vector or raster tiles, no vendor key; peer `expo >=54` (npm) |
| `maplibre-gl` 6.19 + `@vis.gl/react-maplibre` 8.1.3 | web | DOM or WebGL library, so it must sit behind a `.web.tsx` split |

- Platform split rules ([platform-specific modules](https://docs.expo.dev/router/advanced/platform-specific-modules/)):
  - Inside `src/app`, `.web.tsx` or `.native.tsx` route files are allowed **only if a non-platform version also exists**.
  - Outside `app/`, `components/Map.tsx` + `Map.web.tsx` + `Map.native.tsx` is the supported pattern.
- Platform shaking removes `Platform.OS` branches only when `Platform` is imported directly from `react-native` in that file ([tree-shaking](https://docs.expo.dev/guides/tree-shaking/)). File extensions are the more reliable way to split.

### 1.6 Offline
- `expo-sqlite` platforms: Android, iOS, macOS, tvOS, **Web** ([sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)).
- Web needs two changes. In Metro, push `wasm` to `resolver.assetExts`. Production must send `Cross-Origin-Embedder-Policy: credentialless` and `Cross-Origin-Opener-Policy: same-origin` headers, which `SharedArrayBuffer` requires.
- Service worker / PWA: Expo has no built-in service worker. Expo docs recommend running Workbox CLI after `npx expo export -p web`. They warn that a service worker which caches aggressively can stop users from receiving updates ([PWA guide](https://docs.expo.dev/guides/progressive-web-apps/)).

### 1.7 Storybook
- On-device: `@storybook/react-native` 10.7.2.
  - The README says "align your storybook dependencies to the same major version" ([README v10](https://github.com/storybookjs/react-native/blob/next/README.md)).
  - Config lives in `.rnstorybook/`. Wrap Metro with `withStorybook()`.
  - **The recommended Expo Router setup is entry-point swapping**: run with `STORYBOOK_ENABLED=true`. Without the variable, "zero Storybook code in the bundle".
  - The `app/storybook.tsx` route (Metro wrapper `@storybook/react-native/metro/withStorybook`, `Stack.Protected`) is "fully supported but not the preferred setup" because it ships in the app bundle ([Expo Router setup](https://storybookjs.github.io/react-native/docs/intro/getting-started/expo-router)).
  - Peers: `storybook ^10.5.4`, RN >=0.72, reanimated >=3, gesture-handler >=2, `@gorhom/bottom-sheet >=4`, safe-area-context (npm).
- Web: `@storybook/react-native-web-vite` 10.6.8.
  - It is Vite-based. Peers: `react-native-web ^0.19.12 || ^0.20 || ^0.21`, RN >=0.74.5, Vite 5–8 (npm).
  - The Storybook docs recommend using **both**. `npm create storybook` has a "Both" option that configures on-device and web from the same CSF stories. Web gives sharing, MDX docs, component, visual and a11y tests, and addons. RN Web has [compatibility limits](https://necolas.github.io/react-native-web/docs/react-native-compatibility/) ([docs source](https://github.com/storybookjs/storybook/blob/next/docs/get-started/frameworks/react-native-web-vite.mdx)).
  - The rendered page at storybook.js.org is client-side rendered and could not be fetched. The `next`-branch source already describes Storybook 11 behaviour (server-side docgen). 11 is still beta.

### 1.8 Expo Build / Workflows: pricing and Maestro ([pricing.md](https://expo.dev/pricing.md), retrieved 2026-11-21)

| | Free | Starter $19/mo | Production $199/mo |
|---|---|---|---|
| Builds | 15 Android + 15 iOS per month, **low-priority queue** (peak waits of 90+ min) | $45 credit | $225 credit |
| Build timeout | 45 min | 2 h | 2 h |
| Concurrency | 5 (max 1 macOS) | 5 (max 2 macOS) | 15 (max 10 macOS) |
| Workflows CI minutes (non-build jobs) | 60 min | usage-based | usage-based |
| **Maestro E2E jobs** | **not available ("—")** | $0.05/job + CI minutes | same, plus Maestro insights |
| Updates MAU | 1k | 3k | 50k |
| Cloud Simulators | "coming soon" | $0.10/min (60 min/month included until 2027) | same |

- Overage: Android build $1 (medium) or $2 (large); iOS build $2 or $4.
- Workflow minutes per minute: Linux medium $0.018, Linux medium with nested virtualization $0.020, macOS medium $0.075, macOS large $0.150.
- The Free plan cannot incur overage ([plans](https://docs.expo.dev/billing/plans/)).
- Maestro on Workflows: `.maestro/*.yml` flows, an `e2e-test` build profile, and a workflow at `.eas/workflows/e2e-test-{android,ios}.yml`. Run it with `eas workflow:run ... --non-interactive --wait --json`. It runs on PRs only when the GitHub repo is linked in the Expo dashboard ([e2e-tests](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)).
- Workflows support fingerprint-based skipping of native builds (repack plus update when the fingerprint is unchanged). The SDK 58 default fingerprint preset is "balanced" ([changelog](https://expo.dev/changelog/sdk-58)).

### 1.9 Build-time exclusion: autolinking, config, Metro
- `expo.autolinking.exclude` in **package.json**: it takes a global list or per-platform lists (`android`, `ios`, `apple`).
  - Since SDK 54 it also applies to React Native (non-Expo) modules. Before SDK 54 those needed a `react-native.config.js` file with `platforms: { android: null }`.
  - The documented locations are `package.json`, CLI options, the Podfile `use_expo_modules!` and `settings.gradle` `useExpoModules`. **app.config.js is not listed** ([autolinking](https://docs.expo.dev/modules/autolinking/)).
- `experiments.autolinkingModuleResolution` makes Metro resolve to the native modules that autolinking found. It is on by default in monorepos from SDK 55.
- App variants: `app.config.js` reads env vars such as `APP_VARIANT` to switch the name, bundle ID and package per variant ([variants](https://docs.expo.dev/build-reference/variants/)). Config plugins (and so permissions) are set per variant in the same file.
- JS code elimination ([tree-shaking](https://docs.expo.dev/guides/tree-shaking/)):
  - **Stable:** platform shaking; `__DEV__` and `NODE_ENV` folding; `EXPO_PUBLIC_*` inlining before minify, so `if (!process.env.EXPO_PUBLIC_X)` branches drop out. These run in production only.
  - Inlining works only with dot access (`process.env.EXPO_PUBLIC_X`). Bracket access and destructuring are **not** inlined ([env vars](https://docs.expo.dev/guides/environment-variables/)).
  - Inlining is not applied to server bundles or code in `node_modules`.
  - **Experimental since SDK 52 and still marked experimental:** cross-module unused import and export removal and barrel expansion. Enable with `EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1` + `EXPO_UNSTABLE_TREE_SHAKING=1`. `experimentalImportSupport` has been on by default since SDK 54. Only ESM is shaken, and modules with side effects are kept.
- Verifying that a module is absent:
  - `EXPO_ATLAS=true npx expo export --platform <p>` writes `.expo/atlas.jsonl` with every bundled module. Open it with `npx expo-atlas`. The file contains inlined env values, so treat it as secret ([analyzing bundles](https://docs.expo.dev/guides/analyzing-bundles/)).
  - `npx expo export -s external` (`--source-maps [true|false|inline|external]`) emits source maps, which list `sources` for a grep-based assertion. Verified with `npx @expo/cli@58.1.21 export --help`.
  - `--dump-assetmap` emits the asset map.

---

## 2. Inference (engineering judgement, not directly documented)

1. **Use `web.output: "static"` with `generateMetadata()`** for SEO and OG. It produces per-route HTML with OG tags and no JS needed, fits Workers Static Assets for free, and avoids the experimental workerd adapter. Dynamic tourism pages (`/places/[slug]`) need `generateStaticParams` at build time, so every content change means a rebuild and redeploy. Plan a CI trigger from the content API, or accept stale pages.
2. Per-tenant (destination) web builds fit SSG naturally. Each destination is one `expo export` into its own `dist`, deployed as its own Worker or route. Pin the metadata base URL per tenant at build time.
3. **Maps: avoid both `expo-maps` and `react-native-maps` for a white-label tourism app needing web + offline tiles.** Neither supports web, and both tie you to Google or Apple tiles and keys. MapLibre on both sides (`@maplibre/maplibre-react-native` native + `maplibre-gl` via `*.web.tsx`) shares one style JSON and tile source and allows self-hosted or offline vector tiles (for example PMTiles on R2). Cost: two component implementations behind one typed `<MapView>` contract.
4. Workbox on a static export must not precache the HTML aggressively. Use network-first for HTML and stale-while-revalidate for `_expo/static`. The COOP/COEP headers that expo-sqlite web needs can break third-party embeds and tile or image CDNs without CORP headers. Validate with `credentialless`.
5. Build-time widget exclusion needs **two independent mechanisms**:
   - JS: a generated route and widget registry with no static imports of disabled widgets. `EXPO_PUBLIC_` dot-access guards are only a second line of defence, since experimental tree shaking may not be trustworthy.
   - Native: `expo.autolinking.exclude` lives in package.json, not app.config.js. So per-destination native exclusion must generate or patch package.json before prebuild, or use a per-variant package/workspace. Plugins and permissions are handled in app.config.js by `APP_VARIANT`.
   - Assert absence with Atlas or source-map greps, and check native absence in the prebuild output (`settings.gradle`, `Podfile.lock`).
6. Free Expo tier cannot run Maestro on Workflows, and its low-priority queue (90+ min peaks) makes it unfit for per-PR gates. Realistic floor: Starter ($19/mo) for release-candidate Maestro runs. Run per-PR gates on GitHub Actions (web Playwright, Storybook tests, Android Maestro on an emulator) to control cost.
7. Pinning: commit a lockfile and use `npx expo install --check` / `expo-doctor` in CI. Pin to SDK 58.x. Expect SDK 59 around Q1 2027, likely with RN 0.89, which drops the deep-import opt-out. Do not adopt RNW 0.22 canaries.
8. Storybook: run one set of CSF stories in two runtimes. Use `react-native-web-vite` for PR visual and a11y checks and publishing, and on-device RN Storybook via entry swap for fidelity checks. Keep Storybook 10.x and do not move to 11 until it is stable and the RN package releases a matching major.

---

## 3. Unverified / needs spike

| # | Question | Why unverified | Spike / acceptance |
|---|---|---|---|
| S1 | Does `web.output: "static"` + `generateMetadata()` on SDK 58 emit `og:*` tags for **every** `generateStaticParams` path in raw HTML? | Docs describe it; it was not run here | `expo export -p web`, then `curl` / `grep og:image dist/places/*.html`; JS disabled in Playwright |
| S2 | Default `web.output` when unset (server vs single) | Changelog and Publish-websites page contradict | Irrelevant if `"static"` is set explicitly; record it in ADR |
| S3 | `expo-server/adapter/workerd` usability for SSR or API routes on our own Workers | Present in the package, not documented, "no continuous tests" | Deploy a hello-world SSR route with wrangler; otherwise keep SSG + Hono API |
| S4 | `+not-found` route → `404.html` compatible with Workers `not_found_handling = "404-page"` | Not checked | Export, deploy, `curl -I` an unknown path and expect 404 with branded HTML |
| S5 | Does `expo.autolinking.exclude` work when set from app.config.js or an env-driven package.json, and does `autolinkingModuleResolution` then make Metro fail on stray JS imports of the excluded module? | Docs only cover package.json | Two variants; diff `npx expo-modules-autolinking resolve` output and native project files |
| S6 | MapLibre RN 11.5.1 on SDK 58 / RN 0.88 New Architecture, and its offline pack API | Peer ranges look compatible; not built | Expo Build dev client for Android and iOS showing an offline region |
| S7 | Whether `react-native-maps` has any web fallback (its peer deps list `react-native-web >= 0.11`) | Expo docs list Android and iOS only | Not needed if MapLibre is chosen |
| S8 | expo-sqlite web (wa-sqlite / OPFS) under Workers `_headers` COOP/COEP, plus Safari behaviour | Not tested | Playwright WebKit and Chromium offline reload test |
| S9 | Storybook RN 10.7 and RNW-Vite 10.6 with React 19.3 / RN 0.88 / Reanimated 4.7 / Expo Router modules (vite needs `expo-*` transpilation) | Peers allow it; no build run | `npm create storybook` "Both" in the SDK 58 template, then `build-storybook` + on-device run |
| S10 | Experimental tree shaking (`EXPO_UNSTABLE_TREE_SHAKING`) stability on SDK 58 with Hermes and async routes | Docs still say experimental | Export with and without it, diff Atlas, run the E2E smoke tests |
| S11 | Expo Go for SDK 58 store availability and `create-expo-app` default template now | Changelog said "within a few weeks" of 2026-10-15 | Irrelevant if dev builds are used (recommended); check `npx create-expo-app --help` |
| S12 | Real build minutes and cost per PR on Expo Workflows (Android Maestro on Linux nested virtualization) | Pricing known; durations unknown | Time one workflow run and extrapolate per month |
| S13 | GitHub Actions emulator-based Maestro as a free per-PR alternative | Outside Expo docs | Prototype a workflow; measure flake rate |

---

## 4. Deprecations and pinning risks (SDK 58)

| Item | Risk | Source |
|---|---|---|
| `expo-router/head` `<Head>` no longer in static HTML | SEO and OG silently missing if old patterns are copied | [migrate 57 to 58](https://docs.expo.dev/router/migrate/sdk-57-to-58/) |
| `web.output: "server"` semantics changed (SSR per request rather than prerender) | Configs copied from SDK 57 behave differently | [changelog](https://expo.dev/changelog/sdk-58) |
| `expo-router/react-navigation` forked API mostly removed; `withLayoutContext` → `integrateWithRouter` | Custom navigators break | changelog |
| Web safe areas: Router no longer provides insets on web | Use CSS `env(safe-area-inset-*)` | changelog |
| RN Strict TS API; deep-import opt-out removed after RN 0.89 | Libraries with deep imports fail type-checks on the next SDK | changelog |
| expo-sqlite libSQL removed; `useLibSQL` is a no-op | Do not plan on libSQL sync | changelog |
| `expo-file-system` `File.write()` now async | Offline cache code | changelog |
| `NODE_ENV` forced; Staging builds load the production `.env` | Per-tenant env files must use `APP_VARIANT`, not NODE_ENV | changelog |
| R8 on by default (Android) | Reflection-based libraries need keep rules | changelog |
| Storybook 11 beta; docgen moves server-side and the builder docgen is deprecated (removed in SB12) | Major-version churn soon | [RNW-vite doc source](https://github.com/storybookjs/storybook/blob/next/docs/get-started/frameworks/react-native-web-vite.mdx) |
| Cloudflare Pages de-emphasised for new projects | Prefer Workers Static Assets | [CF Pages](https://developers.cloudflare.com/pages/) |
| Free Expo plan: no Maestro, 45 min timeout, low queue | CI design | [pricing.md](https://expo.dev/pricing.md) |

## Open Questions
- Every row in section 3 is open. Items S3, S5 and S10 are inferred to be the highest risk for the "strict per-build widget exclusion" and "SEO/OG on Cloudflare" requirements.
