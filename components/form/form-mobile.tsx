import React, { RefObject, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
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

interface MobileWizardProps {
  data: ReceiptData;
  ref: RefObject<HTMLDivElement | null>;
  onChange: (data: ReceiptData) => void;
  onGenerate: () => void;
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
  onGenerate,
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
              <Label className="text-sm text-white/70">Store Name</Label>
              <Input
                type="text"
                value={data.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                className="w-full rounded-xl bg-white/5 border-white/10 p-4 text-lg text-white placeholder:text-white/35 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-white/70">Store Phone</Label>
              <Input
                type="text"
                value={data.storePhone}
                onChange={(e) => handleChange("storePhone", e.target.value)}
                className="w-full rounded-xl bg-white/5 border-white/10 p-4 text-lg text-white placeholder:text-white/35 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-white/70">
                Customer Name <span className="text-white/30">(Optional)</span>
              </Label>
              <Input
                type="text"
                value={data.customerName || ""}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl bg-white/5 border-white/10 p-4 text-lg text-white placeholder:text-white/35 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-white/70">Currency</Label>
              <Select
                value={data.currency}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger className="w-full rounded-xl bg-white/5 border-white/10 p-4 text-lg text-white h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400">
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
              <Label className="text-sm text-white/70">Payment Method</Label>
              <Select
                value={data.paymentMethod}
                onValueChange={(value) => handleChange("paymentMethod", value)}
              >
                <SelectTrigger className="w-full rounded-xl bg-white/5 border-white/10 p-4 text-lg text-white h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400">
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
                  <Input
                    type="text"
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(item.id, "name", e.target.value)
                    }
                    className="w-full border-b border-white/10 bg-transparent pb-2 text-lg font-medium text-white placeholder:text-white/30 focus-visible:border-blue-400 border-0 rounded-none px-0 focus-visible:ring-0"
                  />
                  <Input
                    type="text"
                    placeholder="Details (e.g. 200g, Medium Roast)"
                    value={item.detail}
                    onChange={(e) =>
                      handleItemChange(item.id, "detail", e.target.value)
                    }
                    className="w-full border-b border-white/10 bg-transparent pb-2 text-sm text-white/60 placeholder:text-white/25 focus-visible:border-blue-400 border-0 rounded-none px-0 focus-visible:ring-0"
                  />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-white/50 uppercase">
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
                        className="mt-1 w-full rounded-lg bg-white/5 border-white/10 p-2 text-center text-white focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
                      />
                    </div>
                    <div className="flex-2">
                      <Label className="text-xs text-white/50 uppercase">
                        Price
                      </Label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="mt-1 w-full rounded-lg bg-white/5 border-white/10 p-2 text-white focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
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
              <Label className="text-sm text-white/70">Return Window</Label>
              <Select
                value={data.returnWindow}
                onValueChange={(value) => handleChange("returnWindow", value)}
              >
                <SelectTrigger className="w-full rounded-xl bg-white/5 border-white/10 p-4 text-white h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400">
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
                type="text"
                placeholder="e.g. 45 days"
                value={data.customReturnWindow}
                onChange={(e) =>
                  handleChange("customReturnWindow", e.target.value)
                }
                className="w-full rounded-xl bg-white/5 border-white/10 p-4 text-white focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
              />
            )}

            <div className="space-y-2">
              <Label className="text-sm text-white/70">Return Condition</Label>
              <Select
                value={data.returnCondition}
                onValueChange={(value) =>
                  handleChange("returnCondition", value)
                }
              >
                <SelectTrigger className="w-full rounded-xl bg-white/5 border-white/10 p-4 text-white h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400">
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
              <Label className="text-sm text-white/70">Refund Type</Label>
              <Select
                value={data.refundType}
                onValueChange={(value) => handleChange("refundType", value)}
              >
                <SelectTrigger className="w-full rounded-xl bg-white/5 border-white/10 p-4 text-white h-auto focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400">
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
              <Label className="text-sm text-white/70">
                Marketing / Additional Note
              </Label>
              <Textarea
                value={data.marketingText}
                onChange={(e) => handleChange("marketingText", e.target.value)}
                className="h-24 w-full resize-none rounded-xl bg-white/5 border-white/10 p-4 text-white focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
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
            onClick={onGenerate}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-4 text-lg font-bold text-[#071427] shadow-lg ring-1 ring-black/5"
          >
            <Sparkles size={20} /> Generate Receipt
          </button>
        )}
      </div>
    </div>
  );
};
