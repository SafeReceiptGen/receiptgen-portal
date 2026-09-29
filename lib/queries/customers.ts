import { queryOptions } from "@tanstack/react-query";
import { customersApi } from "@/lib/api";

export const customersListQueryOptions = (params?: {
  search?: string;
  page?: number;
  limit?: number;
}) =>
  queryOptions({
    queryKey: ["customers", "list", params ?? {}] as const,
    queryFn: () => customersApi.list(params),
  });

export const customerDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["customers", "detail", id] as const,
    queryFn: () => customersApi.get(id),
  });
