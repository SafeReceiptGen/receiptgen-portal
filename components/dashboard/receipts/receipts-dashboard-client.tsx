"use client";

import { useQuery } from "@tanstack/react-query";
import { receiptsListQueryOptions } from "@/lib/queries/receipts";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { ReceiptsTable } from "./receipts-table";
import { ReceiptDetailsSheet } from "./receipt-details-sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ReceiptsDashboardClient() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [receiptId, setReceiptId] = useQueryState("receiptId", parseAsString);

  const { data, isLoading, isError } = useQuery(
    receiptsListQueryOptions({ page, limit: 10 }),
  );

  if (isError) throw new Error("Failed to fetch receipts");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Receipts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Receipts</CardTitle>
          <CardDescription>
            Manage and view all receipts issued across your stores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceiptsTable
            data={data?.data ?? []}
            pageCount={data?.meta?.totalPages ?? 1}
            isLoading={isLoading}
            onRowClick={(id: string) => setReceiptId(id)}
          />
        </CardContent>
      </Card>

      <ReceiptDetailsSheet
        receiptId={receiptId}
        onOpenChange={(open: boolean) => {
          if (!open) setReceiptId(null);
        }}
      />
    </div>
  );
}
