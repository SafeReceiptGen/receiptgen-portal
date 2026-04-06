import { queryOptions } from "@tanstack/react-query";
import { receiptsApi } from "@/lib/api";

export const receiptsListQueryOptions = (params?: {
  storeId?: string;
  page?: number;
  status?: string;
  limit?: number;
}) =>
  queryOptions({
    queryKey: ["receipts", "list", params ?? {}] as const,
    queryFn: () => receiptsApi.list(params),
  });

export const receiptDetailQueryOptions = (id: string | null) =>
  queryOptions({
    queryKey: ["receipts", "detail", id] as const,
    queryFn: () => {
      if (!id) throw new Error("Receipt id required");
      return receiptsApi.get(id);
    },
    enabled: !!id,
  });
