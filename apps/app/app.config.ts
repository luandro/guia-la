import { z } from "zod";

import type { ExpoConfig } from "expo/config";

/**
 * guia.la pilot app config (task 02-7).
 *
 * - `web.output: "static"` is explicit. Never rely on the default: the SDK 58
 *   changelog and the publish guide contradict each other about what an
 *   unset value means (expo-stack research §1.3 / S2).
 * - asyncRoutes stays at the SDK 58 default (enabled on web): one JS chunk
 *   per route keeps per-page payloads small across the ×6 locale tree
 *   (decision recorded in docs/features/phase-02-skeleton/plan.md).
 * - Config-time env guard: APP_ENV and APP_VARIANT must be set; a missing or
 *   invalid variable throws here, naming it, before any build work starts.
 *   APP_VARIANT selects the destination fixture set via expo.extra.
 *
 * Self-contained on purpose: the Expo config loader transpiles only this
 * file in Node (nested extensionless .ts imports do not resolve).
 * src/config/env.ts mirrors this contract for app runtime code, and
 * src/config/app-config.test.ts pins the two to each other plus this file
 * through the real `expo config` command.
 */

const appEnvSchema = z.enum([
  "development",
  "preview",
  "staging",
  "production",
]);
const appVariantSchema = z.enum(["flagship", "cotijuba-web", "serra-web"]);

const DESTINATION_BY_VARIANT = {
  flagship: "cotijuba",
  "cotijuba-web": "cotijuba",
  "serra-web": "serra",
} as const;

declare const process: {
  env: Record<string, string | undefined>;
};

function requireVar<T extends string>(
  name: string,
  options: readonly T[],
  example: T,
  env: Record<string, string | undefined>,
): T {
  const value = env[name];
  if (value === undefined || value === "") {
    throw new Error(
      `Missing required environment variable ${name}. Build scripts set it explicitly; e.g. ${name}=${example}`,
    );
  }
  if (!(options as readonly string[]).includes(value)) {
    throw new Error(
      `Environment variable ${name} is invalid: got ${JSON.stringify(value)}, expected one of: ${options.join(", ")}`,
    );
  }
  return value as T;
}

const appEnv = requireVar(
  "APP_ENV",
  appEnvSchema.options,
  "development",
  process.env,
);
const appVariant = requireVar(
  "APP_VARIANT",
  appVariantSchema.options,
  "cotijuba-web",
  process.env,
);
const destinationId = DESTINATION_BY_VARIANT[appVariant];

const config: ExpoConfig = {
  name: "guia.la",
  slug: "guia-la",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "guiala",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/expo.icon",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],
    "expo-localization",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appEnv,
    appVariant,
    destinationId,
  },
};

export default config;
