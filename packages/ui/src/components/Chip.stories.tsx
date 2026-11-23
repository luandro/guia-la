import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { Chip } from "./Chip";
import {
  copyFor,
  LocaleMatrix,
  ThemeStoryFrame,
  type StoryLocale,
} from "./story-frame";

/**
 * Chip tones, static and pressable. Fixture labels only — review
 * surfaces, not shipped UI (D-14).
 */

function Copy({ locale = "en" }: { locale?: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Chip label={c.chip.neutral} />
        <Chip label={c.chip.accent} tone="accent" />
        <Chip label={c.chip.success} tone="success" />
        <Chip label={c.chip.warning} tone="warning" />
        <Chip label={c.chip.danger} tone="danger" />
      </View>
      <Chip label={c.chip.pressable} tone="accent" onPress={() => {}} />
    </View>
  );
}

const meta: Meta<typeof Chip> = {
  title: "Primitives/Chip",
  component: Chip,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { label: "neutral" },
};

/** en, pt-BR and de side by side — de is the long-text overflow locale. */
export const Locales: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <LocaleMatrix render={(locale) => <Copy locale={locale} />} />
    </ThemeStoryFrame>
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
