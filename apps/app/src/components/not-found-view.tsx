import { Link } from "expo-router";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import type { Locale } from "@guia-la/core";
import { Heading, Text, useTheme } from "@guia-la/ui";

import { Screen } from "@/components/screen";
import { LocaleProvider } from "@/i18n/provider";

/**
 * Branded not-found (task 02-9): unknown routes, unknown locales and
 * unknown slugs all render this. It carries its own locale provider because
 * a not-found URL may have no valid locale in it; unknown-locale callers
 * pass their own valid locale when they have one.
 *
 * Phase 03, task 5: tokens and primitives from @guia-la/ui replace the
 * template theme (no brand hex here).
 */
export function NotFoundView({ locale = "en" }: { locale?: Locale }) {
  return (
    <LocaleProvider locale={locale}>
      <NotFoundContent />
    </LocaleProvider>
  );
}

function NotFoundContent() {
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
        <Text variant="display">404</Text>
        <Heading level={1}>{t("notFound.title")}</Heading>
        <Text>{t("notFound.description")}</Text>
        <Link
          href="/"
          style={{ paddingTop: tokens.spacing.sm, alignSelf: "flex-start" }}
        >
          <Text variant="label" style={{ color: tokens.colors.primary }}>
            {t("notFound.back")}
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
