"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

/** Fires once per full page load (not on client-side navigations remounting the tree). */
export function DashboardViewTracker() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent("view_dashboard", {});
  }, []);
  return null;
}
