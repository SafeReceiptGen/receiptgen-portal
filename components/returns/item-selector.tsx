"use client";

import { ReturnItem } from "@/types/returns";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ItemSelectorProps {
  items: ReturnItem[];
  currency: string;
  onChange: (items: ReturnItem[]) => void;
  className?: string;
}

export function ItemSelector({
  items,
  currency,
  onChange,
  className,
}: ItemSelectorProps) {
  const toggleItem = (id: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const selectedCount = items.filter((i) => i.selected).length;
  const selectedTotal = items
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  const formatPrice = (price: number) =>
    price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => toggleItem(item.id)}
          className={cn(
            "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
            item.selected
              ? "border-primary bg-primary/5 ring-1 ring-primary/20 dark:border-blue-400/50 dark:bg-blue-400/5 dark:ring-blue-400/10"
              : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-white/4 dark:hover:border-white/15",
          )}
        >
          {/* Checkbox */}
          <div
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
              item.selected
                ? "border-primary bg-primary text-white dark:border-blue-400 dark:bg-blue-400"
                : "border-slate-300 dark:border-white/20",
            )}
          >
            {item.selected && <Check size={12} strokeWidth={3} />}
          </div>

          {/* Item info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate dark:text-white">
              {item.name}
            </p>
            <p className="text-xs text-slate-500 truncate dark:text-white/50">
              {item.detail}
            </p>
            {item.quantity > 1 && (
              <p className="text-[11px] text-slate-400 dark:text-white/30">
                Qty: {item.quantity}
              </p>
            )}
          </div>

          {/* Price */}
          <span className="text-sm font-bold text-slate-900 whitespace-nowrap dark:text-white">
            {currency} {formatPrice(item.price * item.quantity)}
          </span>
        </button>
      ))}

      {/* Selection summary */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-2.5 ring-1 ring-primary/10 dark:bg-blue-400/5 dark:ring-blue-400/10">
          <span className="text-xs font-medium text-primary dark:text-blue-400">
            {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <span className="text-sm font-bold text-primary dark:text-blue-400">
            {currency} {formatPrice(selectedTotal)}
          </span>
        </div>
      )}
    </div>
  );
}
