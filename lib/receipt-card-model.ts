import { addDays, startOfDay } from "date-fns";
import type { ReceiptData } from "@/types";
import type { ReceiptForReturn } from "@/types/returns";
import type { ReceiptPaymentStatus } from "@/lib/receipt-payment";
import {
  balanceDueFrom,
  deriveReceiptPaymentStatus,
  roundMoney,
} from "@/lib/receipt-payment";

export type ReceiptCardItem = {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  price: number;
  originalPrice: number;
};

export type ReceiptCardPayment = {
  id: string;
  amount: number;
  paymentMethod: string;
  reference?: string | null;
  note?: string | null;
  createdAt: string;
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
  amountPaid: number;
  balanceDue: number;
  paymentStatus: ReceiptPaymentStatus;
  payments: ReceiptCardPayment[];
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

function provisionalPayments(
  amountPaid: number,
  paymentMethod: string,
  purchasedAt: string,
  existing?: ReceiptCardPayment[],
): ReceiptCardPayment[] {
  if (existing && existing.length > 0) return existing;
  if (amountPaid <= 0) return [];
  return [
    {
      id: "provisional-initial-payment",
      amount: amountPaid,
      paymentMethod,
      reference: null,
      note: null,
      createdAt: purchasedAt,
    },
  ];
}

export function receiptForReturnToCardModel(
  receipt: ReceiptForReturn,
): ReceiptCardModel {
  const total = receipt.total;
  const amountPaid = roundMoney(receipt.amountPaid ?? total);
  const paymentStatus =
    receipt.paymentStatus ?? deriveReceiptPaymentStatus(total, amountPaid);
  const balanceDue =
    receipt.balanceDue ?? balanceDueFrom(total, amountPaid);

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
      originalPrice: item.originalPrice ?? item.price,
    })),
    currency: receipt.currency,
    paymentMethod: receipt.paymentMethod,
    amountPaid,
    balanceDue,
    paymentStatus,
    payments: provisionalPayments(
      amountPaid,
      receipt.paymentMethod,
      receipt.purchasedAt,
      receipt.payments,
    ),
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

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const amountPaid = roundMoney(data.amountPaid ?? subtotal);
  const paymentStatus = deriveReceiptPaymentStatus(subtotal, amountPaid);
  const balanceDue = balanceDueFrom(subtotal, amountPaid);

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
      originalPrice: item.originalPrice ?? item.price,
    })),
    currency: data.currency,
    paymentMethod: data.paymentMethod,
    amountPaid,
    balanceDue,
    paymentStatus,
    payments: provisionalPayments(
      amountPaid,
      data.paymentMethod,
      data.date,
      data.payments,
    ),
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
