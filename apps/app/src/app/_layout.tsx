import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
} from "expo-router";
import { useColorScheme } from "react-native";

import { ThemeProvider as DestinationThemeProvider } from "@guia-la/ui";

import { getAppConfig } from "@/config/runtime";

/**
 * Root layout (kept from the template's shape, demo tabs replaced by the
 * Places journey — task 02-9). Screens render their own localized titles,
 * so the stack header stays hidden (no user-facing string lives here).
 *
 * Phase 03, task 4: the design-system ThemeProvider (packages/ui) wraps
 * the navigator with the destination preset selected by APP_VARIANT
 * (flagship/cotijuba-web → cotijuba, serra-web → serra) and follows the
 * OS color scheme. Navigation chrome still reads expo-router's theme;
 * screen components cut over to useTheme() with the primitives batch
 * (see docs/features/phase-03-design-system/plan.md).
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { destinationId } = getAppConfig();
  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <DestinationThemeProvider
        initialPresetId={destinationId}
        initialModeSetting="system"
      >
        <Stack screenOptions={{ headerShown: false }} />
      </DestinationThemeProvider>
    </NavigationThemeProvider>
  );
}
