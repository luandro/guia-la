import { Link, useLocalSearchParams } from "expo-router";
import type { Metadata } from "expo-router/server";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";

import { resolveContent, type Locale, type Place } from "@guia-la/core";
import { Heading, ListRow, Text, useTheme } from "@guia-la/ui";

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
 * Phase 03, task 5 cut-over: rows are the @guia-la/ui ListRow inside the
 * expo-router Link (the anchor must stay for raw-HTML SEO), colors and
 * type come from useTheme tokens.
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
  const { tokens } = useTheme();
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
          <View
            style={{
              gap: tokens.spacing.xs,
              padding: tokens.spacing.lg,
            }}
          >
            <Heading level={1}>
              {t("places.listTitle", { destination: destination?.name })}
            </Heading>
            <Text variant="bodySmall">
              {t("places.count", { count: state.data.places.length })}
            </Text>
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
  const { tokens } = useTheme();
  const content = resolveContent(place, locale, defaultLocale ?? "pt-BR");
  const showOriginal = content.isFallback;
  const showMachine = content.machineTranslated;
  return (
    // Link stays the outer element: the static export needs real anchors
    // linking every detail slug (s1-assert), so the row's visuals come
    // from the non-pressable ListRow, not from a nested Pressable.
    <Link
      href={`/${locale}/places/${place.slug}`}
      accessibilityLabel={content.name}
    >
      <ListRow
        title={content.name}
        description={label}
        separator
        trailing={
          showOriginal || showMachine ? (
            <View
              style={{
                flexDirection: "row",
                gap: tokens.spacing.sm,
                alignItems: "center",
              }}
            >
              {showOriginal && <ShowingOriginalBadge locale={content.locale} />}
              {showMachine && <MachineTranslatedBadge />}
            </View>
          ) : undefined
        }
      />
    </Link>
  );
}
