import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { ErrorState } from "./ErrorState";
import {
  copyFor,
  LocaleMatrix,
  ThemeStoryFrame,
  type StoryLocale,
} from "./story-frame";
import { Text } from "./Text";

/**
 * ErrorState with a retry that visibly fires (phase-03 QA journey 4:
 * forcing the retry action must show it happened, not a silent no-op).
 * Fixture text only — review surfaces, not shipped UI (D-14).
 */

function RetryDemo({ locale = "en" }: { locale?: StoryLocale }) {
  const c = copyFor(locale);
  const [attempts, setAttempts] = useState(0);
  return (
    <View style={{ gap: 12 }}>
      <ErrorState
        title={c.errorState.title}
        description={c.errorState.description}
        retryLabel={c.errorState.retry}
        onRetry={() => {
          setAttempts(attempts + 1);
        }}
      />
      <Text variant="caption">
        {c.errorState.retry}: {attempts}
      </Text>
    </View>
  );
}

const meta: Meta<typeof ErrorState> = {
  title: "Primitives/ErrorState",
  component: ErrorState,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: "Something went wrong",
    description: "The places could not be loaded.",
    retryLabel: "Try again",
    onRetry: () => {},
  },
};

export const RetryFiresVisibly: Story = {
  render: () => <RetryDemo />,
};

export const HeadingLevel1: Story = {
  // The list/detail page passes level 1: this state is the page's only
  // heading, so the document keeps exactly one h1 (03-78b).
  args: {
    title: "Something went wrong",
    description: "The places could not be loaded.",
    retryLabel: "Try again",
    onRetry: () => {},
    headingLevel: 1,
  },
};

/** en, pt-BR and de side by side — de is the long-text overflow locale. */
export const Locales: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <LocaleMatrix render={(locale) => <RetryDemo locale={locale} />} />
    </ThemeStoryFrame>
  ),
};

export const CotijubaLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <RetryDemo />
    </ThemeStoryFrame>
  ),
};

export const CotijubaDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="dark">
      <RetryDemo />
    </ThemeStoryFrame>
  ),
};

export const SerraLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="light">
      <RetryDemo />
    </ThemeStoryFrame>
  ),
};

export const SerraDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="dark">
      <RetryDemo />
    </ThemeStoryFrame>
  ),
};
