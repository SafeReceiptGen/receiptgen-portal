"use client";

import * as React from "react";
import { Share2, Download, Check, Copy, X, ArrowRight } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ConversionDialog({
  onClose,
  imgUrl,
}: {
  onClose: () => void;
  imgUrl: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const router = useRouter();
  const handleCopyImage = () => {
    try {
      fetch(imgUrl)
        .then((res) => res.blob())
        .then((blob) => {
          navigator.clipboard
            .write([new ClipboardItem({ [blob.type]: blob })])
            .then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
        });
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = await (await fetch(imgUrl)).blob();
        const file = new File([blob], "receipt.png", { type: blob.type });
        await navigator.share({ title: "Receipt", files: [file] });
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      alert("Sharing is not supported on this device/browser.");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `SafeReceipt-${Date.now()}.png`;
    link.href = imgUrl;
    link.click();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-900 shadow-2xl sm:max-w-sm dark:border-white/10 dark:bg-[#071427] dark:text-white">
        {/* Top accent line */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-green-400/60 to-transparent dark:via-green-400/40" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/20">
              <Check
                className="size-4 text-green-500 dark:text-green-400"
                strokeWidth={2.5}
              />
            </span>
            <div>
              <p className="text-[15px] font-semibold leading-tight text-slate-900 dark:text-white">
                Receipt ready
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500 dark:text-white/50">
                What would you like to do?
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 px-6 pb-5">
          <ActionButton
            icon={<Share2 className="size-4" />}
            label="Share"
            onClick={handleShare}
          />
          <ActionButton
            icon={<Download className="size-4" />}
            label="Download"
            onClick={handleDownload}
          />
          <ActionButton
            icon={
              copied ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )
            }
            label={copied ? "Copied!" : "Copy"}
            onClick={handleCopyImage}
          />
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-slate-100 dark:bg-white/8" />

        {/* Soft conversion nudge */}
        <div className="px-6 py-5">
          <p className="text-[13px] font-medium text-slate-700 dark:text-white/80">
            Keep your receipts organized
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-400 dark:text-white/40">
            Create a free account to save receipts, track returns, and access
            them from any device.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-[13px] text-slate-400 transition-colors hover:text-slate-600 dark:text-white/40 dark:hover:text-white/70"
            >
              Maybe later
            </button>
            <Button
              size="sm"
              onClick={() => router.push("/signup")}
              className="h-8 cursor-pointer rounded-full bg-blue-700 px-4 text-[13px] font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
            >
              Create free account
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-white/8 dark:bg-white/4 dark:text-white/60 dark:hover:border-white/15 dark:hover:bg-white/8 dark:hover:text-white"
    >
      {icon}
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  );
}
