"use client";

import { Fragment } from "react";
import type { LogisticsMethod, ReturnStatus } from "@/types/returns";
import {
  getAcStepperSteps,
  type AcStepState,
} from "@/lib/return-customer-status";
import { CheckCircle2, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusTrackerProps {
  currentStatus: ReturnStatus;
  logisticsMethod?: LogisticsMethod;
  className?: string;
}

function StepIcon({ state }: { state: AcStepState }) {
  if (state === "complete") {
    return (
      <CheckCircle2
        size={20}
        className="text-green-500 dark:text-green-400"
        aria-hidden
      />
    );
  }
  if (state === "skipped") {
    return (
      <Minus
        size={20}
        className="text-slate-300 dark:text-white/25"
        aria-hidden
      />
    );
  }
  if (state === "current") {
    return (
      <div
        className="h-3 w-3 rounded-full bg-primary shadow-sm ring-4 ring-primary/20 dark:bg-blue-400 dark:ring-blue-400/20"
        aria-hidden
      />
    );
  }
  return (
    <div
      className="h-3 w-3 rounded-full border-2 border-slate-300 bg-transparent dark:border-white/25"
      aria-hidden
    />
  );
}

export function StatusTracker({
  currentStatus,
  logisticsMethod,
  className,
}: StatusTrackerProps) {
  const method = logisticsMethod ?? "DROP_OFF";
  const steps = getAcStepperSteps(currentStatus, method);

  return (
    <div className={cn("w-full", className)}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/35">
        Progress
      </p>
      <div className="flex w-full items-start">
        {steps.map((step, index) => (
          <Fragment key={step.key}>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  step.state === "complete" &&
                    "border-green-500 bg-green-500/10 dark:border-green-400 dark:bg-green-500/10",
                  step.state === "current" &&
                    "border-primary bg-primary/10 dark:border-blue-400 dark:bg-blue-400/10",
                  step.state === "upcoming" &&
                    "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5",
                  step.state === "skipped" &&
                    "border-dashed border-slate-200 bg-transparent dark:border-white/10",
                )}
              >
                <StepIcon state={step.state} />
              </div>
              <span
                className={cn(
                  "max-w-[72px] text-center text-[10px] font-medium leading-tight sm:max-w-[80px] sm:text-[11px]",
                  step.state === "complete" &&
                    "text-green-600 dark:text-green-400",
                  step.state === "current" &&
                    "font-semibold text-primary dark:text-blue-400",
                  step.state === "upcoming" &&
                    "text-slate-400 dark:text-white/30",
                  step.state === "skipped" &&
                    "text-slate-400 line-through decoration-slate-300 dark:text-white/25 dark:decoration-white/20",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mt-5 h-0.5 w-3 shrink-0 rounded-full sm:w-4",
                  steps[index].state === "complete"
                    ? "bg-green-500 dark:bg-green-400"
                    : "bg-slate-200 dark:bg-white/10",
                )}
                aria-hidden
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
