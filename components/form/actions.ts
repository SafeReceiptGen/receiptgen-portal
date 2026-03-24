"use server";

import { z } from "zod";
import { ReceiptData } from "@/types";
import { ReceiptForReturn } from "@/types/returns";
import { addMockReceipt } from "@/lib/mock-data";

// Zod schema — most fields are optional, validation is lenient
const lineItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Item name is required"),
  detail: z.string().optional().default(""),
  quantity: z.number().min(0).optional().default(1),
  price: z.number().min(0).optional().default(0),
});

const receiptSchema = z.object({
  storeId: z.string().optional().default(""),
  storeName: z.string().min(1, "Store name is required"),
  storePhone: z.string().optional().default(""),
  receiptNumber: z.string().optional().default(""),
  date: z.string().optional().default(""),
  orderId: z.string().optional().default(""),
  orderStatus: z.string().optional().default(""),
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
  currency: z.string().optional().default("GHS"),
  vatRate: z.number().optional().default(0),
  paymentMethod: z.string().optional().default(""),
  marketingText: z.string().optional().default(""),
  companyName: z.string().optional().default(""),
  tin: z.string().optional().default(""),
  website: z.string().optional().default(""),
  qrUrl: z.string().optional().default(""),
  customerName: z.string().optional().default(""),
  returnWindow: z.string().optional().default(""),
  customReturnWindow: z.string().optional().default(""),
  returnCondition: z.string().optional().default(""),
  refundType: z.string().optional().default(""),
});

export type ActionState = {
  success: boolean;
  message: string;
  qrUrl?: string;
  errors?: Record<string, string[] | undefined>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function portalOrigin(): string {
  const base =
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";
  return base.replace(/\/$/, "");
}

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
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat().filter(Boolean)[0];
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

    const response = await fetch(`${API_URL}/receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        storeId,
        receiptNumber: result.data.receiptNumber,
        date: dateIso,
        orderId: result.data.orderId,
        currency: result.data.currency,
        vatRate: result.data.vatRate,
        paymentMethod: result.data.paymentMethod,
        customerName: result.data.customerName,
        marketingText: result.data.marketingText,
        items: result.data.items.map((item) => ({
          name: item.name,
          detail: item.detail,
          quantity: item.quantity,
          price: item.price,
        })),
      }),
    });

    const raw = (await response.json().catch(() => ({}))) as CreateReceiptApiEnvelope;

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
        ? `${portalOrigin()}/receipt/${qrCodeToken}`
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

    const newReceipt: ReceiptForReturn = {
      id: receipt?.id ?? orderId,
      receiptNumber:
        receipt?.receiptNumber ||
        formData.receiptNumber ||
        `SR-${Math.floor(Math.random() * 10000)}`,
      storeName: formData.storeName,
      storePhone: formData.storePhone,
      customerName: formData.customerName,
      items: formData.items.map((item, index) => ({
        id: item.id || `item-${index}`,
        name: item.name,
        detail: item.detail,
        quantity: item.quantity,
        price: item.price,
        selected: false,
      })),
      currency: formData.currency,
      subtotal: formData.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      ),
      total: formData.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      ),
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
