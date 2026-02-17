import React, { RefObject, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import { ReceiptData, LineItem } from "@/types";
import { ReceiptPreview } from "./receipt-preview";
import { useExpandableScreen } from "@/components/ui/expandable-screen";

interface MobileWizardProps {
  data: ReceiptData;
  ref: RefObject<HTMLDivElement | null>;
  onChange: (data: ReceiptData) => void;
  onDownload: () => void;
}

const STEPS = [
  { id: "store", title: "Store Details" },
  { id: "items", title: "Add Items" },
  { id: "financials", title: "Financials" },
  { id: "policy", title: "Policy" },
  { id: "preview", title: "Preview" },
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "GHS", label: "Ghanaian Cedi (₵)" },
  { value: "NGN", label: "Nigerian Naira (₦)" },
  { value: "KES", label: "Kenyan Shilling (KSh)" },
  { value: "ZAR", label: "South African Rand (R)" },
];

const PAYMENT_METHODS = [
  "Cash",
  "Mobile Money",
  "Card",
  "Bank Transfer",
  "Wallet",
  "Check",
];

const RETURN_CONDITIONS = [
  "Unused",
  "Original Packaging",
  "Any Condition",
  "Defective Only",
];

const REFUND_TYPES = [
  "Full Refund",
  "Partial Refund",
  "Store Credit",
  "Exchange Only",
];

