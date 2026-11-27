/**
 * Static-server path containment (PR #20 review, findings on
 * a11y-check.mjs:81).
 *
 * `join(root, urlPath)` resolves `..`, so the result must be checked
 * against a *path boundary*, not a string prefix: a request for
 * `/../dist-other/x` resolves to `<root>-other/x`, which starts with the
 * same string as `<root>` and used to be served. Comparing against
 * `root + sep` (or path.relative) makes the boundary real.
 */

import { relative, sep } from "node:path";

/**
 * True when `candidate` is `root` itself or a path *inside* it. Compares
 * with `path.relative`, so a sibling such as `/srv/dist-other` is not
 * treated as inside `/srv/dist` (the old `startsWith(root)` prefix check
 * accepted it). A relative path that is `..` or starts with `..` + the
 * separator climbs out of the root; a file named `..foo` inside it does
 * not.
 */
export function isPathInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== "..");
}

/** True when the resolved request path escapes the served root. */
export function escapesRoot(root, urlPath) {
  return !isPathInside(root, urlPath);
}
