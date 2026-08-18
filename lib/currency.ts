function formatAmount(amount: number): string {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatCurrency(amount: number, currencyCode: string = "GHS", locale: string = "en-GH"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if formatting fails (e.g. invalid currency code)
    return `${currencyCode} ${formatAmount(amount)}`;
  }
}

/**
 * Helvetica (the PDF built-in font) cannot draw the Ghana Cedi sign ₵
 * (U+20B5). @react-pdf/renderer then emits the low byte 0xB5, which is µ.
 * ISO codes stay in Latin-1 so amounts render as "GHS 70.00".
 */
export function formatCurrencyForPdf(
  amount: number,
  currencyCode: string = "GHS",
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace(/\u00A0/g, " ");
  } catch {
    return `${currencyCode} ${formatAmount(amount)}`;
  }
}
