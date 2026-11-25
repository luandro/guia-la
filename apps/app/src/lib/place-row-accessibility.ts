// Deep import, not the @guia-la/ui barrel: this file is exercised by the
// pure-logic app tests (node environment), and the barrel transitively
// imports react-native, whose Flow sources vite cannot parse there. The
// module itself is pure; move back to the barrel import when Phase 05's
// component-test environment lands.
import { listRowAccessibilityLabel } from "@guia-la/ui/src/components/listRowAccessibility";

/**
 * The places-list row's accessible name (PR #19 review round 4). The
 * expo-router Link wrapping each row carries an explicit
 * accessibilityLabel, which replaces the name a screen reader would
 * otherwise compose from the row's children — so the label must say
 * everything the row shows, in sight order: the place name, the category,
 * then the content-trust markers ("Showing original (...)" /
 * "Machine translated" — the same strings the Chips render; fallback
 * content is never silent, D-14). The markers arrive already translated;
 * the caller picks them from content.isFallback/machineTranslated the way
 * the visible Chips do. Delegates the join to listRowAccessibilityLabel
 * so the row and its wrapped primitive compose names identically.
 */
export function placeRowAccessibilityLabel({
  title,
  category,
  markers,
}: {
  title: string;
  category?: string;
  /** Translated trust-marker strings, in sight order. */
  markers: string[];
}): string {
  return listRowAccessibilityLabel({
    title,
    description: category,
    trailingAccessibilityLabel:
      markers.length > 0 ? markers.join(", ") : undefined,
  });
}
