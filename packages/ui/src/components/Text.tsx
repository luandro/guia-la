import { Text as RNText } from "react-native";

import type { ComponentProps } from "react";

import { useTheme } from "../theme/ThemeProvider";

/**
 * Text primitive: the S9 spike's pass-through, now token-driven (PRs
 * 03-3/03-4). Defaults its color to the active theme's `text` role; an
 * explicit style still wins (array order puts props.style last). No
 * colors, font sizes or destination ids are hardcoded here — that is the
 * phase's forbidden list.
 */
export type TextProps = ComponentProps<typeof RNText>;

export function Text(props: TextProps) {
  const { tokens } = useTheme();
  return (
    <RNText {...props} style={[{ color: tokens.colors.text }, props.style]} />
  );
}
