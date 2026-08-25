import type { ReceiptData } from "@/types";
import type { ReceiptForReturn } from "@/types/returns";
import type { ReceiptCardModel } from "@/lib/receipt-card-model";
import {
  receiptDataToCardModel,
  receiptForReturnToCardModel,
} from "@/lib/receipt-card-model";
import type { ReceiptPaymentStatus } from "@/lib/receipt-payment";
import {
  balanceDueFrom,
  deriveReceiptPaymentStatus,
  liveAmountPaid,
  moneyEquals,
  roundMoney,
} from "@/lib/receipt-payment";

export type ReceiptDocumentKind = "original" | "final" | "standard";

export type ReceiptDocumentDescriptor = {
  kind: ReceiptDocumentKind;
  label: string;
};

/** True when the receipt was issued with a partial / unpaid balance. */
export function isInstallmentReceipt(
  total: number,
  amountPaidAtIssue: number,
): boolean {
  const receiptTotal = roundMoney(total);
  const paid = roundMoney(amountPaidAtIssue);
  if (moneyEquals(receiptTotal, 0)) return false;
  return paid < receiptTotal && !moneyEquals(paid, receiptTotal);
}

export function listReceiptDocuments(input: {
  total: number;
  amountPaidAtIssue: number;
  paymentStatus: ReceiptPaymentStatus;
}): ReceiptDocumentDescriptor[] {
  if (!isInstallmentReceipt(input.total, input.amountPaidAtIssue)) {
    return [{ kind: "standard", label: "Receipt" }];
  }

  const docs: ReceiptDocumentDescriptor[] = [
    { kind: "original", label: "Original" },
  ];
  if (input.paymentStatus === "paid_in_full") {
    docs.push({ kind: "final", label: "Final" });
  }
  return docs;
}

/** Prefer Final when available; otherwise the first listed document. */
export function defaultReceiptDocumentKind(
  documents: ReceiptDocumentDescriptor[],
): ReceiptDocumentKind {
  const finalDoc = documents.find((doc) => doc.kind === "final");
  if (finalDoc) return "final";
  return documents[0]?.kind ?? "standard";
}

export function receiptDocumentFilename(
  receiptNumber: string,
  kind: ReceiptDocumentKind,
): string {
  const base = `SafeReceipt-${receiptNumber}`;
  switch (kind) {
    case "original":
      return `${base}-Original.pdf`;
    case "final":
      return `${base}-Final.pdf`;
    case "standard":
      return `${base}.pdf`;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function receiptDocumentImageFilename(
  receiptNumber: string,
  kind: ReceiptDocumentKind,
): string {
  const base = `SafeReceipt-${receiptNumber}`;
  switch (kind) {
    case "original":
      return `${base}-Original.png`;
    case "final":
      return `${base}-Final.png`;
    case "standard":
      return `${base}.png`;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function receiptDataSubtotal(data: ReceiptData): number {
  return roundMoney(
    data.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
}

/**
 * Rewrites payment fields on ReceiptData for a document presentation.
 * Does not mutate the live AR record — presentation only.
 */
export function applyDocumentKindToReceiptData(
  data: ReceiptData,
  kind: ReceiptDocumentKind,
): ReceiptData {
  const total = receiptDataSubtotal(data);
  const issuePaid = roundMoney(data.amountPaid);

  switch (kind) {
    case "original": {
      const paymentStatus = deriveReceiptPaymentStatus(total, issuePaid);
      return {
        ...data,
        amountPaid: issuePaid,
        paymentStatus,
        balanceDue: balanceDueFrom(total, issuePaid),
        // Issue-only ledger: omit follow-up payments so the card/PDF stay frozen.
        payments: undefined,
      };
    }
    case "final": {
      const paid = liveAmountPaid(total, data.amountPaid, data.payments);
      return {
        ...data,
        amountPaid: paid,
        paymentStatus: "paid_in_full",
        balanceDue: 0,
      };
    }
    case "standard":
      return data;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function receiptDataToDocumentCardModel(
  data: ReceiptData,
  kind: ReceiptDocumentKind,
): ReceiptCardModel {
  return receiptDataToCardModel(applyDocumentKindToReceiptData(data, kind));
}

export function receiptForReturnToDocumentCardModel(
  receipt: ReceiptForReturn,
  kind: ReceiptDocumentKind,
): ReceiptCardModel {
  const total = roundMoney(receipt.total);
  const issuePaid = roundMoney(receipt.amountPaid ?? 0);

  switch (kind) {
    case "original": {
      const paymentStatus = deriveReceiptPaymentStatus(total, issuePaid);
      return receiptForReturnToCardModel({
        ...receipt,
        amountPaid: issuePaid,
        balanceDue: balanceDueFrom(total, issuePaid),
        paymentStatus,
        payments: undefined,
      });
    }
    case "final": {
      return receiptForReturnToCardModel({
        ...receipt,
        paymentStatus: "paid_in_full",
        balanceDue: 0,
      });
    }
    case "standard":
      return receiptForReturnToCardModel(receipt);
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function documentsFromReceiptForReturn(
  receipt: ReceiptForReturn,
): ReceiptDocumentDescriptor[] {
  return listReceiptDocuments({
    total: receipt.total,
    amountPaidAtIssue: receipt.amountPaid ?? 0,
    paymentStatus: receipt.paymentStatus ?? "paid_in_full",
  });
}

export function documentsFromReceiptData(
  data: ReceiptData,
): ReceiptDocumentDescriptor[] {
  const total = receiptDataSubtotal(data);
  return listReceiptDocuments({
    total,
    amountPaidAtIssue: data.amountPaid,
    paymentStatus:
      data.paymentStatus ??
      deriveReceiptPaymentStatus(
        total,
        liveAmountPaid(total, data.amountPaid, data.payments),
      ),
  });
}

/** Live outstanding balance for mid-payment callouts (not shown on Original). */
export function liveOutstandingBalance(receipt: {
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentStatus?: ReceiptPaymentStatus;
  payments?: { amount: number }[] | null;
}): number {
  if (receipt.paymentStatus === "paid_in_full") return 0;
  if (receipt.balanceDue !== undefined) {
    return roundMoney(Math.max(0, receipt.balanceDue));
  }
  const paid = liveAmountPaid(
    receipt.total,
    receipt.amountPaid,
    receipt.payments,
  );
  return balanceDueFrom(receipt.total, paid);
}
