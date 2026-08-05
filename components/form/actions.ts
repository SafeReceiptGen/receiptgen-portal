"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { ReceiptData } from "@/types";
import { ReceiptForReturn } from "@/types/returns";
import { addMockReceipt } from "@/lib/mock-data";
import { portalPublicOrigin } from "@/lib/portal-public-url";
import {
  balanceDueFrom,
  deriveReceiptPaymentStatus,
} from "@/lib/receipt-payment";

// Zod schema — most fields are optional, validation is lenient
const discountReasonSchema = z.enum([
  "customer_negotiation",
  "promotion_sale",
  "loyalty_customer",
  "damaged_open_box",
  "other",
]);

const moneyEquals = (a: number, b: number) =>
  Math.round(a * 100) === Math.round(b * 100);

const lineItemSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, "Item name is required"),
    detail: z.string().optional().default(""),
    quantity: z
      .number()
      .int("Quantity must be a whole number")
      .min(1, "Quantity must be at least 1")
      .optional()
      .default(1),
    price: z.number().min(0).optional().default(0),
    originalPrice: z.number().min(0).optional(),
    discountReason: discountReasonSchema.nullable().optional(),
    discountEnabled: z.boolean().optional(),
    priceFixed: z.boolean().optional(),
  })
  .superRefine((item, ctx) => {
    const originalPrice = item.originalPrice ?? item.price ?? 0;
    const salePrice = item.price ?? 0;

    if (salePrice > originalPrice && !moneyEquals(salePrice, originalPrice)) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Sale price cannot exceed original price",
      });
    }

    const isDiscounted =
      originalPrice > salePrice && !moneyEquals(originalPrice, salePrice);

    if (isDiscounted || item.discountEnabled) {
      if (isDiscounted && !item.discountReason) {
        ctx.addIssue({
          code: "custom",
          path: ["discountReason"],
          message:
            "Discount reason is required when sale price is less than original price",
        });
      }
      if (item.discountEnabled && moneyEquals(originalPrice, salePrice)) {
        ctx.addIssue({
          code: "custom",
          path: ["price"],
          message: "Enter a sale price lower than the original price",
        });
      }
    }
  })
  .transform((item) => {
    const originalPrice = item.originalPrice ?? item.price ?? 0;
    const salePrice = item.price ?? 0;
    const isDiscounted =
      originalPrice > salePrice && !moneyEquals(originalPrice, salePrice);
    return {
      id: item.id,
      name: item.name,
      detail: item.detail,
      quantity: item.quantity,
      price: salePrice,
      originalPrice,
      discountReason: isDiscounted ? (item.discountReason ?? null) : null,
    };
  });

const receiptSchema = z
  .object({
    storeId: z.string().optional().default(""),
    storeName: z.string().min(1, "Store name is required"),
    storeLocation: z.string().optional().default(""),
    storePhone: z.string().optional().default(""),
    receiptNumber: z.string().optional().default(""),
    date: z.string().optional().default(""),
    orderId: z.string().optional().default(""),
    orderStatus: z.string().optional().default(""),
    items: z.array(lineItemSchema).min(1, "At least one item is required"),
    currency: z.string().optional().default("GHS"),
    vatRate: z.number().optional().default(0),
    paymentMethod: z.string().optional().default(""),
    amountPaid: z.number().min(0).optional(),
    amountPaidTouched: z.boolean().optional(),
    marketingText: z.string().optional().default(""),
    companyName: z.string().optional().default(""),
    tin: z.string().optional().default(""),
    website: z.string().optional().default(""),
    qrUrl: z.string().optional().default(""),
    customerName: z.string().trim().min(1, "Customer name is required"),
    customerPhone: z.string().trim().min(7, "Customer phone is required"),
    returnWindow: z.string().optional().default(""),
    customReturnWindow: z.string().optional().default(""),
    returnCondition: z.string().optional().default(""),
    refundType: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.amountPaid === undefined) return;
    const total = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    if (
      data.amountPaid > total &&
      !moneyEquals(data.amountPaid, total)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["amountPaid"],
        message: "Amount paid cannot exceed total",
      });
    }
  });

