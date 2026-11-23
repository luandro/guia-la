import { describe, expect, it } from "vitest";

import { listRowAccessibilityLabel } from "./listRowAccessibility";

/**
 * The pressable ListRow's accessible-name contract (PR #19 review round
 * 3): an explicit accessibilityLabel on the Pressable replaces the name a
 * screen reader would otherwise compose from the row's children — so the
 * default label must say everything a sighted user sees: title, then
 * description, then the trailing element's accessibility text.
 */

describe("listRowAccessibilityLabel", () => {
  it("returns the caller-provided label when present (caller wins)", () => {
    expect(
      listRowAccessibilityLabel({
        title: "Praia do Farol",
        description: "Lighthouse beach",
        trailingAccessibilityLabel: "verified",
        accessibilityLabel: "Open Praia do Farol details",
      }),
    ).toBe("Open Praia do Farol details");
  });

  it("composes title, description and trailing text by default", () => {
    expect(
      listRowAccessibilityLabel({
        title: "Praia do Farol",
        description: "Lighthouse beach",
        trailingAccessibilityLabel: "verified",
      }),
    ).toBe("Praia do Farol, Lighthouse beach, verified");
  });

  it("skips absent parts", () => {
    expect(listRowAccessibilityLabel({ title: "Praia do Farol" })).toBe(
      "Praia do Farol",
    );
    expect(
      listRowAccessibilityLabel({
        title: "Praia do Farol",
        trailingAccessibilityLabel: "verified",
      }),
    ).toBe("Praia do Farol, verified");
    expect(
      listRowAccessibilityLabel({
        title: "Praia do Farol",
        description: "Lighthouse beach",
      }),
    ).toBe("Praia do Farol, Lighthouse beach");
  });
});
