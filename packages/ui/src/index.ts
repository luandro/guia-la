/**
 * @guia-la/ui public surface: token contract, theme engine, primitives.
 * Consumers depend only on react/react-native (+ zod for schema parsing);
 * see docs/features/phase-03-design-system/spec.md for the contract.
 */

// Primitives
export { Text, type TextProps } from "./components/Text";

// Token contract: types and const arrays
export {
  COLOR_ROLES,
  ELEVATION_LEVELS,
  FONT_WEIGHTS,
  RADIUS_STEPS,
  SPACING_STEPS,
  THEME_MODES,
  TYPOGRAPHY_ROLES,
} from "./tokens/types";
export type {
  ColorRole,
  ColorSet,
  ElevationLevel,
  ElevationScale,
  FontWeight,
  ModeSetting,
  RadiusScale,
  RadiusStep,
  SpacingScale,
  SpacingStep,
  ThemeMode,
  ThemePreset,
  ThemeTokens,
  TypographyRole,
  TypographyScale,
  TypographyToken,
} from "./tokens/types";

// Token validation
export {
  colorHexSchema,
  colorSetSchema,
  elevationScaleSchema,
  parseThemePreset,
  radiusScaleSchema,
  spacingScaleSchema,
  themeModeSchema,
  themePresetSchema,
  typographyScaleSchema,
  typographyTokenSchema,
} from "./tokens/schema";

// Contrast math (WCAG)
export {
  WCAG_AA_TEXT,
  contrastRatio,
  parseHexColor,
  relativeLuminance,
} from "./tokens/contrast";

// Theme engine
export {
  DEFAULT_PRESET_ID,
  cotijubaPreset,
  defaultPreset,
  serraPreset,
  themePresets,
} from "./theme/presets";
export {
  resetUnknownPresetWarnings,
  resolveMode,
  resolvePreset,
  selectTokens,
} from "./theme/resolve";
export {
  ThemeProvider,
  useTheme,
  type ThemeContextValue,
  type ThemeProviderProps,
} from "./theme/ThemeProvider";
