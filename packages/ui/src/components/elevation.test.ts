import { describe, expect, it } from "vitest";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { selectTokens } from "../theme/resolve";
import { THEME_MODES } from "../tokens/types";
import type { ElevationLevel, ThemeTokens } from "../tokens/types";
import { elevationStyle } from "./elevation";

/**
 * Elevation mapping (phase 03, task 5): the token scale carries the
 * Android `elevation` number; this pure function derives the iOS shadow
 * triple (color/opacity/radius/offset) from it so Card and friends render
 * comparable depth on both platforms without hand-picked per-component
 * values (spec open question, resolved here).
 */

const TOKEN_SETS: [string, ThemeTokens][] = [];
for (const mode of THEME_MODES) {
  TOKEN_SETS.push([`cotijuba/${mode}`, selectTokens(cotijubaPreset, mode)]);
  TOKEN_SETS.push([`serra/${mode}`, selectTokens(serraPreset, mode)]);
}

const SHADOWED_LEVELS: ElevationLevel[] = ["low", "mid", "high"];

describe("elevationStyle", () => {
  it("renders no shadow at level none", () => {
    for (const [, tokens] of TOKEN_SETS) {
      expect(elevationStyle(tokens, "none")).toEqual({ elevation: 0 });
    }
  });

  it.each(TOKEN_SETS)(
    "%s: keeps the scale's elevation number",
    (_label, tokens) => {
      expect(elevationStyle(tokens, "low").elevation).toBe(
        tokens.elevation.low,
      );
      expect(elevationStyle(tokens, "mid").elevation).toBe(
        tokens.elevation.mid,
      );
      expect(elevationStyle(tokens, "high").elevation).toBe(
        tokens.elevation.high,
      );
    },
  );

  it.each(TOKEN_SETS)(
    "%s: derives the iOS shadow from the elevation number",
    (_label, tokens) => {
      for (const level of SHADOWED_LEVELS) {
        const number = tokens.elevation[level];
        expect(elevationStyle(tokens, level)).toEqual({
          elevation: number,
          // PR #19 review: a dedicated mode-independent shadow token, not
          // the text role (dark mode's light text cast a pale halo).
          shadowColor: tokens.colors.shadow,
          shadowOpacity: expect.any(Number),
          shadowRadius: number * 1.5,
          shadowOffset: { width: 0, height: number / 2 },
        });
      }
    },
  );

  it.each(TOKEN_SETS)(
    "%s: grows monotonically with the level",
    (_label, tokens) => {
      const radius = (level: ElevationLevel): number =>
        elevationStyle(tokens, level).shadowRadius ?? 0;
      expect(radius("low")).toBeLessThan(radius("mid"));
      expect(radius("mid")).toBeLessThan(radius("high"));
    },
  );
});
