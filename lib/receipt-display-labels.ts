import type { PaymentMethodValue } from "@/lib/payment-methods";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payment-methods";

const paymentLabelByValue = Object.fromEntries(
  PAYMENT_METHOD_OPTIONS.map((o) => [o.value, o.label]),
) as Record<PaymentMethodValue, string>;

/** Human-readable label for API `payment_method` enum (e.g. on public receipt page). */
export function formatPaymentMethodLabel(value: string | undefined | null): string {
  if (!value) return "—";
  return paymentLabelByValue[value as PaymentMethodValue] ?? value.replace(/_/g, " ");
}

const RECEIPT_STATUS_LABELS: Record<string, string> = {
  issued: "Issued",
  voided: "Voided",
  returned: "Returned",
};

export function formatReceiptStatusLabel(value: string | undefined | null): string {
  if (!value) return "—";
  return RECEIPT_STATUS_LABELS[value] ?? value.replace(/_/g, " ");
}
