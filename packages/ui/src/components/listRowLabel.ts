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
 * explicit name.
 *
 * That branching is a pure decision — the label to hand the Pressable, or
 * `undefined` when the children must compose the name — so it lives here
 * and is unit-tested. The component just renders what it returns.
 */

export type ListRowLabelInput = {
  /** Caller-provided label; when set, it wins over everything else. */
  accessibilityLabel?: string;
  /** Accessibility text for an icon-only trailing element. */
  trailingAccessibilityLabel?: string;
};

/**
 * The `accessibilityLabel` a pressable ListRow passes to its Pressable.
 *
 * - a caller `accessibilityLabel` wins (the caller owns the name);
 * - otherwise, an icon-only trailing (`trailingAccessibilityLabel`) needs an
 *   explicit name, but it must be composed from the row's real text — the
 *   caller passes the full composed string as `trailingAccessibilityLabel`
 *   only for that icon-only case, so it is used verbatim;
 * - otherwise `undefined`, and react-native-web composes the name from the
 *   children — the only branch that satisfies Label-in-Name for a row whose
 *   trailing has visible text (a Chip).
 */
export function listRowPressableLabel({
  accessibilityLabel,
  trailingAccessibilityLabel,
}: ListRowLabelInput): string | undefined {
  return accessibilityLabel ?? trailingAccessibilityLabel;
}
