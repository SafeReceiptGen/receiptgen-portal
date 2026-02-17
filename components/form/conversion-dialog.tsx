"use client";

import * as React from "react";
import { ArrowRight, FileText, Image as ImageIcon } from "lucide-react";

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
}: {
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-white/10 bg-[#071427] text-white shadow-2xl sm:max-w-md">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
              <ImageIcon className="size-4 text-white/90" />
            </span>
            Download complete
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Your receipt PNG is saved. Want a PDF version too?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-xl bg-white/3 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
              <ImageIcon className="size-4 text-white/90" />
            </span>
            <div className="flex-1 leading-tight">
              <div className="font-semibold text-white/90">PNG</div>
              <div className="text-white/60">Great for sharing on WhatsApp.</div>
            </div>
          </div>

          <div className="my-3 flex items-center gap-2 text-white/35">
            <div className="h-px flex-1 bg-white/10" />
            <ArrowRight className="size-4" />
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
              <FileText className="size-4 text-white/90" />
            </span>
            <div className="flex-1 leading-tight">
              <div className="font-semibold text-white/90">PDF</div>
              <div className="text-white/60">
                Better for printing and email.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            Not now
          </Button>
          <Button
            type="button"
            disabled
            className="bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
          >
            Convert to PDF (soon)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

