import Constants from "expo-constants";

import type { Result, DestinationData } from "@guia-la/core";
import { loadDestination, type DestinationId } from "@guia-la/fixtures";

import {
  appExtraSchema,
  appVariantSchema,
  destinationForVariant,
} from "@/config/env";

/**
 * The one seam between the app and the fixture store (Phase 01 contract):
 * fixtures are consumed here, never imported ad hoc elsewhere. The
 * destination this build serves was chosen by APP_VARIANT at config time.
 */

export function currentDestinationId(): DestinationId {
  // Primary: whatever app.config.ts computed, baked in via expo.extra.
  const parsed = appExtraSchema.safeParse(Constants.expoConfig?.extra);
  if (parsed.success) {
    return parsed.data.destinationId;
  }
  // Fallback: static rendering and export run in Node with APP_VARIANT set.
  const variant = appVariantSchema.safeParse(process.env.APP_VARIANT);
  if (variant.success) {
    return destinationForVariant(variant.data);
  }
  throw new Error(
    "cannot determine the destination: app config extra is absent and APP_VARIANT is unset (src/data/destination.ts)",
  );
}

/** Load the active destination's fixture set; malformed data never throws. */
export function getJourneyDataset(): Result<DestinationData> {
  return loadDestination(currentDestinationId());
}
