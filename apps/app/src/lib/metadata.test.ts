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
  it("maps every locale plus x-default to its hreflang path", () => {
    expect(languageAlternates((locale) => `/${locale}/places`)).toEqual({
      en: "/en/places",
      "pt-BR": "/pt-BR/places",
      es: "/es/places",
      fr: "/fr/places",
      nl: "/nl/places",
      de: "/de/places",
      "x-default": "/en/places",
    });
  });

  it("keeps the slug for detail pages", () => {
    const alternates = languageAlternates(
      (locale) => `/${locale}/places/praia-da-ponta-norte`,
    );
    expect(alternates["pt-BR"]).toBe("/pt-BR/places/praia-da-ponta-norte");
    expect(Object.keys(alternates)).toHaveLength(7);
  });
});
