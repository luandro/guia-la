import { describe, expect, it } from "vitest";

import {
  destinationOgImage,
  languageAlternates,
  ogAlternateLocales,
  ogLocale,
} from "./metadata.js";

describe("ogLocale", () => {
  it("maps every UI locale to its language_TERRITORY OG form", () => {
    expect(ogLocale("pt-BR")).toBe("pt_BR");
    expect(ogLocale("en")).toBe("en_US");
    expect(ogLocale("es")).toBe("es_ES");
    expect(ogLocale("fr")).toBe("fr_FR");
    expect(ogLocale("nl")).toBe("nl_NL");
    expect(ogLocale("de")).toBe("de_DE");
  });
});

describe("ogAlternateLocales", () => {
  it("lists the other five locales in OG form", () => {
    expect(ogAlternateLocales("en")).toEqual([
      "pt_BR",
      "es_ES",
      "fr_FR",
      "nl_NL",
      "de_DE",
    ]);
  });
});

describe("destinationOgImage", () => {
  it("points at the shipped 1200x630 asset with a root-relative URL", () => {
    // PR #14 review round C: root-relative on purpose (no origin pinned,
    // D-01); s1-cluster asserts the file ships in the export and the meta
    // tag appears on every journey page.
    expect(destinationOgImage).toEqual({
      url: "/og/default.png",
      width: 1200,
      height: 630,
    });
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
