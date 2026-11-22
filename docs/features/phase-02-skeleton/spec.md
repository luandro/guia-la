# Spec: Phase 02 walking skeleton — Places list/detail journey

- **Intent:** [intent.md](intent.md)
- **Requirements:**
  - `packages/core` exports `Place`, `Category`, `Destination`, `Locale` types
    plus zod schemas matching the fixture contract (Phase 01 JSON shape).
  - `packages/core` exports
    `resolveContent(place, locale, defaultLocale) → { name, summary, locale,
    isFallback, machineTranslated }`; fallback to the default locale is marked
    (`isFallback: true`), machine translation is carried through.
  - `@guia-la/fixtures` `loadDestination(id)` parses the destination's JSON
    with the zod schemas and returns a Result (`{ ok: true, … }` or
    `{ ok: false, error: { message } }`); malformed fixture data never throws
    into UI code.
  - i18n layer chosen by spike ([i18n-spike.md](i18n-spike.md)) with UI
    catalogs for en, pt-BR, es, fr, nl, de under `apps/app/src/i18n/`; zero
    hardcoded user-facing strings in app code.
  - `tools/i18n-check` compares every locale catalog against the `en`
    reference; a missing or extra key fails naming locale and key; wired as
    root script `i18n:check` inside `check`.
  - `apps/app/app.config.ts`: explicit `web.output: "static"`, name/slug
    guia.la pilot values, config-time zod validation of `APP_ENV`
    (development|preview|staging|production) and `APP_VARIANT`
    (flagship|cotijuba-web|serra-web); missing variable → build-time throw
    naming it. `APP_VARIANT` selects the destination fixture set
    (cotijuba-web→cotijuba, serra-web→serra, flagship→cotijuba) via
    `expo.extra`.
  - Routes (journey replaces the template demo screens; root layout kept):
    `index.tsx` (locale links), `[locale]/places/index.tsx` (list),
    `[locale]/places/[slug].tsx` (detail); `generateStaticParams` over
    6 locales × places; `generateMetadata` emits title, description,
    og:title, og:description, og:locale and hreflang alternates for all six
    locales. No `<Head>` (broken in SDK 58 static). Unknown locale/slug →
    branded `+not-found.tsx`.
  - States on both screens: bounded loading (label + deadline, then error —
    never an unbounded spinner), empty (explanation), error (retry), offline
    hint. State logic lives in a pure reducer with unit tests.
  - Fallback content shows a visible translated "showing original (pt-BR)"
    marker; machine-translated content shows a "machine translated" marker.
  - `scripts/s1-assert.sh` asserts `dist/index.html` plus `<title>`,
    `og:title`, `og:description` and six hreflang links in the raw HTML of
    every locale's list page and every detail page; prints counts; root
    script `s1` = export + assert. Result and ×6 measurements recorded in
    [s1-result.md](s1-result.md).
  - `apps/app/eas.json` with development/preview/production profiles setting
    `APP_ENV`/`APP_VARIANT` (files only; never built).
- **Design:** zod schemas are the single authority for the fixture contract;
  the loader is the only seam that touches fixture JSON (consumed, not
  imported ad hoc). Metadata comes from `generateMetadata`
  (`Metadata` from `expo-router/server`, re-exported from `expo-server`).
- **i18n:** all six catalogs required for every UI string; content i18n rides
  the fixture `content` map with marked fallback (D-14). Route locale drives
  the catalog; `hreflang` alternates cover all six locales.
- **Flags:** none. Aligned with SPEC.md §10a and ADR-0016.
