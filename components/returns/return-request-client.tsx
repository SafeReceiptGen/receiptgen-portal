"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MOCK_PUDO_POINTS } from "@/lib/mock-data";
import {
  submitReturnRequest,
  fetchReturnEligibility,
} from "@/components/returns/actions";
import {
  ReturnReason,
  LogisticsMethod,
  LOGISTICS_METHOD_LABELS,
  TIME_SLOTS,
  ReceiptForReturn,
  type ReturnItem,
} from "@/types/returns";
import { ItemSelector } from "@/components/returns/item-selector";
import { ReasonSelect } from "@/components/returns/reason-select";
import { PhotoUpload } from "@/components/returns/photo-upload";
import { ReceiptSheet } from "@/components/returns/receipt-sheet";
import { LocationPicker } from "@/components/returns/location-picker";
import { formatPickupAddressDisplay } from "@/lib/format-pickup-address";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  ReturnFlowSchema,
  ReturnFlowFormData,
  defaultReturnFlowValues,
} from "@/lib/validations/return-schema";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  Phone,
  Package,
  ShieldCheck,
  FileText,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STEPS = [
  "Select Items",
  "Return Reason",
  "Item Condition",
  "Eligibility",
  "Logistics",
  "Review & Submit",
];

function effectiveReturnQuantity(item: ReturnItem): number {
  if (item.quantity === 1) return 1;
  return item.returnQuantity ?? 1;
}

function initItemsFromReceipt(receipt: ReceiptForReturn): ReturnItem[] {
  return receipt.items.map((item) => ({
    ...item,
    selected: false,
    returnQuantity: item.quantity === 1 ? 1 : undefined,
  }));
}

function normalizeDraftItems(
  draftItems: ReturnItem[],
  receipt: ReceiptForReturn,
): ReturnItem[] {
  return draftItems.map((draft) => {
    const line = receipt.items.find((i) => i.id === draft.id);
    if (!line) return draft;
    const purchased = line.quantity;
    let returnQuantity = draft.returnQuantity;
    if (purchased === 1) {
      returnQuantity = 1;
    } else if (draft.selected) {
      if (
        returnQuantity == null ||
        returnQuantity < 1 ||
        returnQuantity > purchased
      ) {
        returnQuantity = 1;
      }
    } else {
      returnQuantity = undefined;
    }
    return {
      ...draft,
      quantity: purchased,
      price: line.price,
      name: line.name,
      detail: line.detail,
      returnQuantity,
    };
  });
}

