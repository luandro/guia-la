import { Link, useLocalSearchParams } from "expo-router";
import type { Metadata } from "expo-router/server";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { resolveContent, type Locale, type Place } from "@guia-la/core";

import {
  EmptyView,
  ErrorView,
  LoadingView,
  MachineTranslatedBadge,
  OfflineHint,
  ShowingOriginalBadge,
} from "@/components/journey-ui";
import { NotFoundView } from "@/components/not-found-view";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { getJourneyDataset } from "@/data/destination";
import { useDestination } from "@/hooks/use-destination";
import { createT, isLocale, LOCALES } from "@/i18n";
import { LocaleProvider } from "@/i18n/provider";
import {
  destinationOgImage,
  languageAlternates,
  ogAlternateLocales,
  ogLocale,
} from "@/lib/metadata";

/**
 * Places list (task 02-9): /<locale>/places — one static page per locale.
 */

type Params = Record<string, string | string[]>;

export function generateStaticParams(): Params[] {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata(_request: unknown, params: Params): Metadata {
  const rawLocale = String(params.locale);
  if (!isLocale(rawLocale)) return {};
  const locale: Locale = rawLocale;

  const dataset = getJourneyDataset();
  if (!dataset.ok) return {};
  const { destination } = dataset.value;

  const t = createT(locale);
  const title = t("meta.placesTitle", { destination: destination.name });
  const description = t("meta.placesDescription", {
    destination: destination.name,
  });
  return {
    title,
    description,
    alternates: {
      // x-default is the language picker ("/") — the list pages point at it
      // and it lists them back (reciprocity, PR #14 review).
      languages: languageAlternates((l) => `/${l}/places`, "/"),
    },
    openGraph: {
      title,
      description,
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: "website",
      images: [destinationOgImage],
    },
  };
}

export default function PlacesList() {
  const { locale } = useLocalSearchParams<{ locale: string }>();
  if (!isLocale(locale)) {
    return <NotFoundView />;
  }
  return (
    <LocaleProvider locale={locale}>
      <ListContent />
    </LocaleProvider>
  );
}

function ListContent() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { state, retry } = useDestination();
  const destination = state.data?.destination;

  return (
    <Screen>
      <OfflineHint visible={state.offline} />
      {state.status === "loading" && <LoadingView />}
      {state.status === "empty" && <EmptyView />}
      {state.status === "error" && state.error && (
        <ErrorView error={state.error} retry={retry} />
      )}
      {state.status === "loaded" && state.data && (
        // Plain ScrollView + map (no virtualization): a virtualized list
        // renders only its initial window in the static export, dropping
        // detail links from the raw HTML beyond ~10 places (PR #14 review).
        <ScrollView>
          <View style={styles.header}>
            <ThemedText style={styles.title}>
              {t("places.listTitle", { destination: destination?.name })}
            </ThemedText>
            <ThemedText>
              {t("places.count", { count: state.data.places.length })}
            </ThemedText>
          </View>
          {state.data.places.map((place) => (
            <PlaceRow
              key={place.id}
              place={place}
              locale={locale}
              defaultLocale={state.data?.destination.defaultLocale}
              categoryLabel={categoryLabel(
                state.data?.categories,
                place,
                locale,
              )}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function categoryLabel(
  categories: { id: string; label: Record<Locale, string> }[] | undefined,
  place: Place,
  locale: Locale,
): string | undefined {
  return categories?.find((category) => category.id === place.category)?.label[
    locale
  ];
}

function PlaceRow({
  place,
  locale,
  defaultLocale,
  categoryLabel: label,
}: {
  place: Place;
  locale: Locale;
  defaultLocale: Locale | undefined;
  categoryLabel: string | undefined;
}) {
  const content = resolveContent(place, locale, defaultLocale ?? "pt-BR");
  return (
    <Link
      href={`/${locale}/places/${place.slug}`}
      style={styles.row}
      accessibilityLabel={content.name}
    >
      <View style={styles.rowText}>
        <ThemedText style={styles.rowTitle}>{content.name}</ThemedText>
        {label ? <ThemedText>{label}</ThemedText> : null}
        <View style={styles.markers}>
          {content.isFallback && (
            <ShowingOriginalBadge locale={content.locale} />
          )}
          {content.machineTranslated && <MachineTranslatedBadge />}
        </View>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4, padding: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  row: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  rowText: { gap: 4 },
  rowTitle: { fontSize: 18, fontWeight: "600" },
  markers: { flexDirection: "row", gap: 12 },
});
