import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { Card } from "./Card";
import { Button } from "./Button";
import { Text } from "./Text";
import { ThemeStoryFrame } from "./story-frame";

/**
 * Card at each elevation level. Fixture text only — review surfaces, not
 * shipped UI (D-14).
 */

function Copy() {
  return (
    <View style={{ gap: 12 }}>
      <Card elevationLevel="none">
        <Text variant="heading">Flat surface</Text>
        <Text variant="bodySmall">elevationLevel: none</Text>
      </Card>
      <Card elevationLevel="low">
        <Text variant="heading">Low elevation</Text>
        <Text variant="bodySmall">elevationLevel: low</Text>
      </Card>
      <Card elevationLevel="mid">
        <Text variant="heading">Mid elevation</Text>
        <Text variant="bodySmall">elevationLevel: mid</Text>
      </Card>
      <Card elevationLevel="high">
        <Text variant="heading">High elevation</Text>
        <Text variant="bodySmall">elevationLevel: high</Text>
      </Card>
      <Card>
        <Text variant="body">
          Cards compose with the other primitives — a paragraph and an action.
        </Text>
        <View style={{ paddingTop: 8 }}>
          <Button label="Open place" variant="secondary" onPress={() => {}} />
        </View>
      </Card>
    </View>
  );
}

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card>
      <Text>Plain card with default tokens</Text>
    </Card>
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
