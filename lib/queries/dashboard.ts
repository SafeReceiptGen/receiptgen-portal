import { queryOptions } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";

export const dashboardStatsQueryOptions = (range: "7d" | "30d") =>
  queryOptions({
    queryKey: ["dashboard", "stats", range] as const,
    queryFn: () => dashboardApi.getStats(range),
  });

export const loyaltySummaryQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboard", "loyalty"] as const,
    queryFn: () => dashboardApi.getLoyaltySummary(),
  });
