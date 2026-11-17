"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  applyReceiptDay,
  applyReceiptTime,
  earliestReceiptDate,
  latestReceiptCalendarDay,
  receiptTimeValue,
} from "@/lib/receipt-datetime";
import { cn } from "@/lib/utils";

type ReceiptDateTimeFieldProps = {
  value: string;
  onChange: (iso: string) => void;
  variant?: "desktop" | "mobile";
};

export function ReceiptDateTimeField({
  value,
  onChange,
  variant = "desktop",
}: ReceiptDateTimeFieldProps) {
  const now = new Date();
  const parsed = value ? new Date(value) : undefined;
  const selected =
    parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined;
  const earliest = earliestReceiptDate(now);
  const today = latestReceiptCalendarDay(now);
  const isToday =
    selected != null &&
    selected.getFullYear() === now.getFullYear() &&
    selected.getMonth() === now.getMonth() &&
    selected.getDate() === now.getDate();
  const mobile = variant === "mobile";

  return (
    <div className={mobile ? "space-y-2" : "space-y-1.5"}>
      <Label
        className={
          mobile
            ? "text-sm text-slate-600 dark:text-white/70"
            : "text-xs font-medium text-slate-600 dark:text-white/60"
        }
      >
        Date and time
      </Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "min-w-0 flex-1 justify-start text-left font-normal bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-400 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white",
                mobile &&
                  "h-auto rounded-xl p-4 text-lg dark:text-white",
                !selected && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {selected ? (
                <span className="truncate">
                  {format(selected, "PPP 'at' p")}
                </span>
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selected}
              defaultMonth={selected ?? now}
              startMonth={earliest}
              endMonth={today}
              disabled={[{ before: earliest }, { after: today }]}
              onSelect={(day) => {
                if (!day) return;
                onChange(applyReceiptDay(day, value));
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          step={60}
          aria-label="Sale time"
          value={receiptTimeValue(value)}
          max={isToday ? receiptTimeValue(undefined, now) : undefined}
          onChange={(event) => onChange(applyReceiptTime(value, event.target.value))}
          className={cn(
            "w-[7.5rem] shrink-0 bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:[color-scheme:dark]",
            mobile && "h-auto rounded-xl px-3 py-4 text-lg",
          )}
        />
      </div>
      <p
        className={
          mobile
            ? "text-xs text-slate-500 dark:text-white/45"
            : "text-[11px] text-slate-500 dark:text-white/45"
        }
      >
        You can backdate up to 7 days. Set the sale time.
      </p>
    </div>
  );
}
