"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { ReceiptForReturn } from "@/types/returns";
import { ReceiptCard } from "@/components/receipt/receipt-card";
import { ReceiptDocumentsSwitcher } from "@/components/receipt/receipt-documents-switcher";
import { formatCurrency } from "@/lib/currency";
import { formatPaymentLedgerDetails } from "@/lib/payment-ledger-display";
import { formatReceiptPaymentStatusLabel } from "@/lib/receipt-display-labels";
import {
  defaultReceiptDocumentKind,
  documentsFromReceiptForReturn,
  isInstallmentReceipt,
  liveOutstandingBalance,
  receiptForReturnToDocumentCardModel,
  type ReceiptDocumentKind,
} from "@/lib/receipt-documents";

type PublicReceiptViewProps = {
  receipt: ReceiptForReturn;
};

export function PublicReceiptView({ receipt }: PublicReceiptViewProps) {
  const documents = useMemo(
    () => documentsFromReceiptForReturn(receipt),
    [receipt],
  );
  const [kind, setKind] = useState<ReceiptDocumentKind>(() =>
    defaultReceiptDocumentKind(documents),
  );

  const selectedKind = documents.some((doc) => doc.kind === kind)
    ? kind
    : defaultReceiptDocumentKind(documents);

  const cardModel = useMemo(
    () => receiptForReturnToDocumentCardModel(receipt, selectedKind),
    [receipt, selectedKind],
  );

  const installment = isInstallmentReceipt(
    receipt.total,
    receipt.amountPaid ?? 0,
  );
  const outstanding = liveOutstandingBalance(receipt);
  const showOriginalAccount =
    installment && selectedKind === "original";
  const showOutstandingCallout =
    showOriginalAccount &&
    outstanding > 0 &&
    receipt.paymentStatus !== "paid_in_full";
  const payments = receipt.payments ?? [];

  return (
    <div className="space-y-4">
      <ReceiptDocumentsSwitcher
        documents={documents}
        value={selectedKind}
        onChange={setKind}
      />

      {showOutstandingCallout ? (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="font-semibold">Outstanding balance</p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-100/80">
            The Original receipt stays as issued. A Final receipt will appear here once the balance is cleared.
          </p>
        </div>
      ) : null}

      <ReceiptCard model={cardModel} />

      {showOriginalAccount ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
            Account / payments
          </div>
          <div className="mb-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 dark:text-white/50">
                Live balance due
              </span>
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                {formatCurrency(outstanding, receipt.currency)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 dark:text-white/50">
                Payment status
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatReceiptPaymentStatusLabel(
                  receipt.paymentStatus ?? "paid_in_full",
                )}
              </span>
            </div>
          </div>

          {payments.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
                Payment history
              </div>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between gap-3 rounded-md border border-slate-100 px-3 py-2 text-xs dark:border-white/10"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 dark:text-white">
                        {formatCurrency(payment.amount, receipt.currency)}
                      </div>
                      <div className="text-slate-500 dark:text-white/50">
                        {formatPaymentLedgerDetails(payment)}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-slate-400 dark:text-white/40">
                      <div>
                        {format(new Date(payment.createdAt), "MMM d, yyyy")}
                      </div>
                      <div>
                        {format(new Date(payment.createdAt), "h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
