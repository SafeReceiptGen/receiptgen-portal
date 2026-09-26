"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import type { ReceiptData } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { itemsSubtotal } from "@/lib/loyalty-redeem";
import { formatLoyaltyPoints } from "@/lib/receipt-card-model";
import { loyaltyRedeemOfferQueryOptions } from "@/lib/queries/retailer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RedeemRewardControlProps = {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
  isAuthenticated?: boolean;
  compact?: boolean;
};

export function RedeemRewardControl({
  data,
  onChange,
  isAuthenticated,
  compact = false,
}: RedeemRewardControlProps) {
  const [debouncedPhone, setDebouncedPhone] = useState(
    data.customerPhone.trim(),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedPhone(data.customerPhone.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [data.customerPhone]);

  const itemsTotal = itemsSubtotal(data.items);
  const offerQuery = useQuery({
    ...loyaltyRedeemOfferQueryOptions(debouncedPhone, itemsTotal),
    enabled:
      Boolean(isAuthenticated) &&
      debouncedPhone.length >= 7 &&
      itemsTotal > 0,
  });
  const offer = offerQuery.data ?? null;
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);
  dataRef.current = data;
  onChangeRef.current = onChange;

  useEffect(() => {
    const current = dataRef.current;
    if (!current.redeemRewards) return;

    if (!offer) {
      if (offerQuery.isFetching) return;
      onChangeRef.current({
        ...current,
        redeemRewards: false,
        loyaltyDiscount: 0,
      });
      return;
    }

    const nextDiscount = Number(offer.discount);
    if (
      Math.round((current.loyaltyDiscount ?? 0) * 100) !==
      Math.round(nextDiscount * 100)
    ) {
      onChangeRef.current({
        ...current,
        loyaltyDiscount: nextDiscount,
      });
    }
  }, [offer, offerQuery.isFetching]);

  if (!isAuthenticated || !offer) {
    return null;
  }

  const discount = Number(offer.discount);
  const rewardWord = offer.count === 1 ? "reward" : "rewards";

  if (data.redeemRewards) {
    return (
      <div
        className={
          compact
            ? "rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10"
            : "rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10"
        }
      >
        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
          {offer.count} {rewardWord} applied
        </p>
        <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-100/80">
          {formatLoyaltyPoints(offer.pointsDeducted)} deducted ·{" "}
          {formatCurrency(discount, data.currency)} off · Balance after
          redemption: {formatLoyaltyPoints(offer.pointsBalanceAfter)}
        </p>
        <button
          type="button"
          className="mt-2 text-[11px] font-medium text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-200"
          onClick={() =>
            onChange({
              ...data,
              redeemRewards: false,
              loyaltyDiscount: 0,
            })
          }
        >
          Remove reward
        </button>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        className={
          compact
            ? "h-auto w-full cursor-pointer justify-start gap-2 rounded-xl bg-primary px-4 py-3 text-left text-white shadow-sm hover:bg-[#0044cc] dark:bg-primary dark:text-white dark:hover:bg-[#0044cc]"
            : "h-auto w-full cursor-pointer justify-start gap-2 bg-primary px-3 py-2.5 text-left text-white shadow-sm hover:bg-[#0044cc] dark:bg-primary dark:text-white dark:hover:bg-[#0044cc]"
        }
        onClick={() => setConfirmOpen(true)}
      >
        <Gift className="size-4 shrink-0" />
        <span className="flex flex-col items-start">
          <span className="text-sm font-semibold">Redeem reward</span>
          <span className="text-[11px] font-normal text-white/80">
            {formatLoyaltyPoints(offer.pointsBalance)} available
          </span>
        </span>
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem {offer.count} {rewardWord}?</DialogTitle>
            <DialogDescription>
              This uses the customer&apos;s current balance. Points from this
              sale are not included.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-white/5">
            <div className="flex justify-between">
              <span className="text-slate-500">Rewards</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {offer.count}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Points deducted</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatLoyaltyPoints(offer.pointsDeducted)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Discount</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(discount, data.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Balance after redemption</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatLoyaltyPoints(offer.pointsBalanceAfter)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onChange({
                  ...data,
                  redeemRewards: true,
                  loyaltyDiscount: discount,
                });
                setConfirmOpen(false);
              }}
            >
              Redeem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
