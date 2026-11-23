import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset } from "../theme/presets";
import { Skeleton } from "./Skeleton";
import { ThemeStoryFrame } from "./story-frame";

/**
 * Skeleton blocks: single line, avatar + lines (the list-row loading
 * shape) and a labelled group. The pulse honors the OS reduce-motion
 * setting; fixture labels only (D-14).
 */

function Copy() {
  return (
    <View style={{ gap: 12 }}>
      <Skeleton width="60%" />
      <Skeleton />
      <Skeleton width="85%" />
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Skeleton width={48} height={48} radius="full" />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="70%" />
          <Skeleton width="40%" />
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Skeleton label="Loading place details" />
        <Skeleton width="92%" />
      </View>
    </View>
  );
}

const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Skeleton",
  component: Skeleton,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { width: "70%" },
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
