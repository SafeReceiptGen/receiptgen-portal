import { queryOptions } from "@tanstack/react-query";
import { storesApi } from "@/lib/api";

export const storesQueryOptions = queryOptions({
  queryKey: ["stores"],
  queryFn: async () => {
    const data = await storesApi.list();
    return data.stores;
  },
});

export const storeQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["stores", id],
    queryFn: async () => {
      const data = await storesApi.get(id);
      return data.store;
    },
  });
