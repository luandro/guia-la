/**
 * Offline detection for the offline hint (task 02-9). Web uses
 * navigator.onLine; native has no equivalent without a dependency, and the
 * journey's data is bundled, so native reports online (the hint is
 * freshness-only — offline never gates the journey).
 */

export function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

export function subscribeOnline(
  listener: (online: boolean) => void,
): () => void {
  if (
    typeof window === "undefined" ||
    typeof window.addEventListener !== "function"
  ) {
    return () => {};
  }
  const onOnline = () => listener(true);
  const onOffline = () => listener(false);
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}
