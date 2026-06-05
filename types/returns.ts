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
  | "REFUNDED";

export type ReturnReason = "DEFECTIVE" | "WRONG_ITEM" | "CHANGED_MIND" | "DAMAGED_IN_DELIVERY" | "OTHER";

export type RefundMethod = "ORIGINAL_PAYMENT" | "STORE_CREDIT" | "BANK_TRANSFER" | "MOBILE_MONEY";

export type LogisticsMethod = "HOME_PICKUP" | "DROP_OFF";

export type RejectedAction = "SELL_TO_PLATFORM" | "RETURN_ITEMS" | "CLOSE_CASE";

export interface ReturnItem {
  id: string;
  name: string;
  detail: string;
  /** Units purchased on the receipt (max returnable per line). */
  quantity: number;
  price: number;
  selected: boolean;
  /** Units the customer is returning; required when `quantity` > 1 and line is selected. */
  returnQuantity?: number;
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
  rejectedAction?: RejectedAction;
  currency: string;
  requestedAt: string; // ISO string
  collectedAt?: string;
  inTransitAt?: string;
  withRetailerAt?: string;
  reviewedAt?: string;
  resolvedAt?: string;
  activityLog: ReturnActivityLog[];
}

// Receipt type for the return flow (viewing a receipt before requesting a return)
export interface ReceiptForReturn {
  id: string;
  receiptNumber: string;
  storeName: string;
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
  paymentMethod: string;
  /** Receipt lifecycle from API (e.g. issued, voided); optional for locally built previews */
  status?: string;
  purchasedAt: string; // ISO string
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
  PICKUP_SCHEDULED: "Pickup Scheduled",
  PENDING: "Pending",
  COLLECTED: "Collected",
  IN_TRANSIT: "In Transit",
  WITH_RETAILER: "With Retailer",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REFUNDED: "Refunded",
};

export const REFUND_METHOD_LABELS: Record<RefundMethod, string> = {
  ORIGINAL_PAYMENT: "Original Payment Method",
  STORE_CREDIT: "Store Credit",
  BANK_TRANSFER: "Bank Transfer",
  MOBILE_MONEY: "Mobile Money",
};

export const LOGISTICS_METHOD_LABELS: Record<LogisticsMethod, string> = {
  HOME_PICKUP: "Home Pick-Up",
  DROP_OFF: "Drop Off",
};

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
