import type { ComponentProps } from "react";

import { headingVariantForLevel, type HeadingLevel } from "./textStyles";
import { Text } from "./Text";

/**
 * Heading primitive (phase 03, task 5): Text plus header semantics. The
 * `level` maps onto the display → heading end of the typography scale;
 * unknown levels degrade to the smallest heading, not body text.
 */
export type HeadingProps = ComponentProps<typeof Text> & {
  /** 1 = display, 2 = title, 3 (default) = heading role. */
  level?: HeadingLevel;
};

export function Heading({ level = 3, ...props }: HeadingProps) {
  return (
    <Text
      {...props}
      accessibilityRole="header"
      variant={headingVariantForLevel(level)}
    />
  );
}
