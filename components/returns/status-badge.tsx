"use client";

import type { ReturnStatus } from "@/types/returns";
import {
  resolveCustomerReturnPhase,
  CUSTOMER_PHASE_LABELS,
  type CustomerReturnPhase,
} from "@/lib/return-customer-status";
import {
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  Banknote,
  Store,
  Truck,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const phaseConfig: Record<
  CustomerReturnPhase,
  { className: string; icon: React.ReactNode }
> = {
  pending_review: {
    className:
      "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
    icon: <Clock size={12} />,
  },
  pickup_scheduled: {
    className:
      "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20",
    icon: <Package size={12} />,
  },
  collected: {
    className:
      "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20",
    icon: <Package size={12} />,
  },
  in_transit: {
    className:
      "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20",
    icon: <Truck size={12} />,
  },
  approved_refund_pending: {
    className:
      "bg-green-50 text-green-800 ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
    icon: <CheckCircle2 size={12} />,
  },
  exchange_pending: {
    className:
      "bg-green-50 text-green-800 ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
    icon: <RefreshCw size={12} />,
  },
  item_received: {
    className:
      "bg-green-50 text-green-800 ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
    icon: <Store size={12} />,
  },
  rejected: {
    className:
      "bg-red-50 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
    icon: <XCircle size={12} />,
  },
  cancelled: {
    className:
      "bg-red-50 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
    icon: <XCircle size={12} />,
  },
  refund_processed: {
    className:
      "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    icon: <Banknote size={12} />,
  },
  exchange_processed: {
    className:
      "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    icon: <RefreshCw size={12} />,
  },
};

interface StatusBadgeProps {
  status: ReturnStatus;
  refundTypeCode?: string | null;
  className?: string;
}

export function StatusBadge({
  status,
  refundTypeCode,
  className,
}: StatusBadgeProps) {
  const phase = resolveCustomerReturnPhase(status, refundTypeCode);
  const config = phaseConfig[phase];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        config.className,
        className,
      )}
    >
      {config.icon}
      {CUSTOMER_PHASE_LABELS[phase]}
    </span>
  );
}
