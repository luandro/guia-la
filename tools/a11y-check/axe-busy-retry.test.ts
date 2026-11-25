import { describe, expect, it } from "vitest";

import { isAxeBusyError, withAxeBusyRetry } from "./axe-busy-retry.mjs";

const busy = () =>
  new Error(
    "frame.evaluate: Error: Axe is already running. Use `await axe.run()` to wait for the previous run to finish before starting a new run.",
  );

describe("isAxeBusyError", () => {
  it("recognises axe's concurrent-run error", () => {
    expect(isAxeBusyError(busy())).toBe(true);
  });
  it("does not treat other errors as busy", () => {
    expect(isAxeBusyError(new Error("Target closed"))).toBe(false);
    expect(isAxeBusyError("Axe is already running")).toBe(false);
  });
});

describe("withAxeBusyRetry", () => {
  it("retries while the Storybook addon's axe run is in progress", async () => {
    let calls = 0;
    const result = await withAxeBusyRetry(
      async () => {
        calls += 1;
        if (calls < 3) throw busy();
        return "scanned";
      },
      { attempts: 5, delayMs: 0 },
    );
    expect(result).toBe("scanned");
    expect(calls).toBe(3);
  });
  it("rethrows a non-busy error at once", async () => {
    let calls = 0;
    await expect(
      withAxeBusyRetry(
        async () => {
          calls += 1;
          throw new Error("Target closed");
        },
        { attempts: 5, delayMs: 0 },
      ),
    ).rejects.toThrow("Target closed");
    expect(calls).toBe(1);
  });
  it("gives up after the attempt budget and rethrows the busy error", async () => {
    let calls = 0;
    await expect(
      withAxeBusyRetry(
        async () => {
          calls += 1;
          throw busy();
        },
        { attempts: 4, delayMs: 0 },
      ),
    ).rejects.toThrow("Axe is already running");
    expect(calls).toBe(4);
  });
});
