import { describe, expect, it } from "vitest";

import { listRowPressableLabel } from "./listRowLabel";

/**
 * Pressable ListRow accessible-name branching (PR #20 review, findings on
 * ListRow.tsx:106). The default changed from "always pass a composed
 * explicit label" to "let react-native-web compose the name from the
 * children" — the fix for WCAG 2.5.3 Label-in-Name. The old tests covered
 * only the pure composition helper, which the default path no longer
 * calls, so a regression back to the mismatched label would pass `pnpm
 * check`. These pin all three branches of the decision.
 */

describe("listRowPressableLabel", () => {
  it("returns undefined by default so RNW composes the name from children", () => {
    // The Label-in-Name fix: no explicit label → RNW's child-composed name
    // matches the rendered text (a Chip's visible words included).
    expect(listRowPressableLabel({})).toBeUndefined();
  });

  it("lets a caller-provided label win", () => {
    expect(
      listRowPressableLabel({
        accessibilityLabel: "Open Praia do Farol details",
        trailingAccessibilityLabel: "verified",
      }),
    ).toBe("Open Praia do Farol details");
  });

  it("uses the composed label only for an icon-only trailing", () => {
    // trailingAccessibilityLabel carries the fully composed string (title,
    // description, trailing text) — the icon-only case has no visible text
    // of its own to mismatch.
    expect(
      listRowPressableLabel({
        trailingAccessibilityLabel: "Praia do Farol, verified",
      }),
    ).toBe("Praia do Farol, verified");
  });

  it("prefers the caller's label over the trailing label", () => {
    expect(
      listRowPressableLabel({
        accessibilityLabel: "Open",
        trailingAccessibilityLabel: "Praia do Farol, verified",
      }),
    ).toBe("Open");
  });

  it("composes an icon-only trailing name from the text as rendered", () => {
    // WCAG 2.5.3 Label in Name: the explicit name must contain the visible
    // text in render order — title then description joined by a single
    // space — before the icon-only trailing label. A ", "-joined string
    // does not contain "Praia do Farol Lighthouse beach" as rendered.
    expect(
      listRowPressableLabel({
        title: "Praia do Farol",
        description: "Lighthouse beach",
        trailingAccessibilityLabel: "verified",
      }),
    ).toBe("Praia do Farol Lighthouse beach, verified");
  });

  it("appends the below slot's label to the explicit name", () => {
    // The below slot sits under the description: when the name is built
    // explicitly for an icon-only trailing, its text must be spoken too.
    expect(
      listRowPressableLabel({
        title: "Praia do Farol",
        description: "Lighthouse beach",
        trailingAccessibilityLabel: "verified",
        belowAccessibilityLabel:
          "Showing original (Português), Machine translated",
      }),
    ).toBe(
      "Praia do Farol Lighthouse beach, verified, Showing original (Português), Machine translated",
    );
  });
});
