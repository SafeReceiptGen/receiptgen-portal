/**
 * useStores — fetches the authenticated user's stores from the API.
 * Uses TanStack Query for caching and state management.
 */
import { useQuery } from "@tanstack/react-query";
import { storesApi, Store } from "@/lib/api";

export function useStores(isAuthenticated: boolean) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const res = await storesApi.list();
      return res.stores;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    stores: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
