"use server";

import { ReturnFlowFormData } from "@/lib/validations/return-schema";
import { returnsApi, ApiRequestError } from "@/lib/api";

/**
 * Submits a return request to the real backend API.
 * 
 * The `receiptId` param is actually the QR token from the URL — the backend
 * uses it to look up the receipt via `receiptToken`.
 */
export async function submitReturnRequest(
  data: ReturnFlowFormData,
  receiptId: string,
): Promise<string> {
  const selectedItems = data.items.filter((i) => i.selected);

  if (selectedItems.length === 0) {
    throw new Error("No items selected for return");
  }

  // Build the reason string: combine the enum reason with the description
  const reasonParts: string[] = [data.reason];
  if (data.description) {
    reasonParts.push(data.description);
  }

  try {
    const { returnRequest } = await returnsApi.submit({
      receiptToken: receiptId, // URL param is the QR token
      reason: reasonParts.join(": "),
      items: selectedItems.map((item) => ({
        lineItemId: item.id, // item.id from the API is the real line_items UUID
        quantity: item.quantity,
      })),
    });

    return returnRequest.id;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw new Error(error.message);
    }
    throw error;
  }
}
