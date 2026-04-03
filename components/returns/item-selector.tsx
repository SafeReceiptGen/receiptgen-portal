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

function unitsReturning(item: ReturnItem): number {
  if (!item.selected) return 0;
  if (item.quantity === 1) return 1;
  return item.returnQuantity ?? 0;
}

export function ItemSelector({
  items,
  currency,
  onChange,
  className,
}: ItemSelectorProps) {
  const toggleItem = (id: string) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const nextSelected = !item.selected;
        return {
          ...item,
          selected: nextSelected,
          returnQuantity:
            nextSelected && item.quantity > 1
              ? undefined
              : nextSelected
                ? 1
                : item.quantity > 1
                  ? undefined
                  : undefined,
        };
      }),
    );
  };

  const setReturnQuantity = (id: string, qty: number) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, selected: true, returnQuantity: qty } : item,
      ),
    );
  };

  const selectedCount = items.filter((i) => i.selected).length;
  const selectedTotal = items
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + i.price * unitsReturning(i), 0);

  const formatPrice = (price: number) =>
    price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const purchasedLine = item.price * item.quantity;
        const returning = unitsReturning(item);
        const returnSubtotal = item.selected ? item.price * returning : purchasedLine;

        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-xl border text-left transition-all",
              item.selected
                ? "border-primary bg-primary/5 ring-1 ring-primary/20 dark:border-blue-400/50 dark:bg-blue-400/5 dark:ring-blue-400/10"
                : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/4",
            )}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center gap-4 p-4 hover:bg-slate-100/80 dark:hover:bg-white/6"
            >
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

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {item.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-white/50">
                  {item.detail}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-white/30">
                  {currency} {formatPrice(item.price)} each
                  {item.quantity > 1
                    ? ` · Purchased: ${item.quantity}`
                    : null}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {!item.selected ? (
                  <>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {currency} {formatPrice(purchasedLine)}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-white/30">Line total</p>
                  </>
                ) : item.quantity === 1 ? (
                  <>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {currency} {formatPrice(returnSubtotal)}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-white/30">Returning</p>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums dark:text-white",
                        returning > 0 ? "text-slate-900" : "text-slate-400 dark:text-white/40",
                      )}
                    >
                      {returning > 0
                        ? `${currency} ${formatPrice(returnSubtotal)}`
                        : "—"}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-white/30">Return value</p>
                  </>
                )}
              </div>
            </button>

            {item.selected && item.quantity > 1 && (
              <div
                className="border-t border-slate-200/80 px-4 pb-4 pt-3 dark:border-white/10"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <p className="text-xs font-medium text-slate-700 dark:text-white/70">
                  How many are you returning?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from({ length: item.quantity }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReturnQuantity(item.id, n);
                      }}
                      className={cn(
                        "min-w-[44px] rounded-lg border px-3 py-2 text-sm font-semibold transition-all",
                        item.returnQuantity === n
                          ? "border-primary bg-primary text-white ring-1 ring-primary/30 dark:border-blue-400 dark:bg-blue-400"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-white/15 dark:bg-white/8 dark:text-white/85 dark:hover:border-white/25",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

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
