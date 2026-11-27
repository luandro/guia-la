import type { HeadingLevel } from "@guia-la/ui";

/**
 * The app's state → heading-level choice (PR #20 review, plan.md:173).
 *
 * The journey's empty and error branches render *nothing else at level 1*:
 * the list screen's `<Heading level={1}>` lives inside the loaded branch
 * only, and the detail screen renders the error branch instead of its
 * heading. So those two states are the page's only heading and must carry
 * level 1 — the h1 the document needs (03-78b), and the visual size stays
 * compact because the level is semantics only (PR #20 heading split).
 *
 * This is a pure function so the choice is unit-tested rather than proven
 * by `pnpm s1`: s1 reads the *exported* HTML, which is always seeded from
 * the synchronous fixture load, so it never renders the empty/error
 * branches and could not catch a regression here.
 */
export function stateHeadingLevel(
  status: "loading" | "loaded" | "empty" | "error",
): HeadingLevel {
  return status === "empty" || status === "error" ? 1 : 2;
}
