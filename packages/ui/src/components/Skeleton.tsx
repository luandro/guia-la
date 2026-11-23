import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  type DimensionValue,
} from "react-native";

import { useTheme } from "../theme/ThemeProvider";
import type { RadiusStep } from "../tokens/types";

/**
 * Skeleton primitive (phase 03, task 6): a placeholder block for loading
 * content. The pulse loop degrades to a static block when the OS asks
 * for reduced motion (phase-03.md state matrix). No layout shift by
 * design: size the skeleton like the content it stands in for.
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
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;
    // Best-effort: if the query fails or is unavailable, animate.
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((enabled) => {
        if (!cancelled) setReduceMotion(enabled);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
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
  }, [reduceMotion, opacity]);

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
        width,
      }}
    />
  );
}
