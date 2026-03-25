"use client";

import { Return } from "@/types/retailers";
import { ReturnsReview } from "./returns-review";
import { ReturnCards } from "./return-cards";

interface ResponsiveReturnsProps {
  returns: Return[];
  onApprove?: (returnId: string) => void;
  onReject?: (returnId: string, reason: string) => void;
}

export function ResponsiveReturns({
  returns,
  onApprove,
  onReject,
}: ResponsiveReturnsProps) {
  return (
    <>
      {/* Desktop: Show table */}
      <div className="hidden md:block">
        <ReturnsReview
          returns={returns}
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>

      {/* Mobile: Show cards */}
      <div className="md:hidden">
        <ReturnCards
          returns={returns}
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>
    </>
  );
}
