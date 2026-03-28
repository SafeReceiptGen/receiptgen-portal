import type { LogisticsMethod, ReturnStatus } from "@/types/returns";

/** Customer-facing phases (matches AC). */
export type CustomerReturnPhase =
  | "pending_review"
  | "pickup_scheduled"
  | "approved"
  | "rejected"
  | "refund_or_exchange_processed";

export const CUSTOMER_PHASE_LABELS: Record<CustomerReturnPhase, string> = {
  pending_review: "Pending review",
  pickup_scheduled: "Pickup scheduled",
  approved: "Approved",
  rejected: "Rejected",
  refund_or_exchange_processed: "Refund/exchange processed",
};

export function resolveCustomerReturnPhase(
  status: ReturnStatus,
): CustomerReturnPhase {
  switch (status) {
    case "REFUNDED":
      return "refund_or_exchange_processed";
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "PICKUP_SCHEDULED":
      return "pickup_scheduled";
    case "PENDING":
    case "COLLECTED":
    case "IN_TRANSIT":
    case "WITH_RETAILER":
    default:
      return "pending_review";
  }
}

export type AcStepState = "complete" | "current" | "upcoming" | "skipped";

export type AcStepperStep = {
  key: CustomerReturnPhase;
  label: string;
  state: AcStepState;
};

/**
 * Five AC steps in display order. Branching: Approved vs Rejected are mutually exclusive;
 * Pickup scheduled is skipped for drop-off.
 */
export function getAcStepperSteps(
  status: ReturnStatus,
  logisticsMethod: LogisticsMethod,
): AcStepperStep[] {
  const dropOff = logisticsMethod === "DROP_OFF";

  // Step: Pending review
  let pendingReview: AcStepState;
  if (
    status === "PENDING" ||
    status === "COLLECTED" ||
    status === "IN_TRANSIT" ||
    status === "WITH_RETAILER"
  ) {
    pendingReview = "current";
  } else if (status === "PICKUP_SCHEDULED") {
    pendingReview = "complete";
  } else {
    pendingReview = "complete";
  }

  // Step: Pickup scheduled (home pickup only)
  let pickupScheduled: AcStepState;
  if (dropOff) {
    pickupScheduled = "skipped";
  } else if (status === "PICKUP_SCHEDULED") {
    pickupScheduled = "current";
  } else if (status === "PENDING") {
    pickupScheduled = "upcoming";
  } else {
    pickupScheduled = "complete";
  }

  let approved: AcStepState;
  if (status === "APPROVED") {
    approved = "current";
  } else if (status === "REFUNDED") {
    approved = "complete";
  } else if (status === "REJECTED") {
    approved = "skipped";
  } else {
    approved = "upcoming";
  }

  let rejected: AcStepState;
  if (status === "REJECTED") {
    rejected = "current";
  } else if (
    status === "APPROVED" ||
    status === "REFUNDED"
  ) {
    rejected = "skipped";
  } else {
    rejected = "upcoming";
  }

  let refundProcessed: AcStepState;
  if (status === "REFUNDED") {
    refundProcessed = "complete";
  } else if (status === "REJECTED") {
    refundProcessed = "skipped";
  } else {
    refundProcessed = "upcoming";
  }

  return [
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
      key: "approved",
      label: CUSTOMER_PHASE_LABELS.approved,
      state: approved,
    },
    {
      key: "rejected",
      label: CUSTOMER_PHASE_LABELS.rejected,
      state: rejected,
    },
    {
      key: "refund_or_exchange_processed",
      label: CUSTOMER_PHASE_LABELS.refund_or_exchange_processed,
      state: refundProcessed,
    },
  ];
}

/** Headline for refund vs exchange when status is REFUNDED. */
export function processedOutcomeHeadline(refundTypeCode?: string | null): string {
  const t = (refundTypeCode ?? "").toLowerCase();
  if (t === "exchange_only") return "Exchange processed";
  return "Refund processed";
}
