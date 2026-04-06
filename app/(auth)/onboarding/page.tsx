"use client";
import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Store,
  Phone,
  Building2,
  ArrowRight,
  Sparkles,
  Plus,
  Trash2,
  MapPin,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/landing/v2/MagneticButton";
import { Input } from "@/components/ui/input-2";
import { retailerApi, ApiRequestError } from "@/lib/api";

import {
  returnWindowEnum,
  returnConditionEnum,
  refundTypeEnum,
} from "@/types/enums";
import { authClient } from "@/lib/auth-client";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const RETURN_WINDOWS = [
  { label: "No returns", value: returnWindowEnum[returnWindowEnum.none] },
  { label: "3 days", value: returnWindowEnum[returnWindowEnum["3_days"]] },
  { label: "7 days", value: returnWindowEnum[returnWindowEnum["7_days"]] },
  { label: "14 days", value: returnWindowEnum[returnWindowEnum["14_days"]] },
  { label: "30 days", value: returnWindowEnum[returnWindowEnum["30_days"]] },
  // { label: "Custom", value: returnWindowEnum[returnWindowEnum.custom] },
] as const;

const RETURN_CONDITIONS = [
  { label: "Unused", value: returnConditionEnum[returnConditionEnum.unused] },
  {
    label: "Original Packaging",
    value: returnConditionEnum[returnConditionEnum.original_packaging],
  },
  {
    label: "Any Condition",
    value: returnConditionEnum[returnConditionEnum.any_condition],
  },
  {
    label: "Defective Only",
    value: returnConditionEnum[returnConditionEnum.defective_only],
  },
] as const;

