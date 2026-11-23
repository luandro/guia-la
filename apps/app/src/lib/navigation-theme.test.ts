import { describe, expect, it } from "vitest";

import type { ThemeMode, ThemeTokens } from "@guia-la/ui";

import { navigationThemeFor } from "./navigation-theme";

/**
 * Navigation chrome theme bridge (PR #19 review): the navigator's own
 * background (push/pop transitions, the root view before the first screen
 * mounts) must follow the destination tokens, both modes — otherwise dark
 * mode shows a light flash/band over the token-painted screens. Pure
 * function over ThemeTokens so it is unit-testable without a navigator.
 *
 * Token sets are hand-built literals: the app test project cannot import
 * @guia-la/ui at runtime (its index re-exports react-native components);
 * the contract under test is the role mapping, not the preset values.
 */

function tokenSet(overrides: {
  background: string;
  surface: string;
}): ThemeTokens {
  return {
    colors: {
      background: overrides.background,
      surface: overrides.surface,
      text: "#16332C",
      textMuted: "#51655F",
      primary: "#0F5147",
      onPrimary: "#F7F3E8",
      accent: "#4E7A1E",
      border: "#D8CFBC",
      danger: "#B3261E",
      success: "#1E6B34",
      warning: "#8A5A00",
      focus: "#0E7490",
      shadow: "#000000",
    },
    typography: {
      display: {
        fontSize: 34,
        lineHeight: 41,
        fontWeight: "700",
        letterSpacing: 0,
      },
      title: {
        fontSize: 24,
        lineHeight: 30,
        fontWeight: "600",
        letterSpacing: 0,
      },
      heading: {
        fontSize: 19,
        lineHeight: 25,
        fontWeight: "600",
        letterSpacing: 0,
      },
      body: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "400",
        letterSpacing: 0,
      },
      bodySmall: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "400",
        letterSpacing: 0,
      },
      caption: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "400",
        letterSpacing: 0,
      },
      label: {
        fontSize: 13,
        lineHeight: 17,
        fontWeight: "500",
        letterSpacing: 0,
      },
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32 },
    radius: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
    elevation: { none: 0, low: 2, mid: 6, high: 12 },
  };
}

const LIGHT = tokenSet({ background: "#F7F3E8", surface: "#FFFFFF" });
const DARK = tokenSet({ background: "#0C1F1B", surface: "#14302A" });

const MODES: [string, ThemeTokens, ThemeMode][] = [
  ["light", LIGHT, "light"],
  ["dark", DARK, "dark"],
];

describe("navigationThemeFor", () => {
  it.each(MODES)(
    "%s: maps the color roles onto the navigator",
    (_label, tokens, mode) => {
      const theme = navigationThemeFor(tokens, mode);
      expect(theme.colors).toEqual({
        primary: tokens.colors.primary,
        background: tokens.colors.background,
        card: tokens.colors.surface,
        text: tokens.colors.text,
        border: tokens.colors.border,
        notification: tokens.colors.danger,
      });
    },
  );

  it.each(MODES)(
    "%s: flags dark mode from the resolved mode",
    (_label, tokens, mode) => {
      expect(navigationThemeFor(tokens, mode).dark).toBe(mode === "dark");
    },
  );

  it("gives the navigator the dark palette in dark mode (no light flash)", () => {
    const light = navigationThemeFor(LIGHT, "light");
    const dark = navigationThemeFor(DARK, "dark");
    expect(dark.colors.background).toBe("#0C1F1B");
    expect(dark.colors.background).not.toBe(light.colors.background);
    expect(dark.colors.card).not.toBe(light.colors.card);
  });

  it.each(MODES)(
    "%s: derives navigator fonts from the type scale",
    (_label, tokens) => {
      const fonts = navigationThemeFor(tokens, "light").fonts;
      expect(fonts.regular.fontWeight).toBe(tokens.typography.body.fontWeight);
      expect(fonts.medium.fontWeight).toBe(tokens.typography.label.fontWeight);
      expect(fonts.bold.fontWeight).toBe(tokens.typography.heading.fontWeight);
      expect(fonts.heavy.fontWeight).toBe(tokens.typography.display.fontWeight);
    },
  );
});
