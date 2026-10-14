// ─── ReturnFlow Type Definitions ───────────────────────────────────────────────
// Consistent with the existing types.ts pattern: interfaces + constants + enums.

export type ReturnStatus =
  | "PICKUP_SCHEDULED"
  | "PENDING"
  | "COLLECTED"
  | "IN_TRANSIT"
  | "WITH_RETAILER"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED"
  | "REFUND_COMPLETED"
  | "EXCHANGE_COMPLETED"
  | "COMPLETED";

export type ReturnReason = "DEFECTIVE" | "WRONG_ITEM" | "CHANGED_MIND" | "DAMAGED_IN_DELIVERY" | "OTHER";

export type RefundMethod = "ORIGINAL_PAYMENT" | "STORE_CREDIT" | "BANK_TRANSFER" | "MOBILE_MONEY";

export type LogisticsMethod = "HOME_PICKUP" | "DROP_OFF" | "RETAILER_DROPOFF";

export type ApiLogisticsMethod = "home_pickup" | "drop_off" | "retailer_dropoff";

export interface ReturnItem {
  id: string;
  name: string;
  detail: string;
  /** Units purchased on the receipt (max returnable per line). */
  quantity: number;
  /** Amount charged (sale / unit price). */
  price: number;
  /** Listed price before discount; equals price when not discounted. */
  originalPrice?: number;
  selected: boolean;
  /** Units the customer is returning; required when more than one unit can still be returned. */
  returnQuantity?: number;
  /** Units still available to return. Omitted means the full purchased quantity. */
  availableQuantity?: number;
  role?: "sale" | "remaining" | "replacement";
}

/** Units that can still be requested on this line. */
export function returnableUnits(
  item: Pick<ReturnItem, "quantity" | "availableQuantity">,
): number {
  const cap = item.availableQuantity ?? item.quantity;
  if (!Number.isFinite(cap)) return Math.max(0, Math.trunc(item.quantity));
  return Math.max(0, Math.min(Math.trunc(item.quantity), Math.trunc(cap)));
}

export interface PudoPoint {
  id: string;
  name: string;
  address: string;
}

export interface PickupAddress {
  /** Primary free-text address (Bolt-style) */
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface ParcelDetails {
  description: string;
  /** Older returns only */
  packageCount?: number;
  weightKg?: number;
}

export interface ReturnLogistics {
  method: LogisticsMethod;
  pudoPointId?: string;
  fee: number;
  timeSlot: string;
  phoneNumber: string;
  phoneCountry: string;
  pickupAddress?: PickupAddress;
  parcel?: ParcelDetails;
}

export interface ReturnActivityLog {
  id: string;
  action: string;
  performedBy: string;
  notes?: string;
  createdAt: string; // ISO string
}

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  receiptId: string;
  /** Public receipt link segment; prefer over receiptId (UUID) for /receipt/[token]. */
  receiptQrToken?: string;
  retailerName: string;
  retailerLogo?: string;
  /** Branch name for retailer drop-off. */
  storeName?: string;
  /** Branch address for retailer drop-off. */
  storeAddress?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: ReturnItem[];
  returnReason: ReturnReason;
  reasonDescription?: string;
  photoUrls: string[];
  status: ReturnStatus;
  isEligible: boolean;
  logistics: ReturnLogistics;
  refundAmount: number;
  refundMethod?: RefundMethod;
  /** Raw API refund_type (e.g. exchange_only) for customer copy. */
  refundTypeCode?: string;
  rejectionReason?: string;
  currency: string;
  requestedAt: string; // ISO string
  collectedAt?: string;
  inTransitAt?: string;
  withRetailerAt?: string;
  reviewedAt?: string;
  resolvedAt?: string;
  activityLog: ReturnActivityLog[];
  adjustmentReceipt?: {
    id: string;
    receiptNumber: string;
    qrCodeToken: string;
    adjustmentKind: "return" | "exchange";
  } | null;
}

