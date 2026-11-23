import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

/**
 * OfflineBanner primitive (phase 03, task 6): the connection is down and
 * content is served from cache or unavailable. Renders nothing while
 * `visible` is false; the alert role announces (re)appearance. The
 * warning dot is decorative — the message text carries the meaning, so
 * nothing depends on color alone. Strings arrive translated (D-14).
 */
export type OfflineBannerProps = {
  message: string;
  visible?: boolean;
  testID?: string;
};

export function OfflineBanner({
  message,
  visible = true,
  testID,
}: OfflineBannerProps) {
  const { tokens } = useTheme();
  if (!visible) return null;
  return (
    <View
      accessibilityRole="alert"
      testID={testID}
      style={{
        alignItems: "center",
        backgroundColor: tokens.colors.surface,
        borderColor: tokens.colors.warning,
        borderRadius: tokens.radius.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: tokens.spacing.sm,
        marginHorizontal: tokens.spacing.sm,
        marginVertical: tokens.spacing.xs,
        paddingHorizontal: tokens.spacing.md,
        paddingVertical: tokens.spacing.sm,
      }}
    >
      <View
        style={{
          width: tokens.spacing.sm,
          height: tokens.spacing.sm,
          borderRadius: tokens.radius.full,
          backgroundColor: tokens.colors.warning,
        }}
      />
      <Text variant="bodySmall">{message}</Text>
    </View>
  );
}
