import { beforeEach, describe, expect, it, vi } from "vitest";

import { WCAG_AA_TEXT, contrastRatio } from "../tokens/contrast";
import { themePresetSchema } from "../tokens/schema";
import { COLOR_ROLES, THEME_MODES } from "../tokens/types";
import type { ThemePreset } from "../tokens/types";
import {
  cotijubaPreset,
  defaultPreset,
  serraPreset,
  themePresets,
} from "./presets";
import {
  resetUnknownPresetWarnings,
  resolveMode,
  resolvePreset,
  selectTokens,
} from "./resolve";

/**
 * Preset invariants (schema shape, role coverage, WCAG AA floors) and the
 * pure resolution functions behind ThemeProvider (phase 03, task 4).
 */

const PRESETS: ThemePreset[] = [cotijubaPreset, serraPreset];

describe("shipped presets", () => {
  it("registers cotijuba and serra, with cotijuba as the default", () => {
    expect(Object.keys(themePresets).sort()).toEqual(["cotijuba", "serra"]);
    expect(defaultPreset.id).toBe("cotijuba");
    expect(themePresets[defaultPreset.id]).toBe(defaultPreset);
  });

  it.each(PRESETS.map((preset) => [preset.id, preset]))(
    "%s validates against the token schema",
    (_id, preset) => {
      expect(themePresetSchema.safeParse(preset).success).toBe(true);
    },
  );

  it.each(PRESETS.map((preset) => [preset.id, preset]))(
    "%s defines every color role in both light and dark",
    (_id, preset) => {
      for (const mode of THEME_MODES) {
        const set = preset.colors[mode];
        for (const role of COLOR_ROLES) {
          expect(set, `${preset.id}.${mode}.${role}`).toHaveProperty(role);
        }
      }
    },
  );

  it.each(PRESETS.map((preset) => [preset.id, preset]))(
    "%s dark mode swaps deliberately (not inverted light)",
    (_id, preset) => {
      expect(preset.colors.dark.background).not.toBe(
        preset.colors.light.background,
      );
      expect(preset.colors.dark.text).not.toBe(preset.colors.light.text);
    },
  );

  it.each(PRESETS.map((preset) => [preset.id, preset]))(
    "%s shadow role is a real hex and mode-independent (PR #19 review)",
    (_id, preset) => {
      expect(preset.colors.light.shadow).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(preset.colors.dark.shadow).toBe(preset.colors.light.shadow);
      // Shadows are cast, not read: a dark color in both modes, so dark
      // cards get depth instead of a light halo.
      expect(contrastRatio(preset.colors.light.shadow, "#000000")).toBeLessThan(
        contrastRatio(preset.colors.light.shadow, "#FFFFFF"),
      );
    },
  );

  /**
   * WCAG AA floor, measured per preset and mode with the tested
   * contrastRatio(): text on its backgrounds and onPrimary on primary
   * must reach 4.5:1; muted text is held to the same bar because
   * captions still carry meaning.
   */
  it.each(
    PRESETS.flatMap((preset) =>
      THEME_MODES.map(
        (mode) => [`${preset.id}/${mode}`, preset, mode] as const,
      ),
    ),
  )("%s meets WCAG AA contrast floors", (_label, preset, mode) => {
    const { colors } = selectTokens(preset, mode);
    const pairs: Array<[string, string, string]> = [
      ["text/background", colors.text, colors.background],
      ["text/surface", colors.text, colors.surface],
      ["textMuted/background", colors.textMuted, colors.background],
      ["textMuted/surface", colors.textMuted, colors.surface],
      ["onPrimary/primary", colors.onPrimary, colors.primary],
    ];
    for (const [name, foreground, background] of pairs) {
      const ratio = contrastRatio(foreground, background);
      expect(
        ratio,
        `${preset.id}/${mode} ${name}: ${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
    }
  });
});

describe("resolveMode", () => {
  it("follows the system scheme when the setting is system", () => {
    expect(resolveMode("system", "dark")).toBe("dark");
    expect(resolveMode("system", "light")).toBe("light");
  });

  it("falls back to the given default when the system scheme is unknown", () => {
    expect(resolveMode("system", null)).toBe("light");
    expect(resolveMode("system", null, "dark")).toBe("dark");
    expect(resolveMode("system", undefined, "dark")).toBe("dark");
  });

  it("a pinned mode wins over the system scheme", () => {
    expect(resolveMode("dark", "light")).toBe("dark");
    expect(resolveMode("light", "dark")).toBe("light");
  });
});

describe("resolvePreset", () => {
  beforeEach(() => {
    resetUnknownPresetWarnings();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("returns the registered preset for a known id", () => {
    expect(resolvePreset("serra", themePresets)).toBe(serraPreset);
    expect(resolvePreset("cotijuba", themePresets)).toBe(cotijubaPreset);
  });

  it("falls back to the default preset for an unknown id — never crashes", () => {
    expect(resolvePreset("ilhe-das-aguas", themePresets)).toBe(defaultPreset);
  });

  it("warns once per unknown id, not once per lookup", () => {
    resolvePreset("nope", themePresets);
    resolvePreset("nope", themePresets);
    resolvePreset("nope", themePresets);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('unknown preset "nope"'),
    );

    resolvePreset("also-nope", themePresets);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });
});

describe("selectTokens", () => {
  it("returns the color set of the requested mode with the shared scales", () => {
    const light = selectTokens(cotijubaPreset, "light");
    const dark = selectTokens(cotijubaPreset, "dark");
    expect(light.colors).toEqual(cotijubaPreset.colors.light);
    expect(dark.colors).toEqual(cotijubaPreset.colors.dark);
    expect(light.typography).toEqual(cotijubaPreset.typography);
    expect(dark.spacing).toBe(cotijubaPreset.spacing);
  });

  it("hands out a fresh color set, so consumers cannot mutate the preset", () => {
    const tokens = selectTokens(serraPreset, "light");
    expect(tokens.colors).not.toBe(serraPreset.colors.light);
    tokens.colors.background = "#FF00FF";
    expect(serraPreset.colors.light.background).not.toBe("#FF00FF");
  });
});