const REFUND_TYPES = [
  { label: "Full Refund", value: refundTypeEnum[refundTypeEnum.full_refund] },
  {
    label: "Partial Refund",
    value: refundTypeEnum[refundTypeEnum.partial_refund],
  },
  { label: "Store Credit", value: refundTypeEnum[refundTypeEnum.store_credit] },
  {
    label: "Exchange Only",
    value: refundTypeEnum[refundTypeEnum.exchange_only],
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StoreReturnPolicy {
  returnWindow: string;
  returnCondition: string;
  refundType: string;
}

interface StoreEntry {
  id: string;
  name: string;
  phone: string;
  address: string;
  policy: StoreReturnPolicy;
}

const DEFAULT_POLICY: StoreReturnPolicy = {
  returnWindow: returnWindowEnum[returnWindowEnum["7_days"]],
  returnCondition: returnConditionEnum[returnConditionEnum.unused],
  refundType: refundTypeEnum[refundTypeEnum.full_refund],
};

const makeStore = (): StoreEntry => ({
  id: Math.random().toString(36).slice(2),
  name: "",
  phone: "",
  address: "",
  policy: { ...DEFAULT_POLICY },
});

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function PolicyPill({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: readonly { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/35">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              value === opt.value
                ? "border-primary bg-primary text-white"
                : "border-foreground/15 bg-transparent text-foreground/55 hover:border-primary/40 hover:text-primary/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const storesListRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [terms, setTerms] = useState(false);
  const [stores, setStores] = useState<StoreEntry[]>([makeStore()]);

  const navigate = useRouter();
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && data?.user?.retailerId) {
      navigate.push("/dashboard");
    }
  }, [data, isPending, navigate]);

  // ── GSAP entrance ─────────────────────────────────────────────────────────

  const { contextSafe } = useGSAP(
    () => {
      // Don't run entrance animation until we're actually showing the content
      if (isPending) return;

      const tl = gsap.timeline();
      tl.fromTo(
        leftPanelRef.current,
        { x: "-100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1.2, ease: "power4.out" },
      )
        .fromTo(
          rightPanelRef.current,
          { x: "100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 1.2, ease: "power4.out" },
          "-=1.2",
        )
        .fromTo(
          ".stagger-item",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
          "-=0.5",
        );

      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: "power3.out", delay: 0.3 },
      );
    },
    { scope: containerRef, dependencies: [isPending] },
  );
  const shakeForm = contextSafe(() => {
    gsap.fromTo(
      formRef.current,
      { x: -8 },
      {
        x: 8,
        duration: 0.08,
        yoyo: true,
        repeat: 4,
        onComplete: () => void gsap.set(formRef.current, { x: 0 }),
      },
    );
  });

  // ── Store management ──────────────────────────────────────────────────────

  const addStore = contextSafe(() => {
    setStores((prev) => [...prev, makeStore()]);
    requestAnimationFrame(() => {
      const cards = storesListRef.current?.querySelectorAll(".store-card");
      if (!cards?.length) return;
      const lastCard = cards[cards.length - 1];
      gsap.fromTo(
        lastCard,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
      lastCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  const removeStore = contextSafe((id: string) => {
    if (stores.length === 1) return;
    const card = storesListRef.current?.querySelector(
      `[data-store-id="${id}"]`,
    );
    if (card) {
      gsap.to(card, {
        opacity: 0,
        y: -10,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => setStores((prev) => prev.filter((s) => s.id !== id)),
      });
    } else {
      setStores((prev) => prev.filter((s) => s.id !== id));
    }
  });

  const updateStore = (
    id: string,
    field: keyof Omit<StoreEntry, "policy" | "id">,
    value: string,
  ) =>
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );

  const updatePolicy = (
    id: string,
    field: keyof StoreReturnPolicy,
    value: string,
  ) =>
    setStores((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, policy: { ...s.policy, [field]: value } } : s,
      ),
    );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim()) {
      setError("Please enter your business or brand name.");
      shakeForm();
      return;
    }
    if (!terms) {
      setError("You must agree to the Terms of Service to continue.");
      shakeForm();
      return;
    }
    if (stores.some((s) => !s.name.trim())) {
      setError("Every location must have a name.");
      shakeForm();
      return;
    }

    setIsLoading(true);

    try {
      const res = await retailerApi.onboard({
        businessName,
        stores: stores.map((s) => ({
          name: s.name,
          phone: s.phone || undefined,
          address: s.address || undefined,
          returnWindow: s.policy.returnWindow,
          returnCondition: s.policy.returnCondition,
          refundType: s.policy.refundType,
        })),
      });

      gsap.to(formRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => navigate.push("/dashboard"),
      });
    } catch (err) {
      console.log("onboard err", err);
      setIsLoading(false);
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Something went wrong. Please try again.",
      );
      shakeForm();
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex h-16 w-16 items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border border-primary/20" />
            {/* Inner dashed/spinning ring */}
            <div className="absolute inset-2 animate-[spin_1s_ease-in-out_infinite] rounded-full border-2 border-primary border-t-transparent border-l-transparent" />
            {/* Center dot */}
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/40 font-mono">
              Authenticating
            </p>
            <p className="text-[10px] text-foreground/25 font-mono">
              Verifying credentials
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen w-full overflow-hidden bg-background"
    >
      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <div
        ref={leftPanelRef}
        className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex"
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-white/10 blur-[100px]" />
        <div className="pointer-events-none absolute -top-20 -left-20 h-[300px] w-[300px] rounded-full bg-white/5 blur-[80px]" />

        {/* Logo */}
        <div className="stagger-item relative z-10 text-3xl font-bold tracking-tighter font-display">
          Safe<span className="text-white/35">Receipts</span>
        </div>

        {/* Main copy */}
        <div className="stagger-item relative z-10 max-w-sm">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles size={14} />
            Step 2 of 2 — Almost done
          </div>
          <h2 className="mb-5 text-5xl font-bold leading-tight tracking-tighter font-display">
            Your stores,
            <br />
            your rules.
          </h2>
          <p className="text-white/70 leading-relaxed">
            Tell us where you operate and what your return policy looks like.
            Every store can have its own policy — customers will see it on every
            receipt.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="stagger-item relative z-10 space-y-3">
          {[
            { icon: Store, text: "Each location gets its own receipt history" },
            {
              icon: ShieldCheck,
              text: "Return policies print directly on the receipt",
            },
            {
              icon: Building2,
              text: "Your brand name appears on every receipt",
            },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Icon size={15} />
              </div>
              <p className="text-sm text-white/80">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────────────── */}
      <div
        ref={rightPanelRef}
        className="flex w-full flex-col overflow-y-auto px-8 py-10 lg:w-[58%] lg:px-14"
      >
        <div className="mx-auto w-full max-w-xl">
          {/* Mobile logo */}
          <div className="stagger-item mb-8 text-2xl font-bold tracking-tighter font-display text-foreground lg:hidden">
            Safe<span className="text-primary">Receipts</span>
          </div>

          {/* Progress bar */}
          <div className="stagger-item mb-8">
            <div className="mb-2 flex justify-between text-xs text-foreground/40">
              <span>Step 2 of 2</span>
              <span>Business &amp; Stores</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                ref={progressRef}
                className="h-full origin-left rounded-full bg-primary"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="stagger-item mb-8">
            <h1 className="mb-1.5 text-4xl font-bold tracking-tighter font-display text-foreground">
              Business &amp; Stores
            </h1>
            <p className="text-foreground/55">
              Add your brand name and the locations where you&apos;ll issue
              receipts. Set a return policy for each one.
            </p>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* ── Business name ──────────────────────────────────────────── */}
            <div className="stagger-item rounded-2xl border border-foreground/10 bg-foreground/2 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground/40">
                <Building2 size={11} />
                Your Brand
              </h3>
              <Input
                id="businessName"
                type="text"
                label="Trading / Brand Name"
                required
                disabled={isLoading}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <p className="mt-2 text-[11px] text-foreground/35">
                This appears on every receipt as your business identity.
              </p>
            </div>

            {/* ── Store list ─────────────────────────────────────────────── */}
            <div className="stagger-item">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground/40">
                  <Store size={11} />
                  Your Locations
                </h3>
                <button
                  type="button"
                  onClick={addStore}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                >
                  <Plus size={11} />
                  Add Location
                </button>
              </div>

              <div ref={storesListRef} className="flex flex-col gap-4">
                {stores.map((store, idx) => (
                  <div
                    key={store.id}
                    data-store-id={store.id}
                    className="store-card overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/2 transition-colors hover:border-foreground/15"
                  >
                    {/* ── Store header ── */}
                    <div className="flex items-center justify-between border-b border-foreground/8 px-5 py-3">
                      <span className="flex items-center gap-2 text-xs font-semibold text-foreground/40">
                        <Store size={11} />
                        Location {idx + 1}
                      </span>
                      {stores.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStore(store.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1 rounded-full p-1.5 text-foreground/30 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          aria-label="Remove location"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* ── Location details ── */}
                    <div className="p-5 pb-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Name — full width */}
                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/35 mb-1">
                            <Store size={10} />
                            Location Name{" "}
                            <span className="text-destructive ml-0.5">*</span>
                          </div>
                          <input
                            type="text"
                            required
                            disabled={isLoading}
                            value={store.name}
                            onChange={(e) =>
                              updateStore(store.id, "name", e.target.value)
                            }
                            placeholder="e.g. Accra Central Branch"
                            className="w-full border-b border-foreground/15 bg-transparent py-2 text-foreground outline-none placeholder-foreground/30 transition-colors hover:border-foreground/30 focus:border-primary"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/35 mb-1">
                            <Phone size={10} />
                            Phone{" "}
                            <span className="text-foreground/20 normal-case font-normal tracking-normal">
                              (optional)
                            </span>
                          </div>
                          <input
                            type="tel"
                            disabled={isLoading}
                            value={store.phone}
                            onChange={(e) =>
                              updateStore(store.id, "phone", e.target.value)
                            }
                            placeholder="+233 XXX XXX XXX"
                            className="w-full border-b border-foreground/15 bg-transparent py-2 text-foreground outline-none placeholder-foreground/25 transition-colors hover:border-foreground/30 focus:border-primary"
                          />
                        </div>

                        {/* Address */}
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/35 mb-1">
                            <MapPin size={10} />
                            Address{" "}
                            <span className="text-foreground/20 normal-case font-normal tracking-normal">
                              (optional)
                            </span>
                          </div>
                          <input
                            type="text"
                            disabled={isLoading}
                            value={store.address}
                            onChange={(e) =>
                              updateStore(store.id, "address", e.target.value)
                            }
                            placeholder="123 High St, Accra"
                            className="w-full border-b border-foreground/15 bg-transparent py-2 text-foreground outline-none placeholder-foreground/25 transition-colors hover:border-foreground/30 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Return Policy ── */}
                    <div className="border-t border-foreground/8 bg-foreground/1.5 px-5 py-4">
                      <div className="mb-3 flex items-center gap-2">
                        <RefreshCcw size={11} className="text-primary/60" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/40">
                          Return Policy
                        </span>
                        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Printed on receipts
                        </span>
                      </div>

                      <div className="space-y-4">
                        <PolicyPill
                          label="Return Window"
                          options={RETURN_WINDOWS}
                          value={store.policy.returnWindow}
                          onChange={(v) =>
                            updatePolicy(store.id, "returnWindow", v)
                          }
                          disabled={isLoading}
                        />
                        {store.policy.returnWindow !==
                          returnWindowEnum[returnWindowEnum.none] && (
                          <>
                            <PolicyPill
                              label="Accepted Condition"
                              options={RETURN_CONDITIONS}
                              value={store.policy.returnCondition}
                              onChange={(v) =>
                                updatePolicy(store.id, "returnCondition", v)
                              }
                              disabled={isLoading}
                            />
                            <PolicyPill
                              label="Refund Method"
                              options={REFUND_TYPES}
                              value={store.policy.refundType}
                              onChange={(v) =>
                                updatePolicy(store.id, "refundType", v)
                              }
                              disabled={isLoading}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Inline "add another" prompt */}
                {stores.length === 1 && (
                  <button
                    type="button"
                    onClick={addStore}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-foreground/12 py-3.5 text-sm text-foreground/35 transition-colors hover:border-primary/35 hover:text-primary/60 disabled:opacity-50"
                  >
                    <Plus size={15} />
                    Got another location? Add it here
                  </button>
                )}
              </div>
            </div>

            {/* ── Terms ──────────────────────────────────────────────────── */}
            <div className="stagger-item flex items-start gap-3 rounded-2xl border border-foreground/10 bg-foreground/2 px-5 py-4">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-foreground/30 accent-primary cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-sm text-foreground/60 cursor-pointer leading-relaxed"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-primary hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <div className="stagger-item">
              <MagneticButton
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 py-4 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating your account…
                  </>
                ) : (
                  <>
                    Launch my Dashboard
                    <ArrowRight
                      className="transition-transform group-hover:translate-x-1"
                      size={20}
                    />
                  </>
                )}
              </MagneticButton>
            </div>
          </form>

          <p className="stagger-item mt-6 text-center text-sm text-foreground/40">
            Wrong account?{" "}
            <a
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Go back
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
