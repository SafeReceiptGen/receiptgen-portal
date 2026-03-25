import type {
  ReturnLogistics,
  ReturnReason,
  ReturnRequest,
  ReturnStatus,
  ReturnItem,
  ReturnActivityLog,
  RefundMethod,
} from "@/types/returns";

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
    collected: "COLLECTED",
    in_transit: "IN_TRANSIT",
    with_retailer: "WITH_RETAILER",
    approved: "APPROVED",
    rejected: "REJECTED",
    refunded: "REFUNDED",
    completed: "APPROVED",
    cancelled: "REJECTED",
  };
  return map[s] ?? "PENDING";
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
    logisticsTimeSlot: string | null;
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
  store: { name: string };
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

  const logistics: ReturnLogistics = {
    method:
      rr.logisticsMethod === "drop_off" ? "DROP_OFF" : "HOME_PICKUP",
    timeSlot: rr.logisticsTimeSlot ?? "",
    phoneNumber: "",
    phoneCountry: "",
    fee: rr.serviceFee ? parseFloat(rr.serviceFee) : 0,
  };

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

  const activityLog: ReturnActivityLog[] = [
    {
      id: "1",
      action: "Return request submitted",
      performedBy: retailer.name,
      createdAt: requestedAt,
    },
  ];
  if (rr.reviewedAt) {
    activityLog.push({
      id: "2",
      action:
        rr.status === "rejected"
          ? "Return reviewed — rejected"
          : "Return reviewed — approved",
      performedBy: retailer.name,
      createdAt: toIso(rr.reviewedAt) ?? requestedAt,
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
    rejectionReason: rr.rejectionReason ?? undefined,
    currency: receipt.currency,
    requestedAt,
    collectedAt: toIso(rr.collectedAt),
    inTransitAt: toIso(rr.inTransitAt),
    withRetailerAt: toIso(rr.withRetailerAt),
    reviewedAt: toIso(rr.reviewedAt),
    resolvedAt: toIso(rr.resolvedAt),
    activityLog,
  };
}
