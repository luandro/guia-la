import { execFileSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { describe, expect, it, vi } from "vitest";

import {
  appEnvSchema,
  appVariantSchema,
  destinationForVariant,
} from "./env.js";

/**
 * app.config.ts must stay equivalent to src/config/env.ts even though the
 * Expo config loader (Node, single-file transpile) cannot import the TS
 * module — these tests import app.config.ts directly and pin the contract.
 */

async function loadConfig() {
  vi.resetModules();
  const mod = await import("../../app.config");
  return mod.default;
}

describe("app.config.ts", () => {
  it("publishes validated extra for every variant and pins static web output", async () => {
    for (const appEnv of appEnvSchema.options) {
      for (const appVariant of appVariantSchema.options) {
        process.env.APP_ENV = appEnv;
        process.env.APP_VARIANT = appVariant;
        const config = await loadConfig();
        expect(config.extra).toEqual({
          appEnv,
          appVariant,
          destinationId: destinationForVariant(appVariant),
        });
        expect(config.web?.output).toBe("static");
        expect(config.name).toBe("guia.la");
        expect(config.slug).toBe("guia-la");
        // D-01: la.guia.app is permanent after the first store release, so
        // only production may ship it (PR #14 review round C); every other
        // env gets a suffixed id that can never collide with the store id.
        const expectedAppId =
          appEnv === "production" ? "la.guia.app" : `la.guia.app.${appEnv}`;
        expect(config.ios?.bundleIdentifier).toBe(expectedAppId);
        expect(config.android?.package).toBe(expectedAppId);
      }
    }
    delete process.env.APP_ENV;
    delete process.env.APP_VARIANT;
  });

  it("does not register the expo-localization config plugin", async () => {
    process.env.APP_ENV = "development";
    process.env.APP_VARIANT = "cotijuba-web";
    const config = await loadConfig();
    // Nothing imports expo-localization, and reading device locales at
    // runtime works without the config plugin (it only pins native
    // localization metadata). Re-add it only when code needs that metadata.
    expect(config.plugins ?? []).not.toContain("expo-localization");
    delete process.env.APP_ENV;
    delete process.env.APP_VARIANT;
  });

  it("throws naming APP_VARIANT when it is unset", async () => {
    process.env.APP_ENV = "development";
    delete process.env.APP_VARIANT;
    await expect(loadConfig()).rejects.toThrow(/APP_VARIANT/);
  });

  it("throws naming APP_ENV when it is unset", async () => {
    delete process.env.APP_ENV;
    process.env.APP_VARIANT = "flagship";
    await expect(loadConfig()).rejects.toThrow(/APP_ENV/);
  });

  it("rejects an invalid APP_ENV value naming the variable", async () => {
    process.env.APP_ENV = "prod";
    process.env.APP_VARIANT = "flagship";
    await expect(loadConfig()).rejects.toThrow(/APP_ENV/);
  });

  // The Expo config loader runs app.config.ts in Node and transpiles only
  // that one file — nested extensionless .ts imports do not resolve there.
  // This test runs the real command so a config that only works under
  // Vite cannot pass the suite.
  it(
    "loads through the real Expo config loader (node)",
    { timeout: 90_000 },
    () => {
      const appDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
      const output = execFileSync(
        join(appDir, "node_modules", ".bin", "expo"),
        ["config", "--type", "public", "--json"],
        {
          cwd: appDir,
          encoding: "utf8",
          env: {
            ...process.env,
            APP_ENV: "development",
            APP_VARIANT: "cotijuba-web",
            // Keep the loader from picking up interactive/environment cruft.
            CI: "1",
          },
        },
      );
      const config = JSON.parse(output) as {
        web?: { output?: string };
        extra?: { destinationId?: string };
      };
      expect(config.web?.output).toBe("static");
      expect(config.extra?.destinationId).toBe("cotijuba");
    },
  );
});
