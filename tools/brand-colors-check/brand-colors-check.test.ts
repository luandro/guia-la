import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import * as brandColors from "./brand-colors-check.mjs";
import { collectFindings, scanFile } from "./brand-colors-check.mjs";

/**
 * The brand-color gate's own contract (PR #19 review, rounds 1-3): a
 * matcher regression must not silently turn the gate permanently green.
 * Since round 3 the scanner parses each file with the TypeScript compiler
 * API and reports any string literal (or no-substitution template literal)
 * whose whole trimmed value is a color — wherever it sits: object values,
 * JSX attributes, JSX expression containers, ternaries, multi-line values,
 * function arguments. Pins the color forms caught (hex 3/4/6/8, rgb()/rgba
 * ()/hsl()/hsla(), the complete CSS Color 4 named set), the module-name and
 * non-color exemptions, and the CLI's exit code and output format.
 */

const here = dirname(fileURLToPath(import.meta.url));

function writeFixture(content: string, name = "Fixture.tsx"): string {
  const dir = mkdtempSync(join(tmpdir(), "brand-colors-unit-"));
  const path = join(dir, name);
  writeFileSync(path, content);
  return path;
}

describe("scanFile: hex literals", () => {
  it("catches valid hex lengths (3, 4, 6, 8) with letters", () => {
    expect(scanFile(writeFixture(`const a = "#abc";`))).toEqual([
      { line: 1, literal: "#abc" },
    ]);
    expect(scanFile(writeFixture(`const a = "#abcd";`))).toEqual([
      { line: 1, literal: "#abcd" },
    ]);
    expect(scanFile(writeFixture(`const a = "#DE3163";`))).toEqual([
      { line: 1, literal: "#DE3163" },
    ]);
    expect(scanFile(writeFixture(`const a = "#12345678";`))).toEqual([
      { line: 1, literal: "#12345678" },
    ]);
  });

  it("does not report 5- or 7-character runs (not valid colors)", () => {
    expect(scanFile(writeFixture(`const a = "#abcde";`))).toEqual([]);
    // "#added" is five hex characters — an anchor, not a color.
    expect(scanFile(writeFixture(`link("#added");`))).toEqual([]);
    expect(scanFile(writeFixture(`const a = "#abcdef0";`))).toEqual([]);
    expect(scanFile(writeFixture(`href="#added"`))).toEqual([]);
  });

  it("flags all-digit shorthands as whole literals (round 3: unambiguous), keeps comments clean", () => {
    // A literal whose whole value is "#1234" is a color wherever it sits —
    // the key no longer matters, and "#000"/"#111" are colors too.
    expect(scanFile(writeFixture(`id: "#1234";`))).toEqual([
      { line: 1, literal: "#1234" },
    ]);
    expect(scanFile(writeFixture(`backgroundColor: "#000";`))).toEqual([
      { line: 1, literal: "#000" },
    ]);
    // Issue refs in comments are not string literals: never scanned.
    expect(scanFile(writeFixture(`// see #145 for the history`))).toEqual([]);
  });

  it("reports the correct line numbers", () => {
    const path = writeFixture(
      ["const clean = 1;", 'const bad = "#DE3163";', "const also = 2;"].join(
        "\n",
      ),
    );
    expect(scanFile(path)).toEqual([{ line: 2, literal: "#DE3163" }]);
  });
});

describe("scanFile: literals wherever they sit (round 3)", () => {
  it("catches a quoted color inside a JSX expression container", () => {
    // color={"red"} is equivalent to color="red" — both are brand leaks;
    // the token expression color={colors.foreground} stays allowed.
    expect(scanFile(writeFixture(`const a = <Spin color={"red"} />;`))).toEqual(
      [{ line: 1, literal: "red" }],
    );
    expect(
      scanFile(
        writeFixture(`const b = <Input placeholderTextColor={'gray'} />;`),
      ),
    ).toEqual([{ line: 1, literal: "gray" }]);
  });

  it("catches both branches of a ternary", () => {
    expect(
      scanFile(writeFixture(`const c = dark ? "white" : "black";`)),
    ).toEqual([
      { line: 1, literal: "white" },
      { line: 1, literal: "black" },
    ]);
  });

  it("catches a value on a later line than its key", () => {
    const path = writeFixture(
      ["const s = {", "  backgroundColor:", '    "#DE3163",', "};"].join("\n"),
    );
    expect(scanFile(path)).toEqual([{ line: 3, literal: "#DE3163" }]);
  });

  it("catches named colors as function arguments", () => {
    expect(scanFile(writeFixture(`tint("coral");`))).toEqual([
      { line: 1, literal: "coral" },
    ]);
  });

  it("catches no-substitution template literals", () => {
    expect(scanFile(writeFixture("const a = `#fff`;"))).toEqual([
      { line: 1, literal: "#fff" },
    ]);
  });

  it("does not flag non-color strings that merely contain color words", () => {
    expect(scanFile(writeFixture(`const action = "redirect";`))).toEqual([]);
    expect(scanFile(writeFixture(`const place = "white house";`))).toEqual([]);
  });

  it("skips import specifiers and module names", () => {
    expect(scanFile(writeFixture(`import "#abc";`))).toEqual([]);
    expect(scanFile(writeFixture(`export { x } from "#123";`))).toEqual([]);
    expect(scanFile(writeFixture(`const icon = require("#abc");`))).toEqual([]);
  });
});

