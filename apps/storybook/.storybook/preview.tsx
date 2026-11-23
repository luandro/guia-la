import type { ReactNode } from "react";
import { View } from "react-native";

import { ThemeProvider, useTheme } from "@guia-la/ui";

/**
 * Web Storybook preview (phase 03, tasks 7-8).
 *
 * Two responsibilities:
 *
 * 1. A story-level preset/mode switcher (task 7). The `themePreset` and
 *    `themeMode` globals — driven by the toolbar this file registers — wrap
 *    every story in the real theme engine and paint the resolved
 *    background, so a reviewer flips cotijuba↔serra and light↔dark from
 *    the toolbar without editing a story or reloading. Stories that pin
 *    their own `ThemeStoryFrame` (the per-preset matrix) still work: the
 *    inner provider simply wins for that subtree.
 *
 * 2. Accessibility defaults for the `a11y` addon (task 8): axe runs on the
 *    real react-native-web DOM. `pnpm a11y` (tools/a11y-check) drives the
 *    same built Storybook headlessly and fails on serious/critical.
 *
 * The `key` on ThemeProvider remounts the subtree when a global changes,
 * so `useState`-seeded `initialPresetId`/`initialModeSetting` re-seed.
 */

const PRESETS = ["cotijuba", "serra"] as const;
const MODES = ["light", "dark"] as const;

function Background({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        backgroundColor: tokens.colors.background,
        flex: 1,
        minHeight: "100%",
        padding: tokens.spacing.lg,
      }}
    >
      {children}
    </View>
  );
}

const withThemeSwitcher = (
  Story: React.FC,
  context: { globals: Record<string, unknown> },
) => {
  const presetId =
    typeof context.globals.themePreset === "string"
      ? context.globals.themePreset
      : "cotijuba";
  const mode = context.globals.themeMode === "dark" ? "dark" : "light";
  return (
    <ThemeProvider
      key={`${presetId}/${mode}`}
      initialPresetId={presetId}
      initialModeSetting={mode}
    >
      <Background>
        <Story />
      </Background>
    </ThemeProvider>
  );
};

const preview = {
  decorators: [withThemeSwitcher],
  globalTypes: {
    themePreset: {
      description: "Destination preset",
      defaultValue: "cotijuba",
      toolbar: {
        title: "Preset",
        icon: "paintbrush",
        items: PRESETS.map((id) => ({ value: id, title: id })),
        dynamicTitle: true,
      },
    },
    themeMode: {
      description: "Color mode",
      defaultValue: "light",
      toolbar: {
        title: "Mode",
        icon: "circlehollow",
        items: MODES.map((mode) => ({ value: mode, title: mode })),
        dynamicTitle: true,
      },
    },
  },
  a11y: {
    // axe tags to run; wcag2a/wcag2aa cover the AA floor the phase pins.
    // element: { '#storybook-root': ... } not needed — the canvas is the root.
  },
};

export default preview;
