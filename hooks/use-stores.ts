/**
 * useStores — fetches the authenticated user's stores from the API.
 * Returns an empty array while loading or if unauthenticated.
 */
import { useEffect, useState } from "react";
import { storesApi, Store } from "@/lib/api";

export function useStores(isAuthenticated: boolean) {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setStores([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    storesApi
      .list()
      .then(({ stores }) => {
        if (!cancelled) setStores(stores);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load stores");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return { stores, isLoading, error };
}
