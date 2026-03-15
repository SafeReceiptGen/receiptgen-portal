"use client";
import React, { useRef, useState, useActionState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input-2";
import Link from "next/link";
import { MagneticButton } from "@/components/landing/v2/MagneticButton";
import { authClient } from "@/lib/auth-client";
import { validateLoginAction, AuthActionState } from "../actions";

export default function Login() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
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
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
          "-=0.6",
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

  const [state, formAction, pending] = useActionState(
    async (
      prevState: AuthActionState,
      formData: FormData,
    ): Promise<AuthActionState> => {
      setAuthError(null);

      const result = await validateLoginAction(prevState, formData);

      if (!result.success) {
        shakeForm();
        return result;
      }

      const { email, password } = result.data;

      try {
        const { error: signInErr } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInErr) {
          shakeForm();
          const message =
            signInErr.code === "INVALID_EMAIL_OR_PASSWORD"
              ? "Incorrect email or password."
              : (signInErr.message ?? "Sign in failed. Please try again.");
          setAuthError(message);
          return { ...result, success: false };
        }
      } catch (e: unknown) {
        console.error("Sign in error:", e);
        shakeForm();
        setAuthError(
          (e as Error).message ||
            "Failed to connect to the server. Please check your connection and try again.",
        );
        return { ...result, success: false };
      }

      navigate.push("/dashboard");
      return { ...result, success: true };
    },
    { success: false, errors: null, data: null },
  );

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL:
          process.env.NEXT_PUBLIC_URL ||
          "https://getsafereceipts.com" + "/dashboard",
      });
    } catch (err: unknown) {
      setAuthError(
        (err as Error).message ||
          "Failed to connect to the server. Please check your connection and try again.",
      );
      console.log(err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isLoading = pending || isGoogleLoading;
  const generalError = authError || state?.message;

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Left Panel - Branding */}
      <div
        ref={leftPanelRef}
        className="relative hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex"
      >
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <Link
          href="/"
          className="stagger-item relative z-10 text-3xl font-bold tracking-tighter font-display"
        >
          Safe<span className="text-white/50">Receipts</span>
        </Link>

        <div className="stagger-item relative z-10 max-w-md">
          <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tighter font-display">
            Welcome back to simpler returns.
          </h2>
          <p className="text-lg text-white/80">
            Access your dashboard to manage digital receipts, approve returns,
            and gain insights into your post-purchase operations.
          </p>
        </div>

        <div className="stagger-item relative z-10 flex items-center gap-4">
          <div className="flex -space-x-4">
            {[1, 2, 3].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/100?img=${i + 10}`}
                alt="User avatar"
                className="h-12 w-12 rounded-full border-2 border-primary object-cover"
              />
            ))}
          </div>
          <p className="text-sm text-white/80">Join 500+ retailers in Ghana.</p>
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

          <h1 className="stagger-item mb-2 text-4xl font-bold tracking-tighter font-display text-foreground">
            Sign In
          </h1>
          <p className="stagger-item mb-8 text-foreground/60">
            Enter your details to access your account.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
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
            Continue with Google
          </button>

          <div className="stagger-item relative mb-8 flex items-center py-2">
            <div className="grow border-t border-foreground/10"></div>
            <span className="mx-4 shrink text-sm text-foreground/40">
              or sign in with email
            </span>
            <div className="grow border-t border-foreground/10"></div>
          </div>

          <form
            ref={formRef}
            action={formAction}
            className="flex flex-col gap-4"
          >
            <div className="stagger-item">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                required
                disabled={isLoading}
                defaultValue={(state.data?.email as string) || ""}
              />
              {state.errors?.email && (
                <p className="mt-1 text-xs text-destructive">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
            <div className="stagger-item">
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                required
                disabled={isLoading}
                defaultValue={(state.data?.password as string) || ""}
              />
              {state.errors?.password && (
                <p className="mt-1 text-xs text-destructive">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Error message */}
            {generalError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                <AlertCircle size={15} className="shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <div className="stagger-item mt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-foreground/20 text-primary focus:ring-primary bg-transparent"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <div className="stagger-item mt-8">
              <MagneticButton
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 py-4 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      className="transition-transform group-hover:translate-x-1"
                      size={20}
                    />
                  </>
                )}
              </MagneticButton>
            </div>
          </form>

          <p className="stagger-item mt-8 text-center text-foreground/60">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
