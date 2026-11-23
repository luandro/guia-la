import type { Meta, StoryObj } from "@storybook/react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { ReactNode } from "react";

import { Text } from "../components/Text";
import { cotijubaPreset, serraPreset } from "../theme/presets";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";
import {
  COLOR_ROLES,
  ELEVATION_LEVELS,
  RADIUS_STEPS,
  SPACING_STEPS,
  TYPOGRAPHY_ROLES,
} from "./types";

/**
 * Token sheet (PRs 03-3/03-4): every color role, typography role,
 * spacing step, radius step and elevation level of the active preset —
 * one story per preset × mode plus an interactive variant for the review
 * journey (switch theme and mode without leaving the story).
 *
 * Role names and sample strings are dev-only review labels (D-14), not
 * shipped UI. No hardcoded colors or sizes: everything renders through
 * the tokens it documents.
 */

function Canvas({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.colors.background }}
      contentContainerStyle={{
        padding: tokens.spacing.lg,
        gap: tokens.spacing.xl,
      }}
    >
      {children}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: tokens.spacing.sm }}>
      <Text
        style={[tokens.typography.heading, { color: tokens.colors.primary }]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Swatch({ role, color }: { role: string; color: string }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.swatchRow, { gap: tokens.spacing.md }]}>
      <View
        style={[
          styles.swatch,
          {
            backgroundColor: color,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radius.sm,
          },
        ]}
      />
      <View>
        <Text style={tokens.typography.label}>{role}</Text>
        <Text
          style={[
            tokens.typography.caption,
            { color: tokens.colors.textMuted },
          ]}
        >
          {color}
        </Text>
      </View>
    </View>
  );
}

function ColorsSection() {
  const { tokens } = useTheme();
  return (
    <Section title="Colors (semantic roles)">
      {COLOR_ROLES.map((role) => (
        <Swatch key={role} role={role} color={tokens.colors[role]} />
      ))}
    </Section>
  );
}

function TypographySection() {
  const { tokens } = useTheme();
  return (
    <Section title="Typography (roles)">
      {TYPOGRAPHY_ROLES.map((role) => {
        const token = tokens.typography[role];
        return (
          <View key={role}>
            <Text
              style={[
                tokens.typography.caption,
                { color: tokens.colors.textMuted },
              ]}
            >
              {role} — {token.fontSize}/{token.lineHeight} {token.fontWeight}
            </Text>
            <Text style={token}>Vejamos a quick brown fox</Text>
          </View>
        );
      })}
    </Section>
  );
}

function ScalesSection() {
  const { tokens } = useTheme();
  return (
    <Section title="Spacing, radius, elevation">
      <View style={{ gap: tokens.spacing.xs }}>
        {SPACING_STEPS.map((step) => (
          <View
            key={step}
            style={[styles.scaleRow, { gap: tokens.spacing.md }]}
          >
            <Text style={tokens.typography.caption}>{step}</Text>
            <View
              style={{
                height: tokens.spacing.sm,
                width: tokens.spacing[step],
                backgroundColor: tokens.colors.accent,
              }}
            />
          </View>
        ))}
      </View>
      <View style={[styles.scaleRow, { gap: tokens.spacing.sm }]}>
        {RADIUS_STEPS.map((step) => (
          <View
            key={step}
            style={{
              width: tokens.spacing.xl,
              height: tokens.spacing.xl,
              backgroundColor: tokens.colors.primary,
              borderRadius: tokens.radius[step],
            }}
          />
        ))}
      </View>
      <View style={[styles.scaleRow, { gap: tokens.spacing.md }]}>
        {ELEVATION_LEVELS.map((level) => (
          <View
            key={level}
            style={{
              width: tokens.spacing.xl,
              height: tokens.spacing.xl,
              backgroundColor: tokens.colors.surface,
              elevation: tokens.elevation[level],
            }}
          />
        ))}
      </View>
    </Section>
  );
}

function TokenSheet() {
  return (
    <Canvas>
      <ColorsSection />
      <TypographySection />
      <ScalesSection />
    </Canvas>
  );
}

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
      {children}
    </ThemeProvider>
  );
}

const meta: Meta<typeof TokenSheet> = {
  title: "Tokens/Token sheet",
  component: TokenSheet,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const CotijubaLight: Story = {
  render: () => (
    <Frame preset={cotijubaPreset.id} mode="light">
      <TokenSheet />
    </Frame>
  ),
};

export const CotijubaDark: Story = {
  render: () => (
    <Frame preset={cotijubaPreset.id} mode="dark">
      <TokenSheet />
    </Frame>
  ),
};

export const SerraLight: Story = {
  render: () => (
    <Frame preset={serraPreset.id} mode="light">
      <TokenSheet />
    </Frame>
  ),
};

export const SerraDark: Story = {
  render: () => (
    <Frame preset={serraPreset.id} mode="dark">
      <TokenSheet />
    </Frame>
  ),
};

export const Interactive: Story = {
  args: { preset: cotijubaPreset.id, mode: "light" },
  argTypes: {
    preset: { control: "radio", options: [cotijubaPreset.id, serraPreset.id] },
    mode: { control: "radio", options: ["light", "dark"] },
  },
  render: ({ preset, mode }) => (
    <Frame preset={preset} mode={mode}>
      <TokenSheet />
    </Frame>
  ),
};

const styles = StyleSheet.create({
  swatchRow: { flexDirection: "row", alignItems: "center" },
  swatch: { width: 40, height: 40, borderWidth: 1 },
  scaleRow: { flexDirection: "row", alignItems: "center" },
});
