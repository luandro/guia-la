import type { ColorRole, ColorSet } from "../tokens/types";

/**
 * Chip tone mapping (phase 03, task 5): a tone is a color role, resolved
 * by a pure function. Tones are outline chips (surface fill, tone-colored
 * border and label); chipStyles.test.ts pins every tone's label to the
 * AA floor on the chip surface for every preset × mode.
 */

export const CHIP_TONES = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
] as const;
export type ChipTone = (typeof CHIP_TONES)[number];

export type ChipToneColors = {
  background: string;
  foreground: string;
  borderColor: string;
};

/** Meaning tones other than neutral carry their own role. */
const TONE_ROLES: Record<Exclude<ChipTone, "neutral">, ColorRole> = {
  accent: "accent",
  success: "success",
  warning: "warning",
  danger: "danger",
};

/** Resolve a tone's surface/label/border triple from one mode's colors. */
export function chipToneColors(
  colors: ColorSet,
  tone: ChipTone,
): ChipToneColors {
  if (tone === "neutral") {
    return {
      background: colors.surface,
      foreground: colors.textMuted,
      borderColor: colors.border,
    };
  }
  const role = TONE_ROLES[tone];
  return {
    background: colors.surface,
    foreground: colors[role],
    borderColor: colors[role],
  };
}
