import type {
  ElevationScale,
  RadiusScale,
  SpacingScale,
  ThemePreset,
  TypographyScale,
} from "../tokens/types";

/**
 * Theme presets (phase 03, task 4). Synthetic palettes derived from the
 * planning packet's visual language (deep teal, lime accent, warm
 * off-white) — no claim of real destination branding; the owner signs off
 * or tunes them as data.
 *
 * Functional hues (danger/success/warning/focus) are shared across
 * presets: they signal meaning, not destination identity.
 */

/** Scales are mode-independent and shared between presets (read-only). */
const typography: TypographyScale = {
  display: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700",
    letterSpacing: 0,
  },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "600", letterSpacing: 0 },
  heading: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "600",
    letterSpacing: 0,
  },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400", letterSpacing: 0 },
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
  label: { fontSize: 13, lineHeight: 17, fontWeight: "500", letterSpacing: 0 },
};

const spacing: SpacingScale = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
};

const radius: RadiusScale = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

const elevation: ElevationScale = {
  none: 0,
  low: 2,
  mid: 6,
  high: 12,
};

const functionalHues = {
  danger: "#B3261E",
  success: "#1E6B34",
  warning: "#8A5A00",
} as const;

const functionalHuesDark = {
  danger: "#F2B8B5",
  success: "#8FD6A0",
  warning: "#E8C268",
} as const;

/**
 * `cotijuba` — pilot destination. Deep teal + lime accent on warm
 * off-white; dark mode is a deliberate deep-teal surface family, not
 * inverted light.
 */
export const cotijubaPreset: ThemePreset = {
  id: "cotijuba",
  defaultMode: "light",
  colors: {
    light: {
      background: "#F7F3E8",
      surface: "#FFFFFF",
      text: "#16332C",
      textMuted: "#51655F",
      primary: "#0F5147",
      onPrimary: "#F7F3E8",
      accent: "#4E7A1E",
      border: "#D8CFBC",
      focus: "#0E7490",
      ...functionalHues,
    },
    dark: {
      background: "#0C1F1B",
      surface: "#14302A",
      text: "#F2EDE0",
      textMuted: "#A8B5AC",
      primary: "#33B594",
      onPrimary: "#0C1F1B",
      accent: "#BFE84C",
      border: "#24463E",
      focus: "#5FD4D4",
      ...functionalHuesDark,
    },
  },
  typography,
  spacing,
  radius,
  elevation,
};

/**
 * `serra` — synthetic mountain demo. Slate-indigo + amber on cool
 * off-white; exists to prove a second destination is data, not a fork.
 */
export const serraPreset: ThemePreset = {
  id: "serra",
  defaultMode: "light",
  colors: {
    light: {
      background: "#F4F2ED",
      surface: "#FFFFFF",
      text: "#232B3A",
      textMuted: "#5A6472",
      primary: "#2F3E68",
      onPrimary: "#F4F2ED",
      accent: "#A05418",
      border: "#D7D2C6",
      focus: "#2E5FA3",
      ...functionalHues,
    },
    dark: {
      background: "#14181F",
      surface: "#1D232D",
      text: "#ECEEF2",
      textMuted: "#A6ADBB",
      primary: "#9DB2F0",
      onPrimary: "#14181F",
      accent: "#E8B44F",
      border: "#2A313D",
      focus: "#8FB7F5",
      ...functionalHuesDark,
    },
  },
  typography,
  spacing,
  radius,
  elevation,
};

/** Registry a provider (or a Phase 06 destination manifest) resolves against. */
export const themePresets: Readonly<Record<string, ThemePreset>> = {
  cotijuba: cotijubaPreset,
  serra: serraPreset,
};

export const DEFAULT_PRESET_ID = "cotijuba";

export const defaultPreset: ThemePreset = cotijubaPreset;
