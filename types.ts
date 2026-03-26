export interface LineItem {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  price: number;
}

export interface ReceiptData {
  /** Real store UUID from GET /stores — required for POST /receipts */
  storeId: string;
  storeName: string;
  storePhone: string;
  receiptNumber: string;
  date: string; // ISO string
  items: LineItem[];
  currency: string;
  vatRate: number;
  paymentMethod: string;
  marketingText: string;
  companyName: string;
  tin: string; // Tax Identification Number
  website: string;
  qrUrl: string;
  customerName?: string;
  // Return Policy Fields
  returnWindow: string;
  customReturnWindow: string;
  returnCondition: string;
  refundType: string;
}

export const INITIAL_RECEIPT_DATA: ReceiptData = {
  storeId: "",
  storeName: "Safe Receipt",
  storePhone: "0244444444",
  receiptNumber: "N 469",
  date: new Date().toISOString(),
  items: [
    {
      id: "1",
      name: "Blue Phoenix coffee beans",
      detail: "medium roast, 100% Arabica, 200 g",
      quantity: 2,
      price: 570.0,
    },
    {
      id: "2",
      name: "Jet Lag ground coffee",
      detail: "70% Arabica 30% Robusta, espresso blend, fresh roast, 200 g",
      quantity: 1,
      price: 623.0,
    },
  ],
  currency: "GHS",
  vatRate: 20,
  paymentMethod: "mobile_money",
  marketingText: "",
  companyName: "",
  tin: "",
  website: "",
  qrUrl: "",
  customerName: "",
  returnWindow: "7 days",
  customReturnWindow: "",
  returnCondition: "Original Packaging",
  refundType: "Store Credit",
};
