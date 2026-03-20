"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function ReturnStatusError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8 dark:bg-[#111827] text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 mb-4">
        <AlertCircle size={28} className="text-red-500 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        Unable to load status
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-white/50 max-w-sm">
        There was a problem retrieving the return tracking information.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
      >
        Retry
      </button>
    </div>
  );
}
