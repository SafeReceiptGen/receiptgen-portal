"use client";
import { useState } from "react";
import {
  Plus,
  Trash2,
  Settings,
  ShoppingCart,
  RefreshCcw,
  Calendar as CalendarIcon,
} from "lucide-react";
import { ReceiptData, LineItem } from "@/types";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animated/components/animate/tabs";
import { useExpandableScreen } from "@/components/ui/expandable-screen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ActionState } from "./actions";

interface ReceiptFormProps {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
  actionState?: ActionState;
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

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  data,
  onChange,
  actionState,
}) => {
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
      <div className="shrink-0 border-b border-slate-200 p-4 dark:border-white/10">
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
              <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:text-white/50">
                Store Info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                    Store Name
                  </Label>
                  <Input
                    type="text"
                    value={data.storeName}
                    onChange={(e) => handleChange("storeName", e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                    Store Phone
                  </Label>
                  <Input
                    type="text"
                    value={data.storePhone}
                    onChange={(e) => handleChange("storePhone", e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                  Customer Name{" "}
                  <span className="text-slate-400 dark:text-white/30">
                    (Optional)
                  </span>
                </Label>
                <Input
                  type="text"
                  value={data.customerName || ""}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="e.g. Emma Doe"
                  className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-400 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white",
                        !data.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.date ? (
                        format(new Date(data.date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={data.date ? new Date(data.date) : undefined}
                      onSelect={(date) =>
                        handleChange("date", date ? date.toISOString() : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/60">
                  Status Message
                </Label>
                <Textarea
                  value={data.orderStatus}
                  onChange={(e) => handleChange("orderStatus", e.target.value)}
                  className="h-20 w-full resize-none bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
                />
              </div> */}
            </section>
            <section className="space-y-4">
              <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:text-white/50">
                Financials
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                    Currency
                  </Label>
                  <Select
                    value={data.currency}
                    onValueChange={(value) => handleChange("currency", value)}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/60">
                    VAT Rate (%)
                  </Label>
                  <Input
                    type="number"
                    
                    value={data.vatRate}
                    onChange={(e) =>
                      handleChange("vatRate", parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
                  />
                </div> */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                    Payment Method
                  </Label>
                  <Select
                    value={data.paymentMethod}
                    onValueChange={(value) =>
                      handleChange("paymentMethod", value)
                    }
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="items" className="h-full">
          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 space-y-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
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
                  className={`group relative rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/4 dark:hover:border-white/15 ${!isExiting && !isOpening ? "animate-in fade-in slide-in-from-bottom-2" : ""}`}
                >
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:text-white/45 dark:hover:text-red-300"
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
                      className="w-full border-b border-slate-200 bg-transparent pb-1 text-sm font-medium text-slate-900 outline-none placeholder-slate-400 focus:border-blue-400 dark:border-white/10 dark:text-white dark:placeholder-white/30"
                      placeholder="Product Name"
                    />
                    <input
                      type="text"
                      value={item.detail}
                      onChange={(e) =>
                        handleItemChange(item.id, "detail", e.target.value)
                      }
                      className="w-full border-b border-slate-200 bg-transparent pb-1 text-xs text-slate-500 outline-none placeholder-slate-400 focus:border-blue-400 dark:border-white/10 dark:text-white/60 dark:placeholder-white/25"
                      placeholder="Details (e.g. 200g, Medium Roast)"
                    />
                    <div className="mt-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-slate-400 dark:text-white/45">
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none transition-colors focus:border-blue-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-slate-400 dark:text-white/45">
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none transition-colors focus:border-blue-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {data.items.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-400 dark:border-white/10 dark:text-white/45">
                <p className="text-sm">No items added yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="returns" className="h-full">
          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 space-y-8">
            <section className="space-y-4">
              <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:text-white/50">
                Return & Refund Policy
              </h3>

              {/* Return Window */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                  Return Window
                </Label>
                <Select
                  value={data.returnWindow}
                  onValueChange={(value) => handleChange("returnWindow", value)}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
                    <SelectValue placeholder="Select return window" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_WINDOWS.map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                    Specify Custom Duration
                  </Label>
                  <Input
                    type="text"
                    value={data.customReturnWindow}
                    onChange={(e) =>
                      handleChange("customReturnWindow", e.target.value)
                    }
                    placeholder="e.g. 45 days, 3 months..."
                    className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/20"
                  />
                </div>
              )}

              {/* Return Condition */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                  Return Condition
                </Label>
                <Select
                  value={data.returnCondition}
                  onValueChange={(value) =>
                    handleChange("returnCondition", value)
                  }
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
                    <SelectValue placeholder="Select return condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Refund Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                  Refund Type
                </Label>
                <Select
                  value={data.refundType}
                  onValueChange={(value) => handleChange("refundType", value)}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
                    <SelectValue placeholder="Select refund type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFUND_TYPES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Extra Details */}
              {/* <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/60">
                  QR Code URL (Returns Page)
                </Label>
                <Input
                  type="text"
                  value={data.qrUrl}
                  onChange={(e) => handleChange("qrUrl", e.target.value)}
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
                />
                <p className="text-[10px] text-white/45">
                  The QR code on the receipt will link to this URL.
                </p>
              </div> */}

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                  Marketing / Additional Note
                </Label>
                <Textarea
                  value={data.marketingText}
                  onChange={(e) =>
                    handleChange("marketingText", e.target.value)
                  }
                  className="h-16 w-full resize-none bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/20"
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
