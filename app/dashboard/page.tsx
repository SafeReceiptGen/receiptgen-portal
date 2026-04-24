import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { getQueryClient } from "@/lib/query-client";
import { dashboardStatsQueryOptions } from "@/lib/queries/dashboard";
import { DashboardViewTracker } from "./dashboard-view-tracker";

export default async function Page() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(dashboardStatsQueryOptions("30d"));

  return (
    <>
      <DashboardViewTracker />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </div>
          </div>
        </div>
      </HydrationBoundary>
    </>
  );
}
