import { describe, expect, it } from "vitest";

import { placeSchema } from "./domain.js";

/** A minimal valid place; each test mutates one field. */
const validPlace = {
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

describe("placeSchema.verifiedAt", () => {
  it("accepts a real calendar date", () => {
    expect(placeSchema.safeParse(validPlace).success).toBe(true);
  });

  it("accepts a valid leap-day date", () => {
    const result = placeSchema.safeParse({
      ...validPlace,
      verifiedAt: "2028-02-29",
    });
    expect(result.success).toBe(true);
  });

  it("rejects 2026-02-31 (impossible date, regex-shaped)", () => {
    // The regex ^\d{4}-\d{2}-\d{2}$ passes this; only a calendar round-trip
    // catches it. The detail page renders new Date(y, m-1, d), which would
    // silently roll it forward to March 3.
    const result = placeSchema.safeParse({
      ...validPlace,
      verifiedAt: "2026-02-31",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a leap day in a non-leap year", () => {
    const result = placeSchema.safeParse({
      ...validPlace,
      verifiedAt: "2027-02-29",
    });
    expect(result.success).toBe(false);
  });

  it("rejects month 13 and day 32", () => {
    expect(
      placeSchema.safeParse({ ...validPlace, verifiedAt: "2026-13-01" })
        .success,
    ).toBe(false);
    expect(
      placeSchema.safeParse({ ...validPlace, verifiedAt: "2026-12-32" })
        .success,
    ).toBe(false);
  });

  it("still rejects non-shaped strings", () => {
    expect(
      placeSchema.safeParse({ ...validPlace, verifiedAt: "2026-2-3" }).success,
    ).toBe(false);
    expect(
      placeSchema.safeParse({ ...validPlace, verifiedAt: "26-02-03" }).success,
    ).toBe(false);
  });
});
