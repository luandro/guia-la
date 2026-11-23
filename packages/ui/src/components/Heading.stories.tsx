import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { Heading } from "./Heading";
import {
  copyFor,
  LocaleMatrix,
  ThemeStoryFrame,
  type StoryLocale,
} from "./story-frame";

/**
 * Heading levels 1-3 (display / title / heading roles) with header
 * semantics. Fixture text only — review surfaces, not shipped UI (D-14).
 */

function Copy({ locale = "en" }: { locale?: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <View style={{ gap: 12 }}>
      <Heading level={1}>{c.heading.level1}</Heading>
      <Heading level={2}>{c.heading.level2}</Heading>
      <Heading level={3}>{c.heading.level3}</Heading>
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
