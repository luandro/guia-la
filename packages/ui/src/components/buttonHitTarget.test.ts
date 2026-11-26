import { describe, expect, it } from "vitest";

import { buttonHitTarget } from "./buttonStyles";
import { MIN_HIT_TARGET } from "./hitSlop";

/**
 * codex review on #19 (P3): Button enforced only minHeight, so a short
 * label such as "×" sized to its content (32 pt of padding plus the glyph)
 * and fell under the 44 pt touch target. Chip already sets both axes.
 */
describe("buttonHitTarget", () => {
  it("guarantees the minimum touch target on both axes", () => {
    expect(buttonHitTarget()).toEqual({
      minHeight: MIN_HIT_TARGET,
      minWidth: MIN_HIT_TARGET,
    });
  });
});
