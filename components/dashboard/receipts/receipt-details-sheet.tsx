"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { receiptDetailQueryOptions } from "@/lib/queries/receipts";
import { retailerQueryOptions } from "@/lib/queries/retailer";
import { receiptsApi } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Check, Copy, Download, ExternalLink, RotateCcw } from "lucide-react";
import html2canvas from "html2canvas-pro";
import {
  formatPaymentMethodLabel,
  formatReceiptPaymentStatusLabel,
} from "@/lib/receipt-display-labels";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogoImage } from "@/components/receipt/brand-logo-image";
import { ReceiptCard } from "@/components/receipt/receipt-card";
import { ReceiptDocumentsSwitcher } from "@/components/receipt/receipt-documents-switcher";
import { RECEIPT_LOGO_SLOT_PX } from "@/lib/receipt-logo-display";
import {
  discountReasonLabel,
  getLineItemDiscountTotals,
  isLineItemDiscounted,
} from "@/lib/discount";
import {
  defaultReceiptDocumentKind,
  documentsFromReceiptData,
  isInstallmentReceipt,
  liveOutstandingBalance,
  receiptDataToDocumentCardModel,
  receiptDocumentFilename,
  receiptDocumentImageFilename,
  type ReceiptDocumentKind,
} from "@/lib/receipt-documents";
import { formatCurrency } from "@/lib/currency";
import {
  downloadReceiptPdf,
  mapSingleReceiptToReceiptData,
} from "@/lib/receipt-pdf-download";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payment-methods";
import { formatPaymentLedgerDetails } from "@/lib/payment-ledger-display";
import { format } from "date-fns";

