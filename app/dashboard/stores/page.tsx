import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { storesQueryOptions } from "@/lib/queries/stores";
import { StoresClient } from "./stores-client";

export const metadata = {
  title: "Stores",
  description: "Manage your retail stores.",
};

export default async function StoresPage() {
  const queryClient = getQueryClient();

  // Prefetch the query on the server
  await queryClient.prefetchQuery(storesQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StoresClient />
    </HydrationBoundary>
  );
}
