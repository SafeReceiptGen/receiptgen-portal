import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const path = request.nextUrl.pathname;
  const authPaths = [
    "/login",
    "/signup",
    "/forgot-password", //TODO
    "/reset-password", // andd TODO as well
  ];
  const isAuthPath = authPaths.includes(path);
  // Define paths that require authentication
  const isProtectedRoute =
    path.startsWith("/dashboard") || path.startsWith("/onboarding");

  // Optimistic check for session cookie
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && sessionCookie) {
    const homeURL = new URL("/", request.url); // will change the home URL to dashboard soon
    return NextResponse.redirect(homeURL);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
