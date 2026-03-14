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
    return `${currencyCode} ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }
}
