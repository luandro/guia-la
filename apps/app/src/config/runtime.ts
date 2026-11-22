import Constants from "expo-constants";

import { validateAppExtra, type AppExtra } from "./env";

/**
 * Runtime view of the app config: whatever app.config.ts computed at config
 * time (from APP_ENV/APP_VARIANT) arrives in the bundle through
 * expo.extra, validated here. No EXPO_PUBLIC_* variables exist (SPEC.md —
 * nothing to expose yet).
 */
export function getAppConfig(): AppExtra {
  return validateAppExtra(Constants.expoConfig?.extra);
}
