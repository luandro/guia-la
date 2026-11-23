/**
 * Reduce-motion store (PR #19 review): the OS reduce-motion preference as
 * one shared, dependency-injected store instead of one query per Skeleton.
 *
 * Contract:
 * - `{ known: false, enabled: false }` until the first query resolves —
 *   callers must HOLD any animation in that state, so a user who asked for
 *   reduced motion never sees the pulse start (the old per-instance query
 *   animated first and stopped after the promise resolved).
 * - One `isReduceMotionEnabled()` call serves every subscriber.
 * - `reduceMotionChanged` events update the state live.
 * - Best-effort degradation: a missing API or a rejected query resolves to
 *   `known: true, enabled: false` (animate) rather than holding forever —
 *   motion is the platform default when the preference cannot be read.
 *
 * The React Native AccessibilityInfo surface is injected, keeping this
 * module importable (and testable) in plain node.
 */

/** The slice of RN's AccessibilityInfo the store needs. */
export type ReduceMotionSource = {
  isReduceMotionEnabled?: () => Promise<boolean>;
  addEventListener?: (
    event: "reduceMotionChanged",
    handler: (enabled: boolean) => void,
  ) => { remove: () => void };
};

export type ReduceMotionSnapshot = {
  /** False until the first query/change resolves — the "hold" state. */
  known: boolean;
  enabled: boolean;
};

const INITIAL: ReduceMotionSnapshot = { known: false, enabled: false };

export function createReduceMotionStore(source: ReduceMotionSource) {
  let snapshot: ReduceMotionSnapshot = INITIAL;
  const listeners = new Set<() => void>();
  let started = false;

  function commit(next: ReduceMotionSnapshot): void {
    if (next.known === snapshot.known && next.enabled === snapshot.enabled) {
      return;
    }
    snapshot = next;
    for (const listener of listeners) listener();
  }

  /** Starts the shared query and the change subscription exactly once. */
  function ensureStarted(): void {
    if (started) return;
    started = true;
    const query =
      typeof source.isReduceMotionEnabled === "function"
        ? source.isReduceMotionEnabled()
        : // No API (older RN / hostile host): animate, do not hold forever.
          Promise.resolve(false);
    query.then(
      (enabled) => commit({ known: true, enabled }),
      () => commit({ known: true, enabled: false }),
    );
    if (typeof source.addEventListener === "function") {
      source.addEventListener("reduceMotionChanged", (enabled) =>
        commit({ known: true, enabled }),
      );
    }
  }

  return {
    /** Current state; referentially stable between notifications. */
    getSnapshot(): ReduceMotionSnapshot {
      return snapshot;
    },
    /** Joins the shared store; returns the unsubscribe function. */
    subscribe(listener: () => void): () => void {
      ensureStarted();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type ReduceMotionStore = ReturnType<typeof createReduceMotionStore>;
