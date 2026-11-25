import { describe, expect, it } from "vitest";

import { hitSlop, MIN_HIT_TARGET } from "./hitSlop";

/**
 * Hit-target expansion (phase 03, task 5). The WCAG 2.5.8 / Apple HIG
 * 44pt floor is enforced on pressables whose visual box is smaller than
 * the minimum: hitSlop computes the invisible insets that grow the
 * touchable area without changing the layout.
 */
describe("hitSlop", () => {
  it("returns zero insets when the box already meets the target", () => {
    expect(hitSlop(MIN_HIT_TARGET, MIN_HIT_TARGET)).toEqual({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
    expect(hitSlop(120, 60)).toEqual({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  });

  it("expands each axis by half the deficit, rounded up", () => {
    // 44 - 24 = 20 deficit → 10 each side.
    expect(hitSlop(24, 24)).toEqual({
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    });
    // 44 - 30 = 14 deficit → 7 each side; width already fine.
    expect(hitSlop(200, 30)).toEqual({
      top: 7,
      bottom: 7,
      left: 0,
      right: 0,
    });
  });

  it("rounds odd deficits up so the expanded area never misses the target", () => {
    // 44 - 25 = 19 → 9.5 each side → ceil to 10 (25 + 20 ≥ 44).
    const slop = hitSlop(25, 25);
    expect(slop.top).toBe(10);
    expect(25 + slop.top + slop.bottom).toBeGreaterThanOrEqual(MIN_HIT_TARGET);
  });

  it("never returns negative insets for an oversized box", () => {
    const slop = hitSlop(300, 300);
    expect(Math.min(slop.top, slop.bottom, slop.left, slop.right)).toBe(0);
  });

  it("leaves an unknown axis at zero instead of guessing", () => {
    // Without a measured height the insets cannot expand it; the caller
    // is expected to also set a minHeight.
    expect(hitSlop(200, undefined)).toEqual({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  });

  it("honors a custom minimum target", () => {
    expect(hitSlop(24, 24, 32)).toEqual({
      top: 4,
      bottom: 4,
      left: 4,
      right: 4,
    });
  });
});
