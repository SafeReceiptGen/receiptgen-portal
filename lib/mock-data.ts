// ─── ReturnFlow Mock Data ──────────────────────────────────────────────────────
// Realistic data shapes matching the types in types/returns.ts.
// Used to render all customer-facing ReturnFlow UI without a backend.

import { ReceiptForReturn, ReturnRequest, PudoPoint } from "@/types/returns";
import { Retailer, Receipt, Return } from "@/types/retailers";

// ─── Retailers ────────────────────────────────────────────────────────────────

export const MOCK_RETAILERS: Retailer[] = [
  {
    id: "retailer-001",
    name: "Seizer Sneakers",
    phone: "0244444444",
    email: "contact@seizersneakers.com",
    createdAt: "2025-01-15T00:00:00Z",
  },
  {
    id: "retailer-002",
    name: "Melcom Ghana",
    phone: "0302661218",
    email: "retailer@melcom.com",
    createdAt: "2024-06-20T00:00:00Z",
  },
  {
    id: "retailer-003",
    name: "Koala Shopping",
    phone: "0551234567",
    email: "info@koalashopping.com",
    createdAt: "2024-12-01T00:00:00Z",
  },
];

// ─── PUDO Points ──────────────────────────────────────────────────────────────

export const MOCK_PUDO_POINTS: PudoPoint[] = [
  { id: "pudo-1", name: "Osu Mall", address: "Oxford St, Osu, Accra" },
  {
    id: "pudo-2",
    name: "Airport Junction",
    address: "Airport Residential Area, Accra",
  },
  { id: "pudo-3", name: "Achimota Retail Centre", address: "Achimota, Accra" },
  {
    id: "pudo-4",
    name: "East Legon Hub",
    address: "Boundary Rd, East Legon, Accra",
  },
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
      {
        id: "item-1",
        name: "Nike Airforce Gray",
        detail: "Size 42, Men's",
        quantity: 1,
        price: 2000,
        selected: false,
      },
      {
        id: "item-2",
        name: "Nike Airforce White",
        detail: "Size 42, Men's",
        quantity: 1,
        price: 2000,
        selected: false,
      },
      {
        id: "item-3",
        name: "Nike Jordan 1 Retro",
        detail: "Size 43, High Top, Red/Black",
        quantity: 1,
        price: 1000,
        selected: false,
      },
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
      {
        id: "item-4",
        name: "Samsung Galaxy Buds FE",
        detail: "Graphite, Wireless",
        quantity: 1,
        price: 850,
        selected: false,
      },
      {
        id: "item-5",
        name: "Anker PowerCore 20000",
        detail: "Portable Charger, USB-C",
        quantity: 2,
        price: 320,
        selected: false,
      },
      {
        id: "item-6",
        name: "Baseus Car Phone Mount",
        detail: "Magnetic, Dashboard",
        quantity: 1,
        price: 180,
        selected: false,
      },
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
      {
        id: "item-7",
        name: "Blue Phoenix Coffee Beans",
        detail: "Medium Roast, 100% Arabica, 200g",
        quantity: 2,
        price: 570,
        selected: false,
      },
      {
        id: "item-8",
        name: "Jet Lag Ground Coffee",
        detail: "70/30 Arabica/Robusta, 200g",
        quantity: 1,
        price: 623,
        selected: false,
      },
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
      {
        id: "item-1",
        name: "Nike Airforce Gray",
        detail: "Size 42, Men's",
        quantity: 1,
        price: 2000,
        selected: true,
      },
      {
        id: "item-3",
        name: "Nike Jordan 1 Retro",
        detail: "Size 43, High Top, Red/Black",
        quantity: 1,
        price: 1000,
        selected: true,
      },
    ],
    returnReason: "DEFECTIVE",
    reasonDescription:
      "The sole of the Nike Airforce Gray is peeling after 3 days. The Jordan 1 has a scuff mark on the left toe that wasn't there at purchase.",
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
      {
        id: "log-1",
        action: "Return request submitted",
        performedBy: "Customer",
        createdAt: "2026-03-08T09:15:00Z",
      },
      {
        id: "log-2",
        action: "Item collected from customer",
        performedBy: "Courier",
        notes: "Picked up from Osu, Accra",
        createdAt: "2026-03-08T11:30:00Z",
      },
      {
        id: "log-3",
        action: "Item in transit to retailer",
        performedBy: "Courier",
        createdAt: "2026-03-08T14:00:00Z",
      },
      {
        id: "log-4",
        action: "Item received by retailer",
        performedBy: "Seizer Sneakers",
        notes: "Inspecting item condition",
        createdAt: "2026-03-09T10:00:00Z",
      },
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
      {
        id: "item-2",
        name: "Nike Airforce White",
        detail: "Size 42, Men's",
        quantity: 1,
        price: 2000,
        selected: true,
      },
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
      {
        id: "log-5",
        action: "Return request submitted",
        performedBy: "Customer",
        createdAt: "2026-03-07T15:00:00Z",
      },
      {
        id: "log-6",
        action: "Item dropped off at Osu Mall PUDO",
        performedBy: "Customer",
        createdAt: "2026-03-07T16:30:00Z",
      },
      {
        id: "log-7",
        action: "Item in transit to retailer",
        performedBy: "Courier",
        createdAt: "2026-03-07T18:00:00Z",
      },
      {
        id: "log-8",
        action: "Item received by retailer",
        performedBy: "Seizer Sneakers",
        createdAt: "2026-03-08T09:00:00Z",
      },
      {
        id: "log-9",
        action: "Refund approved — GHS 2,000 as Store Credit",
        performedBy: "Seizer Sneakers",
        createdAt: "2026-03-08T11:00:00Z",
      },
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
      {
        id: "item-4",
        name: "Samsung Galaxy Buds FE",
        detail: "Graphite, Wireless",
        quantity: 1,
        price: 850,
        selected: true,
      },
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
    rejectionReason:
      "Item shows signs of water damage which voids the return policy.",
    currency: "GHS",
    requestedAt: "2026-03-06T12:00:00Z",
    collectedAt: "2026-03-06T15:30:00Z",
    inTransitAt: "2026-03-07T08:00:00Z",
    withRetailerAt: "2026-03-07T14:00:00Z",
    reviewedAt: "2026-03-08T10:00:00Z",
    activityLog: [
      {
        id: "log-10",
        action: "Return request submitted",
        performedBy: "Customer",
        createdAt: "2026-03-06T12:00:00Z",
      },
      {
        id: "log-11",
        action: "Item collected from customer",
        performedBy: "Courier",
        createdAt: "2026-03-06T15:30:00Z",
      },
      {
        id: "log-12",
        action: "Item in transit to retailer",
        performedBy: "Courier",
        createdAt: "2026-03-07T08:00:00Z",
      },
      {
        id: "log-13",
        action: "Item received by retailer",
        performedBy: "Melcom Ghana",
        createdAt: "2026-03-07T14:00:00Z",
      },
      {
        id: "log-14",
        action: "Return rejected — Item shows water damage",
        performedBy: "Melcom Ghana",
        createdAt: "2026-03-08T10:00:00Z",
      },
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

// ─── Dashboard Receipts & Returns ──────────────────────────────────────────────

const DASHBOARD_MOCK_RECEIPTS: Receipt[] = [
  {
    id: "receipt-d001",
    receiptNumber: "SR-2026-0469",
    retailerId: "retailer-001",
    retailerName: "Seizer Sneakers",
    customerName: "Jayden Osafo",
    customerPhone: "0244444444",
    items: [
      {
        id: "1",
        name: "Nike Airforce Gray",
        detail: "Size 42, Men's",
        quantity: 1,
        price: 2000,
      },
      {
        id: "2",
        name: "Nike Airforce White",
        detail: "Size 42, Men's",
        quantity: 1,
        price: 2000,
      },
      {
        id: "3",
        name: "Nike Jordan 1 Retro",
        detail: "Size 43, High Top, Red/Black",
        quantity: 1,
        price: 1000,
      },
    ],
    subtotal: 5000,
    total: 5000,
    currency: "GHS",
    paymentMethod: "Mobile Money",
    purchasedAt: "2026-03-02T14:30:00Z",
    status: "pending_return",
    isReturnable: true,
    returnWindow: "14 days",
  },
  {
    id: "receipt-d002",
    receiptNumber: "SR-2026-0512",
    retailerId: "retailer-002",
    retailerName: "Melcom Ghana",
    customerName: "Ama Mensah",
    customerPhone: "0551234567",
    items: [
      {
        id: "4",
        name: "Samsung Galaxy Buds FE",
        detail: "Graphite, Wireless",
        quantity: 1,
        price: 850,
      },
      {
        id: "5",
        name: "Anker PowerCore 20000",
        detail: "Portable Charger, USB-C",
        quantity: 2,
        price: 320,
      },
      {
        id: "6",
        name: "Baseus Car Phone Mount",
        detail: "Magnetic, Dashboard",
        quantity: 1,
        price: 180,
      },
    ],
    subtotal: 1670,
    total: 1670,
    currency: "GHS",
    paymentMethod: "Card",
    purchasedAt: "2026-03-05T10:15:00Z",
    status: "issued",
    isReturnable: true,
    returnWindow: "7 days",
  },
  {
    id: "receipt-d003",
    receiptNumber: "SR-2026-0488",
    retailerId: "retailer-003",
    retailerName: "Koala Shopping",
    customerName: "Kwame Asante",
    customerPhone: "0551234567",
    items: [
      {
        id: "7",
        name: "Blue Phoenix Coffee Beans",
        detail: "Medium Roast, 100% Arabica, 200g",
        quantity: 2,
        price: 570,
      },
      {
        id: "8",
        name: "Jet Lag Ground Coffee",
        detail: "70/30 Arabica/Robusta, 200g",
        quantity: 1,
        price: 623,
      },
    ],
    subtotal: 1763,
    total: 1763,
    currency: "GHS",
    paymentMethod: "Mobile Money",
    purchasedAt: "2026-03-07T16:45:00Z",
    status: "issued",
    isReturnable: false,
  },
  {
    id: "receipt-d004",
    receiptNumber: "SR-2026-0524",
    retailerId: "retailer-001",
    retailerName: "Seizer Sneakers",
    customerName: "Benjamin Kojo",
    customerPhone: "0201234567",
    items: [
      {
        id: "9",
        name: "Adidas Ultraboost 23",
        detail: "Black, Size 10",
        quantity: 1,
        price: 2500,
      },
    ],
    subtotal: 2500,
    total: 2500,
    currency: "GHS",
    paymentMethod: "Card",
    purchasedAt: "2026-03-08T09:20:00Z",
    status: "returned",
    isReturnable: true,
    returnWindow: "14 days",
  },
  {
    id: "receipt-d005",
    receiptNumber: "SR-2026-0535",
    retailerId: "retailer-002",
    retailerName: "Melcom Ghana",
    customerName: "Akosua Adu",
    customerPhone: "0241234567",
    items: [
      {
        id: "10",
        name: "LG 55 inch OLED TV",
        detail: "4K, Smart",
        quantity: 1,
        price: 8500,
      },
    ],
    subtotal: 8500,
    total: 8500,
    currency: "GHS",
    paymentMethod: "Card",
    purchasedAt: "2026-02-28T13:10:00Z",
    status: "issued",
    isReturnable: true,
    returnWindow: "30 days",
  },
  {
    id: "receipt-d006",
    receiptNumber: "SR-2026-0545",
    retailerId: "retailer-001",
    retailerName: "Seizer Sneakers",
    customerName: "David Mensah",
    customerPhone: "0261234567",
    items: [
      {
        id: "11",
        name: "Puma RS-X",
        detail: "White/Black, Size 9",
        quantity: 2,
        price: 1200,
      },
    ],
    subtotal: 2400,
    total: 2400,
    currency: "GHS",
    paymentMethod: "Mobile Money",
    purchasedAt: "2026-03-10T11:45:00Z",
    status: "issued",
    isReturnable: true,
    returnWindow: "14 days",
  },
  {
    id: "receipt-d007",
    receiptNumber: "SR-2026-0556",
    retailerId: "retailer-003",
    retailerName: "Koala Shopping",
    customerName: "Abigail Boateng",
    customerPhone: "0271234567",
    items: [
      {
        id: "12",
        name: "Organic Honey",
        detail: "500ml, Raw",
        quantity: 3,
        price: 450,
      },
      {
        id: "13",
        name: "Green Tea Leaves",
        detail: "Premium Blend, 100g",
        quantity: 1,
        price: 380,
      },
    ],
    subtotal: 1730,
    total: 1730,
    currency: "GHS",
    paymentMethod: "Mobile Money",
    purchasedAt: "2026-03-11T15:30:00Z",
    status: "pending_return",
    isReturnable: true,
    returnWindow: "7 days",
  },
  {
    id: "receipt-d008",
    receiptNumber: "SR-2026-0567",
    retailerId: "retailer-002",
    retailerName: "Melcom Ghana",
    customerName: "Emmanuel Osei",
    customerPhone: "0281234567",
    items: [
      {
        id: "14",
        name: "Apple AirPods Pro",
        detail: "White",
        quantity: 1,
        price: 1850,
      },
    ],
    subtotal: 1850,
    total: 1850,
    currency: "GHS",
    paymentMethod: "Card",
    purchasedAt: "2026-03-12T08:30:00Z",
    status: "issued",
    isReturnable: true,
    returnWindow: "14 days",
  },
  {
    id: "receipt-d009",
    receiptNumber: "SR-2026-0578",
    retailerId: "retailer-001",
    retailerName: "Seizer Sneakers",
    customerName: "Nana Yaa",
    customerPhone: "0291234567",
    items: [
      {
        id: "15",
        name: "New Balance 990v6",
        detail: "Grey, Size 8",
        quantity: 1,
        price: 3200,
      },
    ],
    subtotal: 3200,
    total: 3200,
    currency: "GHS",
    paymentMethod: "Mobile Money",
    purchasedAt: "2026-03-13T12:00:00Z",
    status: "exchanged",
    isReturnable: true,
    returnWindow: "14 days",
  },
  {
    id: "receipt-d010",
    receiptNumber: "SR-2026-0589",
    retailerId: "retailer-003",
    retailerName: "Koala Shopping",
    customerName: "Samuel Adjei",
    customerPhone: "0301234567",
    items: [
      {
        id: "16",
        name: "Dark Chocolate Bar",
        detail: "70% Cocoa, 100g",
        quantity: 5,
        price: 250,
      },
    ],
    subtotal: 1250,
    total: 1250,
    currency: "GHS",
    paymentMethod: "Cash",
    purchasedAt: "2026-03-14T16:45:00Z",
    status: "issued",
    isReturnable: false,
  },
];

const DASHBOARD_MOCK_RETURNS: Return[] = [
  {
    id: "return-d001",
    returnNumber: "RF-2026-00127",
    receiptId: "receipt-d001",
    receiptNumber: "SR-2026-0469",
    retailerId: "retailer-001",
    retailerName: "Seizer Sneakers",
    customerName: "Jayden Osafo",
    customerPhone: "0244444444",
    items: [
      {
        id: "1",
        name: "Nike Airforce Gray",
        detail: "Size 42, Men's",
        quantity: 1,
        price: 2000,
      },
      {
        id: "3",
        name: "Nike Jordan 1 Retro",
        detail: "Size 43, High Top, Red/Black",
        quantity: 1,
        price: 1000,
      },
    ],
    returnReason: "Defective - sole peeling",
    reasonDescription:
      "The sole of the Nike Airforce Gray is peeling after 3 days. The Jordan 1 has a scuff mark on the left toe.",
    status: "pending",
    refundAmount: 3000,
    currency: "GHS",
    requestedAt: "2026-03-08T09:15:00Z",
  },
  {
    id: "return-d002",
    returnNumber: "RF-2026-00134",
    receiptId: "receipt-d001",
    receiptNumber: "SR-2026-0469",
    retailerId: "retailer-001",
    retailerName: "Seizer Sneakers",
    customerName: "Jayden Osafo",
    customerPhone: "0244444444",
    items: [
      {
        id: "2",
        name: "Nike Airforce White",
        detail: "Size 42, Men's",
        quantity: 1,
        price: 2000,
      },
    ],
    returnReason: "Changed mind",
    reasonDescription: "Found a better deal elsewhere.",
    status: "approved",
    refundAmount: 2000,
    currency: "GHS",
    requestedAt: "2026-03-07T15:00:00Z",
    reviewedAt: "2026-03-08T11:00:00Z",
  },
  {
    id: "return-d003",
    returnNumber: "RF-2026-00141",
    receiptId: "receipt-d002",
    receiptNumber: "SR-2026-0512",
    retailerId: "retailer-002",
    retailerName: "Melcom Ghana",
    customerName: "Ama Mensah",
    customerPhone: "0551234567",
    items: [
      {
        id: "4",
        name: "Samsung Galaxy Buds FE",
        detail: "Graphite, Wireless",
        quantity: 1,
        price: 850,
      },
    ],
    returnReason: "Defective - not charging",
    reasonDescription: "Right earbud not charging. Tried multiple cables.",
    status: "rejected",
    refundAmount: 0,
    currency: "GHS",
    requestedAt: "2026-03-06T12:00:00Z",
    reviewedAt: "2026-03-08T10:00:00Z",
    rejectionReason:
      "Item shows signs of water damage which voids the return policy.",
  },
  {
    id: "return-d004",
    returnNumber: "RF-2026-00152",
    receiptId: "receipt-d007",
    receiptNumber: "SR-2026-0556",
    retailerId: "retailer-003",
    retailerName: "Koala Shopping",
    customerName: "Abigail Boateng",
    customerPhone: "0271234567",
    items: [
      {
        id: "12",
        name: "Organic Honey",
        detail: "500ml, Raw",
        quantity: 1,
        price: 450,
      },
    ],
    returnReason: "Expiry date issue",
    reasonDescription: "The product has expired. Need a fresh batch.",
    status: "pending",
    refundAmount: 450,
    currency: "GHS",
    requestedAt: "2026-03-11T16:00:00Z",
  },
];

export function getRetailerById(id: string): Retailer | undefined {
  return MOCK_RETAILERS.find((r) => r.id === id);
}

export function getReceiptsByRetailerId(retailerId: string): Receipt[] {
  return DASHBOARD_MOCK_RECEIPTS.filter((r) => r.retailerId === retailerId);
}

export function getReturnsByRetailerId(retailerId: string): Return[] {
  return DASHBOARD_MOCK_RETURNS.filter((r) => r.retailerId === retailerId);
}

export function getDashboardReceiptById(id: string): Receipt | undefined {
  return DASHBOARD_MOCK_RECEIPTS.find((r) => r.id === id);
}

export function getDashboardReturnById(id: string): Return | undefined {
  return DASHBOARD_MOCK_RETURNS.find((r) => r.id === id);
}
