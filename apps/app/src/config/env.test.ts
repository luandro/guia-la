import { describe, expect, it } from "vitest";

import { destinationForVariant, parseAppEnv, validateAppExtra } from "./env.js";

describe("parseAppEnv", () => {
  it("accepts valid APP_ENV and APP_VARIANT", () => {
    expect(
      parseAppEnv({ APP_ENV: "development", APP_VARIANT: "cotijuba-web" }),
    ).toEqual({ appEnv: "development", appVariant: "cotijuba-web" });
  });

  it("names APP_ENV when it is missing", () => {
    expect(() => parseAppEnv({ APP_VARIANT: "flagship" })).toThrow(/APP_ENV/);
  });

  it("names APP_VARIANT when it is missing", () => {
    expect(() => parseAppEnv({ APP_ENV: "production" })).toThrow(/APP_VARIANT/);
  });

  it("names the variable when a value is outside the enum", () => {
    expect(() =>
      parseAppEnv({ APP_ENV: "prod", APP_VARIANT: "flagship" }),
    ).toThrow(/APP_ENV/);
    expect(() =>
      parseAppEnv({ APP_ENV: "development", APP_VARIANT: "cotijuba" }),
    ).toThrow(/APP_VARIANT/);
  });
});

describe("destinationForVariant", () => {
  it("maps cotijuba-web -> cotijuba", () => {
    expect(destinationForVariant("cotijuba-web")).toBe("cotijuba");
  });

  it("maps serra-web -> serra", () => {
    expect(destinationForVariant("serra-web")).toBe("serra");
  });

  it("maps flagship -> cotijuba (pilot destination)", () => {
    expect(destinationForVariant("flagship")).toBe("cotijuba");
  });
});

describe("validateAppExtra (runtime config from expo.extra)", () => {
  it("accepts the shape app.config.ts publishes", () => {
    expect(
      validateAppExtra({
        appEnv: "development",
        appVariant: "cotijuba-web",
        destinationId: "cotijuba",
      }),
    ).toEqual({
      appEnv: "development",
      appVariant: "cotijuba-web",
      destinationId: "cotijuba",
    });
  });

  it("names extra when the app config did not run (missing destinationId)", () => {
    expect(() => validateAppExtra(undefined)).toThrow(/app config/i);
    expect(() =>
      validateAppExtra({ appEnv: "development", appVariant: "flagship" }),
    ).toThrow(/destinationId/);
  });
});
