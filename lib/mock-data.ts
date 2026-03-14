// ─── ReturnFlow Mock Data ──────────────────────────────────────────────────────
// Realistic data shapes matching the types in types/returns.ts.
// Used to render all customer-facing ReturnFlow UI without a backend.

import {
  ReceiptForReturn,
  ReturnRequest,
  PudoPoint,
} from "@/types/returns";

// ─── PUDO Points ──────────────────────────────────────────────────────────────

export const MOCK_PUDO_POINTS: PudoPoint[] = [
  { id: "pudo-1", name: "Osu Mall", address: "Oxford St, Osu, Accra" },
  { id: "pudo-2", name: "Airport Junction", address: "Airport Residential Area, Accra" },
  { id: "pudo-3", name: "Achimota Retail Centre", address: "Achimota, Accra" },
  { id: "pudo-4", name: "East Legon Hub", address: "Boundary Rd, East Legon, Accra" },
];

// ─── Receipts ─────────────────────────────────────────────────────────────────

const INITIAL_MOCK_RECEIPTS = {
  "receipt-001": {
    id: "receipt-001",
    receiptNumber: "SR-2026-0469",
    storeName: "Seizer Sneakers",
    storePhone: "0244444444",
    storeLogo: undefined,
    customerName: "Jayden Osafo",
    items: [
      { id: "item-1", name: "Nike Airforce Gray", detail: "Size 42, Men's", quantity: 1, price: 2000, selected: false },
      { id: "item-2", name: "Nike Airforce White", detail: "Size 42, Men's", quantity: 1, price: 2000, selected: false },
      { id: "item-3", name: "Nike Jordan 1 Retro", detail: "Size 43, High Top, Red/Black", quantity: 1, price: 1000, selected: false },
    ],
    currency: "GHS",
    subtotal: 5000,
    total: 5000,
    paymentMethod: "Mobile Money",
    purchasedAt: "2026-03-02T14:30:00Z",
    returnWindow: "14 days",
    returnCondition: "Original Packaging",
    refundType: "Store Credit",
    isReturnable: true,
    qrUrl: "https://safereceipts.com/receipt/receipt-001",
  },
  "receipt-002": {
    id: "receipt-002",
    receiptNumber: "SR-2026-0512",
    storeName: "Melcom Ghana",
    storePhone: "0302661218",
    storeLogo: undefined,
    customerName: "Ama Mensah",
    items: [
      { id: "item-4", name: "Samsung Galaxy Buds FE", detail: "Graphite, Wireless", quantity: 1, price: 850, selected: false },
      { id: "item-5", name: "Anker PowerCore 20000", detail: "Portable Charger, USB-C", quantity: 2, price: 320, selected: false },
      { id: "item-6", name: "Baseus Car Phone Mount", detail: "Magnetic, Dashboard", quantity: 1, price: 180, selected: false },
    ],
    currency: "GHS",
    subtotal: 1670,
    total: 1670,
    paymentMethod: "Card",
    purchasedAt: "2026-03-05T10:15:00Z",
    returnWindow: "7 days",
    returnCondition: "Unused",
    refundType: "Full Refund",
    isReturnable: true,
    qrUrl: "https://safereceipts.com/receipt/receipt-002",
  },
  "receipt-003": {
    id: "receipt-003",
    receiptNumber: "SR-2026-0488",
    storeName: "Koala Shopping",
    storePhone: "0551234567",
    storeLogo: undefined,
    customerName: "Kwame Asante",
    items: [
      { id: "item-7", name: "Blue Phoenix Coffee Beans", detail: "Medium Roast, 100% Arabica, 200g", quantity: 2, price: 570, selected: false },
      { id: "item-8", name: "Jet Lag Ground Coffee", detail: "70/30 Arabica/Robusta, 200g", quantity: 1, price: 623, selected: false },
    ],
    currency: "GHS",
    subtotal: 1763,
    total: 1763,
    paymentMethod: "Mobile Money",
    purchasedAt: "2026-03-07T16:45:00Z",
    returnWindow: "No returns",
    returnCondition: "Unused",
    refundType: "Exchange Only",
    isReturnable: false,
    qrUrl: "https://safereceipts.com/receipt/receipt-003",
  },
};

