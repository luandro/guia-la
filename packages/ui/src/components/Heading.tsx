import type { ComponentProps } from "react";

import { headingVariantForLevel, type HeadingLevel } from "./textStyles";
import { Text } from "./Text";

/**
 * Heading primitive (phase 03, task 5): Text plus header semantics. The
 * `level` maps onto the display → heading end of the typography scale;
 * unknown levels degrade to the smallest heading, not body text.
 *
 * PR #19 review: the level also reaches the web semantics. react-native-web
 * renders `accessibilityRole="header"` as <h1> unless an aria-level is
 * given, so every Heading used to export as h1 and a page's heading
 * hierarchy collapsed (s1-cluster now enforces exactly one h1 per page).
 * RN's types carry no aria-level yet (0.88); the level rides in through a
 * spread (exempt from excess-property checking) which RNW reads.
 */
export type HeadingProps = ComponentProps<typeof Text> & {
  /** 1 = display, 2 = title, 3 (default) = heading role. */
  level?: HeadingLevel;
};

export function Heading({ level = 3, ...props }: HeadingProps) {
  const webLevel: { "aria-level": HeadingLevel } = { "aria-level": level };
  return (
    <Text
      {...webLevel}
      {...props}
      accessibilityRole="header"
      variant={headingVariantForLevel(level)}
    />
  );
}
