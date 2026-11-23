import type { Theme } from "expo-router";

import type { ThemeMode, ThemeTokens } from "@guia-la/ui";

/**
 * Navigation theme bridge (PR #19 review). The design-system
 * ThemeProvider styles the screens, but the navigator's own chrome —
 * push/pop transition backgrounds, the root view before the first screen
 * mounts — reads React Navigation's theme, which was left on the light
 * DefaultTheme after the template themes were removed: dark-mode users got
 * a light flash/band wherever it showed.
 *
 * This derives the navigator theme from the resolved destination tokens
 * for each mode (no template color literal returns):
 *   background ← colors.background, card ← colors.surface,
 *   text ← colors.text, border ← colors.border, primary ← colors.primary,
 *   notification ← colors.danger (badge semantics — the nearest role).
 * Fonts carry no family of their own (the scale has none); the weights
 * come from the scale so navigator text stays token-driven.
 */
export function navigationThemeFor(
  tokens: ThemeTokens,
  mode: ThemeMode,
): Theme {
  return {
    dark: mode === "dark",
    colors: {
      primary: tokens.colors.primary,
      background: tokens.colors.background,
      card: tokens.colors.surface,
      text: tokens.colors.text,
      border: tokens.colors.border,
      notification: tokens.colors.danger,
    },
    fonts: {
      regular: {
        fontFamily: "System",
        fontWeight: tokens.typography.body.fontWeight,
      },
      medium: {
        fontFamily: "System",
        fontWeight: tokens.typography.label.fontWeight,
      },
      bold: {
        fontFamily: "System",
        fontWeight: tokens.typography.heading.fontWeight,
      },
      heavy: {
        fontFamily: "System",
        fontWeight: tokens.typography.display.fontWeight,
      },
    },
  };
}
