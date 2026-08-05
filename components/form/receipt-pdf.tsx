import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { ReceiptData } from "@/types";
import { fitReceiptLogoPdfDimensions } from "@/lib/receipt-logo-display";
import { formatPaymentMethodLabel, formatReceiptPaymentStatusLabel } from "@/lib/receipt-display-labels";
import {
  getLineItemDiscountTotals,
  isLineItemDiscounted,
} from "@/lib/discount";
import {
  balanceDueFrom,
  deriveReceiptPaymentStatus,
  roundMoney,
} from "@/lib/receipt-payment";
import { formatPaymentLedgerDetails } from "@/lib/payment-ledger-display";

// QR and retailer logo are embedded as raster data URLs from the receipt builder (`conversion-dialog`).

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
    color: "#18181b", // zinc-900 equivalent
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  storeLocation: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 4,
  },
  storePhone: {
    fontSize: 12,
    color: "#71717a", // zinc-500 equivalent
    marginTop: 4,
  },
  receiptInfo: {
    textAlign: "right",
    fontSize: 10,
    color: "#71717a",
  },
  thankYouText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d8", // zinc-300 equivalent
    borderBottomStyle: "dashed",
    marginVertical: 10,
  },
  itemsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  itemIndex: {
    width: 20,
    fontSize: 12,
    color: "#a1a1aa", // zinc-400 equivalent
  },
  itemDetails: {
    flex: 1,
  },
  itemNamePriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 12,
    fontWeight: "bold",
    width: "70%",
  },
  itemTotalPrice: {
    fontSize: 12,
    fontWeight: "bold",
  },
  itemDetailText: {
    fontSize: 10,
    color: "#71717a",
    marginTop: 2,
  },
  itemQtyPrice: {
    fontSize: 10,
    color: "#a1a1aa",
    marginTop: 2,
  },
  discountBreakdown: {
    marginTop: 2,
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 1,
  },
  discountLabel: {
    fontSize: 9,
    color: "#71717a",
  },
  discountValue: {
    fontSize: 9,
    color: "#71717a",
  },
  discountSavedLabel: {
    fontSize: 9,
    color: "#059669",
  },
  discountSavedValue: {
    fontSize: 9,
    color: "#059669",
  },
  financialsContainer: {
    backgroundColor: "#f4f4f5", // zinc-100 equivalent
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  paymentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentLabel: {
    fontSize: 10,
    color: "#52525b", // zinc-600 equivalent
  },
  paymentValue: {
    fontSize: 10,
    fontWeight: "medium",
  },
  paymentHistoryContainer: {
    marginBottom: 20,
  },
  paymentHistoryHeader: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#a1a1aa",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  paymentHistoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#f4f4f5",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  paymentHistoryAmount: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#27272a",
  },
  paymentHistoryDetails: {
    fontSize: 9,
    color: "#71717a",
    marginTop: 2,
  },
  paymentHistoryDate: {
    fontSize: 9,
    color: "#a1a1aa",
    textAlign: "right",
  },
  paymentHistoryNote: {
    fontSize: 9,
    color: "#71717a",
    marginTop: 4,
    lineHeight: 1.35,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  policyContainer: {
    flex: 1,
  },
  policyHeader: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#2563eb", // blue-600 equivalent
    marginBottom: 5,
  },
  policyText: {
    fontSize: 11,
    color: "#27272a", // zinc-800 equivalent
    lineHeight: 1.4,
  },
  policyLabel: {
    color: "#71717a",
  },
  marketingText: {
    fontSize: 10,
    color: "#71717a",
    fontStyle: "italic",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 5,
  },
  scanText: {
    fontSize: 10,
    fontWeight: "medium",
    color: "#71717a",
    marginTop: 15,
  },
  qrContainer: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 5,
    marginLeft: 10,
  },
  qrPlaceholderContainer: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 5,
    marginLeft: 10,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },
  qrPlaceholderText: {
    fontSize: 8,
    color: "#a1a1aa",
    textAlign: "center",
    textTransform: "uppercase",
  },
  legalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
    paddingTop: 15,
    marginTop: "auto",
  },
  legalText: {
    fontSize: 9,
    color: "#a1a1aa",
    textTransform: "uppercase",
  },
  websiteText: {
    fontSize: 9,
    color: "#3b82f6", // blue-500
    textTransform: "none",
  },
  brandingContainer: {
    marginTop: 20,
    textAlign: "center",
  },
  brandingText: {
    fontSize: 10,
    color: "#a1a1aa",
    textTransform: "uppercase",
  },
  brandingBold: {
    fontWeight: "bold",
  },
});

