"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { receiptDetailQueryOptions } from "@/lib/queries/receipts";
import { receiptsApi } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, ExternalLink, RotateCcw } from "lucide-react";
import {
  formatPaymentMethodLabel,
  formatReceiptPaymentStatusLabel,
} from "@/lib/receipt-display-labels";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogoImage } from "@/components/receipt/brand-logo-image";
import { RECEIPT_LOGO_SLOT_PX } from "@/lib/receipt-logo-display";
import {
  discountReasonLabel,
  isLineItemDiscounted,
} from "@/lib/discount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payment-methods";
import { format } from "date-fns";

interface ReceiptDetailsSheetProps {
  receiptId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptDetailsSheet({
  receiptId,
  onOpenChange,
}: ReceiptDetailsSheetProps) {
  const queryClient = useQueryClient();
  const { data: receipt, isLoading } = useQuery({
    ...receiptDetailQueryOptions(receiptId),
  });

  const [recordOpen, setRecordOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["receipts"] });
  };

  const recordMutation = useMutation({
    mutationFn: () =>
      receiptsApi.recordPayment(receiptId!, {
        amount: parseFloat(paymentAmount),
        paymentMethod: paymentMethod || undefined,
        note: paymentNote.trim() || undefined,
      }),
    onSuccess: async () => {
      setActionError(null);
      setRecordOpen(false);
      setPaymentAmount("");
      setPaymentNote("");
      await invalidate();
    },
    onError: (err: Error) => {
      setActionError(err.message || "Failed to record payment");
    },
  });

  const settleMutation = useMutation({
    mutationFn: () =>
      receiptsApi.settlePayment(receiptId!, {
        paymentMethod: paymentMethod || undefined,
        note: paymentNote.trim() || undefined,
      }),
    onSuccess: async () => {
      setActionError(null);
      setSettleOpen(false);
      setPaymentNote("");
      await invalidate();
    },
    onError: (err: Error) => {
      setActionError(err.message || "Failed to settle balance");
    },
  });

  const formatPrice = (price: string | number) => {
    return parseFloat(String(price))
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return isoString;
    }
  };

  const dynamicQrUrl = receipt?.qrCodeToken?.trim()
    ? `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/receipt/${receipt.qrCodeToken}`
    : "";

  const balanceDue = receipt ? parseFloat(receipt.balanceDue ?? "0") : 0;
  const canCollectPayment =
    receipt?.status === "issued" && balanceDue > 0;

  const openRecordDialog = () => {
    setActionError(null);
    setPaymentAmount("");
    setPaymentMethod(receipt?.paymentMethod ?? "");
    setPaymentNote("");
    setRecordOpen(true);
  };

  const openSettleDialog = () => {
    setActionError(null);
    setPaymentMethod(receipt?.paymentMethod ?? "");
    setPaymentNote("");
    setSettleOpen(true);
  };

  const copyReceiptLink = () => {
    if (!dynamicQrUrl) return;
    void navigator.clipboard.writeText(dynamicQrUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <Sheet open={!!receiptId} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l-0 p-0 sm:p-6 shadow-2xl">
          <SheetHeader className="p-6 sm:p-0 mb-6 bg-white sm:bg-transparent border-b sm:border-0 sticky top-0 z-10">
            <SheetTitle className="text-xl">Receipt Details</SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="p-6 sm:p-0 space-y-6">
              <Skeleton className="h-[200px] w-full rounded-[24px]" />
              <Skeleton className="h-[400px] w-full rounded-[24px]" />
            </div>
          ) : !receipt ? (
            <div className="p-6 sm:p-0 flex items-center justify-center h-full text-zinc-500">
              Receipt not found or failed to load.
            </div>
          ) : (
            <div className="flex flex-col items-center w-full h-full sm:p-4 overflow-auto overscroll-contain gap-4 px-6 sm:px-0 pb-6">
              {dynamicQrUrl ? (
                <div className="w-full max-w-[380px] min-w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Receipt link
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={dynamicQrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 truncate font-mono text-xs text-blue-600 hover:underline"
                      title={dynamicQrUrl}
                    >
                      {dynamicQrUrl}
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 px-2"
                      asChild
                    >
                      <a
                        href={dynamicQrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3.5" />
                        Open
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 px-2"
                      onClick={copyReceiptLink}
                    >
                      {copied ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="w-full max-w-[380px] min-w-[320px] flex flex-col filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
                <div
                  className="bg-white text-zinc-900 w-full rounded-t-[20px] p-8 pb-6 relative transition-all"
                  style={{
                    background:
                      "radial-gradient(circle at bottom left, transparent 12px, #ffffff 12.5px) top left / 51% 100% no-repeat, radial-gradient(circle at bottom right, transparent 12px, #ffffff 12.5px) top right / 51% 100% no-repeat",
                  }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-start gap-3">
                      <BrandLogoImage
                        url={receipt.retailerLogoUrl}
                        alt={`${receipt.retailerName?.trim() || receipt.store.name} logo`}
                        className="shrink-0 rounded-md object-contain ring-1 ring-zinc-200"
                        style={{
                          width: RECEIPT_LOGO_SLOT_PX,
                          height: RECEIPT_LOGO_SLOT_PX,
                        }}
                      />
                      <div className="flex flex-col min-w-0">
                        <h2 className="text-xl font-bold leading-tight truncate">
                          {receipt.retailerName?.trim() || receipt.store.name}
                        </h2>
                        {receipt.retailerName?.trim() &&
                        receipt.store.name.trim() &&
                        receipt.retailerName.trim() !==
                          receipt.store.name.trim() ? (
                          <p className="text-sm text-zinc-500 truncate">
                            {receipt.store.name}
                          </p>
                        ) : null}
                        {receipt.store.phone ? (
                          <p className="text-sm text-zinc-500">
                            {receipt.store.phone}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right text-xs text-zinc-500 shrink-0">
                      <div className="font-medium text-zinc-800">
                        {receipt.receiptNumber}
                      </div>
                      <div>{formatDate(receipt.date)}</div>
                    </div>
                  </div>

                  {receipt.customer ? (
                    <div className="mb-6 text-sm">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 mb-1">
                        Customer
                      </div>
                      <div className="font-semibold">{receipt.customer.name}</div>
                      {receipt.customer.phone ? (
                        <div className="text-zinc-500">
                          {receipt.customer.phone}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="space-y-4 mb-6">
                    {receipt.items.map((item, index) => {
                      const unit = parseFloat(item.unitPrice);
                      const original = parseFloat(
                        item.originalPrice ?? item.unitPrice,
                      );
                      const discounted = isLineItemDiscounted(original, unit);
                      return (
                        <div key={item.id} className="flex gap-3 text-sm">
                          <div className="w-5 text-zinc-400">{index + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold truncate">
                                {item.name}
                              </span>
                              <span className="font-semibold shrink-0">
                                {formatPrice(item.lineTotal)} {receipt.currency}
                              </span>
                            </div>
                            {item.detail ? (
                              <div className="text-zinc-500 text-xs">
                                {item.detail}
                              </div>
                            ) : null}
                            {discounted ? (
                              <div className="text-xs text-zinc-500 space-y-0.5 pt-1">
                                <div>
                                  Original: {formatPrice(String(original))}{" "}
                                  {receipt.currency}
                                </div>
                                <div>
                                  You Paid: {formatPrice(item.unitPrice)}{" "}
                                  {receipt.currency}
                                </div>
                                {item.discountReason ? (
                                  <p className="pt-0.5 text-zinc-400">
                                    Reason:{" "}
                                    {discountReasonLabel(item.discountReason)}
                                  </p>
                                ) : null}
                              </div>
                            ) : (
                              <div className="text-zinc-400 text-xs">
                                {item.quantity} x {formatPrice(item.unitPrice)}{" "}
                                {receipt.currency}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-zinc-100/80 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold tracking-tight">
                        {formatPrice(receipt.total)} {receipt.currency}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-zinc-600 mb-1">
                      <span>Amount paid</span>
                      <span className="font-medium">
                        {formatPrice(receipt.amountPaid ?? receipt.total)}{" "}
                        {receipt.currency}
                      </span>
                    </div>
                    {balanceDue > 0 ? (
                      <div className="flex justify-between text-xs text-zinc-600 mb-1">
                        <span>Balance due</span>
                        <span className="font-semibold text-amber-700">
                          {formatPrice(receipt.balanceDue)} {receipt.currency}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-xs text-zinc-600 mb-1">
                      <span>Payment status</span>
                      <span className="font-semibold">
                        {formatReceiptPaymentStatusLabel(
                          receipt.paymentStatus ?? "paid_in_full",
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-600">
                      <span>Payment method</span>
                      <span className="font-medium">
                        {formatPaymentMethodLabel(receipt.paymentMethod)}
                      </span>
                    </div>
                  </div>

                  {receipt.payments && receipt.payments.length > 0 ? (
                    <div className="mb-6 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Payment history
                      </div>
                      <div className="space-y-2">
                        {receipt.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex justify-between gap-3 text-xs border border-zinc-100 rounded-md px-3 py-2"
                          >
                            <div>
                              <div className="font-medium text-zinc-800">
                                {formatPrice(payment.amount)} {receipt.currency}
                              </div>
                              <div className="text-zinc-500">
                                {formatPaymentMethodLabel(payment.paymentMethod)}
                                {payment.note ? ` · ${payment.note}` : ""}
                              </div>
                            </div>
                            <div className="text-zinc-400 shrink-0">
                              {format(new Date(payment.createdAt), "MMM d, yyyy")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {canCollectPayment ? (
                    <div className="mb-6 flex flex-col gap-2">
                      <Button type="button" onClick={openRecordDialog}>
                        Record payment
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={openSettleDialog}
                      >
                        Mark as paid in full
                      </Button>
                    </div>
                  ) : null}

                  <div className="flex items-start gap-4 mb-8 text-left">
                    <div className="flex-1 pt-1">
                      {receipt.returnPolicy ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-blue-600">
                            <RotateCcw size={12} strokeWidth={2.5} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Return Policy
                            </span>
                          </div>
                          <div className="text-sm font-semibold leading-snug text-zinc-800">
                            <span className="text-zinc-500">Deadline:</span>{" "}
                            {receipt.returnDeadline
                              ? formatDate(receipt.returnDeadline)
                              : "N/A"}
                          </div>
                          {receipt.marketingText && (
                            <p className="text-[10px] text-zinc-500 italic mt-2 border-t border-zinc-200 pt-2">
                              &ldquo;{receipt.marketingText}&rdquo;
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold leading-snug text-zinc-800">
                            {receipt.marketingText}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-2 border border-zinc-200 rounded-lg bg-white shrink-0">
                      <QRCodeSVG
                        value={dynamicQrUrl}
                        size={80}
                        level="M"
                        fgColor="#18181b"
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex justify-between items-center border-t border-zinc-100">
                    <div className="text-xs text-zinc-500 font-medium">
                      Status
                    </div>
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                        receipt.status === "issued"
                          ? "bg-zinc-100 text-zinc-900"
                          : receipt.status === "returned"
                            ? "bg-red-100 text-red-700"
                            : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {receipt.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Enter the amount received against the outstanding balance
              {receipt
                ? ` of ${formatPrice(receipt.balanceDue)} ${receipt.currency}`
                : ""}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                min={0.01}
                step="0.01"
                max={balanceDue || undefined}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-note">Note (optional)</Label>
              <Input
                id="payment-note"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="e.g. Second installment"
              />
            </div>
            {actionError ? (
              <p className="text-sm text-destructive">{actionError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRecordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                recordMutation.isPending ||
                !(parseFloat(paymentAmount) > 0)
              }
              onClick={() => recordMutation.mutate()}
            >
              {recordMutation.isPending ? "Saving…" : "Save payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as paid in full</DialogTitle>
            <DialogDescription>
              This will clear the remaining balance
              {receipt
                ? ` of ${formatPrice(receipt.balanceDue)} ${receipt.currency}`
                : ""}{" "}
              and set payment status to Paid in Full.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settle-note">Note (optional)</Label>
              <Input
                id="settle-note"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
            {actionError ? (
              <p className="text-sm text-destructive">{actionError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSettleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={settleMutation.isPending}
              onClick={() => settleMutation.mutate()}
            >
              {settleMutation.isPending ? "Updating…" : "Mark paid in full"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
