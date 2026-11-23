import { z } from "zod";

import {
  COLOR_ROLES,
  ELEVATION_LEVELS,
  FONT_WEIGHTS,
  RADIUS_STEPS,
  SPACING_STEPS,
  THEME_MODES,
  TYPOGRAPHY_ROLES,
} from "./types";
import type { ThemePreset } from "./types";

/**
 * Zod mirror of the token contract (phase 03, task 3). Built from the
 * const arrays in types.ts: `z.record(z.enum(…), …)` is exhaustive in
 * zod 4 — a missing role, an unknown role, or a malformed value all fail
 * validation at authoring time instead of rendering wrong on a device.
 */

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const colorHexSchema = z
  .string()
  .regex(HEX_PATTERN, "expected #RGB or #RRGGBB hex");

export const themeModeSchema = z.enum(THEME_MODES);

export const colorSetSchema = z.record(z.enum(COLOR_ROLES), colorHexSchema);

export const typographyTokenSchema = z.object({
  fontSize: z.number().int().positive(),
  lineHeight: z.number().int().positive(),
  fontWeight: z.enum(FONT_WEIGHTS),
  letterSpacing: z.number(),
});

export const typographyScaleSchema = z.record(
  z.enum(TYPOGRAPHY_ROLES),
  typographyTokenSchema,
);

const nonnegativeInt = z.number().int().nonnegative();
export const spacingScaleSchema = z.record(
  z.enum(SPACING_STEPS),
  nonnegativeInt,
);
export const radiusScaleSchema = z.record(z.enum(RADIUS_STEPS), nonnegativeInt);
export const elevationScaleSchema = z.record(
  z.enum(ELEVATION_LEVELS),
  nonnegativeInt,
);

export const themePresetSchema = z.strictObject({
  id: z.string().min(1),
  defaultMode: themeModeSchema,
  colors: z.strictObject({ light: colorSetSchema, dark: colorSetSchema }),
  typography: typographyScaleSchema,
  spacing: spacingScaleSchema,
  radius: radiusScaleSchema,
  elevation: elevationScaleSchema,
});

/**
 * Parse unknown input as a ThemePreset. The declared return type is the
 * hand-written contract from types.ts, so any drift between the zod shape
 * and the TypeScript shape fails `pnpm typecheck` here, not in a consumer.
 */
export function parseThemePreset(value: unknown): ThemePreset {
  return themePresetSchema.parse(value);
}
