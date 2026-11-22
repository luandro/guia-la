import { z } from "zod";

/**
 * App environment contract (task 02-7): both variables are required at
 * config time; a missing or invalid one fails the build immediately with a
 * message naming the variable — never a runtime surprise later.
 *
 * Pure module on purpose: imported by app.config.ts (config time, Node) and
 * by app code (runtime) alike. No Expo imports.
 */

export const appEnvSchema = z.enum([
  "development",
  "preview",
  "staging",
  "production",
]);

export type AppEnv = z.infer<typeof appEnvSchema>;

export const appVariantSchema = z.enum([
  "flagship",
  "cotijuba-web",
  "serra-web",
]);

export type AppVariant = z.infer<typeof appVariantSchema>;

export type DestinationId = "cotijuba" | "serra";

/** APP_VARIANT selects the destination fixture set a build serves. */
export function destinationForVariant(variant: AppVariant): DestinationId {
  switch (variant) {
    case "serra-web":
      return "serra";
    case "flagship":
    case "cotijuba-web":
      return "cotijuba";
  }
}

/**
 * Validate process.env at config time. Throws naming the missing/invalid
 * variable — this is the fail-fast guard task 02-7 requires.
 */
export function parseAppEnv(processEnv: Record<string, string | undefined>): {
  appEnv: AppEnv;
  appVariant: AppVariant;
} {
  const appEnv = requireVar("APP_ENV", appEnvSchema, "development", processEnv);
  const appVariant = requireVar(
    "APP_VARIANT",
    appVariantSchema,
    "cotijuba-web",
    processEnv,
  );
  return { appEnv, appVariant };
}

function requireVar<V extends z.ZodType, T extends z.infer<V>>(
  name: string,
  schema: V,
  example: string,
  processEnv: Record<string, string | undefined>,
): T {
  const value = processEnv[name];
  if (value === undefined || value === "") {
    throw new Error(
      `Missing required environment variable ${name}. Build scripts set it explicitly; e.g. ${name}=${example}`,
    );
  }
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const options =
      schema instanceof z.ZodEnum
        ? [...schema.options].join(", ")
        : "a valid value";
    throw new Error(
      `Environment variable ${name} is invalid: got ${JSON.stringify(value)}, expected one of: ${options}`,
    );
  }
  return parsed.data as T;
}

/** The shape app.config.ts publishes through expo.extra. */
export const appExtraSchema = z.object({
  appEnv: appEnvSchema,
  appVariant: appVariantSchema,
  destinationId: z.enum(["cotijuba", "serra"]),
});

export type AppExtra = z.infer<typeof appExtraSchema>;

/** Runtime validation of Constants.expoConfig.extra; names what is missing. */
export function validateAppExtra(extra: unknown): AppExtra {
  if (extra === undefined || extra === null) {
    throw new Error(
      "app config extra is missing: this build ran without APP_ENV/APP_VARIANT (see src/config/env.ts)",
    );
  }
  const parsed = appExtraSchema.safeParse(extra);
  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(`invalid app config extra (fields: ${fields})`);
  }
  return parsed.data;
}
