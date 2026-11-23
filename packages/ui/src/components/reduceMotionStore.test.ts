import { describe, expect, it, vi } from "vitest";

import { createReduceMotionStore } from "./reduceMotionStore";

/**
 * Reduce-motion store (PR #19 review): one query shared across every
 * Skeleton instance, a "hold" state until the query resolves (no pulse for
 * users who asked for reduced motion), and live updates from
 * reduceMotionChanged. Pure dependency-injected logic — the React Native
 * AccessibilityInfo surface is injected, so the store is testable in node.
 */

type Deferred = {
  resolve: (enabled: boolean) => void;
  reject: (reason?: unknown) => void;
  promise: Promise<boolean>;
};

function deferred(): Deferred {
  let resolve!: (enabled: boolean) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<boolean>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { resolve, reject, promise };
}

function flushMicrotasks(): Promise<void> {
  // Two ticks: one for the store's .then, one for listener notification.
  return Promise.resolve().then(() => Promise.resolve());
}

describe("createReduceMotionStore", () => {
  it("starts unknown (known=false): callers must hold the animation, not pulse", () => {
    const query = deferred();
    const store = createReduceMotionStore({
      isReduceMotionEnabled: () => query.promise,
    });
    store.subscribe(() => {});
    expect(store.getSnapshot()).toEqual({ known: false, enabled: false });
  });

  it("resolving false releases the pulse (known, motion allowed)", async () => {
    const query = deferred();
    const store = createReduceMotionStore({
      isReduceMotionEnabled: () => query.promise,
    });
    const listener = vi.fn();
    store.subscribe(listener);
    query.resolve(false);
    await flushMicrotasks();
    expect(store.getSnapshot()).toEqual({ known: true, enabled: false });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("resolving true keeps the block static (reduce motion on)", async () => {
    const query = deferred();
    const store = createReduceMotionStore({
      isReduceMotionEnabled: () => query.promise,
    });
    store.subscribe(() => {});
    query.resolve(true);
    await flushMicrotasks();
    expect(store.getSnapshot()).toEqual({ known: true, enabled: true });
  });

  it("shares one query across every subscriber", async () => {
    const query = deferred();
    const isReduceMotionEnabled = vi.fn(() => query.promise);
    const store = createReduceMotionStore({ isReduceMotionEnabled });
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = store.subscribe(first);
    store.subscribe(second);
    expect(isReduceMotionEnabled).toHaveBeenCalledTimes(1);

    query.resolve(true);
    await flushMicrotasks();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    // A late subscriber joins the resolved state without re-querying.
    const late = vi.fn();
    store.subscribe(late);
    expect(isReduceMotionEnabled).toHaveBeenCalledTimes(1);
    expect(late).not.toHaveBeenCalled(); // No change since it joined.
    unsubscribeFirst();
  });

  it("reduceMotionChanged updates the state live (toggle while mounted)", async () => {
    const query = deferred();
    let changeHandler: ((enabled: boolean) => void) | undefined;
    const store = createReduceMotionStore({
      isReduceMotionEnabled: () => query.promise,
      addEventListener: (_event, handler) => {
        changeHandler = handler;
        return { remove: () => {} };
      },
    });
    const listener = vi.fn();
    store.subscribe(listener);
    query.resolve(false);
    await flushMicrotasks();
    expect(listener).toHaveBeenCalledTimes(1);

    changeHandler?.(true);
    expect(store.getSnapshot()).toEqual({ known: true, enabled: true });
    expect(listener).toHaveBeenCalledTimes(2);

    changeHandler?.(false);
    expect(store.getSnapshot()).toEqual({ known: true, enabled: false });
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("a change event seen first wins over the initial query result (PR #19 review round 2)", async () => {
    // The query and the subscription start together; if the user toggles
    // reduce-motion while the query promise is still in flight, the stale
    // query value (read before the toggle) must not overwrite the change.
    const query = deferred();
    let changeHandler: ((enabled: boolean) => void) | undefined;
    const store = createReduceMotionStore({
      isReduceMotionEnabled: () => query.promise,
      addEventListener: (_event, handler) => {
        changeHandler = handler;
        return { remove: () => {} };
      },
    });
    const listener = vi.fn();
    store.subscribe(listener);

    changeHandler?.(true); // Toggled ON before the query settles.
    expect(store.getSnapshot()).toEqual({ known: true, enabled: true });

    query.resolve(false); // The stale read lands late — it must lose.
    await flushMicrotasks();
    expect(store.getSnapshot()).toEqual({ known: true, enabled: true });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("a rejected query degrades to animating (best-effort, motion is the default)", async () => {
    const query = deferred();
    const store = createReduceMotionStore({
      isReduceMotionEnabled: () => query.promise,
    });
    store.subscribe(() => {});
    query.reject(new Error("unavailable"));
    await flushMicrotasks();
    expect(store.getSnapshot()).toEqual({ known: true, enabled: false });
  });

  it("a missing query API resolves to animating instead of holding forever", async () => {
    const store = createReduceMotionStore({});
    store.subscribe(() => {});
    await flushMicrotasks();
    expect(store.getSnapshot()).toEqual({ known: true, enabled: false });
  });

  it("unsubscribed listeners stop receiving updates", async () => {
    const query = deferred();
    let changeHandler: ((enabled: boolean) => void) | undefined;
    const store = createReduceMotionStore({
      isReduceMotionEnabled: () => query.promise,
      addEventListener: (_event, handler) => {
        changeHandler = handler;
        return { remove: () => {} };
      },
    });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    query.resolve(false);
    await flushMicrotasks();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    changeHandler?.(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual({ known: true, enabled: true });
  });

  it("does not notify when a change repeats the current state", async () => {
    const query = deferred();
    let changeHandler: ((enabled: boolean) => void) | undefined;
    const store = createReduceMotionStore({
      isReduceMotionEnabled: () => query.promise,
      addEventListener: (_event, handler) => {
        changeHandler = handler;
        return { remove: () => {} };
      },
    });
    const listener = vi.fn();
    store.subscribe(listener);
    query.resolve(true);
    await flushMicrotasks();
    expect(listener).toHaveBeenCalledTimes(1);

    changeHandler?.(true); // Same value: no notification.
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
