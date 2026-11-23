import type { ColorSet } from "../tokens/types";

/**
 * Button variant mapping (phase 03, task 5) as a pure function: the
 * component asks for colors, never names one. The AA pairing of each
 * variant's foreground/background is unit-tested over every shipped
 * preset × mode in buttonStyles.test.ts.
 */

export const BUTTON_VARIANTS = ["primary", "secondary", "ghost"] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Disabled buttons stay visible but clearly inert. */
export const BUTTON_DISABLED_OPACITY = 0.5;

export type ButtonVariantColors = {
  /** Container fill ("transparent" for ghost). */
  background: string;
  /** Label and spinner color. */
  foreground: string;
  /** Outline width; 0 means no border. */
  borderWidth: number;
};

/** Resolve a variant's full color triple from one mode's color set. */
export function buttonVariantColors(
  colors: ColorSet,
  variant: ButtonVariant,
): ButtonVariantColors {
  switch (variant) {
    case "primary":
      return {
        background: colors.primary,
        foreground: colors.onPrimary,
        borderWidth: 0,
      };
    case "secondary":
      // Outlined action on the surface, carrying the destination primary.
      return {
        background: colors.surface,
        foreground: colors.primary,
        borderWidth: 1,
      };
    case "ghost":
      // Text-level action: no fill, no border; sits on the page background.
      return {
        background: "transparent",
        foreground: colors.primary,
        borderWidth: 0,
      };
  }
}
