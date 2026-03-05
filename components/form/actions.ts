"use server";

import { z } from "zod";
import { ReceiptData } from "@/types";

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
  errors?: Record<string, string[] | undefined>;
};

export async function generateReceipt(
  receiptData: ReceiptData,
  prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    // Validate the receipt data against the schema
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

    // Simulate backend API call (1.4s delay)
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Log the validated data to the server console
    console.log("=== Receipt Generated ===");
    console.log(JSON.stringify(result.data, null, 2));
    console.log("=========================");

    return {
      success: true,
      message: "Receipt generated successfully!",
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
