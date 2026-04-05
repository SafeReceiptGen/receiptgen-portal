import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { returnsListQueryOptions } from "@/lib/queries/returns";
import { ReturnsDashboardClient } from "@/components/dashboard/returns/returns-dashboard-client";

export const metadata = {
  title: "Returns",
  description: "Review and manage customer return requests.",
};

export default async function ReturnsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    ...returnsListQueryOptions({ pending_review: true, limit: 50 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReturnsDashboardClient />
    </HydrationBoundary>
  );
}
