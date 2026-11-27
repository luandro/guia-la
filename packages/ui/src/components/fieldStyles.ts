import type { ColorSet } from "../tokens/types";

/**
 * Field state mapping (phase 03, task 6): TextInput's border and helper
 * text colors as pure functions of the interaction state. Error always
 * dominates focus — an invalid field must not look merely focused.
 */

/** Interaction state a field's border reacts to. */
export type FieldState = {
  focused: boolean;
  error: boolean;
};

/** Border color: error → danger, focused → focus, idle → border. */
export function fieldBorderColor(colors: ColorSet, state: FieldState): string {
  if (state.error) return colors.danger;
  if (state.focused) return colors.focus;
  return colors.border;
}

/** Helper text color: the error message replaces the hint when present. */
export function fieldHelperColor(colors: ColorSet, hasError: boolean): string {
  return hasError ? colors.danger : colors.textMuted;
}

/** Error predicate: undefined and "" are "no error" (a cleared message). */
export function fieldHasError(error: string | undefined): boolean {
  return error !== undefined && error !== "";
}

/**
 * Helper line shown under the field. Uses fieldHasError's predicate, not
 * `error ?? hint`: a caller that clears its validation message with
 * `error=""` (common after re-validation) must get the hint back, not an
 * empty string that renders nothing (PR #19 review).
 */
export function fieldHelperText(
  error: string | undefined,
  hint: string | undefined,
): string | undefined {
  return fieldHasError(error) ? error : hint;
}

/**
 * Element id for the helper text (PR #19 review round 2): set only when
 * the helper actually renders — non-empty, the same truthiness TextInput
 * uses to render the Text — so aria-describedby never points at an
 * element that is not there. useId's ":r1:" colons are stripped (safe in
 * an HTML id, ugly in selectors and native logs).
 */
export function fieldHelperId(
  helper: string | undefined,
  rawId: string,
): string | undefined {
  return helper ? `field-${rawId.replace(/:/g, "")}` : undefined;
}

/**
 * The helper region stays mounted even when there is no helper text (PR #19
 * deferred finding 03-78a): a live region must exist *before* the message
 * is inserted or the insertion is not announced (W3C ARIA22, same rule
 * OfflineBanner follows). A field with no hint and no error therefore
 * renders an empty helper Text carrying accessibilityLiveRegion="polite",
 * so the first validation error is announced on Android — previously the
 * region mounted together with its error and TalkBack read nothing.
 */
export function fieldHelperLiveRegion(): {
  accessibilityLiveRegion: "polite";
} {
  return { accessibilityLiveRegion: "polite" };
}

/**
 * Web a11y wiring for the input (PR #19 review): the invalid state and the
 * helper text must reach assistive tech, not just draw in color. RN's types
 * carry no aria-invalid/aria-describedby yet (0.88); RNW 0.21 forwards both,
 * so TextInput spreads this object instead of writing the props as JSX
 * (spreads are exempt from excess-property checking).
 */
export function fieldA11yProps(
  hasError: boolean,
  helperId: string | undefined,
): { "aria-invalid": boolean; "aria-describedby"?: string } {
  return {
    "aria-invalid": hasError,
    ...(helperId !== undefined ? { "aria-describedby": helperId } : {}),
  };
}

/** Input box colors (AA-pinned in fieldStyles.test.ts). */
export function fieldInputColors(colors: ColorSet): {
  textColor: string;
  placeholderColor: string;
  backgroundColor: string;
} {
  return {
    textColor: colors.text,
    placeholderColor: colors.textMuted,
    backgroundColor: colors.surface,
  };
}
