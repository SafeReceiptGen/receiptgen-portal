import React, { useState } from "react";
import { Plus, Trash2, Settings, ShoppingCart, RefreshCcw } from "lucide-react";
import { ReceiptData, LineItem } from "@/types";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animated/components/animate/tabs";
import { useExpandableScreen } from "@/components/ui/expandable-screen";

interface ReceiptFormProps {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
}

const CURRENCIES = [
  { value: "GHS", label: "Ghanaian Cedi (₵)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
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

const RETURN_WINDOWS = [
  "No returns",
  "3 days",
  "7 days",
  "14 days",
  "30 days",
  "Custom",
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

type Tab = "general" | "items" | "returns";

export const ReceiptForm: React.FC<ReceiptFormProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<Tab>("general");
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
      name: "New Product",
      detail: "Product description",
      quantity: 1,
      price: 100.0,
    };
    handleChange("items", [...data.items, newItem]);
  };

  const removeItem = (id: string) => {
    handleChange(
      "items",
      data.items.filter((item) => item.id !== id),
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as Tab)}
      className="flex h-full min-h-0 flex-col gap-0 text-white/80"
    >
      {/* Tabs */}
      <div className="shrink-0 border-b border-white/10 p-4">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="gap-2">
            <Settings size={14} /> General
          </TabsTrigger>
          <TabsTrigger value="items" className="gap-2">
            <ShoppingCart size={14} /> Items
          </TabsTrigger>
          <TabsTrigger value="returns" className="gap-2">
            <RefreshCcw size={14} /> Policy
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Content Area */}
      <TabsContents className="min-h-0 flex-1" animateHeight={false}>
        <TabsContent value="general" className="h-full">
          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 space-y-8">
            <section className="space-y-4">
              <h3 className="border-b border-white/10 pb-2 text-xs font-bold uppercase tracking-wider text-white/50">
                Store Info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={data.storeName}
                    onChange={(e) => handleChange("storeName", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Receipt No.
                  </label>
                  <input
                    type="text"
                    value={data.receiptNumber}
                    onChange={(e) =>
                      handleChange("receiptNumber", e.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Order ID
                </label>
                <input
                  type="text"
                  value={data.orderId}
                  onChange={(e) => handleChange("orderId", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Status Message
                </label>
                <textarea
                  value={data.orderStatus}
                  onChange={(e) => handleChange("orderStatus", e.target.value)}
                  className="h-20 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                />
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="border-b border-white/10 pb-2 text-xs font-bold uppercase tracking-wider text-white/50">
                Financials
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Currency
                  </label>
                  <div className="relative">
                    <select
                      value={data.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/45">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    value={data.vatRate}
                    onChange={(e) =>
                      handleChange("vatRate", parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Payment Method
                </label>
                <div className="relative">
                  <select
                    value={data.paymentMethod}
                    onChange={(e) =>
                      handleChange("paymentMethod", e.target.value)
                    }
                    className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/45">
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
            </section>
          </div>
        </TabsContent>

        <TabsContent value="items" className="h-full">
          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 space-y-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
                Line Items
              </h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-500"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className={`group relative rounded-xl border border-white/10 bg-white/4 p-4 transition-colors hover:border-white/15 ${!isExiting && !isOpening ? "animate-in fade-in slide-in-from-bottom-2" : ""}`}
                >
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 text-white/45 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(item.id, "name", e.target.value)
                      }
                      className="w-full border-b border-white/10 bg-transparent pb-1 text-sm font-medium text-white outline-none placeholder-white/30 focus:border-blue-400"
                      placeholder="Product Name"
                    />
                    <input
                      type="text"
                      value={item.detail}
                      onChange={(e) =>
                        handleItemChange(item.id, "detail", e.target.value)
                      }
                      className="w-full border-b border-white/10 bg-transparent pb-1 text-xs text-white/60 outline-none placeholder-white/25 focus:border-blue-400"
                      placeholder="Details (e.g. 200g, Medium Roast)"
                    />
                    <div className="mt-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-white/45">
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
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none transition-colors focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-white/45">
                          Price ({data.currency})
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
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none transition-colors focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {data.items.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-white/45">
                <p className="text-sm">No items added yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="returns" className="h-full">
          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 space-y-8">
            <section className="space-y-4">
              <h3 className="border-b border-white/10 pb-2 text-xs font-bold uppercase tracking-wider text-white/50">
                Return & Refund Policy
              </h3>

              {/* Return Window */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Return Window
                </label>
                <div className="relative">
                  <select
                    value={data.returnWindow}
                    onChange={(e) =>
                      handleChange("returnWindow", e.target.value)
                    }
                    className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                  >
                    {RETURN_WINDOWS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/45">
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

              {/* Custom Window Input - conditionally rendered */}
              {data.returnWindow === "Custom" && (
                <div
                  className={
                    !isExiting && !isOpening
                      ? "animate-in slide-in-from-top-2 fade-in space-y-1.5"
                      : "space-y-1.5"
                  }
                >
                  <label className="text-xs font-medium text-white/60">
                    Specify Custom Duration
                  </label>
                  <input
                    type="text"
                    value={data.customReturnWindow}
                    onChange={(e) =>
                      handleChange("customReturnWindow", e.target.value)
                    }
                    placeholder="e.g. 45 days, 3 months..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                  />
                </div>
              )}

              {/* Return Condition */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Return Condition
                </label>
                <div className="relative">
                  <select
                    value={data.returnCondition}
                    onChange={(e) =>
                      handleChange("returnCondition", e.target.value)
                    }
                    className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                  >
                    {RETURN_CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/45">
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

              {/* Refund Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Refund Type
                </label>
                <div className="relative">
                  <select
                    value={data.refundType}
                    onChange={(e) => handleChange("refundType", e.target.value)}
                    className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                  >
                    {REFUND_TYPES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/45">
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

              {/* Extra Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  QR Code URL (Returns Page)
                </label>
                <input
                  type="text"
                  value={data.qrUrl}
                  onChange={(e) => handleChange("qrUrl", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                />
                <p className="text-[10px] text-white/45">
                  The QR code on the receipt will link to this URL.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Marketing / Additional Note
                </label>
                <textarea
                  value={data.marketingText}
                  onChange={(e) =>
                    handleChange("marketingText", e.target.value)
                  }
                  className="h-16 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-400"
                  placeholder="Optional extra text..."
                />
              </div>
            </section>
          </div>
        </TabsContent>
      </TabsContents>
    </Tabs>
  );
};
