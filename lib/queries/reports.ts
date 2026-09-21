import { queryOptions } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";

export const reportSummaryQueryOptions = (params?: {
  from?: string;
  to?: string;
  storeId?: string;
}) =>
  queryOptions({
    queryKey: ["reports", "summary", params ?? {}] as const,
    queryFn: () => reportsApi.getSummary(params),
  });
