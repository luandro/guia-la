import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { ErrorState } from "./ErrorState";
import { Text } from "./Text";
import { ThemeStoryFrame } from "./story-frame";

/**
 * ErrorState with a retry that visibly fires (phase-03 QA journey 4:
 * forcing the retry action must show it happened, not a silent no-op).
 * Fixture text only — review surfaces, not shipped UI (D-14).
 */

function RetryDemo() {
  const [attempts, setAttempts] = useState(0);
  return (
    <View style={{ gap: 12 }}>
      <ErrorState
        title="Something went wrong"
        description="The places could not be loaded."
        retryLabel="Try again"
        onRetry={() => {
          setAttempts(attempts + 1);
        }}
      />
      <Text variant="caption">
        Retry fired {attempts} time{attempts === 1 ? "" : "s"} — the counter
        proves the callback runs.
      </Text>
    </View>
  );
}

const meta: Meta<typeof ErrorState> = {
  title: "Primitives/ErrorState",
  component: ErrorState,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: "Something went wrong",
    description: "The places could not be loaded.",
    retryLabel: "Try again",
    onRetry: () => {},
  },
};

export const RetryFiresVisibly: Story = {
  render: () => <RetryDemo />,
};

export const CotijubaLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <RetryDemo />
    </ThemeStoryFrame>
  ),
};

export const CotijubaDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="dark">
      <RetryDemo />
    </ThemeStoryFrame>
  ),
};

export const SerraLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="light">
      <RetryDemo />
    </ThemeStoryFrame>
  ),
};

export const SerraDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="dark">
      <RetryDemo />
    </ThemeStoryFrame>
  ),
};
