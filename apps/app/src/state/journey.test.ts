import { describe, expect, it } from "vitest";

import type { DestinationData } from "@guia-la/core";

import {
  LOAD_DEADLINE_MS,
  initialJourneyState,
  journeyReducer,
  type JourneyAction,
} from "./journey.js";

const data = (places: DestinationData["places"]): DestinationData => ({
  destination: {
    id: "cotijuba",
    name: "Cotijuba",
    defaultLocale: "pt-BR",
    locales: ["pt-BR", "en", "es", "fr", "nl", "de"],
    source: "synthetic",
  },
  categories: [],
  places,
});

const samplePlace: DestinationData["places"][number] = {
  id: "fx-cotijuba-001",
  slug: "praia-da-ponta-norte",
  category: "beach",
  location: { lat: -1.238, lng: -48.562 },
  source: "synthetic",
  verifiedAt: "2026-11-22",
  content: {
    "pt-BR": {
      name: "Praia da Ponta Norte",
      summary: "Praia calma.",
      machineTranslated: false,
    },
  },
};

describe("journeyReducer", () => {
  it("starts in bounded loading", () => {
    const state = initialJourneyState();
    expect(state.status).toBe("loading");
    expect(state.attempt).toBe(0);
    expect(state.offline).toBe(false);
    expect(LOAD_DEADLINE_MS).toBeGreaterThan(0);
  });

  it("can start synchronously from a loader result (static rendering)", () => {
    const loaded = initialJourneyState({
      ok: true,
      value: data([samplePlace]),
    });
    expect(loaded.status).toBe("loaded");
    expect(loaded.data?.places).toHaveLength(1);

    const empty = initialJourneyState({ ok: true, value: data([]) });
    expect(empty.status).toBe("empty");

    const failed = initialJourneyState({
      ok: false,
      error: { message: "boom" },
    });
    expect(failed.status).toBe("error");
    expect(failed.error).toEqual({ kind: "load", message: "boom" });
  });

  it("loading + loaded(places) -> loaded", () => {
    let state = initialJourneyState();
    state = journeyReducer(state, {
      type: "loaded",
      data: data([samplePlace]),
    });
    expect(state.status).toBe("loaded");
    expect(state.data?.places).toHaveLength(1);
  });

  it("loading + loaded(no places) -> empty, never a spinner over nothing", () => {
    let state = initialJourneyState();
    state = journeyReducer(state, { type: "loaded", data: data([]) });
    expect(state.status).toBe("empty");
  });

  it("loading + failure -> error carrying the message", () => {
    let state = initialJourneyState();
    state = journeyReducer(state, {
      type: "failed",
      message: "places file invalid",
    });
    expect(state.status).toBe("error");
    expect(state.error).toEqual({
      kind: "load",
      message: "places file invalid",
    });
  });

  it("loading + deadline exceeded -> timeout error (no unbounded spinner)", () => {
    let state = initialJourneyState();
    state = journeyReducer(state, { type: "deadlineExceeded" });
    expect(state.status).toBe("error");
    expect(state.error).toEqual({ kind: "timeout" });
  });

  it("a late deadline tick never clobbers a finished state", () => {
    let state = initialJourneyState();
    state = journeyReducer(state, {
      type: "loaded",
      data: data([samplePlace]),
    });
    state = journeyReducer(state, { type: "deadlineExceeded" });
    expect(state.status).toBe("loaded");
  });

  it("retry from error restarts loading on a new attempt", () => {
    let state = initialJourneyState();
    state = journeyReducer(state, { type: "failed", message: "boom" });
    state = journeyReducer(state, { type: "retry" });
    expect(state.status).toBe("loading");
    expect(state.attempt).toBe(1);
    expect(state.error).toBeUndefined();
  });

  it("retry after a timeout also restarts loading", () => {
    let state = initialJourneyState();
    state = journeyReducer(state, { type: "deadlineExceeded" });
    state = journeyReducer(state, { type: "retry" });
    expect(state.status).toBe("loading");
  });

  it("offline toggles a hint flag without changing the status", () => {
    let state = initialJourneyState();
    state = journeyReducer(state, { type: "offlineChanged", offline: true });
    expect(state.status).toBe("loading");
    expect(state.offline).toBe(true);
    state = journeyReducer(state, {
      type: "loaded",
      data: data([samplePlace]),
    });
    expect(state.status).toBe("loaded");
    expect(state.offline).toBe(true);
    state = journeyReducer(state, { type: "offlineChanged", offline: false });
    expect(state.offline).toBe(false);
  });

  it("a new attempt resets any stale error", () => {
    let state = initialJourneyState();
    state = journeyReducer(state, { type: "failed", message: "x" });
    state = journeyReducer(state, { type: "retry" });
    state = journeyReducer(state, { type: "failed", message: "y" });
    expect(state.error).toEqual({ kind: "load", message: "y" });
  });

  it("exposes the action union used by the hook", () => {
    const actions: JourneyAction[] = [
      { type: "loaded", data: data([]) },
      { type: "failed", message: "x" },
      { type: "deadlineExceeded" },
      { type: "retry" },
      { type: "offlineChanged", offline: true },
    ];
    expect(actions).toHaveLength(5);
  });
});
