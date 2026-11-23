import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";
import type { ThemeMode } from "../tokens/types";
import {
  STORY_COPY,
  STORY_LOCALES,
  STORY_LOCALE_LABELS,
  copyFor,
  type StoryLocale,
} from "../stories/fixtures";
import { Text } from "./Text";

/**
 * Shared scaffolding for primitive stories (phase 03, tasks 5-7): wraps
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

/**
 * Locale matrix (phase 03, task 7): renders its children once per locale
 * the design system must review — en, pt-BR and de — with a small caption
 * naming each. `de` is the long-text locale the phase calls out for
 * overflow: laying the three side by side (stacked vertically for narrow
 * review panes) is what makes a truncating chip or a wrapping heading
 * obvious. `render(locale)` returns the same primitive with that locale's
 * copy, so a reviewer sees real text width in every state.
 */
export function LocaleMatrix({
  render,
}: {
  render: (locale: StoryLocale) => ReactNode;
}) {
  return (
    <View style={styles.matrix}>
      {STORY_LOCALES.map((locale) => (
        <View key={locale} style={styles.localeSection}>
          <Text variant="caption" style={{ opacity: 0.7 }}>
            {STORY_LOCALE_LABELS[locale]}
          </Text>
          {render(locale)}
        </View>
      ))}
    </View>
  );
}

/** Story helpers re-exported so stories need one import for fixtures. */
export { STORY_COPY, STORY_LOCALES, STORY_LOCALE_LABELS, copyFor };
export type { StoryLocale };

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
  matrix: { gap: 16 },
  localeSection: { gap: 8 },
});