export const MobileWizard: React.FC<MobileWizardProps> = ({
  ref,
  data,
  onChange,
  onDownload,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isExiting, isOpening } = useExpandableScreen();

  const handleChange = (field: keyof ReceiptData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    const newItems = data.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    handleChange("items", newItems);
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Item",
      detail: "",
      quantity: 1,
      price: 0,
    };
    handleChange("items", [...data.items, newItem]);
  };

  const removeItem = (id: string) => {
    handleChange(
      "items",
      data.items.filter((item) => item.id !== id),
    );
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((c) => c + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((c) => c - 1);
  };

  return (
    <div className="flex w-full md:hidden flex-col h-full min-h-0 overflow-hidden">
      {/* Step Progress Header */}
      <div className="shrink-0 border-b border-white/10 bg-[#061124]/80 px-6 pt-6 pb-3 backdrop-blur">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            SafeReceipt
          </h1>
          <span className="text-xs font-mono text-white/50">
            Step {currentStep + 1}/{STEPS.length}
          </span>
        </div>
        <div className="flex gap-1 h-1">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`h-full rounded-full flex-1 transition-all duration-300 ${idx <= currentStep ? "bg-blue-500" : "bg-white/10"}`}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white tracking-tight animate-in slide-in-from-left-2 duration-300 key={currentStep}">
            {STEPS[currentStep].title}
          </h2>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6">
        {currentStep === 0 && (
          <div
            className={`space-y-6 ${!isExiting && !isOpening ? "animate-in slide-in-from-right fade-in duration-300" : ""}`}
          >
            <div className="space-y-2">
              <label className="text-sm text-white/70">Store Name</label>
              <input
                type="text"
                value={data.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-lg text-white placeholder-white/35 outline-none transition-colors focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Order ID</label>
              <input
                type="text"
                value={data.orderId}
                onChange={(e) => handleChange("orderId", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-lg text-white placeholder-white/35 outline-none transition-colors focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Receipt Number</label>
              <input
                type="text"
                value={data.receiptNumber}
                onChange={(e) => handleChange("receiptNumber", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-lg text-white placeholder-white/35 outline-none transition-colors focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Status Message</label>
              <textarea
                value={data.orderStatus}
                onChange={(e) => handleChange("orderStatus", e.target.value)}
                className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-base text-white placeholder-white/35 outline-none transition-colors focus:border-blue-400"
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div
            className={`space-y-6 ${!isExiting && !isOpening ? "animate-in slide-in-from-right fade-in duration-300" : ""}`}
          >
            {data.items.map((item, idx) => (
              <div
                key={item.id}
                className="relative rounded-xl border border-white/10 bg-white/4 p-4"
              >
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 p-2 text-white/45 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(item.id, "name", e.target.value)
                    }
                    className="w-full border-b border-white/10 bg-transparent pb-2 text-lg font-medium text-white outline-none placeholder-white/30 focus:border-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Details (e.g. 200g, Medium Roast)"
                    value={item.detail}
                    onChange={(e) =>
                      handleItemChange(item.id, "detail", e.target.value)
                    }
                    className="w-full border-b border-white/10 bg-transparent pb-2 text-sm text-white/60 outline-none placeholder-white/25 focus:border-blue-400"
                  />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-white/50 uppercase">
                        Qty
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-center text-white outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="flex-2">
                      <label className="text-xs text-white/50 uppercase">
                        Price
                      </label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addItem}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-4 text-white/70 transition-colors hover:bg-white/4"
            >
              <Plus size={20} /> Add Another Item
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div
            className={`space-y-6 ${!isExiting && !isOpening ? "animate-in slide-in-from-right fade-in duration-300" : ""}`}
          >
            <div className="space-y-2">
              <label className="text-sm text-white/70">Currency</label>
              <div className="relative">
                <select
                  value={data.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 p-4 text-lg text-white outline-none focus:border-blue-400"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/45">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Payment Method</label>
              <div className="relative">
                <select
                  value={data.paymentMethod}
                  onChange={(e) =>
                    handleChange("paymentMethod", e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 p-4 text-lg text-white outline-none focus:border-blue-400"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/45">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">VAT (%)</label>
              <input
                type="number"
                value={data.vatRate}
                onChange={(e) =>
                  handleChange("vatRate", parseFloat(e.target.value) || 0)
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-lg text-white outline-none focus:border-blue-400"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div
            className={`space-y-6 ${!isExiting && !isOpening ? "animate-in slide-in-from-right fade-in duration-300" : ""}`}
          >
            <div className="space-y-2">
              <label className="text-sm text-white/70">Return Window</label>
              <div className="relative">
                <select
                  value={data.returnWindow}
                  onChange={(e) => handleChange("returnWindow", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-blue-400"
                >
                  <option>No returns</option>
                  <option>3 days</option>
                  <option>7 days</option>
                  <option>14 days</option>
                  <option>30 days</option>
                  <option>Custom</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/45">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            {data.returnWindow === "Custom" && (
              <input
                type="text"
                placeholder="e.g. 45 days"
                value={data.customReturnWindow}
                onChange={(e) =>
                  handleChange("customReturnWindow", e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-blue-400"
              />
            )}

            <div className="space-y-2">
              <label className="text-sm text-white/70">Return Condition</label>
              <div className="relative">
                <select
                  value={data.returnCondition}
                  onChange={(e) =>
                    handleChange("returnCondition", e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-blue-400"
                >
                  {RETURN_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/45">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Refund Type</label>
              <div className="relative">
                <select
                  value={data.refundType}
                  onChange={(e) => handleChange("refundType", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-blue-400"
                >
                  {REFUND_TYPES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/45">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">QR Code URL</label>
              <input
                type="text"
                value={data.qrUrl}
                onChange={(e) => handleChange("qrUrl", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-base text-white outline-none transition-colors focus:border-blue-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">
                Marketing / Additional Note
              </label>
              <textarea
                value={data.marketingText}
                onChange={(e) => handleChange("marketingText", e.target.value)}
                className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none transition-colors focus:border-blue-400"
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="h-full -mx-6 -mt-6">
            <ReceiptPreview data={data} ref={ref} />
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="shrink-0 border-t border-white/10 bg-[#061124]/90 p-4 backdrop-blur flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={prevStep}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white/70"
          >
            <ChevronLeft />
          </button>
        )}
        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={nextStep}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-blue-500 to-blue-700 py-4 text-lg font-bold text-white shadow-lg shadow-blue-900/20 ring-1 ring-white/10"
          >
            Next Step <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={onDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-4 text-lg font-bold text-[#071427] shadow-lg ring-1 ring-black/5"
          >
            <Download size={20} /> Download Receipt
          </button>
        )}
      </div>
    </div>
  );
};
