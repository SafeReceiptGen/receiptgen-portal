const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ReceiptLogoPdfAsset = {
  dataUrl: string;
  width: number;
  height: number;
};

/**
 * Loads a retailer logo for PDF embedding via the backend proxy.
 * Browser-side fetch of Supabase URLs fails CORS; stored logos are WebP, which
 * @react-pdf/renderer does not reliably render — the API returns PNG + dimensions.
 */
export async function fetchReceiptLogoForPdf(
  logoUrl: string,
): Promise<ReceiptLogoPdfAsset | null> {
  const trimmed = logoUrl?.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(
      `${API_URL}/uploads/retailer-logo/embed?url=${encodeURIComponent(trimmed)}`,
    );
    if (!res.ok) return null;

    const json = (await res.json()) as {
      success?: boolean;
      data?: ReceiptLogoPdfAsset;
    };
    const data = json.data;
    if (
      !data?.dataUrl?.startsWith("data:image/png;base64,") ||
      !Number.isFinite(data.width) ||
      !Number.isFinite(data.height)
    ) {
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Receipt PDF logo embed failed:", error);
    return null;
  }
}
