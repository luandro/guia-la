import { describe, expect, it } from "vitest";

import { headingStyleFor } from "./headingStyle";

/**
 * Heading typography/semantics decoupling (PR #20 review): `Heading`'s
 * semantic `level` and its visual `size` are separate props, so a pure a11y
 * change (which h1 a page exports) can never silently change the typography.
 * This pins the pair: the level only sets the semantics, the size only sets
 * the look, and omitting both keeps the pre-#20 compact level-3 heading.
 */

describe("headingStyleFor", () => {
  it("defaults to the historical compact level-3 heading", () => {
    expect(headingStyleFor(undefined, undefined)).toEqual({
      variant: "heading",
      level: 3,
    });
  });

  it("changes semantics only: a level-1 heading keeps the compact look", () => {
    // The a11y fix that mattered: an EmptyState/ErrorState title can be the
    // page's only heading (level 1) without becoming the display-size type.
    expect(headingStyleFor(1, 3)).toEqual({ variant: "heading", level: 1 });
    expect(headingStyleFor(2, 3)).toEqual({ variant: "heading", level: 2 });
  });

  it("changes size only: the visual size never touches the semantic level", () => {
    expect(headingStyleFor(2, 1)).toEqual({ variant: "display", level: 2 });
    expect(headingStyleFor(1, 2)).toEqual({ variant: "title", level: 1 });
  });

  it("without a size, the level keeps its pre-#20 typography (page titles stay display)", () => {
    // codex review on #20: defaulting size to 3 shrank every existing page
    // h1 (home, not-found, places list, place detail) from display to
    // heading. Only callers that pass a size opt out of the level's look.
    expect(headingStyleFor(1, undefined)).toEqual({
      variant: "display",
      level: 1,
    });
    expect(headingStyleFor(2, undefined)).toEqual({
      variant: "title",
      level: 2,
    });
    expect(headingStyleFor(3, undefined)).toEqual({
      variant: "heading",
      level: 3,
    });
  });

  it("maps each size onto its typography role", () => {
    expect(headingStyleFor(3, 1).variant).toBe("display");
    expect(headingStyleFor(3, 2).variant).toBe("title");
    expect(headingStyleFor(3, 3).variant).toBe("heading");
  });
});
