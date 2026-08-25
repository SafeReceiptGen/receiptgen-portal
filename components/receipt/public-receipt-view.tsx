"use client";

import { useMemo, useState } from "react";
import type { ReceiptForReturn } from "@/types/returns";
import { ReceiptCard } from "@/components/receipt/receipt-card";
import { ReceiptDocumentsSwitcher } from "@/components/receipt/receipt-documents-switcher";
import { formatCurrency } from "@/lib/currency";
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
  const showOutstandingCallout =
    installment &&
    selectedKind === "original" &&
    outstanding > 0 &&
    receipt.paymentStatus !== "paid_in_full";

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
    </div>
  );
}
