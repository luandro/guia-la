#!/usr/bin/env node
// S1 hreflang/OG cluster assertions (PR #14 review): structural checks over
// the exported raw HTML that plain greps cannot express.
//
// Failure class it catches:
//   (1) og:locale values not in OpenGraph language_TERRITORY form
//       ("pt-BR", or a bare "en"/"de") — consumers such as Facebook's
//       crawler recognise only territory-qualified locales;
//   (2) a broken hreflang cluster — a missing locale, an x-default that
//       points at a non-equivalent page, or annotations without reciprocal
//       return links (search engines ignore non-reciprocal hreflang);
//   (3) a locale page served with the wrong document language (<html lang>);
//   (4) a list page whose raw HTML omits links to some detail pages
//       (virtualized rendering drops rows in a static export);
//   (5) a journey page without an og:image pointing at a shipped asset
//       (PR #14 review round C: link previews need an image, and the meta
//       must reference a file that actually exists in the export).
//
// Usage: s1-cluster-check.mjs <dist-dir> <fixture-dir>
// Expected pages come from <fixture-dir>/places.json + destination.json.
// Cluster shape (decision, PR #14):
//   - list pages: six locale links to each other, x-default -> "/" (the
//     language picker);
//   - "/": reciprocal links to the six list pages, no x-default (it IS the
//     picker the list pages point at);
//   - detail pages: six locale links, x-default -> the destination
//     default-locale detail page (pt-BR today — the default locale the
//     content falls back to).

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LOCALES = ["en", "pt-BR", "es", "fr", "nl", "de"];
// Explicit per-locale mapping (mirrors apps/app/src/lib/metadata.ts): the OG
// protocol defines og:locale as language_TERRITORY, and the territory is not
// derivable from the language code alone (en -> en_US, not "en").
const OG_LOCALES = {
  en: "en_US",
  "pt-BR": "pt_BR",
  es: "es_ES",
  fr: "fr_FR",
  nl: "nl_NL",
  de: "de_DE",
};
// Territory-qualified only: a bare "en" fails this (PR #14 review round B).
const OG_FORM = /^[a-z]{2}_[A-Z]{2}$/;

const [distDir, fixtureDir] = process.argv.slice(2);
if (!distDir || !fixtureDir) {
  console.error(
    "s1-cluster: FAIL — usage: s1-cluster-check.mjs <dist-dir> <fixture-dir>",
  );
  process.exit(1);
}

const problems = [];

function fail(message) {
  problems.push(message);
}

function read(path) {
  return readFileSync(path, "utf8");
}

/**
 * "/" -> index.html; "/x/places/s" -> x/places/s.html (detail pages export
 * as <slug>.html); "/x/places" -> x/places/index.html (list pages export as
 * a directory index — the <path>.html form there is only a dynamic-route
 * shell, never the real page).
 */
function pageFile(path) {
  if (path === "/") return join(distDir, "index.html");
  const direct = join(distDir, `${path}.html`);
  if (path.endsWith("/") || !existsSync(direct)) {
    return join(distDir, path, "index.html");
  }
  return direct;
}

/** hreflang -> href map from every <link rel="alternate"> in the page. */
function alternatesOf(html) {
  const map = {};
  for (const match of html.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/g)) {
    const tag = match[0];
    const href = tag.match(/\bhref="([^"]*)"/)?.[1];
    const hreflang = tag.match(/\bhreflang="([^"]*)"/)?.[1];
    if (hreflang !== undefined) map[hreflang] = href;
  }
  return map;
}

/** Content values of og:locale and og:locale:alternate, in document order. */
function ogLocaleValues(html) {
  const values = [];
  for (const match of html.matchAll(
    /<meta\b[^>]*property="og:locale(?::alternate)?"[^>]*>/g,
  )) {
    const content = match[0].match(/\bcontent="([^"]*)"/)?.[1];
    if (content !== undefined) values.push(content);
  }
  return values;
}

function htmlLang(html) {
  const tag = html.match(/<html\b[^>]*>/)?.[0];
  return tag?.match(/\blang="([^"]*)"/)?.[1];
}

/**
 * Destination-level og:image (PR #14 review round C). Root-relative on
 * purpose: no deploy origin is pinned yet (D-01), so an absolute URL cannot
 * be honest; crawlers need absolute URLs once the origin exists (Phase 04
 * deploy / Phase 10 domain work — noted in s1-result.md).
 */
const OG_IMAGE = {
  url: "/og/default.png",
  width: "1200",
  height: "630",
};

function ogMetaContent(html, property) {
  for (const match of html.matchAll(
    /<meta\b[^>]*property="og:image(?::[a-z]+)?"[^>]*>/g,
  )) {
    if (match[0].includes(`property="${property}"`)) {
      return match[0].match(/\bcontent="([^"]*)"/)?.[1];
    }
  }
  return undefined;
}

function checkOgImage(page, html) {
  const url = ogMetaContent(html, "og:image");
  if (url !== OG_IMAGE.url) {
    fail(`${page}: og:image is '${url}', expected '${OG_IMAGE.url}'`);
    return;
  }
  const width = ogMetaContent(html, "og:image:width");
  const height = ogMetaContent(html, "og:image:height");
  if (width !== OG_IMAGE.width || height !== OG_IMAGE.height) {
    fail(
      `${page}: og:image size is ${width}x${height}, expected ${OG_IMAGE.width}x${OG_IMAGE.height}`,
    );
  }
}

