"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input-2";
import { MagneticButton } from "@/components/landing/v2/MagneticButton";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "../auth-schemas";
import { AuthSplit } from "../auth-split";
import { shakeForm } from "../shake-form";

const CONNECTION_ERROR =
  "Failed to connect to the server. Please check your connection and try again.";

type AuthRequestError = {
  status?: number;
  code?: string;
  message?: string;
};

function requestReachedServer(error: AuthRequestError) {
  return typeof error.status === "number" && error.status > 0;
}

function ExpiredLink({ email }: { email: string }) {
  const navigate = useRouter();
  const href = email
    ? `/forgot-password?email=${encodeURIComponent(email)}`
    : "/forgot-password";

  return (
    <AuthSplit>
      <h1 className="stagger-item mb-2 text-4xl font-bold tracking-tighter font-display text-foreground">
        This link has expired
      </h1>
      <p className="stagger-item mb-8 text-foreground/60">
        This link has expired or was already used.
      </p>
      <div className="stagger-item">
        <MagneticButton
          type="button"
          onClick={() => navigate.push(href)}
          className="group flex w-full items-center justify-center gap-2 py-4 text-lg"
        >
          Request a new link
          <ArrowRight
            className="transition-transform group-hover:translate-x-1"
            size={20}
          />
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

export function ResetPasswordForm({
  token,
  email,
  tokenError,
}: {
  token: string;
  email: string;
  tokenError: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useRouter();
  const [pending, setPending] = useState(false);
  const [expired, setExpired] = useState(tokenError || !token);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[] | undefined
  > | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (expired) {
    return <ExpiredLink email={email} />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      shakeForm(event.currentTarget);
      return;
    }

    setFieldErrors(null);
    setPending(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: parsed.data.password,
        token,
      });

      if (error) {
        if (!requestReachedServer(error)) {
          setFormError(CONNECTION_ERROR);
          shakeForm(formRef.current);
          return;
        }

        if (error.code === "INVALID_TOKEN") {
          setExpired(true);
          return;
        }

        if (error.code === "PASSWORD_TOO_SHORT") {
          setFieldErrors({
            password: ["Password must be at least 8 characters."],
          });
          shakeForm(formRef.current);
          return;
        }

        if (error.code === "PASSWORD_TOO_LONG") {
          setFieldErrors({
            password: ["Password must be at most 128 characters."],
          });
          shakeForm(formRef.current);
          return;
        }

        setFormError(
          "Couldn't update your password. Request a new link and try again.",
        );
        shakeForm(formRef.current);
        return;
      }

      if (!email) {
        navigate.push("/login?reset=success");
        return;
      }

      try {
        const { data, error: signInErr } = await authClient.signIn.email({
          email,
          password: parsed.data.password,
        });

        if (signInErr) {
          navigate.push("/login?reset=success");
          return;
        }

        navigate.push(data?.user.retailerId ? "/dashboard" : "/onboarding");
      } catch {
        navigate.push("/login?reset=success");
      }
    } catch {
      setFormError(CONNECTION_ERROR);
      shakeForm(formRef.current);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthSplit>
      <h1 className="stagger-item mb-2 text-4xl font-bold tracking-tighter font-display text-foreground">
        Choose a new password
      </h1>
      <p className="stagger-item mb-8 text-foreground/60">
        Use at least 8 characters. You&apos;ll be signed in after it&apos;s
        saved.
      </p>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="stagger-item">
          <Input
            id="password"
            name="password"
            type="password"
            label="New password"
            autoComplete="new-password"
            required
            disabled={pending}
          />
          {fieldErrors?.password?.[0] && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.password[0]}
            </p>
          )}
        </div>
        <div className="stagger-item">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            required
            disabled={pending}
          />
          {fieldErrors?.confirmPassword?.[0] && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.confirmPassword[0]}
            </p>
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
                Update password
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
