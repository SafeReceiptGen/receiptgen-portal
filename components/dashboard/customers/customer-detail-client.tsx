"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, History, UserRound } from "lucide-react";
import { customerDetailQueryOptions } from "@/lib/queries/customers";
import { formatCurrency } from "@/lib/currency";
import {
  formatLoyaltyPoints,
  formatNextReward,
} from "@/lib/receipt-card-model";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomerDetailClient({ customerId }: { customerId: string }) {
  const { data: customer, isPending, isError, isFetching } = useQuery(
    customerDetailQueryOptions(customerId),
  );

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-8 p-8 pt-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-16 w-72" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    throw new Error("Failed to load customer");
  }

  if (!isPending && !isFetching && !customer) {
    notFound();
  }

  if (!customer) return null;

  const loyalty = customer.loyalty;
  const hasNextReward =
    loyalty.rewardThreshold != null && loyalty.rewardAmount != null;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-500">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-3 mb-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/dashboard/customers">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {customer.name?.trim() || "Unnamed customer"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {customer.phone || "No phone on file"}
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-white/10 dark:bg-white/5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Loyalty summary
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <LoyaltyStat
            label="Current balance"
            value={formatLoyaltyPoints(loyalty.pointsBalance)}
          />
          <LoyaltyStat
            label="Lifetime earned"
            value={formatLoyaltyPoints(loyalty.lifetimePointsEarned)}
          />
          <LoyaltyStat
            label="Lifetime redeemed"
            value={formatLoyaltyPoints(loyalty.lifetimePointsRedeemed)}
          />
        </div>
        {hasNextReward ? (
          <div className="border-t border-slate-200 pt-4 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Next reward
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {formatNextReward(
                loyalty.rewardThreshold!,
                loyalty.rewardAmount!,
              )}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
              {loyalty.pointsToGo === 0
                ? "Reward reached"
                : `${loyalty.pointsToGo} ${loyalty.pointsToGo === 1 ? "point" : "points"} to go`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Loyalty rewards are not enabled for this store group.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Recent receipts
        </h3>
        {customer.receipts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No receipts on this customer yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
            {customer.receipts.slice(0, 8).map((receipt) => (
              <li
                key={receipt.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{receipt.receiptNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(receipt.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="tabular-nums font-medium">
                  {formatCurrency(Number(receipt.total), receipt.currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-dashed border-slate-200 px-6 py-8 dark:border-white/15">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Loyalty activity</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Earn and redeem history for this customer will appear here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoyaltyStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
