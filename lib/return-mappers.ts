import type {
  LogisticsMethod,
  ReturnLogistics,
  ReturnReason,
  ReturnRequest,
  ReturnStatus,
  ReturnItem,
  ReturnActivityLog,
  RefundMethod,
} from "@/types/returns";

export function mapApiLogisticsMethod(method: string | null): LogisticsMethod {
  switch (method) {
    case "home_pickup":
      return "HOME_PICKUP";
    case "drop_off":
      return "DROP_OFF";
    case "retailer_dropoff":
      return "RETAILER_DROPOFF";
    default:
      return "HOME_PICKUP";
  }
}

/** Map backend snake_case reason to UI enum */
export function mapApiReasonToReturnReason(
  code: string | null | undefined,
): ReturnReason {
  const map: Record<string, ReturnReason> = {
    defective: "DEFECTIVE",
    wrong_item: "WRONG_ITEM",
    changed_mind: "CHANGED_MIND",
    damaged_in_delivery: "DAMAGED_IN_DELIVERY",
    other: "OTHER",
  };
  return map[code ?? ""] ?? "OTHER";
}

const API_REASON = {
  DEFECTIVE: "defective",
  WRONG_ITEM: "wrong_item",
  CHANGED_MIND: "changed_mind",
  DAMAGED_IN_DELIVERY: "damaged_in_delivery",
  OTHER: "other",
} as const;

export function returnReasonToApi(
  reason: ReturnReason,
): (typeof API_REASON)[keyof typeof API_REASON] {
  return API_REASON[reason];
}

export function mapApiStatusToReturnStatus(
  status: string | null | undefined,
): ReturnStatus {
  const s = (status ?? "pending").toLowerCase();
  const map: Record<string, ReturnStatus> = {
    pending: "PENDING",
    pickup_scheduled: "PICKUP_SCHEDULED",
    collected: "COLLECTED",
    in_transit: "IN_TRANSIT",
    with_retailer: "WITH_RETAILER",
    approved: "APPROVED",
    rejected: "REJECTED",
    cancelled: "CANCELLED",
    refunded: "REFUNDED",
    refund_completed: "REFUND_COMPLETED",
    exchange_completed: "EXCHANGE_COMPLETED",
    completed: "COMPLETED",
  };
  if (s === "pending") return "PENDING";
  // Unrecognized values must not collapse back into pending review.
  return map[s] ?? "WITH_RETAILER";
}

function mapRefundTypeToRefundMethod(
  refundType: string | null | undefined,
): RefundMethod | undefined {
  if (!refundType) return undefined;
  const t = refundType.toLowerCase();
  if (t === "store_credit") return "STORE_CREDIT";
  if (t === "full_refund" || t === "partial_refund") return "ORIGINAL_PAYMENT";
  return undefined;
}

/** Full body from GET /returns/public/:id (nested under `data.returnRequest` in JSON). */
export type PublicReturnBundle = {
  returnRequest: {
    id: string;
    returnNumber: string;
    status: string;
    reasonCode: string | null;
    description: string | null;
    refundType: string;
    refundAmount: string | null;
    logisticsMethod: string | null;
    logisticsPudoPointId?: string | null;
    logisticsTimeSlot: string | null;
    logisticsPhone: string | null;
    logisticsPhoneCountry: string | null;
    pickupAddressLine1: string | null;
    pickupAddressLine2: string | null;
    pickupCity: string | null;
    pickupRegion: string | null;
    pickupPostalCode: string | null;
    pickupLatitude: string | number | null;
    pickupLongitude: string | number | null;
    pickupLandmark: string | null;
    parcelPackageCount: number | null;
    parcelDescription: string | null;
    parcelWeightKg: string | null;
    serviceFee: string | null;
    rejectionReason: string | null;
    collectedAt: Date | string | null;
    inTransitAt: Date | string | null;
    withRetailerAt: Date | string | null;
    reviewedAt: Date | string | null;
    resolvedAt: Date | string | null;
    createdAt: Date | string;
  };
  receipt: { receiptNumber: string; currency: string };
  store: { name: string; address?: string | null };
  retailer: { name: string; companyName: string | null; logoUrl: string | null };
  customer: { name: string | null; email: string | null } | null;
  items: Array<{
    returnItem: { quantityReturned: number };
    lineItem: {
      id: string;
      name: string;
      detail: string | null;
      quantity: number;
      unitPrice: string;
    };
  }>;
  photos: Array<{ url: string }>;
  adjustmentReceipt?: {
    id: string;
    receiptNumber: string;
    qrCodeToken: string;
    adjustmentKind: "return" | "exchange";
  } | null;
};

