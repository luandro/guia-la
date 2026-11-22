import type { DestinationData, Result } from "@guia-la/core";

import cotijubaCategories from "../cotijuba/categories.json";
import cotijubaDestination from "../cotijuba/destination.json";
import cotijubaPlaces from "../cotijuba/places.json";
import serraCategories from "../serra/categories.json";
import serraDestination from "../serra/destination.json";
import serraPlaces from "../serra/places.json";

import { parseDestinationDataset } from "./parse";

/**
 * Static imports (Metro-safe: no fs) of the two synthetic fixture sets.
 * Static JSON imports also survive the static web export, where data loaders
 * run at build time.
 */
const DATASETS: Record<
  string,
  { destination: unknown; categories: unknown; places: unknown }
> = {
  cotijuba: {
    destination: cotijubaDestination,
    categories: cotijubaCategories,
    places: cotijubaPlaces,
  },
  serra: {
    destination: serraDestination,
    categories: serraCategories,
    places: serraPlaces,
  },
};

export type DestinationId = "cotijuba" | "serra";

/**
 * Load and validate one destination's fixture set. Always returns a Result —
 * malformed data never throws into UI code.
 */
export function loadDestination(id: string): Result<DestinationData> {
  const dataset = DATASETS[id];
  if (!dataset) {
    return {
      ok: false,
      error: {
        message: `unknown destination "${id}" (available: ${Object.keys(DATASETS).join(", ")})`,
      },
    };
  }
  return parseDestinationDataset(dataset);
}
