"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input-2";
import { MagneticButton } from "@/components/landing/v2/MagneticButton";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema } from "../auth-schemas";
import { AuthSplit } from "../auth-split";
import { shakeForm } from "../shake-form";

const RESEND_SECONDS = 60;
const CONNECTION_ERROR =
  "Failed to connect to the server. Please check your connection and try again.";

type AuthRequestError = {
  status?: number;
  message?: string;
};

function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_URL ||
    "https://getsafereceipts.com"
  ).replace(/\/$/, "");
}

function requestReachedServer(error: AuthRequestError) {
  return typeof error.status === "number" && error.status > 0;
}

export function ForgotPasswordForm({ initialEmail }: { initialEmail: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState(initialEmail);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!sentTo || secondsLeft <= 0) return;
    const timeout = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [sentTo, secondsLeft]);

  async function sendReset(address: string) {
    setPending(true);
    setFormError(null);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: address,
        redirectTo: `${appOrigin()}/reset-password?email=${encodeURIComponent(address)}`,
      });

      if (error && !requestReachedServer(error)) {
        setFormError(CONNECTION_ERROR);
        return;
      }

      setSentTo(address);
      setSecondsLeft(RESEND_SECONDS);
    } catch {
      setFormError(CONNECTION_ERROR);
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = forgotPasswordSchema.safeParse({
      email: new FormData(event.currentTarget).get("email"),
    });

    if (!parsed.success) {
      setFieldError(parsed.error.flatten().fieldErrors.email?.[0] ?? null);
      shakeForm(formRef.current);
      return;
    }

    setFieldError(null);
    setEmail(parsed.data.email);
    await sendReset(parsed.data.email);
  }

  if (sentTo) {
    return (
      <AuthSplit>
        <h1 className="stagger-item mb-2 text-4xl font-bold tracking-tighter font-display text-foreground">
          Check your email
        </h1>
        <p className="stagger-item mb-8 text-foreground/60">
          If an account exists for {sentTo}, we sent a link to reset your
          password. It expires in 1 hour.
        </p>

        {formError && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            <AlertCircle size={15} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="stagger-item">
          <MagneticButton
            type="button"
            disabled={pending || secondsLeft > 0}
            onClick={() => void sendReset(sentTo)}
            className="group flex w-full items-center justify-center gap-2 py-4 text-lg"
          >
            {pending ? (
              <Loader2 className="animate-spin" size={24} />
            ) : secondsLeft > 0 ? (
              `Resend in ${secondsLeft}s`
            ) : (
              "Resend link"
            )}
          </MagneticButton>
        </div>

        <p className="stagger-item mt-8 text-center text-foreground/60">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit>
      <h1 className="stagger-item mb-2 text-4xl font-bold tracking-tighter font-display text-foreground">
        Reset your password
      </h1>
      <p className="stagger-item mb-8 text-foreground/60">
        Enter the email you use for SafeReceipts. We&apos;ll send a link to
        choose a new password.
      </p>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="stagger-item">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            autoComplete="email"
            required
            disabled={pending}
            defaultValue={email}
          />
          {fieldError && (
            <p className="mt-1 text-xs text-destructive">{fieldError}</p>
          )}
        </div>

        {formError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            <AlertCircle size={15} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="stagger-item mt-8">
          <MagneticButton
            type="submit"
            disabled={pending}
            className="group flex w-full items-center justify-center gap-2 py-4 text-lg"
          >
            {pending ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Send reset link
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
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthSplit>
  );
}
