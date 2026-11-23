import { useState } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { chipToneColors, type ChipTone } from "./chipStyles";
import { hitSlop } from "./hitSlop";
import { Text } from "./Text";

/**
 * Chip primitive (phase 03, task 5): a compact status label ("Badge" in
 * the task list) whose tone is a color role resolved by chipToneColors.
 * Without onPress it is a static label; with onPress it becomes a
 * pressable grown to the 44pt target through measured hitSlop. Text
 * arrives translated from the caller — nothing user-facing lives here.
 */
export type ChipProps = {
  label: string;
  /** Meaning tone; neutral is the quiet default. */
  tone?: ChipTone;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export function Chip({
  label,
  tone = "neutral",
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ChipProps) {
  const { tokens } = useTheme();
  const toneColors = chipToneColors(tokens.colors, tone);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  const onLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const base = {
    alignSelf: "flex-start" as const,
    backgroundColor: toneColors.background,
    borderColor: toneColors.borderColor,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  };
  const text = (
    <Text variant="caption" style={{ color: toneColors.foreground }}>
      {label}
    </Text>
  );

  if (!onPress) {
    return (
      <View style={base} testID={testID} onLayout={onLayout}>
        {text}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      testID={testID}
      onLayout={onLayout}
      hitSlop={size ? hitSlop(size.width, size.height) : undefined}
      style={({ pressed }) => [base, pressed ? { opacity: 0.8 } : null]}
    >
      {text}
    </Pressable>
  );
}
