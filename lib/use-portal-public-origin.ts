"use client";

import { useSyncExternalStore } from "react";
import {
  currentPortalOrigin,
  portalPublicOrigin,
} from "@/lib/portal-public-url";

function subscribe(): () => void {
  return () => {};
}

/** Current SafeReceipts host in the browser. Server render keeps the canonical origin. */
export function usePortalPublicOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    currentPortalOrigin,
    portalPublicOrigin,
  );
}
