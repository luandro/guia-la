import { View } from "react-native";
import { useTranslation } from "react-i18next";

import type { Locale } from "@guia-la/core";
import {
  Chip,
  EmptyState,
  ErrorState,
  OfflineBanner,
  Skeleton,
  useTheme,
} from "@guia-la/ui";

import type { JourneyError } from "@/state/journey";

/**
 * Shared journey UI pieces (task 02-9). Phase 03, task 6: these are thin
 * wrappers over the @guia-la/ui state primitives — loading is a Skeleton
 * group, empty/error/offline are the named states from packages/ui, and
 * the content markers are Chips. All user-facing strings come from the
 * catalogs (D-14); these components must render under LocaleProvider.
 */

export function LoadingView() {
  const { t } = useTranslation();
  const { tokens } = useTheme();
  return (
    // One announcement for the whole group: the skeletons themselves stay
    // out of the accessibility tree (see Skeleton's label prop). The
    // container is explicitly accessible — on iOS a plain View is not an
    // accessibility element, so without it VoiceOver may skip the label
    // and never announce the loading state (PR #19 review).
    <View
      accessible
      accessibilityLabel={t("places.loading")}
      accessibilityRole="progressbar"
      style={{ gap: tokens.spacing.sm, padding: tokens.spacing.lg }}
    >
      <Skeleton width="55%" />
      <Skeleton />
      <Skeleton width="82%" />
    </View>
  );
}

export function EmptyView() {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={t("places.empty")}
      description={t("places.emptyDetail")}
    />
  );
}

export function ErrorView({
  error,
  retry,
}: {
  error: JourneyError;
  retry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ErrorState
      title={t("places.errorTitle")}
      description={
        error.kind === "timeout" ? t("places.timeout") : t("places.errorDetail")
      }
      retryLabel={t("common.retry")}
      onRetry={retry}
    />
  );
}

export function OfflineHint({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  return <OfflineBanner message={t("common.offlineHint")} visible={visible} />;
}

/** Visible marker when content fell back to the destination's original. */
export function ShowingOriginalBadge({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  return <Chip label={t("common.showingOriginal", { locale })} />;
}

/** Visible marker for machine-translated content (until human-reviewed). */
export function MachineTranslatedBadge() {
  const { t } = useTranslation();
  return <Chip label={t("common.machineTranslated")} tone="warning" />;
}
