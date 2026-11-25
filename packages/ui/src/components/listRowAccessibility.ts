/**
 * Accessible-name helper for pressable ListRow (PR #19 review round 3).
 *
 * An explicit accessibilityLabel on the Pressable replaces the name a
 * screen reader would otherwise compose from the row's children — so the
 * default must carry everything a sighted user sees: title, then
 * description, then the trailing element's accessibility text (the
 * trailing element itself is rendered inside the row, but an explicit
 * label hides it from the composed name; trailingAccessibilityLabel
 * speaks it). A caller-provided label still wins.
 */
export type ListRowAccessibilityLabelInput = {
  title: string;
  description?: string;
  /** Accessibility text for the trailing element (e.g. the Chip's tone). */
  trailingAccessibilityLabel?: string;
  /** Caller-provided label; when set, it wins over the composed default. */
  accessibilityLabel?: string;
};

export function listRowAccessibilityLabel({
  title,
  description,
  trailingAccessibilityLabel,
  accessibilityLabel,
}: ListRowAccessibilityLabelInput): string {
  if (accessibilityLabel) return accessibilityLabel;
  return [title, description, trailingAccessibilityLabel]
    .filter((part) => Boolean(part))
    .join(", ");
}
