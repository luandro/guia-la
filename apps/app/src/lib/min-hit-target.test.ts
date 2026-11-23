import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Touch-target floor on the app's hand-styled links (PR #19 review round
 * 4): the @guia-la/ui primitives enforce MIN_HIT_TARGET = 44 for every
 * press target, but the screens that style an expo-router Link directly
 * bypassed it. Component rendering tests arrive with Phase 05's testing
 * package, so until then this pins the fix statically: each screen that
 * hand-styles a navigation Link must set minHeight: MIN_HIT_TARGET and
 * center its content inside the grown box. It catches the regression it
 * names — someone deleting the minHeight line — not every future link.
 */

const SCREENS = [
  // Home page: the locale links are the entry page's primary navigation.
  "../app/index.tsx",
  // Place detail: the back-to-list link is the page's only nav control.
  "../app/[locale]/places/[slug].tsx",
  // Branded not-found: the back-home link.
  "../components/not-found-view.tsx",
] as const;

describe("hand-styled links meet the 44pt MIN_HIT_TARGET floor", () => {
  it.each(SCREENS)("%s uses minHeight: MIN_HIT_TARGET", (screen) => {
    const source = readFileSync(join(import.meta.dirname, screen), "utf8");
    expect(source).toContain("minHeight: MIN_HIT_TARGET");
  });

  it.each(SCREENS)(
    "%s centers the link content inside the grown box",
    (screen) => {
      const source = readFileSync(join(import.meta.dirname, screen), "utf8");
      expect(source).toContain('justifyContent: "center"');
    },
  );
});
