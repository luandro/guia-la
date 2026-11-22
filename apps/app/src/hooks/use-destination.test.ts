import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DestinationData, Result } from "@guia-la/core";

import { LOAD_DEADLINE_MS } from "@/state/journey";

import { startJourneyAttempt } from "./use-destination";

// The hook module pulls in the fixture seam and the online listeners; the
// extracted attempt driver under test does not use them, so both are stubbed
// to keep this a pure-logic test (component tests arrive in Phase 05).
vi.mock("@/data/destination", () => ({ getJourneyDataset: vi.fn() }));
vi.mock("@/lib/net", () => ({
  isOnline: () => true,
  subscribeOnline: () => () => {},
}));

const data = {
  destination: { id: "cotijuba", defaultLocale: "pt-BR" },
  places: [],
  categories: [],
} as unknown as DestinationData;

const okResult: Result<DestinationData> = { ok: true, value: data };

describe("startJourneyAttempt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires deadlineExceeded after LOAD_DEADLINE_MS when the load hangs", () => {
    const dispatch = vi.fn();
    const cancel = startJourneyAttempt(() => new Promise(() => {}), dispatch);

    vi.advanceTimersByTime(LOAD_DEADLINE_MS - 1);
    expect(dispatch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "deadlineExceeded" });
    cancel();
  });

  it("clears the deadline when the attempt is cancelled (unmount or retry)", () => {
    const dispatch = vi.fn();
    const cancel = startJourneyAttempt(() => new Promise(() => {}), dispatch);

    cancel();
    vi.advanceTimersByTime(LOAD_DEADLINE_MS * 2);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("never dispatches a result that lands after cancellation", async () => {
    const dispatch = vi.fn();
    let resolveLoad: (value: Result<DestinationData>) => void = () => {};
    const load = () =>
      new Promise<Result<DestinationData>>((resolve) => {
        resolveLoad = resolve;
      });
    const cancel = startJourneyAttempt(load, dispatch);

    cancel();
    resolveLoad({ ok: true, value: data });
    await vi.advanceTimersByTimeAsync(0);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("dispatches loaded when the loader resolves in time", async () => {
    const dispatch = vi.fn();
    const cancel = startJourneyAttempt(
      () => Promise.resolve({ ok: true, value: data }),
      dispatch,
    );

    await vi.advanceTimersByTimeAsync(0);
    expect(dispatch).toHaveBeenCalledWith({ type: "loaded", data });
    cancel();
  });

  it("dispatches failed with the loader's message", async () => {
    const dispatch = vi.fn();
    const cancel = startJourneyAttempt(
      () => Promise.resolve({ ok: false, error: new Error("boom") }),
      dispatch,
    );

    await vi.advanceTimersByTimeAsync(0);
    expect(dispatch).toHaveBeenCalledWith({ type: "failed", message: "boom" });
    cancel();
  });

  it("dispatches failed when the load rejects (no unhandled rejection)", async () => {
    const dispatch = vi.fn();
    const cancel = startJourneyAttempt(
      () => Promise.reject(new Error("offline")),
      dispatch,
    );

    await vi.advanceTimersByTimeAsync(0);
    expect(dispatch).toHaveBeenCalledWith({
      type: "failed",
      message: "offline",
    });
    cancel();
  });

  it("turns a synchronous loader throw into a failed dispatch", async () => {
    const dispatch = vi.fn();
    const cancel = startJourneyAttempt(() => {
      throw new Error("sync boom");
    }, dispatch);

    await vi.advanceTimersByTimeAsync(0);
    expect(dispatch).toHaveBeenCalledWith({
      type: "failed",
      message: "sync boom",
    });
    cancel();
  });

  it("clears the deadline once the attempt settles (no late timeout)", async () => {
    const dispatch = vi.fn();
    const cancel = startJourneyAttempt(
      () => Promise.resolve({ ok: true, value: data }),
      dispatch,
    );

    await vi.advanceTimersByTimeAsync(0);
    vi.advanceTimersByTime(LOAD_DEADLINE_MS * 2);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "loaded", data });
    cancel();
  });

  it("runs the loader again for a new attempt (retry wiring)", async () => {
    const load = vi.fn(() => Promise.resolve(okResult));
    const cancelOne = startJourneyAttempt(load, vi.fn());
    cancelOne();

    const cancelTwo = startJourneyAttempt(load, vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(load).toHaveBeenCalledTimes(2);
    cancelTwo();
  });
});
