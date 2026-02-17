export interface LineItem {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  price: number;
}

export interface ReceiptData {
  storeName: string;
  receiptNumber: string;
  date: string; // ISO string
  orderId: string;
  orderStatus: string;
  items: LineItem[];
  currency: string;
  vatRate: number;
  paymentMethod: string;
  marketingText: string;
  companyName: string;
  tin: string; // Tax Identification Number
  website: string;
  qrUrl: string;
  // Return Policy Fields
  returnWindow: string;
  customReturnWindow: string;
  returnCondition: string;
  refundType: string;
}

export const INITIAL_RECEIPT_DATA: ReceiptData = {
  storeName: "Organic Blend",
  receiptNumber: "N 469",
  date: new Date().toISOString(),
  orderId: "OB987654",
  orderStatus: "has been processed and is ready for shipment. Expect delivery within three working days",
  items: [
    {
      id: "1",
      name: "Blue Phoenix coffee beans",
      detail: "medium roast, 100% Arabica, 200 g",
      quantity: 2,
      price: 570.00
    },
    {
      id: "2",
      name: "Jet Lag ground coffee",
      detail: "70% Arabica 30% Robusta, espresso blend, fresh roast, 200 g",
      quantity: 1,
      price: 623.00
    }
  ],
  currency: "GHS",
  vatRate: 20,
  paymentMethod: "Mobile Money",
  marketingText: "Win a set of coffee accessories or a monthly supply of coffee",
  companyName: "LLC \"Organic Blend\"",
  tin: "775678901234",
  website: "www.nalog.gov.ru",
  qrUrl: "https://organicblend.coffee/receipt/OB987654",
  returnWindow: "7 days",
  customReturnWindow: "",
  returnCondition: "Original Packaging",
  refundType: "Store Credit"
};