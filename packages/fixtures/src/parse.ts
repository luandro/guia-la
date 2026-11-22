import { z } from "zod";

import {
  categorySchema,
  destinationSchema,
  placeSchema,
  type Category,
  type DestinationData,
  type Destination,
  type Place,
  type Result,
} from "@guia-la/core";

/**
 * Validate one destination's three raw fixture files together and return a
 * Result. This is the only place fixture JSON is interpreted; malformed data
 * produces `{ ok: false, error: { message } }` and never throws into UI code.
 */
export function parseDestinationDataset(dataset: {
  destination: unknown;
  categories: unknown;
  places: unknown;
}): Result<DestinationData> {
  let destination: Destination;
  try {
    destination = destinationSchema.parse(dataset.destination);
  } catch (error) {
    const rawId = (dataset.destination as { id?: unknown } | null)?.id;
    const name =
      typeof rawId === "string" && rawId.length > 0 ? rawId : "unknown";
    return {
      ok: false,
      error: {
        message: `destination file invalid (id=${name}): ${zodMessage(error)}`,
      },
    };
  }

  let categories: Category[];
  try {
    categories = z.array(categorySchema).parse(dataset.categories);
  } catch (error) {
    return {
      ok: false,
      error: { message: `categories file invalid: ${zodMessage(error)}` },
    };
  }

  let places: Place[];
  try {
    places = z.array(placeSchema).parse(dataset.places);
  } catch (error) {
    return {
      ok: false,
      error: { message: `places file invalid: ${zodMessage(error)}` },
    };
  }

  const categoryIds = new Set(categories.map((category) => category.id));
  const slugs = new Set<string>();

  for (const place of places) {
    if (!categoryIds.has(place.category)) {
      return {
        ok: false,
        error: {
          message: `place ${place.id} references category "${place.category}" missing from categories.json`,
        },
      };
    }
    if (slugs.has(place.slug)) {
      return {
        ok: false,
        error: {
          message: `duplicate slug "${place.slug}" in destination ${destination.id}`,
        },
      };
    }
    slugs.add(place.slug);
    if (!place.content[destination.defaultLocale]) {
      return {
        ok: false,
        error: {
          message: `place ${place.id} has no content for the default locale ${destination.defaultLocale} (fixture contract requires it)`,
        },
      };
    }
  }

  return { ok: true, value: { destination, categories, places } };
}

function zodMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
  }
  return String(error);
}
