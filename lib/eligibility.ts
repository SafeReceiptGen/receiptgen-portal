import { differenceInCalendarDays, startOfDay } from "date-fns";
import { ReceiptForReturn, ReturnRequest } from "@/types/returns";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type EligibilityResult = {
  eligible: boolean;
  daysRemaining: number;
  returnWindowDays: number;
  reason: string;
  alreadyReturnedItemIds: string[];
};

// ─── Utility ────────────────────────────────────────────────────────────────────

/**
 * Parses the return window string (e.g. "14 days", "7 days", "No returns")
 * and extracts the integer number of days. Returns null if unparseable.
 */
function parseReturnWindowDays(windowStr: string): number | null {
  if (!windowStr || windowStr.toLowerCase().includes("no return")) {
    return null;
  }
  const match = windowStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Determines whether a receipt is eligible for return, accounting for:
 *  - Non-returnable flag / "No returns" window
 *  - Unparseable custom return windows
 *  - Off-by-one (day N of N = last day, still eligible)
 *  - Timezone normalization (calendar-day math)
 *  - Future-dated purchases
 *  - Already-returned items
 */
export function checkEligibility(
  receipt: ReceiptForReturn,
  existingReturns: ReturnRequest[],
): EligibilityResult {
  // ── Edge Case 1: Non-returnable items ──────────────────────────────────────
  if (!receipt.isReturnable) {
    return {
      eligible: false,
      daysRemaining: 0,
      returnWindowDays: 0,
      reason: "This receipt is not eligible for returns per the store's policy.",
      alreadyReturnedItemIds: [],
    };
  }

  // ── Edge Case 2: Unparseable return window ─────────────────────────────────
  const windowDays = parseReturnWindowDays(receipt.returnWindow);
  if (windowDays === null) {
    return {
      eligible: false,
      daysRemaining: 0,
      returnWindowDays: 0,
      reason: "Unable to determine the return window. Please contact the store directly.",
      alreadyReturnedItemIds: [],
    };
  }

  // ── Edge Case 6: Already-returned items ────────────────────────────────────
  const returnedItemIds = existingReturns.flatMap((r) =>
    r.items.filter((i) => i.selected).map((i) => i.id),
  );
  const allItemIds = receipt.items.map((i) => i.id);
  const allItemsReturned =
    allItemIds.length > 0 && allItemIds.every((id) => returnedItemIds.includes(id));

  if (allItemsReturned) {
    return {
      eligible: false,
      daysRemaining: 0,
      returnWindowDays: windowDays,
      reason: "All items on this receipt have already been returned.",
      alreadyReturnedItemIds: returnedItemIds,
    };
  }

  // ── Core date calculation (Edge Cases 3, 4, 7) ─────────────────────────────
  const today = startOfDay(new Date());
  const purchaseDate = startOfDay(new Date(receipt.purchasedAt));
  const daysSincePurchase = differenceInCalendarDays(today, purchaseDate);

  // Edge Case 7: Future-dated purchase
  if (daysSincePurchase < 0) {
    return {
      eligible: true,
      daysRemaining: windowDays,
      returnWindowDays: windowDays,
      reason: `You have ${windowDays} days to return items from this receipt.`,
      alreadyReturnedItemIds: returnedItemIds,
    };
  }

  // Edge Case 3: Off-by-one — day N of N is still the last eligible day
  const daysRemaining = windowDays - daysSincePurchase;

  if (daysRemaining < 0) {
    const expiredDaysAgo = Math.abs(daysRemaining);
    return {
      eligible: false,
      daysRemaining: 0,
      returnWindowDays: windowDays,
      reason: `Return window expired ${expiredDaysAgo} day${expiredDaysAgo === 1 ? "" : "s"} ago.`,
      alreadyReturnedItemIds: returnedItemIds,
    };
  }

  if (daysRemaining === 0) {
    return {
      eligible: true,
      daysRemaining: 0,
      returnWindowDays: windowDays,
      reason: "Last day to return! Submit your request today.",
      alreadyReturnedItemIds: returnedItemIds,
    };
  }

  return {
    eligible: true,
    daysRemaining,
    returnWindowDays: windowDays,
    reason: `You have ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left to return items from this receipt.`,
    alreadyReturnedItemIds: returnedItemIds,
  };
}
