#!/usr/bin/env node
// Brand-color check (phase 03, task 5; rounds 1-3 of PR #19 review): no
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
// Scanned extensions (PR #19 deferred finding 03-78c): .ts/.tsx/.mts/.cts
// and .js/.jsx/.mjs/.cjs — every source form the repo ships. An earlier
// version walked only .ts/.tsx/.js/.jsx, so a color literal in an ESM or
// CommonJS module slipped past the gate entirely.
//
// How it matches (round 3: TypeScript compiler API, not line regexes —
// the regex forms missed color={"red"}, ternary branches, values on the
// line after their key, and all-digit shorthands outside color keys, and
// they false-positived on import module names; round 4: template
// expressions with substitutions):
// - every file is parsed once; every StringLiteral and
//   NoSubstitutionTemplateLiteral is visited wherever it sits — object
//   values, JSX attributes, JSX expression containers, ternaries,
//   multi-line values, function arguments, enum initializers;
// - a literal is reported when its whole trimmed value is a color:
//   hex #rgb/#rgba/#rrggbb/#rrggbbaa (all-digit forms included — a
//   whole-literal match is unambiguous, unlike "#145" inside prose),
// *   rgb()/rgba()/hsl()/hsla()/hwb(), or a CSS named color from the complete
//   CSS Color Module Level 4 keyword list;
// - a TemplateExpression (round 4) is reported when its static head
// * starts a color form: a functional rgb(/rgba(/hsl(/hsla(/hwb( head, or a
//   `#` head followed by a substitution — `rgba(${r}, ${g}, ${b}, 0.5)`
//   and `#${hex}` are the realistic interpolated ways to hardcode a
//   brand color while dodging a whole-literal match. Substitution
//   expressions are still scanned for whole literals inside them;
// - "transparent", "currentColor" and "inherit" are allowed (explicit
//   non-colors, not brand leaks);
// - never scanned: comments (not in the AST), import/export module
//   specifiers, import()/require() module names, and property-name
//   positions ({"red": x} names a field; only values carry colors).
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

import ts from "typescript";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Scan roots: the whole ui package source and app code (PR #19 review
 * round 2). Walking all of packages/ui/src is what makes the token/theme
 * exclusions real — the walk reaches those directories, isExcluded filters
 * them — instead of never entering them at all.
 */
const SCAN_ROOTS = ["packages/ui/src", "apps/app/src"];

/** Token layers that own color values; excluded everywhere. */
const EXCLUDED_SEGMENTS = [
  join("packages", "ui", "src", "tokens") + sep,
  join("packages", "ui", "src", "theme") + sep,
];

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

/**
 * Tests pin exact colors as assertions; they are not shipped UI.
 *
 * The extension is `.test|.spec` then an optional `c`/`m` then `js`/`ts`
 * then an optional `x` — the forms the repo ships: `.test.ts`, `.test.tsx`,
 * `.test.js`, `.test.jsx`, and the ESM/CommonJS module forms `.test.mts`,
 * `.test.mjs`, `.test.cts`, `.test.cjs`. An earlier `[c|m]?` put the `|`
 * inside the character class, where it is a literal, so the pattern also
 * matched a bogus `.test.|ts` and, because the stem was `[jt]sx?` with no
 * tie between the module prefix and the js/ts letter, accepted
 * non-extensions such as `.test.mtsx` / `.test.cjsx` (PR #20 review).
 */
const TEST_FILE = /\.(test|spec)\.(?:[cm][jt]s|[jt]sx?)$/;

