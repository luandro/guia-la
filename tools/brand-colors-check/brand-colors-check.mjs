#!/usr/bin/env node
// Brand-color check (phase 03, task 5): no hex color literal may appear
// outside the token layer. Plain .mjs so `node` runs it directly.
//
// Failure class it catches: "brand color outside tokens" — a primitive or
// an app screen hardcoding a brand hex instead of reading it through
// useTheme(), which is exactly how destination branding leaks into
// components (phase-03.md forbidden list; the white-label claim, D-00,
// dies at the first such literal). Token data lives only under
// packages/ui/src/tokens/ and packages/ui/src/theme/, which are excluded.
//
// Match heuristic: `#` followed by 3, 4, 6 or 8 hex chars at a word
// boundary. All-digit 3/4-char shorthands are ignored — issue/PR
// references ("see #145") are all digits, while a real color shorthand
// carries at least one a-f letter. 6/8-digit forms always count.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Scan roots: primitives and app code. */
const SCAN_ROOTS = ["packages/ui/src/components", "apps/app/src"];

/** Token layers that own color values; excluded everywhere. */
const EXCLUDED_SEGMENTS = [
  join("packages", "ui", "src", "tokens") + sep,
  join("packages", "ui", "src", "theme") + sep,
];

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

const HEX_LITERAL = /#([0-9a-fA-F]{3,8})(?![0-9a-fA-F])/g;

function isExcluded(absolutePath) {
  const normalized = absolutePath + sep;
  return EXCLUDED_SEGMENTS.some((segment) =>
    normalized.startsWith(join(repoRoot, segment)),
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
function looksLikeColor(digits) {
  if (digits.length === 6 || digits.length === 8) return true;
  return /[a-fA-F]/.test(digits);
}

function scanFile(path) {
  const violations = [];
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, index) => {
    for (const match of line.matchAll(HEX_LITERAL)) {
      if (looksLikeColor(match[1])) {
        violations.push({ line: index + 1, literal: match[0] });
      }
    }
  });
  return violations;
}

function main() {
  const findings = [];
  let scanned = 0;
  for (const root of SCAN_ROOTS) {
    const absoluteRoot = join(repoRoot, root);
    if (!statSync(absoluteRoot).isDirectory()) continue;
    for (const path of walk(absoluteRoot)) {
      if (isExcluded(path)) continue;
      scanned += 1;
      for (const violation of scanFile(path)) {
        findings.push({ path: relative(repoRoot, path), ...violation });
      }
    }
  }

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
    `brand-colors: OK — no hex color literals outside token files (${scanned} files scanned)`,
  );
}

main();
