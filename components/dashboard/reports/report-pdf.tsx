import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrencyForPdf } from "@/lib/currency";
import type { ReportSummary } from "@/lib/api";
import {
  categorySalesSharePercent,
  formatSharePercent,
  isUncategorizedDominant,
} from "@/lib/report-insights";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 36,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 16,
  },
  insight: {
    fontSize: 11,
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  metric: {
    width: "48%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 5,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    paddingBottom: 4,
    marginBottom: 2,
  },
  cell: {
    fontSize: 9,
    flex: 1,
  },
  cellRight: {
    fontSize: 9,
    flex: 1,
    textAlign: "right",
  },
  muted: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#94a3b8",
  },
});

function money(n: number): string {
  return formatCurrencyForPdf(n, "GHS");
}

export function ReportPDF({
  data,
  title,
  rangeLabel,
  insight,
}: {
  data: ReportSummary;
  title: string;
  rangeLabel: string;
  insight: string;
}) {
  return (
    <Document title={title} author="SafeReceipts">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{rangeLabel}</Text>
        <Text style={styles.insight}>{insight}</Text>

        <View style={styles.grid}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Total sales</Text>
            <Text style={styles.metricValue}>{money(data.totals.totalSales)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Transaction count</Text>
            <Text style={styles.metricValue}>{data.totals.transactionCount}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Average transaction value</Text>
            <Text style={styles.metricValue}>
              {money(data.totals.avgTransactionValue)}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Units sold</Text>
            <Text style={styles.metricValue}>{data.totals.unitsSold}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top products</Text>
        {data.topProducts.length === 0 ? (
          <Text style={styles.muted}>No products sold in this range.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.cell}>Name / SKU</Text>
              <Text style={styles.cellRight}>Units</Text>
              <Text style={styles.cellRight}>Sales</Text>
            </View>
            {data.topProducts.map((product) => (
              <View key={`${product.sku ?? product.name}`} style={styles.row} wrap={false}>
                <Text style={styles.cell}>
                  {product.name}
                  {product.sku ? ` (${product.sku})` : ""}
                </Text>
                <Text style={styles.cellRight}>{product.units}</Text>
                <Text style={styles.cellRight}>{money(product.sales)}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Top categories</Text>
        {isUncategorizedDominant(data) ? (
          <Text style={styles.muted}>
            Most sales have no category. Assign one when adding catalog items
            or issuing receipts going forward.
          </Text>
        ) : data.hasUncategorized ? (
          <Text style={styles.muted}>
            Items without a category are shown as Uncategorized
          </Text>
        ) : null}
        {data.topCategories.length === 0 ? (
          <Text style={styles.muted}>No category data for this range.</Text>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.cell}>Category</Text>
              <Text style={styles.cellRight}>Units</Text>
              <Text style={styles.cellRight}>Sales</Text>
              <Text style={styles.cellRight}>Share</Text>
            </View>
            {data.topCategories.map((row) => (
              <View key={row.category} style={styles.row} wrap={false}>
                <Text style={styles.cell}>{row.category}</Text>
                <Text style={styles.cellRight}>{row.units}</Text>
                <Text style={styles.cellRight}>{money(row.sales)}</Text>
                <Text style={styles.cellRight}>
                  {formatSharePercent(
                    categorySalesSharePercent(
                      row.sales,
                      data.totals.totalSales,
                    ),
                  )}
                </Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Returns & exchanges</Text>
        <View style={styles.row}>
          <Text style={styles.cell}>Requests</Text>
          <Text style={styles.cellRight}>{data.returns.count}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Refund value</Text>
          <Text style={styles.cellRight}>{money(data.returns.value)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Exchanges</Text>
          <Text style={styles.cellRight}>{data.returns.exchanges}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Completed / refunded</Text>
          <Text style={styles.cellRight}>{data.returns.completed}</Text>
        </View>

        <Text style={styles.sectionTitle}>Customer activity</Text>
        <View style={styles.row}>
          <Text style={styles.cell}>Unique customers</Text>
          <Text style={styles.cellRight}>{data.customers.unique}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>New</Text>
          <Text style={styles.cellRight}>{data.customers.new}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Returning</Text>
          <Text style={styles.cellRight}>{data.customers.returning}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Loyalty activity</Text>
          <Text style={styles.cellRight}>Not available</Text>
        </View>

        {data.totals.otherCurrencyCount > 0 ? (
          <Text style={styles.muted}>
            {data.totals.otherCurrencyCount} receipt
            {data.totals.otherCurrencyCount === 1 ? "" : "s"} in other currencies
            excluded from GHS totals.
          </Text>
        ) : null}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `SafeReceipts report · Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
