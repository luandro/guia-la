import { I18nextProvider } from "react-i18next";

import type { Locale } from "@guia-la/core";

import { getI18n } from "./index";

/** React provider for a route's locale (used by every screen). */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <I18nextProvider i18n={getI18n(locale)}>{children}</I18nextProvider>;
}
