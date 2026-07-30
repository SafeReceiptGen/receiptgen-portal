export enum currencyCodeEnum {
  "GHS",
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "KES",
  "ZAR",
}

export enum paymentMethodEnum {
  "cash",
  "mobile_money",
  "card",
  "bank_transfer",
  "wallet",
  "check",
}

export enum returnWindowEnum {
  "none",
  "3_days",
  "7_days",
  "14_days",
  "30_days",
  "custom",
}

export enum returnConditionEnum {
  "unused",
  "original_packaging",
  "any_condition",
  "defective_only",
}

export enum refundTypeEnum {
  "full_refund",
  "partial_refund",
  "store_credit",
  "exchange_only",
}

export enum returnStatusEnum {
  "pending",
  "approved",
  "rejected",
  "completed",
  "cancelled",
}

export enum receiptStatusEnum {
  "issued",
  "voided",
  "returned",
}

export enum receiptPaymentStatusEnum {
  "unpaid",
  "partially_paid",
  "paid_in_full",
}

export enum subscriptionTierEnum {
  "free",
  "basic",
  "pro",
  "enterprise",
}
