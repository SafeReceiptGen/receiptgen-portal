import { queryOptions } from "@tanstack/react-query";
import { retailerApi } from "@/lib/api";

export const retailerQueryOptions = queryOptions({
  queryKey: ["retailer"] as const,
  queryFn: () => retailerApi.get().then((r) => r.retailer),
});

export const loyaltyQueryOptions = queryOptions({
  queryKey: ["retailer", "loyalty"] as const,
  queryFn: () => retailerApi.getLoyalty().then((r) => r.loyaltyProgram),
});

export function loyaltyRedeemOfferQueryOptions(
  phone: string,
  subtotal: number,
) {
  return queryOptions({
    queryKey: ["retailer", "loyalty", "redeem-offer", phone, subtotal] as const,
    queryFn: () =>
      retailerApi.getRedeemOffer(phone, subtotal).then((r) => r.offer),
    enabled: phone.trim().length >= 7 && subtotal > 0,
  });
}
