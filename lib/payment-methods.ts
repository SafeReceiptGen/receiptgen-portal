/** Backend `payment_method` enum values (Express / Postgres). */
export const PAYMENT_METHOD_VALUES = [
  "cash",
  "mobile_money",
  "card",
  "bank_transfer",
  "wallet",
  "check",
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHOD_VALUES)[number];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethodValue; label: string }[] =
  [
    { value: "cash", label: "Cash" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "card", label: "Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "wallet", label: "Wallet" },
    { value: "check", label: "Check" },
  ];

export function isPaymentMethodValue(v: string): v is PaymentMethodValue {
  return (PAYMENT_METHOD_VALUES as readonly string[]).includes(v);
}
