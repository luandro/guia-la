// Trial-only minimal i18next runtime. The production wiring
// (apps/app/src/i18n/index.ts) supersedes this file; it stays as the spike's
// "real minimal trial" artifact.
import { createInstance, type i18n as I18nInstance } from "i18next";

const trialResources = {
  en: {
    translation: {
      "common.appName": "guia.la pilot",
      "places.count": "{{count}} places",
    },
  },
  de: {
    translation: {
      "common.appName": "guia.la Pilot",
      "places.count": "{{count}} Orte",
    },
  },
};

const instances = new Map<string, I18nInstance>();

/** Create (once) a synchronously-initialized i18next instance for a locale. */
export function createT(locale: string) {
  let instance = instances.get(locale);
  if (!instance) {
    instance = createInstance();
    instance.init({
      lng: locale,
      fallbackLng: "en",
      resources: trialResources as unknown as Record<string, never>,
    });
    instances.set(locale, instance);
  }
  return instance.t.bind(instance);
}