describe("scanFile: JSX attribute colors (round 2)", () => {
  it("catches named colors as JSX attribute values", () => {
    // Primitives pass colors through exactly these props (ActivityIndicator
    // color, placeholderTextColor) — a hardcoded value there is a brand leak.
    expect(
      scanFile(writeFixture(`const a = <ActivityIndicator color="black" />;`)),
    ).toEqual([{ line: 1, literal: "black" }]);
    expect(
      scanFile(
        writeFixture(`const b = <Input placeholderTextColor="gray" />;`),
      ),
    ).toEqual([{ line: 1, literal: "gray" }]);
  });

  it("catches digit-only shorthands in JSX color attributes (they are colors there)", () => {
    expect(scanFile(writeFixture(`const a = <Spin color="#000" />;`))).toEqual([
      { line: 1, literal: "#000" },
    ]);
    expect(scanFile(writeFixture(`const b = <Spin color="#111" />;`))).toEqual([
      { line: 1, literal: "#111" },
    ]);
  });

  it("does not flag token references or non-color JSX attributes", () => {
    expect(
      scanFile(
        writeFixture(
          `const a = <ActivityIndicator color={colors.foreground} />;`,
        ),
      ),
    ).toEqual([]);
    expect(
      scanFile(writeFixture(`const b = <Link href="#added">x</Link>;`)),
    ).toEqual([]);
  });
});

describe("scanFile: functional color forms", () => {
  it.each(["rgb", "rgba", "hsl", "hsla"])("catches %s()", (form) => {
    const call =
      form === "rgb"
        ? "rgb(222, 49, 99)"
        : form === "rgba"
          ? "rgba(222, 49, 99, 0.5)"
          : form === "hsl"
            ? "hsl(120, 50%, 50%)"
            : "hsla(120, 50%, 50%, 0.5)";
    const violations = scanFile(writeFixture(`backgroundColor: "${call}";`));
    expect(violations).toEqual([{ line: 1, literal: `${form}(` }]);
  });
});

describe("scanFile: CSS named colors (complete Level 4 set)", () => {
  it.each(
    [
      "red",
      "white",
      "black",
      "crimson",
      "blue",
      "green",
      "gray",
      "grey",
      "orange",
      "purple",
      "yellow",
      "pink",
    ].flatMap((name) => [
      [name, "backgroundColor"],
      [name, "color"],
    ]),
  )("catches %j as a %s value", (name, key) => {
    const violations = scanFile(writeFixture(`${key}: "${name}";`));
    expect(violations).toEqual([{ line: 1, literal: name }]);
  });

  it("catches keywords the old partial set omitted (round 3)", () => {
    // coral, rebeccapurple, cornflowerblue, navajowhite: standard CSS
    // keywords that the previous hand-picked list did not include.
    expect(scanFile(writeFixture(`backgroundColor: "coral";`))).toEqual([
      { line: 1, literal: "coral" },
    ]);
    expect(scanFile(writeFixture(`color: "rebeccapurple"`))).toEqual([
      { line: 1, literal: "rebeccapurple" },
    ]);
    expect(scanFile(writeFixture(`color: "cornflowerblue"`))).toEqual([
      { line: 1, literal: "cornflowerblue" },
    ]);
    expect(scanFile(writeFixture(`color: "navajowhite"`))).toEqual([
      { line: 1, literal: "navajowhite" },
    ]);
  });

  it("catches named colors in single quotes too", () => {
    expect(scanFile(writeFixture(`color: 'crimson'`))).toEqual([
      { line: 1, literal: "crimson" },
    ]);
  });

  it("allows transparent, currentColor and inherit (non-colors, not brand leaks)", () => {
    expect(scanFile(writeFixture(`backgroundColor: "transparent";`))).toEqual(
      [],
    );
    expect(scanFile(writeFixture(`color: "currentColor";`))).toEqual([]);
    expect(scanFile(writeFixture(`color: "inherit";`))).toEqual([]);
  });

  it("ignores word values of non-color keys and non-color-named values", () => {
    expect(scanFile(writeFixture(`accessibilityLabel: "red line"`))).toEqual(
      [],
    );
    expect(scanFile(writeFixture(`colorScheme: "dark";`))).toEqual([]);
    expect(scanFile(writeFixture(`label: "Crimson Hour Café"`))).toEqual([]);
  });
});