const globalForMock = globalThis as unknown as {
  mockReceipts: Record<string, ReceiptForReturn> | undefined;
  mockReturns: Record<string, ReturnRequest> | undefined;
};

export const MOCK_RECEIPTS: Record<string, ReceiptForReturn> =
  globalForMock.mockReceipts ?? INITIAL_MOCK_RECEIPTS;

// ─── Returns ──────────────────────────────────────────────────────────────────

const INITIAL_MOCK_RETURNS: Record<string, ReturnRequest> = {
  "return-001": {
    id: "return-001",
    returnNumber: "RF-2026-00127",
    receiptId: "receipt-001",
    retailerName: "Seizer Sneakers",
    customerName: "Jayden Osafo",
    customerPhone: "+233244444444",
    items: [
      { id: "item-1", name: "Nike Airforce Gray", detail: "Size 42, Men's", quantity: 1, price: 2000, selected: true },
      { id: "item-3", name: "Nike Jordan 1 Retro", detail: "Size 43, High Top, Red/Black", quantity: 1, price: 1000, selected: true },
    ],
    returnReason: "DEFECTIVE",
    reasonDescription: "The sole of the Nike Airforce Gray is peeling after 3 days. The Jordan 1 has a scuff mark on the left toe that wasn't there at purchase.",
    photoUrls: [],
    status: "WITH_RETAILER",
    isEligible: true,
    logistics: {
      method: "HOME_PICKUP",
      fee: 50,
      timeSlot: "9:00 AM - 12:00 PM",
      phoneNumber: "+233244444444",
      phoneCountry: "GH",
    },
    refundAmount: 3000,
    currency: "GHS",
    requestedAt: "2026-03-08T09:15:00Z",
    collectedAt: "2026-03-08T11:30:00Z",
    inTransitAt: "2026-03-08T14:00:00Z",
    withRetailerAt: "2026-03-09T10:00:00Z",
    activityLog: [
      { id: "log-1", action: "Return request submitted", performedBy: "Customer", createdAt: "2026-03-08T09:15:00Z" },
      { id: "log-2", action: "Item collected from customer", performedBy: "Courier", notes: "Picked up from Osu, Accra", createdAt: "2026-03-08T11:30:00Z" },
      { id: "log-3", action: "Item in transit to retailer", performedBy: "Courier", createdAt: "2026-03-08T14:00:00Z" },
      { id: "log-4", action: "Item received by retailer", performedBy: "Seizer Sneakers", notes: "Inspecting item condition", createdAt: "2026-03-09T10:00:00Z" },
    ],
  },
  "return-002": {
    id: "return-002",
    returnNumber: "RF-2026-00134",
    receiptId: "receipt-001",
    retailerName: "Seizer Sneakers",
    customerName: "Jayden Osafo",
    customerPhone: "+233244444444",
    items: [
      { id: "item-2", name: "Nike Airforce White", detail: "Size 42, Men's", quantity: 1, price: 2000, selected: true },
    ],
    returnReason: "CHANGED_MIND",
    reasonDescription: "I found a better deal elsewhere.",
    photoUrls: [],
    status: "APPROVED",
    isEligible: true,
    logistics: {
      method: "DROP_OFF",
      pudoPointId: "pudo-1",
      fee: 30,
      timeSlot: "12:00 PM - 3:00 PM",
      phoneNumber: "+233244444444",
      phoneCountry: "GH",
    },
    refundAmount: 2000,
    refundMethod: "STORE_CREDIT",
    currency: "GHS",
    requestedAt: "2026-03-07T15:00:00Z",
    collectedAt: "2026-03-07T16:30:00Z",
    inTransitAt: "2026-03-07T18:00:00Z",
    withRetailerAt: "2026-03-08T09:00:00Z",
    reviewedAt: "2026-03-08T11:00:00Z",
    resolvedAt: "2026-03-08T11:00:00Z",
    activityLog: [
      { id: "log-5", action: "Return request submitted", performedBy: "Customer", createdAt: "2026-03-07T15:00:00Z" },
      { id: "log-6", action: "Item dropped off at Osu Mall PUDO", performedBy: "Customer", createdAt: "2026-03-07T16:30:00Z" },
      { id: "log-7", action: "Item in transit to retailer", performedBy: "Courier", createdAt: "2026-03-07T18:00:00Z" },
      { id: "log-8", action: "Item received by retailer", performedBy: "Seizer Sneakers", createdAt: "2026-03-08T09:00:00Z" },
      { id: "log-9", action: "Refund approved — GHS 2,000 as Store Credit", performedBy: "Seizer Sneakers", createdAt: "2026-03-08T11:00:00Z" },
    ],
  },
  "return-003": {
    id: "return-003",
    returnNumber: "RF-2026-00141",
    receiptId: "receipt-002",
    retailerName: "Melcom Ghana",
    customerName: "Ama Mensah",
    customerPhone: "+233551234567",
    items: [
      { id: "item-4", name: "Samsung Galaxy Buds FE", detail: "Graphite, Wireless", quantity: 1, price: 850, selected: true },
    ],
    returnReason: "DEFECTIVE",
    reasonDescription: "Right earbud not charging. Tried multiple cables.",
    photoUrls: [],
    status: "REJECTED",
    isEligible: true,
    logistics: {
      method: "HOME_PICKUP",
      fee: 40,
      timeSlot: "3:00 PM - 6:00 PM",
      phoneNumber: "+233551234567",
      phoneCountry: "GH",
    },
    refundAmount: 850,
    rejectionReason: "Item shows signs of water damage which voids the return policy.",
    currency: "GHS",
    requestedAt: "2026-03-06T12:00:00Z",
    collectedAt: "2026-03-06T15:30:00Z",
    inTransitAt: "2026-03-07T08:00:00Z",
    withRetailerAt: "2026-03-07T14:00:00Z",
    reviewedAt: "2026-03-08T10:00:00Z",
    activityLog: [
      { id: "log-10", action: "Return request submitted", performedBy: "Customer", createdAt: "2026-03-06T12:00:00Z" },
      { id: "log-11", action: "Item collected from customer", performedBy: "Courier", createdAt: "2026-03-06T15:30:00Z" },
      { id: "log-12", action: "Item in transit to retailer", performedBy: "Courier", createdAt: "2026-03-07T08:00:00Z" },
      { id: "log-13", action: "Item received by retailer", performedBy: "Melcom Ghana", createdAt: "2026-03-07T14:00:00Z" },
      { id: "log-14", action: "Return rejected — Item shows water damage", performedBy: "Melcom Ghana", createdAt: "2026-03-08T10:00:00Z" },
    ],
  },
};

export const MOCK_RETURNS: Record<string, ReturnRequest> =
  globalForMock.mockReturns ?? INITIAL_MOCK_RETURNS;

if (process.env.NODE_ENV !== "production") {
  globalForMock.mockReceipts = MOCK_RECEIPTS;
  globalForMock.mockReturns = MOCK_RETURNS;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getReceiptById(id: string): ReceiptForReturn | undefined {
  return MOCK_RECEIPTS[id];
}

export function getReturnById(id: string): ReturnRequest | undefined {
  return MOCK_RETURNS[id];
}

export function getReturnsByReceiptId(receiptId: string): ReturnRequest[] {
  return Object.values(MOCK_RETURNS).filter((r) => r.receiptId === receiptId);
}

export function addMockReceipt(receipt: ReceiptForReturn): void {
  MOCK_RECEIPTS[receipt.id] = receipt;
}

export function addMockReturn(returnReq: ReturnRequest): void {
  MOCK_RETURNS[returnReq.id] = returnReq;
}
