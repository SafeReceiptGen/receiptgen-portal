"use client";

import { useQuery } from "@tanstack/react-query";
import { receiptsListQueryOptions } from "@/lib/queries/receipts";
import { storesQueryOptions } from "@/lib/queries/stores";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { useMemo } from "react";
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
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const [receiptId, setReceiptId] = useQueryState("receiptId", parseAsString);
  const [filtersStr] = useQueryState("filters");

  // Parse filters from the URL to pass to the API
  const parsedFilters = useMemo(() => {
    if (!filtersStr) return {};
    try {
      const arr = filtersStr as unknown as any[] | null;
      const apiParams: Record<string, string> = {};

      arr?.forEach((f: any) => {
        // Handle Date Ranges
        if (f.id === "date" && Array.isArray(f.value) && f.value.length === 2) {
          apiParams.from = new Date(Number(f.value[0])).toISOString();
          apiParams.to = new Date(Number(f.value[1])).toISOString();
        }
        // Handle Text Search (Receipt Number)
        else if (f.id === "receiptNumber") {
          apiParams.search = f.value;
        }
        // Handle Selects / Direct Matches (Store, Status, Payment Method)
        else {
          apiParams[f.id] = f.value;
        }
      });
      return apiParams;
    } catch {
      return {};
    }
  }, [filtersStr]);

  const { data: stores } = useQuery(storesQueryOptions);

  const { data, isLoading, isError } = useQuery(
    receiptsListQueryOptions({ page, limit: perPage, ...parsedFilters }),
  );

  if (isError) throw new Error("Failed to fetch receipts");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Receipts</h1>
      </div>

      <Card className="border-none shadow-none">
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
            stores={stores}
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
