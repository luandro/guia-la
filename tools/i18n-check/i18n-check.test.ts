import { describe, expect, it } from "vitest";

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
