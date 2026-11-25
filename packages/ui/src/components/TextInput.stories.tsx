import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { TextInput } from "./TextInput";
import { ThemeStoryFrame } from "./story-frame";

/**
 * TextInput with its field scaffolding: label + hint, focus and error
 * states. Fixture text only — review surfaces, not shipped UI (D-14).
 */

function Copy() {
  return (
    <View style={{ gap: 16 }}>
      <TextInput label="Search places" hint="Name, category or village" />
      <TextInput
        label="Email"
        hint="We never share it"
        defaultValue="reader@example.org"
      />
      <TextInput
        label="Email"
        error="This address is missing an @ sign"
        defaultValue="reader-at-example"
      />
      <TextInput label="Notes" placeholder="Anything the guide should know" />
      <TextInput
        label="Village"
        hint="Draft saved while offline"
        editable={false}
        value="Vila do Farol"
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
