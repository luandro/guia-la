// Relative imports are extensionless: Metro (app bundler) does not apply
// the TypeScript .js -> .ts mapping, while vite/vitest and tsc resolve
// extensionless sources fine.
export { isSlug } from "./slug";
export {
  CATEGORY_IDS,
  UI_LOCALES,
  categorySchema,
  contentEntrySchema,
  destinationSchema,
  localeSchema,
  placeSchema,
} from "./domain";
export type {
  Category,
  CategoryId,
  ContentEntry,
  Destination,
  DestinationData,
  Locale,
  Place,
  Result,
} from "./domain";
export { resolveContent } from "./content";
export type { ResolvedContent } from "./content";
