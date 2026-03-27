"use client";

import { ReturnStatus, RETURN_STATUS_LABELS } from "@/types/returns";
import {
  Clock,
  Package,
  Truck,
  Store,
  CheckCircle2,
  XCircle,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  ReturnStatus,
  { className: string; icon: React.ReactNode }
> = {
  PICKUP_SCHEDULED: {
    className:
      "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20",
    icon: <Clock size={12} />,
  },
  PENDING: {
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    icon: <Clock size={12} />,
  },
  COLLECTED: {
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
    icon: <Package size={12} />,
  },
  IN_TRANSIT: {
    className:
      "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20",
    icon: <Truck size={12} />,
  },
  WITH_RETAILER: {
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
    icon: <Store size={12} />,
  },
  APPROVED: {
    className:
      "bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
    icon: <CheckCircle2 size={12} />,
  },
  REJECTED: {
    className:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
    icon: <XCircle size={12} />,
  },
  REFUNDED: {
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    icon: <Banknote size={12} />,
  },
};

interface StatusBadgeProps {
  status: ReturnStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        config.className,
        className,
      )}
    >
      {config.icon}
      {RETURN_STATUS_LABELS[status]}
    </span>
  );
}
