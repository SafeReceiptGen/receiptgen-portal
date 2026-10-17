import { queryOptions } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";

export const dashboardHomeQueryKey = ["dashboard", "home"] as const;

export const dashboardHomeQueryOptions = (range: "7d" | "30d" = "30d") =>
  queryOptions({
    queryKey: [...dashboardHomeQueryKey, range] as const,
    queryFn: () => dashboardApi.getHome(range),
  });

export const dashboardStatsQueryOptions = (range: "7d" | "30d") =>
  queryOptions({
    queryKey: ["dashboard", "stats", range] as const,
    queryFn: async ({ client }) => {
      if (range === "30d") {
        const home = await client.fetchQuery(dashboardHomeQueryOptions("30d"));
        return home.stats;
      }
      return dashboardApi.getStats(range);
    },
  });
