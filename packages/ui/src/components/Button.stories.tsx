import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { Button } from "./Button";
import { ThemeStoryFrame } from "./story-frame";

/**
 * Button: variants, disabled and loading. Fixture labels only — review
 * surfaces, not shipped UI (D-14).
 */

function AllVariants() {
  return (
    <View style={{ gap: 12 }}>
      <Button label="Continue" onPress={() => {}} />
      <Button label="Continue" variant="secondary" onPress={() => {}} />
      <Button label="Continue" variant="ghost" onPress={() => {}} />
    </View>
  );
}

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { label: "Continue", onPress: () => {} },
};

export const Disabled: Story = {
  args: { label: "Continue", disabled: true },
};

export const Loading: Story = {
  args: { label: "Continue", loading: true },
};

export const CotijubaLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <AllVariants />
    </ThemeStoryFrame>
  ),
};

export const CotijubaDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="dark">
      <AllVariants />
    </ThemeStoryFrame>
  ),
};

export const SerraLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="light">
      <AllVariants />
    </ThemeStoryFrame>
  ),
};

export const SerraDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="dark">
      <AllVariants />
    </ThemeStoryFrame>
  ),
};
