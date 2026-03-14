"use server";

import { ReturnFlowFormData } from "@/lib/validations/return-schema";
import { getReceiptById, addMockReturn } from "@/lib/mock-data";
import { ReturnRequest, ReturnReason, LogisticsMethod } from "@/types/returns";

export async function submitReturnRequest(data: ReturnFlowFormData, receiptId: string): Promise<string> {
  const receipt = getReceiptById(receiptId);
  if (!receipt) {
    throw new Error("Receipt not found");
  }

  const selectedItems = data.items.filter((i) => i.selected);
  const refundAmount = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const newReturnId = `return-${Date.now()}`;
  const returnNumber = `RF-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;

  const fee = data.logistics?.method === "HOME_PICKUP" ? 50 : 30;

  const returnReq: ReturnRequest = {
    id: newReturnId,
    returnNumber,
    receiptId: receipt.id,
    retailerName: receipt.storeName,
    customerName: receipt.customerName || "Customer",
    customerPhone: data.logistics?.phoneNumber || "", // Fallback
    items: selectedItems,
    returnReason: (data.reason as ReturnReason) || "CHANGED_MIND",
    reasonDescription: data.description,
    photoUrls: [], // No real uploads in mock
    status: "APPROVED", // Auto-approve for demo
    isEligible: true,
    logistics: {
      method: (data.logistics?.method as LogisticsMethod) || "DROP_OFF",
      fee,
      pudoPointId: data.logistics?.pudoPointId,
      timeSlot: data.logistics?.timeSlot || "",
      phoneNumber: data.logistics?.phoneNumber || "",
      phoneCountry: data.logistics?.phoneCountry || "GH",
    },
    refundAmount,
    currency: receipt.currency,
    requestedAt: new Date().toISOString(),
    activityLog: [
      {
        id: `log-${Date.now()}`,
        action: "Return request submitted",
        performedBy: "Customer",
        createdAt: new Date().toISOString(),
      },
      {
        id: `log-${Date.now()+1}`,
        action: "Return automatically approved (Demo)",
        performedBy: "System",
        createdAt: new Date().toISOString(),
      }
    ],
  };

  addMockReturn(returnReq);

  return newReturnId;
}
