import { Link } from "expo-router";
import type { Metadata } from "expo-router/server";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { Heading, Text, useTheme } from "@guia-la/ui";

import { Screen } from "@/components/screen";
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
 *
 * Phase 03, task 5: colors and type come from @guia-la/ui tokens; no
 * template theme constant or brand hex remains in this screen.
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
  const { tokens } = useTheme();
  return (
    <Screen>
      <View
        style={{
          gap: tokens.spacing.sm,
          padding: tokens.spacing.xl,
        }}
      >
        <Heading level={2}>{t("index.title")}</Heading>
        <Text>{t("index.subtitle")}</Text>
        <View
          style={{
            gap: tokens.spacing.sm,
            paddingTop: tokens.spacing.lg,
          }}
        >
          {LOCALES.map((locale) => (
            <Link
              key={locale}
              href={`/${locale}/places`}
              style={{ paddingVertical: tokens.spacing.xs }}
            >
              <Text variant="body" style={{ color: tokens.colors.primary }}>
                {t(`locales.${locale}`)}
              </Text>
            </Link>
          ))}
        </View>
      </View>
    </Screen>
  );
}
