"use client";
import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Settings,
  ShoppingCart,
  RefreshCcw,
  Calendar as CalendarIcon,
  Store as StoreIcon,
  ChevronDown,
  Sparkles,
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
import Link from "next/link";
import { Store } from "@/lib/api";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payment-methods";

interface ReceiptFormProps {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
  actionState?: ActionState;
  isAuthenticated?: boolean;
  userStores: Store[];
  storesLoading: boolean;
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
  isAuthenticated = false,
  userStores,
  storesLoading,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const { isExiting, isOpening } = useExpandableScreen();
  
  const selectedStore = userStores.find(s => s.id === data.storeId);
  const savedProducts = selectedStore?.storeCatalog || [];
  const productsLoading = storesLoading;

  const dataRef = useRef(data);
  dataRef.current = data;
  const isPolicyDisabled = !!data.storeId;

  // Auto-select the only store when the user has exactly one
  useEffect(() => {
    if (!isAuthenticated || storesLoading || userStores.length !== 1) return;
    if (dataRef.current.storeId) return;
    const s = userStores[0];
    const policy = s.returnPolicy;

    const mapReturnWindow = (val: any) => ({"0": "No returns", none: "No returns", "1": "3 days", "3_days": "3 days", "2": "7 days", "7_days": "7 days", "3": "14 days", "14_days": "14 days", "4": "30 days", "30_days": "30 days", "5": "Custom", custom: "Custom"})[String(val)] || "30 days";
    const mapReturnCondition = (val: any) => ({"0": "Unused", unused: "Unused", "1": "Original Packaging", original_packaging: "Original Packaging", "2": "Any Condition", any_condition: "Any Condition", "3": "Defective Only", defective_only: "Defective Only"})[String(val)] || "Original Packaging";
    const mapRefundType = (val: any) => ({"0": "Full Refund", full_refund: "Full Refund", "1": "Partial Refund", partial_refund: "Partial Refund", "2": "Store Credit", store_credit: "Store Credit", "3": "Exchange Only", exchange_only: "Exchange Only"})[String(val)] || "Store Credit";

    onChange({
      ...dataRef.current,
      storeId: s.id,
      storeName: s.name,
      storePhone: s.phone ?? "",
      ...(policy && {
        returnWindow: mapReturnWindow(policy.returnWindow),
        customReturnWindow: policy.customWindowDays ? `${policy.customWindowDays} days` : "",
        returnCondition: mapReturnCondition(policy.returnCondition),
        refundType: mapRefundType(policy.refundType),
      })
    });
  }, [isAuthenticated, storesLoading, userStores, onChange]);

  const handleChange = (field: keyof ReceiptData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    const newItems = data.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    handleChange("items", newItems);
  };

  const addItem = (name = "New Product", detail = "") => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      detail,
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

              {/* Store selector — authenticated users pick from their stores */}
              {isAuthenticated && userStores.length > 0 && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-white/60">
                    <StoreIcon size={12} />
                    Select Store
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-sm text-slate-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      disabled={storesLoading}
                      value={
                        data.storeId &&
                        userStores.some((s) => s.id === data.storeId)
                          ? data.storeId
                          : ""
                      }
                      onChange={(e) => {
                        const selected = userStores.find(
                          (s) => s.id === e.target.value,
                        );
                        if (selected) {
                          const policy = selected.returnPolicy;

                          const mapReturnWindow = (val: any) => ({"0": "No returns", none: "No returns", "1": "3 days", "3_days": "3 days", "2": "7 days", "7_days": "7 days", "3": "14 days", "14_days": "14 days", "4": "30 days", "30_days": "30 days", "5": "Custom", custom: "Custom"})[String(val)] || "30 days";
                          const mapReturnCondition = (val: any) => ({"0": "Unused", unused: "Unused", "1": "Original Packaging", original_packaging: "Original Packaging", "2": "Any Condition", any_condition: "Any Condition", "3": "Defective Only", defective_only: "Defective Only"})[String(val)] || "Original Packaging";
                          const mapRefundType = (val: any) => ({"0": "Full Refund", full_refund: "Full Refund", "1": "Partial Refund", partial_refund: "Partial Refund", "2": "Store Credit", store_credit: "Store Credit", "3": "Exchange Only", exchange_only: "Exchange Only"})[String(val)] || "Store Credit";

                          onChange({
                            ...data,
                            storeId: selected.id,
                            storeName: selected.name,
                            storePhone: selected.phone ?? "",
                            ...(policy && {
                              returnWindow: mapReturnWindow(policy.returnWindow),
                              customReturnWindow: policy.customWindowDays ? `${policy.customWindowDays} days` : "",
                              returnCondition: mapReturnCondition(policy.returnCondition),
                              refundType: mapRefundType(policy.refundType),
                            })
                          });
                        }
                      }}
                    >
                      <option value="" disabled>
                        Pick a store…
                      </option>
                      {userStores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-white/35">
                    Or edit the fields below to override.
                  </p>
                </div>
              )}

