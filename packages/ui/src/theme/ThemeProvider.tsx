import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

import type {
  ModeSetting,
  ThemeMode,
  ThemePreset,
  ThemeTokens,
} from "../tokens/types";
import { DEFAULT_PRESET_ID, defaultPreset, themePresets } from "./presets";
import { resolveMode, resolvePreset, selectTokens } from "./resolve";

/**
 * Theme engine (phase 03, task 4). The provider is thin state wiring over
 * the unit-tested pure functions in resolve.ts: preset and mode switching
 * are `useState`, everything else is derived per render.
 */

export type ThemeContextValue = {
  /** Resolved preset — never null; unknown ids fall back to the default. */
  preset: ThemePreset;
  /** The resolved preset's id (may differ from the requested id). */
  presetId: string;
  /** Mode after resolving "system" against the OS color scheme. */
  mode: ThemeMode;
  /** The mode setting as configured ("system" | "light" | "dark"). */
  modeSetting: ModeSetting;
  /** Full token set for the resolved mode. */
  tokens: ThemeTokens;
  setPreset: (presetId: string) => void;
  setMode: (modeSetting: ModeSetting) => void;
};

/**
 * Context default: the default preset in its default mode. `useTheme`
 * outside a provider renders default-themed instead of crashing
 * (phase-03.md negative test: unknown/missing theme never crashes) —
 * wiring a provider is what enables switching.
 */
const fallbackContext: ThemeContextValue = {
  preset: defaultPreset,
  presetId: defaultPreset.id,
  mode: defaultPreset.defaultMode,
  modeSetting: "system",
  tokens: selectTokens(defaultPreset, defaultPreset.defaultMode),
  setPreset: () => {},
  setMode: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(fallbackContext);

export type ThemeProviderProps = {
  children: ReactNode;
  /** Initial preset id; unknown ids fall back to the default (warn once). */
  initialPresetId?: string;
  /** Initial mode setting; defaults to following the OS scheme. */
  initialModeSetting?: ModeSetting;
  /** Registry to resolve against; defaults to the shipped presets. */
  presets?: Readonly<Record<string, ThemePreset>>;
};

export function ThemeProvider({
  children,
  initialPresetId = DEFAULT_PRESET_ID,
  initialModeSetting = "system",
  presets = themePresets,
}: ThemeProviderProps) {
  const [presetId, setPreset] = useState(initialPresetId);
  const [modeSetting, setMode] = useState(initialModeSetting);
  const systemColorScheme = useColorScheme();

  const preset = resolvePreset(presetId, presets);
  const mode = resolveMode(modeSetting, systemColorScheme, preset.defaultMode);
  const tokens = useMemo(() => selectTokens(preset, mode), [preset, mode]);
  const value = useMemo(
    () => ({
      preset,
      presetId: preset.id,
      mode,
      modeSetting,
      tokens,
      setPreset,
      setMode,
    }),
    [preset, mode, modeSetting, tokens],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Consume the active theme tokens and switching functions. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