export default function ReturnRequestClient({
  receipt,
  receiptId,
}: {
  receipt: ReceiptForReturn | undefined;
  receiptId: string;
}) {
  const STORAGE_KEY = `return_flow_${receiptId}`;

  const [currentStep, setCurrentStep] = useState(0);
  const [receiptSheetOpen, setReceiptSheetOpen] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [newReturnId, setNewReturnId] = useState("");
  const [returnNumber, setReturnNumber] = useState("");
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const [submittedLogisticsMethod, setSubmittedLogisticsMethod] =
    useState<LogisticsMethod | null>(null);

  const form = useForm<ReturnFlowFormData>({
    resolver: zodResolver(ReturnFlowSchema),
    defaultValues: defaultReturnFlowValues as ReturnFlowFormData,
    mode: "onChange",
  });

  const { watch, setValue, getValues, trigger, formState: { isValid } } = form;

  // Initialize and restore state
  useEffect(() => {
    if (!receipt) return;

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as Partial<ReturnFlowFormData>;
        const baseL = defaultReturnFlowValues.logistics!;
        const rawPa = parsedData.logistics?.pickupAddress as
          | Record<string, unknown>
          | undefined;
        const migratedPickup = {
          ...baseL.pickupAddress,
          ...parsedData.logistics?.pickupAddress,
          address:
            (typeof rawPa?.address === "string" && rawPa.address) ||
            (typeof rawPa?.line1 === "string" && rawPa.line1) ||
            "",
          landmark:
            (typeof rawPa?.landmark === "string" && rawPa.landmark) ||
            (typeof rawPa?.line2 === "string" && rawPa.line2) ||
            "",
          latitude:
            typeof rawPa?.latitude === "number" ? rawPa.latitude : undefined,
          longitude:
            typeof rawPa?.longitude === "number" ? rawPa.longitude : undefined,
        };
        const rawParcel = parsedData.logistics?.parcel as
          | Record<string, unknown>
          | undefined;
        const migratedParcel = {
          ...baseL.parcel,
          ...parsedData.logistics?.parcel,
          description:
            typeof rawParcel?.description === "string"
              ? rawParcel.description
              : "",
        };
        const logisticsMerged = {
          ...baseL,
          ...parsedData.logistics,
          pickupAddress: migratedPickup,
          parcel: migratedParcel,
        };
        for (const key of Object.keys(parsedData) as (keyof ReturnFlowFormData)[]) {
          if (key === "logistics" || key === "items") continue;
          if (parsedData[key] !== undefined) {
            setValue(key, parsedData[key] as never, { shouldValidate: false });
          }
        }
        setValue("logistics", logisticsMerged, { shouldValidate: false });
        if (parsedData.items && parsedData.items.length > 0) {
          setValue(
            "items",
            normalizeDraftItems(parsedData.items as ReturnItem[], receipt),
            { shouldValidate: false },
          );
        } else {
          setValue("items", initItemsFromReceipt(receipt), { shouldValidate: false });
        }
        setIsRestored(true);
        return;
      } catch (error) {
        console.error("Failed to parse saved return draft", error);
      }
    }

    // Default initialization if no save exists
    setValue("items", initItemsFromReceipt(receipt));
    setIsRestored(true);
  }, [receiptId, receipt, setValue, STORAGE_KEY]);

  // Persist form continuously as user types
  useEffect(() => {
    if (!isRestored) return;
    const subscription = watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, isRestored, STORAGE_KEY]);


  if (!receipt) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Package size={28} className="text-slate-400 dark:text-white/40" />
        <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 font-display dark:text-white">
          Receipt Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-white/50">
          We couldn't find this receipt.
        </p>
        <Link
          href="/"
          className="mt-4 text-sm font-medium text-primary hover:underline dark:text-blue-400"
        >
          Go home
        </Link>
      </div>
    );
  }

  // Derived state from form
  const items = watch("items") || [];
  const selectedItems = items.filter((i) => i.selected);
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + i.price * effectiveReturnQuantity(i),
    0,
  );
  const logistics = watch("logistics") || defaultReturnFlowValues.logistics!;
  const fee = logistics.method === "HOME_PICKUP" ? 50 : 30;
  const isEligible = watch("isEligible");

  const checkEligibilityFromApi = async () => {
    setIsCheckingEligibility(true);
    setEligibilityError(null);
    try {
      const result = await fetchReturnEligibility(receiptId);
      setValue("isEligible", result.eligible, { shouldValidate: true });
      if (!result.eligible) {
        setEligibilityError(result.reasons.join(" "));
      }
    } catch (e) {
      setEligibilityError(
        e instanceof Error ? e.message : "Could not verify eligibility.",
      );
      setValue("isEligible", false, { shouldValidate: true });
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const attemptNextStep = async () => {
    let fieldsToValidate: (keyof ReturnFlowFormData)[] = [];
    switch (currentStep) {
      case 0:
        fieldsToValidate = ["items"];
        break;
      case 1:
        fieldsToValidate = ["reason", "description"];
        break;
      case 2:
        fieldsToValidate = ["photos"];
        break;
      case 3:
        if (isEligible === null) {
          await checkEligibilityFromApi();
          return;
        }
        fieldsToValidate = ["isEligible"];
        break;
      case 4:
        fieldsToValidate = ["logistics"];
        break;
    }

    const isValidStep = await trigger(fieldsToValidate);
    if (isValidStep && currentStep < STEPS.length - 1) {
      setCurrentStep((c) => c + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 3) {
      setValue("isEligible", null);
      setEligibilityError(null);
    }
    if (currentStep > 0) setCurrentStep((c) => c - 1);
  };

  const goToStepFromReview = (step: 0 | 1 | 2 | 4) => {
    if (step <= 2) {
      setValue("isEligible", null);
      setEligibilityError(null);
    }
    setCurrentStep(step);
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = getValues();
      setSubmittedLogisticsMethod(data.logistics.method);
      const { id, returnNumber: rn } = await submitReturnRequest(
        data,
        receiptId,
      );
      setNewReturnId(id);
      setReturnNumber(rn);
      setIsSubmitted(true);
      // Clear draft on success
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to submit return request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isSubmitted) {
    const homePickup = submittedLogisticsMethod === "HOME_PICKUP";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="animate-in zoom-in-50 fade-in duration-500">
          <CheckCircle2 size={64} className="mx-auto text-green-500 dark:text-green-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 font-display dark:text-white animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200">
          {homePickup ? "Pickup Scheduled" : "Return Submitted"}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-white/50 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300">
          {homePickup ? (
            <>
              Your home pickup <span className="font-semibold text-slate-700 dark:text-white/80">{returnNumber}</span> is scheduled. We&apos;ll use your chosen time window and contact you if anything changes.
            </>
          ) : (
            <>
              Your return request <span className="font-semibold text-slate-700 dark:text-white/80">{returnNumber}</span> has been submitted successfully.
            </>
          )}
        </p>
        <div className="mt-8 flex flex-col gap-3 w-full max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500">
          <Link
            href={`/return/${newReturnId}?token=${encodeURIComponent(receiptId)}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-black/5 transition-all hover:bg-primary-dark"
          >
            Track My Return
          </Link>
          <Link href={`/receipt/${receiptId}`} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors dark:text-white/50 dark:hover:text-white">
            Back to Receipt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8 sm:px-6 md:py-12 bg-white dark:bg-[#111827]">
      <div className="w-full max-w-lg mb-8">
        <div className="relative flex items-center justify-between mb-8">
          <button
            onClick={() => currentStep > 0 && prevStep()}
            className={cn("flex items-center gap-1 text-sm font-medium transition-colors", currentStep > 0 ? "text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white cursor-pointer" : "text-transparent pointer-events-none")}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-white/60">
              {receipt.storeName}
            </span>
          </div>
          <button
            onClick={() => setReceiptSheetOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <FileText size={14} /> <span className="hidden sm:inline">View Receipt</span>
          </button>
        </div>

        <div className="flex gap-1 h-1 mb-6">
          {STEPS.map((_, idx) => (
            <div key={idx} className={cn("h-full rounded-full flex-1 transition-all duration-300", idx <= currentStep ? "bg-primary dark:bg-blue-400" : "bg-slate-100 dark:bg-white/10")} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            {STEPS[currentStep]}
          </h2>
          <span className="text-xs font-medium text-slate-400 dark:text-white/40">
            Step {currentStep + 1}/{STEPS.length}
          </span>
        </div>
      </div>

      <div className="w-full max-w-lg flex-1">
        <form className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/50 dark:bg-[#111827] dark:ring-white/10">
          {/* Step 1: Select Items */}
          {currentStep === 0 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <p className="mb-4 text-sm text-slate-600 dark:text-white/60">
                Select items from your purchase of <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(receipt.total, receipt.currency)}</span>.
              </p>
              <Controller
                control={form.control}
                name="items"
                render={({ field }) => (
                  <ItemSelector items={field.value} currency={receipt.currency} onChange={field.onChange} />
                )}
              />
              {form.formState.errors.items && (
                <p className="text-red-500 text-xs mt-2">{form.formState.errors.items.message}</p>
              )}
            </div>
          )}

          {/* Step 2: Return Reason */}
          {currentStep === 1 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <p className="mb-4 text-sm text-slate-600 dark:text-white/60">
                Tell us why you're returning {selectedItems.length === 1 ? selectedItems[0].name : `${selectedItems.length} items`}.
              </p>
              <ReasonSelect
                reason={watch("reason") || ""}
                description={watch("description") || ""}
                onReasonChange={(val) => setValue("reason", val as ReturnReason, { shouldValidate: true })}
                onDescriptionChange={(val) => setValue("description", val, { shouldValidate: true })}
              />
              {form.formState.errors.reason && (
                <p className="text-red-500 text-xs mt-2">{form.formState.errors.reason.message}</p>
              )}
            </div>
          )}

          {/* Step 3: Photo Upload */}
          {currentStep === 2 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <p className="mb-4 text-sm text-slate-600 dark:text-white/60">
                Upload photos of the item condition. This helps us process your return faster.
              </p>
              <Controller
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <PhotoUpload photos={field.value || []} onPhotosChange={field.onChange} />
                )}
              />
            </div>
          )}

          {/* Step 4: Eligibility */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center py-8 animate-in zoom-in-95 fade-in duration-300">
              {isCheckingEligibility ? (
                <>
                  <Loader2 size={48} className="animate-spin text-primary dark:text-blue-400" />
                  <p className="mt-4 text-sm font-medium text-slate-600 dark:text-white/60">Checking eligibility…</p>
                </>
              ) : isEligible === true ? (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 ring-4 ring-green-100 dark:bg-green-500/10 dark:ring-green-500/20">
                    <CheckCircle2 size={40} className="text-green-500 dark:text-green-400" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 font-display dark:text-white">Eligible</h3>
                </>
              ) : isEligible === false ? (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100 dark:bg-red-500/10 dark:ring-red-500/20">
                    <XCircle size={40} className="text-red-500 dark:text-red-400" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 font-display dark:text-white">Not Eligible</h3>
                  {eligibilityError && (
                    <p className="mt-3 max-w-xs text-center text-sm text-red-600 dark:text-red-400">
                      {eligibilityError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 ring-4 ring-primary/10 dark:bg-blue-400/5 dark:ring-blue-400/10">
                    <ShieldCheck size={40} className="text-primary dark:text-blue-400" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 font-display dark:text-white">Ready to Check</h3>
                  <p className="mt-2 max-w-xs text-center text-sm text-slate-500 dark:text-white/50">
                    We'll verify your return request against the store's policy.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Step 5: Logistics */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div>
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60">Return Method</Label>
                <div className="mt-2 flex gap-2">
                  {(["HOME_PICKUP", "DROP_OFF"] as LogisticsMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        setValue("logistics.method", method, { shouldValidate: true });
                        if (method === "HOME_PICKUP") setValue("logistics.pudoPointId", "");
                      }}
                      className={cn("flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all", logistics.method === method ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/4 dark:text-white/60")}
                    >
                      {LOGISTICS_METHOD_LABELS[method]}
                    </button>
                  ))}
                </div>
              </div>

              {logistics.method === "HOME_PICKUP" && (
                <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  <LocationPicker
                    address={logistics.pickupAddress?.address ?? ""}
                    landmark={logistics.pickupAddress?.landmark ?? ""}
                    latitude={logistics.pickupAddress?.latitude}
                    longitude={logistics.pickupAddress?.longitude}
                    onAddressChange={(v) =>
                      setValue("logistics.pickupAddress.address", v, {
                        shouldValidate: true,
                      })
                    }
                    onLandmarkChange={(v) =>
                      setValue("logistics.pickupAddress.landmark", v, {
                        shouldValidate: true,
                      })
                    }
                    onLocationChange={(lat, lng) => {
                      setValue("logistics.pickupAddress.latitude", lat, {
                        shouldValidate: true,
                      });
                      setValue("logistics.pickupAddress.longitude", lng, {
                        shouldValidate: true,
                      });
                    }}
                    onLocationClear={() => {
                      setValue("logistics.pickupAddress.latitude", undefined, {
                        shouldValidate: true,
                      });
                      setValue("logistics.pickupAddress.longitude", undefined, {
                        shouldValidate: true,
                      });
                    }}
                    addressError={
                      form.formState.errors.logistics?.pickupAddress?.address
                        ?.message
                    }
                  />
                  <div>
                    <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
                      <Package
                        size={12}
                        className="mr-1 inline text-primary dark:text-blue-400"
                      />
                      What are you returning?
                    </Label>
                    <Input
                      placeholder="Short description for the courier"
                      value={logistics.parcel?.description ?? ""}
                      onChange={(e) =>
                        setValue(
                          "logistics.parcel.description",
                          e.target.value,
                          { shouldValidate: true },
                        )
                      }
                      className="mt-2 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                    {form.formState.errors.logistics?.parcel?.description && (
                      <p className="mt-1 text-xs text-red-500">
                        {
                          form.formState.errors.logistics.parcel.description
                            .message
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}

              {logistics.method === "DROP_OFF" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <Label className="text-xs font-medium text-slate-600 dark:text-white/60"><MapPin size={12} className="inline mr-1 text-primary dark:text-blue-400" /> Nearest PUDO Point</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 pb-1">
                    {MOCK_PUDO_POINTS.map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setValue("logistics.pudoPointId", point.id, { shouldValidate: true })}
                        className={cn("flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all", logistics.pudoPointId === point.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-slate-200 hover:border-slate-300 dark:border-white/10")}
                      >
                         <div className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all", logistics.pudoPointId === point.id ? "border-primary bg-primary" : "border-slate-300 dark:border-white/20")}>
                          {logistics.pudoPointId === point.id && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{point.name}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50">{point.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {form.formState.errors.logistics?.pudoPointId && <p className="text-red-500 text-xs">{form.formState.errors.logistics.pudoPointId.message}</p>}
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-white/4">
                <span className="text-xs font-medium text-slate-600 dark:text-white/60">Service Fee</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(fee, receipt.currency)}</span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60">Time Slot</Label>
                <Select value={logistics.timeSlot} onValueChange={(v) => setValue("logistics.timeSlot", v, { shouldValidate: true })}>
                   <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
                    <SelectValue placeholder="Select time slot…" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (<SelectItem key={slot} value={slot}>{slot}</SelectItem>))}
                  </SelectContent>
                </Select>
                {form.formState.errors.logistics?.timeSlot && <p className="text-red-500 text-xs">{form.formState.errors.logistics.timeSlot.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-white/60"><Phone size={12} className="inline mr-1 text-primary dark:text-blue-400" /> Phone Number</Label>
                <div className="flex gap-2">
                  <Select value={logistics.phoneCountry} onValueChange={(v) => setValue("logistics.phoneCountry", v, { shouldValidate: true })}>
                    <SelectTrigger className="w-[125px] bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GH">🇬🇭 +233</SelectItem>
                      <SelectItem value="NG">🇳🇬 +234</SelectItem>
                      <SelectItem value="US">🇺🇸 +1</SelectItem>
                      <SelectItem value="UK">🇬🇧 +44</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    placeholder="244 444 444"
                    value={logistics.phoneNumber}
                    onChange={(e) => setValue("logistics.phoneNumber", e.target.value, { shouldValidate: true })}
                    className="flex-1 bg-slate-50 border-slate-200 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                  />
                </div>
                {form.formState.errors.logistics?.phoneNumber && <p className="text-red-500 text-xs">{form.formState.errors.logistics.phoneNumber.message}</p>}
              </div>
            </div>
          )}

          {/* Step 6: Review & submit */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
               <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">Review Your Return</h3>
              
              <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Items</p>
                  <button
                    type="button"
                    onClick={() => goToStepFromReview(0)}
                    className="text-xs font-medium text-primary transition-colors hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </button>
                </div>
                {selectedItems.map((item) => {
                  const rq = effectiveReturnQuantity(item);
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between gap-2 py-1.5 text-sm"
                    >
                      <span className="text-slate-700 dark:text-white/80">
                        {item.name}
                        {item.quantity > 1 ? (
                          <span className="text-slate-500 dark:text-white/45">
                            {" "}
                            × {rq}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 font-medium text-slate-900 dark:text-white">
                        {formatCurrency(item.price * rq, receipt.currency)}
                      </span>
                    </div>
                  );
                })}
                 <div className="mt-2 border-t border-slate-100 pt-2 dark:border-white/5">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-900 dark:text-white">Refund Amount</span>
                    <span className="text-primary dark:text-blue-400">{formatCurrency(selectedTotal, receipt.currency)}</span>
                  </div>
                </div>
              </div>

               <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Reason</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => goToStepFromReview(1)}
                      className="text-xs font-medium text-primary transition-colors hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStepFromReview(2)}
                      className="text-xs font-medium text-primary transition-colors hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit photos
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-white/80">
                  {watch("reason") ? watch("reason")!.replace(/_/g, " ") : "—"}
                </p>
                {watch("description") && <p className="mt-1 text-xs text-slate-500 dark:text-white/50">"{watch("description")}"</p>}
              </div>

              <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Return Method</p>
                  <button
                    type="button"
                    onClick={() => goToStepFromReview(4)}
                    className="text-xs font-medium text-primary transition-colors hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-white/80">
                  {LOGISTICS_METHOD_LABELS[logistics.method]}
                  {logistics.method === "DROP_OFF" && logistics.pudoPointId && ` — ${MOCK_PUDO_POINTS.find((p) => p.id === logistics.pudoPointId)?.name}`}
                </p>
                {logistics.method === "HOME_PICKUP" && logistics.pickupAddress && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-white/55">
                    {formatPickupAddressDisplay(logistics.pickupAddress)}
                  </p>
                )}
                {logistics.method === "HOME_PICKUP" && logistics.parcel && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-white/50">
                    {logistics.parcel.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500 dark:text-white/50">
                  {logistics.timeSlot} · {logistics.phoneCountry} {logistics.phoneNumber}
                </p>
              </div>

               <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/4">
                <div className="flex justify-between text-xs text-slate-600 mb-1 dark:text-white/60">
                  <span>Service fee</span><span>{formatCurrency(fee, receipt.currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2 dark:border-white/10 dark:text-white">
                  <span>Total to Pay</span><span>{formatCurrency(fee, receipt.currency)}</span>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="w-full max-w-lg mt-6 pb-4">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button type="button" onClick={prevStep} className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/8">
              <ChevronLeft size={20} />
            </button>
          )}

          {currentStep < STEPS.length - 1 ? (
             <button
              type="button"
              onClick={attemptNextStep}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold shadow-lg ring-1 transition-all active:scale-[0.99]",
                currentStep === 3 && isEligible === null
                  ? "bg-primary text-white ring-black/5 hover:bg-primary-dark shadow-blue-500/20 dark:ring-white/10"
                  : "bg-slate-900 text-white ring-black/5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white/90"
              )}
            >
              {currentStep === 3 && isEligible === null ? (
                <><ShieldCheck size={16} /> Check Eligibility</>
              ) : currentStep === 3 && isCheckingEligibility ? (
                <><Loader2 size={16} className="animate-spin" /> Checking…</>
              ) : (
                <>Continue <ChevronRight size={16} /></>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting || !isValid}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg ring-1 ring-black/5 transition-all hover:bg-primary-dark active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed dark:ring-white/10"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : <>Submit</>}
            </button>
          )}
        </div>
      </div>

      <ReceiptSheet receipt={receipt} open={receiptSheetOpen} onOpenChange={setReceiptSheetOpen} />
    </div>
  );
}
