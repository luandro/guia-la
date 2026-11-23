import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "./Text";

/**
 * One trivial story to prove the S9 pipeline: this CSF file is consumed by
 * both runtimes — `apps/storybook/.storybook/` (web, react-native-web-vite)
 * and `apps/app/.rnstorybook/` (device, @storybook/react-native).
 *
 * Fixture text only: real UI strings flow through the i18n layer (D-14);
 * stories are dev review surfaces, not shipped UI.
 */
const meta: Meta<typeof Text> = {
  title: "Primitives/Text",
  component: Text,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: "Sphinx of black quartz, judge my vow.",
  },
};
