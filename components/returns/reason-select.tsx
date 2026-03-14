"use client";

import { ReturnReason, RETURN_REASON_LABELS } from "@/types/returns";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ShoppingBag,
  Heart,
  PackageX,
  HelpCircle,
} from "lucide-react";

const reasonIcons: Record<ReturnReason, React.ReactNode> = {
  DEFECTIVE: <AlertTriangle size={16} />,
  WRONG_ITEM: <ShoppingBag size={16} />,
  CHANGED_MIND: <Heart size={16} />,
  DAMAGED_IN_DELIVERY: <PackageX size={16} />,
  OTHER: <HelpCircle size={16} />,
};

interface ReasonSelectProps {
  reason: ReturnReason | "";
  description: string;
  onReasonChange: (reason: ReturnReason) => void;
  onDescriptionChange: (description: string) => void;
  className?: string;
}

export function ReasonSelect({
  reason,
  description,
  onReasonChange,
  onDescriptionChange,
  className,
}: ReasonSelectProps) {
  const reasons = Object.entries(RETURN_REASON_LABELS) as [
    ReturnReason,
    string,
  ][];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Reason select */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
          Why are you returning?
        </Label>
        <Select
          value={reason}
          onValueChange={(v) => onReasonChange(v as ReturnReason)}
        >
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-400 focus:ring-offset-0 focus:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white">
            <SelectValue placeholder="Select a reason…" />
          </SelectTrigger>
          <SelectContent>
            {reasons.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                <span className="flex items-center gap-2">
                  <span className="text-primary dark:text-blue-400">
                    {reasonIcons[value]}
                  </span>
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description textarea — always visible but optional */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
          Additional details{" "}
          <span className="text-slate-400 dark:text-white/30">(Optional)</span>
        </Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe the issue in more detail…"
          className="h-24 w-full resize-none bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-400 focus-visible:ring-offset-0 focus-visible:border-blue-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/20"
        />
      </div>
    </div>
  );
}
