import type { ReactNode } from "react";
import { format } from "date-fns";
import { Calendar, RotateCcw, ShieldCheck } from "lucide-react";
import { BrandLogoImage } from "@/components/receipt/brand-logo-image";
import { formatCurrency } from "@/lib/currency";
import type { ReceiptCardModel } from "@/lib/receipt-card-model";
import {
  formatPaymentMethodLabel,
  formatReceiptStatusLabel,
  formatReturnDeadline,
} from "@/lib/receipt-display-labels";
import { RECEIPT_LOGO_SLOT_PX } from "@/lib/receipt-logo-display";

export type ReceiptCardProps = {
  model: ReceiptCardModel;
  /** Optional footer slot (e.g. QR on PNG/preview). Live page omits this. */
  footerSlot?: ReactNode;
  className?: string;
};

/**
 * Shared torn-receipt card used by the public receipt page and the builder
 * preview (PNG capture). PDF recreates this layout in react-pdf separately.
 */
export function ReceiptCard({ model, footerSlot, className }: ReceiptCardProps) {
  const subtotal = model.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const hasPolicy = model.returnWindow !== "No returns";
  const returnDeadlineLabel = formatReturnDeadline(model.returnDeadline);
  const brandName = model.retailerName.trim() || "Store";
  const location = model.storeLocation?.trim();
  const showLocation =
    !!location && location !== brandName;

  return (
    <div className={className}>
      {/* Header */}
      <div
        className="relative rounded-t-3xl bg-white px-8 pb-6 pt-10 text-slate-900 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100"
        style={{
          background:
            "radial-gradient(circle at bottom left, transparent 12px, #ffffff 12.5px) top left / 51% 100% no-repeat, radial-gradient(circle at bottom right, transparent 12px, #ffffff 12.5px) top right / 51% 100% no-repeat",
        }}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <BrandLogoImage
              url={model.retailerLogoUrl}
              alt={`${brandName} logo`}
              className="mb-3 rounded-md object-contain ring-1 ring-slate-200"
              style={{
                width: RECEIPT_LOGO_SLOT_PX,
                height: RECEIPT_LOGO_SLOT_PX,
              }}
            />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {brandName}
            </h1>
            {showLocation ? (
              <p className="mt-1 text-sm text-slate-500">{location}</p>
            ) : null}
            <div className="mt-2 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  Verified by SafeReceipts
                </span>
              </div>
            </div>
            {model.storePhone ? (
              <p className="mt-3 text-sm text-slate-500">{model.storePhone}</p>
            ) : null}
          </div>

          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-slate-500">
              Receipt No. {model.receiptNumber}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {format(new Date(model.purchasedAt), "MMM d, yyyy")}
            </p>
            <p className="text-sm text-slate-400">
              {format(new Date(model.purchasedAt), "h:mm a")}
            </p>
          </div>
        </div>

        <div className="mb-4 text-center">
          {model.status && model.status !== "issued" ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
              {formatReceiptStatusLabel(model.status)}
            </p>
          ) : null}

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
            {model.customerName ? `, ${model.customerName}` : ""}!
          </h2>
        </div>

        <div className="absolute bottom-0 left-3 right-3 border-b-2 border-dashed border-slate-200/80" />
      </div>

      {/* Body */}
      <div
        className="relative rounded-b-3xl bg-white px-8 pb-10 pt-8 text-slate-900 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100"
        style={{
          background:
            "radial-gradient(circle at top left, transparent 12px, #ffffff 12.5px) bottom left / 51% 100% no-repeat, radial-gradient(circle at top right, transparent 12px, #ffffff 12.5px) bottom right / 51% 100% no-repeat",
        }}
      >
        <div className="mb-10 space-y-8">
          {model.items.map((item, idx) => (
            <div key={item.id} className="flex items-start py-1 text-sm">
              <span className="w-6 shrink-0 pt-0.5 font-medium text-slate-400">
                {idx + 1}.
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <span className="pr-4 font-bold leading-snug text-slate-900">
                    {item.name}
                  </span>
                  <span className="whitespace-nowrap font-bold text-slate-900">
                    {formatCurrency(item.price * item.quantity, model.currency)}
                  </span>
                </div>
                {item.detail ? (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {item.detail}
                  </p>
                ) : null}
                <p className="mt-2 text-xs font-medium text-slate-400">
                  {item.quantity} ×{" "}
                  {formatCurrency(item.price, model.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 space-y-3 rounded-3xl bg-slate-50 px-6 py-6 ring-1 ring-slate-100/80">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-slate-600">Total</span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(subtotal, model.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm">
            <span className="text-slate-500">Payment method</span>
            <span className="font-semibold text-slate-700">
              {formatPaymentMethodLabel(model.paymentMethod)}
            </span>
          </div>
        </div>

        {hasPolicy ? (
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
                  {model.returnWindow || "7 days"}
                </span>{" "}
                of purchase.
              </p>

              {returnDeadlineLabel ? (
                <>
                  <p className="mt-4 text-sm text-slate-500">
                    Return window closes on:
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Calendar size={16} className="shrink-0 text-slate-400" />
                    <span className="font-semibold text-slate-900">
                      {returnDeadlineLabel}
                    </span>
                  </div>
                </>
              ) : null}

              {model.returnCondition !== "See store policy" ? (
                <p>
                  <span className="font-medium text-slate-500">Condition:</span>{" "}
                  <span className="font-semibold text-slate-900">
                    {model.returnCondition}
                  </span>
                </p>
              ) : null}
              {model.refundType !== "See store policy" ? (
                <p>
                  <span className="font-medium text-slate-500">Refund:</span>{" "}
                  <span className="font-semibold text-slate-900">
                    {model.refundType}
                  </span>
                </p>
              ) : null}
              {model.marketingText?.trim() ? (
                <p className="mt-2 border-t border-blue-100/80 pt-2 text-[10px] italic text-slate-500">
                  &ldquo;{model.marketingText.trim()}&rdquo;
                </p>
              ) : null}
            </div>
          </div>
        ) : model.marketingText?.trim() ? (
          <div className="mb-6">
            <p className="text-sm font-semibold leading-snug text-slate-800">
              {model.marketingText.trim()}
            </p>
          </div>
        ) : null}

        {footerSlot ? (
          <div className="mb-6 flex items-start justify-end">{footerSlot}</div>
        ) : null}

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
  );
}
