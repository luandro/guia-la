/**
 * Kebab-case ASCII slug: what every fixture place slug must look like
 * (fixture contract: "slug": "kebab-case-ascii").
 *
 * Rules: non-empty; only [a-z0-9-]; single hyphens as separators; starts and
 * ends with an alphanumeric.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
