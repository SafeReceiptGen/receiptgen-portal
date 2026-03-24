/**
 * Typed API client for all non-auth Express backend calls.
 * Auth flows (sign-in, sign-up, OAuth) are handled separately via authClient.
 */

import { differenceInCalendarDays } from "date-fns";
import type { ReceiptForReturn } from "@/types/returns";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Public receipt page base (portal), used for customer-facing /receipt/{qrCodeToken} links. */
function portalOriginForReceiptLinks(): string {
  const base =
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";
  return base.replace(/\/$/, "");
}

interface ApiError {
  success: false;
  message: string;
  details?: Record<string, string[]>;
}

class ApiRequestError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // Send session cookies with every request
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiRequestError(
      json.message ?? "Request failed",
      res.status,
      json.data as Record<string, string[]> | undefined,
    );
  }

  // Unwrap the backend response envelope: { success, message, data } → data
  return json.data as T;
}

// ─── Retailer ───────────────────────────────────────────────────────────────

export interface StoreInput {
  name: string;
  phone?: string;
  address?: string;
  returnWindow?: string;
  returnCondition?: string;
  refundType?: string;
}

export interface OnboardPayload {
  businessName: string;
  stores: StoreInput[];
}

export interface Retailer {
  id: string;
  name: string;
  companyName?: string;
  tin?: string;
  website?: string;
}

export const retailerApi = {
  onboard: (payload: OnboardPayload) =>
    request<{ retailer: Retailer }>("/retailer/onboard", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  get: () => request<{ retailer: Retailer }>("/retailer"),

  update: (
    payload: Partial<
      Pick<Retailer, "name" | "companyName" | "tin" | "website">
    >,
  ) =>
    request<{ message: string }>("/retailer", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

// ─── Receipts ────────────────────────────────────────────────────────────────

export interface ReceiptLineItem {
  name: string;
  detail?: string;
  quantity: number;
  price: number;
}

export interface CreateReceiptPayload {
  storeId: string;
  receiptNumber?: string;
  date: string;
  orderId?: string;
  currency: string;
  vatRate: number;
  paymentMethod: string;
  items: ReceiptLineItem[];
  customerName?: string;
  marketingText?: string;
}

export interface CreatedReceipt {
  id: string;
  receiptNumber: string;
  qrCodeToken: string;
  total: string;
}

export const receiptsApi = {
  create: (payload: CreateReceiptPayload) =>
    request<{ receipt: CreatedReceipt; qrUrl: string }>("/receipts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: (params?: { storeId?: string; page?: number; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ receipts: CreatedReceipt[]; page: number; limit: number }>(
      `/receipts${qs ? `?${qs}` : ""}`,
    );
  },

  get: (id: string) => request<{ receipt: CreatedReceipt }>(`/receipts/${id}`),
};

// ─── Stores ──────────────────────────────────────────────────────────────────

export interface Store {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export const storesApi = {
  list: () => request<{ stores: Store[] }>("/stores"),

  create: (payload: Pick<Store, "name" | "phone" | "address">) =>
    request<{ store: Store }>("/stores", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ─── Returns ─────────────────────────────────────────────────────────────────

export interface SubmitReturnPayload {
  receiptToken: string;
  reason?: string;
  items: { lineItemId: string; quantity: number }[];
}

export const returnsApi = {
  submit: (payload: SubmitReturnPayload) =>
    request<{ returnRequest: { id: string; status: string } }>("/returns", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: () => request<{ returns: unknown[] }>("/returns"),

  approve: (id: string) =>
    request<{ message: string; refundAmount: string }>(
      `/returns/${id}/approve`,
      {
        method: "PATCH",
      },
    ),

  reject: (id: string, reason?: string) =>
    request<{ message: string }>(`/returns/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
};

// ─── Verify (Public) ─────────────────────────────────────────────────────────

export interface VerifiedReceiptItem {
  id: string;
  receiptId: string;
  name: string;
  detail: string | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  sortOrder: number;
}

export interface VerifiedReceipt {
  id: string;
  date: string;
  total: string;
  currency: string;
  status: string;
  returnDeadline: string | null;
  receiptNumber: string;
  paymentMethod: string;
  storeName: string;
  items: VerifiedReceiptItem[];
}

export const verifyApi = {
  getByToken: (token: string) =>
    request<{ receipt: VerifiedReceipt }>(`/verify/${token}`),
};

// ─── Mapping Helpers ─────────────────────────────────────────────────────────

/**
 * Maps the verified receipt from the public API to the ReceiptForReturn shape
 * used by all ReturnFlow components. Fields not returned by the verify endpoint
 * (storePhone, customerName, detailed policy info) are set to safe defaults.
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
    storeName: receipt.storeName,
    storePhone: "",
    customerName: "",
    items: receipt.items.map((item) => ({
      id: item.id,
      name: item.name,
      detail: item.detail ?? "",
      quantity: item.quantity,
      price: parseFloat(item.unitPrice),
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
    returnCondition: "See store policy",
    refundType: "See store policy",
    isReturnable,
    qrUrl: `${portalOriginForReceiptLinks()}/receipt/${token}`,
  };
}

export { ApiRequestError };
