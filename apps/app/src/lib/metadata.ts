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

/**
 * Explicit UI-locale → OpenGraph locale mapping. og:locale is defined as
 * `language_TERRITORY`, and the territory is not derivable from the language
 * code (en → en_US, not "en"), so every locale maps explicitly. s1-cluster
 * mirrors this map and fails the export on any other og:locale form.
 */
const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  "pt-BR": "pt_BR",
  es: "es_ES",
  fr: "fr_FR",
  nl: "nl_NL",
  de: "de_DE",
};

/** `pt-BR` → `pt_BR`, `en` → `en_US` (OpenGraph language_TERRITORY format). */
export function ogLocale(locale: Locale): string {
  return OG_LOCALES[locale];
}

/** The other five locales, in OG format, for og:locale:alternate. */
export function ogAlternateLocales(locale: Locale): string[] {
  return LOCALES.filter((candidate) => candidate !== locale).map(ogLocale);
}

/**
 * Destination-level og:image (PR #14 review round C): link previews need an
 * image, and the outstanding owner check (WhatsApp card) asks for one. The
 * asset ships in the export from apps/app/public/og/ (copied to /og/); a
 * per-place image arrives with real photography. Root-relative like every
 * other URL here — crawlers need absolute URLs once the origin is pinned
 * (Phase 04 deploy / Phase 10 domain work).
 */
export const destinationOgImage = {
  url: "/og/default.png",
  width: 1200,
  height: 630,
} as const;

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
