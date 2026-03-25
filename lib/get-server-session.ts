"use server";
import { headers } from "next/headers";
import type { Session } from "./auth-client";

export async function getServerSession(): Promise<Session | null> {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");

  // If there's no cookie, the user definitely isn't logged in
  if (!cookieHeader) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      {
        method: "GET",
        headers: {
          // Forward the exact cookie string to your Express backend
          cookie: cookieHeader,
        },
        // Ensure we don't cache this request, as sessions are dynamic
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const sessionData = await response.json();
    console.log(sessionData);
    return sessionData; // Returns { user, session }
  } catch (error) {
    console.error("Session fetch failed:", error);
    return null;
  }
}
