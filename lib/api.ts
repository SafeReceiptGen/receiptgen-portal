/**
 * Typed API client for all non-auth Express backend calls.
 * Auth flows (sign-in, sign-up, OAuth) are handled separately via authClient.
 */

import type { PublicReturnBundle } from "@/lib/return-mappers";
import {
  serverRequest,
  serverRequestFormData,
  SerializableRequestOptions,
} from "./server-request";
import {
  refundTypeEnum,
  returnConditionEnum,
  returnWindowEnum,
} from "@/types/enums";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

async function request<T>(
  path: string,
  options: SerializableRequestOptions = {},
): Promise<T> {
  const result = await serverRequest<T>(path, options);
  if (result.error) {
    throw new ApiRequestError(result.message, result.status, result.details);
  }
  return result.data;
}

async function requestWithTotalCount<T>(
  path: string,
  options: SerializableRequestOptions = {},
): Promise<{ data: T; totalCount?: number }> {
  const result = await serverRequest<T>(path, options);
  if (result.error) {
    throw new ApiRequestError(result.message, result.status, result.details);
  }
  return { data: result.data, totalCount: result.totalCount };
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

  list: (params?: {
    storeId?: string;
    page?: number;
    status?: string;
    limit?: number;
  }) => {
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
  createdAt: Date;
  updatedAt: Date;
  retailerId: string;
  isActive: boolean;
  phone: string | null;
  address: string | null;
  storeCatalog: SavedProduct[];
  returnPolicy: {
    id: string;
    createdAt: Date;
    isActive: boolean;
    storeId: string;
    returnWindow: returnWindowEnum;
    customWindowDays: number | null;
    returnCondition: returnConditionEnum;
    refundType: refundTypeEnum;
  };
}

export const storesApi = {
  list: () => request<{ stores: Store[] }>("/stores"),

  get: (id: string) => request<{ store: Store }>(`/stores/${id}`),

  update: (
    id: string,
    payload: Partial<Pick<Store, "name" | "phone" | "address">>,
  ) =>
    request<{ store: Store }>(`/stores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updatePolicy: (
    id: string,
    payload: {
      returnWindow?: string;
      customWindowDays?: number;
      returnCondition?: string;
      refundType?: string;
    },
  ) =>
    request<{ store: Store }>(`/stores/${id}/policy`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  create: (
    payload: Pick<Store, "name" | "phone" | "address"> & {
      returnWindow?: string;
      customWindowDays?: number;
      returnCondition?: string;
      refundType?: string;
    },
  ) =>
    request<{ store: Store }>("/stores", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  addToCatalog: (
    storeId: string,
    products: Pick<SavedProduct, "name" | "description" | "defaultPrice">[],
  ) =>
    request<{ products: SavedProduct[] }>(`/stores/${storeId}/catalog`, {
      method: "POST",
      body: JSON.stringify([...products]),
    }),

  removeFromCatalog: (storeId: string, productId: string) =>
    request<{ message: string }>(`/stores/${storeId}/catalog/${productId}`, {
      method: "DELETE",
    }),
};

// ─── Store Catalog ───────────────────────────────────────────────────────────

export interface SavedProduct {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  storeId: string;
  description: string | null;
  defaultPrice: string | null;
}

/** Placeholder mock data keyed by storeId — replace with a real endpoint later. */
const MOCK_SAVED_PRODUCTS: Record<string, SavedProduct[]> = {
  default: [
    // { id: "sp-1",storeId:"1", name: "Nike Air Force 1", description: "White, High Top" },
    // { id: "sp-2", name: "Nike Jordan 1 Retro", description: "Red/Black, Size 43" },
    // { id: "sp-3", name: "Adidas Ultraboost 22", description: "Core Black" },
    // {
    //   id: "sp-4",
    //   name: "Samsung Galaxy Buds FE",
    //   description: "Graphite, Wireless",
    // },
    // { id: "sp-5", name: "Anker PowerCore 20000", description: "USB-C" },
    // { id: "sp-6", name: "Blue Phoenix Coffee", description: "Medium Roast, 200g" },
    // {
    //   id: "sp-7",
    //   name: "Jet Lag Ground Coffee",
    //   description: "70/30 Arabica/Robusta, 200g",
    // },
  ],
};

export const savedProductsApi = {
  /**
   * Fetches saved product names for a store.
   * Currently mocked — swap the body for a real API call when the endpoint exists:
   *   return request<{ products: SavedProduct[] }>(`/stores/${storeId}/products`);
   */
  list: (storeId: string): Promise<{ products: SavedProduct[] }> =>
    new Promise((resolve) =>
      setTimeout(() => {
        const products =
          MOCK_SAVED_PRODUCTS[storeId] ?? MOCK_SAVED_PRODUCTS["default"];
        resolve({ products });
      }, 500),
    ),
};

// ─── Returns ─────────────────────────────────────────────────────────────────

export interface SubmitReturnPayload {
  receiptToken: string;
  items: { lineItemId: string; quantity: number }[];
  reason?:
    | "defective"
    | "wrong_item"
    | "changed_mind"
    | "damaged_in_delivery"
    | "other";
  description?: string;
  photoUrls?: string[];
  logistics?: {
    method: "home_pickup" | "drop_off";
    pudoPointId?: string;
    timeSlot: string;
    phoneNumber: string;
    phoneCountry: string;
    pickupAddress?: {
      line1: string;
      line2?: string;
      city: string;
      region: string;
      postalCode?: string;
    };
    parcel?: {
      packageCount: number;
      description: string;
      weightKg?: number;
    };
  };
  serviceFee?: number;
}

/** Response from GET /returns/eligibility — mirrors backend eligibility service */
export interface ReturnEligibilityResponse {
  eligible: boolean;
  reasons: string[];
  receipt: {
    id: string;
    receiptNumber: string;
    currency: string;
    total: string;
    purchaseDate: string;
    storeName: string;
    retailerName: string;
    retailerLogo: string | null;
    customerName: string | null;
  } | null;
  policy: {
    returnWindow: string;
    returnCondition: string;
    refundType: string;
    deadlineDate: string | null;
    daysRemaining: number | null;
  } | null;
  items: Array<{
    id: string;
    name: string;
    detail: string | null;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
    alreadyReturned: number;
    returnable: number;
  }>;
}

export interface ReturnListRow {
  returnRequest: Record<string, unknown>;
  receipt: Record<string, unknown>;
  store: Record<string, unknown>;
  customer: Record<string, unknown> | null;
  itemCount: number;
  photoCount: number;
}

/** Authenticated GET /returns/:id — same shape as backend `getReturnById` bundle */
export interface RetailerReturnBundle {
  returnRequest: Record<string, unknown>;
  receipt: Record<string, unknown>;
  store: Record<string, unknown>;
  customer: Record<string, unknown> | null;
  retailer: Record<string, unknown>;
  items: Array<{
    returnItem: Record<string, unknown>;
    lineItem: Record<string, unknown>;
  }>;
  photos: Array<{ id: string; url: string; sortOrder: number }>;
  payments: Record<string, unknown>[];
}

async function requestWithoutJsonBody<T>(
  path: string,
  formData: FormData,
  options: Omit<SerializableRequestOptions, "body"> = {},
): Promise<T> {
  const result = await serverRequestFormData<T>(path, formData, options);
  if (result.error) {
    throw new ApiRequestError(result.message, result.status, result.details);
  }
  return result.data;
}

/**
 * Upload return photos (multipart). Call before POST /returns with returned URLs in `photoUrls`.
 */
export async function uploadReturnPhotosFromDataUrls(
  dataUrls: string[],
): Promise<string[]> {
  if (dataUrls.length === 0) return [];
  const form = new FormData();
  for (let i = 0; i < dataUrls.length; i++) {
    const url = dataUrls[i];
    const m = /^data:(.+?);base64,(.+)$/.exec(url);
    if (!m) continue;
    const mime = m[1] || "image/jpeg";
    const buf = Buffer.from(m[2], "base64");
    const blob = new Blob([buf], { type: mime });
    form.append("photos", blob, `photo-${i}.jpg`);
  }
  const data = await requestWithoutJsonBody<{ urls: string[] }>(
    "/uploads/return-photos",
    form,
    { method: "POST" },
  );
  return data.urls;
}

export const returnsApi = {
  submit: (payload: SubmitReturnPayload) =>
    request<{
      returnRequest: { id: string; returnNumber: string; status: string };
    }>("/returns", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getEligibility: (receiptToken: string) =>
    request<ReturnEligibilityResponse>(
      `/returns/eligibility?token=${encodeURIComponent(receiptToken)}`,
    ),

  getPublic: (returnId: string, receiptToken: string) =>
    request<{ returnRequest: PublicReturnBundle }>(
      `/returns/public/${encodeURIComponent(returnId)}?token=${encodeURIComponent(receiptToken)}`,
    ).then((d) => d.returnRequest),

  confirmPayment: (
    returnId: string,
    body: {
      paymentType: "service_fee" | "refund";
      provider: string;
      reference: string;
    },
  ) =>
    request<{ payment: unknown }>(
      `/returns/public/${encodeURIComponent(returnId)}/payment`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),

  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    reason?: string;
    from?: string;
    to?: string;
    search?: string;
    /** Maps to backend `pending_review` — statuses pending or pickup_scheduled */
    pending_review?: boolean;
  }) => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === "") return;
        if (k === "pending_review") {
          if (v === true || v === "true") qs.set("pending_review", "true");
          return;
        }
        qs.set(k, String(v));
      });
    }
    const q = qs.toString();
    return requestWithTotalCount<{ returns: ReturnListRow[] }>(
      `/returns${q ? `?${q}` : ""}`,
    ).then(({ data, totalCount }) => ({
      returns: data.returns,
      totalCount,
    }));
  },

  get: (id: string) =>
    request<{ returnRequest: RetailerReturnBundle }>(
      `/returns/${encodeURIComponent(id)}`,
    ).then((d) => d.returnRequest),

  approve: (id: string) =>
    request<{ refundAmount: number }>(
      `/returns/${encodeURIComponent(id)}/approve`,
      {
        method: "PATCH",
      },
    ),

  reject: (id: string, reason: string) =>
    request<{ message: string }>(`/returns/${encodeURIComponent(id)}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  markReceived: (id: string) =>
    request<void>(`/returns/${encodeURIComponent(id)}/mark-received`, {
      method: "PATCH",
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

export { ApiRequestError };
