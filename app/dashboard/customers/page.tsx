import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { customersListQueryOptions } from "@/lib/queries/customers";
import { CustomersDashboardClient } from "@/components/dashboard/customers/customers-dashboard-client";

export const metadata = {
  title: "Customers",
  description: "View customers and their loyalty balances.",
};

export default async function CustomersPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(customersListQueryOptions({ limit: 10 }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomersDashboardClient />
    </HydrationBoundary>
  );
}
