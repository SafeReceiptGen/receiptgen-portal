"use client";

import { useRouter } from "next/navigation";
import { MOCK_PUDO_POINTS } from "@/lib/mock-data";
import {
  RETURN_REASON_LABELS,
  REFUND_METHOD_LABELS,
  LOGISTICS_METHOD_LABELS,
  ReturnRequest,
} from "@/types/returns";
import { processedOutcomeHeadline } from "@/lib/return-customer-status";
import { StatusTracker } from "@/components/returns/status-tracker";
import { StatusBadge } from "@/components/returns/status-badge";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { formatPickupAddressDisplay } from "@/lib/format-pickup-address";
import Link from "next/link";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  RotateCcw,
  MapPin,
  Phone,
} from "lucide-react";

export default function ReturnStatusClient({
  returnData,
  returnId,
  returnTrackingUrl,
}: {
  returnData: ReturnRequest | undefined;
  returnId: string;
  /** Canonical absolute URL to this return status (includes ?token=). */
  returnTrackingUrl?: string;
}) {
  void returnId;
  const router = useRouter();

  // ─── Not Found ────────────────────────────────────────────────────────────
  if (!returnData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-white/10">
          <Package size={28} className="text-slate-400 dark:text-white/40" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 font-display dark:text-white">
          Return Not Found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-white/50">
          We couldn&apos;t find a return with this ID. Please check the link or
          contact support.
        </p>
        <Link
          href="/"
          className="mt-6 text-sm font-medium text-primary hover:underline dark:text-blue-400"
        >
          Go to SafeReceipts
        </Link>
      </div>
    );
  }

  const isRefunded = returnData.status === "REFUNDED";
  const isApprovedOnly = returnData.status === "APPROVED";
  const isRejected = returnData.status === "REJECTED";
  const isTerminal = isRefunded || isApprovedOnly || isRejected;
  const pudoPoint = MOCK_PUDO_POINTS.find(
    (p) => p.id === returnData.logistics.pudoPointId,
  );

  // Latest activity
  const latestActivity =
    returnData.activityLog[returnData.activityLog.length - 1];

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8 sm:px-6 md:py-12">
      {/* Top bar */}
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-white/50 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="SafeReceipt Logo"
              width={20}
              height={20}
              className="rounded"
            />
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Return<span className="text-primary">Flow</span>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-4">
        {/* ─── Header Card ───────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 dark:bg-[#111827] dark:ring-white/10">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display dark:text-white">
                  Return Status
                </h1>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
                  {returnData.returnNumber}
                </p>
              </div>
              <StatusBadge status={returnData.status} />
            </div>

            {/* Status tracker */}
            <div className="mt-6">
              <StatusTracker
                currentStatus={returnData.status}
                logisticsMethod={returnData.logistics.method}
              />
            </div>

            {/* Latest update */}
            {latestActivity && (
              <div className="mt-6 flex items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-white/4">
                <Clock
                  size={14}
                  className="mt-0.5 shrink-0 text-slate-400 dark:text-white/30"
                />
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-white/80">
                    {latestActivity.action}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-white/30">
                    {formatDistanceToNow(new Date(latestActivity.createdAt), {
                      addSuffix: true,
                    })}{" "}
                    · {latestActivity.performedBy}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Outcome Card (only if terminal) ───────────────────────────── */}
        {isTerminal && (
          <div
            className={cn(
              "overflow-hidden rounded-2xl shadow-sm ring-1",
              isRejected
                ? "bg-white ring-red-200 dark:bg-[#111827] dark:ring-red-500/20"
                : isRefunded
                  ? "bg-white ring-emerald-200 dark:bg-[#111827] dark:ring-emerald-500/20"
                  : "bg-white ring-green-200 dark:bg-[#111827] dark:ring-green-500/20",
            )}
          >
            <div className="px-6 py-5 text-center">
              {isRefunded ? (
                <>
                  <CheckCircle2
                    size={40}
                    className="mx-auto text-emerald-500 dark:text-emerald-400"
                  />
                  <h2 className="mt-3 text-lg font-bold text-slate-900 font-display dark:text-white">
                    {processedOutcomeHeadline(returnData.refundTypeCode)}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                    Your return is complete.
                  </p>
                </>
              ) : isApprovedOnly ? (
                <>
                  <CheckCircle2
                    size={40}
                    className="mx-auto text-green-500 dark:text-green-400"
                  />
                  <h2 className="mt-3 text-lg font-bold text-slate-900 font-display dark:text-white">
                    Return approved
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                    Refund or exchange will follow according to the store&apos;s
                    timeline.
                  </p>
                </>
              ) : (
                <>
                  <XCircle
                    size={40}
                    className="mx-auto text-red-500 dark:text-red-400"
                  />
                  <h2 className="mt-3 text-lg font-bold text-slate-900 font-display dark:text-white">
                    Return rejected
                  </h2>
                </>
              )}

              {/* QR Code */}
              {returnTrackingUrl && (
                <div className="mt-5 flex justify-center">
                  <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-white/10">
                    <QRCodeSVG
                      value={returnTrackingUrl}
                      size={80}
                      level="M"
                      fgColor="#18181b"
                    />
                  </div>
                </div>
              )}
              {returnTrackingUrl && (
                <p className="mt-1 text-[10px] text-slate-400 dark:text-white/30">
                  Your Return QR
                </p>
              )}

              {/* Amount */}
              <p
                className={cn(
                  "mt-4 text-3xl font-bold tracking-tight",
                  isRejected
                    ? "text-red-500 dark:text-red-400"
                    : isRefunded
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-green-500 dark:text-green-400",
                )}
              >
                {formatCurrency(returnData.refundAmount, returnData.currency)}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                {isRefunded
                  ? `Processed with ${returnData.retailerName}`
                  : isApprovedOnly
                    ? `Approved by ${returnData.retailerName}`
                    : `Refund was not approved by ${returnData.retailerName}`}
              </p>

              {/* Refund method when known */}
              {(isApprovedOnly || isRefunded) && returnData.refundMethod && (
                <p
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isRefunded
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-green-600 dark:text-green-400",
                  )}
                >
                  via {REFUND_METHOD_LABELS[returnData.refundMethod]}
                </p>
              )}

              {/* Rejection reason */}
              {isRejected && returnData.rejectionReason && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-left dark:border-red-500/20 dark:bg-red-500/10">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    Reason for rejection
                  </p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {returnData.rejectionReason}
                  </p>
                </div>
              )}

              {/* Action buttons for rejected */}
              {isRejected && (
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-black/5 transition-all hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white/90"
                  >
                    <ShoppingBag size={16} />
                    Sell to SafeReceipts
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-black/5 transition-all hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white/90"
                  >
                    <RotateCcw size={16} />
                    Return Item(s)
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/4"
                  >
                    Close Case
                  </button>
                </div>
              )}

              {/* Close button for approved / processed */}
              {(isApprovedOnly || isRefunded) && (
                <div className="mt-6">
                  <Link
                    href={`/receipt/${returnData.receiptQrToken ?? returnData.receiptId}`}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-10 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-black/5 transition-all hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white/90"
                  >
                    Close
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Return QR (non-terminal) ──────────────────────────────────── */}
        {!isTerminal && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 dark:bg-[#111827] dark:ring-white/10">
            <div className="px-6 py-5 text-center">
              {returnTrackingUrl && (
                <>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Your Return QR
                  </p>
                  <div className="flex justify-center">
                    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10">
                      <QRCodeSVG
                        value={returnTrackingUrl}
                        size={100}
                        level="M"
                        fgColor="#18181b"
                      />
                    </div>
                  </div>
                </>
              )}
              <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(returnData.refundAmount, returnData.currency)}
              </p>
              <p className="text-xs text-slate-500 dark:text-white/50">
                {returnData.retailerName}
              </p>
            </div>
          </div>
        )}

        {/* ─── Return Details ────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 dark:bg-[#111827] dark:ring-white/10">
          <div className="px-6 py-5 space-y-5">
            {/* Items */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50 mb-3">
                Items
              </h3>
              {returnData.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/50">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 whitespace-nowrap dark:text-white">
                    {formatCurrency(item.price * item.quantity, returnData.currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50 mb-2">
                Reason
              </h3>
              <p className="text-sm font-medium text-slate-700 dark:text-white/80">
                {RETURN_REASON_LABELS[returnData.returnReason]}
              </p>
              {returnData.reasonDescription && (
                <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                  &ldquo;{returnData.reasonDescription}&rdquo;
                </p>
              )}
            </div>

            {/* Logistics */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50 mb-2">
                Return Method
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-white/80">
                <MapPin size={14} className="text-primary dark:text-blue-400" />
                <span className="font-medium">
                  {LOGISTICS_METHOD_LABELS[returnData.logistics.method]}
                  {pudoPoint && ` — ${pudoPoint.name}`}
                </span>
              </div>
              {returnData.logistics.method === "HOME_PICKUP" &&
                returnData.logistics.pickupAddress && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-white/60">
                    {formatPickupAddressDisplay(
                      returnData.logistics.pickupAddress,
                    )}
                  </p>
                )}
              {returnData.logistics.method === "HOME_PICKUP" &&
                returnData.logistics.parcel && (
                  <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/4 dark:text-white/55">
                    <p className="text-slate-600 dark:text-white/55">
                      {returnData.logistics.parcel.description}
                    </p>
                    {(returnData.logistics.parcel.packageCount != null ||
                      returnData.logistics.parcel.weightKg != null) && (
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-white/50">
                        {returnData.logistics.parcel.packageCount != null && (
                          <>
                            {returnData.logistics.parcel.packageCount}{" "}
                            {returnData.logistics.parcel.packageCount === 1
                              ? "package"
                              : "packages"}
                          </>
                        )}
                        {returnData.logistics.parcel.weightKg != null
                          ? `${returnData.logistics.parcel.packageCount != null ? " · " : ""}~${returnData.logistics.parcel.weightKg} kg`
                          : ""}
                      </p>
                    )}
                  </div>
                )}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-slate-500 dark:text-white/50">
                <Phone size={12} className="shrink-0" />
                <span>
                  {returnData.logistics.phoneCountry}{" "}
                  {returnData.logistics.phoneNumber}
                </span>
                <span>·</span>
                <span>{returnData.logistics.timeSlot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Activity Log ──────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 dark:bg-[#111827] dark:ring-white/10">
          <div className="px-6 py-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50 mb-4">
              Activity
            </h3>
            <div className="space-y-0">
              {returnData.activityLog.map((log, index) => {
                const isLast = index === returnData.activityLog.length - 1;

                return (
                  <div key={log.id} className="flex gap-3">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0 mt-1.5",
                          isLast
                            ? "bg-primary ring-4 ring-primary/10 dark:bg-blue-400 dark:ring-blue-400/10"
                            : "bg-green-500 dark:bg-green-400",
                        )}
                      />
                      {!isLast && (
                        <div className="w-px flex-1 bg-slate-200 dark:bg-white/10" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-5">
                      <p className="text-sm font-medium text-slate-700 dark:text-white/80">
                        {log.action}
                      </p>
                      {log.notes && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
                          {log.notes}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-slate-400 dark:text-white/30">
                        {format(new Date(log.createdAt), "PPP 'at' p")} ·{" "}
                        {log.performedBy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Branding footer */}
        <div className="pt-4 pb-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-400/50 dark:text-white/20">
            Powered by{" "}
            <span className="font-bold text-slate-400 dark:text-white/30">
              ReturnFlow
            </span>
            {" · "}
            <span className="font-bold text-slate-400 dark:text-white/30">
              SafeReceipts
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
