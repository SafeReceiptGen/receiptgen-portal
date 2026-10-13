"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import type { ReceiptAdjustmentView } from "@/lib/api";

type SummaryItem = {
  name: string;
  quantity: number;
  lineTotal: string | number;
  role?: "sale" | "remaining" | "replacement" | null;
};

type AdjustmentSummaryProps = {
  adjustment?: ReceiptAdjustmentView | null;
  items: SummaryItem[];
  currency: string;
  total: string | number;
  linkMode: "token" | "id";
  onOpenReceipt?: (receiptId: string) => void;
};

function money(value: string | number, currency: string): string {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) return "—";
  return formatCurrency(amount, currency);
}

function kindLabel(kind: "return" | "exchange"): string {
  switch (kind) {
    case "return":
      return "Return receipt";
    case "exchange":
      return "Exchange receipt";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function ReceiptLink({
  label,
  linkMode,
  id,
  token,
  onOpenReceipt,
}: {
  label: string;
  linkMode: "token" | "id";
  id: string;
  token: string;
  onOpenReceipt?: (receiptId: string) => void;
}) {
  if (linkMode === "token") {
    return (
      <Link
        href={`/receipt/${token}`}
        className="font-medium text-slate-900 underline underline-offset-2 dark:text-white"
      >
        {label}
      </Link>
    );
  }

  if (onOpenReceipt) {
    return (
      <button
        type="button"
        className="font-medium text-slate-900 underline underline-offset-2 dark:text-white"
        onClick={() => onOpenReceipt(id)}
      >
        {label}
      </button>
    );
  }

  return <span className="font-medium">{label}</span>;
}

function ItemList({
  title,
  rows,
  currency,
}: {
  title: string;
  rows: Array<{ name: string; quantity: number; amount: string | number }>;
  currency: string;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <ul className="space-y-1 text-sm">
        {rows.map((row) => (
          <li key={`${title}-${row.name}-${row.quantity}`} className="flex justify-between gap-3">
            <span>
              {row.name}
              <span className="text-slate-500"> × {row.quantity}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              {money(row.amount, currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdjustmentSummary({
  adjustment,
  items,
  currency,
  total,
  linkMode,
  onOpenReceipt,
}: AdjustmentSummaryProps) {
  if (!adjustment) return null;
  const latest = adjustment.adjustments[0];
  const isAdjustment = adjustment.originalReceipt != null && adjustment.kind != null;
  if (!isAdjustment && !latest) return null;

  const remaining = items.filter((item) => item.role === "remaining");
  const replacements = items.filter((item) => item.role === "replacement");
  const refund = Number.parseFloat(adjustment.refundAmount);
  const additional = Number.parseFloat(adjustment.additionalPayment);

  return (
    <div className="w-full space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
      {isAdjustment && adjustment.kind && adjustment.originalReceipt ? (
        <>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {kindLabel(adjustment.kind)}
            </p>
            <p className="mt-1 text-sm">
              Adjusts{" "}
              <ReceiptLink
                label={adjustment.originalReceipt.receiptNumber}
                linkMode={linkMode}
                id={adjustment.originalReceipt.id}
                token={adjustment.originalReceipt.qrCodeToken}
                onOpenReceipt={onOpenReceipt}
              />
            </p>
          </div>
          <ItemList
            title="Returned"
            currency={currency}
            rows={adjustment.returnedItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              amount: item.amount,
            }))}
          />
          <ItemList
            title="Remaining"
            currency={currency}
            rows={remaining.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              amount: item.lineTotal,
            }))}
          />
          <ItemList
            title="Replacement"
            currency={currency}
            rows={replacements.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              amount: item.lineTotal,
            }))}
          />
          {Number.isFinite(refund) && refund > 0 ? (
            <div className="flex justify-between gap-3 text-sm">
              <span>Refund</span>
              <span className="tabular-nums">{money(refund, currency)}</span>
            </div>
          ) : null}
          {Number.isFinite(additional) && additional > 0 ? (
            <div className="flex justify-between gap-3 text-sm">
              <span>Additional payment</span>
              <span className="tabular-nums">{money(additional, currency)}</span>
            </div>
          ) : null}
          <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 text-sm font-semibold dark:border-white/10">
            <span>Final total</span>
            <span className="tabular-nums">{money(total, currency)}</span>
          </div>
        </>
      ) : null}

      {latest ? (
        <div className="space-y-1 text-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Adjustment receipt
          </p>
          {adjustment.adjustments.map((child) => (
            <p key={child.id}>
              <ReceiptLink
                label={`${kindLabel(child.adjustmentKind)} ${child.receiptNumber}`}
                linkMode={linkMode}
                id={child.id}
                token={child.qrCodeToken}
                onOpenReceipt={onOpenReceipt}
              />
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
