"use client";

import { useQuery } from "@tanstack/react-query";
import { receiptsListQueryOptions } from "@/lib/queries/receipts";
import { storesQueryOptions } from "@/lib/queries/stores";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReceiptsTable } from "./receipts-table";
import { ReceiptDetailsSheet } from "./receipt-details-sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function ReceiptsDashboardClient() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [searchParam, setSearchParam] = useQueryState("search", parseAsString);

  const [receiptId, setReceiptId] = useQueryState("receiptId", parseAsString);
  const [filtersStr] = useQueryState("filters");

  const [draft, setDraft] = useState(searchParam ?? "");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(searchParam ?? "");
  }, [searchParam]);

  useEffect(
    () => () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    },
    [],
  );

  const commitSearchToUrl = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      void setSearchParam(trimmed.length ? trimmed : null);
      void setPage(1);
    },
    [setSearchParam, setPage],
  );

  const scheduleCommitSearch = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        commitSearchToUrl(value);
      }, 300);
    },
    [commitSearchToUrl],
  );

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

  const listParams = useMemo(() => {
    const { search: columnSearch, ...restParsed } = parsedFilters;
    const effectiveSearch =
      (searchParam?.trim() || columnSearch || "").trim() || undefined;
    return {
      page,
      limit: perPage,
      ...restParsed,
      ...(effectiveSearch ? { search: effectiveSearch } : {}),
    };
  }, [parsedFilters, page, perPage, searchParam]);

  const { data: stores } = useQuery(storesQueryOptions);

  const { data, isLoading, isError } = useQuery(
    receiptsListQueryOptions(listParams),
  );

  if (isError) throw new Error("Failed to fetch receipts");

  const showNoMatching =
    !isLoading &&
    (data?.data?.length ?? 0) === 0 &&
    Boolean(listParams.search);

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
          <div className="relative mb-4 max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              className="pl-9"
              placeholder="Search by receipt, customer, phone, or item…"
              value={draft}
              onChange={(e) => {
                const v = e.target.value;
                setDraft(v);
                scheduleCommitSearch(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                    debounceTimerRef.current = null;
                  }
                  commitSearchToUrl(draft);
                }
              }}
              aria-label="Search receipts"
            />
          </div>
          <ReceiptsTable
            data={data?.data ?? []}
            pageCount={data?.meta?.totalPages ?? 1}
            isLoading={isLoading}
            stores={stores}
            onRowClick={(id: string) => setReceiptId(id)}
            emptyMessage={
              showNoMatching ? "No matching receipts found" : undefined
            }
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
