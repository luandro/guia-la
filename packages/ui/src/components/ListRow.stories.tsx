import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { Chip } from "./Chip";
import { ListRow } from "./ListRow";
import {
  copyFor,
  LocaleMatrix,
  StoryCanvas,
  ThemeStoryFrame,
  type StoryLocale,
} from "./story-frame";

/**
 * ListRow: plain, descriptive, trailing and pressable, with and without
 * separators. Fixture text only — review surfaces, not shipped UI (D-14).
 */

function Copy({ locale = "en" }: { locale?: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <View>
      <ListRow title={c.listRow.title} separator />
      <ListRow
        title={c.listRow.title}
        description={c.listRow.description}
        separator
      />
      <ListRow
        title={c.listRow.trailingTitle}
        description={c.listRow.description}
        trailing={<Chip label={c.chip.success} tone="success" />}
        separator
        onPress={() => {}}
      />
      <ListRow title={c.button.ghost} onPress={() => {}} />
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
