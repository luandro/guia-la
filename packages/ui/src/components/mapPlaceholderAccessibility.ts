/**
 * Accessible-name helper for MapPlaceholder (PR #19 review round 4).
 *
 * The primitive renders an image-role container with an explicit
 * accessibilityLabel — and children of an img role are presentational, so
 * the optional hint Text ("why no map is drawn") is never announced by
 * itself. The label must therefore carry everything a sighted user sees:
 * the label, then the hint folded in, sentence-style ("label. hint").
 */
export function mapPlaceholderAccessibilityLabel(
  label: string,
  hint?: string,
): string {
  return hint ? `${label}. ${hint}` : label;
}
