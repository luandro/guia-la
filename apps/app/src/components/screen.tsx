import { useTheme } from "expo-router";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Screen container (PR #15 CodeRabbit review): the stack header is hidden
 * (see src/app/_layout.tsx), so every screen owns its safe-area spacing —
 * plain Views with fixed padding let the first heading overlap the status
 * bar or notch on devices with a top inset. This container applies the
 * native insets and pairs the content background with the active theme
 * (dark mode), which the native stack screen background otherwise carries
 * alone. Insets are 0 on the static web export, so exported raw HTML is
 * unchanged.
 */
export function Screen({ children, style, ...rest }: ViewProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
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
          backgroundColor: colors.background,
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
