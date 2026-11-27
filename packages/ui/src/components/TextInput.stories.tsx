import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import {
  copyFor,
  LocaleMatrix,
  ThemeStoryFrame,
  type StoryLocale,
} from "./story-frame";
import { TextInput } from "./TextInput";

/**
 * TextInput with its field scaffolding: label + hint, focus and error
 * states. Fixture text only — review surfaces, not shipped UI (D-14).
 */

function Copy({ locale = "en" }: { locale?: StoryLocale }) {
  const c = copyFor(locale);
  return (
    <View style={{ gap: 16 }}>
      <TextInput label={c.textInput.label} hint={c.textInput.hint} />
      <TextInput
        label={c.textInput.emailLabel}
        hint={c.textInput.emailHint}
        defaultValue={c.textInput.emailValue}
      />
      <TextInput
        label={c.textInput.emailLabel}
        error={c.textInput.emailError}
        defaultValue={c.textInput.emailValue}
      />
      <TextInput
        label={c.textInput.label}
        placeholder={c.textInput.placeholder}
      />
      <TextInput
        label={c.textInput.readOnlyLabel}
        hint={c.textInput.readOnlyHint}
        editable={false}
        value={c.textInput.readOnlyValue}
      />
    </View>
  );
}

const meta: Meta<typeof TextInput> = {
  title: "Primitives/TextInput",
  component: TextInput,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { label: "Search places", hint: "Name, category or village" },
};

export const Error: Story = {
  args: { label: "Email", error: "This address is missing an @ sign" },
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
