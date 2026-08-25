"use client";

import { cn } from "@/lib/utils";
import type {
  ReceiptDocumentDescriptor,
  ReceiptDocumentKind,
} from "@/lib/receipt-documents";

type ReceiptDocumentsSwitcherProps = {
  documents: ReceiptDocumentDescriptor[];
  value: ReceiptDocumentKind;
  onChange: (kind: ReceiptDocumentKind) => void;
  className?: string;
};

export function ReceiptDocumentsSwitcher({
  documents,
  value,
  onChange,
  className,
}: ReceiptDocumentsSwitcherProps) {
  if (documents.length <= 1 && documents[0]?.kind === "standard") {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40">
        Receipts
      </p>
      <div
        className="flex gap-1 rounded-full bg-slate-100/90 p-1 ring-1 ring-slate-200/80 dark:bg-white/5 dark:ring-white/10"
        role="tablist"
        aria-label="Receipt documents"
      >
        {documents.map((doc) => {
          const selected = doc.kind === value;
          return (
            <button
              key={doc.kind}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(doc.kind)}
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                selected
                  ? "bg-white text-slate-900 shadow-sm dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white",
              )}
            >
              {doc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
