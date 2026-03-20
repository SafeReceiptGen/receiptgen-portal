"use client";

import { ReceiptForReturn } from "@/types/returns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Receipt,
  Calendar,
  CreditCard,
  Clock,
  ShieldCheck,
  RotateCcw,
  Store,
} from "lucide-react";

interface ReceiptSheetProps {
  receipt: ReceiptForReturn;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptSheet({
  receipt,
  open,
  onOpenChange,
}: ReceiptSheetProps) {
  const formatPrice = (price: number) =>
    price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md rounded-2xl border-0 bg-white/95 p-0 shadow-2xl backdrop-blur-xl dark:bg-[#111827]/95 dark:ring-1 dark:ring-white/10 max-h-[80vh] overflow-hidden flex flex-col"
        showCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-blue-400/10">
              <Receipt size={20} className="text-primary dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display">
                {receipt.storeName}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-white/50">
                Receipt #{receipt.receiptNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain px-6 py-5 space-y-5 flex-1">
          {/* Quick info row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 mb-1">
                <Calendar size={10} />
                Purchased
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatDate(receipt.purchasedAt)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 mb-1">
                <CreditCard size={10} />
                Payment
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {receipt.paymentMethod}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 mb-3">
              Items Purchased
            </h3>
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-white/5 rounded-xl border border-slate-100 dark:border-white/10 overflow-hidden">
              {receipt.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 bg-white dark:bg-white/[0.02]"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/40">
                      {item.detail}
                      {item.quantity > 1 && ` × ${item.quantity}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums ml-4">
                    {receipt.currency}{" "}
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 dark:bg-white/10">
              <span className="text-sm font-medium text-white/70 dark:text-white/60">
                Total
              </span>
              <span className="text-lg font-bold text-white tabular-nums">
                {receipt.currency} {formatPrice(receipt.total)}
              </span>
            </div>
          </div>

          {/* Return Policy */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 mb-3">
              Return Policy
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/10">
                <Clock
                  size={16}
                  className="shrink-0 text-amber-500 dark:text-amber-400"
                />
                <div>
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Return Window
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {receipt.returnWindow}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/10">
                <ShieldCheck
                  size={16}
                  className="shrink-0 text-primary dark:text-blue-400"
                />
                <div>
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Condition Required
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {receipt.returnCondition}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/10">
                <RotateCcw
                  size={16}
                  className="shrink-0 text-green-500 dark:text-green-400"
                />
                <div>
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Refund Type
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {receipt.refundType}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Store contact */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
            <Store
              size={16}
              className="shrink-0 text-slate-400 dark:text-white/40"
            />
            <div>
              <p className="text-xs text-slate-500 dark:text-white/40">
                Store Contact
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {receipt.storePhone}
              </p>
            </div>
          </div>
        </div>

        {/* Powered by footer */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm px-6 py-3 dark:border-white/10 dark:bg-white/[0.02]">
          <p className="text-center text-[10px] font-medium text-slate-400 dark:text-white/30">
            Powered by{" "}
            <span className="font-semibold text-slate-500 dark:text-white/50">
              Safe
              <span className="text-primary dark:text-blue-400">Receipts</span>
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
