import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { VerifiedReceipt } from "./api";
import { ReceiptForReturn } from "@/types/returns";
import { differenceInCalendarDays } from "date-fns";
import { portalPublicOrigin } from "./portal-public-url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Mapping Helpers ─────────────────────────────────────────────────────────

/**
 * Maps the verified receipt from the public API to the ReceiptForReturn shape
 * used by all ReturnFlow components. Store policy blurbs stay generic unless
 * the API adds store-specific policy text later.
 */
export function mapToReceiptForReturn(
  receipt: VerifiedReceipt,
  token: string,
): ReceiptForReturn {
  // Compute a human-readable return window from the deadline
  let returnWindow = "No returns";
  let isReturnable = false;

  if (receipt.returnDeadline && receipt.status !== "voided") {
    const deadlineDate = new Date(receipt.returnDeadline);
    const purchaseDate = new Date(receipt.date);
    const windowDays = differenceInCalendarDays(deadlineDate, purchaseDate);

    if (windowDays > 0) {
      returnWindow = `${windowDays} days`;
    }
    isReturnable = deadlineDate > new Date();
  }

  return {
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    retailerName: receipt.retailerName?.trim() || undefined,
    storeLocation: receipt.storeName.trim() || undefined,
    // Brand for customer-facing identity; fall back to location when brand is absent.
    storeName: receipt.retailerName?.trim() || receipt.storeName,
    retailerLogoUrl: receipt.retailerLogoUrl ?? null,
    storePhone: receipt.storePhone?.trim() ?? "",
    customerName: receipt.customerName?.trim() ?? "",
    items: receipt.items.map((item) => ({
      id: item.id,
      name: item.name,
      detail: item.detail ?? "",
      quantity: item.quantity,
      price: parseFloat(item.unitPrice),
      originalPrice: parseFloat(item.originalPrice ?? item.unitPrice),
      selected: false,
    })),
    currency: receipt.currency,
    subtotal: receipt.items.reduce(
      (sum, i) => sum + parseFloat(i.lineTotal),
      0,
    ),
    total: parseFloat(receipt.total),
    paymentMethod: receipt.paymentMethod,
    status: receipt.status,
    purchasedAt: receipt.date,
    returnWindow,
    returnDeadline: receipt.returnDeadline,
    returnCondition: "See store policy",
    refundType: "See store policy",
    isReturnable,
    qrUrl: `${portalPublicOrigin()}/receipt/${token}`,
  };
}
