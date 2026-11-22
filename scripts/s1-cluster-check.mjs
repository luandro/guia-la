#!/usr/bin/env node
// S1 hreflang/OG cluster assertions (PR #14 review): structural checks over
// the exported raw HTML that plain greps cannot express.
//
// Failure class it catches:
//   (1) og:locale values in BCP-47 form ("pt-BR") instead of the OpenGraph
//       form ("pt_BR") that og:locale consumers expect;
//   (2) a broken hreflang cluster — a missing locale, an x-default that
//       points at a non-equivalent page, or annotations without reciprocal
//       return links (search engines ignore non-reciprocal hreflang);
//   (3) a locale page served with the wrong document language (<html lang>);
//   (4) a list page whose raw HTML omits links to some detail pages
//       (virtualized rendering drops rows in a static export).
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
const OG_FORM = /^[a-z]{2}(_[A-Z]{2})?$/;

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

function checkOg(page, html, expectedLocale) {
  const values = ogLocaleValues(html);
  if (values.length === 0) {
    fail(`${page}: no og:locale / og:locale:alternate meta tags`);
    return;
  }
  for (const value of values) {
    if (!OG_FORM.test(value)) {
      fail(
        `${page}: og:locale '${value}' is not in OG form (xx_YY, no hyphen)`,
      );
    }
  }
  const expected = expectedLocale.replace("-", "_");
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

// Root: reciprocal links to the six list pages, no x-default.
{
  const page = "/";
  const html = read(pageFile(page));
  checkCluster(page, html, { langs: listLangs(), xDefault: null });
  checkOg(page, html, "en");
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
  `s1-cluster: OK — ${pageCount} journey pages (og form, hreflang cluster + reciprocity, per-locale <html lang>, full list links)`,
);
