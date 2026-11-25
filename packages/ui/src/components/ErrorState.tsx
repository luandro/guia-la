import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Button } from "./Button";
import { Heading } from "./Heading";
import { Text } from "./Text";

/**
 * ErrorState primitive (phase 03, task 6): something failed — names what
 * failed and offers a retry that visibly fires (the retry button only
 * renders when onRetry is provided, so a no-op can never look live).
 * Alert role announces the state change. Strings arrive translated from
 * the caller (D-14).
 */
export type ErrorStateProps = {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
}: ErrorStateProps) {
  const { tokens } = useTheme();
  return (
    <View
      accessibilityRole="alert"
      style={{
        alignItems: "center",
        gap: tokens.spacing.sm,
        padding: tokens.spacing.xl,
      }}
    >
      <Heading
        level={3}
        style={{ color: tokens.colors.danger, textAlign: "center" }}
      >
        {title}
      </Heading>
      {description ? (
        <Text
          variant="bodySmall"
          style={{ color: tokens.colors.textMuted, textAlign: "center" }}
        >
          {description}
        </Text>
      ) : null}
      {retryLabel !== undefined && onRetry !== undefined ? (
        <Button label={retryLabel} onPress={onRetry} alignSelf="center" />
      ) : null}
    </View>
  );
}
