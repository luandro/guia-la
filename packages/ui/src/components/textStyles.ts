import type { TextStyle } from "react-native";

import type { ThemeTokens, TypographyRole } from "../tokens/types";

/**
 * Typography variant mapping (phase 03, task 5): Text's `variant` and
 * Heading's `level` resolve to scale tokens through pure functions — a
 * component never writes a font size (phase-03.md forbidden list).
 */

/** Text renders any typography role; omitting it keeps the caller's style. */
export type TextVariant = TypographyRole;

/** Base text color plus, when asked, the variant's full typography token. */
export function textStyleFor(
  tokens: ThemeTokens,
  variant?: TextVariant,
): TextStyle {
  const base: TextStyle = { color: tokens.colors.text };
  if (variant === undefined) return base;
  return { ...base, ...tokens.typography[variant] };
}

/** Heading levels map onto the display → heading end of the scale. */
export const HEADING_LEVELS = [1, 2, 3] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

/** Resolve a heading level to its typography role (unknown → smallest). */
export function headingVariantForLevel(level: number | undefined): TextVariant {
  switch (level) {
    case 1:
      return "display";
    case 2:
      return "title";
    default:
      // Level 3 and anything unparsable degrade to the smallest heading
      // rather than to body text — semantics stay heading-shaped.
      return "heading";
  }
}
