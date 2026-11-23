import type { StorybookConfig } from "@storybook/react-native";

/**
 * On-device Storybook config (spike S9, PR 03-1). Same CSF files as the
 * web runtime in apps/storybook/.storybook — "Both" mode. Globs resolve
 * from this directory: three levels up is the repo root.
 */
const main: StorybookConfig = {
  stories: ["../../../packages/ui/src/**/*.stories.tsx"],
  deviceAddons: [
    "@storybook/addon-ondevice-controls",
    "@storybook/addon-ondevice-actions",
  ],
};

export default main;
