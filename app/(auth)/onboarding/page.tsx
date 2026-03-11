"use client";
import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Store,
  Hash,
  Phone,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/landing/v2/MagneticButton";
import { Input } from "@/components/ui/input-2";
import { retailerApi, ApiRequestError } from "@/lib/api";

const STEPS = [
  {
    icon: Building2,
    label: "Business Name",
    hint: "Your trading name or brand",
    id: "businessName",
    type: "text",
    inputMode: undefined as React.HTMLAttributes<HTMLInputElement>["inputMode"],
  },
  {
    icon: Hash,
    label: "Number of Stores",
    hint: "Physical or virtual locations",
    id: "storeCount",
    type: "number",
    inputMode: "numeric" as React.HTMLAttributes<HTMLInputElement>["inputMode"],
  },
  {
    icon: Phone,
    label: "Phone Number",
    hint: "Business contact number",
    id: "phone",
    type: "tel",
    inputMode: "tel" as React.HTMLAttributes<HTMLInputElement>["inputMode"],
  },
] as const;

export default function Onboarding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useRouter();

  const { contextSafe } = useGSAP(
    () => {
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
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out" },
          "-=0.5",
        );

      // Animate the progress bar fill on mount
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: "power3.out", delay: 0.3 },
      );
    },
    { scope: containerRef },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const businessName = (document.getElementById("businessName") as HTMLInputElement)?.value.trim();
    const storeCountRaw = (document.getElementById("storeCount") as HTMLInputElement)?.value;
    const phone = (document.getElementById("phone") as HTMLInputElement)?.value.trim();
    const termsChecked = (document.getElementById("terms") as HTMLInputElement)?.checked;

    if (!businessName || !phone) {
      setIsLoading(false);
      setError("Please fill in all required fields.");
      shakeForm();
      return;
    }

    if (!termsChecked) {
      setIsLoading(false);
      setError("You must agree to the Terms of Service to continue.");
      shakeForm();
      return;
    }

    const storeCount = parseInt(storeCountRaw || "1", 10);

    try {
      await retailerApi.onboard({ businessName, storeCount, phone });

      // Animate success before redirect
      gsap.to(formRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => navigate.push("/dashboard"),
      });
    } catch (err) {
      setIsLoading(false);
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      shakeForm();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen w-full overflow-hidden bg-background"
    >
      {/* ── Left Panel ── */}
      <div
        ref={leftPanelRef}
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex"
      >
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glowing orb */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-white/10 blur-[80px]" />

        {/* Logo */}
        <div className="stagger-item relative z-10 text-3xl font-bold tracking-tighter font-display">
          Safe<span className="text-white/40">Receipts</span>
        </div>

        {/* Main copy */}
        <div className="stagger-item relative z-10 max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles size={14} />
            One more step
          </div>
          <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tighter font-display">
            Let&apos;s set up your business.
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            We need a few details to personalise your dashboard and configure your first store.
          </p>
        </div>

        {/* Feature list */}
        <div className="stagger-item relative z-10 space-y-4">
          {[
            { icon: Store, text: "Your stores appear in the receipt builder" },
            { icon: CheckCircle2, text: "Return policies are linked to each store" },
            { icon: Building2, text: "Business name appears on every receipt" },
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

      {/* ── Right Panel ── */}
      <div
        ref={rightPanelRef}
        className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-24"
      >
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="stagger-item mb-10 text-2xl font-bold tracking-tighter font-display text-foreground lg:hidden">
            Safe<span className="text-primary">Receipts</span>
          </div>

          {/* Progress indicator */}
          <div className="stagger-item mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-foreground/40">
              <span>Step 2 of 2</span>
              <span>Almost there</span>
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
            <h1 className="mb-2 text-4xl font-bold tracking-tighter font-display text-foreground">
              Business Details
            </h1>
            <p className="text-foreground/60">
              Tell us about your retail business.
            </p>
          </div>

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
          >
            {/* Field cards */}
            {STEPS.map(({ icon: Icon, label, hint, id, type, inputMode }) => (
              <div
                key={id}
                className="stagger-item group relative rounded-2xl border border-foreground/10 bg-foreground/2 px-5 pb-4 pt-3 transition-colors hover:border-foreground/20 focus-within:border-primary/50 focus-within:bg-primary/2"
              >
                <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-foreground/35 transition-colors group-focus-within:text-primary/70">
                  <Icon size={11} />
                  {label}
                </div>
                <Input
                  id={id}
                  type={type}
                  label=""
                  inputMode={inputMode}
                  required={id !== "storeCount"}
                  defaultValue={id === "storeCount" ? 1 : undefined}
                  disabled={isLoading}
                  className="mt-0"
                />
                <p className="mt-1 text-[11px] text-foreground/35">{hint}</p>
              </div>
            ))}

            {/* Terms */}
            <div className="stagger-item mt-2 flex items-start gap-3 rounded-2xl border border-foreground/10 bg-foreground/2 px-5 py-4">
              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-foreground/30 text-primary accent-primary focus:ring-primary cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-sm text-foreground/60 cursor-pointer leading-relaxed"
              >
                I agree to the{" "}
                <a href="#" className="font-medium text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-medium text-primary hover:underline">
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
            <div className="stagger-item mt-6">
              <MagneticButton
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 py-4 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Setting up your account…
                  </>
                ) : (
                  <>
                    Create Account
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
            <a href="/signup" className="text-primary hover:underline font-medium">
              Go back
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
