import { describe, expect, it } from "vitest";

import { stateHeadingLevel } from "./state-heading-level";

/**
 * The app's state → heading-level contract (PR #20 review, plan.md:173).
 *
 * `pnpm s1` was claimed to prove the one-h1 fix, but the static export is
 * seeded synchronously from the fixture loader, so the empty and error
 * branches never reach the HTML s1 inspects. This pins the choice those
 * branches rely on: a state that renders no other heading is level 1, a
 * state under the page's own h1 stays level 2.
 */

describe("stateHeadingLevel", () => {
  it("makes the empty state the page's only heading (level 1)", () => {
    expect(stateHeadingLevel("empty")).toBe(1);
  });

  it("makes the error state the page's only heading (level 1)", () => {
    expect(stateHeadingLevel("error")).toBe(1);
  });

  it("keeps a state under the page's own h1 at level 2", () => {
    expect(stateHeadingLevel("loaded")).toBe(2);
    expect(stateHeadingLevel("loading")).toBe(2);
  });
});
