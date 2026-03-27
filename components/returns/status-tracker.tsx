"use client";

import {
  ReturnStatus,
  LogisticsMethod,
  RETURN_STATUS_LABELS,
  RETURN_STATUS_STEPS,
} from "@/types/returns";
import {
  Clock,
  Package,
  Truck,
  Store,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stepIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock size={20} />,
  COLLECTED: <Package size={20} />,
  IN_TRANSIT: <Truck size={20} />,
  WITH_RETAILER: <Store size={20} />,
};

function labelForFirstStep(
  index: number,
  isPast: boolean,
  isCurrent: boolean,
  currentStatus: ReturnStatus,
  logisticsMethod?: LogisticsMethod,
) {
  if (index !== 0) return null;
  if (isPast) {
    return logisticsMethod === "HOME_PICKUP"
      ? RETURN_STATUS_LABELS.PICKUP_SCHEDULED
      : RETURN_STATUS_LABELS.PENDING;
  }
  if (isCurrent && currentStatus === "PICKUP_SCHEDULED") {
    return RETURN_STATUS_LABELS.PICKUP_SCHEDULED;
  }
  return RETURN_STATUS_LABELS.PENDING;
}

interface StatusTrackerProps {
  currentStatus: ReturnStatus;
  /** Used to label step 1 after home pickup vs drop-off once past that step. */
  logisticsMethod?: LogisticsMethod;
  className?: string;
}

export function StatusTracker({
  currentStatus,
  logisticsMethod,
  className,
}: StatusTrackerProps) {
  const isApproved =
    currentStatus === "APPROVED" || currentStatus === "REFUNDED";
  const isRejected = currentStatus === "REJECTED";
  const isTerminal = isApproved || isRejected;

  const statusToIndex: Record<string, number> = {
    PICKUP_SCHEDULED: 0,
    PENDING: 0,
    COLLECTED: 1,
    IN_TRANSIT: 2,
    WITH_RETAILER: 3,
    APPROVED: 4,
    REJECTED: 4,
    REFUNDED: 4,
  };

  const currentIndex = statusToIndex[currentStatus] ?? 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {RETURN_STATUS_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex && !isTerminal;
          const isPast = isComplete;

          const firstLabel = labelForFirstStep(
            index,
            isPast,
            isCurrent,
            currentStatus,
            logisticsMethod,
          );
          const stepLabel =
            firstLabel !== null ? firstLabel : RETURN_STATUS_LABELS[step];

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isPast &&
                      "border-green-500 bg-green-500 text-white dark:border-green-400 dark:bg-green-400 dark:text-green-950",
                    isCurrent &&
                      "border-primary bg-primary/10 text-primary dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-400",
                    !isPast &&
                      !isCurrent &&
                      "border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white/30",
                  )}
                >
                  {isPast ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    stepIcons[step]
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium text-center max-w-[80px]",
                    isPast && "text-green-600 dark:text-green-400",
                    isCurrent && "text-primary font-semibold dark:text-blue-400",
                    !isPast &&
                      !isCurrent &&
                      "text-slate-400 dark:text-white/30",
                  )}
                >
                  {stepLabel}
                </span>
              </div>

              {index < RETURN_STATUS_STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mb-6 rounded-full transition-all",
                    index < currentIndex
                      ? "bg-green-500 dark:bg-green-400"
                      : "bg-slate-200 dark:bg-white/10",
                  )}
                />
              )}
            </div>
          );
        })}

        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
              isApproved &&
                "border-green-500 bg-green-500 text-white dark:border-green-400 dark:bg-green-400 dark:text-green-950",
              isRejected &&
                "border-red-500 bg-red-500 text-white dark:border-red-400 dark:bg-red-400 dark:text-red-950",
              !isTerminal &&
                "border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white/30",
            )}
          >
            {isApproved ? (
              <CheckCircle2 size={20} />
            ) : isRejected ? (
              <XCircle size={20} />
            ) : (
              <Store size={20} />
            )}
          </div>
          <span
            className={cn(
              "text-[11px] font-medium text-center max-w-[80px]",
              isApproved && "text-green-600 font-semibold dark:text-green-400",
              isRejected && "text-red-600 font-semibold dark:text-red-400",
              !isTerminal && "text-slate-400 dark:text-white/30",
            )}
          >
            {isTerminal
              ? RETURN_STATUS_LABELS[currentStatus]
              : "Decision"}
          </span>
        </div>
      </div>
    </div>
  );
}
