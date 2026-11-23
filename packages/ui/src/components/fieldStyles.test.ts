import { describe, expect, it } from "vitest";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { selectTokens } from "../theme/resolve";
import {
  WCAG_AA_NON_TEXT,
  WCAG_AA_TEXT,
  contrastRatio,
} from "../tokens/contrast";
import { THEME_MODES } from "../tokens/types";
import type { ColorSet } from "../tokens/types";
import {
  fieldA11yProps,
  fieldBorderColor,
  fieldHasError,
  fieldHelperColor,
  fieldHelperId,
  fieldHelperLiveRegion,
  fieldHelperText,
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

  it.each(COLOR_SETS)(
    "%s: idle border meets 1.4.11 non-text contrast against surface and background (PR #19 review round 2)",
    (_label, colors) => {
      const idle = fieldBorderColor(colors, { focused: false, error: false });
      // The field boundary sits between the surface fill (inside) and the
      // page background (outside); WCAG 1.4.11 demands 3:1 against each
      // adjacent color or the boundary is invisible until focus.
      expect(
        contrastRatio(idle, colors.surface),
        `${_label} border ${idle} vs surface ${colors.surface}`,
      ).toBeGreaterThanOrEqual(WCAG_AA_NON_TEXT);
      expect(
        contrastRatio(idle, colors.background),
        `${_label} border ${idle} vs background ${colors.background}`,
      ).toBeGreaterThanOrEqual(WCAG_AA_NON_TEXT);
    },
  );
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

describe("fieldHasError", () => {
  it("treats undefined and the empty string as no error", () => {
    expect(fieldHasError(undefined)).toBe(false);
    expect(fieldHasError("")).toBe(false);
  });

  it("treats any nonempty message as an error", () => {
    expect(fieldHasError("Required")).toBe(true);
    expect(fieldHasError(" ")).toBe(true);
  });
});

describe("fieldHelperText (PR #19 review: a cleared error restores the hint)", () => {
  it("shows the hint when there is no error", () => {
    expect(fieldHelperText(undefined, "Name, category or village")).toBe(
      "Name, category or village",
    );
  });

  it("shows the hint when the caller cleared the error with an empty string", () => {
    // error ?? hint kept "" and rendered nothing; the predicate must match
    // hasError's (a form that sets error="" on valid input loses its hint).
    expect(fieldHelperText("", "Draft saved while offline")).toBe(
      "Draft saved while offline",
    );
  });

  it("a nonempty error replaces the hint", () => {
    expect(fieldHelperText("Missing an @ sign", "We never share it")).toBe(
      "Missing an @ sign",
    );
  });

  it("returns undefined when neither is given", () => {
    expect(fieldHelperText(undefined, undefined)).toBeUndefined();
    expect(fieldHelperText("", undefined)).toBeUndefined();
  });
});

describe("fieldHelperId (PR #19 review round 2: no id without a rendered helper)", () => {
  it("derives the helper element id from useId, colons stripped, when the helper renders", () => {
    expect(fieldHelperId("We never share it", ":r1:")).toBe("field-r1");
  });

  it("returns undefined for an empty helper — the same truthiness as rendering it", () => {
    // fieldHelperText can return "" (hint="" with no error); the helper
    // renders nothing then, so aria-describedby must point nowhere and the
    // announced hint must not be the empty string.
    expect(fieldHelperId("", ":r1:")).toBeUndefined();
    expect(fieldHelperId(undefined, ":r1:")).toBeUndefined();
  });
});

describe("fieldA11yProps (PR #19 review: expose the validation state)", () => {
  it("marks the input invalid from the same predicate as the helper", () => {
    expect(fieldA11yProps(true, "field-helper-1")["aria-invalid"]).toBe(true);
    expect(fieldA11yProps(false, "field-helper-1")["aria-invalid"]).toBe(false);
  });

  it("points aria-describedby at the helper text's element id", () => {
    expect(fieldA11yProps(false, "field-helper-1")).toEqual({
      "aria-invalid": false,
      "aria-describedby": "field-helper-1",
    });
  });

  it("omits aria-describedby when there is no helper text to point at", () => {
    expect(fieldA11yProps(false, undefined)).toEqual({ "aria-invalid": false });
  });
});

describe("fieldHelperLiveRegion (PR #19 deferred finding 03-78a)", () => {
  it("carries the polite live region so an empty helper still announces", () => {
    // The helper Text is always mounted; with no text it is an empty
    // polite live region that a later error message lands inside — the
    // first validation error is announced on Android, not silently drawn.
    expect(fieldHelperLiveRegion()).toEqual({
      accessibilityLiveRegion: "polite",
    });
  });
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
