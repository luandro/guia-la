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

/**
 * Semantic level and visual size are independent (PR #20 review): the level
 * decides the exported h1/h2/h3, the size decides the type. Every row below
 * is level 1 (an h1) at a different size — the size never changes the
 * semantics, and the compact level-3 look a state title keeps while being
 * the page's h1 is the middle row.
 */
function LevelVsSizeDemo() {
  const c = copyFor("en");
  return (
    <View style={{ gap: 12 }}>
      <Heading level={1} size={3}>
        {`level 1 / size 3 — ${c.heading.level3}`}
      </Heading>
      <Heading level={1} size={2}>
        {`level 1 / size 2 — ${c.heading.level2}`}
      </Heading>
      <Heading level={1} size={1}>
        {`level 1 / size 1 — ${c.heading.level1}`}
      </Heading>
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

/** Level 1 at three sizes: the level is semantics, the size is the look. */
export const LevelVsSize: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <LevelVsSizeDemo />
    </ThemeStoryFrame>
  ),
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
