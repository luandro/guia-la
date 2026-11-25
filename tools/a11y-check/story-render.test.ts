import { describe, expect, it } from "vitest";

import {
  hasStorybookErrorDisplay,
  isStoryRootEmpty,
  storyRenderFailure,
} from "./story-render.mjs";

/**
 * Story-render detection (PR #20 review, a11y-check.mjs:173). The gate used
 * to wait on the `iframe.html` shell element and count any story as
 * "scanned clean", so a story that threw or rendered nothing passed. These
 * pin the failure detection against the real Storybook 10 DOM shape:
 * `sb-show-errordisplay` on **body** (documentElement stays empty) and an
 * empty `#storybook-root`.
 */

describe("hasStorybookErrorDisplay", () => {
  it("detects Storybook's error-display class on body (the real location)", () => {
    expect(
      hasStorybookErrorDisplay("sb-main-padded sb-show-errordisplay"),
    ).toBe(true);
    // The document element stays empty on a crash, so it cannot be the only
    // source checked.
    expect(hasStorybookErrorDisplay("")).toBe(false);
  });

  it("accepts several sources and matches any of them", () => {
    expect(
      hasStorybookErrorDisplay("sb-show-main", "sb-show-errordisplay"),
    ).toBe(true);
    expect(hasStorybookErrorDisplay("sb-show-main", "")).toBe(false);
  });

  it("accepts a classList-like object", () => {
    expect(
      hasStorybookErrorDisplay({
        contains: (c: string) => c === "sb-show-errordisplay",
      }),
    ).toBe(true);
    expect(hasStorybookErrorDisplay({ contains: () => false })).toBe(false);
  });
});

describe("isStoryRootEmpty", () => {
  it("is true when the root is absent or its decorator wrapper has no children", () => {
    expect(isStoryRootEmpty(null)).toBe(true);
    expect(isStoryRootEmpty({ firstChildElementCount: 0 })).toBe(true);
  });

  it("is false when the decorator wrapper holds the story's root view", () => {
    // Every real story — a Skeleton, a hidden status region, a Button —
    // leaves the wrapper with at least one child.
    expect(isStoryRootEmpty({ firstChildElementCount: 1 })).toBe(false);
    expect(isStoryRootEmpty({ firstChildElementCount: 3 })).toBe(false);
  });
});

describe("storyRenderFailure", () => {
  const rendered = {
    pageErrors: [],
    documentClasses: "",
    bodyClasses: "sb-main-padded sb-show-main",
    root: { childElementCount: 1, textContent: "Continue" },
  };

  it("passes a story that rendered real content", () => {
    expect(storyRenderFailure(rendered)).toBeNull();
  });

  it("fails a story with an uncaught page error", () => {
    expect(
      storyRenderFailure({
        ...rendered,
        pageErrors: ["TypeError: x is not a function"],
      }),
    ).toContain("TypeError");
  });

  it("fails a story showing Storybook's error display", () => {
    expect(
      storyRenderFailure({
        ...rendered,
        bodyClasses: "sb-main-padded sb-show-errordisplay",
        root: { childElementCount: 0, textContent: "" },
      }),
    ).toContain("error display");
  });

  it("fails a story that renders nothing (empty root)", () => {
    expect(
      storyRenderFailure({
        ...rendered,
        root: { firstChildElementCount: 0 },
      }),
    ).toContain("rendered nothing");
  });

  it("fails a story whose root is empty (renders nothing)", () => {
    expect(
      storyRenderFailure({
        ...rendered,
        root: { firstChildElementCount: 0 },
      }),
    ).toContain("rendered nothing");
  });
});
