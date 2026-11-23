import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { mapPlaceholderAccessibilityLabel } from "./mapPlaceholderAccessibility";
import { Text } from "./Text";

/**
 * MapPlaceholder primitive (phase 03, task 6): the honest stand-in for a
 * map that does not exist yet (real maps arrive with Phase 06+ widgets).
 * An image-role box announcing what it will show, so the gap is a named
 * state instead of an empty rectangle. Strings arrive translated (D-14).
 */
export type MapPlaceholderProps = {
  /** What the map will show (used as the accessibility label). */
  label: string;
  /**
   * Optional secondary line, e.g. why no map is drawn. Folded into the
   * accessible name ("label. hint"): children of an img role are
   * presentational, so a hint the label does not carry is never
   * announced (PR #19 review round 4).
   */
  hint?: string;
  testID?: string;
};

export function MapPlaceholder({ label, hint, testID }: MapPlaceholderProps) {
  const { tokens } = useTheme();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={mapPlaceholderAccessibilityLabel(label, hint)}
      testID={testID}
      style={{
        alignItems: "center",
        aspectRatio: 1.6,
        borderColor: tokens.colors.border,
        borderRadius: tokens.radius.lg,
        borderStyle: "dashed",
        borderWidth: 1,
        gap: tokens.spacing.xs,
        justifyContent: "center",
        margin: tokens.spacing.md,
      }}
    >
      <Text variant="bodySmall" style={{ color: tokens.colors.textMuted }}>
        {label}
      </Text>
      {hint ? (
        <Text variant="caption" style={{ color: tokens.colors.textMuted }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
