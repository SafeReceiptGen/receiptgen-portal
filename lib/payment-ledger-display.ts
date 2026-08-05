import { formatPaymentMethodLabel } from "@/lib/receipt-display-labels";

/** Builds the secondary line under a ledger amount: method · ref · note. */
export function formatPaymentLedgerDetails(payment: {
  paymentMethod: string;
  reference?: string | null;
  note?: string | null;
}): string {
  const parts = [formatPaymentMethodLabel(payment.paymentMethod)];
  const reference = payment.reference?.trim();
  const note = payment.note?.trim();
  if (reference) parts.push(`Ref ${reference}`);
  if (note) parts.push(note);
  return parts.join(" · ");
}
