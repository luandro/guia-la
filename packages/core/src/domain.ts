import { z } from "zod";

import { isSlug } from "./slug";

/**
 * Domain types and zod schemas for the Places journey (D-14/D-15).
 *
 * The schemas are the single authority for the fixture contract
 * (packages/fixtures/<dest>/*.json). The loader in @guia-la/fixtures parses
 * every JSON file with them; nothing else reads fixtures directly.
 */

/** The six UI locales every catalog and route must cover (D-14). */
export const UI_LOCALES = ["en", "pt-BR", "es", "fr", "nl", "de"] as const;

export type Locale = (typeof UI_LOCALES)[number];

export const localeSchema = z.enum(UI_LOCALES);

/** A minimal Result: malformed fixture data returns a value, never throws. */
export type Result<T> =
  { ok: true; value: T } | { ok: false; error: { message: string } };

export const destinationSchema = z.object({
  id: z.enum(["cotijuba", "serra"]),
  name: z.string().min(1),
  defaultLocale: localeSchema,
  locales: z.array(localeSchema).min(1),
  source: z.literal("synthetic"),
});

export type Destination = z.infer<typeof destinationSchema>;

export const CATEGORY_IDS = [
  "beach",
  "restaurant",
  "stay",
  "waterfall",
  "trail",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

/** Category labels exist in all six locales (fixture contract). */
export const categorySchema = z.object({
  id: z.enum(CATEGORY_IDS),
  label: z.object({
    en: z.string().min(1),
    "pt-BR": z.string().min(1),
    es: z.string().min(1),
    fr: z.string().min(1),
    nl: z.string().min(1),
    de: z.string().min(1),
  }),
});

export type Category = z.infer<typeof categorySchema>;

export const contentEntrySchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  machineTranslated: z.boolean(),
});

export type ContentEntry = z.infer<typeof contentEntrySchema>;

/** Per-place localized content; the default locale entry is always present. */
export const placeSchema = z.object({
  id: z.string().regex(/^fx-[a-z]+-\d{3}$/, "fixture id fx-<dest>-NNN"),
  slug: z.string().refine(isSlug, "kebab-case ascii slug"),
  category: z.enum(CATEGORY_IDS),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  source: z.literal("synthetic"),
  // Regex shape plus a calendar round-trip: "2026-02-31" matches the regex
  // but is not a real date, and the detail page renders new Date(y, m-1, d),
  // which rolls it forward silently. UTC so the round-trip cannot drift by
  // a timezone offset.
  verifiedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .refine(isCalendarDate, "real calendar date"),
  // zod 4 note: z.record with an enum key requires every key; locales are
  // optional per place (fixture contract), so this is a partial record.
  content: z
    .partialRecord(localeSchema, contentEntrySchema)
    .refine(
      (content) => Object.keys(content).length > 0,
      "at least one locale entry",
    ),
});

export type Place = z.infer<typeof placeSchema>;

/** "2026-02-31" is regex-shaped but not a real date: round-trip it. */
function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** A fully loaded destination: the three fixture files, validated together. */
export interface DestinationData {
  destination: Destination;
  categories: Category[];
  places: Place[];
}
