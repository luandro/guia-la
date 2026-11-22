import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

/**
 * Root layout (kept from the template's shape, demo tabs replaced by the
 * Places journey — task 02-9). Screens render their own localized titles,
 * so the stack header stays hidden (no user-facing string lives here).
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
