import { Stack } from "expo-router";

import { ThemeProvider as DestinationThemeProvider } from "@guia-la/ui";

import { getAppConfig } from "@/config/runtime";

/**
 * Root layout (kept from the template's shape, demo tabs replaced by the
 * Places journey — task 02-9). Screens render their own localized titles,
 * so the stack header stays hidden (no user-facing string lives here).
 *
 * Phase 03, task 5 cut-over: the expo-router template theme no longer
 * wraps the navigator. The design-system ThemeProvider (packages/ui)
 * wraps it with the destination preset selected by APP_VARIANT
 * (flagship/cotijuba-web → cotijuba, serra-web → serra), following the
 * OS color scheme; screens and journey UI read all colors from
 * useTheme() tokens, so no template theme constant remains in the app.
 */
export default function RootLayout() {
  const { destinationId } = getAppConfig();
  return (
    <DestinationThemeProvider
      initialPresetId={destinationId}
      initialModeSetting="system"
    >
      <Stack screenOptions={{ headerShown: false }} />
    </DestinationThemeProvider>
  );
}
