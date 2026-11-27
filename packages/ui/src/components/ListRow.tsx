import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { MIN_HIT_TARGET } from "./hitSlop";
import { listRowPressableLabel } from "./listRowLabel";
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
   * Content under the description, inside the title column (badges,
   * markers). It shares the title's width instead of competing with it,
   * so it cannot crowd out the title on a narrow screen (codex review on
   * #19). Wrap it in a wrapping row if it holds several items.
   */
  below?: ReactNode;
  /**
   * Accessibility text for an *icon-only* trailing element (no visible text
   * of its own) on a pressable row. When the trailing has visible text (a
   * Chip), omit it — react-native-web composes the row's name from its
   * children, which already speaks that text, and overriding the name with a
   * hand-built string fails WCAG 2.5.3 Label-in-Name (the ", "-joined label
   * does not contain the rendered, space-less text). Ignored when
   * accessibilityLabel is set (caller wins).
   */
  trailingAccessibilityLabel?: string;
  /**
   * Accessibility text for the `below` slot (content under the description,
   * e.g. trust-marker badges) on a pressable row. It is appended to the
   * explicit name when that name is built — for an icon-only trailing
   * (`trailingAccessibilityLabel`) or for `below` itself — so content that
   * sits under the description is still spoken. The default path (no
   * explicit label) is unchanged: RNW composes the name from the children.
   * Ignored when `accessibilityLabel` is set (caller wins).
   */
  belowAccessibilityLabel?: string;
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
  below,
  trailingAccessibilityLabel,
  belowAccessibilityLabel,
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
        {below}
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

  // By default the accessible name is composed by react-native-web from the
  // row's children (title, description, and the trailing element's own text)
  // — which matches the rendered text, so WCAG 2.5.3 Label-in-Name holds
  // (axe's label-content-name-mismatch, task 8 a11y pass). A caller who
  // passes an explicit accessibilityLabel owns that name. The
  // trailingAccessibilityLabel path builds an explicit label only for an
  // icon-only trailing (no visible text of its own to mismatch); that label
  // starts with the title/description as rendered and appends the below
  // slot's label when one is given. The pure, unit-tested
  // listRowPressableLabel owns the branching and composition.
  const explicitLabel = listRowPressableLabel({
    title,
    description,
    trailingAccessibilityLabel,
    belowAccessibilityLabel,
    accessibilityLabel,
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={explicitLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [...base, pressed ? { opacity: 0.8 } : null]}
    >
      {content}
    </Pressable>
  );
}
