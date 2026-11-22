import { useCallback, useEffect, useReducer } from "react";

import type { DestinationData, Result } from "@guia-la/core";

import { getJourneyDataset } from "@/data/destination";
import { isOnline, subscribeOnline } from "@/lib/net";
import {
  LOAD_DEADLINE_MS,
  type JourneyAction,
  initialJourneyState,
  journeyReducer,
} from "@/state/journey";

/**
 * One bounded load attempt (PR #14 review: extracted from the hook so the
 * deadline/cancellation/retry wiring is unit-testable with fake timers).
 * A deadline timer converts a hung load into the error state — no screen
 * can spin forever (legacy #60) — and the returned cancel function clears
 * both the timer and the result dispatch for unmount or a new attempt.
 * The fixture loader is synchronous today; the promise seam keeps the
 * states real from day one (a network source lands in Phase 07).
 */
export function startJourneyAttempt(
  load: () => Result<DestinationData> | Promise<Result<DestinationData>>,
  dispatch: (action: JourneyAction) => void,
): () => void {
  let cancelled = false;
  const timer = setTimeout(() => {
    dispatch({ type: "deadlineExceeded" });
  }, LOAD_DEADLINE_MS);
  void Promise.resolve(load()).then((result) => {
    if (cancelled) return;
    dispatch(
      result.ok
        ? { type: "loaded", data: result.value }
        : { type: "failed", message: result.error.message },
    );
  });
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}

/**
 * Drives the journey state machine with the fixture loader. Loading is
 * bounded (see startJourneyAttempt). Retry restarts via attempt.
 */
export function useDestination() {
  // Seeded synchronously from the loader so the static export renders real
  // content; effects below keep the bounded-loading/retry machinery live
  // for the day the seam turns async (Phase 07).
  const [state, dispatch] = useReducer(journeyReducer, undefined, () =>
    initialJourneyState(getJourneyDataset()),
  );

  useEffect(
    () => startJourneyAttempt(getJourneyDataset, dispatch),
    [state.attempt],
  );

  useEffect(() => {
    dispatch({ type: "offlineChanged", offline: !isOnline() });
    return subscribeOnline((online) =>
      dispatch({ type: "offlineChanged", offline: !online }),
    );
  }, []);

  const retry = useCallback(() => dispatch({ type: "retry" }), []);

  return { state, retry };
}
