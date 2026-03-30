"use client";

import { sendGAEvent } from "@next/third-parties/google";

/**
 * Client-side GA4 helpers. Requires root layout {@link GoogleAnalytics} and
 * NEXT_PUBLIC_GA_MEASUREMENT_ID. No-ops when the ID is unset.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
  try {
    sendGAEvent("event", eventName, params ?? {});
  } catch {
    // ignore
  }
}

export function trackCtaClick(
  ctaId: string,
  extra?: Record<string, string | number | boolean>,
): void {
  trackEvent("cta_click", { cta_id: ctaId, ...extra });
}
