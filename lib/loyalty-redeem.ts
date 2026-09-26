import { roundMoney } from "@/lib/receipt-payment";

export function itemsSubtotal(
  items: { price: number; quantity: number }[],
): number {
  return roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
}

export function payableTotal(
  itemsTotal: number,
  loyaltyDiscount = 0,
): number {
  return roundMoney(Math.max(0, itemsTotal - Math.max(0, loyaltyDiscount)));
}

export function draftLoyaltyDiscount(
  redeemRewards: boolean | undefined,
  loyaltyDiscount: number | undefined,
): number {
  if (!redeemRewards) return 0;
  return roundMoney(Math.max(0, loyaltyDiscount ?? 0));
}

export function draftPayableTotal(input: {
  items: { price: number; quantity: number }[];
  redeemRewards?: boolean;
  loyaltyDiscount?: number;
}): number {
  return payableTotal(
    itemsSubtotal(input.items),
    draftLoyaltyDiscount(input.redeemRewards, input.loyaltyDiscount),
  );
}
