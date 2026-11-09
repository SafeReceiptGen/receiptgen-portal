import { cache } from "react";
import { cookies, headers } from "next/headers";
import type { Session } from "./auth-client";

type SessionCookie = {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  sameSite?: "lax" | "strict" | "none";
};

function parseSetCookie(header: string): SessionCookie | null {
  const [pair, ...attributes] = header.split(";").map((part) => part.trim());
  if (!pair) return null;
  const separator = pair.indexOf("=");
  if (separator <= 0) return null;

  const cookie: SessionCookie = {
    name: pair.slice(0, separator),
    value: pair.slice(separator + 1),
  };

  for (const attribute of attributes) {
    const [rawKey, ...rest] = attribute.split("=");
    const key = rawKey.toLowerCase();
    const attrValue = rest.join("=");
    if (key === "httponly") cookie.httpOnly = true;
    else if (key === "secure") cookie.secure = true;
    else if (key === "path" && attrValue) cookie.path = attrValue;
    else if (key === "domain" && attrValue) cookie.domain = attrValue;
    else if (key === "max-age") {
      const maxAge = Number(attrValue);
      if (Number.isFinite(maxAge)) cookie.maxAge = maxAge;
    } else if (key === "expires" && attrValue) {
      const expires = new Date(attrValue);
      if (!Number.isNaN(expires.getTime())) cookie.expires = expires;
    } else if (key === "samesite") {
      const sameSite = attrValue.toLowerCase();
      if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
        cookie.sameSite = sameSite;
      }
    }
  }

  return cookie;
}

async function persistSessionCookies(response: Response) {
  const setCookies = response.headers.getSetCookie?.() ?? [];
  if (setCookies.length === 0) return;

  try {
    const jar = await cookies();
    for (const header of setCookies) {
      const cookie = parseSetCookie(header);
      if (!cookie) continue;
      const { name, value, ...options } = cookie;
      jar.set(name, value, options);
    }
  } catch {
    // Server Component renders cannot always write cookies. Sign-in against
    // the API still stores the session cache cookie on the browser.
  }
}

async function fetchServerSession(
  disableCookieCache: boolean,
): Promise<Session | null> {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");

  // If there's no cookie, the user definitely isn't logged in
  if (!cookieHeader) return null;

  const cacheQuery = disableCookieCache ? "?disableCookieCache=true" : "";

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session${cacheQuery}`,
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

    await persistSessionCookies(response);

    if (!response.ok) {
      return null;
    }

    const sessionData = await response.json();
    return sessionData; // Returns { user, session }
  } catch (error) {
    console.error("Session fetch failed:", error);
    return null;
  }
}

export const getServerSession = cache(() => fetchServerSession(false));

/** Reads the user from the database, skipping Better Auth's short-lived session cookie. */
export const getFreshServerSession = cache(() => fetchServerSession(true));
