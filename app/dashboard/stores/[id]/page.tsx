import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { storeQueryOptions } from "@/lib/queries/stores";
import { StoreDetailClient } from "./store-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Store Details`,
    description: "Manage your retail store details.",
  };
}

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Prefetch the query on the server
  await queryClient.prefetchQuery(storeQueryOptions(id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StoreDetailClient storeId={id} />
    </HydrationBoundary>
  );
}
