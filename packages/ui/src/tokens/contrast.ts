/**
 * WCAG 2.x contrast math for the token layer (phase 03, task 3).
 *
 * Pure functions on hex strings so the accessibility floor is enforceable
 * in unit tests for every preset and mode — values, not vibes.
 */

/** WCAG AA minimum for normal-size text. */
export const WCAG_AA_TEXT = 4.5;

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Parse `#RGB` or `#RRGGBB` into sRGB channels 0–1. Throws naming the
 * offending value: token data is validated at authoring time, never
 * silently defaulted.
 */
export function parseHexColor(value: string): [number, number, number] {
  if (!HEX_PATTERN.test(value)) {
    throw new Error(
      `not a #RGB or #RRGGBB hex color: ${JSON.stringify(value)}`,
    );
  }
  const digits = value.slice(1);
  const hex =
    digits.length === 3
      ? digits
          .split("")
          .map((d) => d + d)
          .join("")
      : digits;
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

/** WCAG relative luminance of a hex color. */
export function relativeLuminance(value: string): number {
  const [r, g, b] = parseHexColor(value);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function channelLuminance(channel: number): number {
  return channel <= 0.03928
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** WCAG contrast ratio (1–21); order of the two colors is irrelevant. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
