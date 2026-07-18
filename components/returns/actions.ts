"use server";

import type { ReturnFlowFormData } from "@/lib/validations/return-schema";
import {
  returnsApi,
  uploadReturnPhotosFromDataUrls,
  ApiRequestError,
  type ReturnEligibilityResponse,
} from "@/lib/api";
import { returnReasonToApi } from "@/lib/return-mappers";

/**
 * Submits a return request to the backend with full wizard parity:
 * reason, description, uploaded photo URLs, logistics, service fee.
 */
export async function submitReturnRequest(
  data: ReturnFlowFormData,
  receiptToken: string,
): Promise<{ id: string; returnNumber: string }> {
  const selectedItems = data.items.filter((i) => i.selected);

  if (selectedItems.length === 0) {
    throw new Error("No items selected for return");
  }

  let photoUrls: string[] | undefined;
  if (data.photos?.length) {
    try {
      photoUrls = await uploadReturnPhotosFromDataUrls(data.photos);
    } catch (e) {
      if (e instanceof ApiRequestError) {
        throw new Error(e.message);
      }
      throw e;
    }
  }

  const logistics = data.logistics;
  const fee =
    logistics.method === "HOME_PICKUP" ? 50 : 30;

  if (!data.reason) {
    throw new Error("Return reason is required");
  }

  const method =
    logistics.method === "HOME_PICKUP" ? ("home_pickup" as const) : ("drop_off" as const);

  const logisticsPayload = {
    method,
    pudoPointId: logistics.pudoPointId?.trim() || undefined,
    timeSlot: logistics.timeSlot,
    phoneNumber: logistics.phoneNumber,
    phoneCountry: logistics.phoneCountry,
    ...(logistics.method === "HOME_PICKUP"
      ? {
          pickupAddress: {
            line1: logistics.pickupAddress.address.trim(),
            city: "",
            region: "",
            postalCode: undefined,
            landmark: logistics.pickupAddress.landmark?.trim() || undefined,
            latitude: logistics.pickupAddress.latitude,
            longitude: logistics.pickupAddress.longitude,
          },
          parcel: {
            packageCount: 1,
            description: logistics.parcel.description.trim(),
          },
        }
      : {}),
  };

  const payload = {
    receiptToken,
    items: selectedItems.map((item) => {
      const qty =
        item.quantity === 1 ? 1 : item.returnQuantity;
      if (qty == null) {
        throw new Error("Return quantity is required for each selected line.");
      }
      if (qty < 0) {
        throw new Error("Return quantity cannot be negative.");
      }
      if (qty < 1) {
        throw new Error(
          "Return quantity must be at least 1 for each selected line.",
        );
      }
      if (qty > item.quantity) {
        throw new Error(
          `Return quantity cannot exceed the purchased amount (${item.quantity}).`,
        );
      }
      return {
        lineItemId: item.id,
        quantity: qty,
      };
    }),
    reason: returnReasonToApi(data.reason),
    description: data.description?.trim() || undefined,
    photoUrls: photoUrls?.length ? photoUrls : undefined,
    logistics: logisticsPayload,
    serviceFee: fee,
  };

  try {
    const { returnRequest } = await returnsApi.submit(payload);
    return {
      id: returnRequest.id,
      returnNumber: returnRequest.returnNumber,
    };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw new Error(error.message);
    }
    throw error;
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
