import { Link } from "expo-router";
import type { Metadata } from "expo-router/server";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { createT, LOCALES } from "@/i18n";
import { LocaleProvider } from "@/i18n/provider";
import {
  destinationOgImage,
  languageAlternates,
  ogAlternateLocales,
  ogLocale,
} from "@/lib/metadata";

/**
 * Root (task 02-9): the locale entry page. Every published journey starts
 * at /<locale>/places; this page links each locale's list and carries the
 * reciprocal hreflang alternates for them (it is the cluster's x-default —
 * the language picker the list pages point at — so it declares none itself).
 */

export function generateMetadata(): Metadata {
  const t = createT("en");
  return {
    title: t("meta.homeTitle"),
    description: t("meta.homeDescription"),
    alternates: {
      languages: languageAlternates((locale) => `/${locale}/places`, null),
    },
    openGraph: {
      title: t("meta.homeTitle"),
      description: t("meta.homeDescription"),
      locale: ogLocale("en"),
      alternateLocale: ogAlternateLocales("en"),
      type: "website",
      images: [destinationOgImage],
    },
  };
}

export default function LocaleIndex() {
  return (
    <LocaleProvider locale="en">
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  const { t } = useTranslation();
  return (
    <Screen>
      <View style={styles.container}>
        <ThemedText style={styles.title}>{t("index.title")}</ThemedText>
        <ThemedText>{t("index.subtitle")}</ThemedText>
        <View style={styles.locales}>
          {LOCALES.map((locale) => (
            <Link key={locale} href={`/${locale}/places`} style={styles.link}>
              {t(`locales.${locale}`)}
            </Link>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, padding: 24 },
  title: { fontSize: 24, fontWeight: "700" },
  locales: { gap: 8, paddingTop: 16 },
  link: { color: "#208AEF", fontSize: 18, fontWeight: "600" },
});
