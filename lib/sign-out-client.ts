"use client";

import { authClient } from "@/lib/auth-client";

/**
 * Ends the Better Auth session then hard-navigates so session cookies and
 * Next.js server component cache are both cleared (client-only `router.push`
 * often leaves stale `getServerSession()` data).
 */
export async function signOutAndRedirect(destination = "/"): Promise<void> {
  try {
    await authClient.signOut();
  } catch (e) {
    console.error("Sign out request failed:", e);
  }
  if (typeof window !== "undefined") {
    window.location.assign(destination);
  }
}
