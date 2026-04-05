import { queryOptions } from "@tanstack/react-query";
import { returnsApi } from "@/lib/api";

export const returnsListQueryOptions = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  pending_review?: boolean;
}) =>
  queryOptions({
    queryKey: ["returns", "list", params ?? {}] as const,
    queryFn: () => returnsApi.list(params),
  });

export const returnDetailQueryOptions = (id: string | null) =>
  queryOptions({
    queryKey: ["returns", "detail", id] as const,
    queryFn: () => {
      if (!id) throw new Error("Return id required");
      return returnsApi.get(id);
    },
    enabled: !!id,
  });
