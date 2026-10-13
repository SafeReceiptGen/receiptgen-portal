import type { LogisticsMethod, ReturnStatus } from "@/types/returns";

/** Customer-facing phases. Post-approval statuses never roll back into pending review. */
export type CustomerReturnPhase =
  | "pending_review"
  | "pickup_scheduled"
  | "collected"
  | "in_transit"
  | "approved_refund_pending"
  | "exchange_pending"
  | "item_received"
  | "rejected"
  | "cancelled"
  | "refund_processed"
  | "exchange_processed";

export const CUSTOMER_PHASE_LABELS: Record<CustomerReturnPhase, string> = {
  pending_review: "Pending review",
  pickup_scheduled: "Pickup scheduled",
  collected: "Collected",
  in_transit: "In transit",
  approved_refund_pending: "Approved — refund pending",
  exchange_pending: "Exchange pending",
  item_received: "Item received",
  rejected: "Rejected",
  cancelled: "Cancelled",
  refund_processed: "Refund processed",
  exchange_processed: "Exchange processed",
};

export function isExchangeRefundType(refundTypeCode?: string | null): boolean {
  return (refundTypeCode ?? "").toLowerCase() === "exchange_only";
}

export function resolveCustomerReturnPhase(
  status: ReturnStatus,
  refundTypeCode?: string | null,
): CustomerReturnPhase {
  const exchange = isExchangeRefundType(refundTypeCode);
  switch (status) {
    case "PENDING":
      return "pending_review";
    case "PICKUP_SCHEDULED":
      return "pickup_scheduled";
    case "COLLECTED":
      return "collected";
    case "IN_TRANSIT":
      return "in_transit";
    case "APPROVED":
      return exchange ? "exchange_pending" : "approved_refund_pending";
    case "WITH_RETAILER":
      return "item_received";
    case "REJECTED":
      return "rejected";
    case "CANCELLED":
      return "cancelled";
    case "REFUNDED":
    case "REFUND_COMPLETED":
      return "refund_processed";
    case "EXCHANGE_COMPLETED":
      return "exchange_processed";
    case "COMPLETED":
      return exchange ? "exchange_processed" : "refund_processed";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export type AcStepState = "complete" | "current" | "upcoming" | "skipped";

export type AcStepperStep = {
  key: CustomerReturnPhase;
  label: string;
  state: AcStepState;
};

function isProcessedStatus(status: ReturnStatus): boolean {
  return (
    status === "REFUNDED" ||
    status === "REFUND_COMPLETED" ||
    status === "EXCHANGE_COMPLETED" ||
    status === "COMPLETED"
  );
}

function isClosedStatus(status: ReturnStatus): boolean {
  return status === "REJECTED" || status === "CANCELLED";
}

/**
 * Forward steps: review, optional pickup, approved outcome, then processed.
 * Rejected and cancelled replace the outcome steps.
 */
export function getAcStepperSteps(
  status: ReturnStatus,
  logisticsMethod: LogisticsMethod,
  refundTypeCode?: string | null,
): AcStepperStep[] {
  const dropOff = logisticsMethod === "DROP_OFF";
  const exchange = isExchangeRefundType(refundTypeCode);
  const closed = isClosedStatus(status);
  const processed = isProcessedStatus(status);

  let pendingReview: AcStepState;
  if (status === "PENDING") {
    pendingReview = "current";
  } else {
    pendingReview = "complete";
  }

  let pickupScheduled: AcStepState;
  if (dropOff || closed) {
    pickupScheduled = "skipped";
  } else if (status === "PICKUP_SCHEDULED") {
    pickupScheduled = "current";
  } else if (status === "PENDING") {
    pickupScheduled = "upcoming";
  } else {
    pickupScheduled = "complete";
  }

  let approved: AcStepState;
  if (closed) {
    approved = "skipped";
  } else if (status === "APPROVED") {
    approved = "current";
  } else if (processed || status === "WITH_RETAILER") {
    approved = "complete";
  } else {
    approved = "upcoming";
  }

  let refundProcessed: AcStepState;
  if (closed) {
    refundProcessed = "skipped";
  } else if (processed) {
    refundProcessed = "complete";
  } else if (status === "WITH_RETAILER") {
    refundProcessed = "current";
  } else {
    refundProcessed = "upcoming";
  }

  const steps: AcStepperStep[] = [
    {
      key: "pending_review",
      label: CUSTOMER_PHASE_LABELS.pending_review,
      state: pendingReview,
    },
    {
      key: "pickup_scheduled",
      label: CUSTOMER_PHASE_LABELS.pickup_scheduled,
      state: pickupScheduled,
    },
    {
      key: exchange ? "exchange_pending" : "approved_refund_pending",
      label: exchange
        ? CUSTOMER_PHASE_LABELS.exchange_pending
        : CUSTOMER_PHASE_LABELS.approved_refund_pending,
      state: approved,
    },
    {
      key:
        status === "WITH_RETAILER"
          ? "item_received"
          : exchange
            ? "exchange_processed"
            : "refund_processed",
      label:
        status === "WITH_RETAILER"
          ? CUSTOMER_PHASE_LABELS.item_received
          : exchange
            ? CUSTOMER_PHASE_LABELS.exchange_processed
            : CUSTOMER_PHASE_LABELS.refund_processed,
      state: refundProcessed,
    },
  ];

  if (status === "REJECTED") {
    steps.push({
      key: "rejected",
      label: CUSTOMER_PHASE_LABELS.rejected,
      state: "current",
    });
  } else if (status === "CANCELLED") {
    steps.push({
      key: "cancelled",
      label: CUSTOMER_PHASE_LABELS.cancelled,
      state: "current",
    });
  }

  return steps;
}

/** Headline for refund vs exchange when the return is processed. */
export function processedOutcomeHeadline(refundTypeCode?: string | null): string {
  return isExchangeRefundType(refundTypeCode)
    ? "Exchange processed"
    : "Refund processed";
}
