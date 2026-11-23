import { describe, expect, it } from "vitest";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { selectTokens } from "../theme/resolve";
import { WCAG_AA_TEXT, contrastRatio } from "../tokens/contrast";
import { THEME_MODES } from "../tokens/types";
import type { ColorSet } from "../tokens/types";
import {
  BUTTON_DISABLED_OPACITY,
  BUTTON_VARIANTS,
  buttonVariantColors,
} from "./buttonStyles";

/**
 * Button variant mapping (phase 03, task 5): every visual a Button shows
 * is derived from theme tokens by a pure function, so the mapping — not
 * a component render — carries the unit tests.
 */

const COLOR_SETS: [string, ColorSet][] = [];
for (const mode of THEME_MODES) {
  COLOR_SETS.push([
    `cotijuba/${mode}`,
    selectTokens(cotijubaPreset, mode).colors,
  ]);
  COLOR_SETS.push([`serra/${mode}`, selectTokens(serraPreset, mode).colors]);
}

describe("BUTTON_VARIANTS", () => {
  it("exposes exactly the three batch-1 variants", () => {
    expect(BUTTON_VARIANTS).toEqual(["primary", "secondary", "ghost"]);
  });

  it("keeps the disabled opacity a visible-but-muted constant", () => {
    expect(BUTTON_DISABLED_OPACITY).toBeGreaterThan(0);
    expect(BUTTON_DISABLED_OPACITY).toBeLessThan(1);
  });
});

describe("buttonVariantColors", () => {
  it.each(COLOR_SETS)(
    "%s: primary is the primary surface with its on-color",
    (_label, colors) => {
      expect(buttonVariantColors(colors, "primary")).toEqual({
        background: colors.primary,
        foreground: colors.onPrimary,
        borderWidth: 0,
      });
    },
  );

  it.each(COLOR_SETS)(
    "%s: secondary is a surface chip outlined by the border role",
    (_label, colors) => {
      expect(buttonVariantColors(colors, "secondary")).toEqual({
        background: colors.surface,
        foreground: colors.primary,
        borderWidth: 1,
      });
    },
  );

  it.each(COLOR_SETS)(
    "%s: ghost is transparent with the primary foreground",
    (_label, colors) => {
      expect(buttonVariantColors(colors, "ghost")).toEqual({
        background: "transparent",
        foreground: colors.primary,
        borderWidth: 0,
      });
    },
  );

  it.each(COLOR_SETS)(
    "%s: every variant's label meets AA on its background",
    (_label, colors) => {
      for (const variant of BUTTON_VARIANTS) {
        const { background, foreground } = buttonVariantColors(colors, variant);
        // "transparent" backgrounds sit on the theme background role.
        const effective =
          background === "transparent" ? colors.background : background;
        expect(
          contrastRatio(foreground, effective),
          `${variant}`,
        ).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
      }
    },
  );
});
