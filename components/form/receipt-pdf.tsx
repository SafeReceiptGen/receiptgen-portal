import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { ReceiptData } from "@/types";
import { formatCurrencyForPdf } from "@/lib/currency";
import {
  getLineItemDiscountTotals,
  isLineItemDiscounted,
} from "@/lib/discount";
import { fitReceiptLogoPdfDimensions } from "@/lib/receipt-logo-display";
import {
  formatPaymentMethodLabel,
  formatReceiptPaymentStatusLabel,
  formatReceiptStatusLabel,
  formatReturnDeadline,
} from "@/lib/receipt-display-labels";
import { formatPaymentLedgerDetails } from "@/lib/payment-ledger-display";
import {
  computeReturnDeadline,
  receiptDataToCardModel,
} from "@/lib/receipt-card-model";
import type { ReceiptPaymentStatus } from "@/lib/receipt-payment";

// QR and retailer logo are embedded as raster data URLs from the receipt builder.

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 36,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brandBlock: {
    flex: 1,
    paddingRight: 12,
  },
  logo: {
    marginBottom: 10,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  storeMeta: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#047857",
    marginLeft: 4,
  },
  receiptInfo: {
    textAlign: "right",
  },
  receiptNumber: {
    fontSize: 11,
    color: "#64748b",
  },
  receiptDate: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 6,
  },
  centerBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#b45309",
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  paidPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 14,
  },
  paidDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  paidText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  thankYouText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0f172a",
  },
  dashedLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "dashed",
    marginVertical: 14,
  },
  itemsContainer: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  itemIndex: {
    width: 18,
    fontSize: 11,
    color: "#94a3b8",
  },
  itemDetails: {
    flex: 1,
  },
  itemNamePriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  itemName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    flex: 1,
    paddingRight: 8,
  },
  itemTotalPrice: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  itemDetailText: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 4,
  },
  itemQtyPrice: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 4,
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  discountBlock: {
    marginTop: 4,
  },
  discountQtyPrice: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 1,
  },
  discountQtyPriceSaved: {
    fontSize: 9,
    color: "#34d399",
    marginTop: 1,
  },
  discountLabel: {
    fontSize: 9,
    color: "#64748b",
  },
  discountSaved: {
    fontSize: 9,
    color: "#059669",
  },
  totalsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#475569",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  metaValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#334155",
  },
  balanceValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#b45309",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
    marginTop: 4,
  },
  ledgerSection: {
    marginBottom: 18,
  },
  ledgerTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#94a3b8",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  ledgerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  ledgerAmount: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  ledgerDetails: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  ledgerDate: {
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "right",
  },
  ledgerHelp: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 1.4,
  },
  policyBox: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  policyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  policyHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#1d4ed8",
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  policyBody: {
    fontSize: 10,
    color: "#334155",
    lineHeight: 1.45,
  },
  policyEmphasis: {
    fontWeight: "bold",
  },
  deadlineLabel: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 10,
  },
  deadlineValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 4,
  },
  policyMeta: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 6,
  },
  policyMetaValue: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  marketingText: {
    fontSize: 8,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#dbeafe",
    paddingTop: 6,
  },
  footerWithQr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  qrSide: {
    alignItems: "flex-end",
  },
  scanText: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 6,
    textAlign: "right",
  },
  qrContainer: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 5,
  },
  qrPlaceholderContainer: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 5,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  qrPlaceholderText: {
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
    textTransform: "uppercase",
  },
  brandFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 14,
    marginTop: 8,
  },
  brandSite: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748b",
    letterSpacing: 0.6,
  },
  brandTagline: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 3,
  },
  authentic: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#94a3b8",
    letterSpacing: 0.6,
  },
});

const PAYMENT_PILL: Record<
  ReceiptPaymentStatus,
  { bg: string; dot: string; text: string }
> = {
  paid_in_full: { bg: "#d1fae5", dot: "#10b981", text: "#047857" },
  partially_paid: { bg: "#fef3c7", dot: "#f59e0b", text: "#92400e" },
  unpaid: { bg: "#ffe4e6", dot: "#f43f5e", text: "#be123c" },
};

