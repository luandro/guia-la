/**
 * Story-render detection (PR #20 review, findings on
 * a11y-check.mjs:173).
 *
 * The a11y gate used to wait for `#storybook-root` and swallow any timeout,
 * then run axe on whatever was there. `#storybook-root` is part of the
 * static `iframe.html` shell, so the wait never proved the story rendered —
 * a story that threw or rendered nothing produced an empty canvas with no
 * violations and was counted as "scanned clean". The gate could report
 * "0 violations across 89 stories" while stories were broken.
 *
 * Detection therefore looks at *story output*, not the shell. Real Storybook
 * 10 DOM, verified against the built iframe:
 * - a render throw is caught by Storybook's error boundary, which puts
 *   `sb-show-errordisplay` on **body** (not documentElement) and empties
 *   `#storybook-root`; a page error (`pageerror`) also fires for errors the
 *   boundary does not catch;
 * - `#storybook-root` always exists (the shell) and always has the theme
 *   decorator's wrapper, so "the root has a child" does *not* prove the
 *   story rendered — the predicate must look at the *wrapper's* children;
 * - a story that renders nothing (including `render: () => null`) leaves the
 *   decorator wrapper with zero children, while every real story (a
 *   Skeleton, a hidden status region, a Button) leaves it with at least one.
 *
 * These are pure predicates so they are unit-tested without a browser; the
 * gate wires them to the live page.
 */

/**
 * True when Storybook's error display is showing. Storybook 10 puts the
 * `sb-show-errordisplay` class on **body** (`bodyClasses`), while
 * `documentClasses` (the `<html>` element) stays empty — checking only the
 * document element misses every crashed story. Either source is accepted.
 */
export function hasStorybookErrorDisplay(...classSources) {
  return classSources.some((source) => {
    if (!source) return false;
    if (typeof source === "string") {
      return source.split(/\s+/).includes("sb-show-errordisplay");
    }
    return typeof source.contains === "function"
      ? source.contains("sb-show-errordisplay")
      : false;
  });
}

/**
 * True when the story root has no story content. Verified against the real
 * built Storybook (90 stories measured):
 * - a story that renders nothing, including `render: () => null`, leaves
 *   `#storybook-root` → decorator wrapper with **zero** children;
 * - every real story leaves the decorator wrapper with **at least one**
 *   child — a Skeleton, a hidden status region and a Button all do — even
 *   when the story has no text and no graphic of its own.
 *
 * So the signal is the *wrapper's* child count, not the root's (the wrapper
 * is always present) and not text (Skeletons and empty status regions are
 * legitimately textless).
 *
 * `root` is `{ firstChildElementCount }` for the `#storybook-root` element
 * (the number of children of its first element child, i.e. the decorator
 * wrapper), or null when the root is absent.
 */
export function isStoryRootEmpty(root) {
  if (!root) return true;
  return root.firstChildElementCount === 0;
}

/**
 * The reason a story must be failed, or null when it rendered. Combines the
 * page errors the browser reported with the DOM state Storybook leaves.
 */
export function storyRenderFailure({
  pageErrors,
  documentClasses,
  bodyClasses,
  root,
}) {
  if (pageErrors.length > 0) {
    return `uncaught error: ${pageErrors[0]}`;
  }
  if (hasStorybookErrorDisplay(bodyClasses, documentClasses)) {
    return "Storybook error display is shown";
  }
  if (isStoryRootEmpty(root)) {
    return "story rendered nothing (#storybook-root has no content)";
  }
  return null;
}
