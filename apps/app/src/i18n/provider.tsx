import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import type { Locale } from "@guia-la/core";

import { getI18n } from "./index";

/**
 * React provider for a route's locale (used by every screen). On web it also
 * keeps the document language in step with client-side navigation (PR #15
 * CodeRabbit review): `+html.tsx` sets `<html lang>` per page on the server,
 * but expo-router Links navigate without a document reload, so the attribute
 * would keep the first response's locale. The effect mirrors `langForPath`'s
 * value for the route's own locale segment; `document` does not exist on
 * native, where it is a no-op.
 */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  return <I18nextProvider i18n={getI18n(locale)}>{children}</I18nextProvider>;
}
