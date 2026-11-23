// Metro config with on-device Storybook (spike S9, PR 03-1).
//
// withStorybook generates .rnstorybook/storybook.requires.ts from the
// stories glob at bundle time. With STORYBOOK_ENABLED unset it replaces
// every Storybook module with an inert stub, so production bundles carry
// no Storybook code (README: "removes all Storybook code from the bundle
// by replacing imports with empty modules").
//
// The /storybook route file is also blocklisted when Storybook is off, so
// Expo Router never discovers it: no dev-only page (with an untranslated
// stub string) reaches the static web export. scripts/s1-assert.sh fails if
// it does.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const {
  withStorybook,
} = require("@storybook/react-native/metro/withStorybook");

const enabled = process.env.STORYBOOK_ENABLED === "true";
const defaultConfig = getDefaultConfig(__dirname);

if (!enabled) {
  const routeFile = path.join(__dirname, "src", "app", "storybook.tsx");
  const escaped = routeFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existing = defaultConfig.resolver.blockList;
  const lists = Array.isArray(existing) ? existing : existing ? [existing] : [];
  defaultConfig.resolver.blockList = [...lists, new RegExp(`^${escaped}$`)];
}

module.exports = withStorybook(defaultConfig, { enabled });
