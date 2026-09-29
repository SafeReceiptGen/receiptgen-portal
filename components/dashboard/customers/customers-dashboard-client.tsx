"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { customersListQueryOptions } from "@/lib/queries/customers";
import { formatLoyaltyPoints } from "@/lib/receipt-card-model";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomersDashboardClient() {
  const router = useRouter();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchParam, setSearchParam] = useQueryState("search", parseAsString);
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

  const commitSearch = useCallback(
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
        commitSearch(value);
      }, 300);
    },
    [commitSearch],
  );

  const listParams = useMemo(
    () => ({
      page,
      limit: 10,
      ...(searchParam?.trim() ? { search: searchParam.trim() } : {}),
    }),
    [page, searchParam],
  );

  const { data, isLoading, isError, refetch } = useQuery(
    customersListQueryOptions(listParams),
  );

  const customers = data?.customers ?? [];
  const meta = data?.meta;
  const hasSearch = Boolean(listParams.search);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          People saved from issued receipts, with their current loyalty
          balances.
        </p>
      </div>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>All customers</CardTitle>
          <CardDescription>
            Search by name or phone. Balances update when receipts earn or
            redeem points.
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
              placeholder="Search by name or phone…"
              value={draft}
              onChange={(e) => {
                const value = e.target.value;
                setDraft(value);
                scheduleCommitSearch(value);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (debounceTimerRef.current) {
                  clearTimeout(debounceTimerRef.current);
                  debounceTimerRef.current = null;
                }
                commitSearch(draft);
              }}
              aria-label="Search customers"
            />
          </div>

          {isError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
              <p className="font-medium">Could not load customers</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </div>
          ) : isLoading ? (
            <CustomersTableSkeleton />
          ) : customers.length === 0 ? (
            <Empty className="min-h-[280px] rounded-2xl border-2 border-dashed bg-muted/10">
              <EmptyMedia variant="icon">
                <Users className="h-6 w-6" />
              </EmptyMedia>
              <EmptyContent>
                <EmptyTitle>
                  {hasSearch ? "No matching customers" : "No customers yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {hasSearch
                    ? "Try a different name or phone number."
                    : "Customers appear here after you issue their first receipt."}
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Earned</TableHead>
                    <TableHead className="text-right">Redeemed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/customers/${customer.id}`)
                      }
                    >
                      <TableCell className="font-medium">
                        {customer.name?.trim() || "Unnamed customer"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.phone || "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatLoyaltyPoints(customer.pointsBalance)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatLoyaltyPoints(customer.lifetimePointsEarned)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatLoyaltyPoints(customer.lifetimePointsRedeemed)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  {meta
                    ? `${meta.total} customer${meta.total === 1 ? "" : "s"}`
                    : null}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta || page <= 1}
                    onClick={() => void setPage(Math.max(1, page - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="min-w-16 text-center">
                    {page} / {meta?.totalPages ?? 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta || page >= meta.totalPages}
                    onClick={() => void setPage(page + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CustomersTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}
