import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * app.config.ts throws at load when APP_ENV or APP_VARIANT is unset
 * (requireVar). Every package script that runs expo loads that config, so a
 * script without inline defaults fails before doing any work — the exact
 * regression PR #14 review round B found on start/web/android/ios/lint.
 * This pins the contract: an expo-invoking script must set both variables.
 */
describe("apps/app package scripts (config-load guard)", () => {
  it("every script that runs expo sets APP_ENV and APP_VARIANT inline", () => {
    const appDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
    const pkg = JSON.parse(
      readFileSync(join(appDir, "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };

    const offenders = Object.entries(pkg.scripts ?? {})
      .filter(([, command]) => /\bexpo\b/.test(command))
      .filter(
        ([, command]) =>
          !/APP_ENV=\S+/.test(command) || !/APP_VARIANT=\S+/.test(command),
      )
      .map(([name]) => name);

    expect(offenders).toEqual([]);
  });
});
