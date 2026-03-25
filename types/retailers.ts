export interface Retailer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  logo?: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  retailerId: string;
  retailerName: string;
  customerName: string;
  customerPhone?: string;
  items: {
    id: string;
    name: string;
    detail: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  total: number;
  currency: string;
  paymentMethod: string;
  purchasedAt: string;
  status: "issued" | "pending_return" | "returned" | "exchanged";
  isReturnable: boolean;
  returnWindow?: string;
}

export interface Return {
  id: string;
  returnNumber: string;
  receiptId: string;
  receiptNumber: string;
  retailerId: string;
  retailerName: string;
  customerName: string;
  customerPhone?: string;
  items: {
    id: string;
    name: string;
    detail: string;
    quantity: number;
    price: number;
  }[];
  returnReason: string;
  reasonDescription?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  refundAmount: number;
  currency: string;
  requestedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}
