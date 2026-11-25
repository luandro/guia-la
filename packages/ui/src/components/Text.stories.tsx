import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { ThemeStoryFrame } from "./story-frame";
import { Text } from "./Text";

/**
 * Text under the theme engine: one story per preset × mode so the review
 * URL covers the switching matrix without controls, plus a provider-less
 * story pinning the never-crash default. The copy exercises the
 * typography scale through real tokens — no hardcoded sizes or colors in
 * this file.
 *
 * Fixture text only: real UI strings flow through the i18n layer (D-14);
 * stories are dev review surfaces, not shipped UI.
 */

/** Sample copy rendering every typography role via its variant. */
function Copy() {
  return (
    <View style={{ gap: 12 }}>
      <Text variant="display">Sphinx of black quartz, judge my vow</Text>
      <Text variant="title">Travaillez-vous ce soir?</Text>
      <Text variant="heading">How vexingly quick daft zebras jump</Text>
      <Text variant="body">
        The quick brown fox jumps over the lazy dog — 0123456789 — journeys end
        quickly with fierce travel pace.
      </Text>
      <Text variant="bodySmall">Pchnąć w tę łódź jeża lub ośm skrzyń fig</Text>
      <Text variant="label">label role</Text>
      <Text variant="caption">Fixture copy, not shipped UI.</Text>
    </View>
  );
}

const meta: Meta<typeof Text> = {
  title: "Primitives/Text",
  component: Text,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { children: "Sphinx of black quartz, judge my vow." },
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
