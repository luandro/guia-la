import { useState, type ComponentProps } from "react";
import { TextInput as RNTextInput, View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import {
  fieldBorderColor,
  fieldHelperColor,
  fieldInputColors,
} from "./fieldStyles";
import { MIN_HIT_TARGET } from "./hitSlop";
import { Text } from "./Text";

/**
 * TextInput with field scaffolding (phase 03, task 6): label, hint and
 * error text around a token-styled input. Border reacts to focus and
 * error through fieldStyles (error wins); the error message replaces the
 * hint when present. All strings arrive translated from the caller
 * (D-14) — packages/ui never imports an i18n layer.
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
  const hasError = error !== undefined && error !== "";
  const input = fieldInputColors(tokens.colors);
  const helper = error ?? hint;

  return (
    <View style={{ gap: tokens.spacing.xs }}>
      {label ? <Text variant="label">{label}</Text> : null}
      <RNTextInput
        {...rest}
        accessibilityLabel={rest.accessibilityLabel ?? label}
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
          variant="caption"
          style={{ color: fieldHelperColor(tokens.colors, hasError) }}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
