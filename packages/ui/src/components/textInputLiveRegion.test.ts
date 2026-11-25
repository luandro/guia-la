import { createRequire } from "node:module";

import { describe, expect, it, vi } from "vitest";

/**
 * TextInput's always-mounted helper live region (PR #20 review, findings on
 * fieldStyles.test.ts:189).
 *
 * Deferred finding 03-78a is that the helper `Text` must stay mounted when
 * empty: a live region that mounts together with its message is announced
 * unreliably (W3C ARIA22), so an empty polite region stays in place and the
 * first error message lands inside an already-live region. The old test
 * only asserted `fieldHelperLiveRegion()` returns `{accessibilityLiveRegion:
 * "polite"}` — a constant, which would still pass if TextInput went back to
 * `{helper ? <Text .../> : null}`. This renders the real component with no
 * hint and no error and asserts the polite helper node exists before any
 * message, then that a later error lands inside that same live region.
 *
 * react-native resolves to its Flow source under vitest, so the component is
 * rendered against react-native-web (the same DOM Storybook and the a11y
 * gate see). `react-dom/server` is reached through createRequire because it
 * is not a dependency of packages/ui (component tests are Phase 05; this is
 * a focused unit render, not a testing-library setup).
 */

vi.mock("react-native", async () => {
  const req = createRequire(import.meta.url);
  return req("react-native-web");
});

const req = createRequire(import.meta.url);
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");

const { TextInput } =
  (await import("./TextInput")) as typeof import("./TextInput");

function renderText(input: Record<string, unknown>): string {
  return renderToStaticMarkup(React.createElement(TextInput, input));
}

/** The helper Text's element id, as TextInput derives it from useId. */
const HELPER_ID = /id="(field-[^"]+)"/;

describe("TextInput helper live region is mounted while empty (03-78a)", () => {
  it("renders a polite helper region with no hint and no error", () => {
    const html = renderText({ label: "Email" });
    // The helper Text carries aria-live="polite" even with nothing to say,
    // so the first error message lands in a region that already existed.
    // (The element has no id while empty: fieldHelperId is undefined with
    // nothing to point aria-describedby at.)
    expect(html).toMatch(/aria-live="polite"/);
    expect(html).not.toMatch(/id="field-/);
  });

  it("has no aria-describedby while the helper is empty (nothing to point at)", () => {
    const html = renderText({ label: "Email" });
    // fieldHelperId returns undefined for an empty helper, and the input
    // must not point at an unrendered id.
    expect(html).not.toMatch(/aria-describedby=/);
  });

  it("the same region announces a later error (a message lands inside it)", () => {
    const html = renderText({ label: "Email", error: "Missing an @ sign" });
    // The region still exists, now carrying the message, and the input
    // points at it — the first error is announced, not silently drawn.
    expect(html).toMatch(/aria-live="polite"/);
    expect(html).toContain("Missing an @ sign");
    const helperId = html.match(HELPER_ID)?.[1];
    expect(helperId).toBeDefined();
    expect(html).toContain(`aria-describedby="${helperId}"`);
    expect(html).toMatch(/aria-invalid="true"/);
  });
});
