import { NotFoundView } from "@/components/not-found-view";

/**
 * Branded not-found (task 02-9): unknown routes render this. Unknown locale
 * or slug values inside a journey route render the same view from there
 * (this file only covers routes Expo Router itself cannot match).
 */
export default function NotFound() {
  return <NotFoundView />;
}
