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

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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
    throw new ApiRequestError(err.error ?? "Request failed", res.status, err.details);
  }

  return data as T;
}

// ─── Retailer ───────────────────────────────────────────────────────────────

export interface OnboardPayload {
  businessName: string;
  storeCount: number;
  phone: string;
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
    request<{ retailer: Retailer }>("/api/retailer/onboard", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  get: () => request<{ retailer: Retailer }>("/api/retailer"),

  update: (payload: Partial<Pick<Retailer, "name" | "companyName" | "tin" | "website">>) =>
    request<{ message: string }>("/api/retailer", {
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
    request<{ receipt: CreatedReceipt; qrUrl: string }>("/api/receipts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: (params?: { storeId?: string; page?: number; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ receipts: CreatedReceipt[]; page: number; limit: number }>(
      `/api/receipts${qs ? `?${qs}` : ""}`
    );
  },

  get: (id: string) =>
    request<{ receipt: CreatedReceipt }>(`/api/receipts/${id}`),
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
  list: () => request<{ stores: Store[] }>("/api/stores"),

  create: (payload: Pick<Store, "name" | "phone" | "address">) =>
    request<{ store: Store }>("/api/stores", {
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
    request<{ returnRequest: { id: string; status: string } }>("/api/returns", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: () => request<{ returns: unknown[] }>("/api/returns"),

  approve: (id: string) =>
    request<{ message: string; refundAmount: string }>(`/api/returns/${id}/approve`, {
      method: "PATCH",
    }),

  reject: (id: string, reason?: string) =>
    request<{ message: string }>(`/api/returns/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
};

export { ApiRequestError };
