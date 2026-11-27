import type { Meta, StoryObj } from "@storybook/react";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { EmptyState, type EmptyStateProps } from "./EmptyState";
import {
  copyFor,
  LocaleMatrix,
  ThemeStoryFrame,
  type StoryLocale,
} from "./story-frame";

/**
 * EmptyState with and without the next-step action. Fixture text only —
 * review surfaces, not shipped UI (D-14).
 */

function demo(locale: StoryLocale = "en"): EmptyStateProps {
  const c = copyFor(locale);
  return {
    title: c.emptyState.title,
    description: c.emptyState.description,
    actionLabel: c.emptyState.action,
    onAction: () => {},
  };
}

const meta: Meta<typeof EmptyState> = {
  title: "Primitives/EmptyState",
  component: EmptyState,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: "No places here yet",
    description: "This destination has no published places so far.",
  },
};

export const WithAction: Story = {
  args: demo(),
};

export const HeadingLevel1: Story = {
  // The list/detail page passes level 1: this state is the page's only
  // heading, so the document keeps exactly one h1 (03-78b).
  args: { ...demo(), headingLevel: 1 },
};

/** en, pt-BR and de side by side — de is the long-text overflow locale. */
export const Locales: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <LocaleMatrix render={(locale) => <EmptyState {...demo(locale)} />} />
    </ThemeStoryFrame>
  ),
};

export const CotijubaLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <EmptyState {...demo()} />
    </ThemeStoryFrame>
  ),
};

export const CotijubaDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="dark">
      <EmptyState {...demo()} />
    </ThemeStoryFrame>
  ),
};

export const SerraLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="light">
      <EmptyState {...demo()} />
    </ThemeStoryFrame>
  ),
};

export const SerraDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="dark">
      <EmptyState {...demo()} />
    </ThemeStoryFrame>
  ),
};
