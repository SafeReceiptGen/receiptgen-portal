"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { loyaltySummaryQueryOptions } from "@/lib/queries/dashboard";
import { loyaltyQueryOptions } from "@/lib/queries/retailer";

function formatInt(n: number): string {
  return n.toLocaleString();
}

function customerLabel(name: string | null, phone: string | null): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  const trimmedPhone = phone?.trim();
  if (trimmedPhone) return trimmedPhone;
  return "Customer";
}

function LoyaltySkeleton() {
  return (
    <section className="px-4 lg:px-6" aria-busy="true" aria-label="Loyalty">
      <div className="rounded-xl border bg-card px-5 py-4">
        <Skeleton className="h-4 w-16" />
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
        {value === null ? "—" : formatInt(value)}
      </dd>
    </div>
  );
}

export function LoyaltySummary() {
  const program = useQuery(loyaltyQueryOptions);
  const summary = useQuery({
    ...loyaltySummaryQueryOptions(),
    enabled: program.data?.enabled === true,
  });

  if (program.isPending) return <LoyaltySkeleton />;
  if (program.isError || !program.data?.enabled) return null;

  if (summary.isPending) return <LoyaltySkeleton />;

  const members = summary.isError ? null : summary.data.members;
  const totalPointsIssued = summary.isError ? null : summary.data.totalPointsIssued;
  const totalPointsRedeemed = summary.isError
    ? null
    : summary.data.totalPointsRedeemed;
  const topReturningCustomers = summary.isError
    ? null
    : summary.data.topReturningCustomers;

  return (
    <section className="px-4 lg:px-6" aria-labelledby="loyalty-summary-heading">
      <div className="rounded-xl border bg-card px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="loyalty-summary-heading" className="text-sm font-medium">
            Loyalty
          </h2>
          <Link
            href="/dashboard/customers"
            className="text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View customers
          </Link>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)] lg:items-start">
          <dl className="grid grid-cols-3 gap-3">
            <Metric label="Members" value={members} />
            <Metric label="Points issued" value={totalPointsIssued} />
            <Metric label="Points redeemed" value={totalPointsRedeemed} />
          </dl>

          <div>
            <p className="text-xs text-muted-foreground">Returning customers</p>
            {topReturningCustomers === null ? (
              <p className="mt-2 text-sm text-muted-foreground">—</p>
            ) : topReturningCustomers.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No one with two or more visits yet.
              </p>
            ) : (
              <ul className="mt-1">
                {topReturningCustomers.map((customer) => (
                  <li key={customer.id}>
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="-mx-2 flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <span className="min-w-0 truncate font-medium">
                        {customerLabel(customer.name, customer.phone)}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {formatInt(customer.receiptCount)} visits
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
