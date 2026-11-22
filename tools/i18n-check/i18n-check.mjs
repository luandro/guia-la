#!/usr/bin/env node
// i18n key-completeness check (D-14): every locale catalog must have exactly
// the key set of the reference catalog (en), every value must be a non-empty
// string, and interpolation placeholders ({{name}}) must match the reference.
// Any deviation fails, naming the locale and the key. Plain .mjs so `node`
// runs it directly.
//
// Failure class it catches: a locale catalog drifting from the reference —
// missing keys (users see fallback/raw keys), extra keys (dead or
// unreferenced translations), empty or non-string values (a blank button or
// a raw object rendered into the UI), and placeholder drift (a translation
// dropping {{destination}} renders without the data it was promised).

import { readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The six required UI locales (D-14). */
export const REQUIRED_LOCALES = ["en", "pt-BR", "es", "fr", "nl", "de"];

/** Reference locale every catalog is compared against. */
export const REFERENCE_LOCALE = "en";

/**
 * Flatten a nested catalog into a Map of dotted key path -> leaf value.
 * Values ride along with the keys (PR #15 CodeRabbit review): a literal
 * dotted key like {"places.listTitle": …} flattens to the same path as a
 * nested {"places":{"listTitle": …}}, but a walk-by-segments lookup cannot
 * retrieve its value — placeholder validation then silently skipped such
 * keys. Both shapes are valid i18next catalogs, so both must be checked.
 * A path produced twice (nested + literal in one catalog) keeps the last
 * value, mirroring the previous Set-based key dedup.
 */
export function flattenEntries(catalog, prefix = "", out = new Map()) {
  for (const [key, value] of Object.entries(catalog ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenEntries(value, path, out);
    } else {
      out.set(path, value);
    }
  }
  return out;
}

/** Flatten a nested catalog object into a set of dot-separated key paths. */
export function flattenKeys(catalog) {
  return new Set(flattenEntries(catalog).keys());
}

/**
 * Compare every candidate catalog against the reference: key sets, value
 * sanity (non-empty strings, in every catalog including the reference) and
 * interpolation placeholders (each candidate key's {{names}} set must equal
 * the reference's). Returns a list of problems, each formatted
 * "<locale>: <problem>".
 */
export function compareCatalogs(reference, candidates) {
  const referenceEntries = flattenEntries(reference);
  const referenceKeys = new Set(referenceEntries.keys());
  const problems = [];
  problems.push(...valueProblems(REFERENCE_LOCALE, referenceEntries));
  for (const [locale, catalog] of Object.entries(candidates)) {
    const localeEntries = flattenEntries(catalog);
    const localeKeys = new Set(localeEntries.keys());
    for (const key of difference(referenceKeys, localeKeys)) {
      problems.push(`${locale}: missing key ${key}`);
    }
    for (const key of difference(localeKeys, referenceKeys)) {
      problems.push(`${locale}: extra key ${key}`);
    }
    problems.push(...valueProblems(locale, localeEntries));
    for (const key of intersection(localeKeys, referenceKeys).sort()) {
      const referenceValue = referenceEntries.get(key);
      const value = localeEntries.get(key);
      if (typeof referenceValue !== "string" || typeof value !== "string") {
        continue; // non-string values are reported by valueProblems
      }
      const expected = placeholders(referenceValue);
      const actual = placeholders(value);
      if (!sameSet(expected, actual)) {
        problems.push(
          `${locale}: placeholders for key ${key} differ from reference (reference: {${[...expected].sort().join(", ")}}, value: {${[...actual].sort().join(", ")}})`,
        );
      }
    }
  }
  return problems;
}

/** Leaf-value sanity for one catalog: every value must be a non-empty string. */
function valueProblems(locale, entries) {
  const problems = [];
  for (const [key, value] of entries) {
    if (typeof value !== "string") {
      problems.push(`${locale}: non-string value for key ${key}`);
    } else if (value.trim().length === 0) {
      problems.push(`${locale}: empty value for key ${key}`);
    }
  }
  return problems.sort();
}

/** i18next interpolation names in a translation: "{{count}} places" -> {"count"}. */
export function placeholders(value) {
  return new Set(
    [...String(value).matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)].map(
      (match) => match[1],
    ),
  );
}

function intersection(a, b) {
  return [...a].filter((key) => b.has(key));
}

function sameSet(a, b) {
  return a.size === b.size && [...a].every((key) => b.has(key));
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
