import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { customerDetailQueryOptions } from "@/lib/queries/customers";
import { CustomerDetailClient } from "@/components/dashboard/customers/customer-detail-client";

export async function generateMetadata() {
  return {
    title: "Customer",
    description: "Customer loyalty summary and receipts.",
  };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(customerDetailQueryOptions(id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerDetailClient customerId={id} />
    </HydrationBoundary>
  );
}
