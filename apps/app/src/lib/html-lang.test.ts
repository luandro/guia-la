import { describe, expect, it } from "vitest";

import { langForPath } from "./html-lang.js";

describe("langForPath", () => {
  it("uses the route's locale segment", () => {
    expect(langForPath("/pt-BR/places")).toBe("pt-BR");
    expect(langForPath("/de/places/praia-do-vento-leste")).toBe("de");
  });

  it("falls back to en outside locale routes (root, dynamic shells)", () => {
    expect(langForPath("/")).toBe("en");
    expect(langForPath("/[locale]/places/[slug]")).toBe("en");
  });
});
