"use client";

import { ReturnItem } from "@/types/returns";
import { cn } from "@/lib/utils";
import { Check, Minus, Plus } from "lucide-react";

interface ItemSelectorProps {
  items: ReturnItem[];
  currency: string;
  onChange: (items: ReturnItem[]) => void;
  className?: string;
  /** Per-item field errors keyed by item id (e.g. returnQuantity). */
  itemErrors?: Record<string, string | undefined>;
}

function unitsReturning(item: ReturnItem): number {
  if (!item.selected) return 0;
  if (item.quantity === 1) return 1;
  return item.returnQuantity ?? 1;
}

/** Clamp return qty to the valid range [0, purchased]. */
function clampReturnQuantity(qty: number, purchased: number): number {
  if (!Number.isFinite(qty)) return 0;
  const max = Math.max(0, Math.trunc(purchased));
  return Math.min(max, Math.max(0, Math.trunc(qty)));
}

export function ItemSelector({
  items,
  currency,
  onChange,
  className,
  itemErrors,
}: ItemSelectorProps) {
  const toggleItem = (id: string) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const nextSelected = !item.selected;
        return {
          ...item,
          selected: nextSelected,
          returnQuantity: nextSelected ? 1 : undefined,
        };
      }),
    );
  };

  const setReturnQuantity = (id: string, qty: number) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const clamped = clampReturnQuantity(qty, item.quantity);
        return {
          ...item,
          selected: true,
          returnQuantity: clamped,
        };
      }),
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
        const returnSubtotal = item.selected
          ? item.price * returning
          : purchasedLine;
        const quantityError = itemErrors?.[item.id];

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
                    <p className="text-[10px] text-slate-400 dark:text-white/30">
                      Line total
                    </p>
                  </>
                ) : item.quantity === 1 ? (
                  <>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {currency} {formatPrice(returnSubtotal)}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-white/30">
                      Returning
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {currency} {formatPrice(returnSubtotal)}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-white/30">
                      Return value
                    </p>
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
                {(() => {
                  const rq = clampReturnQuantity(
                    item.returnQuantity ?? 1,
                    item.quantity,
                  );
                  const canDec = rq > 0;
                  const canInc = rq < item.quantity;
                  return (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease return quantity"
                          disabled={!canDec}
                          onClick={(e) => {
                            e.stopPropagation();
                            setReturnQuantity(item.id, rq - 1);
                          }}
                          className={cn(
                            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-slate-700 transition-colors",
                            canDec
                              ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-white/15 dark:bg-white/8 dark:text-white dark:hover:border-white/25 dark:hover:bg-white/12"
                              : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50 dark:border-white/8 dark:bg-white/4",
                          )}
                        >
                          <Minus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={item.quantity}
                          step={1}
                          value={rq}
                          aria-label="Return quantity"
                          aria-invalid={!!quantityError}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              setReturnQuantity(item.id, 0);
                              return;
                            }
                            const parsed = Number.parseInt(raw, 10);
                            setReturnQuantity(
                              item.id,
                              Number.isFinite(parsed) ? parsed : 0,
                            );
                          }}
                          className={cn(
                            "h-9 w-14 rounded-lg border bg-white text-center text-base font-semibold tabular-nums text-slate-900 outline-none transition-colors focus:border-primary dark:bg-white/8 dark:text-white dark:focus:border-blue-400",
                            quantityError
                              ? "border-red-400 dark:border-red-400/60"
                              : "border-slate-200 dark:border-white/15",
                          )}
                        />
                        <button
                          type="button"
                          aria-label="Increase return quantity"
                          disabled={!canInc}
                          onClick={(e) => {
                            e.stopPropagation();
                            setReturnQuantity(item.id, rq + 1);
                          }}
                          className={cn(
                            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-slate-700 transition-colors",
                            canInc
                              ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-white/15 dark:bg-white/8 dark:text-white dark:hover:border-white/25 dark:hover:bg-white/12"
                              : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50 dark:border-white/8 dark:bg-white/4",
                          )}
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <span className="ml-1 text-xs text-slate-500 dark:text-white/45">
                          max {item.quantity}
                        </span>
                      </div>
                      {quantityError && (
                        <p className="text-xs text-red-500 dark:text-red-400">
                          {quantityError}
                        </p>
                      )}
                    </div>
                  );
                })()}
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
