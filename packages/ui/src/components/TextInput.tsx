import { useId, useState, type ComponentProps } from "react";
import { Platform, TextInput as RNTextInput, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import {
  fieldA11yProps,
  fieldBorderColor,
  fieldHasError,
  fieldHelperColor,
  fieldHelperId,
  fieldHelperText,
  fieldInputColors,
} from "./fieldStyles";
import { MIN_HIT_TARGET } from "./hitSlop";
import { Text } from "./Text";

/**
 * TextInput with field scaffolding (phase 03, task 6): label, hint and
 * error text around a token-styled input. Border reacts to focus and
 * error through fieldStyles (error wins); the error message replaces the
 * hint when present, and a cleared error (""), restores the hint (PR #19
 * review). The helper text and invalid state are exposed to assistive
 * tech: on web via aria-invalid/aria-describedby pointing at the helper
 * Text's id; on native via accessibilityHint (PR #19 review). The id and
 * the announced hint exist only when the helper text actually renders —
 * an empty helper ("" hint, no error) must leave aria-describedby unset
 * rather than pointing at nothing (PR #19 review round 2). All strings
 * arrive translated from the caller (D-14) — packages/ui never imports an
 * i18n layer.
 */
export type TextInputProps = ComponentProps<typeof RNTextInput> & {
  /** Field label, rendered above the input. */
  label?: string;
  /** Static helper text below the input. */
  hint?: string;
  /** Validation message; replaces the hint and recolors the border. */
  error?: string;
};

export function TextInput({
  label,
  hint,
  error,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextInputProps) {
  const { tokens } = useTheme();
  const [focused, setFocused] = useState(false);
  const hasError = fieldHasError(error);
  const input = fieldInputColors(tokens.colors);
  const helper = fieldHelperText(error, hint);
  // Stable per-instance id for the helper text so aria-describedby can
  // point at it — but only when the helper renders (non-empty, the same
  // truthiness as the render below), so the id never names an unrendered
  // element. The useId hook itself runs unconditionally — helper coming
  // and going must not change the hook order.
  const reactId = useId();
  const helperId = fieldHelperId(helper, reactId);

  return (
    <View style={{ gap: tokens.spacing.xs }}>
      {label ? <Text variant="label">{label}</Text> : null}
      <RNTextInput
        {...rest}
        accessibilityLabel={rest.accessibilityLabel ?? label}
        // Native: the helper (hint or error) rides along as the hint so
        // screen readers announce it with the field — again only when
        // non-empty, matching the rendered helper (an empty accessibility
        // hint announces nothing useful).
        accessibilityHint={rest.accessibilityHint ?? (helper || undefined)}
        {...(Platform.OS === "web" ? fieldA11yProps(hasError, helperId) : {})}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        placeholderTextColor={input.placeholderColor}
        style={[
          {
            backgroundColor: input.backgroundColor,
            borderColor: fieldBorderColor(tokens.colors, {
              focused,
              error: hasError,
            }),
            borderRadius: tokens.radius.md,
            borderWidth: 1,
            color: input.textColor,
            minHeight: MIN_HIT_TARGET,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
          },
          style,
        ]}
      />
      {helper ? (
        <Text
          nativeID={helperId}
          variant="caption"
          style={{ color: fieldHelperColor(tokens.colors, hasError) }}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
