#!/usr/bin/env node
// i18n key-completeness check (D-14): every locale catalog must have exactly
// the key set of the reference catalog (en). A missing or extra key fails,
// naming the locale and the key. Plain .mjs so `node` runs it directly.
//
// Failure class it catches: a locale catalog drifting from the reference —
// missing keys (users see fallback/raw keys) and extra keys (dead or
// unreferenced translations).

import { readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The six required UI locales (D-14). */
export const REQUIRED_LOCALES = ["en", "pt-BR", "es", "fr", "nl", "de"];

/** Reference locale every catalog is compared against. */
export const REFERENCE_LOCALE = "en";

/** Flatten a nested catalog object into a set of dot-separated key paths. */
export function flattenKeys(catalog, prefix = "") {
  const keys = new Set();
  for (const [key, value] of Object.entries(catalog ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const nested of flattenKeys(value, path)) keys.add(nested);
    } else {
      keys.add(path);
    }
  }
  return keys;
}

/**
 * Compare every candidate catalog against the reference key set.
 * Returns a list of problems, each formatted "<locale>: missing|extra key <key>".
 */
export function compareCatalogs(reference, candidates) {
  const referenceKeys = flattenKeys(reference);
  const problems = [];
  for (const [locale, catalog] of Object.entries(candidates)) {
    const localeKeys = flattenKeys(catalog);
    for (const key of difference(referenceKeys, localeKeys)) {
      problems.push(`${locale}: missing key ${key}`);
    }
    for (const key of difference(localeKeys, referenceKeys)) {
      problems.push(`${locale}: extra key ${key}`);
    }
  }
  return problems;
}

function difference(a, b) {
  return [...a].filter((key) => !b.has(key)).sort();
}

function readCatalog(localesDir, locale) {
  const raw = readFileSync(join(localesDir, `${locale}.json`), "utf8");
  return JSON.parse(raw);
}

function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const localesDir = join(
    scriptDir,
    "..",
    "..",
    "apps",
    "app",
    "src",
    "i18n",
    "locales",
  );

  const present = new Set(
    readdirSync(localesDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.slice(0, -".json".length)),
  );

  const problems = [];
  for (const locale of REQUIRED_LOCALES) {
    if (!present.has(locale)) {
      problems.push(
        `${locale}: missing catalog file apps/app/src/i18n/locales/${locale}.json`,
      );
    }
  }
  for (const file of present) {
    if (!REQUIRED_LOCALES.includes(file)) {
      problems.push(
        `${file}: unexpected catalog file (not one of ${REQUIRED_LOCALES.join(", ")})`,
      );
    }
  }

  let catalogs = {};
  if (problems.length === 0) {
    catalogs = Object.fromEntries(
      REQUIRED_LOCALES.map((locale) => [
        locale,
        readCatalog(localesDir, locale),
      ]),
    );
    const { [REFERENCE_LOCALE]: reference, ...candidates } = catalogs;
    problems.push(...compareCatalogs(reference, candidates));
  }

  if (problems.length > 0) {
    console.error(`i18n:check FAILED (${problems.length} problem(s)):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  const keyCount = flattenKeys(catalogs[REFERENCE_LOCALE]).size;
  console.log(
    `i18n:check OK — ${REQUIRED_LOCALES.length} locales x ${keyCount} keys (reference: ${REFERENCE_LOCALE})`,
  );
}

// Run as CLI only when invoked directly (unit tests import the functions).
// pathToFileURL(realpathSync(...)) rather than a hand-built `file://` URL:
// argv[1] is not realpath'd while import.meta.url is (a symlinked checkout
// or a "#" / "%" in the path made the hand-built form differ, so main()
// silently never ran and the gate passed vacuously — PR #14 review).
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  main();
}
