import type { StorybookConfig } from "@storybook/react-native-web-vite";

/**
 * Web Storybook for the guia.la design system (spike S9, PR 03-1).
 *
 * Framework is `react-native-web-vite` (not plain react-vite) so the same
 * CSF files that run on device via `.rnstorybook/` also run on web — the
 * "Both" mode under test. Stories live in packages/ui, colocated with the
 * components they review.
 */
const config: StorybookConfig = {
  // Globs resolve from the config dir (apps/storybook/.storybook): three
  // levels up reaches the repo root and packages/ui — learned by two empty
  // builds of this spike.
  stories: ["../../../packages/ui/src/**/*.stories.tsx"],
  framework: "@storybook/react-native-web-vite",
};

export default config;
