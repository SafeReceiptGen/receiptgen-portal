import { queryOptions } from "@tanstack/react-query";
import { storesApi } from "@/lib/api";

export const storesQueryOptions = queryOptions({
  queryKey: ["stores"],
  queryFn: async () => {
    const data = await storesApi.list();
    console.log("Stores in query", data);
    return data;
  },
});
