"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ReturnWizardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8 dark:bg-[#111827] text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 mb-4">
        <AlertTriangle size={28} className="text-red-500 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        Something went wrong!
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-white/50 max-w-sm">
        We encountered an error loading the return flow. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
      >
        Try again
      </button>
    </div>
  );
}
