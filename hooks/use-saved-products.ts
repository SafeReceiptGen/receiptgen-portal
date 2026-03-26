/**
 * useSavedProducts — fetches the saved product names for a store.
 * Returns an empty array while loading, if unauthenticated, or if no store is selected.
 * Currently backed by a mock; swap `savedProductsApi.list` body for a real endpoint later.
 */
import { useEffect, useState } from "react";
import { savedProductsApi, SavedProduct } from "@/lib/api";

export function useSavedProducts(
  isAuthenticated: boolean,
  storeId: string | undefined,
) {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !storeId) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setProducts([]);

    savedProductsApi
      .list(storeId)
      .then(({ products }) => {
        if (!cancelled) setProducts(products);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load saved products");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, storeId]);

  return { products, isLoading, error };
}
