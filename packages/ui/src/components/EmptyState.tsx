import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Button } from "./Button";
import { Heading } from "./Heading";
import { Text } from "./Text";

/**
 * EmptyState primitive (phase 03, task 6): a list or directory with
 * nothing to show — never a bare blank. Title and description arrive
 * translated from the caller (D-14); the optional action is the "one
 * clear next step" the phase state matrix requires.
 */
export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        gap: tokens.spacing.sm,
        padding: tokens.spacing.xl,
      }}
    >
      <Heading level={3} style={{ textAlign: "center" }}>
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
      {actionLabel !== undefined && onAction !== undefined ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}
