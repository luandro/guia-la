import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { Locale } from "@guia-la/core";

import { LocaleProvider } from "@/i18n/provider";

/**
 * Branded not-found (task 02-9): unknown routes, unknown locales and
 * unknown slugs all render this. It carries its own locale provider because
 * a not-found URL may have no valid locale in it; unknown-locale callers
 * pass their own valid locale when they have one.
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
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>{t("notFound.title")}</Text>
      <Text>{t("notFound.description")}</Text>
      <Link href="/" style={styles.link}>
        {t("notFound.back")}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, padding: 24 },
  code: { fontSize: 48, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "600" },
  link: { color: "#208AEF", fontWeight: "600", paddingTop: 8 },
});
