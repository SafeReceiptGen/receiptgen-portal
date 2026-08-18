import { pdf } from "@react-pdf/renderer";
import { ReceiptPDF } from "@/components/form/receipt-pdf";
import { fetchReceiptLogoForPdf } from "@/lib/receipt-logo-pdf";
import type { Retailer, SingleReceipt } from "@/lib/api";
import type { DiscountReason } from "@/lib/discount";
import type { ReceiptData } from "@/types";

export type DownloadReceiptPdfOptions = {
  qrDataUrl?: string;
  showQr: boolean;
  filename: string;
};

/**
 * Client-side PDF download shared by the post-generation dialog and the
 * receipts details sheet. Logo is fetched via the backend embed proxy.
 */
export async function downloadReceiptPdf(
  data: ReceiptData,
  opts: DownloadReceiptPdfOptions,
): Promise<void> {
  let logoDataUrl: string | undefined;
  let logoWidthPt: number | undefined;
  let logoHeightPt: number | undefined;
  const logoTrim = data.logoUrl?.trim();
  if (logoTrim) {
    const logoAsset = await fetchReceiptLogoForPdf(logoTrim);
    if (logoAsset) {
      logoDataUrl = logoAsset.dataUrl;
      logoWidthPt = logoAsset.width;
      logoHeightPt = logoAsset.height;
    }
  }

  const blob = await pdf(
    <ReceiptPDF
      data={data}
      showQr={opts.showQr}
      qrDataUrl={opts.qrDataUrl}
      logoDataUrl={logoDataUrl}
      logoNaturalWidth={logoWidthPt}
      logoNaturalHeight={logoHeightPt}
    />,
  ).toBlob();

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = opts.filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

const RETURN_WINDOW_LABELS: Record<string, string> = {
  "0": "No returns",
  none: "No returns",
  "1": "3 days",
  "3_days": "3 days",
  "2": "7 days",
  "7_days": "7 days",
  "3": "14 days",
  "14_days": "14 days",
  "4": "30 days",
  "30_days": "30 days",
  "5": "Custom",
  custom: "Custom",
};

const RETURN_CONDITION_LABELS: Record<string, string> = {
  "0": "Unused",
  unused: "Unused",
  "1": "Original Packaging",
  original_packaging: "Original Packaging",
  "2": "Any Condition",
  any_condition: "Any Condition",
  "3": "Defective Only",
  defective_only: "Defective Only",
};

const REFUND_TYPE_LABELS: Record<string, string> = {
  "0": "Full Refund",
  full_refund: "Full Refund",
  "1": "Partial Refund",
  partial_refund: "Partial Refund",
  "2": "Store Credit",
  store_credit: "Store Credit",
  "3": "Exchange Only",
  exchange_only: "Exchange Only",
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function mapReturnPolicy(policy: Record<string, unknown> | null | undefined): {
  returnWindow: string;
  customReturnWindow: string;
  returnCondition: string;
  refundType: string;
} {
  const windowKey = asString(policy?.returnWindow);
  // leftJoin without a match can yield `{ id: null, returnWindow: null, ... }`
  if (!policy || !windowKey) {
    return {
      returnWindow: "No returns",
      customReturnWindow: "",
      returnCondition: "Original Packaging",
      refundType: "Store Credit",
    };
  }

  const returnWindow = RETURN_WINDOW_LABELS[windowKey] ?? windowKey;
  const customDays = asNumber(policy.customWindowDays);
  const customReturnWindow =
    returnWindow === "Custom" && customDays != null && customDays > 0
      ? `${customDays} days`
      : "";

  const conditionKey = asString(policy.returnCondition) ?? "";
  const refundKey = asString(policy.refundType) ?? "";

  return {
    returnWindow,
    customReturnWindow,
    returnCondition:
      RETURN_CONDITION_LABELS[conditionKey] ?? "Original Packaging",
    refundType: REFUND_TYPE_LABELS[refundKey] ?? "Store Credit",
  };
}

/**
 * Maps an authenticated receipt detail payload into the ReceiptData shape
 * expected by ReceiptPDF / the generation form.
 */
export function mapSingleReceiptToReceiptData(
  receipt: SingleReceipt,
  retailer: Pick<Retailer, "companyName" | "tin" | "website"> | null | undefined,
  qrUrl: string,
): ReceiptData {
  const policy = mapReturnPolicy(
    receipt.returnPolicy as Record<string, unknown> | null,
  );
  const brandName =
    receipt.retailerName?.trim() || receipt.store.name.trim() || "";

  return {
    storeId: receipt.store.id,
    storeName: brandName,
    storeLocation: receipt.store.name,
    storePhone: receipt.store.phone?.trim() ?? "",
    receiptNumber: receipt.receiptNumber,
    date: receipt.date,
    items: receipt.items.map((item) => {
      const unit = parseFloat(item.unitPrice);
      const original = parseFloat(item.originalPrice ?? item.unitPrice);
      return {
        id: item.id,
        name: item.name,
        detail: item.detail ?? "",
        quantity: item.quantity,
        price: Number.isFinite(unit) ? unit : 0,
        originalPrice: Number.isFinite(original) ? original : unit || 0,
        discountReason: (item.discountReason ?? null) as DiscountReason | null,
      };
    }),
    currency: receipt.currency,
    vatRate: parseFloat(receipt.vatRate) || 0,
    paymentMethod: receipt.paymentMethod,
    amountPaid: parseFloat(receipt.amountPaid ?? receipt.total) || 0,
    paymentStatus: receipt.paymentStatus,
    balanceDue: parseFloat(receipt.balanceDue ?? "0") || 0,
    payments: (receipt.payments ?? []).map((payment) => ({
      id: payment.id,
      amount: parseFloat(payment.amount) || 0,
      paymentMethod: payment.paymentMethod,
      reference: payment.reference,
      note: payment.note,
      createdAt: payment.createdAt,
    })),
    marketingText: receipt.marketingText ?? "",
    companyName: retailer?.companyName ?? "",
    tin: retailer?.tin ?? "",
    website: retailer?.website ?? "",
    logoUrl: receipt.retailerLogoUrl?.trim() ?? "",
    qrCodeToken: receipt.qrCodeToken,
    qrUrl,
    customerName: receipt.customer?.name ?? "",
    customerPhone: receipt.customer?.phone ?? "",
    returnWindow: policy.returnWindow,
    customReturnWindow: policy.customReturnWindow,
    returnCondition: policy.returnCondition,
    refundType: policy.refundType,
    status: receipt.status,
    returnDeadline: receipt.returnDeadline,
  };
}
