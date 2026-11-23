import { describe, expect, it } from "vitest";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { selectTokens } from "../theme/resolve";
import { THEME_MODES } from "../tokens/types";
import type { ThemeTokens, TypographyRole } from "../tokens/types";
import { headingVariantForLevel, textStyleFor } from "./textStyles";

/**
 * Typography variant mapping (phase 03, task 5): Text's `variant` prop
 * and Heading's `level` prop resolve to scale tokens through pure
 * functions — the component never names a font size.
 */

const TOKEN_SETS: [string, ThemeTokens][] = [];
for (const mode of THEME_MODES) {
  TOKEN_SETS.push([`cotijuba/${mode}`, selectTokens(cotijubaPreset, mode)]);
  TOKEN_SETS.push([`serra/${mode}`, selectTokens(serraPreset, mode)]);
}

describe("textStyleFor", () => {
  it.each(TOKEN_SETS)(
    "%s: without a variant, only the text color applies",
    (_label, tokens) => {
      expect(textStyleFor(tokens)).toEqual({ color: tokens.colors.text });
    },
  );

  it.each(TOKEN_SETS)(
    "%s: a variant spreads its whole typography token",
    (_label, tokens) => {
      expect(textStyleFor(tokens, "body")).toEqual({
        color: tokens.colors.text,
        ...tokens.typography.body,
      });
      expect(textStyleFor(tokens, "display")).toEqual({
        color: tokens.colors.text,
        ...tokens.typography.display,
      });
    },
  );

  it.each(TOKEN_SETS)("%s: covers every typography role", (_label, tokens) => {
    const roles = Object.keys(tokens.typography) as TypographyRole[];
    for (const role of roles) {
      const style = textStyleFor(tokens, role);
      expect(style.fontSize).toBe(tokens.typography[role].fontSize);
      expect(style.lineHeight).toBe(tokens.typography[role].lineHeight);
    }
  });
});

describe("headingVariantForLevel", () => {
  it("maps heading levels onto the typography scale", () => {
    expect(headingVariantForLevel(1)).toBe("display");
    expect(headingVariantForLevel(2)).toBe("title");
    expect(headingVariantForLevel(3)).toBe("heading");
  });

  it("defaults an unknown level to the smallest heading", () => {
    expect(headingVariantForLevel(undefined)).toBe("heading");
    expect(headingVariantForLevel(99)).toBe("heading");
  });
});
