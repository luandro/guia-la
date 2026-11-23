import { View } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import { Button } from "./Button";
import { Heading } from "./Heading";
import type { HeadingLevel } from "./textStyles";
import { Text } from "./Text";

/**
 * EmptyState primitive (phase 03, task 6): a list or directory with
 * nothing to show — never a bare blank. Title and description arrive
 * translated from the caller (D-14); the optional action is the "one
 * clear next step" the phase state matrix requires.
 *
 * headingLevel (PR #19 deferred finding 03-78b): the title's heading
 * level, default 2. A page whose only heading is this state passes level 1
 * so the document keeps exactly one h1; a state rendered under a page's
 * own h1 stays at 2. The default keeps these components valid anywhere.
 */
export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  headingLevel?: HeadingLevel;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  headingLevel = 2,
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
      <Heading level={headingLevel} style={{ textAlign: "center" }}>
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
        <Button
          label={actionLabel}
          variant="secondary"
          onPress={onAction}
          alignSelf="center"
        />
      ) : null}
    </View>
  );
}
