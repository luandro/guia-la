import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { compareCatalogs, flattenKeys } from "./i18n-check.mjs";

describe("flattenKeys", () => {
  it("flattens nested catalogs to dot paths", () => {
    expect(
      flattenKeys({
        common: { appName: "x", go: "y" },
        places: { empty: "z" },
      }),
    ).toEqual(new Set(["common.appName", "common.go", "places.empty"]));
  });

  it("keeps plural-suffixed keys as distinct keys", () => {
    expect(
      flattenKeys({ places: { count_one: "a", count_other: "b" } }),
    ).toEqual(new Set(["places.count_one", "places.count_other"]));
  });
});

describe("compareCatalogs", () => {
  const reference = {
    common: { appName: "x", go: "y" },
    places: { empty: "z", count_one: "a", count_other: "b" },
  };

  it("reports no problems when every locale matches the reference", () => {
    const problems = compareCatalogs(reference, {
      "pt-BR": reference,
      de: {
        common: { appName: "x", go: "y" },
        places: { empty: "z", count_one: "a", count_other: "b" },
      },
    });
    expect(problems).toEqual([]);
  });

  it("names the locale and each missing key", () => {
    const problems = compareCatalogs(reference, {
      nl: { common: { appName: "x" }, places: {} },
    });
    expect(problems).toContain("nl: missing key places.empty");
    expect(problems).toContain("nl: missing key common.go");
    expect(problems).toContain("nl: missing key places.count_one");
    expect(problems).toContain("nl: missing key places.count_other");
  });

  it("names the locale and each extra key", () => {
    const problems = compareCatalogs(reference, {
      de: {
        common: { appName: "x", go: "y", legacy: "old" },
        places: { empty: "z", count_one: "a", count_other: "b" },
      },
    });
    expect(problems).toEqual(["de: extra key common.legacy"]);
  });

  it("reports both missing and extra keys together", () => {
    const problems = compareCatalogs(reference, {
      fr: { common: { appName: "x", oops: "e" }, places: { empty: "z" } },
    });
    expect(problems).toEqual([
      "fr: missing key common.go",
      "fr: missing key places.count_one",
      "fr: missing key places.count_other",
      "fr: extra key common.oops",
    ]);
  });
});

describe("CLI entry (main-module detection)", () => {
  // The gate only checks catalogs when main() runs. A hand-built
  // `file://${process.argv[1]}` URL misses symlinked script paths (argv[1]
  // is not realpath'd; import.meta.url is), so a symlinked invocation used
  // to skip every check and exit 0. Run the real CLI through a symlink with
  // a planted missing key and require the failure exit.
  it("still fails when invoked through a symlinked script path", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const script = join(here, "i18n-check.mjs");
    const nlPath = join(
      here,
      "..",
      "..",
      "apps",
      "app",
      "src",
      "i18n",
      "locales",
      "nl.json",
    );
    const original = readFileSync(nlPath, "utf8");
    const dir = mkdtempSync(join(tmpdir(), "i18n-check-symlink-"));
    try {
      const catalog = JSON.parse(original) as Record<
        string,
        Record<string, unknown>
      >;
      const section = Object.keys(catalog)[0];
      const key = Object.keys(catalog[section])[0];
      delete catalog[section][key];
      writeFileSync(nlPath, `${JSON.stringify(catalog, null, 2)}\n`);

      const link = join(dir, "i18n-check.mjs");
      symlinkSync(script, link);
      const run = spawnSync(process.execPath, [link], { encoding: "utf8" });

      expect(run.status).not.toBe(0);
      expect(run.stderr).toContain(`missing key ${section}.${key}`);
    } finally {
      writeFileSync(nlPath, original);
      rmSync(dir, { recursive: true, force: true });
    }
  }, 30_000);

  // Guard the restore: the planted-catalog test must never leak its edit.
  afterEach(() => {
    const here = dirname(fileURLToPath(import.meta.url));
    const nlPath = join(
      here,
      "..",
      "..",
      "apps",
      "app",
      "src",
      "i18n",
      "locales",
      "nl.json",
    );
    expect(() => JSON.parse(readFileSync(nlPath, "utf8"))).not.toThrow();
  });
});
