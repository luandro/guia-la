/**
 * Token contract (phase 03, task 3): the design-system vocabulary as data.
 *
 * Const arrays are the single source of truth for role/step names — the
 * zod schema in schema.ts is built from them, so TypeScript and the
 * runtime validator cannot drift apart. Color *values* live only in
 * presets under src/theme/; components read them through useTheme().
 */

/** Color modes a theme can resolve to. */
export const THEME_MODES = ["light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

/** Runtime mode setting: follow the OS or pin a mode. */
export type ModeSetting = "system" | ThemeMode;

/**
 * Semantic color roles (exactly twelve). No component may name a color
 * outside this list; a preset must define every role in both modes.
 */
export const COLOR_ROLES = [
  "background",
  "surface",
  "text",
  "textMuted",
  "primary",
  "onPrimary",
  "accent",
  "border",
  "danger",
  "success",
  "warning",
  "focus",
] as const;
export type ColorRole = (typeof COLOR_ROLES)[number];

/** One mode's complete color set (hex strings). */
export type ColorSet = Record<ColorRole, string>;

/** Font weights allowed in the typography scale (RN-safe strings). */
export const FONT_WEIGHTS = ["400", "500", "600", "700"] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

export const TYPOGRAPHY_ROLES = [
  "display",
  "title",
  "heading",
  "body",
  "bodySmall",
  "caption",
  "label",
] as const;
export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number];

export type TypographyToken = {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing: number;
};
export type TypographyScale = Record<TypographyRole, TypographyToken>;

/** 4px-base spacing steps. */
export const SPACING_STEPS = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
export type SpacingStep = (typeof SPACING_STEPS)[number];
export type SpacingScale = Record<SpacingStep, number>;

export const RADIUS_STEPS = ["none", "sm", "md", "lg", "xl", "full"] as const;
export type RadiusStep = (typeof RADIUS_STEPS)[number];
export type RadiusScale = Record<RadiusStep, number>;

/** Android `elevation` numbers; iOS shadow triples land with batch 1. */
export const ELEVATION_LEVELS = ["none", "low", "mid", "high"] as const;
export type ElevationLevel = (typeof ELEVATION_LEVELS)[number];
export type ElevationScale = Record<ElevationLevel, number>;

/** The full token set a component consumes, resolved to one mode. */
export type ThemeTokens = {
  colors: ColorSet;
  typography: TypographyScale;
  spacing: SpacingScale;
  radius: RadiusScale;
  elevation: ElevationScale;
};

/**
 * A destination theme as data (phase-03.md): colors pair per mode; the
 * scales are mode-independent. Adding a destination is adding a preset —
 * never editing a component.
 */
export type ThemePreset = {
  id: string;
  defaultMode: ThemeMode;
  colors: { light: ColorSet; dark: ColorSet };
  typography: TypographyScale;
  spacing: SpacingScale;
  radius: RadiusScale;
  elevation: ElevationScale;
};
