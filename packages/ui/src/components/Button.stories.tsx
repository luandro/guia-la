import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import {
  copyFor,
  LocaleMatrix,
  ThemeStoryFrame,
  type StoryLocale,
} from "./story-frame";
import { Button } from "./Button";

/**
 * Button: variants, disabled and loading. Fixture labels only — review
 * surfaces, not shipped UI (D-14).
 */

function AllVariants({ locale = "en" }: { locale?: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <View style={{ gap: 12 }}>
      <Button label={c.button.primary} onPress={() => {}} />
      <Button
        label={c.button.secondary}
        variant="secondary"
        onPress={() => {}}
      />
      <Button label={c.button.ghost} variant="ghost" onPress={() => {}} />
      <Button label={c.button.loading} loading />
      <Button label={c.button.disabled} disabled />
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

/** en, pt-BR and de side by side — de is the long-text overflow locale. */
export const Locales: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <LocaleMatrix render={(locale) => <AllVariants locale={locale} />} />
    </ThemeStoryFrame>
  ),
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
