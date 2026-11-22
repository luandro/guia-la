# S1 result: static export raw-HTML SEO (02-10, evidence for D-03)

Date: 2026-11-22 (re-measured after the PR #14 review fixes and review
round B) · Stack: Expo 58.0.26, expo-router 58.0.32, React 19.3.0,
`web.output: "static"`, asyncRoutes at SDK 58 default (web: on).
Original runs: Node 24.13. Re-measurements: Node 22.22.3 (both recording
sandboxes refused Node 24 in every form; the export pipeline is identical,
timings are comparable but not bit-for-bit).

## Verdict: **GO recommended, pending the owner's link-preview check**

One ADR-0004 evidence item is outstanding and is the owner's, not a code
gate: the **manual WhatsApp/link-preview check has not been done**. A
Playwright JS-disabled run was **not done** either — the raw-HTML-over-HTTP
half of the "curl or Playwright" option is covered below (served-bytes check
over real HTTP; curl itself was again sandbox-blocked, see "Outstanding
checks"). Everything machine-checkable ran and passed, including a measured
—not extrapolated — 1k-page rebuild (next section).

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

### Measured at 1k pages (review round B)

Instead of extrapolating, a temporary synthetic fixture with **166 places**
was generated (valid ids/slugs/categories/dates, pt-BR content), swapped
into `packages/fixtures/cotijuba/places.json`, exported, asserted, and
restored byte-identical via `git restore` (nothing synthetic was committed).

| Metric | Value |
| --- | --- |
| Journey pages exported | **1003** (1 root + 6 lists + 6 × 166 details) |
| Static routes / HTML files in `dist` | 1007 (incl. 4 route shells) |
| Export wall time, run 1 (warm Metro cache) | **35.8 s** |
| Export wall time, run 2 (warm Metro cache) | **30.1 s** |
| s1-assert + s1-cluster over the 1003 pages | **OK** (all raw-HTML assertions) |

So the operating cost D-03 accepts (rebuild-on-publish) is ~30 s at 1k
pages on this machine, warm — no extrapolation needed. The ×6 locale cost
scales linearly: 48 locale-prefixed journey pages for the real 7 places
export in single-digit seconds (table above); 997 for 166 places in ~30 s.
The list pages render every place row (plain `ScrollView` + map, no
virtualization), so all detail links reach the raw HTML at any place count
— s1-cluster's full-list-links check passed at 166 places per list page
(~95 KB raw HTML each).

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
og:locale values in OpenGraph `language_TERRITORY` form (`en_US`, `pt_BR`;
a bare `en` or a hyphenated `pt-BR` fails), the hreflang cluster shape
below, reciprocal return links for every annotation, `<html lang>` equal to
the page's locale, and a raw-HTML link from every list page to every detail
slug (the virtualization check).

Served check (raw HTML over HTTP, no JS): `python3 -m http.server 4175
--directory apps/app/dist`, then plain HTTP GETs. curl was sandbox-blocked
in the recording session **again** (both `curl URL` and redirect variants;
same as the first session), so the GETs ran as Node `fetch` against the
real local server — the bytes over the socket are what a crawler receives;
no browser, no JS. Results:

```text
GET /pt-BR/places/praia-da-ponta-norte.html
  200 | html lang: pt-BR | title: Praia da Ponta Norte — Cotijuba
  og:locale: pt_BR | alternates: en_US es_ES fr_FR nl_NL de_DE
  hreflang x7: en pt-BR es fr nl de x-default
  body has place summary: true
GET /en/places        200 | og:locale en_US | alternates pt_BR es_ES fr_FR nl_NL de_DE | hreflang x7
GET /                 200 | og:locale en_US | alternates pt_BR es_ES fr_FR nl_NL de_DE | hreflang x6
```

(Detail pages export as `<slug>.html` files; the extensionless URL form
needs the host's cleanURL mapping — an S4 deploy concern, listed under
limitations. For the owner's later curl run, the equivalent is:
`curl -s http://localhost:4175/pt-BR/places/praia-da-ponta-norte.html`.)

Sample of the asserted raw HTML (pt-BR detail):

```html
<html lang="pt-BR">
…
<title>Praia da Ponta Norte — Cotijuba</title>
<meta property="og:title" content="Praia da Ponta Norte — Cotijuba" />
<meta property="og:description" content="Praia calma na ponta norte da ilha; na maré baixa formam-se bancos de areia." />
<meta property="og:locale" content="pt_BR" />
<meta property="og:locale:alternate" content="en_US" />
<!-- … alternates es_ES fr_FR nl_NL de_DE … -->
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

## Outstanding checks (plainly: not done here)

- **Manual WhatsApp/link-preview check — OUTSTANDING, owner's.** Paste a
  production-URL detail page into WhatsApp (or any link-preview consumer)
  and confirm the card shows title/description/image. Not runnable from
  this sandbox; it needs a deployed origin anyway (hreflang URLs are
  root-relative until the deploy origin is pinned).
- **curl run of the served bytes — blocked in both recording sessions.**
  The served check above used Node `fetch` against the same local static
  server over real HTTP; if ADR-0004's letter requires literal curl, the
  owner can rerun the one-liner quoted above in an unrestricted shell —
  the server and export steps are one command each.
- **Playwright with JS disabled — not done.** The "curl or Playwright"
  option is covered by the raw-HTTP served check; a JS-disabled browser
  pass would additionally prove the reading experience without JS, which
  S1 does not require.

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
SDK 58. Status `validated` (not `approved` — that call is the owner's);
recommendation is **GO pending the owner's link-preview check** (see
Verdict and Outstanding checks). Rebuild-on-publish remains the accepted
trade-off — now measured at ~30 s warm for 1k pages, not extrapolated; the
fallback (Hono share pages) stays parked unless a later phase breaks these
assumptions.

## curl raw-HTML check (orchestrator, 2026-11-22, Node 24.13.0)

`npx serve apps/app/dist -l 4173`, then:

```text
$ curl -s http://localhost:4173/de/places/praia-da-ponta-norte | grep -oE '<html lang=…|<title>…|og:(title|locale)|hreflang=…'
<html lang="de"
<title>Strand Ponta Norte — Cotijuba</title>
hreflang="en" hreflang="pt-BR" hreflang="es" hreflang="fr" hreflang="nl" hreflang="de" hreflang="x-default"
property="og:title" content="Strand Ponta Norte — Cotijuba"
property="og:locale" content="de_DE"
$ curl -s -o /dev/null -w 'status=%{http_code}' http://localhost:4173/pt-BR/places
status=200
```

No JavaScript ran; this is the raw HTML a link-preview crawler receives. The owner's WhatsApp link-preview check is still outstanding.
