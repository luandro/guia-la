#!/usr/bin/env node
// Brand-color check (phase 03, task 5; tightened in PR #19 review): no
// color literal may appear outside the token layer. Plain .mjs so `node`
// runs it directly.
//
// Failure class it catches: "brand color outside tokens" — a primitive or
// an app screen hardcoding a brand color instead of reading it through
// useTheme(), which is exactly how destination branding leaks into
// components (phase-03.md forbidden list; the white-label claim, D-00,
// dies at the first such literal). Token data lives only under
// packages/ui/src/tokens/ and packages/ui/src/theme/, which are excluded,
// as are *.test.* / *.spec.* files: tests legitimately pin exact hex
// values as assertions — they are not shipped UI.
//
// Match heuristics (PR #19 review):
// - hex: `#` followed by exactly 3, 4, 6 or 8 hex chars, bounded on both
//   sides by non-hex (so the 5-char anchor "#added" and 7-char runs are
//   not colors and are not reported);
// - all-digit 3/4-char shorthands are ignored outside color values —
//   issue/PR references ("see #145") are all digits, while a real color
//   shorthand carries at least one a-f letter. Inside a color value
//   (`color: "#000"`) a shorthand is always a color and always counts;
// - functional forms: rgb()/rgba()/hsl()/hsla() anywhere;
// - CSS named colors as the quoted value of a style key containing
//   "color" (backgroundColor, tintColor, ...). "transparent" is allowed
//   (an explicit non-color, not a brand leak).
//
// Usage: brand-colors-check.mjs [root]   (default: this repo; tests pass
// a fixture root — main() only runs when invoked as a script).

import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Scan roots: primitives and app code. */
const SCAN_ROOTS = ["packages/ui/src/components", "apps/app/src"];

/** Token layers that own color values; excluded everywhere. */
const EXCLUDED_SEGMENTS = [
  join("packages", "ui", "src", "tokens") + sep,
  join("packages", "ui", "src", "theme") + sep,
];

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

/** Tests pin exact colors as assertions; they are not shipped UI. */
const TEST_FILE = /\.(test|spec)\.[jt]sx?$/;

const HEX_LITERAL =
  /(?<![0-9a-fA-F])#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![0-9a-fA-F])/g;

const FUNCTIONAL_LITERAL = /\b(rgba?|hsla?)\s*\(/gi;

/** A quoted value assigned to a style key that mentions "color". */
const COLOR_VALUE = /\b\w*color\w*\s*:\s*(["'])([^"']*)\1/gi;

/** Common CSS named colors (case-insensitive); "transparent" is allowed. */
const NAMED_COLORS = new Set([
  "aqua",
  "beige",
  "black",
  "blue",
  "brown",
  "crimson",
  "cyan",
  "darkblue",
  "darkgray",
  "darkgrey",
  "darkgreen",
  "darkred",
  "dimgray",
  "dimgrey",
  "fuchsia",
  "gainsboro",
  "gold",
  "gray",
  "green",
  "grey",
  "indigo",
  "ivory",
  "khaki",
  "lightblue",
  "lightgray",
  "lightgrey",
  "lightgreen",
  "lime",
  "magenta",
  "maroon",
  "navy",
  "olive",
  "orange",
  "orchid",
  "pink",
  "plum",
  "purple",
  "red",
  "salmon",
  "silver",
  "tan",
  "teal",
  "tomato",
  "turquoise",
  "violet",
  "white",
  "whitesmoke",
  "yellow",
]);

const ALLOWED_NAMED = new Set(["transparent"]);

function isExcluded(absolutePath, rootDir) {
  if (TEST_FILE.test(absolutePath)) return true;
  const normalized = absolutePath + sep;
  return EXCLUDED_SEGMENTS.some((segment) =>
    normalized.startsWith(join(rootDir, segment)),
  );
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
      yield path;
    }
  }
}

function extname(name) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot);
}

/** True when the match is a color shorthand, not an all-digit PR ref. */
export function looksLikeColor(digits) {
  if (digits.length === 6 || digits.length === 8) return true;
  return /[a-fA-F]/.test(digits);
}

export function scanFile(path) {
  const violations = [];
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    for (const match of line.matchAll(FUNCTIONAL_LITERAL)) {
      violations.push({ line: lineNumber, literal: `${match[1]}(` });
    }

    // Color-value spans: quoted values of *color* style keys. A hex inside
    // one is a color no matter its digits ("#000" is not an issue number
    // when it is the value of backgroundColor).
    const valueSpans = [];
    for (const match of line.matchAll(COLOR_VALUE)) {
      valueSpans.push([match.index, match.index + match[0].length]);
      const value = match[2];
      const name = value.toLowerCase();
      if (NAMED_COLORS.has(name) && !ALLOWED_NAMED.has(name)) {
        violations.push({ line: lineNumber, literal: value });
      }
    }
    const inColorValue = (i) =>
      valueSpans.some(([start, end]) => i >= start && i < end);

    for (const match of line.matchAll(HEX_LITERAL)) {
      if (inColorValue(match.index) || looksLikeColor(match[1])) {
        violations.push({ line: lineNumber, literal: match[0] });
      }
    }
  });
  return violations;
}

/** Scan a repo-shaped root; returns findings (repo-relative) + count. */
export function collectFindings(rootDir) {
  const findings = [];
  let scanned = 0;
  for (const root of SCAN_ROOTS) {
    const absoluteRoot = join(rootDir, root);
    if (!existsSync(absoluteRoot)) continue;
    if (!statSync(absoluteRoot).isDirectory()) continue;
    for (const path of walk(absoluteRoot)) {
      if (isExcluded(path, rootDir)) continue;
      scanned += 1;
      for (const violation of scanFile(path)) {
        findings.push({ path: relative(rootDir, path), ...violation });
      }
    }
  }
  return { findings, scanned };
}

export function main() {
  const explicitRoot = process.argv[2];
  const rootDir = explicitRoot ? resolve(explicitRoot) : repoRoot;
  const { findings, scanned } = collectFindings(rootDir);

  if (findings.length > 0) {
    console.error(
      `brand-colors: FAIL — brand color outside tokens (${findings.length} literal(s)):`,
    );
    for (const finding of findings) {
      console.error(
        `  ${finding.path}:${finding.line} ${finding.literal} — use a useTheme() token instead`,
      );
    }
    process.exit(1);
  }

  console.log(
    `brand-colors: OK — no color literals outside token files (${scanned} files scanned)`,
  );
}

// Run only as a script (tests import the exports). argv[1] is not
// realpath'd while import.meta.url is — compare through realpathSync so a
// symlinked invocation still runs (same lesson as i18n-check's CLI test).
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  main();
}
