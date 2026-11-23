import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { MIN_HIT_TARGET } from "@guia-la/ui/src/components/hitSlop";
import { linkTargetStyle } from "./link-target-style";

/**
 * Touch-target floor on the app's hand-styled links (PR #19 review round
 * 4; rewritten round 7). The @guia-la/ui primitives enforce
 * MIN_HIT_TARGET = 44 for every press target, but the screens that style
 * an expo-router Link directly bypassed it. Each screen now wraps its Link
 * label in a Pressable carrying linkTargetStyle() — the single object
 * this test asserts against — instead of hand-typing the style, and the
 * floor/centering checks run against that object, not substrings of whole
 * files. Component rendering tests arrive with Phase 05's testing package;
 * until then this pins the style object itself and that each screen uses it.
 */

const SCREENS = [
  // Home page: the locale links are the entry page's primary navigation.
  "../app/index.tsx",
  // Place detail: the back-to-list link is the page's only nav control.
  "../app/[locale]/places/[slug].tsx",
  // Branded not-found: the back-home link.
  "../components/not-found-view.tsx",
] as const;

const STYLE = linkTargetStyle({ spacing: { xs: 4 } });

describe("linkTargetStyle: the hand-styled links' touch-target style", () => {
  it("meets the 44pt MIN_HIT_TARGET floor", () => {
    expect(STYLE).toMatchObject({ minHeight: MIN_HIT_TARGET });
  });

  it("centers its content inside the grown box", () => {
    expect(STYLE).toMatchObject({ justifyContent: "center" });
  });
});

describe("screens hand-style their Links through linkTargetStyle", () => {
  it.each(SCREENS)("%s applies linkTargetStyle", (screen) => {
    const source = readFileSync(join(import.meta.dirname, screen), "utf8");
    expect(source).toContain("linkTargetStyle(tokens)");
  });

  it.each(SCREENS)("%s does not hand-type the floor anymore", (screen) => {
    const source = readFileSync(join(import.meta.dirname, screen), "utf8");
    expect(source).not.toContain("minHeight: MIN_HIT_TARGET");
  });
});
