import { Link, useLocalSearchParams } from "expo-router";
import type { Metadata } from "expo-router/server";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";

import { resolveContent, type Locale } from "@guia-la/core";
import { Heading, Text, useTheme } from "@guia-la/ui";

import {
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
 * Place detail (task 02-9): /<locale>/places/<slug> — one static page per
 * locale x place. Unknown slug or locale renders the branded not-found.
 * Phase 03, task 5 cut-over: typography via @guia-la/ui variants, colors
 * via useTheme tokens (no template theme, no brand hex).
 */

type Params = Record<string, string | string[]>;

export function generateStaticParams(): Params[] {
  const dataset = getJourneyDataset();
  if (!dataset.ok) return [];
  const params: Params[] = [];
  for (const locale of LOCALES) {
    for (const place of dataset.value.places) {
      params.push({ locale, slug: place.slug });
    }
  }
  return params;
}

export function generateMetadata(_request: unknown, params: Params): Metadata {
  const rawLocale = String(params.locale);
  const slug = String(params.slug);
  if (!isLocale(rawLocale)) return {};
  const locale: Locale = rawLocale;

  const dataset = getJourneyDataset();
  if (!dataset.ok) return {};
  const place = dataset.value.places.find(
    (candidate) => candidate.slug === slug,
  );
  if (!place) return {};
  const { destination } = dataset.value;

  const content = resolveContent(place, locale, destination.defaultLocale);
  const t = createT(locale);
  const title = t("meta.placeTitle", {
    name: content.name,
    destination: destination.name,
  });
  return {
    title,
    description: t("meta.placeDescription", { summary: content.summary }),
    alternates: {
      // x-default is the destination's default-locale detail page (pt-BR
      // today) — the version content falls back to (PR #14 review).
      languages: languageAlternates(
        (l) => `/${l}/places/${slug}`,
        `/${destination.defaultLocale}/places/${slug}`,
      ),
    },
    openGraph: {
      title,
      description: content.summary,
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: "website",
      images: [destinationOgImage],
    },
  };
}

export default function PlaceDetail() {
  const { locale, slug } = useLocalSearchParams<{
    locale: string;
    slug: string;
  }>();
  if (!isLocale(locale)) {
    return <NotFoundView />;
  }
  return (
    <LocaleProvider locale={locale}>
      <DetailContent slug={slug ?? ""} />
    </LocaleProvider>
  );
}

function DetailContent({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { tokens } = useTheme();
  const { state, retry } = useDestination();

  if (state.status === "loading") {
    return (
      <Screen>
        <OfflineHint visible={state.offline} />
        <LoadingView />
      </Screen>
    );
  }
  if (state.status === "error" && state.error) {
    return (
      <Screen>
        <OfflineHint visible={state.offline} />
        <ErrorView error={state.error} retry={retry} />
      </Screen>
    );
  }
  if (!state.data) {
    return <NotFoundView locale={locale} />;
  }

  const place = state.data.places.find((candidate) => candidate.slug === slug);
  if (!place) {
    return <NotFoundView locale={locale} />;
  }

  const { destination, categories } = state.data;
  const content = resolveContent(place, locale, destination.defaultLocale);
  const category = categories.find(
    (candidate) => candidate.id === place.category,
  );
  // verifiedAt is a calendar date (YYYY-MM-DD), not an instant: parse it as
  // local calendar fields so no timezone shifts it by a day.
  const [year, month, day] = place.verifiedAt.split("-").map(Number);
  const verified = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(new Date(year, month - 1, day));

  return (
    <Screen>
      <OfflineHint visible={state.offline} />
      {/* Bounded ScrollView (PR #15 CodeRabbit review): on small landscape
          screens or with enlarged text the summary, verification date and
          back link can exceed the viewport; contentContainerStyle keeps the
          short-content layout unchanged. */}
      <ScrollView
        contentContainerStyle={{
          gap: tokens.spacing.sm,
          padding: tokens.spacing.xl,
        }}
      >
        <Heading level={1}>{content.name}</Heading>
        {category ? (
          <Text variant="bodySmall" style={{ color: tokens.colors.textMuted }}>
            {category.label[locale]}
          </Text>
        ) : null}
        <Text variant="body">{content.summary}</Text>
        <View
          style={{
            flexDirection: "row",
            gap: tokens.spacing.md,
            paddingTop: tokens.spacing.xs,
          }}
        >
          {content.isFallback && (
            <ShowingOriginalBadge locale={content.locale} />
          )}
          {content.machineTranslated && <MachineTranslatedBadge />}
        </View>
        <Text variant="caption" style={{ color: tokens.colors.textMuted }}>
          {t("places.verifiedAt", { date: verified })}
        </Text>
        <Link
          href={`/${locale}/places`}
          style={{
            paddingTop: tokens.spacing.sm,
            alignSelf: "flex-start",
          }}
        >
          <Text variant="label" style={{ color: tokens.colors.primary }}>
            {t("common.backToList")}
          </Text>
        </Link>
      </ScrollView>
    </Screen>
  );
}
