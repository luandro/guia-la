import { createRequire } from "node:module";

import { describe, expect, it, vi } from "vitest";

/**
 * codex review on #19 (P2): the places list passed its translation badges
 * as ListRow's `trailing` element, a non-wrapping sibling of the title
 * column, so on a narrow screen or at large text two badges could take
 * the row's width away from the place name. ListRow now has a `below`
 * slot rendered *inside* the title column, under the description, where
 * content shares the title's width instead of competing with it.
 *
 * Rendered against react-native-web (react-native resolves to its Flow
 * source under vitest); react-dom/server through createRequire because it
 * is not a dependency of packages/ui.
 */

vi.mock("react-native", async () => {
  const req = createRequire(import.meta.url);
  return req("react-native-web");
});

const req = createRequire(import.meta.url);
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");
const { Text } = req("react-native-web");

const { ListRow } = (await import("./ListRow")) as typeof import("./ListRow");
const { ThemeProvider } =
  (await import("../theme/ThemeProvider")) as typeof import("../theme/ThemeProvider");

function render(props: Record<string, unknown>): string {
  return renderToStaticMarkup(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(ListRow, props),
    ),
  );
}

/** Index just past the element that encloses `marker`'s nearest open div. */
function columnOf(html: string, marker: string): string {
  const at = html.indexOf(marker);
  // Walk back to the title column's opening div: the last "<div" before the
  // title text whose subtree we then slice by balancing div tags forward.
  const open = html.lastIndexOf("<div", html.lastIndexOf("<div", at) - 1);
  let depth = 0;
  const tag = /<\/?div\b/g;
  tag.lastIndex = open;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    depth += m[0] === "<div" ? 1 : -1;
    if (depth === 0) return html.slice(open, m.index);
  }
  return html.slice(open);
}

describe("ListRow below slot", () => {
  it("renders below-content inside the title column, not beside it", () => {
    const html = render({
      title: "TITLE-MARK",
      description: "DESC-MARK",
      below: React.createElement(Text, null, "BELOW-MARK"),
      trailing: React.createElement(Text, null, "TRAILING-MARK"),
    });
    const column = columnOf(html, "TITLE-MARK");
    expect(column).toContain("DESC-MARK");
    expect(column).toContain("BELOW-MARK");
    expect(column).not.toContain("TRAILING-MARK");
    expect(html.indexOf("DESC-MARK")).toBeLessThan(html.indexOf("BELOW-MARK"));
  });

  it("renders nothing extra when below is omitted", () => {
    const html = render({ title: "TITLE-MARK" });
    expect(html).not.toContain("BELOW-MARK");
  });
});
