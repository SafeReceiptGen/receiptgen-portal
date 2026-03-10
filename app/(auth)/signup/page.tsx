"use client";
import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input-2";
import { MagneticButton } from "@/components/landing/v2/MagneticButton";
import { useRouter } from "next/navigation";

export default function Signup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useRouter();

  const { contextSafe } = useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(
        rightPanelRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1.2, ease: "power4.out" },
      )
        .fromTo(
          leftPanelRef.current,
          { x: "-100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 1.2, ease: "power4.out" },
          "-=1.2",
        )
        .fromTo(
          ".stagger-item",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
          "-=0.6",
        );
    },
    { scope: containerRef },
  );

  const handleContinue = contextSafe(() => {
    const firstName = (document.getElementById("firstName") as HTMLInputElement)
      ?.value;
    const lastName = (document.getElementById("lastName") as HTMLInputElement)
      ?.value;
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    const password = (document.getElementById("password") as HTMLInputElement)
      ?.value;

    if (!firstName || !lastName || !email || !password) {
      // Simple visual shake or just return for now
      const step1 = document.querySelector(".step-1-form");
      if (step1) {
        gsap.fromTo(
          step1,
          { x: -10 },
          {
            x: 10,
            duration: 0.1,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
              gsap.set(step1, { x: 0 });
            },
          },
        );
      }
      return;
    }

    setStep(2);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate.push("/");
    }, 2000);
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate.push("/");
    }, 1500);
  };

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Left Panel - Branding (Swapped for Signup) */}
      <div
        ref={leftPanelRef}
        className="relative hidden w-1/2 flex-col justify-between bg-foreground p-12 text-background lg:flex"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <Link
          href="/"
          className="stagger-item relative z-10 text-3xl font-bold tracking-tighter font-display"
        >
          Safe<span className="text-primary">Receipts</span>
        </Link>

        <div className="stagger-item relative z-10 max-w-md">
          <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tighter font-display">
            Start issuing digital receipts today.
          </h2>
          <ul className="space-y-4 text-lg text-background/80">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-primary" size={24} />
              Reduce fraud and disputes
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-primary" size={24} />
              Speed up the returns process
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-primary" size={24} />
              Gain valuable customer insights
            </li>
          </ul>
        </div>

        <div className="stagger-item relative z-10">
          <div className="rounded-2xl border border-background/10 bg-background/5 p-6 backdrop-blur-sm">
            <p className="mb-4 text-lg italic text-background/90">
              "SafeReceipts completely transformed our returns desk. We process
              refunds 3x faster and fraud is practically zero."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                KO
              </div>
              <div>
                <p className="font-bold">Kwame Osei</p>
                <p className="text-sm text-background/60">
                  Store Manager, Accra
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div
        ref={rightPanelRef}
        className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-24"
      >
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-12 block text-2xl font-bold tracking-tighter font-display text-foreground lg:hidden"
          >
            Safe<span className="text-primary">Receipts</span>
          </Link>

          <div className="stagger-item mb-8 flex items-center gap-2">
            <div
              className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= 1 ? "bg-primary" : "bg-foreground/10"}`}
            />
            <div
              className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? "bg-primary" : "bg-foreground/10"}`}
            />
          </div>

          <div className="relative overflow-hidden">
            <div
              className={`transition-all duration-500 ${step === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full absolute top-0 left-0 w-full pointer-events-none"}`}
            >
              <h1 className="stagger-item mb-2 text-4xl font-bold tracking-tighter font-display text-foreground">
                Create an account
              </h1>
              <p className="stagger-item mb-8 text-foreground/60">
                Join the future of post-purchase management.
              </p>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="stagger-item mb-8 flex w-full items-center justify-center gap-3 rounded-full border border-foreground/20 bg-transparent py-4 font-medium text-foreground transition-colors hover:bg-foreground/5 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </button>

              <div className="stagger-item relative mb-8 flex items-center py-2">
                <div className="flex-grow border-t border-foreground/10"></div>
                <span className="mx-4 flex-shrink text-sm text-foreground/40">
                  or sign up with email
                </span>
                <div className="flex-grow border-t border-foreground/10"></div>
              </div>

              <div className="flex flex-col gap-4 step-1-form">
                <div className="stagger-item flex gap-4">
                  <Input
                    id="firstName"
                    type="text"
                    label="First Name"
                    required
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                  />
                  <Input
                    id="lastName"
                    type="text"
                    label="Last Name"
                    required
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                  />
                </div>
                <div className="stagger-item">
                  <Input
                    id="email"
                    type="email"
                    label="Work Email"
                    required
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                  />
                </div>
                <div className="stagger-item">
                  <Input
                    id="password"
                    type="password"
                    label="Password (min. 8 characters)"
                    required
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                  />
                </div>

                <div className="stagger-item mt-8">
                  <MagneticButton
                    type="button"
                    onClick={handleContinue}
                    className="group flex w-full items-center justify-center gap-2 py-4 text-lg"
                  >
                    Continue
                    <ArrowRight
                      className="transition-transform group-hover:translate-x-1"
                      size={20}
                    />
                  </MagneticButton>
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ${step === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full absolute top-0 left-0 w-full pointer-events-none"}`}
            >
              <h1 className="mb-2 text-4xl font-bold tracking-tighter font-display text-foreground">
                Business Details
              </h1>
              <p className="mb-8 text-foreground/60">
                Tell us a bit about your retail business.
              </p>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <Input
                    id="businessName"
                    type="text"
                    label="Business Name"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Input
                    id="storeCount"
                    type="number"
                    label="Number of Stores"
                    required
                    defaultValue={1}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Input
                    id="phone"
                    type="tel"
                    label="Phone Number"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mt-2 flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 rounded border-foreground/20 text-primary focus:ring-primary bg-transparent"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-foreground/70 cursor-pointer"
                  >
                    I agree href the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-full border border-foreground/20 py-4 font-medium transition-colors hover:bg-foreground/5"
                  >
                    Back
                  </button>
                  <MagneticButton
                    type="submit"
                    disabled={isLoading}
                    className="group  gap-2 py-4 text-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        Create Account
                        <CheckCircle2
                          className="transition-transform group-hover:scale-110"
                          size={20}
                        />
                      </>
                    )}
                  </MagneticButton>
                </div>
              </form>
            </div>
          </div>

          <p className="stagger-item mt-8 text-center text-foreground/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
