import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import {
  BUTTON_DISABLED_OPACITY,
  buttonHitTarget,
  buttonVariantColors,
  type ButtonVariant,
} from "./buttonStyles";
import { Text } from "./Text";

/**
 * Button primitive (phase 03, task 5): primary / secondary / ghost, all
 * token-resolved through buttonVariantColors; disabled and loading
 * states included. Meets the 44pt minimum target and announces itself
 * (role, label, disabled/busy state) to accessibility clients. The label
 * arrives translated from the caller — no user-facing string lives here.
 */
export type ButtonProps = {
  /** Action label, already translated by the caller (D-14). */
  label: string;
  onPress?: () => void;
  /** Visual variant; defaults to primary. */
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Shows a spinner and blocks presses while true. */
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  /** Cross-axis placement inside the parent; centered containers pass "center". */
  alignSelf?: "flex-start" | "center" | "flex-end" | "stretch";
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  alignSelf = "flex-start",
}: ButtonProps) {
  const { tokens } = useTheme();
  const colors = buttonVariantColors(tokens.colors, variant);
  const inert = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inert, busy: loading }}
      disabled={inert}
      onPress={inert ? undefined : onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          alignSelf,
          ...buttonHitTarget(),
          backgroundColor: colors.background,
          borderColor: tokens.colors.border,
          borderWidth: colors.borderWidth,
          borderRadius: tokens.radius.md,
          opacity: inert ? BUTTON_DISABLED_OPACITY : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.content,
          {
            gap: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.lg,
            paddingVertical: tokens.spacing.sm,
          },
        ]}
      >
        {loading ? (
          // The button already announces busy through accessibilityState,
          // so the spinner is decorative — hide it from assistive tech. On
          // web RNW maps accessibilityHidden → aria-hidden (otherwise axe
          // flags a progressbar with no accessible name, task 8 a11y pass);
          // importantForAccessibility hides it from TalkBack/VoiceOver on
          // native. RN's ActivityIndicator types carry neither prop yet
          // (0.88), so the spread is cast past excess-property checking,
          // the same pattern as role="alert" in TextInput.
          <ActivityIndicator
            size="small"
            color={colors.foreground}
            {...({
              accessibilityHidden: true,
              importantForAccessibility: "no-hide-descendants",
            } as Record<string, unknown>)}
          />
        ) : null}
        <Text variant="label" style={{ color: colors.foreground }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
  },
});
