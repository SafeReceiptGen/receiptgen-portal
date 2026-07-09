import React, { RefObject, useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  ReceiptCent,
  Loader2,
  Save,
  Store as StoreIcon,
  ChevronDown,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { ReceiptData, LineItem } from "@/types";
import { ReceiptPreview } from "./receipt-preview";
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
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActionState } from "./actions";
import Link from "next/link";
import { Store } from "@/lib/api";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payment-methods";
import { returnWindowEnum } from "@/types/enums";
import { trackCtaClick } from "@/lib/analytics";

interface MobileWizardProps {
  data: ReceiptData;
  ref: RefObject<HTMLDivElement | null>;
  onChange: (data: ReceiptData) => void;
  formAction: (payload: FormData) => void;
  pending: boolean;
  actionState: ActionState;
  isAuthenticated: boolean;
  onGuestSave: () => void;
  guestSaved: boolean;
  userStores: Store[];
  storesLoading: boolean;
}

const STEPS = [
  { id: "general", title: "General Info" },
  { id: "items", title: "Add Items" },
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
  formAction,
  pending,
  actionState,
  isAuthenticated,
  onGuestSave,
  guestSaved,
  userStores,
  storesLoading,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isExiting, isOpening } = useExpandableScreen();

  const selectedStore = userStores.find((s) => s.id === data.storeId);
  const savedProducts = selectedStore?.storeCatalog || [];
  const productsLoading = storesLoading;

  const dataRef = useRef(data);
  dataRef.current = data;
  const isPolicyDisabled = !!data.storeId;

  useEffect(() => {
    if (!isAuthenticated || storesLoading || userStores.length !== 1) return;
    if (dataRef.current.storeId) return;
    const s = userStores[0];
    const policy = s.returnPolicy;

    const mapReturnWindow = (val: any) => ({"0": "No returns", none: "No returns", "1": "3 days", "3_days": "3 days", "2": "7 days", "7_days": "7 days", "3": "14 days", "14_days": "14 days", "4": "30 days", "30_days": "30 days", "5": "Custom", custom: "Custom"})[String(val)] || "30 days";
    const mapReturnCondition = (val: any) => ({"0": "Unused", unused: "Unused", "1": "Original Packaging", original_packaging: "Original Packaging", "2": "Any Condition", any_condition: "Any Condition", "3": "Defective Only", defective_only: "Defective Only"})[String(val)] || "Original Packaging";
    const mapRefundType = (val: any) => ({"0": "Full Refund", full_refund: "Full Refund", "1": "Partial Refund", partial_refund: "Partial Refund", "2": "Store Credit", store_credit: "Store Credit", "3": "Exchange Only", exchange_only: "Exchange Only"})[String(val)] || "Store Credit";

    // Keep storeName as the retailer brand (hydrated in form-screen).
    // Location name (s.name) must not overwrite the receipt header identity.
    onChange({
      ...dataRef.current,
      storeId: s.id,
      storeLocation: s.name,
      storePhone: s.phone ?? "",
      ...(policy && {
        returnWindow: mapReturnWindow(policy.returnWindow),
        customReturnWindow: policy.customWindowDays
          ? `${policy.customWindowDays} days`
          : "",
        returnCondition: mapReturnCondition(policy.returnCondition),
        refundType: mapRefundType(policy.refundType),
      }),
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

  const addItem = (
    name = "New Item",
    detail = "",
    price = 0,
    priceFixed = false,
  ) => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      detail,
      quantity: 1,
      price,
      priceFixed,
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
      <div className="shrink-0 border-b border-slate-200 bg-white/80 px-6 pt-6 pb-3 backdrop-blur dark:border-white/10 dark:bg-[#061124]/80">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            SafeReceipt
          </h1>
          <span className="text-xs font-mono text-slate-500 dark:text-white/50">
            Step {currentStep + 1}/{STEPS.length}
          </span>
        </div>
        <div className="flex gap-1 h-1">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`h-full rounded-full flex-1 transition-all duration-300 ${idx <= currentStep ? "bg-blue-500" : "bg-slate-200 dark:bg-white/10"}`}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight animate-in slide-in-from-left-2 duration-300 key={currentStep} dark:text-white">
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
            {/* Store picker — authenticated users */}
            {isAuthenticated && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-white/70">
                  <StoreIcon size={13} />
                  Your Store
                </Label>
                {storesLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/35">
                    <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                    Loading stores…
                  </div>
                ) : userStores.length > 0 ? (
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 pr-10 text-base text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:bg-white/5 dark:border-white/10 dark:text-white"
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
                            // Preserve brand in storeName; selector binds location + policy.
                            storeLocation: selected.name,
                            storePhone: selected.phone ?? "",
                            ...(policy && {
                              returnWindow: mapReturnWindow(policy.returnWindow),
                              customReturnWindow: policy.customWindowDays
                                ? `${policy.customWindowDays} days`
                                : "",
                              returnCondition: mapReturnCondition(policy.returnCondition),
                              refundType: mapRefundType(policy.refundType),
                            }),
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
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40"
                    />
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400 dark:border-white/10 dark:text-white/30">
                    No stores yet — fill in the fields below.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
              Store Name
              </Label>
              <Input
                type="text"
                value={data.storeName}
                onChange={(e) =>
                  onChange({
                    ...data,
                    storeName: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/35"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Store Phone
              </Label>
              <Input
                type="text"
                value={data.storePhone}
                onChange={(e) =>
                  onChange({
                    ...data,
                    storePhone: e.target.value,
                  })
                }
                className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/35"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                value={data.customerName || ""}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="e.g. Emma Doe"
                className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/35"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Customer Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                type="tel"
                value={data.customerPhone || ""}
                onChange={(e) =>
                  handleChange("customerPhone", e.target.value)
                }
                placeholder="e.g. +233 24 444 4444"
                className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/35"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-lg text-slate-900 justify-start text-left font-normal h-auto dark:bg-white/5 dark:border-white/10 dark:text-white",
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
            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Currency
              </Label>
              <Select
                value={data.currency}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-lg text-slate-900 h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
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
            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Payment Method
              </Label>
              <Select
                value={data.paymentMethod}
                onValueChange={(value) => handleChange("paymentMethod", value)}
              >
                <SelectTrigger className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-lg text-slate-900 h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
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
        )}

        {currentStep === 1 && (
          <div
            className={`space-y-5 ${!isExiting && !isOpening ? "animate-in slide-in-from-right fade-in duration-300" : ""}`}
          >
            {/* ── Saved Products Strip ───────────────────────────────── */}
            {isAuthenticated && data.storeId && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
                    Saved Products
                  </span>
                </div>

                {productsLoading ? (
                  <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-16 w-28 shrink-0 animate-pulse rounded-xl bg-slate-100 dark:bg-white/8"
                      />
                    ))}
                  </div>
                ) : savedProducts.length > 0 ? (
                  <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {savedProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          addItem(
                            p.name,
                            p.description ?? "",
                            p.defaultPrice ? parseFloat(p.defaultPrice) : 0,
                            !!p.defaultPrice,
                          )
                        }
                        className="group/card flex shrink-0 flex-col items-start gap-0.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-sm transition-all active:scale-95 hover:border-blue-400 hover:shadow-blue-100/60 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/50 dark:hover:bg-blue-500/8"
                      >
                        <div className="flex items-center gap-1.5">
                          <Plus
                            size={12}
                            className="shrink-0 text-slate-400 transition-colors group-hover/card:text-blue-500 dark:text-white/30 dark:group-hover/card:text-blue-400"
                          />
                          <span className="max-w-32 truncate text-sm font-semibold text-slate-800 dark:text-white">
                            {p.name}
                          </span>
                        </div>
                        {p.description && (
                          <p className="ml-5.5 max-w-32 truncate text-[11px] text-slate-400 dark:text-white/35">
                            {p.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="border-b border-slate-100 dark:border-white/8" />
              </div>
            )}

            {/* ── Added Items ────────────────────────────────────────── */}
            {data.items.map((item) => (
              <div
                key={item.id}
                className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/4"
              >
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-white/45 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <Trash2 size={15} />
                </button>
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(item.id, "name", e.target.value)
                    }
                    className="w-full border-b border-slate-200 bg-transparent pb-2 text-lg font-medium text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-400 border-0 rounded-none px-0 focus-visible:ring-0 dark:border-white/10 dark:text-white dark:placeholder:text-white/30"
                  />
                  <Input
                    type="text"
                    placeholder="Details (e.g. 200g, Medium Roast)"
                    value={item.detail}
                    onChange={(e) =>
                      handleItemChange(item.id, "detail", e.target.value)
                    }
                    className="w-full border-b border-slate-200 bg-transparent pb-2 text-sm text-slate-600 placeholder:text-slate-400 focus-visible:border-blue-400 border-0 rounded-none px-0 focus-visible:ring-0 dark:border-white/10 dark:text-white/60 dark:placeholder:text-white/25"
                  />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-400 uppercase dark:text-white/50">
                        Qty
                      </Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="mt-1 w-full rounded-lg bg-slate-50 border-slate-200 p-2 text-center text-slate-900 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div className="flex-2">
                      <Label className="text-xs text-slate-400 uppercase dark:text-white/50">
                        Price
                      </Label>
                      <Input
                        type="number"
                        value={item.price}
                        disabled={item.priceFixed}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="mt-1 w-full rounded-lg bg-slate-50 border-slate-200 p-2 text-slate-900 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:border-white/10 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => addItem()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-4 text-slate-600 transition-colors hover:bg-slate-50 active:scale-95 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/4"
            >
              <Plus size={20} /> Add Another Item
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div
            className={`space-y-6 ${!isExiting && !isOpening ? "animate-in slide-in-from-right fade-in duration-300" : ""}`}
          >
            {isPolicyDisabled && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 flex gap-3 items-start dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                <StoreIcon size={16} className="shrink-0 mt-0.5" />
                <p className="leading-snug text-xs">
                  Store return policy applied automatically.{" "}
                  <Link href={`/dashboard/stores/${data.storeId}`} className="font-semibold underline hover:text-blue-800 dark:hover:text-blue-300">
                    Modify defaults in your Store settings
                  </Link>.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Return Window
              </Label>
              <Select
                disabled={isPolicyDisabled}
                value={data.returnWindow}
                onValueChange={(value) => handleChange("returnWindow", value)}
              >
                <SelectTrigger className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-slate-900 h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
                  <SelectValue placeholder="Select return window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No returns">No returns</SelectItem>
                  <SelectItem value="3 days">3 days</SelectItem>
                  <SelectItem value="7 days">7 days</SelectItem>
                  <SelectItem value="14 days">14 days</SelectItem>
                  <SelectItem value="30 days">30 days</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {data.returnWindow === "Custom" && (
              <Input
                disabled={isPolicyDisabled}
                type="text"
                placeholder="e.g. 45 days"
                value={data.customReturnWindow}
                onChange={(e) =>
                  handleChange("customReturnWindow", e.target.value)
                }
                className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-slate-900 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white"
              />
            )}

            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Return Condition
              </Label>
              <Select
                disabled={isPolicyDisabled}
                value={data.returnCondition}
                onValueChange={(value) =>
                  handleChange("returnCondition", value)
                }
              >
                <SelectTrigger className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-slate-900 h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
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

            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Refund Type
              </Label>
              <Select
                disabled={isPolicyDisabled}
                value={data.refundType}
                onValueChange={(value) => handleChange("refundType", value)}
              >
                <SelectTrigger className="w-full rounded-xl bg-slate-50 border-slate-200 p-4 text-slate-900 h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
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

            <div className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-white/70">
                Marketing / Additional Note
              </Label>
              <Textarea
                value={data.marketingText}
                onChange={(e) => handleChange("marketingText", e.target.value)}
                className="h-24 w-full resize-none rounded-xl bg-slate-50 border-slate-200 p-4 text-slate-900 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="h-full -mx-6 -mt-6">
            <ReceiptPreview
              data={data}
              ref={ref}
              showQr={isAuthenticated && !!data.qrCodeToken?.trim()}
            />
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="shrink-0 border-t border-slate-200 bg-white/90 p-4 backdrop-blur dark:border-white/10 dark:bg-[#061124]/90">
        {/* Error message */}
        {actionState.message && !actionState.success && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {actionState.message}
          </div>
        )}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="rounded-xl border border-slate-200 bg-slate-100 px-6 py-4 font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
            >
              <ChevronLeft />
            </button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-blue-500 to-blue-700 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/10 dark:shadow-blue-900/20"
            >
              Next Step <ChevronRight size={20} />
            </button>
          ) : isAuthenticated ? (
            <form
              action={formAction}
              className="flex-1"
              onSubmit={() => trackCtaClick("generate_receipt")}
            >
              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-lg font-bold text-white shadow-lg ring-1 ring-black/5 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white dark:text-[#071427]"
              >
                {pending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <ReceiptCent size={20} /> Generate Receipt
                  </>
                )}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                trackCtaClick("save_download");
                onGuestSave();
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-4 text-lg font-bold text-slate-700 ring-1 ring-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
            >
              {guestSaved ? (
                <>
                  <Save size={20} className="text-green-500" /> Saved!
                </>
              ) : (
                <>
                  <Save size={20} /> Save & Download
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