/**
 * Maps GET /returns/public/:id response into the ReturnRequest shape used by the UI.
 * `receiptQrToken` must be the receipt QR token used to authorize the read.
 */
export function mapPublicReturnBundleToReturnRequest(
  payload: PublicReturnBundle,
  receiptQrToken: string,
): ReturnRequest {
  const { returnRequest: rr, receipt, retailer, customer, items, photos } =
    payload;

  const method = mapApiLogisticsMethod(rr.logisticsMethod);
  const isHomePickup = method === "HOME_PICKUP";
  const logistics: ReturnLogistics = {
    method,
    pudoPointId:
      method === "DROP_OFF" ? rr.logisticsPudoPointId?.trim() || undefined : undefined,
    timeSlot: rr.logisticsTimeSlot ?? "",
    phoneNumber: rr.logisticsPhone ?? "",
    phoneCountry: rr.logisticsPhoneCountry ?? "",
    fee: rr.serviceFee ? parseFloat(rr.serviceFee) : 0,
  };

  if (isHomePickup && rr.pickupAddressLine1) {
    const landmark =
      rr.pickupLandmark?.trim() ||
      rr.pickupAddressLine2?.trim() ||
      undefined;
    const lat =
      rr.pickupLatitude != null && rr.pickupLatitude !== ""
        ? typeof rr.pickupLatitude === "number"
          ? rr.pickupLatitude
          : parseFloat(String(rr.pickupLatitude))
        : undefined;
    const lng =
      rr.pickupLongitude != null && rr.pickupLongitude !== ""
        ? typeof rr.pickupLongitude === "number"
          ? rr.pickupLongitude
          : parseFloat(String(rr.pickupLongitude))
        : undefined;
    const hasLegacyStructured =
      (rr.pickupCity?.trim() ?? "") !== "" ||
      (rr.pickupRegion?.trim() ?? "") !== "";
    const address = hasLegacyStructured
      ? [
          rr.pickupAddressLine1,
          rr.pickupCity,
          rr.pickupRegion,
          rr.pickupPostalCode,
        ]
          .filter((p) => p && String(p).trim() !== "")
          .join(", ")
      : rr.pickupAddressLine1;
    logistics.pickupAddress = {
      address,
      landmark,
      latitude: lat != null && !Number.isNaN(lat) ? lat : undefined,
      longitude: lng != null && !Number.isNaN(lng) ? lng : undefined,
    };
  }
  if (isHomePickup && rr.parcelDescription != null) {
    logistics.parcel = {
      description: rr.parcelDescription,
      ...(rr.parcelPackageCount != null
        ? { packageCount: rr.parcelPackageCount }
        : {}),
      ...(rr.parcelWeightKg != null && rr.parcelWeightKg !== ""
        ? { weightKg: parseFloat(rr.parcelWeightKg) }
        : {}),
    };
  }

  const mappedItems: ReturnItem[] = items.map(
    ({ returnItem, lineItem }) => ({
      id: lineItem.id,
      name: lineItem.name,
      detail: lineItem.detail ?? "",
      quantity: returnItem.quantityReturned,
      price: parseFloat(lineItem.unitPrice),
      selected: true,
    }),
  );

  const requestedAt =
    typeof rr.createdAt === "string"
      ? rr.createdAt
      : rr.createdAt.toISOString();

  const toIso = (d: Date | string | null | undefined) =>
    d == null
      ? undefined
      : typeof d === "string"
        ? d
        : d.toISOString();

  const submittedAction =
    rr.status === "pickup_scheduled"
      ? "Home pickup scheduled — we'll confirm your pickup window"
      : "Return request submitted";

  const rawStatus = (rr.status ?? "pending").toLowerCase();
  const exchange = (rr.refundType ?? "").toLowerCase() === "exchange_only";
  const activityLog: ReturnActivityLog[] = [
    {
      id: "submitted",
      action: submittedAction,
      performedBy: retailer.name,
      createdAt: requestedAt,
    },
  ];
  if (rr.reviewedAt) {
    activityLog.push({
      id: "reviewed",
      action:
        rawStatus === "rejected"
          ? "Return reviewed — rejected"
          : rawStatus === "cancelled"
            ? "Return cancelled"
            : exchange
              ? "Exchange pending"
              : "Approved — refund pending",
      performedBy: retailer.name,
      createdAt: toIso(rr.reviewedAt) ?? requestedAt,
    });
  }
  if (rr.collectedAt) {
    activityLog.push({
      id: "collected",
      action: "Collected",
      performedBy: retailer.name,
      createdAt: toIso(rr.collectedAt) ?? requestedAt,
    });
  }
  if (rr.inTransitAt) {
    activityLog.push({
      id: "in-transit",
      action: "In transit",
      performedBy: retailer.name,
      createdAt: toIso(rr.inTransitAt) ?? requestedAt,
    });
  }
  const returnFinished =
    rawStatus === "refunded" ||
    rawStatus === "refund_completed" ||
    rawStatus === "exchange_completed" ||
    rawStatus === "completed";
  if (rr.withRetailerAt) {
    const receivedAt = toIso(rr.withRetailerAt) ?? requestedAt;
    activityLog.push({
      id: "item-received",
      action: "Item received",
      performedBy: retailer.name,
      createdAt: receivedAt,
    });
    if (returnFinished) {
      activityLog.push({
        id: "processing",
        action: exchange ? "Exchange processing" : "Refund processing",
        performedBy: retailer.name,
        createdAt: receivedAt,
      });
    }
  }
  if (rr.resolvedAt && returnFinished) {
    activityLog.push({
      id: "processed",
      action:
        rawStatus === "exchange_completed" ||
        (rawStatus === "completed" && exchange)
          ? "Exchange processed"
          : "Refund processed",
      performedBy: retailer.name,
      createdAt: toIso(rr.resolvedAt) ?? requestedAt,
    });
  }

  const refundAmount = rr.refundAmount
    ? parseFloat(rr.refundAmount)
    : mappedItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );

  return {
    id: rr.id,
    returnNumber: rr.returnNumber,
    receiptId: "",
    receiptQrToken,
    retailerName: retailer.companyName ?? retailer.name,
    retailerLogo: retailer.logoUrl ?? undefined,
    storeName: payload.store.name,
    storeAddress: payload.store.address?.trim() || undefined,
    customerName: customer?.name ?? "",
    customerEmail: customer?.email ?? undefined,
    items: mappedItems,
    returnReason: mapApiReasonToReturnReason(rr.reasonCode),
    reasonDescription: rr.description ?? undefined,
    photoUrls: photos.map((p) => p.url),
    status: mapApiStatusToReturnStatus(rr.status),
    isEligible: true,
    logistics,
    refundAmount,
    refundMethod: mapRefundTypeToRefundMethod(rr.refundType),
    refundTypeCode: rr.refundType ?? undefined,
    rejectionReason: rr.rejectionReason ?? undefined,
    currency: receipt.currency,
    requestedAt,
    collectedAt: toIso(rr.collectedAt),
    inTransitAt: toIso(rr.inTransitAt),
    withRetailerAt: toIso(rr.withRetailerAt),
    reviewedAt: toIso(rr.reviewedAt),
    resolvedAt: toIso(rr.resolvedAt),
    activityLog,
    adjustmentReceipt: payload.adjustmentReceipt ?? null,
  };
}
