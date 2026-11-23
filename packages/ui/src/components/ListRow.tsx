import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { MIN_HIT_TARGET } from "./hitSlop";
import { listRowAccessibilityLabel } from "./listRowAccessibility";
import { Text } from "./Text";

/**
 * ListRow primitive (phase 03, task 5): one row of a list or directory —
 * title, optional description, optional trailing element (a Chip, a
 * chevron). Pressable rows are buttons with a 44pt minimum target and an
 * optional hairline separator; all metrics are tokens. Strings arrive
 * translated from the caller (D-14).
 */
export type ListRowProps = {
  title: string;
  description?: string;
  /** Right-side slot (chip, chevron, counter). */
  trailing?: ReactNode;
  /**
   * Accessibility text for the trailing element on pressable rows: an
   * explicit label on the Pressable hides the row's children from the
   * composed name, so the trailing element must be spoken through this
   * prop (e.g. the Chip's tone meaning). Ignored when accessibilityLabel
   * is set (PR #19 review round 3).
   */
  trailingAccessibilityLabel?: string;
  onPress?: () => void;
  /** Draw the bottom hairline separator; default false. */
  separator?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export function ListRow({
  title,
  description,
  trailing,
  trailingAccessibilityLabel,
  onPress,
  separator = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ListRowProps) {
  const { tokens } = useTheme();

  const base = [
    {
      alignItems: "center" as const,
      flexDirection: "row" as const,
      gap: tokens.spacing.md,
      minHeight: MIN_HIT_TARGET,
      paddingVertical: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.lg,
    },
    separator
      ? {
          borderColor: tokens.colors.border,
          borderBottomWidth: 1,
        }
      : null,
  ];
  const content = (
    <>
      <View style={{ flex: 1, gap: tokens.spacing.xs }}>
        <Text variant="heading">{title}</Text>
        {description ? (
          <Text variant="bodySmall" style={{ color: tokens.colors.textMuted }}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing}
    </>
  );

  if (!onPress) {
    return (
      <View style={base} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      // The default label composes title + description (+ trailing text):
      // an explicit label replaces the name a screen reader would build
      // from the children, so it must say everything the row shows
      // (PR #19 review round 3). A caller-provided label wins inside the
      // helper.
      accessibilityLabel={listRowAccessibilityLabel({
        title,
        description,
        trailingAccessibilityLabel,
        accessibilityLabel,
      })}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [...base, pressed ? { opacity: 0.8 } : null]}
    >
      {content}
    </Pressable>
  );
}
