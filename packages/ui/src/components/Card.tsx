import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import type { ElevationLevel } from "../tokens/types";
import { elevationStyle } from "./elevation";

/**
 * Card primitive (phase 03, task 5): a surface container with token
 * radius, border and padding. Depth comes from the elevation scale; the
 * iOS shadow triple is derived from the same token (see elevation.ts), so
 * cards read comparably on both platforms with no per-component tuning.
 */
export type CardProps = ViewProps & {
  /** Elevation level; "none" renders a flat surface. Defaults to low. */
  elevationLevel?: ElevationLevel;
};

export function Card({ elevationLevel = "low", style, ...rest }: CardProps) {
  const { tokens } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: tokens.colors.surface,
          borderColor: tokens.colors.border,
          borderRadius: tokens.radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          padding: tokens.spacing.lg,
        },
        elevationLevel === "none"
          ? null
          : elevationStyle(tokens, elevationLevel),
        style,
      ]}
    />
  );
}
