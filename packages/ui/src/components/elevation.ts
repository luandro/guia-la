import type { ViewStyle } from "react-native";

import type { ElevationLevel, ThemeTokens } from "../tokens/types";

/**
 * Elevation mapping (phase 03, task 5). The token scale carries the
 * Android `elevation` number; the iOS shadow triple is derived from that
 * same number (radius × 1.5, offset height × 0.5, text-role shadow color)
 * so depth is one datum per level, not per-platform hand-tuning. This
 * resolves the spec's open question from PRs 03-3/03-4.
 */

/** Shadow strength — a rendering constant, not a theme token. */
export const SHADOW_OPACITY = 0.15;

/** Platform-neutral elevation style for one level of the token scale. */
export function elevationStyle(
  tokens: ThemeTokens,
  level: ElevationLevel,
): ViewStyle {
  const elevation = tokens.elevation[level];
  if (elevation === 0) return { elevation: 0 };
  return {
    elevation,
    shadowColor: tokens.colors.text,
    shadowOpacity: SHADOW_OPACITY,
    shadowRadius: elevation * 1.5,
    shadowOffset: { width: 0, height: elevation / 2 },
  };
}
