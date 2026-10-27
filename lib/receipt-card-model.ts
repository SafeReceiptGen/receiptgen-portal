import { addDays, startOfDay } from "date-fns";
import type { ReceiptData } from "@/types";
import type { ReceiptForReturn } from "@/types/returns";
import type { ReceiptPaymentStatus } from "@/lib/receipt-payment";
import {
  draftLoyaltyDiscount,
  itemsSubtotal,
  payableTotal,
} from "@/lib/loyalty-redeem";
import { formatReceiptStatusLabel } from "@/lib/receipt-display-labels";
import {
  balanceDueFrom,
  deriveReceiptPaymentStatus,
  liveAmountPaid,
  roundMoney,
} from "@/lib/receipt-payment";

export type ReceiptCardItem = {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  price: number;
  originalPrice: number;
  role?: "sale" | "remaining" | "replacement" | null;
};

export type ReceiptCardAdjustmentLine = {
  name: string;
  quantity: number;
  amount: number;
};

/** Set only on the adjustment receipt, not on the original sale. */
export type ReceiptCardAdjustment = {
  kind: "return" | "exchange";
  originalReceiptNumber: string;
  returned: ReceiptCardAdjustmentLine[];
  refundAmount: number;
  additionalPayment: number;
};

type AdjustmentSource = {
  kind: "return" | "exchange" | null;
  refundAmount: string;
  additionalPayment: string;
  originalReceipt: { receiptNumber: string } | null;
  adjustments?: Array<{ adjustmentKind: "return" | "exchange" }>;
  returnedItems: Array<{ name: string; quantity: number; amount: string }>;
} | null | undefined;

function moneyAmount(value: string): number {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function buildReceiptCardAdjustment(
  adjustment: AdjustmentSource,
): ReceiptCardAdjustment | null {
  if (!adjustment?.kind || !adjustment.originalReceipt) return null;
  return {
    kind: adjustment.kind,
    originalReceiptNumber: adjustment.originalReceipt.receiptNumber,
    returned: adjustment.returnedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      amount: moneyAmount(item.amount),
    })),
    refundAmount: moneyAmount(adjustment.refundAmount),
    additionalPayment: moneyAmount(adjustment.additionalPayment),
  };
}

export function receiptCardStatusLabel(
  status: string | null | undefined,
  adjustment: AdjustmentSource,
): string | null {
  if (!status || status === "issued") return null;
  if (status === "adjustment" && adjustment?.kind === "return") {
    return "Return receipt";
  }
  if (status === "adjustment" && adjustment?.kind === "exchange") {
    return "Exchange receipt";
  }
  if (
    status === "return_completed" &&
    adjustment?.adjustments?.[0]?.adjustmentKind === "exchange"
  ) {
    return "Completed — exchange processed";
  }
  return formatReceiptStatusLabel(status);
}

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
  loyaltyDiscount?: number;
  loyalty?: {
    pointsEarned: number;
    pointsRedeemed: number;
    pointsBalance: number;
    rewardThreshold: number;
    rewardAmount: string;
    pointsToGo: number;
    discountApplied: string;
  } | null;
  /** Null on a normal issued sale. */
  statusLabel: string | null;
  /** Set when this document is the return or exchange receipt. */
  adjustment: ReceiptCardAdjustment | null;
};

export function formatLoyaltyPoints(count: number): string {
  return `${count} ${count === 1 ? "Point" : "Points"}`;
}

export function formatNextReward(
  rewardThreshold: number,
  rewardAmount: string,
): string {
  const amount = Number(rewardAmount);
  const formatted = Number.isFinite(amount) ? amount.toFixed(2) : rewardAmount;
  return `${formatLoyaltyPoints(rewardThreshold)} = GHS ${formatted} Discount`;
}

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
  const amountPaid = liveAmountPaid(
    total,
    receipt.amountPaid,
    receipt.payments,
  );
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
      role: item.role ?? null,
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
    loyaltyDiscount: receipt.loyaltyDiscount ?? 0,
    loyalty: receipt.loyalty ?? null,
    statusLabel: receiptCardStatusLabel(receipt.status, receipt.adjustment),
    adjustment: buildReceiptCardAdjustment(receipt.adjustment),
  };
}

export function receiptDataToCardModel(data: ReceiptData): ReceiptCardModel {
  const returnWindowDisplay =
    data.returnWindow === "Custom"
      ? data.customReturnWindow || data.returnWindow
      : data.returnWindow;

  const itemsTotal = itemsSubtotal(data.items);
  const loyaltyDiscount = draftLoyaltyDiscount(
    data.redeemRewards ?? (data.loyaltyDiscount ?? 0) > 0,
    data.loyaltyDiscount,
  );
  const total = payableTotal(itemsTotal, loyaltyDiscount);
  const amountPaid = liveAmountPaid(total, data.amountPaid, data.payments);
  const paymentStatus =
    data.paymentStatus ?? deriveReceiptPaymentStatus(total, amountPaid);
  const balanceDue =
    data.balanceDue !== undefined
      ? roundMoney(Math.max(0, data.balanceDue))
      : balanceDueFrom(total, amountPaid);

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
      role: item.role ?? null,
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
    loyaltyDiscount,
    loyalty: data.loyalty ?? null,
    statusLabel: receiptCardStatusLabel(data.status, data.adjustment),
    adjustment: buildReceiptCardAdjustment(data.adjustment),
  };
}
