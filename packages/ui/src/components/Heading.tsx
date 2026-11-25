import type { ComponentProps } from "react";

import { headingStyleFor } from "./headingStyle";
import type { HeadingLevel } from "./textStyles";
import { Text } from "./Text";

/**
 * Heading primitive (phase 03, task 5): Text plus header semantics.
 *
 * PR #20 review: the semantic `level` and the visual `size` are separate
 * props. `level` decides the document semantics — react-native-web renders
 * `accessibilityRole="header"` as `<h{level}>` from the aria-level — and
 * never the typography once `size` is given; `size` decides the visual
 * size (1 = display, 2 = title, 3 = heading), and never the semantics.
 * `level` defaults to 3 and `size` defaults to the level, so every caller
 * that passes no size (page titles, a bare `<Heading>`) keeps the look it
 * always had.
 *
 * The split exists because the two axes were coupled until #20: fixing the
 * one-h1 rule (a page's only heading carries level 1) silently enlarged
 * every state title to `display` size — a visual change the deferred a11y
 * fix never asked for and phase-03.md reserves for the owner. Pure
 * resolution lives in `headingStyleFor` (headingStyle.test.ts); RN's types
 * carry no aria-level yet (0.88), so the level rides in through a spread
 * (exempt from excess-property checking) which RNW reads.
 */
export type HeadingProps = ComponentProps<typeof Text> & {
  /** Semantic heading level: 1 = h1 … 3 (default) = h3. Sets the look only when `size` is omitted. */
  level?: HeadingLevel;
  /** Visual size: 1 = display, 2 = title, 3 = heading; default: the level. No semantics. */
  size?: HeadingLevel;
};

export function Heading({ level, size, ...props }: HeadingProps) {
  const style = headingStyleFor(level, size);
  const webLevel: { "aria-level": HeadingLevel } = {
    "aria-level": style.level,
  };
  return (
    <Text
      {...webLevel}
      {...props}
      accessibilityRole="header"
      variant={style.variant}
    />
  );
}
