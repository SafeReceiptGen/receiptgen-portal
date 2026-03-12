/**
 * Typed API client for all non-auth Express backend calls.
 * Auth flows (sign-in, sign-up, OAuth) are handled separately via authClient.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface ApiError {
  error: string;
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

  const data = await res.json();

  if (!res.ok) {
    const err = data as ApiError;
    throw new ApiRequestError(
      err.error ?? "Request failed",
      res.status,
      err.details,
    );
  }

  return data as T;
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
  reason: string;
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

export { ApiRequestError };