interface ReceiptPDFProps {
  data: ReceiptData;
  showQr?: boolean;
  qrDataUrl?: string; // Raster QR for PDF embedding
  /** Raster logo (PNG data URL from backend embed endpoint). */
  logoDataUrl?: string;
  logoNaturalWidth?: number;
  logoNaturalHeight?: number;
}

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({
  data,
  showQr = false,
  qrDataUrl,
  logoDataUrl,
  logoNaturalWidth,
  logoNaturalHeight,
}) => {
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal;
  const effectivePaid = roundMoney(data.amountPaid ?? total);
  const balanceDue = balanceDueFrom(total, effectivePaid);
  const paymentStatus = deriveReceiptPaymentStatus(total, effectivePaid);
  const payments =
    data.payments && data.payments.length > 0
      ? data.payments
      : effectivePaid > 0
        ? [
            {
              id: "provisional-initial-payment",
              amount: effectivePaid,
              paymentMethod: data.paymentMethod,
              reference: null,
              note: null,
              createdAt: data.date,
            },
          ]
        : [];

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return isoString;
    }
  };

  const formatPaymentDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const formatPaymentTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const returnWindowDisplay =
    data.returnWindow === "Custom"
      ? data.customReturnWindow
      : data.returnWindow;
  const hasPolicy = data.returnWindow !== "No returns";

  const logoDimensions =
    logoDataUrl &&
    logoNaturalWidth &&
    logoNaturalHeight &&
    logoNaturalWidth > 0 &&
    logoNaturalHeight > 0
      ? fitReceiptLogoPdfDimensions(logoNaturalWidth, logoNaturalHeight)
      : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            {logoDataUrl && logoDimensions ? (
              <Image
                src={logoDataUrl}
                style={{
                  width: logoDimensions.width,
                  height: logoDimensions.height,
                  marginRight: 8,
                }}
              />
            ) : null}
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.storeName}>{data.storeName}</Text>
              {(data.storeLocation ?? "").trim() &&
              (data.storeLocation ?? "").trim() !== data.storeName.trim() ? (
                <Text style={styles.storeLocation}>{data.storeLocation}</Text>
              ) : null}
              {data.storePhone ? (
                <Text style={styles.storePhone}>{data.storePhone}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.receiptInfo}>
            <Text>Receipt {data.receiptNumber}</Text>
            <Text>{formatDate(data.date)}</Text>
          </View>
        </View>

        <Text style={styles.thankYouText}>
          Thank you for your purchase
          {data.customerName ? `, ${data.customerName}` : ""}!
        </Text>

        <View style={styles.dashedLine} />

        {/* Items */}
        <View style={styles.itemsContainer}>
          {data.items.map((item, index) => {
            const originalPrice = item.originalPrice ?? item.price;
            const discounted = isLineItemDiscounted(originalPrice, item.price);
            const { originalTotal, paidTotal, savedTotal } =
              getLineItemDiscountTotals(
                originalPrice,
                item.price,
                item.quantity,
              );

            return (
              <View key={item.id} style={styles.itemRow} wrap={false}>
                <Text style={styles.itemIndex}>{index + 1}.</Text>
                <View style={styles.itemDetails}>
                  <View style={styles.itemNamePriceContainer}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemTotalPrice}>
                      {formatPrice(item.price * item.quantity)} {data.currency}
                    </Text>
                  </View>
                  {item.detail ? (
                    <Text style={styles.itemDetailText}>{item.detail}</Text>
                  ) : null}
                  {discounted ? (
                    <View style={styles.discountBreakdown}>
                      <View style={styles.discountRow}>
                        <Text style={styles.discountLabel}>Original Price</Text>
                        <Text style={styles.discountValue}>
                          {formatPrice(originalTotal)} {data.currency}
                        </Text>
                      </View>
                      <View style={styles.discountRow}>
                        <Text style={styles.discountLabel}>You Paid</Text>
                        <Text style={styles.discountValue}>
                          {formatPrice(paidTotal)} {data.currency}
                        </Text>
                      </View>
                      <View style={styles.discountRow}>
                        <Text style={styles.discountSavedLabel}>You Saved</Text>
                        <Text style={styles.discountSavedValue}>
                          {formatPrice(savedTotal)} {data.currency}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.itemQtyPrice}>
                      {item.quantity} x {formatPrice(item.price)} {data.currency}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Financials Block */}
        <View style={styles.financialsContainer} wrap={false}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatPrice(total)} {data.currency}
            </Text>
          </View>
          {paymentStatus !== "paid_in_full" ? (
            <>
              <View style={[styles.paymentContainer, { marginBottom: 4 }]}>
                <Text style={styles.paymentLabel}>Amount paid</Text>
                <Text style={styles.paymentValue}>
                  {formatPrice(effectivePaid)} {data.currency}
                </Text>
              </View>
              <View style={[styles.paymentContainer, { marginBottom: 8 }]}>
                <Text style={styles.paymentLabel}>Balance due</Text>
                <Text style={styles.paymentValue}>
                  {formatPrice(balanceDue)} {data.currency}
                </Text>
              </View>
            </>
          ) : null}
          <View style={[styles.paymentContainer, { marginBottom: 4 }]}>
            <Text style={styles.paymentLabel}>Payment status</Text>
            <Text style={styles.paymentValue}>
              {formatReceiptPaymentStatusLabel(paymentStatus)}
            </Text>
          </View>
          <View style={styles.paymentContainer}>
            <Text style={styles.paymentLabel}>Payment method</Text>
            <Text style={styles.paymentValue}>
              {formatPaymentMethodLabel(data.paymentMethod)}
            </Text>
          </View>
        </View>

        {payments.length > 0 ? (
          <View style={styles.paymentHistoryContainer}>
            <Text style={styles.paymentHistoryHeader}>Payment history</Text>
            {payments.map((payment) => (
              <View key={payment.id} style={styles.paymentHistoryRow} wrap={false}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.paymentHistoryAmount}>
                    {formatPrice(payment.amount)} {data.currency}
                  </Text>
                  <Text style={styles.paymentHistoryDetails}>
                    {formatPaymentLedgerDetails(payment)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.paymentHistoryDate}>
                    {formatPaymentDate(payment.createdAt)}
                  </Text>
                  <Text style={styles.paymentHistoryDate}>
                    {formatPaymentTime(payment.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
            <Text style={styles.paymentHistoryNote}>
              Every payment toward this receipt is recorded here so you can see
              a complete history of what has been received.
            </Text>
          </View>
        ) : null}

        {/* Footer / Return Policy */}
        <View style={styles.footerContainer} wrap={false}>
          <View style={styles.policyContainer}>
            {hasPolicy ? (
              <View>
                <Text style={styles.policyHeader}>Return Policy</Text>
                <Text style={styles.policyText}>
                  <Text style={styles.policyLabel}>Window:</Text>{" "}
                  {returnWindowDisplay}
                  {"\n"}
                  <Text style={styles.policyLabel}>Condition:</Text>{" "}
                  {data.returnCondition}
                  {"\n"}
                  <Text style={styles.policyLabel}>Refund:</Text>{" "}
                  {data.refundType}
                </Text>
                {data.marketingText ? (
                  <Text style={styles.marketingText}>
                    {`\u201c${data.marketingText}\u201d`}
                  </Text>
                ) : null}
              </View>
            ) : (
              <View>
                {data.marketingText ? (
                  <Text style={styles.policyText}>{data.marketingText}</Text>
                ) : null}
              </View>
            )}
            {hasPolicy && (
              <Text style={styles.scanText}>
                Scan to view receipt or start a return
              </Text>
            )}
          </View>
          {showQr && qrDataUrl ? (
            <Image src={qrDataUrl} style={styles.qrContainer} />
          ) : (
            <View style={styles.qrPlaceholderContainer}>
              <Text style={styles.qrPlaceholderText}>QR on{"\n"}sign in</Text>
            </View>
          )}
        </View>

        {/* Legal/Bottom */}
        <View style={styles.legalContainer} fixed>
          <View>
            <Text style={styles.legalText}>{data.companyName}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.legalText}>Check receipt</Text>
            <Text style={styles.websiteText}>{data.website}</Text>
          </View>
        </View>

        <View style={styles.brandingContainer} fixed>
          <Text style={styles.brandingText}>
            Generated with <Text style={styles.brandingBold}>SafeReceipt</Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
};
