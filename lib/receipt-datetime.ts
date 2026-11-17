/** Retailers may backdate a sale to today and the previous 7 calendar days. */
export const RECEIPT_BACKDATE_DAYS = 7;

/** A slightly fast device clock can still submit a sale time of "now". */
export const RECEIPT_FUTURE_SKEW_MS = 5 * 60 * 1000;

export const RECEIPT_DATE_TOO_OLD_MESSAGE =
  "Receipts can only be backdated up to 7 days.";

export const RECEIPT_DATE_IN_FUTURE_MESSAGE =
  "Receipt time cannot be in the future.";

export const RECEIPT_DATE_INVALID_MESSAGE =
  "Date must be a valid date and time.";

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Local midnight on the oldest day a retailer may select. */
export function earliestReceiptDate(now = new Date()): Date {
  const start = startOfLocalDay(now);
  start.setDate(start.getDate() - RECEIPT_BACKDATE_DAYS);
  return start;
}

/** Local midnight today. Days after this are not selectable. */
export function latestReceiptCalendarDay(now = new Date()): Date {
  return startOfLocalDay(now);
}

function validDate(iso: string | undefined, fallback: Date): Date {
  if (!iso) return fallback;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** `HH:mm` for a controlled time input. Empty values show the current time. */
export function receiptTimeValue(iso: string | undefined, now = new Date()): string {
  const date = validDate(iso, now);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function atLocalTime(
  day: Date,
  hours: number,
  minutes: number,
): Date {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}

/**
 * Keep the sale's clock time when the calendar day changes.
 * DayPicker dates are local midnight, so this must not store 00:00.
 * A result after `now` is clamped to the current time.
 */
export function applyReceiptDay(
  day: Date,
  existingIso: string | undefined,
  now = new Date(),
): string {
  const clock = validDate(existingIso, now);
  const combined = atLocalTime(day, clock.getHours(), clock.getMinutes());
  if (combined.getTime() > now.getTime()) return now.toISOString();
  return combined.toISOString();
}

/** Apply an `HH:mm` time on the current sale day, clamping future times to now. */
export function applyReceiptTime(
  existingIso: string | undefined,
  timeHHmm: string,
  now = new Date(),
): string {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(timeHHmm.trim());
  if (!match) return validDate(existingIso, now).toISOString();

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return validDate(existingIso, now).toISOString();

  const day = validDate(existingIso, now);
  const combined = atLocalTime(day, hours, minutes);
  if (combined.getTime() > now.getTime()) return now.toISOString();
  return combined.toISOString();
}

/** Null when the value is empty (submit uses now) or inside the allowed window. */
export function receiptDateIssue(
  iso: string | undefined | null,
  now = new Date(),
): string | null {
  const raw = iso?.trim() ?? "";
  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return RECEIPT_DATE_INVALID_MESSAGE;
  if (parsed.getTime() > now.getTime() + RECEIPT_FUTURE_SKEW_MS) {
    return RECEIPT_DATE_IN_FUTURE_MESSAGE;
  }
  if (parsed.getTime() < earliestReceiptDate(now).getTime()) {
    return RECEIPT_DATE_TOO_OLD_MESSAGE;
  }
  return null;
}
