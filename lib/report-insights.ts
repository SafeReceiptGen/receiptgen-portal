import type { ReportSummary } from "@/lib/api";

export function salesDeltaPercent(summary: ReportSummary): number | null {
  const previous = summary.previousPeriod?.totalSales;
  if (previous == null || previous === 0) return null;
  return Math.round(((summary.totals.totalSales - previous) / previous) * 100);
}

export function reportSalesInsight(
  summary: ReportSummary,
  compareLabel: "last month" | "previous period" = "last month",
): string {
  if (!summary.previousPeriod) {
    return compareLabel === "last month"
      ? "No previous month to compare"
      : "No previous period to compare";
  }

  const delta = salesDeltaPercent(summary);
  if (delta == null) {
    return compareLabel === "last month"
      ? "No previous month to compare"
      : "No previous period to compare";
  }
  if (delta > 0) return `Sales up ${delta}% vs ${compareLabel}`;
  if (delta < 0) return `Sales down ${Math.abs(delta)}% vs ${compareLabel}`;
  return `Sales unchanged vs ${compareLabel}`;
}

export function formatSignedPercent(delta: number | null): string {
  if (delta == null) return "—";
  if (delta > 0) return `+${delta}%`;
  return `${delta}%`;
}

export function categorySalesSharePercent(
  sales: number,
  totalSales: number,
): number | null {
  if (totalSales <= 0) return null;
  return Math.round((sales / totalSales) * 100);
}

export function formatSharePercent(percent: number | null): string {
  if (percent == null) return "—";
  return `${percent}%`;
}

export function isUncategorizedLabel(category: string): boolean {
  return category.trim().toLowerCase() === "uncategorized";
}

export function isUncategorizedDominant(summary: ReportSummary): boolean {
  if (!summary.hasUncategorized) return false;
  if (summary.topCategories.length === 0) return true;
  return isUncategorizedLabel(summary.topCategories[0].category);
}