function ShieldCheckIcon({
  size = 12,
  color = "#059669",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <Path d="m9 12 2 2 4-4" stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

function RotateCcwIcon({
  size = 12,
  color = "#1d4ed8",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
      />
      <Path d="M3 3v5h5" stroke={color} strokeWidth={2.5} fill="none" />
    </Svg>
  );
}

interface ReceiptPDFProps {
  data: ReceiptData;
  showQr?: boolean;
  qrDataUrl?: string;
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
  const model = receiptDataToCardModel({
    ...data,
    returnDeadline:
      data.returnDeadline ??
      computeReturnDeadline(
        data.date,
        data.returnWindow,
        data.customReturnWindow,
      ),
  });

  const subtotal = model.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const hasPolicy = model.returnWindow !== "No returns";
  const returnDeadlineLabel = formatReturnDeadline(model.returnDeadline);
  const brandName = model.retailerName.trim() || "Store";
  const location = model.storeLocation?.trim();
  const showLocation = !!location && location !== brandName;
  const pill = PAYMENT_PILL[model.paymentStatus];
  const purchasedAt = new Date(model.purchasedAt);

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
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            {logoDataUrl && logoDimensions ? (
              <Image
                src={logoDataUrl}
                style={{
                  width: logoDimensions.width,
                  height: logoDimensions.height,
                  ...styles.logo,
                }}
              />
            ) : null}
            <Text style={styles.storeName}>{brandName}</Text>
            {showLocation ? (
              <Text style={styles.storeMeta}>{location}</Text>
            ) : null}
            <View style={styles.verifiedRow}>
              <ShieldCheckIcon />
              <Text style={styles.verifiedText}>Verified by SafeReceipts</Text>
            </View>
            {model.storePhone ? (
              <Text style={styles.storeMeta}>{model.storePhone}</Text>
            ) : null}
          </View>
          <View style={styles.receiptInfo}>
            <Text style={styles.receiptNumber}>
              Receipt No. {model.receiptNumber}
            </Text>
            <Text style={styles.receiptDate}>
              {format(purchasedAt, "MMM d, yyyy")}
            </Text>
            <Text style={styles.receiptDate}>
              {format(purchasedAt, "h:mm a")}
            </Text>
          </View>
        </View>

        <View style={styles.centerBlock}>
          {model.status && model.status !== "issued" ? (
            <Text style={styles.statusLabel}>
              {formatReceiptStatusLabel(model.status)}
            </Text>
          ) : null}
          <View style={[styles.paidPill, { backgroundColor: pill.bg }]}>
            <View style={[styles.paidDot, { backgroundColor: pill.dot }]} />
            <Text style={[styles.paidText, { color: pill.text }]}>
              {formatReceiptPaymentStatusLabel(model.paymentStatus)}
            </Text>
          </View>
          <Text style={styles.thankYouText}>
            Thank you for your purchase!
            {model.customerName ? `, ${model.customerName}` : ""}!
          </Text>
        </View>

        <View style={styles.dashedLine} />

        <View style={styles.itemsContainer}>
          {model.items.map((item, index) => {
            const originalPrice = item.originalPrice ?? item.price;
            const discounted = isLineItemDiscounted(originalPrice, item.price);
            const {
              originalUnit,
              saleUnit,
              savedUnit,
              originalTotal,
              paidTotal,
              savedTotal,
            } = getLineItemDiscountTotals(
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
                      {formatCurrencyForPdf(
                        item.price * item.quantity,
                        model.currency,
                      )}
                    </Text>
                  </View>
                  {item.detail ? (
                    <Text style={styles.itemDetailText}>{item.detail}</Text>
                  ) : null}
                  {discounted ? (
                    <View>
                      <View style={styles.discountBlock}>
                        <View style={styles.discountRow}>
                          <Text style={styles.discountLabel}>
                            Original Price
                          </Text>
                          <Text style={styles.discountLabel}>
                            {formatCurrencyForPdf(
                              originalTotal,
                              model.currency,
                            )}
                          </Text>
                        </View>
                        <Text style={styles.discountQtyPrice}>
                          {item.quantity} ×{" "}
                          {formatCurrencyForPdf(originalUnit, model.currency)}
                        </Text>
                      </View>
                      <View style={styles.discountBlock}>
                        <View style={styles.discountRow}>
                          <Text style={styles.discountLabel}>You Paid</Text>
                          <Text style={styles.discountLabel}>
                            {formatCurrencyForPdf(paidTotal, model.currency)}
                          </Text>
                        </View>
                        <Text style={styles.discountQtyPrice}>
                          {item.quantity} ×{" "}
                          {formatCurrencyForPdf(saleUnit, model.currency)}
                        </Text>
                      </View>
                      <View style={styles.discountBlock}>
                        <View style={styles.discountRow}>
                          <Text style={styles.discountSaved}>You Saved</Text>
                          <Text style={styles.discountSaved}>
                            {formatCurrencyForPdf(savedTotal, model.currency)}
                          </Text>
                        </View>
                        <Text style={styles.discountQtyPriceSaved}>
                          {item.quantity} ×{" "}
                          {formatCurrencyForPdf(savedUnit, model.currency)}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.itemQtyPrice}>
                      {item.quantity} ×{" "}
                      {formatCurrencyForPdf(item.price, model.currency)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.totalsBox} wrap={false}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrencyForPdf(subtotal, model.currency)}
            </Text>
          </View>
          {model.paymentStatus !== "paid_in_full" ? (
            <>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Amount paid</Text>
                <Text style={styles.metaValue}>
                  {formatCurrencyForPdf(model.amountPaid, model.currency)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Balance due</Text>
                <Text style={styles.balanceValue}>
                  {formatCurrencyForPdf(model.balanceDue, model.currency)}
                </Text>
              </View>
            </>
          ) : null}
          <View style={styles.paymentRow}>
            <Text style={styles.metaLabel}>Payment method</Text>
            <Text style={styles.metaValue}>
              {formatPaymentMethodLabel(model.paymentMethod)}
            </Text>
          </View>
        </View>

        {model.payments.length > 0 ? (
          <View style={styles.ledgerSection} wrap={false}>
            <Text style={styles.ledgerTitle}>Payment history</Text>
            {model.payments.map((payment) => (
              <View key={payment.id} style={styles.ledgerRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.ledgerAmount}>
                    {formatCurrencyForPdf(payment.amount, model.currency)}
                  </Text>
                  <Text style={styles.ledgerDetails}>
                    {formatPaymentLedgerDetails(payment)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.ledgerDate}>
                    {format(new Date(payment.createdAt), "MMM d, yyyy")}
                  </Text>
                  <Text style={styles.ledgerDate}>
                    {format(new Date(payment.createdAt), "h:mm a")}
                  </Text>
                </View>
              </View>
            ))}
            <Text style={styles.ledgerHelp}>
              Every payment toward this receipt is recorded here so you can see
              a complete history of what has been received.
            </Text>
          </View>
        ) : null}

        {hasPolicy ? (
          <View style={styles.policyBox} wrap={false}>
            <View style={styles.policyHeader}>
              <RotateCcwIcon />
              <Text style={styles.policyHeaderText}>Return Policy</Text>
            </View>
            <Text style={styles.policyBody}>
              You can request a return within{" "}
              <Text style={styles.policyEmphasis}>
                {model.returnWindow || "7 days"}
              </Text>{" "}
              of purchase.
            </Text>
            {returnDeadlineLabel ? (
              <>
                <Text style={styles.deadlineLabel}>
                  Return window closes on:
                </Text>
                <Text style={styles.deadlineValue}>{returnDeadlineLabel}</Text>
              </>
            ) : null}
            {model.returnCondition !== "See store policy" ? (
              <Text style={styles.policyMeta}>
                Condition:{" "}
                <Text style={styles.policyMetaValue}>
                  {model.returnCondition}
                </Text>
              </Text>
            ) : null}
            {model.refundType !== "See store policy" ? (
              <Text style={styles.policyMeta}>
                Refund:{" "}
                <Text style={styles.policyMetaValue}>{model.refundType}</Text>
              </Text>
            ) : null}
            {model.marketingText?.trim() ? (
              <Text style={styles.marketingText}>
                {`\u201c${model.marketingText.trim()}\u201d`}
              </Text>
            ) : null}
          </View>
        ) : model.marketingText?.trim() ? (
          <Text style={[styles.policyBody, { marginBottom: 18 }]}>
            {model.marketingText.trim()}
          </Text>
        ) : null}

        <View style={styles.footerWithQr} wrap={false}>
          <View style={{ flex: 1 }} />
          <View style={styles.qrSide}>
            {showQr && qrDataUrl ? (
              <>
                <Text style={styles.scanText}>
                  Scan to view receipt or start a return
                </Text>
                <Image src={qrDataUrl} style={styles.qrContainer} />
              </>
            ) : (
              <View style={styles.qrPlaceholderContainer}>
                <Text style={styles.qrPlaceholderText}>
                  QR on{"\n"}sign in
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.brandFooter} fixed>
          <View>
            <Text style={styles.brandSite}>GETSAFERECEIPTS.COM</Text>
            <Text style={styles.brandTagline}>
              Securely verified and stored
            </Text>
          </View>
          <Text style={styles.authentic}>AUTHENTIC RECORD</Text>
        </View>
      </Page>
    </Document>
  );
};
