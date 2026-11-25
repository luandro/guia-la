import { StyleSheet, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@guia-la/ui";

/**
 * Screen container (task 02-9; token cut-over phase 03, task 5): the
 * stack header is hidden (see src/app/_layout.tsx), so every screen owns
 * its safe-area spacing — plain Views with fixed padding let the first
 * heading overlap the status bar or notch on devices with a top inset.
 * This container applies the native insets and paints the background
 * from the design-system theme the root layout wires to the destination
 * preset (packages/ui useTheme) — the expo-router template theme no
 * longer carries screen colors. Insets are 0 on the static web export,
 * so exported raw HTML is unchanged.
 */
export function Screen({ children, style, ...rest }: ViewProps) {
  const insets = useSafeAreaInsets();
  const { tokens } = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: tokens.colors.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
