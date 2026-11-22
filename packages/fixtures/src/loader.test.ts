import { describe, expect, it } from "vitest";

import { loadDestination } from "./loader.js";
import { parseDestinationDataset } from "./parse.js";

const cotijubaPlace = {
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
  },
};

const cotijubaDataset = {
  destination: {
    id: "cotijuba",
    name: "Cotijuba",
    defaultLocale: "pt-BR",
    locales: ["pt-BR", "en", "es", "fr", "nl", "de"],
    source: "synthetic",
  },
  categories: [
    {
      id: "beach",
      label: {
        "pt-BR": "Praia",
        en: "Beach",
        es: "Playa",
        fr: "Plage",
        nl: "Strand",
        de: "Strand",
      },
    },
  ],
  places: [cotijubaPlace],
};

describe("loadDestination", () => {
  it("loads and validates the cotijuba fixture set", () => {
    const result = loadDestination("cotijuba");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.destination.id).toBe("cotijuba");
    expect(result.value.destination.defaultLocale).toBe("pt-BR");
    expect(result.value.places).toHaveLength(7);
    expect(result.value.categories.length).toBeGreaterThan(0);
  });

  it("loads and validates the serra fixture set", () => {
    const result = loadDestination("serra");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.destination.id).toBe("serra");
    expect(result.value.places).toHaveLength(5);
  });

  it("errors (never throws) on an unknown destination id", () => {
    const result = loadDestination("atlantis");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toMatch(/atlantis/);
  });
});

describe("parseDestinationDataset (malformed data never throws)", () => {
  it("accepts a well-formed dataset", () => {
    const result = parseDestinationDataset(cotijubaDataset);
    expect(result.ok).toBe(true);
  });

  it("rejects a place with an invalid slug, naming the place", () => {
    const result = parseDestinationDataset({
      ...cotijubaDataset,
      places: [{ ...cotijubaPlace, slug: "Not A Slug" }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toMatch(/slug/i);
  });

  it("rejects a place missing the default-locale content", () => {
    const result = parseDestinationDataset({
      ...cotijubaDataset,
      places: [
        { ...cotijubaPlace, content: { en: cotijubaPlace.content["pt-BR"] } },
      ],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toMatch(/pt-BR/);
  });

  it("rejects a place whose category is not in categories.json", () => {
    const result = parseDestinationDataset({
      ...cotijubaDataset,
      places: [{ ...cotijubaPlace, category: "waterfall" }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toMatch(/waterfall/);
  });

  it("rejects duplicate slugs within one destination", () => {
    const result = parseDestinationDataset({
      ...cotijubaDataset,
      places: [cotijubaPlace, { ...cotijubaPlace, id: "fx-cotijuba-002" }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toMatch(/praia-da-ponta-norte/);
  });

  it("rejects an out-of-range coordinate", () => {
    const result = parseDestinationDataset({
      ...cotijubaDataset,
      places: [{ ...cotijubaPlace, location: { lat: 120, lng: -48.562 } }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a destination file with a wrong-typed field", () => {
    const result = parseDestinationDataset({
      ...cotijubaDataset,
      destination: { ...cotijubaDataset.destination, name: 42 },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toMatch(/cotijuba/);
  });
});
