"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";
import {
  formatSignedPercent,
  salesDeltaPercent,
} from "@/lib/report-insights";
import type { ReportSummary } from "@/lib/api";

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

export function ReportMetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ReportMetricCards({
  data,
  compareLabel,
}: {
  data: ReportSummary | null;
  compareLabel: "last month" | "previous period";
}) {
  const totals = data?.totals;
  const delta = data ? salesDeltaPercent(data) : null;
  const momLabel = data?.previousPeriod
    ? `${formatSignedPercent(delta)} vs ${compareLabel}`
    : "—";

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total sales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals ? formatCurrency(totals.totalSales, "GHS") : "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">{momLabel}</div>
          <div className="text-muted-foreground">GHS receipts only</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Transaction count</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals ? formatInt(totals.transactionCount) : "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Issued receipts in this range</div>
          <div className="text-muted-foreground">Voided receipts excluded</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average transaction value</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals ? formatCurrency(totals.avgTransactionValue, "GHS") : "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Total sales ÷ transactions</div>
          <div className="text-muted-foreground">GHS receipts only</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Units sold</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totals ? formatInt(totals.unitsSold) : "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Line-item quantities</div>
          <div className="text-muted-foreground">Across all stores</div>
        </CardFooter>
      </Card>
    </div>
  );
}