/** Whole-value hex: 3, 4, 6 or 8 hex digits (5 and 7 are not colors). */
const HEX_VALUE =
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** Whole-value functional forms; reported as the leading `name(`. */
const FUNCTIONAL_VALUE = /^(rgba?|hsla?|hwb)\s*\(/i;

/**
 * The complete CSS Color Module Level 4 named-color list (148 keywords —
 * https://www.w3.org/TR/css-color-4/#named-colors). Round 3: the previous
 * hand-picked subset missed standard keywords such as "coral".
 */
export const NAMED_COLORS = new Set([
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkgrey",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dimgrey",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "green",
  "greenyellow",
  "grey",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightgrey",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen",
]);

/** Explicit non-color keywords, allowed wherever they appear. */
const ALLOWED_NAMED = new Set(["transparent", "currentcolor", "inherit"]);

/**
 * The reportable form of a whole-literal color, or null when the value is
 * not a color: hex and named colors report themselves, functional forms
 * report their leading `name(` like the line-regex version did.
 */
export function colorViolation(value) {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (ALLOWED_NAMED.has(trimmed.toLowerCase())) return null;
  if (HEX_VALUE.test(trimmed)) return trimmed;
  const functional = trimmed.match(FUNCTIONAL_VALUE);
  if (functional) return `${functional[1]}(`;
  if (NAMED_COLORS.has(trimmed.toLowerCase())) return trimmed;
  return null;
}

/**
 * The reportable form of a TemplateExpression whose static head starts a
 * color (round 4), or null when it does not: a functional head reports
 * its leading `name(` (matching colorViolation), a `#` head followed by a
 * substitution reports `#` — the interpolation is where the color's
 * digits would come from. Only the head counts: a color that appears
 * after a substitution (`abc ${v} #fff`) is not a color *started* by the
 * static text, and whole-literal matching inside prose stays out of
 * scope on purpose. A `#` head counts only when its static characters
 * after `#` are empty or hex digits: `#${hex}` is a color, while the
 * static part of `#place-${id}` contains non-hex characters and is an
 * anchor, not a color (round 7).
 */
export function templateHeadViolation(headText) {
  const trimmed = headText.trim();
  if (trimmed === "") return null;
  // A `#` head is a color only when its static part after `#` is empty or
  // consists only of hex digits: `#${hex}` and `#abc${x}` continue a color,
  // while `#place-${id}` or `#secao-${x}` are anchors (round 7).
  if (trimmed.startsWith("#")) {
    return /^[0-9a-fA-F]*$/.test(trimmed.slice(1)) ? "#" : null;
  }
  const functional = trimmed.match(FUNCTIONAL_VALUE);
  if (functional) return `${functional[1]}(`;
  return null;
}

export function isTestFile(absolutePath) {
  return TEST_FILE.test(absolutePath);
}

function isExcluded(absolutePath, rootDir) {
  if (isTestFile(absolutePath)) return true;
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

/**
 * Parse one file with the TypeScript compiler API and report every
 * color-valued string literal (see the header comment for what counts).
 */
export function scanFile(path) {
  const violations = [];
  const source = readFileSync(path, "utf8");
  // scriptKind is inferred from the file name (.ts/.tsx/.js/.jsx).
  const sourceFile = ts.createSourceFile(path, source, {
    languageVersion: ts.ScriptTarget.Latest,
  });
  const visit = (node) => {
    // Module specifiers are file paths, never color values.
    if (
      ts.isImportDeclaration(node) ||
      ts.isExportDeclaration(node) ||
      ts.isImportEqualsDeclaration(node) ||
      ts.isImportTypeNode(node)
    ) {
      return;
    }
    // import("...") and require("...") arguments are module names too.
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    ) {
      return;
    }
    // Name positions are keys, not values: `{"red": x}` names a field.
    if (ts.isPropertyAssignment(node) || ts.isPropertySignature(node)) {
      const value = node.initializer ?? node.type;
      if (value) visit(value);
      return;
    }
    // A template with substitutions is one violation when its static head
    // starts a color form (round 4); it does not return early, so the
    // substitution expressions below still recurse and whole literals
    // nested inside them keep being caught.
    if (ts.isTemplateExpression(node)) {
      const head = templateHeadViolation(node.head.text);
      if (head) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile),
        );
        violations.push({ line: line + 1, literal: head });
      }
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const literal = colorViolation(node.text);
      if (literal) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile),
        );
        violations.push({ line: line + 1, literal });
      }
      return;
    }
    node.forEachChild(visit);
  };
  visit(sourceFile);
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
