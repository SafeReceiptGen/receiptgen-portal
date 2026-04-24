"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardStatsQueryOptions } from "@/lib/queries/dashboard";

function formatInt(n: number): string {
  return n.toLocaleString();
}

function MetricCardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-9 w-24" />
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5">
        <Skeleton className="h-4 w-full max-w-[200px]" />
        <Skeleton className="h-3 w-full max-w-[160px]" />
      </CardFooter>
    </Card>
  );
}

export function SectionCards() {
  const { data, isPending, isError } = useQuery(
    dashboardStatsQueryOptions("30d"),
  );

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const receiptsToday = isError ? null : data!.receiptsToday;
  const totalReceipts = isError ? null : data!.totalReceipts;
  const pendingReturns = isError ? null : data!.pendingReturns;
  const returnRate = isError ? null : data!.returnRate;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Receipts today</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {receiptsToday === null ? "—" : formatInt(receiptsToday)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Issued across all your stores today</div>
          <div className="text-muted-foreground">
          Resets daily
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total receipts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalReceipts === null ? "—" : formatInt(totalReceipts)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">All receipts issued so far</div>
          <div className="text-muted-foreground">Across all stores</div>
        </CardFooter>
      </Card>

      <Link
        href="/dashboard/returns?pending_review=true"
        className="block rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="@container/card h-full transition-colors hover:bg-muted/30">
          <CardHeader>
            <CardDescription>Pending return requests</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {pendingReturns === null ? "—" : formatInt(pendingReturns)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="font-medium">Needs your attention</div>
            <div className="text-muted-foreground">Review pending & scheduled pickups →</div>
          </CardFooter>
        </Card>
      </Link>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Return rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {returnRate === null ? "—" : `${returnRate}%`}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Percentage of receipts that were returned</div>
          <div className="text-muted-foreground">Across all stores</div>
        </CardFooter>
      </Card>
    </div>
  );
}
