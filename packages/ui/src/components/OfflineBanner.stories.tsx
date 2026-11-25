import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { OfflineBanner } from "./OfflineBanner";
import { ThemeStoryFrame } from "./story-frame";

/**
 * OfflineBanner visible and hidden (hidden keeps an empty status region
 * mounted, so the message is announced when it appears). Fixture text
 * only — review surfaces, not shipped UI (D-14).
 */

function Copy({ visible = true }: { visible?: boolean }) {
  return (
    <View style={{ gap: 12 }}>
      <OfflineBanner
        message="You appear to be offline. Showing saved information."
        visible={visible}
      />
      <View style={{ height: 12 }} />
    </View>
  );
}

const meta: Meta<typeof OfflineBanner> = {
  title: "Primitives/OfflineBanner",
  component: OfflineBanner,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { message: "You appear to be offline. Showing saved information." },
};

export const Hidden: Story = {
  args: {
    message: "You appear to be offline. Showing saved information.",
    visible: false,
  },
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
