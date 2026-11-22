import { describe, expect, it } from "vitest";

import type { Locale } from "@guia-la/core";

import { LOCALES, catalogs, createT, getI18n } from "./index.js";

describe("i18n catalogs (D-14)", () => {
  it("ships all six locales", () => {
    expect([...LOCALES]).toEqual(["en", "pt-BR", "es", "fr", "nl", "de"]);
  });

  it("translates a shared key in every locale", () => {
    for (const locale of LOCALES) {
      const t = createT(locale);
      expect(t("common.retry", { defaultValue: "" })).not.toBe("");
      expect(t("places.listTitle", { destination: "Cotijuba" })).toContain(
        "Cotijuba",
      );
    }
  });

  it("pluralizes counts per locale (one vs other)", () => {
    expect(createT("en")("places.count", { count: 1 })).toBe("1 place");
    expect(createT("en")("places.count", { count: 7 })).toBe("7 places");
    expect(createT("pt-BR")("places.count", { count: 1 })).toBe("1 lugar");
    expect(createT("de")("places.count", { count: 7 })).toBe("7 Orte");
  });

  it("marks fallback and machine-translation markers with the content locale", () => {
    expect(
      createT("fr")("common.showingOriginal", { locale: "pt-BR" }),
    ).toContain("pt-BR");
    expect(createT("nl")("common.machineTranslated")).not.toBe("");
  });
});

describe("getI18n instances", () => {
  it("returns a cached instance initialized for the locale", () => {
    const a = getI18n("es" as Locale);
    const b = getI18n("es" as Locale);
    expect(a).toBe(b);
    expect(a.language).toBe("es");
  });

  it("covers every locale with a catalog object", () => {
    for (const locale of LOCALES) {
      expect(typeof catalogs[locale]).toBe("object");
    }
  });
});
