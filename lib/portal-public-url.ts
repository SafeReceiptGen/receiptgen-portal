/**
 * Base origin for customer-facing receipt URLs: /receipt/{token}, QR codes, shares.
 *
 * We intentionally do **not** use `VERCEL_URL` here — that is always the current deployment
 * (including random preview hosts like *.vercel.app), so shared links would point at the wrong place.
 *
 * Resolution order:
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