export type ActionState = {
  success: boolean;
  message: string;
  /** Bare verification token from the API (path segment for /receipt/{token}). */
  qrCodeToken?: string;
  /** Full customer-facing verification URL. */
  qrUrl?: string;
  errors?: Record<string, string[] | undefined>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type CreateReceiptApiEnvelope = {
  success?: boolean;
  message?: string;
  data?: {
    receipt?: {
      id: string;
      qrCodeToken: string;
      receiptNumber: string;
      total?: string;
    };
    qrUrl?: string;
  };
};

export async function generateReceipt(
  receiptData: ReceiptData,
  prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    const result = receiptSchema.safeParse(receiptData);

    if (!result.success) {
      const flattened = result.error.flatten();
      const fieldErrors = flattened.fieldErrors;
      const firstError =
        flattened.formErrors[0] ||
        Object.values(fieldErrors).flat().filter(Boolean)[0];
      return {
        success: false,
        message: firstError || "Please check your form for errors.",
        errors: fieldErrors,
      };
    }

    const storeId = result.data.storeId?.trim() ?? "";
    const uuidOk = z.string().uuid().safeParse(storeId).success;
    if (!uuidOk) {
      return {
        success: false,
        message:
          "Select a store from your account before generating. Complete onboarding or pick a store in the form.",
      };
    }

    let dateIso: string;
    try {
      const raw = result.data.date?.trim();
      const d = raw ? new Date(raw) : new Date();
      if (Number.isNaN(d.getTime())) {
        dateIso = new Date().toISOString();
      } else {
        dateIso = d.toISOString();
      }
    } catch {
      dateIso = new Date().toISOString();
    }

    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    const response = await fetch(`${API_URL}/receipts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieString,
      },
      credentials: "include",
      body: JSON.stringify({
        storeId,
        date: dateIso,
        currency: result.data.currency,
        // VAT disabled for now — totals must equal the sum of line items.
        vatRate: 0,
        paymentMethod: result.data.paymentMethod,
        amountPaid: result.data.amountPaid,
        customerName: result.data.customerName,
        customerPhone: result.data.customerPhone,
        marketingText: result.data.marketingText,
        items: result.data.items.map((item) => ({
          name: item.name,
          detail: item.detail,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          discountReason: item.discountReason,
        })),
      }),
    });

    const raw = (await response
      .json()
      .catch(() => ({}))) as CreateReceiptApiEnvelope;

    if (!response.ok) {
      return {
        success: false,
        message:
          (typeof raw.message === "string" && raw.message) ||
          (raw as { error?: string }).error ||
          "Failed to save receipt. Please try again.",
      };
    }

    const data = raw.data;
    const receipt = data?.receipt;
    const qrCodeToken = receipt?.qrCodeToken;

    const qrUrl =
      qrCodeToken != null && qrCodeToken.length > 0
        ? `${portalPublicOrigin()}/receipt/${qrCodeToken}`
        : data?.qrUrl?.trim() || undefined;

    if (!qrUrl) {
      return {
        success: false,
        message:
          "Receipt was created but no verification link was returned. Check API configuration.",
      };
    }

    const formData = result.data;
    const orderId = formData.orderId || `REC-${Date.now()}`;
    const computedTotal = formData.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const amountPaid =
      formData.amountPaid === undefined ? computedTotal : formData.amountPaid;

    const newReceipt: ReceiptForReturn = {
      id: receipt?.id ?? orderId,
      receiptNumber:
        receipt?.receiptNumber ||
        formData.receiptNumber ||
        `SR-${Math.floor(Math.random() * 10000)}`,
      storeName: formData.storeName,
      storePhone: formData.storePhone,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      items: formData.items.map((item, index) => ({
        id: item.id || `item-${index}`,
        name: item.name,
        detail: item.detail,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice,
        selected: false,
      })),
      currency: formData.currency,
      subtotal: computedTotal,
      total: computedTotal,
      amountPaid,
      balanceDue: balanceDueFrom(computedTotal, amountPaid),
      paymentStatus: deriveReceiptPaymentStatus(computedTotal, amountPaid),
      paymentMethod: formData.paymentMethod,
      purchasedAt: formData.date
        ? new Date(formData.date).toISOString()
        : new Date().toISOString(),
      returnWindow: formData.returnWindow,
      returnCondition: formData.returnCondition,
      refundType: formData.refundType,
      isReturnable: formData.returnWindow !== "No returns",
      qrUrl,
    };

    addMockReceipt(newReceipt);

    return {
      success: true,
      message: "Receipt generated successfully!",
      qrCodeToken,
      qrUrl,
    };
  } catch (error) {
    console.error("Receipt generation failed:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}
