import type { Meta, StoryObj } from "@storybook/react";
import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

/**
 * Text under the theme engine (PRs 03-3/03-4): one story per preset ×
 * mode so the review URL covers the switching matrix without controls,
 * plus a provider-less story pinning the never-crash default. The copy
 * exercises the typography scale through real tokens — no hardcoded
 * sizes or colors in this file.
 *
 * Fixture text only: real UI strings flow through the i18n layer (D-14);
 * stories are dev review surfaces, not shipped UI.
 */

function Frame({
  preset,
  mode,
  children,
}: {
  preset: string;
  mode: "light" | "dark";
  children: ReactNode;
}) {
  return (
    <ThemeProvider initialPresetId={preset} initialModeSetting={mode}>
      <Canvas>{children}</Canvas>
    </ThemeProvider>
  );
}

/** Paints the theme's own background so dark presets review on dark. */
function Canvas({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View
      style={[
        styles.fill,
        {
          backgroundColor: tokens.colors.background,
          padding: tokens.spacing.lg,
        },
      ]}
    >
      {children}
    </View>
  );
}

/** Sample copy rendering every typography role with its token style. */
function Copy() {
  const { tokens } = useTheme();
  const type = tokens.typography;
  return (
    <View style={{ gap: tokens.spacing.md }}>
      <Text style={type.display}>Sphinx of black quartz, judge my vow</Text>
      <Text style={type.title}>Travaillez-vous ce soir?</Text>
      <Text style={type.heading}>How vexingly quick daft zebras jump</Text>
      <Text style={type.body}>
        The quick brown fox jumps over the lazy dog — 0123456789 — journeys end
        quickly with fierce travel pace.
      </Text>
      <Text style={type.bodySmall}>
        Pchnąć w tę łódź jeża lub ośm skrzyń fig
      </Text>
      <Text style={[type.label, { color: tokens.colors.primary }]}>
        label role in the primary role
      </Text>
      <Text style={[type.caption, { color: tokens.colors.textMuted }]}>
        Fixture copy, not shipped UI.
      </Text>
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

export const CotijubaLight: Story = {
  render: () => (
    <Frame preset={cotijubaPreset.id} mode="light">
      <Copy />
    </Frame>
  ),
};

export const CotijubaDark: Story = {
  render: () => (
    <Frame preset={cotijubaPreset.id} mode="dark">
      <Copy />
    </Frame>
  ),
};

export const SerraLight: Story = {
  render: () => (
    <Frame preset={serraPreset.id} mode="light">
      <Copy />
    </Frame>
  ),
};

export const SerraDark: Story = {
  render: () => (
    <Frame preset={serraPreset.id} mode="dark">
      <Copy />
    </Frame>
  ),
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
