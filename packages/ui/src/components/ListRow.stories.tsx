import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { Chip } from "./Chip";
import { ListRow } from "./ListRow";
import { StoryCanvas, ThemeStoryFrame } from "./story-frame";

/**
 * ListRow: plain, descriptive, trailing and pressable, with and without
 * separators. Fixture text only — review surfaces, not shipped UI (D-14).
 */

function Copy() {
  return (
    <View>
      <ListRow title="Praia do Farol" separator />
      <ListRow
        title="Praia do Farol"
        description="Lighthouse beach on the island's north shore"
        separator
      />
      <ListRow
        title="Trilha do Farol"
        description="Trail to the lighthouse viewpoint"
        trailing={<Chip label="verified" tone="success" />}
        trailingAccessibilityLabel="verified"
        separator
        onPress={() => {}}
      />
      <ListRow title="Last row without separator" onPress={() => {}} />
    </View>
  );
}

const meta: Meta<typeof ListRow> = {
  title: "Primitives/ListRow",
  component: ListRow,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <StoryCanvas>
      <Copy />
    </StoryCanvas>
  ),
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
