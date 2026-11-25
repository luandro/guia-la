/**
 * Storybook's a11y addon (@storybook/addon-a11y) runs axe on every story
 * render inside the same iframe the gate scans. axe allows one run at a
 * time per frame, so the gate's own AxeBuilder.analyze() can collide with
 * the addon's run and throw "Axe is already running". The old fixed 350 ms
 * sleep hid the race; the render-detection wait (PR #20 review) removed it
 * and the collision surfaced. Retrying only on that exact error keeps the
 * gate deterministic without a blind sleep; any other error fails at once.
 */

const AXE_BUSY = "Axe is already running";

/** True for axe's concurrent-run error (an Error whose message names it). */
export function isAxeBusyError(error) {
  return error instanceof Error && error.message.includes(AXE_BUSY);
}

/**
 * Calls `fn` until it resolves, retrying only while axe reports busy, at
 * most `attempts` calls with `delayMs` between them. The last busy error
 * is rethrown when the budget runs out.
 */
export async function withAxeBusyRetry(
  fn,
  { attempts = 20, delayMs = 250 } = {},
) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (!isAxeBusyError(error) || attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
