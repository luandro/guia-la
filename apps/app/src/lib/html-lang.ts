import type { Locale } from "@guia-la/core";

import { isLocale } from "@/i18n";

/**
 * Document language for a static route path: the leading locale segment,
 * else en (the root entry page renders English, and the unchecked
 * dynamic-route shells default safely). Used by src/app/+html.tsx so the
 * exported raw HTML declares the page's own language (PR #14 review).
 */
export function langForPath(pathname: string): Locale {
  const firstSegment = pathname.split("/")[1] ?? "";
  return isLocale(firstSegment) ? firstSegment : "en";
}
