import { useSyncExternalStore } from "react";
import { AccessibilityInfo } from "react-native";

import { createReduceMotionStore } from "./reduceMotionStore";

/**
 * The module-level reduce-motion store (PR #19 review): every Skeleton (and
 * any future animated primitive) shares one AccessibilityInfo query and one
 * reduceMotionChanged subscription for the process lifetime, instead of one
 * per instance (LoadingView alone mounts three).
 */

const sharedStore = createReduceMotionStore({
  isReduceMotionEnabled: () => AccessibilityInfo.isReduceMotionEnabled(),
  addEventListener: (event, handler) =>
    AccessibilityInfo.addEventListener(event, handler),
});

/** Server/static-export snapshot: never animate what was never confirmed. */
const INITIAL_SNAPSHOT = { known: false, enabled: false };

/** The shared OS reduce-motion preference as a React subscription. */
export function useReduceMotionPreference() {
  return useSyncExternalStore(
    sharedStore.subscribe,
    sharedStore.getSnapshot,
    () => INITIAL_SNAPSHOT,
  );
}
