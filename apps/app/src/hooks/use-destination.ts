import { useCallback, useEffect, useReducer } from "react";

import { getJourneyDataset } from "@/data/destination";
import { isOnline, subscribeOnline } from "@/lib/net";
import {
  LOAD_DEADLINE_MS,
  initialJourneyState,
  journeyReducer,
} from "@/state/journey";

/**
 * Drives the journey state machine with the fixture loader. Loading is
 * bounded: a deadline timer converts a hung load into the error state, so
 * no screen can spin forever (legacy #60). Retry restarts via attempt.
 */
export function useDestination() {
  // Seeded synchronously from the loader so the static export renders real
  // content; effects below keep the bounded-loading/retry machinery live
  // for the day the seam turns async (Phase 07).
  const [state, dispatch] = useReducer(journeyReducer, undefined, () =>
    initialJourneyState(getJourneyDataset()),
  );

  useEffect(() => {
    let cancelled = false;
    // The fixture loader is synchronous today; the async seam stays so the
    // states are real from day one (a network source lands in Phase 07).
    const timer = setTimeout(() => {
      dispatch({ type: "deadlineExceeded" });
    }, LOAD_DEADLINE_MS);
    void Promise.resolve().then(() => {
      if (cancelled) return;
      const result = getJourneyDataset();
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
  }, [state.attempt]);

  useEffect(() => {
    dispatch({ type: "offlineChanged", offline: !isOnline() });
    return subscribeOnline((online) =>
      dispatch({ type: "offlineChanged", offline: !online }),
    );
  }, []);

  const retry = useCallback(() => dispatch({ type: "retry" }), []);

  return { state, retry };
}
