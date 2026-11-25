import { describe, expect, it } from "vitest";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { selectTokens } from "../theme/resolve";
import { WCAG_AA_TEXT, contrastRatio } from "../tokens/contrast";
import { THEME_MODES } from "../tokens/types";
import type { ColorSet } from "../tokens/types";
import { CHIP_TONES, chipToneColors } from "./chipStyles";

/**
 * Chip tone mapping (phase 03, task 5): tones are color roles, resolved
 * by a pure function; the AA assertions pin the tone foregrounds to the
 * contrast floor on the chip surface so no tone can ship unreadable.
 */

const COLOR_SETS: [string, ColorSet][] = [];
for (const mode of THEME_MODES) {
  COLOR_SETS.push([
    `cotijuba/${mode}`,
    selectTokens(cotijubaPreset, mode).colors,
  ]);
  COLOR_SETS.push([`serra/${mode}`, selectTokens(serraPreset, mode).colors]);
}

describe("CHIP_TONES", () => {
  it("exposes the batch-1 tone set", () => {
    expect(CHIP_TONES).toEqual([
      "neutral",
      "accent",
      "success",
      "warning",
      "danger",
    ]);
  });
});

describe("chipToneColors", () => {
  it.each(COLOR_SETS)(
    "%s: neutral uses the border and muted-text roles",
    (_label, colors) => {
      expect(chipToneColors(colors, "neutral")).toEqual({
        background: colors.surface,
        foreground: colors.textMuted,
        borderColor: colors.border,
      });
    },
  );

  it.each(COLOR_SETS)(
    "%s: meaning tones use their own role for border and text",
    (_label, colors) => {
      expect(chipToneColors(colors, "accent")).toEqual({
        background: colors.surface,
        foreground: colors.accent,
        borderColor: colors.accent,
      });
      expect(chipToneColors(colors, "danger")).toEqual({
        background: colors.surface,
        foreground: colors.danger,
        borderColor: colors.danger,
      });
    },
  );

  it.each(COLOR_SETS)(
    "%s: every tone's label meets AA on the chip surface",
    (_label, colors) => {
      for (const tone of CHIP_TONES) {
        const { foreground, background } = chipToneColors(colors, tone);
        expect(
          contrastRatio(foreground, background),
          tone,
        ).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
      }
    },
  );
});
