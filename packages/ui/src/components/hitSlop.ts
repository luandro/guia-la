/**
 * Hit-target math (phase 03, task 5). Pressables smaller than the WCAG
 * 2.5.8 / Apple HIG 44pt minimum grow their touchable area with hitSlop
 * insets instead of their layout — visual size stays token-driven, the
 * target floor is an accessibility constant, not a design token.
 */

/** Minimum press target in points (WCAG 2.5.8 AAA-style guidance, Apple HIG). */
export const MIN_HIT_TARGET = 44;

/** Pressable hitSlop insets (all values ≥ 0; the area only ever grows). */
export type HitSlop = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

const ZERO_SLOP: HitSlop = { top: 0, bottom: 0, left: 0, right: 0 };

/**
 * Insets that expand a `width` × `height` box to at least `minTarget` on
 * each axis. Meets-the-target and oversized boxes get zero insets (never
 * negative — hitSlop cannot shrink a target); an unknown axis gets zero
 * because insets cannot expand what is not measured (pair with minHeight).
 */
export function hitSlop(
  width: number | undefined,
  height: number | undefined,
  minTarget: number = MIN_HIT_TARGET,
): HitSlop {
  const axisInsets = (size: number | undefined): number => {
    if (size === undefined) return 0;
    const deficit = minTarget - size;
    if (deficit <= 0) return 0;
    // Round up: floor could leave the expanded area half a point short.
    return Math.ceil(deficit / 2);
  };
  const horizontal = axisInsets(width);
  const vertical = axisInsets(height);
  if (horizontal === 0 && vertical === 0) return ZERO_SLOP;
  return {
    top: vertical,
    bottom: vertical,
    left: horizontal,
    right: horizontal,
  };
}
