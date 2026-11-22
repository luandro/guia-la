import type { Locale } from "@guia-la/core";

import { LOCALES } from "@/i18n";

/**
 * Metadata helpers for generateMetadata (D-14): OG locale format and the
 * hreflang alternates map for all six locales.
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

/**
 * hreflang map for all six locales, plus the x-default the caller pins:
 * list pages use "/" (the language picker), detail pages the destination
 * default-locale page, and the root picker page passes null (it IS the
 * x-default target — declaring one would point at itself). Every cluster
 * member must be listed back by its targets (reciprocity); s1-assert checks
 * that over the export.
 */
export function languageAlternates(
  pathFor: (locale: Locale) => string,
  xDefault: string | null,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = pathFor(locale);
  }
  if (xDefault !== null) {
    languages["x-default"] = xDefault;
  }
  return languages;
}
