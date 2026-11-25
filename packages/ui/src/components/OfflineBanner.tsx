import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

/**
 * OfflineBanner primitive (phase 03, task 6): the connection is down and
 * content is served from cache or unavailable. While `visible` is false
 * an empty, unstyled status region stays mounted (PR #19 review round 3,
 * W3C ARIA22): a live region must exist before the message is inserted —
 * a region that mounts together with its message is announced
 * unreliably. (Re)appearance is announced politely: this is a routine
 * status — cached content remains usable — so a status role with a
 * polite live region, never an assertive alert, which would interrupt
 * current speech. The warning dot is decorative — the message text
 * carries the meaning, so nothing depends on color alone. Strings arrive
 * translated (D-14).
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
  if (!visible) {
    // The mounted-but-empty status region: no styling, so it occupies no
    // visual space while invisible — it exists only so the message below
    // lands in a live region that already existed.
    return (
      <View accessibilityLiveRegion="polite" role="status" testID={testID} />
    );
  }
  return (
    <View
      // Polite status semantics: role="status" carries an implicit polite
      // live region on web; accessibilityLiveRegion covers Android.
      accessibilityLiveRegion="polite"
      role="status"
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
