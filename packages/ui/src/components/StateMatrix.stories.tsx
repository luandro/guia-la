import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { Card } from "./Card";
import { Chip } from "./Chip";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Heading } from "./Heading";
import { ListRow } from "./ListRow";
import { MapPlaceholder } from "./MapPlaceholder";
import { OfflineBanner } from "./OfflineBanner";
import { Skeleton } from "./Skeleton";
import {
  copyFor,
  LocaleMatrix,
  StoryCanvas,
  ThemeStoryFrame,
  type StoryLocale,
} from "./story-frame";
import { Text } from "./Text";

/**
 * State-matrix stories (phase 03, task 7). The phase requires every
 * data-bound primitive to be reviewed in loading, empty, error and offline
 * states, under both presets and both color modes, and in at least en,
 * pt-BR and de (the long-text locale) to catch overflow.
 *
 * Rather than duplicate every primitive's own state across four theme
 * frames by hand, this file composes the real primitives into a single
 * destination-shaped surface and renders it once per state. The theme
 * matrix is covered by the per-primitive Cotijuba and Serra stories
 * already colocated; here the states and the locale axis are the focus.
 * Each state below is "n/a" justified where it does not apply (a
 * presentational Text or Heading has no loading/empty/error of its own —
 * its state is the container's).
 *
 * Fixture text is the shared story copy (stories/fixtures.ts) — review
 * surfaces, not shipped UI (D-14).
 */

/** The loading shape: a skeleton group standing in for the list rows. */
function LoadingStateView({ locale }: { locale: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={c.button.loading}
      style={{ gap: 12 }}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Skeleton width={48} height={48} radius="full" />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="70%" />
          <Skeleton width="40%" />
        </View>
      </View>
      <Skeleton width="90%" />
      <Skeleton width="60%" />
    </View>
  );
}

/** The empty shape: one clear next action (the phase's "never a bare blank"). */
function EmptyStateView({ locale }: { locale: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <EmptyState
      title={c.emptyState.title}
      description={c.emptyState.description}
      actionLabel={c.emptyState.action}
      onAction={() => {}}
      headingLevel={2}
    />
  );
}

/** The error shape: names what failed and a retry that visibly fires. */
function ErrorStateView({ locale }: { locale: StoryLocale }) {
  const c = copyFor(locale);
  const [attempts, setAttempts] = useState(0);
  return (
    <View style={{ gap: 12 }}>
      <ErrorState
        title={c.errorState.title}
        description={c.errorState.description}
        retryLabel={c.errorState.retry}
        onRetry={() => setAttempts((n) => n + 1)}
        headingLevel={2}
      />
      <Text variant="caption">
        {c.errorState.retry}: {attempts}
      </Text>
    </View>
  );
}

/** The offline shape: the banner plus the last-known (cached) content. */
function OfflineStateView({ locale }: { locale: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <View style={{ gap: 12 }}>
      <OfflineBanner message={c.offlineBanner.message} visible />
      <ListRow title={c.listRow.title} description={c.listRow.description} />
    </View>
  );
}

/** The content (loaded) shape: what the loading skeleton stands in for. */
function LoadedStateView({ locale }: { locale: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <View style={{ gap: 8 }}>
      <ListRow
        title={c.listRow.title}
        description={c.listRow.description}
        trailing={<Chip label={c.chip.success} tone="success" />}
        separator
      />
      <ListRow
        title={c.listRow.trailingTitle}
        description={c.listRow.description}
        separator
      />
    </View>
  );
}

const STATES = {
  loaded: LoadedStateView,
  loading: LoadingStateView,
  empty: EmptyStateView,
  error: ErrorStateView,
  offline: OfflineStateView,
} as const;
type StateName = keyof typeof STATES;

