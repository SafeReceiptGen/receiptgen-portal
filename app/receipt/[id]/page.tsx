import { verifyApi, ApiRequestError } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronRight, Receipt, RotateCcw, ShieldCheck,  Calendar } from "lucide-react";
import Image from "next/image";
import { cn, mapToReceiptForReturn } from "@/lib/utils";
import {
  formatPaymentMethodLabel,
  formatReceiptStatusLabel,
  formatReturnDeadline,
} from "@/lib/receipt-display-labels";
import { BrandLogoImage } from "@/components/receipt/brand-logo-image";
import { RECEIPT_LOGO_SLOT_PX } from "@/lib/receipt-logo-display";

export default async function DigitalReceiptPage({
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
      throw error; // Let error boundary handle unexpected errors
    }
  }

  // ─── Not Found ────────────────────────────────────────────────────────────
  if (!receipt) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center bg-slate-50 dark:bg-[#071427]">
        <Receipt size={32} className="text-slate-400 dark:text-white/40 mb-4" />
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Receipt Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-white/50 max-w-sm">
          We couldn't find this receipt. It may have expired or the link might
          be incorrect.
        </p>
      </div>
    );
  }

  // ─── Calculations ──────────────────────────────────────────────────────────
  const subtotal = receipt.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const hasPolicy = receipt.returnWindow !== "No returns";
  const returnDeadlineLabel = formatReturnDeadline(receipt.returnDeadline);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-200 selection:text-blue-900 dark:bg-[#050B16] dark:selection:bg-blue-900 dark:selection:text-blue-200">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 hidden bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(59,130,246,0.08),transparent_50%),radial-gradient(900px_circle_at_80%_10%,rgba(99,102,241,0.05),transparent_55%),radial-gradient(800px_circle_at_50%_100%,rgba(255,255,255,0.02),transparent_55%)] dark:block" />
      <div
        className="pointer-events-none fixed inset-0 hidden opacity-20 dark:block"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-20 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-white/6 dark:bg-[#050B16]/80">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <div className="flex flex-1" />
          <div className="flex shrink-0 items-center justify-center gap-2">
            <Image
              src="/logo.jpg"
              alt="SafeReceipt Logo"
              width={20}
              height={20}
              className="rounded"
            />
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              SafeReceipt
            </span>
          </div>
          <div className="flex flex-1 justify-end"></div>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 pb-32 pt-6 sm:px-6 md:pt-10">
        {/* ── Receipt Card Header ── */}
        <div className="relative z-10 mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
          <div
            className="relative rounded-t-3xl bg-white px-8 pb-6 pt-10 text-slate-900 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 dark:bg-white dark:shadow-none dark:ring-0"
            style={{
              background:
                "radial-gradient(circle at bottom left, transparent 12px, #ffffff 12.5px) top left / 51% 100% no-repeat, radial-gradient(circle at bottom right, transparent 12px, #ffffff 12.5px) top right / 51% 100% no-repeat",
            }}
          >
            {/* Store Info */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <BrandLogoImage
                  url={receipt.retailerLogoUrl}
                  alt={`${receipt.retailerName?.trim() || receipt.storeName} logo`}
                  className="mb-3 rounded-md object-contain ring-1 ring-slate-200 dark:ring-white/15"
                  style={{
                    width: RECEIPT_LOGO_SLOT_PX,
                    height: RECEIPT_LOGO_SLOT_PX,
                  }}
                />
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {receipt.retailerName?.trim() || receipt.storeName}
                </h1>
                {receipt.retailerName?.trim() &&
                receipt.storeLocation?.trim() &&
                receipt.retailerName.trim() !== receipt.storeLocation.trim() ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {receipt.storeLocation}
                  </p>
                ) : null}
<div className="mt-2 flex flex-col gap-2">

<div className="inline-flex items-center gap-2">
    <ShieldCheck size={14} className="text-emerald-600" />
    <span className="text-xs font-semibold text-emerald-700">
      Verified by SafeReceipts
    </span>
  </div>
</div>





                {receipt.storePhone && (
                  <p className="mt-3 text-sm text-slate-500">
                    {receipt.storePhone}
                  </p>
                )}
              </div>
              

<div className="text-right leading-tight">
  <p className=" text-sm font-medium text-slate-500">
    Receipt No. {receipt.receiptNumber}
  </p>

<p className="mt-2 text-sm text-slate-400">
  {format(new Date(receipt.purchasedAt), "MMM d, yyyy")}
</p>

<p className="text-sm text-slate-400">
  {format(new Date(receipt.purchasedAt), "h:mm a")}
</p>

 
</div>
 </div>

            <div className="mb-4 text-center">
              {receipt.status && receipt.status !== "issued" && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  {formatReceiptStatusLabel(receipt.status)}
                </p>
              )}

<div className="mb-5 flex justify-center">
  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-2">
    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

    <span className="text-sm font-bold uppercase tracking-wide text-emerald-700">
      Paid
    </span>
  </div>
</div>


   <h2 className="text-lg font-bold text-slate-900">
                Thank you for your purchase!
                {receipt.customerName ? `, ${receipt.customerName}` : ""}!
              </h2>
            </div>

            {/* Dashed line corresponding to the physical receipt cut */}
            <div className="absolute bottom-0 left-3 right-3 border-b-2 border-dashed border-slate-200/80"></div>
          </div>

          {/* ── Receipt Card Body ── */}
          <div
            className="relative rounded-b-3xl bg-white px-8 pb-10 pt-8 text-slate-900 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 dark:bg-white dark:shadow-none dark:ring-0"
            style={{
              background:
                "radial-gradient(circle at top left, transparent 12px, #ffffff 12.5px) bottom left / 51% 100% no-repeat, radial-gradient(circle at top right, transparent 12px, #ffffff 12.5px) bottom right / 51% 100% no-repeat",
            }}
          >
            {/* Items List */}
            <div className="mb-10 space-y-8">
              {receipt.items.map((item, idx) => (
                <div key={item.id} className="flex items-start text-sm py-1">
                  <span className="w-6 shrink-0 pt-0.5 font-medium text-slate-400">
                    {idx + 1}.
                  </span>

                  <div className="flex-1 space-y-1">
                    {/* Name + Price row */}
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-bold text-slate-900  leading-snug pr-4">
                        {item.name}
                      </span>

                      <span className="font-bold whitespace-nowrap text-slate-900">
                        {formatCurrency(
                          item.price * item.quantity,
                          receipt.currency
                        )}
                      </span>
                    </div>

                    { /* Variant / Detail */ }
                    {item.detail && (
                      <p className=" mt-2 text-xs text-slate-500 leading-relaxed">
                        {item.detail}
                      </p>
                    )}

                    {/* Qty + unit price */}
                    <p className=" mt-2 text-xs font-medium text-slate-400">
                      {item.quantity} × {formatCurrency(item.price, receipt.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Box */}
            <div className="mb-8 rounded-3xl bg-slate-50 px-6 py-6 ring-1 ring-slate-100/80 space-y-3">
              <div className=" flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-600">Total</span>
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(subtotal, receipt.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                <span className="text-slate-500">Payment method</span>
                <span className="font-semibold text-slate-700">
                  {formatPaymentMethodLabel(receipt.paymentMethod)}
                </span>
              </div>
            </div>

            {/* Return Policy Notice */}
            {hasPolicy && (
              <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-blue-700">
                  <RotateCcw size={16} strokeWidth={2.5} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Return Policy
                  </span>
                </div>
                <div className="space-y-1 text-sm leading-snug">
                 
 <p className="text-slate-700">
        You can request a return within{" "}
        <span className="font-semibold">
          {receipt.returnWindow || "7 days"}
        </span>{" "}
        of purchase.
      </p>

{returnDeadlineLabel && (
  <>
    <p className="mt-4 text-sm text-slate-500">
      Return window closes on:
    </p>

    <div className="mt-2 flex items-center  gap-2 ">
      <Calendar
        size={16}
        className="text-slate-400 shrink-0"
      />

      <span className="font-semibold text-slate-900">
        {returnDeadlineLabel}
      </span>
    </div>
  </>
)}

 {receipt.returnCondition !== "See store policy" && (
                    <p>
                      <span className="font-medium text-slate-500">Condition:</span>{" "}
                      <span className="font-semibold text-slate-900">
                        {receipt.returnCondition}
                      </span>
                    </p>
                  )}
                  {receipt.refundType !== "See store policy" && (
                    <p>
                      <span className="font-medium text-slate-500">Refund:</span>{" "}
                      <span className="font-semibold text-slate-900">
                        {receipt.refundType}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Branding Footer */}
           <div className="mt-10 border-t border-slate-100 pt-6">
  <div className="flex items-end justify-between">
    <div>
      <p className="text-xs font-bold tracking-wide text-slate-500">
        GETSAFERECEIPTS.COM
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Securely verified and stored
      </p>
    </div>

    <p className="text-xs font-bold tracking-wide text-slate-400">
      AUTHENTIC RECORD
    </p>
  </div>
</div> 

 </div>
        </div>
      </main>

      {/* ── Floating Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200/80 bg-white/95 px-4 pb-safe pt-4 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-[#071427]/95">
        <div className="mx-auto flex max-w-lg items-center justify-between pb-4">
          <div className="mr-4 flex-1">
            <p className="text-xs font-medium text-slate-500 dark:text-white/60">
              Need to return an item?
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 dark:text-white/40">
              Subject to store policy
            </p>
          </div>
          <Link
            href={`/receipt/${token}/return`}
            className={cn(
              "group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-900 px-6 py-3.5 pl-7 text-sm font-semibold text-white shadow-lg ring-1 ring-black/5 transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white/90",
              !hasPolicy && "opacity-50 grayscale cursor-not-allowed pointer-events-none"
            )}
          >
            <span className="relative z-10">Start a Return</span>
            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5 dark:bg-black/10">
              <ChevronRight size={14} strokeWidth={3} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
