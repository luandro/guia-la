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