interface ReceiptDetailsSheetProps {
  receiptId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptDetailsSheet({
  receiptId,
  onOpenChange,
}: ReceiptDetailsSheetProps) {
  const queryClient = useQueryClient();
  const { data: receipt, isLoading } = useQuery({
    ...receiptDetailQueryOptions(receiptId),
  });
  const { data: retailer } = useQuery({
    ...retailerQueryOptions,
    enabled: !!receiptId,
  });

  const [recordOpen, setRecordOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [documentKind, setDocumentKind] =
    useState<ReceiptDocumentKind>("standard");
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const pngCaptureRef = useRef<HTMLDivElement>(null);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["receipts"] });
  };

  const recordMutation = useMutation({
    mutationFn: () =>
      receiptsApi.recordPayment(receiptId!, {
        amount: parseFloat(paymentAmount),
        paymentMethod: paymentMethod || undefined,
        reference: paymentReference.trim() || undefined,
        note: paymentNote.trim() || undefined,
      }),
    onSuccess: async () => {
      setActionError(null);
      setRecordOpen(false);
      setPaymentAmount("");
      setPaymentReference("");
      setPaymentNote("");
      await invalidate();
    },
    onError: (err: Error) => {
      setActionError(err.message || "Failed to record payment");
    },
  });

  const settleMutation = useMutation({
    mutationFn: () =>
      receiptsApi.settlePayment(receiptId!, {
        paymentMethod: paymentMethod || undefined,
        reference: paymentReference.trim() || undefined,
        note: paymentNote.trim() || undefined,
      }),
    onSuccess: async () => {
      setActionError(null);
      setSettleOpen(false);
      setPaymentReference("");
      setPaymentNote("");
      await invalidate();
    },
    onError: (err: Error) => {
      setActionError(err.message || "Failed to settle balance");
    },
  });

  const formatPrice = (price: string | number) => {
    return parseFloat(String(price))
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
    } catch {
      return isoString;
    }
  };

  const dynamicQrUrl = receipt?.qrCodeToken?.trim()
    ? `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/receipt/${receipt.qrCodeToken}`
    : "";

  const downloadReceiptData = useMemo(() => {
    if (!receipt) return null;
    return mapSingleReceiptToReceiptData(receipt, retailer, dynamicQrUrl);
  }, [receipt, retailer, dynamicQrUrl]);

  const documents = useMemo(
    () =>
      downloadReceiptData
        ? documentsFromReceiptData(downloadReceiptData)
        : [{ kind: "standard" as const, label: "Receipt" }],
    [downloadReceiptData],
  );

  const selectedDocumentKind = documents.some((doc) => doc.kind === documentKind)
    ? documentKind
    : defaultReceiptDocumentKind(documents);

  const downloadCardModel = useMemo(
    () =>
      downloadReceiptData
        ? receiptDataToDocumentCardModel(
            downloadReceiptData,
            selectedDocumentKind,
          )
        : null,
    [downloadReceiptData, selectedDocumentKind],
  );

  const balanceDue = receipt ? parseFloat(receipt.balanceDue ?? "0") : 0;
  const canCollectPayment =
    receipt?.status === "issued" && balanceDue > 0;
  const installment = receipt
    ? isInstallmentReceipt(
        parseFloat(receipt.total),
        parseFloat(receipt.amountPaid ?? receipt.total),
      )
    : false;
  const outstanding = downloadReceiptData
    ? liveOutstandingBalance({
        total: downloadReceiptData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ),
        amountPaid: downloadReceiptData.amountPaid,
        balanceDue: downloadReceiptData.balanceDue,
        paymentStatus: downloadReceiptData.paymentStatus,
        payments: downloadReceiptData.payments,
      })
    : 0;

  const openRecordDialog = () => {
    setActionError(null);
    setPaymentAmount("");
    setPaymentMethod(receipt?.paymentMethod ?? "");
    setPaymentReference("");
    setPaymentNote("");
    setRecordOpen(true);
  };

  const openSettleDialog = () => {
    setActionError(null);
    setPaymentMethod(receipt?.paymentMethod ?? "");
    setPaymentReference("");
    setPaymentNote("");
    setSettleOpen(true);
  };

  useEffect(() => {
    if (!receipt || !downloadReceiptData) return;
    setDocumentKind(
      defaultReceiptDocumentKind(documentsFromReceiptData(downloadReceiptData)),
    );
  }, [receipt?.id, receipt?.paymentStatus, downloadReceiptData]);

  const copyReceiptLink = () => {
    if (!dynamicQrUrl) return;
    void navigator.clipboard.writeText(dynamicQrUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPdf = async () => {
    if (!receipt || !downloadReceiptData || downloading) return;

    setDownloading(true);
    try {
      const qrDataUrl = qrCanvasRef.current?.toDataURL("image/png");
      await downloadReceiptPdf(downloadReceiptData, {
        qrDataUrl,
        showQr: !!dynamicQrUrl,
        documentKind: selectedDocumentKind,
        filename: receiptDocumentFilename(
          receipt.receiptNumber,
          selectedDocumentKind,
        ),
      });
    } catch (e) {
      console.error("Failed to generate PDF", e);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!receipt || !pngCaptureRef.current || downloading) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(pngCaptureRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = receiptDocumentImageFilename(
        receipt.receiptNumber,
        selectedDocumentKind,
      );
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Failed to generate image", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
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
            <div className="flex flex-col items-center w-full h-full sm:p-4 overflow-auto overscroll-contain gap-4 px-6 sm:px-0 pb-6">
              {dynamicQrUrl ? (
                <div className="w-full max-w-[380px] min-w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Receipt link
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={dynamicQrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 basis-24 truncate font-mono text-xs text-blue-600 hover:underline"
                      title={dynamicQrUrl}
                    >
                      {dynamicQrUrl}
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 px-2"
                      asChild
                    >
                      <a
                        href={dynamicQrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3.5" />
                        Open
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 px-2"
                      onClick={copyReceiptLink}
                    >
                      {copied ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 shrink-0 gap-1.5 px-2"
                          disabled={downloading}
                        >
                          <Download className="size-3.5" />
                          {downloading ? "…" : "Download"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuLabel className="text-xs font-normal text-slate-500">
                          Download as:
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => void handleDownloadImage()}
                        >
                          Image
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => void handleDownloadPdf()}
                        >
                          PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="hidden" aria-hidden>
                    <QRCodeCanvas
                      value={dynamicQrUrl}
                      size={160}
                      level="M"
                      fgColor="#18181b"
                      ref={qrCanvasRef}
                    />
                  </div>
                </div>
              ) : null}

              {installment ? (
                <div className="flex w-full max-w-[380px] min-w-[320px] flex-col gap-4">
                  <ReceiptDocumentsSwitcher
                    documents={documents}
                    value={selectedDocumentKind}
                    onChange={setDocumentKind}
                  />

                  {outstanding > 0 &&
                  selectedDocumentKind === "original" &&
                  receipt.paymentStatus !== "paid_in_full" ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                      <p className="font-semibold">Outstanding Balance</p>
                      <p className="mt-1 text-amber-800/90">
                        The Original receipt stays as issued. Final receipt appears
                        after the balance is cleared.
                      </p>
                    </div>
                  ) : null}

                  {downloadCardModel ? (
                    <div className="filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)]">
                      <ReceiptCard
                        model={downloadCardModel}
                        footerSlot={
                          dynamicQrUrl ? (
                            <div className="flex w-full flex-col items-end gap-2">
                              <p className="text-[10px] font-medium text-slate-500">
                                Scan to view receipt or start a return
                              </p>
                              <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-2">
                                <QRCodeSVG
                                  value={dynamicQrUrl}
                                  size={80}
                                  level="M"
                                  fgColor="#18181b"
                                />
                              </div>
                            </div>
                          ) : null
                        }
                      />
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Account / payments
                    </div>
                    <div className="mb-3 space-y-1.5 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Live balance due</span>
                        <span className="font-semibold text-amber-700">
                          {formatCurrency(outstanding, receipt.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Payment status</span>
                        <span className="font-semibold">
                          {formatReceiptPaymentStatusLabel(
                            receipt.paymentStatus ?? "paid_in_full",
                          )}
                        </span>
                      </div>
                    </div>

                    {receipt.payments && receipt.payments.length > 0 ? (
                      <div className="mb-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Payment history
                        </div>
                        <div className="space-y-2">
                          {receipt.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between gap-3 rounded-md border border-zinc-100 px-3 py-2 text-xs"
                            >
                              <div>
                                <div className="font-medium text-zinc-800">
                                  {formatPrice(payment.amount)}{" "}
                                  {receipt.currency}
                                </div>
                                <div className="text-zinc-500">
                                  {formatPaymentLedgerDetails(payment)}
                                </div>
                              </div>
                              <div className="shrink-0 text-right text-zinc-400">
                                <div>
                                  {format(
                                    new Date(payment.createdAt),
                                    "MMM d, yyyy",
                                  )}
                                </div>
                                <div>
                                  {format(
                                    new Date(payment.createdAt),
                                    "h:mm a",
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {canCollectPayment ? (
                      <div className="flex flex-col gap-2">
                        <Button type="button" onClick={openRecordDialog}>
                          Record payment
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={openSettleDialog}
                        >
                          Mark as paid in full
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {!installment ? (
              <div className="w-full max-w-[380px] min-w-[320px] flex flex-col filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-300">
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
                        <h2 className="text-xl font-bold leading-tight truncate">
                          {receipt.retailerName?.trim() || receipt.store.name}
                        </h2>
                        {receipt.retailerName?.trim() &&
                        receipt.store.name.trim() &&
                        receipt.retailerName.trim() !==
                          receipt.store.name.trim() ? (
                          <p className="text-sm text-zinc-500 truncate">
                            {receipt.store.name}
                          </p>
                        ) : null}
                        {receipt.store.phone ? (
                          <p className="text-sm text-zinc-500">
                            {receipt.store.phone}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right text-xs text-zinc-500 shrink-0">
                      <div className="font-medium text-zinc-800">
                        {receipt.receiptNumber}
                      </div>
                      <div>{formatDate(receipt.date)}</div>
                    </div>
                  </div>

                  {receipt.customer ? (
                    <div className="mb-6 text-sm">
                      <div className="text-xs uppercase tracking-wider text-zinc-400 mb-1">
                        Customer
                      </div>
                      <div className="font-semibold">{receipt.customer.name}</div>
                      {receipt.customer.phone ? (
                        <div className="text-zinc-500">
                          {receipt.customer.phone}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="space-y-4 mb-6">
                    {receipt.items.map((item, index) => {
                      const unit = parseFloat(item.unitPrice);
                      const original = parseFloat(
                        item.originalPrice ?? item.unitPrice,
                      );
                      const discounted = isLineItemDiscounted(original, unit);
                      const { originalTotal, paidTotal } =
                        getLineItemDiscountTotals(
                          original,
                          unit,
                          item.quantity,
                        );
                      return (
                        <div key={item.id} className="flex gap-3 text-sm">
                          <div className="w-5 text-zinc-400">{index + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold truncate">
                                {item.name}
                              </span>
                              <span className="font-semibold shrink-0">
                                {formatPrice(item.lineTotal)} {receipt.currency}
                              </span>
                            </div>
                            {item.detail ? (
                              <div className="text-zinc-500 text-xs">
                                {item.detail}
                              </div>
                            ) : null}
                            {discounted ? (
                              <div className="text-xs text-zinc-500 space-y-0.5 pt-1">
                                <div>
                                  Original: {formatPrice(String(originalTotal))}{" "}
                                  {receipt.currency}
                                </div>
                                <div>
                                  You Paid: {formatPrice(String(paidTotal))}{" "}
                                  {receipt.currency}
                                </div>
                                {item.discountReason ? (
                                  <p className="pt-0.5 text-zinc-400">
                                    Reason:{" "}
                                    {discountReasonLabel(item.discountReason)}
                                  </p>
                                ) : null}
                              </div>
                            ) : (
                              <div className="text-zinc-400 text-xs">
                                {item.quantity} x {formatPrice(item.unitPrice)}{" "}
                                {receipt.currency}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-zinc-100/80 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold tracking-tight">
                        {formatPrice(receipt.total)} {receipt.currency}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-zinc-600 mb-1">
                      <span>Amount paid</span>
                      <span className="font-medium">
                        {formatPrice(receipt.amountPaid ?? receipt.total)}{" "}
                        {receipt.currency}
                      </span>
                    </div>
                    {balanceDue > 0 ? (
                      <div className="flex justify-between text-xs text-zinc-600 mb-1">
                        <span>Balance due</span>
                        <span className="font-semibold text-amber-700">
                          {formatPrice(receipt.balanceDue)} {receipt.currency}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-xs text-zinc-600 mb-1">
                      <span>Payment status</span>
                      <span className="font-semibold">
                        {formatReceiptPaymentStatusLabel(
                          receipt.paymentStatus ?? "paid_in_full",
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-600">
                      <span>Payment method</span>
                      <span className="font-medium">
                        {formatPaymentMethodLabel(receipt.paymentMethod)}
                      </span>
                    </div>
                  </div>

                  {receipt.payments && receipt.payments.length > 0 ? (
                    <div className="mb-6 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Payment history
                      </div>
                      <div className="space-y-2">
                        {receipt.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex justify-between gap-3 text-xs border border-zinc-100 rounded-md px-3 py-2"
                          >
                            <div>
                              <div className="font-medium text-zinc-800">
                                {formatPrice(payment.amount)} {receipt.currency}
                              </div>
                              <div className="text-zinc-500">
                                {formatPaymentLedgerDetails(payment)}
                              </div>
                            </div>
                            <div className="text-zinc-400 shrink-0 text-right">
                              <div>
                                {format(new Date(payment.createdAt), "MMM d, yyyy")}
                              </div>
                              <div>
                                {format(new Date(payment.createdAt), "h:mm a")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {canCollectPayment ? (
                    <div className="mb-6 flex flex-col gap-2">
                      <Button type="button" onClick={openRecordDialog}>
                        Record payment
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={openSettleDialog}
                      >
                        Mark as paid in full
                      </Button>
                    </div>
                  ) : null}

                  <div className="flex items-start gap-4 mb-8 text-left">
                    <div className="flex-1 pt-1">
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
                              &ldquo;{receipt.marketingText}&rdquo;
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

                    <div className="p-2 border border-zinc-200 rounded-lg bg-white shrink-0">
                      <QRCodeSVG
                        value={dynamicQrUrl}
                        size={80}
                        level="M"
                        fgColor="#18181b"
                      />
                    </div>
                  </div>

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
              ) : null}
              {downloadCardModel ? (
                <div
                  className="pointer-events-none fixed left-[-10000px] top-0"
                  aria-hidden
                >
                  <div ref={pngCaptureRef} className="rounded-[24px] p-4">
                    <div className="relative flex w-[380px] min-w-[320px] flex-col">
                      <ReceiptCard
                        model={downloadCardModel}
                        footerSlot={
                          dynamicQrUrl ? (
                            <div className="flex w-full flex-col items-end gap-2">
                              <p className="text-[10px] font-medium text-slate-500">
                                Scan to view receipt or start a return
                              </p>
                              <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-2">
                                <QRCodeSVG
                                  value={dynamicQrUrl}
                                  size={80}
                                  level="M"
                                  fgColor="#18181b"
                                />
                              </div>
                            </div>
                          ) : null
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Enter the amount received against the outstanding balance
              {receipt
                ? ` of ${formatPrice(receipt.balanceDue)} ${receipt.currency}`
                : ""}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                min={0.01}
                step="0.01"
                max={balanceDue || undefined}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-reference">
                Payment reference (optional)
              </Label>
              <Input
                id="payment-reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. MoMo txn ID"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-note">Note (optional)</Label>
              <Input
                id="payment-note"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="e.g. Second installment"
              />
            </div>
            {actionError ? (
              <p className="text-sm text-destructive">{actionError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRecordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                recordMutation.isPending ||
                !(parseFloat(paymentAmount) > 0)
              }
              onClick={() => recordMutation.mutate()}
            >
              {recordMutation.isPending ? "Saving…" : "Save payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as paid in full</DialogTitle>
            <DialogDescription>
              This will clear the remaining balance
              {receipt
                ? ` of ${formatPrice(receipt.balanceDue)} ${receipt.currency}`
                : ""}{" "}
              and set payment status to Paid in Full.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settle-reference">
                Payment reference (optional)
              </Label>
              <Input
                id="settle-reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. MoMo txn ID"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settle-note">Note (optional)</Label>
              <Input
                id="settle-note"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
            {actionError ? (
              <p className="text-sm text-destructive">{actionError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSettleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={settleMutation.isPending}
              onClick={() => settleMutation.mutate()}
            >
              {settleMutation.isPending ? "Updating…" : "Mark paid in full"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
