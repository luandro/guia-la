import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { Locale } from "@guia-la/core";

import type { JourneyError } from "@/state/journey";

/**
 * Shared journey UI pieces (task 02-9). All user-facing strings come from
 * the catalogs (D-14); these components must render under LocaleProvider.
 */

export function LoadingView() {
  const { t } = useTranslation();
  return (
    <View style={styles.state}>
      <Text accessibilityRole="progressbar">{t("places.loading")}</Text>
    </View>
  );
}

export function EmptyView() {
  const { t } = useTranslation();
  return (
    <View style={styles.state}>
      <Text style={styles.stateTitle}>{t("places.empty")}</Text>
      <Text>{t("places.emptyDetail")}</Text>
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
      <Text style={styles.stateTitle}>{t("places.errorTitle")}</Text>
      <Text>
        {error.kind === "timeout"
          ? t("places.timeout")
          : t("places.errorDetail")}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={retry}
        style={styles.retryButton}
      >
        <Text style={styles.retryText}>{t("common.retry")}</Text>
      </Pressable>
    </View>
  );
}

export function OfflineHint({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  if (!visible) return null;
  return <Text style={styles.offlineHint}>{t("common.offlineHint")}</Text>;
}

/** Visible marker when content fell back to the destination's original. */
export function ShowingOriginalBadge({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  return (
    <Text style={styles.marker}>{t("common.showingOriginal", { locale })}</Text>
  );
}

/** Visible marker for machine-translated content (until human-reviewed). */
export function MachineTranslatedBadge() {
  const { t } = useTranslation();
  return <Text style={styles.marker}>{t("common.machineTranslated")}</Text>;
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
