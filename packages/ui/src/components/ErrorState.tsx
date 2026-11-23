import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Button } from "./Button";
import { Heading } from "./Heading";
import type { HeadingLevel } from "./textStyles";
import { Text } from "./Text";

/**
 * ErrorState primitive (phase 03, task 6): something failed — names what
 * failed and offers a retry that visibly fires (the retry button only
 * renders when onRetry is provided, so a no-op can never look live).
 * Alert role announces the state change. Strings arrive translated from
 * the caller (D-14).
 *
 * headingLevel (PR #19 deferred finding 03-78b): the title's heading
 * level, default 2. A page whose only heading is this state passes level 1
 * so the document keeps exactly one h1; a state under a page's own h1
 * stays at 2.
 */
export type ErrorStateProps = {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  headingLevel?: HeadingLevel;
};

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  headingLevel = 2,
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
        level={headingLevel}
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
