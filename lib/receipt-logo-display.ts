/**
 * Shared dimensions for retailer logos on receipt surfaces (digital + PDF).
 * Images use object-fit containment inside these boxes — aspect ratio is preserved.
 */
export const RECEIPT_LOGO_SLOT_PX = 48;

/** Header logo slot in PDF points (@react-pdf/renderer). */
export const RECEIPT_LOGO_PDF_PT = 36;

/** Fit natural logo dimensions inside a square PDF slot while preserving aspect ratio. */
export function fitReceiptLogoPdfDimensions(
  naturalWidth: number,
  naturalHeight: number,
  maxPt = RECEIPT_LOGO_PDF_PT,
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: maxPt, height: maxPt };
  }

  const scale = Math.min(maxPt / naturalWidth, maxPt / naturalHeight);
  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
  };
}
