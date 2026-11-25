import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";
import type { ThemeMode } from "../tokens/types";

/**
 * Shared scaffolding for primitive stories (phase 03, tasks 5-6): wraps
 * a story in the theme engine under a named preset × mode and paints the
 * theme's own background so dark presets review on dark. Story files use
 * THEME_STORY_CASES to name their four stories consistently.
 */

/** The four preset × mode combinations every primitive story set covers. */
export const THEME_STORY_CASES: ReadonlyArray<{
  presetId: string;
  mode: ThemeMode;
}> = [
  { presetId: cotijubaPreset.id, mode: "light" },
  { presetId: cotijubaPreset.id, mode: "dark" },
  { presetId: serraPreset.id, mode: "light" },
  { presetId: serraPreset.id, mode: "dark" },
];

export function ThemeStoryFrame({
  presetId,
  mode,
  children,
}: {
  presetId: string;
  mode: ThemeMode;
  children: ReactNode;
}) {
  return (
    <ThemeProvider initialPresetId={presetId} initialModeSetting={mode}>
      <StoryCanvas>{children}</StoryCanvas>
    </ThemeProvider>
  );
}

/** Paints the active theme's background and pads with theme spacing. */
export function StoryCanvas({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View
      style={[
        styles.fill,
        {
          backgroundColor: tokens.colors.background,
          padding: tokens.spacing.lg,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
