import { describe, expect, it } from "vitest";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { selectTokens } from "../theme/resolve";
import { WCAG_AA_TEXT, contrastRatio } from "../tokens/contrast";
import { THEME_MODES } from "../tokens/types";
import type { ColorSet } from "../tokens/types";
import {
  fieldBorderColor,
  fieldHelperColor,
  fieldInputColors,
} from "./fieldStyles";

/**
 * Field state mapping (phase 03, task 6): TextInput's border and helper
 * text colors are pure functions of the interaction state (focused /
 * error) over one mode's colors, so the states are unit-testable without
 * a renderer. Error always dominates focus.
 */

const COLOR_SETS: [string, ColorSet][] = [];
for (const mode of THEME_MODES) {
  COLOR_SETS.push([
    `cotijuba/${mode}`,
    selectTokens(cotijubaPreset, mode).colors,
  ]);
  COLOR_SETS.push([`serra/${mode}`, selectTokens(serraPreset, mode).colors]);
}

describe("fieldBorderColor", () => {
  it.each(COLOR_SETS)(
    "%s: idle fields use the border role",
    (_label, colors) => {
      expect(fieldBorderColor(colors, { focused: false, error: false })).toBe(
        colors.border,
      );
    },
  );

  it.each(COLOR_SETS)(
    "%s: focused fields use the focus role",
    (_label, colors) => {
      expect(fieldBorderColor(colors, { focused: true, error: false })).toBe(
        colors.focus,
      );
    },
  );

  it.each(COLOR_SETS)("%s: error beats focus", (_label, colors) => {
    expect(fieldBorderColor(colors, { focused: true, error: true })).toBe(
      colors.danger,
    );
    expect(fieldBorderColor(colors, { focused: false, error: true })).toBe(
      colors.danger,
    );
  });
});

describe("fieldHelperColor", () => {
  it.each(COLOR_SETS)(
    "%s: hints are muted, errors are danger",
    (_label, colors) => {
      expect(fieldHelperColor(colors, false)).toBe(colors.textMuted);
      expect(fieldHelperColor(colors, true)).toBe(colors.danger);
    },
  );

  it.each(COLOR_SETS)(
    "%s: both helper colors meet AA on the page background",
    (_label, colors) => {
      expect(
        contrastRatio(fieldHelperColor(colors, false), colors.background),
      ).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
      expect(
        contrastRatio(fieldHelperColor(colors, true), colors.background),
      ).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
    },
  );
});

describe("fieldInputColors", () => {
  it.each(COLOR_SETS)(
    "%s: input text meets AA on the input surface",
    (_label, colors) => {
      const input = fieldInputColors(colors);
      expect(input.textColor).toBe(colors.text);
      expect(input.backgroundColor).toBe(colors.surface);
      expect(input.placeholderColor).toBe(colors.textMuted);
      expect(
        contrastRatio(input.textColor, input.backgroundColor),
      ).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
    },
  );
});
