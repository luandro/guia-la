import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import {
  copyFor,
  LocaleMatrix,
  ThemeStoryFrame,
  type StoryLocale,
} from "./story-frame";
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
function Copy({ locale = "en" }: { locale?: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <View style={{ gap: 12 }}>
      <Text variant="display">{c.text.display}</Text>
      <Text variant="title">{c.text.title}</Text>
      <Text variant="heading">{c.text.heading}</Text>
      <Text variant="body">{c.text.body}</Text>
      <Text variant="bodySmall">{c.text.bodySmall}</Text>
      <Text variant="label">{c.text.label}</Text>
      <Text variant="caption">{c.text.caption}</Text>
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
