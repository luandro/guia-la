import type { Meta, StoryObj } from "@storybook/react";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { EmptyState, type EmptyStateProps } from "./EmptyState";
import { ThemeStoryFrame } from "./story-frame";

/**
 * EmptyState with and without the next-step action. Fixture text only —
 * review surfaces, not shipped UI (D-14).
 */

const DEMO_WITH_ACTION: EmptyStateProps = {
  title: "No places here yet",
  description: "This destination has no published places so far.",
  actionLabel: "Suggest a place",
  onAction: () => {},
};

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
  args: DEMO_WITH_ACTION,
};

export const CotijubaLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <EmptyState {...DEMO_WITH_ACTION} />
    </ThemeStoryFrame>
  ),
};

export const CotijubaDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="dark">
      <EmptyState {...DEMO_WITH_ACTION} />
    </ThemeStoryFrame>
  ),
};

export const SerraLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="light">
      <EmptyState {...DEMO_WITH_ACTION} />
    </ThemeStoryFrame>
  ),
};

export const SerraDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="dark">
      <EmptyState {...DEMO_WITH_ACTION} />
    </ThemeStoryFrame>
  ),
};
