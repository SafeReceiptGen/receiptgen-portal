import type { DiscountReason } from "@/lib/discount";

export interface LineItem {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  /** Amount charged to the customer (sale price when discounted). */
  price: number;
  /** Listed / catalog price before any discount. */
  originalPrice: number;
  discountReason?: DiscountReason | null;
  /** UI-only: whether discount fields are shown for this line. */
  discountEnabled?: boolean;
  /** True when price comes from the store catalog and should not be edited */
  priceFixed?: boolean;
}

export interface ReceiptData {
  /** Real store UUID from GET /stores — required for POST /receipts */
  storeId: string;
  /** Brand / trading name shown on the receipt header (`retailers.name`). */
  storeName: string;
  /** Per-location / branch name (`stores.name`); shown under the brand when distinct. */
  storeLocation: string;
  storePhone: string;
  receiptNumber: string;
  date: string; // ISO string
  items: LineItem[];
  currency: string;
  vatRate: number;
  paymentMethod: string;
  /** Amount received at issuance. Frozen after create; later payments live on `payments`. */
  amountPaid: number;
  /** Live AR after issuance. Prefer this over deriving from frozen `amountPaid`. */
  paymentStatus?: "unpaid" | "partially_paid" | "paid_in_full";
  /** Live remaining balance after issuance. */
  balanceDue?: number;
  /**
   * UI-only: once true, amountPaid is not auto-synced when line totals change.
   */
  amountPaidTouched?: boolean;
  /**
   * Payment ledger for PDF / preview. At create time this is a single
   * provisional entry from amount paid; after issue it mirrors the API ledger.
   */
  payments?: {
    id: string;
    amount: number;
    paymentMethod: string;
    reference?: string | null;
    note?: string | null;
    createdAt: string;
  }[];
  marketingText: string;
  companyName: string;
  tin: string; // Tax Identification Number
  website: string;
  /** Retailer-wide brand logo (absolute URL); shown on PDF/preview when set. */
  logoUrl: string;
  qrCodeToken: string;
  qrUrl: string;
  customerName: string;
  customerPhone: string;
  // Return Policy Fields
  returnWindow: string;
  customReturnWindow: string;
  returnCondition: string;
  refundType: string;
  /** Receipt lifecycle (issued / voided / returned); set when re-downloading from dashboard. */
  status?: string;
  /** ISO return deadline; computed from window when absent (builder preview). */
  returnDeadline?: string | null;
}

export const INITIAL_RECEIPT_DATA: ReceiptData = {
  storeId: "",
  storeName: "Safe Receipt",
  storeLocation: "",
  storePhone: "0244444444",
  receiptNumber: "N 469",
  date: new Date().toISOString(),
  items: [],
  currency: "GHS",
  vatRate: 0,
  paymentMethod: "mobile_money",
  amountPaid: 0,
  amountPaidTouched: false,
  marketingText: "",
  companyName: "",
  tin: "",
  website: "",
  logoUrl: "",
  qrCodeToken: "",
  qrUrl: "",
  customerName: "",
  customerPhone: "",
  returnWindow: "7 days",
  customReturnWindow: "",
  returnCondition: "Original Packaging",
  refundType: "Store Credit",
};
