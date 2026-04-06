import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { receiptsListQueryOptions } from "@/lib/queries/receipts";
import { storesQueryOptions } from "@/lib/queries/stores";
import { ReceiptsDashboardClient } from "@/components/dashboard/receipts/receipts-dashboard-client";

export const metadata = {
  title: "Receipts",
  description: "View and manage all digital receipts issued across your stores.",
};

export default async function ReceiptsPage() {
  const queryClient = getQueryClient();

  // Prefetch the first page of receipts and the stores list
  await Promise.all([
    queryClient.prefetchQuery({
      ...receiptsListQueryOptions({ limit: 10 }),
    }),
    queryClient.prefetchQuery(storesQueryOptions),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReceiptsDashboardClient />
    </HydrationBoundary>
  );
}
