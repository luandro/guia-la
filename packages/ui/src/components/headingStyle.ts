/**
 * Heading typography/semantics decoupling (PR #20 review, findings on
 * EmptyState.tsx:36, ErrorState.tsx:37 and journey-ui.tsx:58).
 *
 * `Heading`'s `level` used to pick both the document semantics *and* the
 * visual size (`headingVariantForLevel`: 1 = display, 2 = title, 3 =
 * heading). That coupling meant a pure a11y fix — "a page's only heading
 * is an h1" — silently changed how the component looked: an EmptyState
 * title moved from the compact `heading` style to `display`, the largest
 * in the scale, without owner sign-off (phase-03.md gives visual sign-off
 * to the owner).
 *
 * The two axes are therefore separate now:
 * - `level` carries *semantics only* (the aria-level, hence the exported
 *   h1/h2/h3), never typography;
 * - `size` carries the visual size (1-3), independent of the level.
 *
 * `headingStyleFor(level, size)` is the one place the pair is resolved —
 * a pure function, so the invariant "the level never changes typography
 * and the size never changes semantics" is unit-testable (the old coupling
 * was invisible to tests because both axes were one number).
 */

import type { HeadingLevel } from "./textStyles";
import type { TextVariant } from "./textStyles";

/** The resolved visual + semantic pair `Heading` renders. */
export type HeadingStyle = {
  /** Visual typography role (display / title / heading). */
  variant: TextVariant;
  /** Semantic heading level, exported as the web aria-level. */
  level: HeadingLevel;
};

/**
 * Resolve a heading's semantics and its typography independently.
 *
 * `level` (default 3) is semantics only: it decides the exported h1/h2/h3
 * and nothing visual. `size` (default 3) is the visual size: 1 = display,
 * 2 = title, 3 (and anything unparsable) = the smallest heading, matching
 * the historical `headingVariantForLevel` scale. Omitting both keeps the
 * pre-#20 look — a compact level-3 heading.
 */
export function headingStyleFor(
  level: HeadingLevel | undefined,
  size: HeadingLevel | undefined,
): HeadingStyle {
  const resolvedLevel = level ?? 3;
  const resolvedSize = size ?? 3;
  return {
    variant:
      resolvedSize === 1 ? "display" : resolvedSize === 2 ? "title" : "heading",
    level: resolvedLevel,
  };
}
