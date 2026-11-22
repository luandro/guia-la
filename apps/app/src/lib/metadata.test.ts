import { describe, expect, it } from "vitest";

import {
  languageAlternates,
  ogAlternateLocales,
  ogLocale,
} from "./metadata.js";

describe("ogLocale", () => {
  it("converts BCP-47 to OG underscore format", () => {
    expect(ogLocale("pt-BR")).toBe("pt_BR");
    expect(ogLocale("en")).toBe("en");
    expect(ogLocale("nl")).toBe("nl");
  });
});

describe("ogAlternateLocales", () => {
  it("lists the other five locales in OG format", () => {
    expect(ogAlternateLocales("en")).toEqual(["pt_BR", "es", "fr", "nl", "de"]);
  });
});

describe("languageAlternates", () => {
  it("maps every list locale with the picker page as x-default", () => {
    expect(languageAlternates((locale) => `/${locale}/places`, "/")).toEqual({
      en: "/en/places",
      "pt-BR": "/pt-BR/places",
      es: "/es/places",
      fr: "/fr/places",
      nl: "/nl/places",
      de: "/de/places",
      "x-default": "/",
    });
  });

  it("points detail x-default at the default-locale detail page", () => {
    const alternates = languageAlternates(
      (locale) => `/${locale}/places/praia-da-ponta-norte`,
      "/pt-BR/places/praia-da-ponta-norte",
    );
    expect(alternates["x-default"]).toBe("/pt-BR/places/praia-da-ponta-norte");
    expect(alternates.de).toBe("/de/places/praia-da-ponta-norte");
    expect(Object.keys(alternates)).toHaveLength(7);
  });

  it("omits x-default for the root picker page (null)", () => {
    const alternates = languageAlternates(
      (locale) => `/${locale}/places`,
      null,
    );
    expect(Object.keys(alternates)).toHaveLength(6);
    expect(alternates["x-default"]).toBeUndefined();
  });
});
