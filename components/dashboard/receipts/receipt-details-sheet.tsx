"use client";

import { useQuery } from "@tanstack/react-query";
import { receiptDetailQueryOptions } from "@/lib/queries/receipts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { QRCodeSVG } from "qrcode.react";
import { RotateCcw } from "lucide-react";
import { formatPaymentMethodLabel } from "@/lib/receipt-display-labels";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogoImage } from "@/components/receipt/brand-logo-image";
import { RECEIPT_LOGO_SLOT_PX } from "@/lib/receipt-logo-display";

interface ReceiptDetailsSheetProps {
  receiptId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptDetailsSheet({
  receiptId,
  onOpenChange,
}: ReceiptDetailsSheetProps) {
  const { data: receipt, isLoading } = useQuery({
    ...receiptDetailQueryOptions(receiptId),
  });

  const formatPrice = (price: string) => {
    return parseFloat(price)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch (e) {
      return isoString;
    }
  };

  const dynamicQrUrl = receipt?.qrCodeToken?.trim()
    ? `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/receipt/${receipt.qrCodeToken}`
    : "";

  return (
    <Sheet open={!!receiptId} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l-0 p-0 sm:p-6 shadow-2xl">
        <SheetHeader className="p-6 sm:p-0 mb-6 bg-white sm:bg-transparent border-b sm:border-0 sticky top-0 z-10">
          <SheetTitle className="text-xl">Receipt Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="p-6 sm:p-0 space-y-6">
            <Skeleton className="h-[200px] w-full rounded-[24px]" />
            <Skeleton className="h-[400px] w-full rounded-[24px]" />
          </div>
        ) : !receipt ? (
          <div className="p-6 sm:p-0 flex items-center justify-center h-full text-zinc-500">
            Receipt not found or failed to load.
          </div>
        ) : (
          <div className="flex items-start justify-center w-full h-full sm:p-4 overflow-auto overscroll-contain">
            {/* The Thermal Paper Wrapper */}
            <div className="w-full max-w-[380px] min-w-[320px] flex flex-col filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] my-auto transition-all duration-300">
              {/* TOP SECTION: HEADER */}
              <div
                className="bg-white text-zinc-900 w-full rounded-t-[20px] p-8 pb-6 relative transition-all"
                style={{
                  background:
                    "radial-gradient(circle at bottom left, transparent 12px, #ffffff 12.5px) top left / 51% 100% no-repeat, radial-gradient(circle at bottom right, transparent 12px, #ffffff 12.5px) top right / 51% 100% no-repeat",
                }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-3">
                    <BrandLogoImage
                      url={receipt.retailerLogoUrl}
                      alt={`${receipt.retailerName?.trim() || receipt.store.name} logo`}
                      className="shrink-0 rounded-md object-contain ring-1 ring-zinc-200"
                      style={{
                        width: RECEIPT_LOGO_SLOT_PX,
                        height: RECEIPT_LOGO_SLOT_PX,
                      }}
                    />
                    <div className="flex flex-col min-w-0">
                      <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                        {receipt.retailerName?.trim() || receipt.store.name}
                      </h1>
                      {receipt.retailerName?.trim() &&
                      receipt.store.name.trim() &&
                      receipt.retailerName.trim() !==
                        receipt.store.name.trim() ? (
                        <p className="text-zinc-500 text-sm">
                          {receipt.store.name}
                        </p>
                      ) : null}
                      {receipt.store.phone && (
                        <p className="text-zinc-500 text-sm">
                          {receipt.store.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 text-right leading-tight">
                    <p className="mb-0.5">Receipt {receipt.receiptNumber}</p>
                    <p>{formatDate(receipt.date)}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl text-center font-bold mb-2">
                    Thank you for your purchase
                    {receipt.customer?.name ? `, ${receipt.customer.name}` : ""}
                    !
                  </h2>
                </div>

                {/* Dashed Separator Line */}
                <div className="absolute bottom-0 left-[12px] right-[12px] border-b border-dashed border-zinc-300"></div>
              </div>

              {/* BOTTOM SECTION: BODY */}
              <div
                className="bg-white text-zinc-900 w-full rounded-b-[20px] p-8 pt-6 relative flex flex-col transition-all"
                style={{
                  background:
                    "radial-gradient(circle at top left, transparent 12px, #ffffff 12.5px) bottom left / 51% 100% no-repeat, radial-gradient(circle at top right, transparent 12px, #ffffff 12.5px) bottom right / 51% 100% no-repeat",
                }}
              >
                {/* Line Items */}
                <div className="flex flex-col gap-6 mb-8 text-left">
                  {receipt.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex gap-4 items-start text-xs"
                    >
                      <div className="w-4 pt-0.5 font-medium text-zinc-400">
                        {index + 1}.
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm text-zinc-900 w-2/3 leading-tight">
                            {item.name}
                          </span>
                          <span className="font-bold text-sm whitespace-nowrap">
                            {formatPrice(item.lineTotal)} {receipt.currency}
                          </span>
                        </div>
                        {item.detail && (
                          <p className="text-zinc-500 mb-1 leading-normal">
                            {item.detail}
                          </p>
                        )}
                        <div className="text-zinc-400">
                          {item.quantity} x {formatPrice(item.unitPrice)}{" "}
                          {receipt.currency}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financials Block */}
                <div className="bg-zinc-100/80 rounded-lg p-4 mb-8">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold tracking-tight">
                      {formatPrice(receipt.total)} {receipt.currency}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-zinc-600 mb-1">
                    <span>Payment method</span>
                    <span className="font-medium">
                      {formatPaymentMethodLabel(receipt.paymentMethod)}
                    </span>
                  </div>
                </div>

                {/* Footer / Return Policy */}
                <div className="flex items-start gap-4 mb-8 text-left">
                  <div className="flex-1 pt-1">
                    {/* Return Policy if exists */}
                    {receipt.returnPolicy ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <RotateCcw size={12} strokeWidth={2.5} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Return Policy
                          </span>
                        </div>
                        <div className="text-sm font-semibold leading-snug text-zinc-800">
                          <span className="text-zinc-500">Deadline:</span>{" "}
                          {receipt.returnDeadline
                            ? formatDate(receipt.returnDeadline)
                            : "N/A"}
                        </div>
                        {receipt.marketingText && (
                          <p className="text-[10px] text-zinc-500 italic mt-2 border-t border-zinc-200 pt-2">
                            "{receipt.marketingText}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold leading-snug text-zinc-800">
                          {receipt.marketingText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="p-2 border border-zinc-200 rounded-lg bg-white shrink-0">
                    <QRCodeSVG
                      value={dynamicQrUrl}
                      size={80}
                      level="M"
                      fgColor="#18181b"
                    />
                  </div>
                </div>

                {/* Status indicator */}
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-zinc-100">
                  <div className="text-xs text-zinc-500 font-medium">
                    Status
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                      receipt.status === "issued"
                        ? "bg-zinc-100 text-zinc-900"
                        : receipt.status === "returned"
                          ? "bg-red-100 text-red-700"
                          : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {receipt.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
