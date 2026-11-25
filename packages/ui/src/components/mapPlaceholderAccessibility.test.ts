import { describe, expect, it } from "vitest";

import { mapPlaceholderAccessibilityLabel } from "./mapPlaceholderAccessibility";

/**
 * MapPlaceholder's accessible-name contract (PR #19 review round 4): the
 * primitive renders an image-role container with an explicit
 * accessibilityLabel, and children of an img role are presentational — so
 * the optional hint Text ("why no map is drawn") is never announced by
 * itself. The label must therefore carry everything a sighted user sees:
 * the label, then the hint folded in ("label. hint").
 */

describe("mapPlaceholderAccessibilityLabel", () => {
  it("returns the label alone when no hint is given", () => {
    expect(mapPlaceholderAccessibilityLabel("Map of Cotijuba")).toBe(
      "Map of Cotijuba",
    );
  });

  it("treats an empty-string hint as absent (no dangling separator)", () => {
    expect(mapPlaceholderAccessibilityLabel("Map of Cotijuba", "")).toBe(
      "Map of Cotijuba",
    );
  });

  it("folds the hint in after the label, sentence-style", () => {
    expect(
      mapPlaceholderAccessibilityLabel(
        "Map of Cotijuba",
        "Real maps arrive with a later phase",
      ),
    ).toBe("Map of Cotijuba. Real maps arrive with a later phase");
  });
});
