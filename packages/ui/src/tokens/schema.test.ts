import { describe, expect, it } from "vitest";

import { themePresetSchema } from "./schema";
import { COLOR_ROLES } from "./types";
import type { FontWeight, ThemePreset } from "./types";

/**
 * Schema behavior on a hand-built fixture: the real presets are validated
 * in src/theme/theme.test.ts; these tests pin the schema's own contract
 * (phase 03, task 3).
 */

const baselineColors = {
  background: "#F7F3E8",
  surface: "#FFFFFF",
  text: "#16332C",
  textMuted: "#51655F",
  primary: "#0F5147",
  onPrimary: "#F7F3E8",
  accent: "#4E7A1E",
  border: "#D8CFBC",
  danger: "#B3261E",
  success: "#1E6B34",
  warning: "#8A5A00",
  focus: "#0E7490",
  shadow: "#000000",
} as const;

function typographyToken(
  fontSize: number,
  lineHeight: number,
  fontWeight: FontWeight,
) {
  return { fontSize, lineHeight, fontWeight, letterSpacing: 0 };
}

const baselineScales = {
  typography: {
    display: typographyToken(34, 41, "700"),
    title: typographyToken(24, 30, "600"),
    heading: typographyToken(19, 25, "600"),
    body: typographyToken(16, 24, "400"),
    bodySmall: typographyToken(14, 20, "400"),
    caption: typographyToken(12, 16, "400"),
    label: typographyToken(13, 17, "500"),
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32 },
  radius: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  elevation: { none: 0, low: 2, mid: 6, high: 12 },
};

function baselinePreset(): ThemePreset {
  return {
    id: "baseline",
    defaultMode: "light",
    colors: {
      light: { ...baselineColors },
      dark: { ...baselineColors, background: "#0C1F1B", text: "#F2EDE0" },
    },
    ...baselineScales,
  };
}

describe("themePresetSchema", () => {
  it("accepts a well-formed preset", () => {
    const result = themePresetSchema.safeParse(baselinePreset());
    expect(result.success).toBe(true);
  });

  it("rejects a preset with a missing role in light colors", () => {
    const preset = baselinePreset();
    delete (preset.colors.light as Record<string, string>).text;
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("rejects a preset with a missing role in dark colors", () => {
    const preset = baselinePreset();
    delete (preset.colors.dark as Record<string, string>).focus;
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("rejects an unknown extra role", () => {
    const preset = baselinePreset();
    (preset.colors.light as Record<string, string>).highlight = "#FF0000";
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("rejects a malformed hex value", () => {
    const preset = baselinePreset();
    preset.colors.light.primary = "teal";
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("rejects a non-hex-formatted onPrimary (8-digit RGBA is not a token value)", () => {
    const preset = baselinePreset();
    preset.colors.dark.onPrimary = "#F7F3E8FF";
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("rejects a missing typography role", () => {
    const preset = baselinePreset();
    delete (preset.typography as Record<string, unknown>).caption;
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("rejects a fractional font size and an unsupported weight", () => {
    const fractional = baselinePreset();
    fractional.typography.body.fontSize = 16.5;
    expect(themePresetSchema.safeParse(fractional).success).toBe(false);

    const weighted = baselinePreset();
    (weighted.typography.body as { fontWeight: string }).fontWeight = "800";
    expect(themePresetSchema.safeParse(weighted).success).toBe(false);
  });

  it("rejects a missing spacing step", () => {
    const preset = baselinePreset();
    delete (preset.spacing as Record<string, number>)["2xl"];
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("rejects a negative elevation level", () => {
    const preset = baselinePreset();
    preset.elevation.low = -2;
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("rejects an invalid defaultMode", () => {
    const preset = baselinePreset();
    (preset as { defaultMode: string }).defaultMode = "auto";
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("rejects an unknown top-level key", () => {
    const preset = baselinePreset() as ThemePreset & { brand?: string };
    preset.brand = "guia";
    expect(themePresetSchema.safeParse(preset).success).toBe(false);
  });

  it("covers exactly the thirteen semantic roles from types.ts", () => {
    expect(Object.keys(baselineColors).sort()).toEqual([...COLOR_ROLES].sort());
  });
});