              {isAuthenticated && storesLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/30">
                  <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  Loading your stores…
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                    Store Name
                  </Label>
                  <Input
                    type="text"
                    value={data.storeName}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        storeName: e.target.value,
                        storeId: "",
                      })
                    }
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
                    onChange={(e) =>
                      onChange({
                        ...data,
                        storePhone: e.target.value,
                        storeId: "",
                      })
                    }
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
                      {PAYMENT_METHOD_OPTIONS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
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
            {/* ── Saved Products Quick-Add Shelf ─────────────────────── */}
            {isAuthenticated && data.storeId && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
                    Saved Products
                  </span>
                </div>

                {productsLoading ? (
                  <div className="flex gap-2 overflow-hidden">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="h-7 w-24 shrink-0 animate-pulse rounded-full bg-slate-100 dark:bg-white/8"
                      />
                    ))}
                  </div>
                ) : savedProducts.length > 0 ? (
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {savedProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addItem(p.name, p.description ?? "")}
                        title={p.name}
                        className="group/chip inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow-blue-100 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-blue-400/60 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                      >
                        <Plus
                          size={11}
                          className="shrink-0 text-slate-400 transition-colors group-hover/chip:text-blue-500 dark:text-white/30 dark:group-hover/chip:text-blue-400"
                        />
                        {p.name}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="border-b border-slate-100 dark:border-white/8" />
              </div>
            )}

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                Line Items
              </h3>
              <button
                onClick={() => addItem()}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-500 active:scale-95"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            {/* ── Item Cards ─────────────────────────────────────────── */}
            <div className="space-y-4">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className={`group relative rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/4 dark:hover:border-white/15 ${!isExiting && !isOpening ? "animate-in fade-in slide-in-from-bottom-2" : ""}`}
                >
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:text-white/45 dark:hover:text-red-300"
                  >
                    <Trash2 size={13} />
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
                <p className="text-sm">
                  {isAuthenticated && data.storeId
                    ? "Pick a saved product above or add an item manually"
                    : "No items added yet"}
                </p>
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

              {isPolicyDisabled && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 flex gap-3 items-start dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                  <StoreIcon size={16} className="shrink-0 mt-0.5" />
                  <p className="leading-snug text-xs">
                    Store return policy applied automatically.{" "}
                    <Link href={`/dashboard/stores/${data.storeId}`} className="font-semibold underline hover:text-blue-800 dark:hover:text-blue-300">
                      Modify defaults in your Store settings
                    </Link>.
                  </p>
                </div>
              )}

              {/* Return Window */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                  Return Window
                </Label>
                <Select
                  disabled={isPolicyDisabled}
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
                    disabled={isPolicyDisabled}
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
                  disabled={isPolicyDisabled}
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
                  disabled={isPolicyDisabled}
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
