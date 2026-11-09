/**
 * Base origin for customer-facing receipt URLs: /receipt/{token}, QR codes, shares.
 *
 * We intentionally do **not** use `VERCEL_URL` here — that is always the current deployment
 * (including random preview hosts like *.vercel.app), so shared links would point at the wrong place.
 *
 * `portalPublicOrigin()` is the baked-in canonical origin (production, unless overridden).
 * Callers that run while someone is already on a SafeReceipts host — including
 * testing.getsafereceipts.com — should prefer `originForPortalHost` / `currentPortalOrigin`
 * so a testing session does not jump to production.
 *
 * Canonical resolution order:
 * 1. NEXT_PUBLIC_URL / NEXT_PUBLIC_APP_URL
 * 2. NEXT_PUBLIC_RECEIPT_VIEWER_ORIGIN — optional, receipt-only canonical base
 * 3. VERCEL_PROJECT_PRODUCTION_URL — production hostname Vercel associates with the project
 * 4. On Vercel (`VERCEL=1`) with nothing above: DEFAULT_RECEIPT_VIEWER_ORIGIN (matches app/layout metadataBase)
 * 5. Local dev: http://localhost:3000
 */
const DEFAULT_RECEIPT_VIEWER_ORIGIN = "https://getsafereceipts.com";

export function portalPublicOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const receiptOnly = process.env.NEXT_PUBLIC_RECEIPT_VIEWER_ORIGIN?.trim();
  if (receiptOnly) return receiptOnly.replace(/\/$/, "");

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    const host = productionHost.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  // Any Vercel build (preview or prod) — never use VERCEL_URL for customer links.
  if (process.env.VERCEL === "1") {
    return DEFAULT_RECEIPT_VIEWER_ORIGIN;
  }

  return "http://localhost:3000";
}

function isPortalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "getsafereceipts.com" ||
    hostname.endsWith(".getsafereceipts.com")
  );
}

/** Origin for a request host when it is this product. Ephemeral *.vercel.app hosts are ignored. */
export function originForPortalHost(
  hostHeader: string | null | undefined,
  protoHeader: string | null | undefined,
): string | null {
  const host = hostHeader?.split(",")[0]?.trim();
  if (!host) return null;

  const hostname = host.replace(/:\d+$/, "").toLowerCase();
  if (!isPortalHostname(hostname)) return null;

  const local = hostname === "localhost" || hostname === "127.0.0.1";
  const protoRaw = protoHeader?.split(",")[0]?.trim().replace(/:$/, "");
  const proto = local
    ? "http"
    : protoRaw === "http" || protoRaw === "https"
      ? protoRaw
      : "https";

  return `${proto}://${host}`;
}

/** Browser origin when the tab is already on a SafeReceipts host or localhost. */
export function currentPortalOrigin(): string {
  if (typeof window === "undefined") return portalPublicOrigin();
  return (
    originForPortalHost(
      window.location.host,
      window.location.protocol.replace(/:$/, ""),
    ) ?? portalPublicOrigin()
  );
}

/** Keep the path, but point a SafeReceipts URL at `origin`. Other hosts are left alone. */
export function rewritePortalUrl(absoluteUrl: string, origin: string): string {
  try {
    const url = new URL(absoluteUrl);
    if (!originForPortalHost(url.host, url.protocol.replace(/:$/, ""))) {
      return absoluteUrl;
    }
    return `${origin}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return absoluteUrl;
  }
}
