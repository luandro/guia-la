import type { Locale } from "@guia-la/core";

import { LOCALES } from "@/i18n";

/**
 * Metadata helpers for generateMetadata (D-14): OG locale format and the
 * hreflang alternates map for all six locales (+ x-default pointing at en).
 *
 * Paths are root-relative on purpose: no deploy origin is pinned yet
 * (D-01 — guia.la is not owned; the pilot web deploy targets cotiju.app in a
 * later phase). S1 records this as a known limitation to revisit when the
 * origin is fixed.
 */

/** `pt-BR` → `pt_BR` (OpenGraph locale format). */
export function ogLocale(locale: Locale): string {
  return locale.replace("-", "_");
}

/** The other five locales, in OG format, for og:locale:alternate. */
export function ogAlternateLocales(locale: Locale): string[] {
  return LOCALES.filter((candidate) => candidate !== locale).map(ogLocale);
}

/** hreflang map for all six locales plus x-default (en path). */
export function languageAlternates(
  pathFor: (locale: Locale) => string,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = pathFor(locale);
  }
  languages["x-default"] = pathFor("en");
  return languages;
}