function checkOg(page, html, expectedLocale) {
  const values = ogLocaleValues(html);
  if (values.length === 0) {
    fail(`${page}: no og:locale / og:locale:alternate meta tags`);
    return;
  }
  for (const value of values) {
    if (!OG_FORM.test(value)) {
      fail(
        `${page}: og:locale '${value}' is not in OG form (language_TERRITORY, e.g. en_US — no bare language codes, no hyphens)`,
      );
    }
  }
  const expected = OG_LOCALES[expectedLocale];
  if (expected === undefined) {
    fail(`${page}: no OG mapping for locale '${expectedLocale}'`);
    return;
  }
  if (values[0] !== expected) {
    fail(`${page}: og:locale is '${values[0]}', expected '${expected}'`);
  }
}

function checkCluster(page, html, expected) {
  const actual = alternatesOf(html);
  const actualLangs = Object.keys(actual)
    .filter((lang) => lang !== "x-default")
    .sort();
  const expectedLangs = Object.keys(expected.langs).sort();
  if (JSON.stringify(actualLangs) !== JSON.stringify(expectedLangs)) {
    fail(
      `${page}: hreflang langs [${actualLangs}] != expected [${expectedLangs}]`,
    );
    return;
  }
  for (const [lang, path] of Object.entries(expected.langs)) {
    if (actual[lang] !== path) {
      fail(
        `${page}: hreflang ${lang} -> '${actual[lang]}', expected '${path}'`,
      );
    }
  }
  if (expected.xDefault === null) {
    if (actual["x-default"] !== undefined) {
      fail(`${page}: unexpected x-default -> '${actual["x-default"]}'`);
    }
  } else if (actual["x-default"] !== expected.xDefault) {
    fail(
      `${page}: x-default -> '${actual["x-default"]}', expected '${expected.xDefault}'`,
    );
  }
}

function checkLang(page, html, expectedLocale) {
  const lang = htmlLang(html);
  if (lang !== expectedLocale) {
    fail(`${page}: <html lang> is '${lang}', expected '${expectedLocale}'`);
  }
}

/** Every hreflang target must list this page back (return-link rule). */
function checkReciprocity(page, html) {
  for (const [lang, target] of Object.entries(alternatesOf(html))) {
    let targetHtml;
    try {
      targetHtml = read(pageFile(target));
    } catch {
      fail(`${page}: hreflang ${lang} target ${target} has no exported page`);
      continue;
    }
    const back = new Set(Object.values(alternatesOf(targetHtml)));
    if (!back.has(page)) {
      fail(
        `${page}: hreflang ${lang} -> ${target} is not reciprocal (${target} does not list ${page} back)`,
      );
    }
  }
}

function listLangs() {
  return Object.fromEntries(LOCALES.map((l) => [l, `/${l}/places`]));
}

function detailLangs(slug) {
  return Object.fromEntries(LOCALES.map((l) => [l, `/${l}/places/${slug}`]));
}

// The og:image asset must ship in the export (apps/app/public/ is copied
// into dist/ by expo export).
if (!existsSync(join(distDir, "og/default.png"))) {
  fail("og/default.png is missing from the export (apps/app/public/og/)");
}

// Root: reciprocal links to the six list pages, no x-default.
{
  const page = "/";
  const html = read(pageFile(page));
  checkCluster(page, html, { langs: listLangs(), xDefault: null });
  checkOg(page, html, "en");
  checkOgImage(page, html);
  checkLang(page, html, "en");
  checkReciprocity(page, html);
}

const places = JSON.parse(read(join(fixtureDir, "places.json")));
const destination = JSON.parse(read(join(fixtureDir, "destination.json")));
if (!Array.isArray(places) || places.length === 0) {
  console.error("s1-cluster: FAIL — no places in fixture");
  process.exit(1);
}
const slugs = places.map((place) => place.slug);
const defaultLocale = destination.defaultLocale;

// List pages: six locale links, x-default -> "/", and a raw-HTML link to
// every detail page (no virtualization may drop rows).
for (const locale of LOCALES) {
  const page = `/${locale}/places`;
  const html = read(pageFile(page));
  checkCluster(page, html, { langs: listLangs(), xDefault: "/" });
  checkOg(page, html, locale);
  checkOgImage(page, html);
  checkLang(page, html, locale);
  checkReciprocity(page, html);
  for (const slug of slugs) {
    if (!html.includes(`href="/${locale}/places/${slug}"`)) {
      fail(`${page}: raw HTML does not link detail page ${slug}`);
    }
  }
}

// Detail pages: six locale links, x-default -> default-locale detail page.
for (const locale of LOCALES) {
  for (const slug of slugs) {
    const page = `/${locale}/places/${slug}`;
    const html = read(pageFile(page));
    checkCluster(page, html, {
      langs: detailLangs(slug),
      xDefault: `/${defaultLocale}/places/${slug}`,
    });
    checkOg(page, html, locale);
    checkOgImage(page, html);
    checkLang(page, html, locale);
    checkReciprocity(page, html);
  }
}

if (problems.length > 0) {
  console.error(`s1-cluster: FAIL (${problems.length} problem(s)):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const pageCount = 1 + LOCALES.length + LOCALES.length * slugs.length;
console.log(
  `s1-cluster: OK — ${pageCount} journey pages (og form + og:image, hreflang cluster + reciprocity, per-locale <html lang>, full list links)`,
);
