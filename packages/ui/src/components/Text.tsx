import { Text as RNText } from "react-native";

import type { ComponentProps } from "react";

import { useTheme } from "../theme/ThemeProvider";
import { textStyleFor, type TextVariant } from "./textStyles";

/**
 * Text primitive: token-driven since PRs 03-3/03-4, extended in task 5
 * with the `variant` prop — a typography role resolved through the scale,
 * never a literal font size. Defaults its color to the active theme's
 * `text` role; an explicit style still wins (array order puts props.style
 * last). No colors, font sizes or destination ids are hardcoded here —
 * that is the phase's forbidden list.
 */
export type TextProps = ComponentProps<typeof RNText> & {
  /** Typography role to apply (see tokens.typography). */
  variant?: TextVariant;
};

export function Text({ variant, ...props }: TextProps) {
  const { tokens } = useTheme();
  return (
    <RNText {...props} style={[textStyleFor(tokens, variant), props.style]} />
  );
}
