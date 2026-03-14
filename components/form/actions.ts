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

export async function generateReceipt(
  receiptData: ReceiptData,
  prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    // 1. Validate client-side data first
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

    // 2. Send to Express backend
    const response = await fetch(`${API_URL}/api/receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        // TODO: replace storeId with the real storeId from the user's session once dashboard is built
        storeId: result.data.orderId || "default",
        receiptNumber: result.data.receiptNumber,
        date: result.data.date || new Date().toISOString(),
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.error ?? "Failed to save receipt. Please try again.",
      };
    }

    const data = await response.json();

    // Transform form data into our backend schema type and save it
    const data = result.data;
    const orderId = data.orderId || `REC-${Date.now()}`;
    
    // Create the receipt record
    const newReceipt: ReceiptForReturn = {
      id: orderId,
      receiptNumber: data.receiptNumber || `SR-${Math.floor(Math.random() * 10000)}`,
      storeName: data.storeName,
      storePhone: data.storePhone,
      customerName: data.customerName,
      items: data.items.map((item, index) => ({
        id: item.id || `item-${index}`,
        name: item.name,
        detail: item.detail,
        quantity: item.quantity,
        price: item.price,
        selected: false
      })),
      currency: data.currency,
      subtotal: data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      total: data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      paymentMethod: data.paymentMethod,
      purchasedAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      returnWindow: data.returnWindow,
      returnCondition: data.returnCondition,
      refundType: data.refundType,
      isReturnable: data.returnWindow !== "No returns",
      qrUrl: data.qrUrl || `https://safereceipts.com/receipt/${orderId}`,
    };

    // Save to our in-memory mock database
    addMockReceipt(newReceipt);

    return {
      success: true,
      message: "Receipt generated successfully!",
      qrUrl: data.qrUrl,
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
