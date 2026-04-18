import type { PickupAddress } from "@/types/returns";

/**
 * Single-line display for pickup location (new + legacy API shapes).
 */
export function formatPickupAddressDisplay(pa: PickupAddress): string {
  const parts: string[] = [];
  if (pa.address?.trim()) parts.push(pa.address.trim());
  if (pa.landmark?.trim()) parts.push(pa.landmark.trim());
  return parts.join(" · ") || "—";
}
