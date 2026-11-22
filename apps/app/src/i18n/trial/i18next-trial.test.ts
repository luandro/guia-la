import { expect, it } from "vitest";

// Minimal real trial of i18next (the library ADR-0016 lists): initialize
// synchronously from inline resources and translate in two locales.
// Mirrors the app wiring: createT returns a bound t for one route locale.
import { createT } from "./runtime.js";

it("translates in en and de from the same key", () => {
  const tEn = createT("en");
  const tDe = createT("de");
  expect(tEn("common.appName")).toBe("guia.la pilot");
  expect(tDe("common.appName")).toBe("guia.la Pilot");
});

it("interpolates values", () => {
  const tEn = createT("en");
  expect(tEn("places.count", { count: 7 })).toBe("7 places");
});

it("falls back to the key when a locale is missing (checker prevents this)", () => {
  const t = createT("en");
  expect(t("does.not.exist")).toBe("does.not.exist");
});
