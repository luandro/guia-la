import { Text as RNText } from "react-native";

import type { ComponentProps } from "react";

/**
 * Trivial Text primitive (spike S9, PR 03-1).
 *
 * Deliberately a typed pass-through: it exists to prove the story pipeline
 * (workspace resolution, JSX, CSF) on both runtimes before the token layer
 * (PR 03-3) gives it real styling. No colors, font sizes or destination
 * ids are hardcoded here — that is the phase's forbidden list.
 */
export type TextProps = ComponentProps<typeof RNText>;

export function Text(props: TextProps) {
  return <RNText {...props} />;
}
