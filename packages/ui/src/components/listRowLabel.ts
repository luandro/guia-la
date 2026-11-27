/**
 * Pressable ListRow accessible-name branching (PR #20 review, findings on
 * ListRow.tsx:106 — the changed logic had no test).
 *
 * Before #20 a pressable ListRow always passed an explicit
 * `accessibilityLabel` (a hand-built `", "`-joined string), which replaced
 * the name react-native-web would compose from the row's children. That
 * string did not contain the rendered, space-less text, so axe reported
 * `label-content-name-mismatch` (WCAG 2.5.3 Label-in-Name) and the label
 * was changed: by default the row passes `undefined` and RNW composes the
 * name from the children (which matches the rendered text), a caller's
 * `accessibilityLabel` wins, and `trailingAccessibilityLabel` (an
 * icon-only trailing with no visible text of its own) still builds an
 * explicit name. That explicit name is composed here from the row's real
 * text, so it contains the visible title and description as rendered —
 * title then description joined by a single space — before the trailing
 * label. The branching and composition are pure, so they live here and are
 * unit-tested; the component just renders what this returns.
 */

export type ListRowLabelInput = {
  /** The row's visible title, rendered first in the title column. */
  title?: string;
  /** The row's visible description, rendered under the title. */
  description?: string;
  /** Accessibility text for an icon-only trailing element. */
  trailingAccessibilityLabel?: string;
  /**
   * Accessibility text for the `below` slot (content under the description)
   * on a pressable row. Appended to the explicit name when present, so the
   * badges/markers spoken there are not lost when the name is hand-built.
   */
  belowAccessibilityLabel?: string;
  /** Caller-provided label; when set, it wins over everything else. */
  accessibilityLabel?: string;
};

/**
 * The `accessibilityLabel` a pressable ListRow passes to its Pressable.
 *
 * - a caller `accessibilityLabel` wins (the caller owns the name);
 * - otherwise, an icon-only trailing (`trailingAccessibilityLabel`) or a
 *   `below` slot needs an explicit name. It starts with the visible text in
 *   render order (title then description joined by a single space, as it
 *   renders), followed by the trailing and below labels — so the name
 *   contains the rendered text and satisfies WCAG 2.5.3 Label-in-Name;
 * - otherwise `undefined`, and react-native-web composes the name from the
 *   children — the only branch that satisfies Label-in-Name for a row whose
 *   trailing has visible text (a Chip).
 */
export function listRowPressableLabel({
  title,
  description,
  trailingAccessibilityLabel,
  belowAccessibilityLabel,
  accessibilityLabel,
}: ListRowLabelInput): string | undefined {
  if (accessibilityLabel !== undefined) return accessibilityLabel;
  const spoken = [trailingAccessibilityLabel, belowAccessibilityLabel].filter(
    (part) => Boolean(part),
  );
  if (spoken.length === 0) return undefined;
  // The two Text children render with a single space between them; a ", "
  // join would not contain that visible string (axe
  // label-content-name-mismatch, WCAG 2.5.3 Label in Name).
  const visible = [title, description]
    .filter((part) => Boolean(part))
    .join(" ");
  return visible ? [visible, ...spoken].join(", ") : spoken.join(", ");
}
