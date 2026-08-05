export const DISCOUNT_REASONS = [
  {
    value: "customer_negotiation",
    label: "Customer Negotiation",
  },
  {
    value: "promotion_sale",
    label: "Promotion/Sale",
  },
  {
    value: "loyalty_customer",
    label: "Loyalty Customer",
  },
  {
    value: "damaged_open_box",
    label: "Damaged/Open Box",
  },
  {
    value: "other",
    label: "Other",
  },
] as const;

export type DiscountReason = (typeof DISCOUNT_REASONS)[number]["value"];

export function discountReasonLabel(
  reason: DiscountReason | string | null | undefined,
): string {
  if (!reason) return "";
  const match = DISCOUNT_REASONS.find((r) => r.value === reason);
  return match?.label ?? reason;
}

export function isLineItemDiscounted(
  originalPrice: number,
  salePrice: number,
): boolean {
  return Math.round(originalPrice * 100) > Math.round(salePrice * 100);
}

/** Line-item discount totals (unit prices × quantity). */
export function getLineItemDiscountTotals(
  originalUnitPrice: number,
  saleUnitPrice: number,
  quantity: number,
) {
  const qty = Math.max(0, quantity);
  return {
    originalTotal: originalUnitPrice * qty,
    paidTotal: saleUnitPrice * qty,
    savedTotal: (originalUnitPrice - saleUnitPrice) * qty,
  };
}
