import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { reportSummaryQueryOptions } from "@/lib/queries/reports";
import { ReportsClient } from "@/components/dashboard/reports/reports-client";
import { currentMonthKey, monthRangeIso } from "@/lib/report-range";

export const metadata = {
  title: "Reports",
  description: "Sales, product performance, and monthly PDF reports.",
};

export default async function ReportsPage() {
  const queryClient = getQueryClient();
  const range = monthRangeIso(currentMonthKey());

  await queryClient.prefetchQuery(reportSummaryQueryOptions(range));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReportsClient />
    </HydrationBoundary>
  );
}
