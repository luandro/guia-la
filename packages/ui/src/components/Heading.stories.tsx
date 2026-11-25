import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { Heading } from "./Heading";
import { ThemeStoryFrame } from "./story-frame";

/**
 * Heading levels 1-3 (display / title / heading roles) with header
 * semantics. Fixture text only — review surfaces, not shipped UI (D-14).
 */

function Copy() {
  return (
    <View style={{ gap: 12 }}>
      <Heading level={1}>Sphinx of black quartz</Heading>
      <Heading level={2}>Travaillez-vous ce soir?</Heading>
      <Heading level={3}>How vexingly quick daft zebras jump</Heading>
      <Heading>Fallback without a level</Heading>
    </View>
  );
}

const meta: Meta<typeof Heading> = {
  title: "Primitives/Heading",
  component: Heading,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { children: "How vexingly quick daft zebras jump" },
};

export const CotijubaLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <Copy />
    </ThemeStoryFrame>
  ),
};

export const CotijubaDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="dark">
      <Copy />
    </ThemeStoryFrame>
  ),
};

export const SerraLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="light">
      <Copy />
    </ThemeStoryFrame>
  ),
};

export const SerraDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="dark">
      <Copy />
    </ThemeStoryFrame>
  ),
};
