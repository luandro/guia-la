/**
 * Expo Router route for on-device Storybook (spike S9, PR 03-1) — the
 * setup the installed @storybook/react-native README recommends for Expo
 * ("Option 3: Expo Router (recommended for Expo)"). When STORYBOOK_ENABLED
 * is unset at bundle time, the metro wrapper replaces this import with an
 * inert stub component, so no Storybook code reaches the bundle.
 */
export { default } from "../../.rnstorybook";
