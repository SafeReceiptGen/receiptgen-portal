import { verifyApi, ApiRequestError, returnsApi } from "@/lib/api";
import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import Image from "next/image";
import { cn, mapToReceiptForReturn } from "@/lib/utils";
import { PublicReceiptView } from "@/components/receipt/public-receipt-view";

export default async function DigitalReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;
  const token = unwrappedParams.id;

  let receipt;
  try {
    const { receipt: verified } = await verifyApi.getByToken(token);
    receipt = mapToReceiptForReturn(verified, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      receipt = null;
    } else {
      throw error;
    }
  }

  if (!receipt) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-[#071427]">
        <Receipt size={32} className="mb-4 text-slate-400 dark:text-white/40" />
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Receipt Not Found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-white/50">
          We couldn&apos;t find this receipt. It may have expired or the link
          might be incorrect.
        </p>
      </div>
    );
  }

  let activeReturn: { id: string; returnNumber: string } | null = null;
  try {
    const eligibility = await returnsApi.getEligibility(token);
    activeReturn = eligibility.activeReturn ?? null;
  } catch {
    activeReturn = null;
  }

  const hasPolicy = receipt.returnWindow !== "No returns";
  const returnLocked = activeReturn != null;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-200 selection:text-blue-900 dark:bg-[#050B16] dark:selection:bg-blue-900 dark:selection:text-blue-200">
      <div className="pointer-events-none fixed inset-0 hidden bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(59,130,246,0.08),transparent_50%),radial-gradient(900px_circle_at_80%_10%,rgba(99,102,241,0.05),transparent_55%),radial-gradient(800px_circle_at_50%_100%,rgba(255,255,255,0.02),transparent_55%)] dark:block" />
      <div
        className="pointer-events-none fixed inset-0 hidden opacity-20 dark:block"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="sticky top-0 z-20 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-white/6 dark:bg-[#050B16]/80">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <div className="flex flex-1" />
          <div className="flex shrink-0 items-center justify-center gap-2">
            <Image
              src="/logo.jpg"
              alt="SafeReceipt Logo"
              width={20}
              height={20}
              className="rounded"
            />
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              SafeReceipt
            </span>
          </div>
          <div className="flex flex-1 justify-end" />
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 pb-32 pt-6 sm:px-6 md:pt-10">
        <div className="relative z-10 mx-auto w-full animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500 ease-out">
          <PublicReceiptView receipt={receipt} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200/80 bg-white/95 px-4 pb-safe pt-4 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-[#071427]/95">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 pb-4">
          <div className="mr-1 min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500 dark:text-white/60">
              {returnLocked
                ? "Return already in progress"
                : "Need to return an item?"}
            </p>
            <p className="mt-0.5 text-[10px] leading-snug text-slate-400 dark:text-white/40">
              {returnLocked
                ? "Please wait until the current request is reviewed or completed."
                : "Subject to store policy"}
            </p>
          </div>
          {returnLocked && activeReturn ? (
            <Link
              href={`/return/${activeReturn.id}?token=${encodeURIComponent(token)}`}
              className="group relative flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-900 px-5 py-3.5 pl-6 text-sm font-semibold text-white shadow-lg ring-1 ring-black/5 transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white/90"
            >
              <span className="relative z-10">View Return</span>
              <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5 dark:bg-black/10">
                <ChevronRight size={14} strokeWidth={3} />
              </span>
            </Link>
          ) : (
            <Link
              href={`/receipt/${token}/return`}
              aria-disabled={!hasPolicy}
              className={cn(
                "group relative flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-900 px-6 py-3.5 pl-7 text-sm font-semibold text-white shadow-lg ring-1 ring-black/5 transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:ring-white/10 dark:hover:bg-white/90",
                !hasPolicy &&
                  "pointer-events-none cursor-not-allowed opacity-50 grayscale",
              )}
            >
              <span className="relative z-10">Start a Return</span>
              <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5 dark:bg-black/10">
                <ChevronRight size={14} strokeWidth={3} />
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