describe("scanFile: token usage stays clean", () => {
  it("does not flag values read from the theme", () => {
    expect(
      scanFile(
        writeFixture(
          `const s = { backgroundColor: tokens.colors.border, color: tokens.colors.text };`,
        ),
      ),
    ).toEqual([]);
  });
});

describe("NAMED_COLORS completeness (round 3)", () => {
  it("carries the complete CSS Color Module Level 4 keyword list (148)", () => {
    // The old hand-picked list missed standard keywords (coral, ...); a
    // count pin makes any future trimming of the set visible.
    expect(brandColors.NAMED_COLORS.size).toBe(148);
  });
});

describe("CLI entry (exit code and output format)", () => {
  function fixtureRoot(): string {
    const root = mkdtempSync(join(tmpdir(), "brand-colors-cli-"));
    mkdirSync(join(root, "packages/ui/src/components"), { recursive: true });
    mkdirSync(join(root, "apps/app/src/components"), { recursive: true });
    mkdirSync(join(root, "packages/ui/src/tokens"), { recursive: true });
    mkdirSync(join(root, "packages/ui/src/theme"), { recursive: true });
    writeFileSync(
      join(root, "packages/ui/src/components/Clean.tsx"),
      "export const Clean = { backgroundColor: 'tokens.colors.border' };\n",
    );
    writeFileSync(
      join(root, "apps/app/src/components/Other.tsx"),
      "export const Other = 2;\n",
    );
    return root;
  }

  it("exits 0 with the OK line and scanned count on a clean tree", () => {
    const root = fixtureRoot();
    try {
      const run = spawnSync(
        process.execPath,
        [join(here, "brand-colors-check.mjs"), root],
        { encoding: "utf8" },
      );
      expect(run.status).toBe(0);
      expect(run.stdout).toBe(
        "brand-colors: OK — no color literals outside token files (2 files scanned)\n",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("exits 1 with FAIL on stderr naming file, line and literal", () => {
    const root = fixtureRoot();
    try {
      writeFileSync(
        join(root, "apps/app/src/components/Bad.tsx"),
        'export const Bad = { backgroundColor: "#DE3163" };\n',
      );
      const run = spawnSync(
        process.execPath,
        [join(here, "brand-colors-check.mjs"), root],
        { encoding: "utf8" },
      );
      expect(run.status).toBe(1);
      expect(run.stderr).toContain(
        "brand-colors: FAIL — brand color outside tokens (1 literal(s)):",
      );
      expect(run.stderr).toContain(
        "apps/app/src/components/Bad.tsx:1 #DE3163 — use a useTheme() token instead",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps excluding the token layers (they own the color values)", () => {
    const root = fixtureRoot();
    try {
      // Both excluded segments carry hex values: with the widened scan
      // roots the walk reaches these files, and only isExcluded keeps the
      // gate green (PR #19 review round 2 — this test used to pass because
      // walk() never entered the tokens directory at all).
      writeFileSync(
        join(root, "packages/ui/src/tokens/values.ts"),
        'export const background = "#0C1F1B";\n',
      );
      writeFileSync(
        join(root, "packages/ui/src/theme/presets.ts"),
        'export const primary = { light: "#0F5147", dark: "#33B594" };\n',
      );
      const run = spawnSync(
        process.execPath,
        [join(here, "brand-colors-check.mjs"), root],
        { encoding: "utf8" },
      );
      expect(run.status).toBe(0);
      // Excluded files are filtered before the scanned count, not walked
      // around: only the two clean component files count.
      expect(run.stdout).toBe(
        "brand-colors: OK — no color literals outside token files (2 files scanned)\n",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("collectFindings", () => {
  it("walks the scan roots under the given root and reports relative paths", () => {
    const root = mkdtempSync(join(tmpdir(), "brand-colors-collect-"));
    try {
      mkdirSync(join(root, "apps/app/src/components"), { recursive: true });
      writeFileSync(
        join(root, "apps/app/src/components/Bad.tsx"),
        'export const Bad = { color: "crimson" };\n',
      );
      const { findings, scanned } = collectFindings(root);
      expect(scanned).toBe(1);
      expect(findings).toEqual([
        {
          path: join("apps/app/src/components", "Bad.tsx"),
          line: 1,
          literal: "crimson",
        },
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
