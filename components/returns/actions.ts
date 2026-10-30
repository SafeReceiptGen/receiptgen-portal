"use server";

import type { ReturnFlowFormData } from "@/lib/validations/return-schema";
import {
  returnsApi,
  uploadReturnPhotosFromDataUrls,
  ApiRequestError,
  type ReturnEligibilityResponse,
} from "@/lib/api";
import { returnReasonToApi } from "@/lib/return-mappers";
export type SubmitReturnResult =
  | { ok: true; id: string; returnNumber: string }
  | {
      ok: false;
      message: string;
      retryable: boolean;
      existingReturnId?: string;
      existingReturnNumber?: string;
    };

function failureFrom(error: unknown, fallback: string): SubmitReturnResult {
  if (error instanceof ApiRequestError) {
    const payload = error.data as
      | { returnRequest?: { id?: string; returnNumber?: string } }
      | undefined;
    const existingReturnId = payload?.returnRequest?.id;
    return {
      ok: false,
      message: error.message || fallback,
      retryable: !existingReturnId && (error.status === 0 || error.status >= 500),
      existingReturnId,
      existingReturnNumber: payload?.returnRequest?.returnNumber,
    };
  }
  if (error instanceof Error) {
    return { ok: false, message: error.message, retryable: false };
  }
  return { ok: false, message: fallback, retryable: false };
}

/**
 * Submits a return request to the backend with full wizard parity:
 * reason, description, uploaded photo URLs, logistics, service fee.
 * The booked method is always retailer drop-off. Interests are separate.
 */
export async function submitReturnRequest(
  data: ReturnFlowFormData,
  receiptToken: string,
  idempotencyKey: string,
): Promise<SubmitReturnResult> {
  const selectedItems = data.items.filter((i) => i.selected);

  if (selectedItems.length === 0) {
    return { ok: false, message: "No items selected for return", retryable: false };
  }

  let photoUrls: string[] | undefined;
  if (data.photos?.length) {
    try {
      photoUrls = await uploadReturnPhotosFromDataUrls(data.photos);
    } catch (e) {
      return failureFrom(e, "Could not upload photos. Please try again.");
    }
  }

  const logistics = data.logistics;

  if (!data.reason) {
    return { ok: false, message: "Return reason is required", retryable: false };
  }

  const interests: Array<"drop_off" | "home_pickup"> = [];
  if (data.interests?.dropOff) interests.push("drop_off");
  if (data.interests?.homePickup) interests.push("home_pickup");

  const items: { lineItemId: string; quantity: number }[] = [];
  for (const item of selectedItems) {
    const qty = item.quantity === 1 ? 1 : item.returnQuantity;
    if (qty == null) {
      return {
        ok: false,
        message: "Return quantity is required for each selected line.",
        retryable: false,
      };
    }
    if (qty < 0) {
      return {
        ok: false,
        message: "Return quantity cannot be negative.",
        retryable: false,
      };
    }
    if (qty < 1) {
      return {
        ok: false,
        message: "Return quantity must be at least 1 for each selected line.",
        retryable: false,
      };
    }
    const available = item.availableQuantity ?? item.quantity;
    if (available < 1) {
      return {
        ok: false,
        message: `"${item.name}" has already been returned.`,
        retryable: false,
      };
    }
    if (qty > available) {
      return {
        ok: false,
        message: `Return quantity cannot exceed the amount that can still be returned (${available}).`,
        retryable: false,
      };
    }
    items.push({ lineItemId: item.id, quantity: qty });
  }

  const payload = {
    receiptToken,
    items,
    reason: returnReasonToApi(data.reason),
    description: data.description?.trim() || undefined,
    photoUrls: photoUrls?.length ? photoUrls : undefined,
    logistics: {
      method: "retailer_dropoff" as const,
      timeSlot: logistics.timeSlot,
      phoneNumber: logistics.phoneNumber,
      phoneCountry: logistics.phoneCountry,
    },
    interests: interests.length > 0 ? interests : undefined,
    serviceFee: 0,
  };

  try {
    const { returnRequest } = await returnsApi.submit(payload, idempotencyKey);
    return {
      ok: true,
      id: returnRequest.id,
      returnNumber: returnRequest.returnNumber,
    };
  } catch (error) {
    return failureFrom(error, "Failed to submit return request. Please try again.");
  }
}

/** Server-side eligibility check (same source as submit-time validation). */
export async function fetchReturnEligibility(
  receiptToken: string,
): Promise<ReturnEligibilityResponse> {
  try {
    return await returnsApi.getEligibility(receiptToken);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw new Error(error.message);
    }
    throw error;
  }
}
