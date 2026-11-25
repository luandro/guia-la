// Deep import, not the @guia-la/ui barrel: this file is exercised by the
// pure-logic app tests (node environment), and the barrel transitively
// imports react-native, whose Flow sources vite cannot parse there (same
// constraint as place-row-accessibility.ts and app-config.test.ts). The
// hit-target module itself is pure; move back to the barrel import when
// Phase 05's component-test environment lands.
import type { StyleProp, ViewStyle } from "react-native";

import { MIN_HIT_TARGET } from "@guia-la/ui/src/components/hitSlop";

/**
 * The touch-target style every hand-styled navigation link applies (PR #19
 * review round 4; extracted round 7). A link the app styles itself (an
 * expo-router Link without `asChild` renders a Text, so the label is
 * wrapped in a Pressable and the box is centered on the Pressable) must
 * carry this object, not a hand-typed copy — min-hit-target.test.ts asserts
 * against the object itself so a regression is pinned where it is defined.
 * `justifyContent` on the Link's own style did nothing: Text is not a flex
 * container; the floor and the centering live on the Pressable wrapper.
 */
export function linkTargetStyle(tokens: {
  spacing: { xs: number };
}): StyleProp<ViewStyle> {
  return {
    minHeight: MIN_HIT_TARGET,
    justifyContent: "center",
    paddingVertical: tokens.spacing.xs,
  };
}
