import {
  verifyApi,
  ApiRequestError,
  returnsApi,
} from "@/lib/api";
import { checkEligibility } from "@/lib/eligibility";
import { ACTIVE_RETURN_IN_PROGRESS_MESSAGE } from "@/lib/return-active";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Package,
  Calendar,
  Undo2,
  ChevronRight,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { cn, mapToReceiptForReturn } from "@/lib/utils";

export default async function EligibilityDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;
  const token = unwrappedParams.id;

  // Fetch receipt from the real backend via QR token
  let receipt;
  try {
    const { receipt: verified } = await verifyApi.getByToken(token);
    receipt = mapToReceiptForReturn(verified, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      receipt = null;
    } else {
      throw error;
    }
  }

  // ─── Not Found ────────────────────────────────────────────────────────────
  if (!receipt) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Package size={28} className="text-slate-400 dark:text-white/40" />
        <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Receipt Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-white/50">
          We couldn't find this receipt.
        </p>
        <Link
          href={`/receipt/${token}`}
          className="mt-4 text-sm font-medium text-primary hover:underline dark:text-blue-400"
        >
          Back to Receipt
        </Link>
      </div>
    );
  }

  let serverEligibility = null as Awaited<
    ReturnType<typeof returnsApi.getEligibility>
  > | null;
  try {
    serverEligibility = await returnsApi.getEligibility(token);
  } catch {
    serverEligibility = null;
  }

  const fallback = checkEligibility(receipt, []);
  const activeReturn = serverEligibility?.activeReturn ?? null;
  const returnInProgress = activeReturn != null;

  const eligible =
    serverEligibility !== null
      ? serverEligibility.eligible && receipt.isReturnable !== false
      : fallback.eligible;

  const daysRemaining =
    serverEligibility?.policy?.daysRemaining ?? fallback.daysRemaining;

  const reason = returnInProgress
    ? ACTIVE_RETURN_IN_PROGRESS_MESSAGE
    : !eligible
      ? serverEligibility?.reasons?.length
        ? serverEligibility.reasons.join(" ")
        : fallback.reason
      : serverEligibility?.policy?.daysRemaining != null
        ? `You have ${serverEligibility.policy.daysRemaining} day${serverEligibility.policy.daysRemaining === 1 ? "" : "s"} remaining to return items from this receipt.`
        : fallback.reason;

  const alreadyReturnedItemIds =
    serverEligibility?.items
      .filter((i) => i.returnable === 0 && i.alreadyReturned > 0)
      .map((i) => i.id) ?? fallback.alreadyReturnedItemIds;

  const eligibility = {
    eligible,
    daysRemaining,
    reason,
    alreadyReturnedItemIds,
    returnInProgress,
    activeReturn,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111827]">
      {/* ── Header ── */}
      <header className="fixed left-0 right-0 top-0 z-10 flex h-16 items-center justify-center border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#111827]/80">
        <span className="font-display font-bold text-slate-900 dark:text-white">
          {receipt.storeName}
        </span>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-24 pt-24 sm:px-6">
        {/* ── Status Hero Card ── */}
        <div className="mb-6 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 fade-in duration-500">
          {eligibility.eligible ? (
            <>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 ring-4 ring-green-100 dark:bg-green-500/10 dark:ring-green-500/20">
                <CheckCircle2
                  size={40}
                  className="text-green-500 dark:text-green-400"
                />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Eligible for Return
              </h1>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-white/10 dark:text-white/80">
                <Calendar size={14} className="opacity-70" />
                {eligibility.daysRemaining === 0
                  ? "Last day!"
                  : `${eligibility.daysRemaining} days remaining`}
              </span>
            </>
          ) : eligibility.returnInProgress ? (
            <>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 ring-4 ring-amber-100 dark:bg-amber-500/10 dark:ring-amber-500/20">
                <Clock
                  size={40}
                  className="text-amber-500 dark:text-amber-400"
                />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Return In Progress
              </h1>
            </>
          ) : (
            <>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100 dark:bg-red-500/10 dark:ring-red-500/20">
                <XCircle size={40} className="text-red-500 dark:text-red-400" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {receipt.isReturnable === false
                  ? "Not Returnable"
                  : "Window Closed"}
              </h1>
            </>
          )}

          <p className="mt-4 text-sm text-slate-500 dark:text-white/60">
            {eligibility.reason}
          </p>
        </div>

        {/* ── Policy Summary ── */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/5 dark:bg-white/5">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
              <ShieldAlert size={14} /> Store Return Policy
            </h2>
          </div>
          <div className="divide-y divide-slate-100 px-4 dark:divide-white/5">
            <div className="flex items-center justify-between py-3 text-sm">
              <span className="text-slate-500 dark:text-white/50">
                Return Window
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {receipt.returnWindow}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 text-sm">
              <span className="text-slate-500 dark:text-white/50">
                Condition
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {receipt.returnCondition}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 text-sm">
              <span className="text-slate-500 dark:text-white/50">
                Refund Method
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {receipt.refundType}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 text-sm">
              <span className="text-slate-500 dark:text-white/50">
                Purchased On
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {format(new Date(receipt.purchasedAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* ── Items Preview ── */}
        <div className="mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200">
          <h3 className="mb-3 px-1 text-sm font-semibold text-slate-900 dark:text-white">
            Receipt Items
          </h3>
          <div className="space-y-3">
            {receipt.items.map((item) => {
              const isAlreadyReturned =
                eligibility.alreadyReturnedItemIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 transition-all",
                    isAlreadyReturned
                      ? "border-slate-100 bg-slate-50/50 opacity-60 dark:border-white/5 dark:bg-white/2"
                      : "border-slate-200 bg-white ring-1 ring-black/5 dark:border-white/10 dark:bg-white/5 dark:ring-white/5"
                  )}
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "truncate text-sm font-semibold",
                          isAlreadyReturned
                            ? "text-slate-500 line-through dark:text-white/50"
                            : "text-slate-900 dark:text-white"
                        )}
                      >
                        {item.name}
                      </p>
                      {isAlreadyReturned && (
                        <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-600 dark:bg-white/20 dark:text-white/70">
                          Returned
                        </span>
                      )}
                    </div>
                    {item.detail && (
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-white/50">
                        {item.detail}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-medium",
                      isAlreadyReturned
                        ? "text-slate-400 dark:text-white/40"
                        : "text-slate-900 dark:text-white"
                    )}
                  >
                    {formatCurrency(item.price * item.quantity, receipt.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Fixed Bottom Actions ── */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white px-4 pb-safe pt-4 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-[#111827]">
        <div className="mx-auto flex max-w-lg gap-3 pb-4">
          <Link
            href={`/receipt/${token}`}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
            aria-label="Back to receipt"
          >
            <Undo2 size={20} />
          </Link>

          {eligibility.eligible ? (
            <Link
              href={`/receipt/${token}/return/request`}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-lg ring-1 ring-black/5 transition-all hover:bg-primary-dark active:scale-[0.98] dark:ring-white/10"
            >
              Start Return Request <ChevronRight size={18} />
            </Link>
          ) : eligibility.returnInProgress && eligibility.activeReturn ? (
            <Link
              href={`/return/${eligibility.activeReturn.id}?token=${encodeURIComponent(token)}`}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-base font-semibold text-white shadow-lg ring-1 ring-black/5 transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
            >
              View Return Status <ChevronRight size={18} />
            </Link>
          ) : (
            <a
              href={receipt.storePhone ? `tel:${receipt.storePhone.replace(/\s+/g, "")}` : "#"}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-base font-semibold text-white shadow-lg ring-1 ring-black/5 transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
            >
              Contact Store Support
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
