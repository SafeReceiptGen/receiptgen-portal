"use client";
import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
} from "@/components/ui/expandable-screen";
import { ReceiptCent, Loader2, LogIn, Save } from "lucide-react";
import { ReceiptPreview } from "./receipt-preview";
import { INITIAL_RECEIPT_DATA, ReceiptData } from "@/types";
import { useActionState, useEffect, useRef, useState } from "react";
import { ReceiptForm } from "./receipt-form";
import html2canvas from "html2canvas-pro";
import ConversionDialog from "./conversion-dialog";
import { MobileWizard } from "./form-mobile";
import Image from "next/image";
import Link from "next/link";
import { generateReceipt, ActionState } from "./actions";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const LS_KEY = "sr_drafts";
const MAX_DRAFTS = 20;

const initialActionState: ActionState = { success: false, message: "" };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function saveToLocalStorage(receipt: ReceiptData) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const drafts: ReceiptData[] = raw ? JSON.parse(raw) : [];
    // Prepend newest, cap at MAX_DRAFTS
    const updated = [
      { ...receipt, savedAt: new Date().toISOString() } as ReceiptData,
      ...drafts,
    ].slice(0, MAX_DRAFTS);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  } catch {
    // Storage might be full or disabled — silently ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ReceiptFormScreen({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [data, setData] = useState<ReceiptData>(INITIAL_RECEIPT_DATA);
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [guestSaved, setGuestSaved] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // ── Server action (authenticated only) ──────────────────────────────────
  const boundAction = generateReceipt.bind(null, data);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialActionState,
  );

  // When server action succeeds: update qrUrl then capture
  useEffect(() => {
    if (state.success) {
      if (state.qrUrl) {
        setData((prev) => ({ ...prev, qrUrl: state.qrUrl! }));
      }
      requestAnimationFrame(() => captureReceipt());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── Guest: save to localStorage ──────────────────────────────────────────
  const handleGuestSave = () => {
    saveToLocalStorage(data);
    setGuestSaved(true);
    // Capture snapshot as download regardless (no QR code in it)
    captureReceipt();
    setTimeout(() => setGuestSaved(false), 3000);
  };

  // ── Canvas capture ───────────────────────────────────────────────────────
  const captureReceipt = async () => {
    if (!receiptRef.current || !html2canvas) {
      console.error("Capture target or library not found");
      return;
    }
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      setGeneratedImageUrl(imgData);
      setShowConversionDialog(true);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  /** Guest CTA banner shown at the top of the form panel */
  const GuestBanner = (
    <div className="flex text-left items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
      <p className="text-xs text-amber-700 dark:text-amber-300">
        <span className="font-semibold">You&apos;re not signed in.</span>{" "}
        Receipts will be saved locally on this device only. Sign in to unlock
        full features, QR codes, and cloud sync.
      </p>
      <Link
        href="/login"
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
      >
        <LogIn size={12} />
        Sign In
      </Link>
    </div>
  );

  /** Action bar button (changes based on auth state) */
  const ActionButton = isAuthenticated ? (
    // Authenticated: submit to server action
    <form action={formAction} className="w-full">
      <button
        type="submit"
        disabled={pending}
        className="group w-full flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-blue-600 to-blue-700 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(37,99,235,0.28)] ring-1 ring-black/5 transition-all hover:from-blue-500 hover:to-blue-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed dark:from-blue-500 dark:ring-white/10 dark:hover:from-blue-400"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin opacity-95" />
            Generating…
          </>
        ) : (
          <>
            <ReceiptCent size={16} className="opacity-95" />
            Generate Receipt
          </>
        )}
      </button>
    </form>
  ) : (
    // Guest: save to localStorage + capture
    <button
      type="button"
      onClick={handleGuestSave}
      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-all hover:bg-slate-200 active:scale-[0.99] disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:ring-white/10 dark:hover:bg-white/10"
    >
      {guestSaved ? (
        <>
          <Save size={16} className="text-green-500" />
          Saved to device!
        </>
      ) : (
        <>
          <Save size={16} />
          Save & Download
        </>
      )}
    </button>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <ExpandableScreen
      layoutId="cta-card"
      triggerRadius="100px"
      contentRadius="24px"
      animationDuration={0.3}
    >
      <ExpandableScreenTrigger className="rounded-full bg-primary px-6 py-3 font-semibold text-white  ring-1 ring-black/10 transition-colors hover:bg-[#10365F]">
        Create a Receipt
      </ExpandableScreenTrigger>

      <ExpandableScreenContent
        className="bg-slate-50 text-slate-900 shadow-2xl ring-1 ring-slate-200 dark:bg-[#050B16] dark:text-white dark:ring-white/10"
        closeButtonClassName="text-slate-500 bg-slate-100 hover:bg-slate-200 ring-1 ring-slate-200 backdrop-blur dark:text-white dark:bg-white/5 dark:hover:bg-white/10 dark:ring-white/10"
      >
        <>
          {/* ── Mobile wizard ── */}
          <MobileWizard
            data={data}
            ref={receiptRef}
            onChange={setData}
            formAction={formAction}
            pending={pending}
            actionState={state}
            isAuthenticated={isAuthenticated}
            onGuestSave={handleGuestSave}
            guestSaved={guestSaved}
          />

          {/* ── Desktop layout ── */}
          <div className="relative hidden h-full w-full overflow-hidden md:flex">
            {/* Background atmosphere */}
            <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(59,130,246,0.18),transparent_50%),radial-gradient(900px_circle_at_80%_10%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(800px_circle_at_50%_100%,rgba(255,255,255,0.04),transparent_55%)] dark:block" />
            <div
              className="pointer-events-none absolute inset-0 opacity-20 hidden dark:block"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative z-10 flex h-full w-full min-w-0 gap-6 p-6 lg:p-8">
              {/* Left Panel: Configuration */}
              <div className="flex h-full w-[520px] max-w-[46%] min-w-0 flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 backdrop-blur dark:bg-white/4 dark:ring-white/10">
                {/* Header */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src="/logo.jpg"
                      alt="SafeReceipt Logo"
                      width={24}
                      height={24}
                    />
                    <div className="leading-tight">
                      <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                        SafeReceipt
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-white/60">
                        Receipt builder
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 dark:bg-white/5 dark:text-white/60 dark:ring-white/10">
                    v0.1.0
                  </div>
                </header>

                {/* Guest banner */}
                {!isAuthenticated && (
                  <div className="shrink-0 p-4 pb-0">{GuestBanner}</div>
                )}

                {/* Form */}
                <div className="min-h-0 flex-1">
                  <ReceiptForm
                    data={data}
                    onChange={setData}
                    actionState={state}
                    isAuthenticated={isAuthenticated}
                  />
                </div>

                {/* Action Bar */}
                <div className="shrink-0 border-t border-slate-200 p-4 dark:border-white/10">
                  {state.message && !state.success && (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                      {state.message}
                    </div>
                  )}
                  <div className="flex gap-3 ">{ActionButton}</div>
                </div>
              </div>

              {/* Right Panel: Preview */}
              <div className="relative flex h-full min-w-0 flex-1 overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200 dark:bg-linear-to-b dark:from-white/6 dark:to-white/2 dark:ring-white/10">
                <div className="pointer-events-none absolute top-[-18%] right-[-10%] h-[620px] w-[620px] rounded-full bg-blue-500/10 blur-[120px] hidden dark:block" />
                <div className="pointer-events-none absolute bottom-[-12%] left-[8%] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-[110px] hidden dark:block" />
                <div className="relative h-full w-full min-w-0">
                  <ReceiptPreview
                    data={data}
                    ref={receiptRef}
                    showQr={isAuthenticated && !!data.qrUrl?.trim()}
                  />
                </div>
              </div>
            </div>
          </div>

          {showConversionDialog && (
            <ConversionDialog
              onClose={() => setShowConversionDialog(false)}
              imgUrl={generatedImageUrl}
              receiptUrl={data.qrUrl?.trim() || undefined}
              receiptData={data}
            />
          )}
        </>
      </ExpandableScreenContent>
    </ExpandableScreen>
  );
}
