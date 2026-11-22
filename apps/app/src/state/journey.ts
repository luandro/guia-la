import type { DestinationData, Result } from "@guia-la/core";

/**
 * Journey state machine (task 02-9): the Places list/detail screens render
 * exclusively from this state. Pure logic, unit-tested; the hook
 * (src/hooks/use-destination.ts) drives it with the fixture loader and a
 * deadline timer.
 *
 * The failure modes are the point (legacy #60/#66): loading is bounded by a
 * deadline after which it becomes the error state — never an unbounded
 * spinner — empty is explained, error offers retry, offline is a visible
 * hint rather than a gate.
 */

/** Loading deadline: after this long, loading turns into a timeout error. */
export const LOAD_DEADLINE_MS = 8_000;

export type JourneyError =
  { kind: "timeout" } | { kind: "load"; message: string };

export interface JourneyState {
  status: "loading" | "loaded" | "empty" | "error";
  data?: DestinationData;
  error?: JourneyError;
  /** Increments on every retry; effects key re-loading off it. */
  attempt: number;
  /** Offline hint flag — never gates the journey (fixtures are bundled). */
  offline: boolean;
}

export type JourneyAction =
  | { type: "loaded"; data: DestinationData }
  | { type: "failed"; message: string }
  | { type: "deadlineExceeded" }
  | { type: "retry" }
  | { type: "offlineChanged"; offline: boolean };

export function initialJourneyState(
  initial?: Result<DestinationData>,
): JourneyState {
  const state: JourneyState = { status: "loading", attempt: 0, offline: false };
  if (!initial) return state;
  // Static rendering runs no effects: seed the state synchronously from the
  // loader result so the exported raw HTML carries real content (names,
  // summaries, markers) — not a loading label.
  if (initial.ok) {
    return journeyReducer(state, { type: "loaded", data: initial.value });
  }
  return journeyReducer(state, {
    type: "failed",
    message: initial.error.message,
  });
}

export function journeyReducer(
  state: JourneyState,
  action: JourneyAction,
): JourneyState {
  switch (action.type) {
    case "loaded": {
      if (state.status !== "loading") return state;
      return {
        ...state,
        status: action.data.places.length === 0 ? "empty" : "loaded",
        data: action.data,
      };
    }
    case "failed": {
      if (state.status !== "loading") return state;
      return {
        ...state,
        status: "error",
        error: { kind: "load", message: action.message },
      };
    }
    case "deadlineExceeded": {
      // A late tick after the state already resolved changes nothing.
      if (state.status !== "loading") return state;
      return { ...state, status: "error", error: { kind: "timeout" } };
    }
    case "retry": {
      return {
        ...state,
        status: "loading",
        error: undefined,
        data: undefined,
        attempt: state.attempt + 1,
      };
    }
    case "offlineChanged": {
      return { ...state, offline: action.offline };
    }
  }
}
