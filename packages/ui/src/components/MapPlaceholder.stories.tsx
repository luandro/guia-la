import type { Meta, StoryObj } from "@storybook/react";

import { cotijubaPreset, serraPreset } from "../theme/presets";
import { MapPlaceholder, type MapPlaceholderProps } from "./MapPlaceholder";
import { ThemeStoryFrame } from "./story-frame";

/**
 * MapPlaceholder: the honest stand-in until real map widgets arrive
 * (Phase 06+). Fixture text only — review surfaces, not shipped UI (D-14).
 */

const DEMO: MapPlaceholderProps = {
  label: "Map of the destination",
  hint: "Interactive maps arrive with the guide widgets.",
};

const meta: Meta<typeof MapPlaceholder> = {
  title: "Primitives/MapPlaceholder",
  component: MapPlaceholder,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: DEMO,
};

export const CotijubaLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="light">
      <MapPlaceholder {...DEMO} />
    </ThemeStoryFrame>
  ),
};

export const CotijubaDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={cotijubaPreset.id} mode="dark">
      <MapPlaceholder {...DEMO} />
    </ThemeStoryFrame>
  ),
};

export const SerraLight: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="light">
      <MapPlaceholder {...DEMO} />
    </ThemeStoryFrame>
  ),
};

export const SerraDark: Story = {
  render: () => (
    <ThemeStoryFrame presetId={serraPreset.id} mode="dark">
      <MapPlaceholder {...DEMO} />
    </ThemeStoryFrame>
  ),
};
