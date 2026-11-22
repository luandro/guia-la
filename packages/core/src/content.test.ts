import { describe, expect, it } from "vitest";

import type { Place } from "./domain.js";
import { resolveContent } from "./content.js";

const place: Place = {
  id: "fx-cotijuba-001",
  slug: "praia-da-ponta-norte",
  category: "beach",
  location: { lat: -1.238, lng: -48.562 },
  source: "synthetic",
  verifiedAt: "2026-11-22",
  content: {
    "pt-BR": {
      name: "Praia da Ponta Norte",
      summary: "Praia calma na ponta norte da ilha.",
      machineTranslated: false,
    },
    en: {
      name: "Ponta Norte Beach",
      summary: "Quiet beach on the island's northern tip.",
      machineTranslated: true,
    },
  },
};

describe("resolveContent", () => {
  it("returns the exact locale when present, not marked as fallback", () => {
    expect(resolveContent(place, "en", "pt-BR")).toEqual({
      name: "Ponta Norte Beach",
      summary: "Quiet beach on the island's northern tip.",
      locale: "en",
      isFallback: false,
      machineTranslated: true,
    });
  });

  it("falls back to the default locale and marks it", () => {
    expect(resolveContent(place, "de", "pt-BR")).toEqual({
      name: "Praia da Ponta Norte",
      summary: "Praia calma na ponta norte da ilha.",
      locale: "pt-BR",
      isFallback: true,
      machineTranslated: false,
    });
  });

  it("keeps machineTranslated true through a fallback", () => {
    const onlyMachineTranslated: Place = {
      ...place,
      content: {
        "pt-BR": {
          name: "Praia X",
          summary: "Resumo",
          machineTranslated: true,
        },
      },
    };
    const resolved = resolveContent(onlyMachineTranslated, "fr", "pt-BR");
    expect(resolved.isFallback).toBe(true);
    expect(resolved.machineTranslated).toBe(true);
  });

  it("throws a named error when neither locale nor default exist (loader-prevented)", () => {
    const broken: Place = { ...place, content: {} };
    expect(() => resolveContent(broken, "de", "pt-BR")).toThrow(
      /fx-cotijuba-001.*pt-BR/,
    );
  });
});
