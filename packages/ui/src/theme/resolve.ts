import type {
  ModeSetting,
  ThemeMode,
  ThemePreset,
  ThemeTokens,
} from "../tokens/types";

import { defaultPreset, themePresets } from "./presets";

/**
 * Pure resolution functions behind ThemeProvider (phase 03, task 4) — the
 * switching logic is unit-testable without a renderer; the provider itself
 * is thin state wiring over these.
 */

/** Resolve a mode setting against the OS scheme; unknown scheme falls back. */
export function resolveMode(
  modeSetting: ModeSetting,
  systemColorScheme: ThemeMode | null | undefined,
  fallback: ThemeMode = "light",
): ThemeMode {
  if (modeSetting !== "system") return modeSetting;
  return systemColorScheme ?? fallback;
}

const warnedPresetIds = new Set<string>();

/**
 * Resolve a preset id against a registry. Unknown ids fall back to the
 * default preset and warn once per id — a typo must degrade visibly in
 * dev logs, never crash a screen (phase-03.md negative test).
 */
export function resolvePreset(
  presetId: string,
  presets: Readonly<Record<string, ThemePreset>> = themePresets,
  fallback: ThemePreset = defaultPreset,
): ThemePreset {
  const found = presets[presetId];
  if (found !== undefined) return found;
  if (!warnedPresetIds.has(presetId)) {
    warnedPresetIds.add(presetId);
    console.warn(
      `[theme] unknown preset "${presetId}" — falling back to "${fallback.id}" (known: ${Object.keys(presets).join(", ")})`,
    );
  }
  return fallback;
}

/** Test hook: clear the warn-once memo between test cases. */
export function resetUnknownPresetWarnings(): void {
  warnedPresetIds.clear();
}

/**
 * Materialize the token set for one mode: a fresh color record (consumers
 * may treat it as their own) over the preset's shared, read-only scales.
 */
export function selectTokens(
  preset: ThemePreset,
  mode: ThemeMode,
): ThemeTokens {
  return {
    colors: { ...preset.colors[mode] },
    typography: preset.typography,
    spacing: preset.spacing,
    radius: preset.radius,
    elevation: preset.elevation,
  };
}
