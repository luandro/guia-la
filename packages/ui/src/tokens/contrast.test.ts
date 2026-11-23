import { describe, expect, it } from "vitest";

import { WCAG_AA_TEXT, contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("returns 21 for pure black on white (WCAG reference)", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
  });

  it("returns 1 for a color against itself", () => {
    expect(contrastRatio("#34A853", "#34A853")).toBeCloseTo(1, 6);
  });

  it("is symmetric: swapping foreground and background changes nothing", () => {
    const ab = contrastRatio("#0F5147", "#F7F3E8");
    const ba = contrastRatio("#F7F3E8", "#0F5147");
    expect(ab).toBeCloseTo(ba, 10);
  });

  it("matches the known AA boundary: #767676 on white is ~4.54", () => {
    const ratio = contrastRatio("#767676", "#FFFFFF");
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
    expect(ratio).toBeLessThan(4.6);
  });

  it("matches a published WebAIM pair: #777777 on white is 4.48:1", () => {
    // https://webaim.org/resources/contrastchecker/ — fails AA, guards the
    // luminance math against off-by-one channel handling.
    expect(contrastRatio("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
  });

  it("accepts 3-digit shorthand hex", () => {
    expect(contrastRatio("#000", "#FFF")).toBeCloseTo(21, 2);
    expect(contrastRatio("#abc", "#AABBCC")).toBeCloseTo(1, 10);
  });

  it("is case-insensitive for hex digits", () => {
    expect(contrastRatio("#f7f3e8", "#0F5147")).toBeCloseTo(
      contrastRatio("#F7F3E8", "#0f5147"),
      10,
    );
  });

  it.each(["red", "123456", "#12345", "#1234567", "#12345G", "", "#"])(
    "throws on malformed color %j",
    (value) => {
      expect(() => contrastRatio(value, "#FFFFFF")).toThrow(
        /not a #RGB or #RRGGBB hex color/,
      );
      expect(() => contrastRatio("#FFFFFF", value)).toThrow(
        /not a #RGB or #RRGGBB hex color/,
      );
    },
  );
});
