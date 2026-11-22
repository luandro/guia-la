import { createInstance, type i18n as I18nInstance } from "i18next";

import type { Locale } from "@guia-la/core";

import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import nl from "./locales/nl.json";
import ptBR from "./locales/pt-BR.json";

/**
 * i18n runtime (D-14, chosen by the spike — docs/features/phase-02-skeleton/
 * i18n-spike.md). One synchronously-initialized i18next instance per locale,
 * created on demand and cached. Static export renders each page under its
 * route locale's instance, so `t()` is available synchronously — including
 * inside `generateMetadata` at build time.
 */

export const LOCALES = ["en", "pt-BR", "es", "fr", "nl", "de"] as const;

export const catalogs = {
  en,
  "pt-BR": ptBR,
  es,
  fr,
  nl,
  de,
} as const;

export type Catalog = (typeof catalogs)[Locale];

const instances = new Map<Locale, I18nInstance>();

/** The cached, synchronously-initialized i18next instance for a locale. */
export function getI18n(locale: Locale): I18nInstance {
  let instance = instances.get(locale);
  if (!instance) {
    instance = createInstance();
    instance.init({
      lng: locale,
      // CI (tools/i18n-check) guarantees complete catalogs; en is a runtime
      // safety net, never a shipping strategy.
      fallbackLng: "en",
      resources: Object.fromEntries(
        LOCALES.map((l) => [l, { translation: catalogs[l] }]),
      ) as Record<string, { translation: typeof en }>,
      interpolation: { escapeValue: false },
    });
    instances.set(locale, instance);
  }
  return instance;
}

/** A bound `t` for one locale — the pure-code seam used by metadata builders. */
export function createT(locale: Locale) {
  const instance = getI18n(locale);
  return instance.t.bind(instance);
}

/** Is this string one of the six route locales? Unknown values not-found. */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
