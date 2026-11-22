import type { ContentEntry, Locale, Place } from "./domain";

/** A place's content resolved for one UI locale (D-14). */
export interface ResolvedContent {
  name: string;
  summary: string;
  /** The locale actually returned — the requested one, or the fallback. */
  locale: Locale;
  /** True when the requested locale was missing and the default was used. */
  isFallback: boolean;
  machineTranslated: boolean;
}

/**
 * Resolve a place's content for a locale, falling back to the destination's
 * default locale. The fallback is marked (`isFallback: true`,
 * `locale: defaultLocale`) so the UI can show the visible
 * "showing original" marker — never a silent fallback (D-14).
 */
export function resolveContent(
  place: Place,
  locale: Locale,
  defaultLocale: Locale,
): ResolvedContent {
  const exact: ContentEntry | undefined = place.content[locale];
  if (exact) {
    return {
      name: exact.name,
      summary: exact.summary,
      locale,
      isFallback: false,
      machineTranslated: exact.machineTranslated,
    };
  }

  const fallback: ContentEntry | undefined = place.content[defaultLocale];
  if (!fallback) {
    // Unreachable through the loader (it validates default-locale presence);
    // kept as a loud programming-error guard, not a UI path.
    throw new Error(
      `place ${place.id} has no content for ${locale} or default ${defaultLocale}`,
    );
  }
  return {
    name: fallback.name,
    summary: fallback.summary,
    locale: defaultLocale,
    isFallback: true,
    machineTranslated: fallback.machineTranslated,
  };
}
