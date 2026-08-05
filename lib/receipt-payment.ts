export type ReceiptPaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid_in_full";

export const moneyEquals = (a: number, b: number) =>
  Math.round(a * 100) === Math.round(b * 100);

export const roundMoney = (n: number) => Math.round(n * 100) / 100;

export function deriveReceiptPaymentStatus(
  total: number,
  amountPaid: number,
): ReceiptPaymentStatus {
  const paid = roundMoney(amountPaid);
  const receiptTotal = roundMoney(total);
  // Nothing owed (including free / zero-total receipts) is settled.
  if (moneyEquals(receiptTotal, 0) || moneyEquals(paid, receiptTotal) || paid >= receiptTotal) {
    return "paid_in_full";
  }
  if (moneyEquals(paid, 0)) return "unpaid";
  return "partially_paid";
}

export function balanceDueFrom(total: number, amountPaid: number): number {
  const status = deriveReceiptPaymentStatus(total, amountPaid);
  if (status === "paid_in_full") return 0;
  return roundMoney(Math.max(0, roundMoney(total) - roundMoney(amountPaid)));
}
