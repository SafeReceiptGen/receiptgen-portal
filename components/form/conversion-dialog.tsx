"use client";

import * as React from "react";
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Share2,
  Download,
  Sparkles,
  Check,
  Copy,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConversionDialog({
  onClose,
  imgUrl,
}: {
  onClose: () => void;
  imgUrl: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    // For now, since we don't have a backend link yet, we can't really copy a link.
    // But the requirements say "Copy Link". We might place a placeholder or just copy the image URL (data url is too long).
    // Let's assume we copy a placeholder "link" or just show a toast that it's coming soon,
    // OR if the user meant copy the image to clipboard:
    try {
      // Attempt to copy image to clipboard (modern browsers)
      fetch(imgUrl)
        .then((res) => res.blob())
        .then((blob) => {
          navigator.clipboard
            .write([
              new ClipboardItem({
                [blob.type]: blob,
              }),
            ])
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
        await navigator.share({
          title: "Receipt",
          text: "Here is your receipt.",
          files: [file],
        });
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      // Fallback or alert
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
      <DialogContent className="border-slate-200 bg-white text-slate-900 shadow-2xl sm:max-w-md dark:border-white/10 dark:bg-[#071427] dark:text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-white/25" />

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-green-500/10 ring-1 ring-green-500/20">
              <Check className="size-5 text-green-400" />
            </span>
            Receipt Ready!
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-white/70">
            What would you like to do with it?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="h-auto flex-col gap-2 py-4 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
            >
              <Share2 className="size-5 mb-1" />
              Share
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="h-auto flex-col gap-2 py-4 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
            >
              <Download className="size-5 mb-1" />
              Download
            </Button>
          </div>
          {/* Copy Link - Optional/Placeholder for now as we don't have a permalink yet */}
          {/* <Button
                onClick={handleCopyLink}
                variant="ghost"
                 className="text-white/50 hover:text-white"
             >
                <Copy className="size-4 mr-2" />
                {copied ? "Copied!" : "Copy Link"}
             </Button> */}
        </div>

        <div className="mt-2 rounded-xl bg-blue-50 p-5 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20">
          <div className="mb-4">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2 dark:text-blue-100">
              <Sparkles className="size-4 text-blue-500 dark:text-blue-400" />
              Save your receipts
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-700/70 dark:text-blue-200/70">
              <li className="flex items-center gap-2">
                <div className="size-1 rounded-full bg-blue-500 dark:bg-blue-400" />
                Access past receipts anytime
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1 rounded-full bg-blue-500 dark:bg-blue-400" />
                Track returns & store details
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 dark:hover:bg-blue-500 dark:shadow-blue-900/20">
              Create Free Account
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-200 dark:hover:text-white dark:hover:bg-blue-500/10"
            >
              Not now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
