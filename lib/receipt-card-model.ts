import { addDays, startOfDay } from "date-fns";
import type { ReceiptData } from "@/types";
import type { ReceiptForReturn } from "@/types/returns";

export type ReceiptCardItem = {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  price: number;
};

export type ReceiptCardModel = {
  retailerName: string;
  storeLocation?: string;
  retailerLogoUrl?: string | null;
  storePhone: string;
  receiptNumber: string;
  purchasedAt: string;
  customerName: string;
  items: ReceiptCardItem[];
  currency: string;
  paymentMethod: string;
  status?: string;
  returnWindow: string;
  returnDeadline?: string | null;
  returnCondition: string;
  refundType: string;
  marketingText?: string;
};

/**
 * Parses return window labels like "7 days" / "14 days".
 * Returns null for "No returns" or unparseable values.
 */
export function parseReturnWindowDays(windowStr: string): number | null {
  if (!windowStr || windowStr.toLowerCase().includes("no return")) {
    return null;
  }
  const match = windowStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Computes an ISO return deadline from purchase date + window label when the
 * API has not already provided one (builder preview / guest exports).
 */
export function computeReturnDeadline(
  purchasedAt: string,
  returnWindow: string,
  customReturnWindow?: string,
): string | null {
  const windowLabel =
    returnWindow === "Custom" ? (customReturnWindow ?? "") : returnWindow;
  const days = parseReturnWindowDays(windowLabel);
  if (days == null || days <= 0) return null;
  try {
    return addDays(startOfDay(new Date(purchasedAt)), days).toISOString();
  } catch {
    return null;
  }
}

export function receiptForReturnToCardModel(
  receipt: ReceiptForReturn,
): ReceiptCardModel {
  return {
    retailerName: receipt.retailerName?.trim() || receipt.storeName,
    storeLocation: receipt.storeLocation,
    retailerLogoUrl: receipt.retailerLogoUrl,
    storePhone: receipt.storePhone,
    receiptNumber: receipt.receiptNumber,
    purchasedAt: receipt.purchasedAt,
    customerName: receipt.customerName,
    items: receipt.items.map((item) => ({
      id: item.id,
      name: item.name,
      detail: item.detail ?? "",
      quantity: item.quantity,
      price: item.price,
    })),
    currency: receipt.currency,
    paymentMethod: receipt.paymentMethod,
    status: receipt.status,
    returnWindow: receipt.returnWindow,
    returnDeadline: receipt.returnDeadline,
    returnCondition: receipt.returnCondition,
    refundType: receipt.refundType,
  };
}

export function receiptDataToCardModel(data: ReceiptData): ReceiptCardModel {
  const returnWindowDisplay =
    data.returnWindow === "Custom"
      ? data.customReturnWindow || data.returnWindow
      : data.returnWindow;

  return {
    retailerName: data.storeName,
    storeLocation: data.storeLocation,
    retailerLogoUrl: data.logoUrl || null,
    storePhone: data.storePhone,
    receiptNumber: data.receiptNumber,
    purchasedAt: data.date,
    customerName: data.customerName,
    items: data.items.map((item) => ({
      id: item.id,
      name: item.name,
      detail: item.detail ?? "",
      quantity: item.quantity,
      price: item.price,
    })),
    currency: data.currency,
    paymentMethod: data.paymentMethod,
    status: data.status,
    returnWindow: returnWindowDisplay,
    returnDeadline:
      data.returnDeadline ??
      computeReturnDeadline(
        data.date,
        data.returnWindow,
        data.customReturnWindow,
      ),
    returnCondition: data.returnCondition,
    refundType: data.refundType,
    marketingText: data.marketingText,
  };
}