// Receipt type for the return flow (viewing a receipt before requesting a return)
export interface ReceiptForReturn {
  id: string;
  receiptNumber: string;
  /** Primary display name on receipts — brand / trading name when available. */
  storeName: string;
  /** Brand / trading name (`retailers.name`). */
  retailerName?: string;
  /** Per-location / branch name (`stores.name`). */
  storeLocation?: string;
  /** Retailer-wide logo; null/undefined when not set. */
  retailerLogoUrl?: string | null;
  storePhone: string;
  storeLogo?: string;
  customerName: string;
  /** Present when receipt was created with customer phone (dashboard flow). */
  customerPhone?: string;
  items: ReturnItem[];
  currency: string;
  subtotal: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentStatus?: "unpaid" | "partially_paid" | "paid_in_full";
  paymentMethod: string;
  /** Append-only payment ledger (newest first). */
  payments?: {
    id: string;
    amount: number;
    paymentMethod: string;
    reference?: string | null;
    note?: string | null;
    createdAt: string;
  }[];
  /** Receipt lifecycle from API (e.g. issued, voided); optional for locally built previews */
  status?: string;
  purchasedAt: string; // ISO string
  loyalty?: {
    pointsEarned: number;
    pointsRedeemed: number;
    pointsBalance: number;
    rewardThreshold: number;
    rewardAmount: string;
    pointsToGo: number;
    discountApplied: string;
  } | null;
  loyaltyDiscount?: number;
  adjustment?: {
    kind: "return" | "exchange" | null;
    refundAmount: string;
    additionalPayment: string;
    originalReceipt: {
      id: string;
      receiptNumber: string;
      qrCodeToken: string;
    } | null;
    adjustments: Array<{
      id: string;
      receiptNumber: string;
      qrCodeToken: string;
      adjustmentKind: "return" | "exchange";
      refundAmount: string;
      additionalPayment: string;
      total: string;
    }>;
    returnedItems: Array<{
      name: string;
      quantity: number;
      amount: string;
    }>;
  } | null;
  returnWindow: string;
  /** ISO deadline from API; purchase date + policy window days */
  returnDeadline?: string | null;
  returnCondition: string;
  refundType: string;
  isReturnable: boolean;
  qrUrl: string;
}

// ─── Display Helpers ──────────────────────────────────────────────────────────

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE: "Defective",
  WRONG_ITEM: "Wrong Item",
  CHANGED_MIND: "Changed Mind",
  DAMAGED_IN_DELIVERY: "Damaged in Delivery",
  OTHER: "Other",
};

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  PICKUP_SCHEDULED: "Pickup scheduled",
  PENDING: "Pending review",
  COLLECTED: "Collected",
  IN_TRANSIT: "In transit",
  WITH_RETAILER: "Item received",
  APPROVED: "Approved — refund pending",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  REFUNDED: "Refund processed",
  REFUND_COMPLETED: "Refund processed",
  EXCHANGE_COMPLETED: "Exchange processed",
  COMPLETED: "Refund processed",
};

export const REFUND_METHOD_LABELS: Record<RefundMethod, string> = {
  ORIGINAL_PAYMENT: "Original Payment Method",
  STORE_CREDIT: "Store Credit",
  BANK_TRANSFER: "Bank Transfer",
  MOBILE_MONEY: "Mobile Money",
};

export const LOGISTICS_METHOD_LABELS: Record<LogisticsMethod, string> = {
  HOME_PICKUP: "Home Pick-Up",
  DROP_OFF: "PUDO",
  RETAILER_DROPOFF: "Retailer Drop-Off",
};

export function logisticsServiceFee(method: LogisticsMethod): number {
  switch (method) {
    case "HOME_PICKUP":
      return 50;
    case "DROP_OFF":
      return 30;
    case "RETAILER_DROPOFF":
      return 0;
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function logisticsMethodToApi(method: LogisticsMethod): ApiLogisticsMethod {
  switch (method) {
    case "HOME_PICKUP":
      return "home_pickup";
    case "DROP_OFF":
      return "drop_off";
    case "RETAILER_DROPOFF":
      return "retailer_dropoff";
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export const RETURN_STATUS_STEPS: ReturnStatus[] = [
  "PENDING",
  "COLLECTED",
  "IN_TRANSIT",
  "WITH_RETAILER",
];

export const TIME_SLOTS = [
  "9:00 AM - 12:00 PM",
  "12:00 PM - 3:00 PM",
  "3:00 PM - 6:00 PM",
  "6:00 PM - 9:00 PM",
];
