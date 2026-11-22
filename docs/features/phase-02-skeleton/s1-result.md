# S1 result: static export raw-HTML SEO (02-10, evidence for D-03)

Date: 2026-11-22 (re-measured after the PR #14 review fixes) · Stack:
Expo 58.0.26, expo-router 58.0.32, React 19.3.0,
`web.output: "static"`, asyncRoutes at SDK 58 default (web: on).
Original runs: Node 24.13. Re-measurement: Node 22.22.3 (the recording
sandbox refused Node 24 in every form; the export pipeline is identical,
timings are comparable but not bit-for-bit).

## Verdict: **GO** for D-03 (recommended)

`generateMetadata()` (never `<Head>`) emits `<title>`, `og:title`,
`og:description`, `og:locale` + `og:locale:alternate`, and hreflang
`<link>`s for all six locales into the raw HTML of every static page —
list, detail and root — with no JavaScript involved. The exported HTML also
carries the rendered content itself (place names, summaries, fallback and
machine-translation markers, Intl-formatted dates), because the journey
state seeds synchronously from the fixture loader at render time. A custom
`src/app/+html.tsx` shell sets `<html lang>` to each page's route locale
(the default Expo shell hard-codes `en`).

## What was measured

Variant: `APP_VARIANT=cotijuba-web` (7 places × 6 locales).

| Metric | Value |
| --- | --- |
| HTML files in `apps/app/dist` | **53** |
| — journey pages (root + 6 lists + 42 details) | 49 |
| — extras (dynamic-route shells, `+not-found.html`, `_sitemap.html`) | 4 |
| Export wall time, run 1 (warm Metro cache) | **7.0 s** |
| Export wall time, run 2 (warm Metro cache) | **7.5 s** |
| Page size per journey page | ~21–23 KB raw HTML |

Not re-measured after the fixes: the first-export cold-cache time (15.0 s
pre-fix, Node 24.13); the post-fix cold run was consumed by the 11-place
probe and not timed.

The ×6 locale cost is the table above: 48 locale-prefixed journey pages for
7 places, produced in a single-digit-second warm export. Extrapolating the
content model (roughly: pages ≈ 1 + L × (1 + places), L = 6) stays cheap at
pilot scale; a 100-place destination would be ~607 pages per export, still
a single `expo export` run — rebuild-on-publish is the operating cost D-03
already accepts (every content change requires a re-export). The list pages
render every place row (plain `ScrollView` + map, no virtualization), so
all detail links reach the raw HTML at any place count — verified with a
temporary 11-place fixture (77 routes) before restoring the real 7.

## Exact commands

```bash
pnpm export:web        # APP_ENV=development APP_VARIANT=cotijuba-web \
                       #   expo export -p web  (from apps/app)
./scripts/s1-assert.sh # raw-HTML assertions over apps/app/dist
pnpm s1                # both, wired as one root script
```

`scripts/s1-assert.sh` output (current state):

```text
s1-cluster: OK — 49 journey pages (og form, hreflang cluster + reciprocity,
  per-locale <html lang>, full list links)
s1-assert: OK — 49 journey pages checked against
  packages/fixtures/cotijuba/places.json (title, og:title, og:description,
  og:locale, 6 hreflang each); 53 HTML files total in apps/app/dist
```

`s1-cluster-check.mjs` (called by s1-assert) additionally proves, per page:
og:locale values in OG form (`xx_YY`, no hyphen — catches a BCP-47 leak),
the hreflang cluster shape below, reciprocal return links for every
annotation, `<html lang>` equal to the page's locale, and a raw-HTML link
from every list page to every detail slug (the virtualization check).

Served check (raw HTML over HTTP, no JS): `npx serve apps/app/dist -l 4173`,
then a fetch of `/pt-BR/places/praia-da-ponta-norte` returned 200 with
`<title>Praia da Ponta Norte — Cotijuba</title>`,
`og:locale` `pt_BR`, 7 hreflang links (6 locales + `x-default`) and the
place content in the body. (curl was sandbox-blocked in the recording
session; the equivalent Node `fetch` script produced the evidence — the
bytes served are identical.)

Sample of the asserted raw HTML (pt-BR detail):

```html
<html lang="pt-BR">
…
<title>Praia da Ponta Norte — Cotijuba</title>
<meta property="og:title" content="Praia da Ponta Norte — Cotijuba" />
<meta property="og:description" content="Praia calma na ponta norte da ilha; na maré baixa formam-se bancos de areia." />
<meta property="og:locale" content="pt_BR" />
<link rel="alternate" href="/en/places/praia-da-ponta-norte" hreflang="en" />
<!-- … all six locales … -->
<link rel="alternate" href="/pt-BR/places/praia-da-ponta-norte" hreflang="x-default" />
```

## hreflang cluster shape (PR #14 review decision)

- **List pages** (`/<locale>/places`): six locale links to each other,
  `x-default` → `/` (the language picker). `/` lists the six list pages
  back and declares no `x-default` of its own — it *is* the target.
- **Detail pages**: six locale links, `x-default` → the **destination
  default-locale** detail page (`pt-BR` today). Chosen over the en page
  because pt-BR is the content every locale falls back to
  (`destination.defaultLocale` drives it, so a future destination with a
  different default needs no code change).
- Every annotation is reciprocal (each target lists the source back);
  s1-cluster-check fails the export if any return link is missing.

## Honest limitations

- **hreflang URLs are root-relative** (`/pt-BR/places/...`), not absolute.
  No deploy origin is pinned yet (D-01: `guia.la` unowned; pilot web deploy
  targets `cotiju.app` in a later phase), and fabricating an absolute URL we
  do not own would be worse. The metadata `alternates.languages` values pass
  through verbatim, so absolutizing them is a one-line change per deploy
  profile once the origin is fixed — revisit in the Phase 04 deploy work and
  in the D-03 ADR note.
- **Four extra HTML files** (`[locale]/places.html`,
  `[locale]/places/[slug].html`, `+not-found.html`, `_sitemap.html`) ship in
  `dist` as route shells; s1-assert does not check them (they are not
  journey pages). Cloudflare Workers `not_found_handling = "404-page"` (S4,
  untested here) will want `+not-found.html`.
- **Warm-cache timings only.** The 5.6/7.9 s runs had Metro's cache warm; a
  clean-clone first export will be slower (the 15 s run approximates it).
- **Interactivity still needs JS** (links are anchors in raw HTML; router
  navigation hydrates). Raw-HTML *reading* and link-preview cards work
  without it — which is what S1 was for.
- Measured on this dev machine only; CI timings will differ.

## Notes for the D-03 ADR update (PR 02-14)

S1 passed: static `generateMetadata` output is real per-locale raw HTML on
SDK 58. Status `validated` (not `approved` — that call is the owner's).
Rebuild-on-publish remains the accepted trade-off; the fallback (Hono share
pages) stays parked unless a later phase breaks these assumptions.
