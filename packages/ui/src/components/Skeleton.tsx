import { useEffect, useRef } from "react";
import { Animated, Easing, type DimensionValue } from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import type { RadiusStep } from "../tokens/types";
import { useReduceMotionPreference } from "./useReduceMotionPreference";

/**
 * Skeleton primitive (phase 03, task 6): a placeholder block for loading
 * content. The pulse loop degrades to a static block when the OS asks
 * for reduced motion (phase-03.md state matrix). No layout shift by
 * design: size the skeleton like the content it stands in for.
 *
 * PR #19 review: the animated opacity is bound to the view (it previously
 * animated a value nothing rendered), the pulse starts only after the
 * shared reduce-motion query resolves to false (a reduce-motion user never
 * sees the pulse begin), and all instances share one query + one
 * reduceMotionChanged subscription (see useReduceMotionPreference.ts).
 */
export type SkeletonProps = {
  width?: DimensionValue;
  /** Defaults to a body-small text line's height. */
  height?: number;
  radius?: RadiusStep;
  /**
   * Accessible description of what is loading, translated by the caller.
   * Without it the block is hidden from accessibility (a group of
   * skeletons should carry one label on its container, not per block).
   */
  label?: string;
  testID?: string;
};

const PULSE_DURATION_MS = 800;
const PULSE_MIN_OPACITY = 0.4;

export function Skeleton({
  width = "100%",
  height,
  radius = "sm",
  label,
  testID,
}: SkeletonProps) {
  const { tokens } = useTheme();
  // known=false holds the animation until the query resolves — motion is
  // never the fallback for an unanswered question.
  const { known, enabled } = useReduceMotionPreference();
  const shouldPulse = known && !enabled;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!shouldPulse) {
      opacity.stopAnimation(() => opacity.setValue(1));
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: PULSE_MIN_OPACITY,
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [shouldPulse, opacity]);

  return (
    <Animated.View
      accessible={label !== undefined}
      accessibilityLabel={label}
      accessibilityRole={label !== undefined ? "progressbar" : undefined}
      testID={testID}
      style={{
        backgroundColor: tokens.colors.border,
        borderRadius: tokens.radius[radius],
        height: height ?? tokens.typography.bodySmall.lineHeight,
        opacity,
        width,
      }}
    />
  );
}
