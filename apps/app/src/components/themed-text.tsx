import { useTheme } from "expo-router";
import { Text, type TextProps } from "react-native";

/**
 * Screen text in the active theme's foreground color (PR #15 CodeRabbit
 * review): React Native `Text` has no default color, so unstyled text
 * renders black — unreadable on DarkTheme's near-black background. Size,
 * weight and opacity stay in callers' styles; an explicit color in a
 * caller's style still wins (links keep their brand blue).
 */
export function ThemedText(props: TextProps) {
  const { colors } = useTheme();
  return <Text {...props} style={[{ color: colors.text }, props.style]} />;
}
