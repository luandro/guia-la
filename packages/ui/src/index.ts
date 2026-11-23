/**
 * @guia-la/ui public surface: token contract, theme engine, primitives.
 * Consumers depend only on react/react-native (+ zod for schema parsing);
 * see docs/features/phase-03-design-system/spec.md for the contract.
 */

// Primitives (batch 1, task 5)
export { Button, type ButtonProps } from "./components/Button";
export { Card, type CardProps } from "./components/Card";
export { Chip, type ChipProps } from "./components/Chip";
export { Heading, type HeadingProps } from "./components/Heading";
export { ListRow, type ListRowProps } from "./components/ListRow";
export { Text, type TextProps } from "./components/Text";

// Primitives (batch 2, task 6)
export { EmptyState, type EmptyStateProps } from "./components/EmptyState";
export { ErrorState, type ErrorStateProps } from "./components/ErrorState";
export {
  MapPlaceholder,
  type MapPlaceholderProps,
} from "./components/MapPlaceholder";
export {
  OfflineBanner,
  type OfflineBannerProps,
} from "./components/OfflineBanner";
export { Skeleton, type SkeletonProps } from "./components/Skeleton";
export { TextInput, type TextInputProps } from "./components/TextInput";
export {
  fieldBorderColor,
  fieldHelperColor,
  fieldInputColors,
  type FieldState,
} from "./components/fieldStyles";

// Primitive style resolution (pure, unit-tested)
export {
  BUTTON_DISABLED_OPACITY,
  BUTTON_VARIANTS,
  buttonVariantColors,
  type ButtonVariant,
} from "./components/buttonStyles";
export {
  CHIP_TONES,
  chipToneColors,
  type ChipTone,
} from "./components/chipStyles";
export { SHADOW_OPACITY, elevationStyle } from "./components/elevation";
export { MIN_HIT_TARGET, hitSlop, type HitSlop } from "./components/hitSlop";
export {
  HEADING_LEVELS,
  headingVariantForLevel,
  textStyleFor,
  type HeadingLevel,
} from "./components/textStyles";

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