const STATE_COPY: Record<StateName, Record<StoryLocale, string>> = {
  loaded: {
    en: "Loaded — content with a verified marker",
    "pt-BR": "Carregado — conteúdo com marcador verificado",
    de: "Geladen — Inhalt mit Verifiziert-Marker",
  },
  loading: {
    en: "Loading — skeleton placeholders",
    "pt-BR": "Carregando — marcadores de esqueleto",
    de: "Wird geladen — Skeleton-Platzhalter",
  },
  empty: {
    en: "Empty — one clear next action",
    "pt-BR": "Vazio — uma próxima ação clara",
    de: "Leer — eine klare nächste Aktion",
  },
  error: {
    en: "Error — names the failure + retry",
    "pt-BR": "Erro — nomeia a falha + tentar novamente",
    de: "Fehler — benennt das Problem + erneut versuchen",
  },
  offline: {
    en: "Offline — banner + last-known content",
    "pt-BR": "Offline — banner + último conteúdo conhecido",
    de: "Offline — Banner + zuletzt bekannter Inhalt",
  },
};

/** A full destination surface in one state, one locale. */
function Surface({ state, locale }: { state: StateName; locale: StoryLocale }) {
  const StateView = STATES[state];
  return (
    <ScrollView>
      <Card>
        <View style={{ gap: 12 }}>
          <Heading level={2}>{STATE_COPY[state][locale]}</Heading>
          <OfflineBanner
            message={copyFor(locale).offlineBanner.message}
            visible={state === "offline"}
          />
          <StateView locale={locale} />
        </View>
      </Card>
    </ScrollView>
  );
}

const meta: Meta = {
  title: "Patterns/State matrix",
  component: View,
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The whole matrix in one story: every state × every locale, under the
 * default preset/mode (the global toolbar switches preset and mode live).
 */
export const AllStatesAllLocales: Story = {
  render: () => (
    <StoryCanvas>
      <View style={{ gap: 24 }}>
        {(Object.keys(STATES) as StateName[]).map((state) => (
          <LocaleMatrix
            key={state}
            render={(locale) => <Surface state={state} locale={locale} />}
          />
        ))}
      </View>
    </StoryCanvas>
  ),
};

/** One story per state (en baseline), so a reviewer can link to a state. */
export const Loading: Story = {
  render: () => (
    <StoryCanvas>
      <LoadingStateView locale="en" />
    </StoryCanvas>
  ),
};
export const Empty: Story = {
  render: () => (
    <StoryCanvas>
      <EmptyStateView locale="en" />
    </StoryCanvas>
  ),
};
export const Error: Story = {
  render: () => (
    <StoryCanvas>
      <ErrorStateView locale="en" />
    </StoryCanvas>
  ),
};
export const Offline: Story = {
  render: () => (
    <StoryCanvas>
      <OfflineStateView locale="en" />
    </StoryCanvas>
  ),
};

/**
 * The long-text locale (de) in every state under both presets × modes —
 * the overflow stress the phase calls out. The global toolbar also drives
 * preset/mode; these pin all four explicitly for a stable review URL.
 */
export const GermanLongText: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      {THEME_FRAMES.map((frame) => (
        <ThemeStoryFrame
          key={`${frame.presetId}/${frame.mode}`}
          presetId={frame.presetId}
          mode={frame.mode}
        >
          <View style={{ gap: 16 }}>
            {(Object.keys(STATES) as StateName[]).map((state) => (
              <Surface key={state} state={state} locale="de" />
            ))}
          </View>
        </ThemeStoryFrame>
      ))}
    </View>
  ),
};

const THEME_FRAMES = [
  { presetId: cotijubaPreset.id, mode: "light" as const },
  { presetId: cotijubaPreset.id, mode: "dark" as const },
  { presetId: serraPreset.id, mode: "light" as const },
  { presetId: serraPreset.id, mode: "dark" as const },
];

/** MapPlaceholder is the honest stand-in until map widgets arrive. */
export const MapPlaceholderState: Story = {
  render: () => (
    <StoryCanvas>
      <View style={{ gap: 16 }}>
        <MapPlaceholder
          label={copyFor("en").mapPlaceholder.label}
          hint={copyFor("en").mapPlaceholder.hint}
        />
      </View>
    </StoryCanvas>
  ),
};
