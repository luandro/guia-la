import { useSyncExternalStore } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

const emptySubscribe = () => () => {};

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  // Hydration flag without setState-in-effect (react-hooks/set-state-in-effect):
  // false during static render (server snapshot), true once hydrated on the client.
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
