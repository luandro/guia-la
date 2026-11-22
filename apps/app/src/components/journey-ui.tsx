import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { Locale } from "@guia-la/core";

import { ThemedText } from "@/components/themed-text";
import type { JourneyError } from "@/state/journey";

/**
 * Shared journey UI pieces (task 02-9). All user-facing strings come from
 * the catalogs (D-14); these components must render under LocaleProvider.
 */

export function LoadingView() {
  const { t } = useTranslation();
  return (
    <View style={styles.state}>
      <ThemedText accessibilityRole="progressbar">
        {t("places.loading")}
      </ThemedText>
    </View>
  );
}

export function EmptyView() {
  const { t } = useTranslation();
  return (
    <View style={styles.state}>
      <ThemedText style={styles.stateTitle}>{t("places.empty")}</ThemedText>
      <ThemedText>{t("places.emptyDetail")}</ThemedText>
    </View>
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
    <View style={styles.state}>
      <ThemedText style={styles.stateTitle}>
        {t("places.errorTitle")}
      </ThemedText>
      <ThemedText>
        {error.kind === "timeout"
          ? t("places.timeout")
          : t("places.errorDetail")}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={retry}
        style={styles.retryButton}
      >
        <ThemedText style={styles.retryText}>{t("common.retry")}</ThemedText>
      </Pressable>
    </View>
  );
}

export function OfflineHint({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <ThemedText style={styles.offlineHint}>
      {t("common.offlineHint")}
    </ThemedText>
  );
}

/** Visible marker when content fell back to the destination's original. */
export function ShowingOriginalBadge({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  return (
    <ThemedText style={styles.marker}>
      {t("common.showingOriginal", { locale })}
    </ThemedText>
  );
}

/** Visible marker for machine-translated content (until human-reviewed). */
export function MachineTranslatedBadge() {
  const { t } = useTranslation();
  return (
    <ThemedText style={styles.marker}>
      {t("common.machineTranslated")}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  state: { gap: 8, padding: 16 },
  stateTitle: { fontSize: 18, fontWeight: "600" },
  retryButton: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: { fontWeight: "600" },
  offlineHint: { fontStyle: "italic", padding: 16 },
  marker: { fontSize: 12, opacity: 0.75 },
});
