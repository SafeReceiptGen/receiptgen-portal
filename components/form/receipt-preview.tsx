import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Grip, RotateCcw } from "lucide-react";
import { ReceiptData } from "@/types";

interface ReceiptPreviewProps {
  data: ReceiptData;
  ref: any;
  /** Only show QR when the user is authenticated and a real qrUrl exists from the server */
  showQr?: boolean;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  data,
  ref,
  showQr = false,
}) => {
  // Calculations
  const subtotal = useMemo(() => {
    return data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }, [data.items]);

  const vatAmount = subtotal * (data.vatRate / (100 + data.vatRate));
  const total = subtotal; // Assuming prices are inclusive based on the image logic

  // Format currency helper
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
    } catch (e) {
      return isoString;
    }
  };

  // Construct Policy String
  const returnWindowDisplay =
    data.returnWindow === "Custom"
      ? data.customReturnWindow
      : data.returnWindow;
  const hasPolicy = data.returnWindow !== "No returns";

  return (
    <div className="flex items-start justify-center w-full h-full p-8 overflow-auto overscroll-contain custom-scrollbar">
      {/* 
          Wrapper for Screenshot Capture. 
          We use id="receipt-capture-target" to identify this specific DOM node. 
          The padding ensures the shadow is captured.
      */}
      <div id="receipt-capture-target" ref={ref} className="p-4 rounded-[24px]">
        <div className="relative w-full max-w-[380px] min-w-[320px] flex flex-col filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.25)] my-auto transition-all duration-300">
          {/* TOP SECTION: HEADER */}
          {/* We mask the bottom corners to create the top half of the notches */}
          <div
            className="text-zinc-900 w-full rounded-t-[20px] p-8 pb-6 relative transition-all"
            style={{
              background:
                "radial-gradient(circle at bottom left, transparent 12px, #ffffff 12.5px) top left / 51% 100% no-repeat, radial-gradient(circle at bottom right, transparent 12px, #ffffff 12.5px) top right / 51% 100% no-repeat",
            }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                {/* <div className="p-1.5 bg-zinc-100 rounded-lg text-zinc-900">
                  <Grip size={24} strokeWidth={2.5} />
                </div> */}
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                    {data.storeName}
                  </h1>
                  <p className="text-zinc-500 text-sm">{data.storePhone}</p>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 text-right leading-tight">
                <p className="mb-0.5">Receipt {data.receiptNumber}</p>
                <p>{formatDate(data.date)}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl text-center font-bold mb-2">
                Thank you for your purchase
                {data.customerName ? `, ${data.customerName}` : ""}!
              </h2>
            </div>

            {/* Dashed Separator Line - positioned at bottom to align with notch center */}
            <div className="absolute bottom-0 left-[12px] right-[12px] border-b border-dashed border-zinc-300"></div>
          </div>

          {/* BOTTOM SECTION: BODY */}
          {/* We mask the top corners to create the bottom half of the notches */}
          <div
            className="text-zinc-900 w-full rounded-b-[20px] p-8 pt-6 relative flex flex-col transition-all"
            style={{
              background:
                "radial-gradient(circle at top left, transparent 12px, #ffffff 12.5px) bottom left / 51% 100% no-repeat, radial-gradient(circle at top right, transparent 12px, #ffffff 12.5px) bottom right / 51% 100% no-repeat",
            }}
          >
            {/* Line Items */}
            <div className="flex flex-col gap-6 mb-8 text-left">
              {data.items.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start text-xs">
                  <div className="w-4 pt-0.5 font-medium text-zinc-400">
                    {index + 1}.
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-zinc-900 w-2/3 leading-tight">
                        {item.name}
                      </span>
                      <span className="font-bold text-sm whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}{" "}
                        {data.currency}
                      </span>
                    </div>
                    <p className="text-zinc-500 mb-1 leading-normal">
                      {item.detail}
                    </p>
                    <div className="text-zinc-400">
                      {item.quantity} x {formatPrice(item.price)}{" "}
                      {data.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financials Block */}
            <div className="bg-zinc-100/80 rounded-lg p-4 mb-8">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold tracking-tight">
                  {formatPrice(total)} {data.currency}
                </span>
              </div>

              <div className="flex justify-between text-xs text-zinc-600 mb-1">
                <span>Payment method</span>
                <span className="font-medium">{data.paymentMethod}</span>
              </div>
            </div>

            {/* Footer / Return Policy */}
            <div className="flex items-start gap-4 mb-8 text-left">
              <div className="flex-1 pt-1">
                {/* Primary Content: Return Policy if exists, otherwise Marketing Text */}
                {hasPolicy ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <RotateCcw size={12} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Return Policy
                      </span>
                    </div>
                    <div className="text-sm font-semibold leading-snug text-zinc-800">
                      <span className="text-zinc-500">Window:</span>{" "}
                      {returnWindowDisplay} <br />
                      <span className="text-zinc-500">Condition:</span>{" "}
                      {data.returnCondition} <br />
                      <span className="text-zinc-500">Refund:</span>{" "}
                      {data.refundType}
                    </div>
                    {data.marketingText && (
                      <p className="text-[10px] text-zinc-500 italic mt-2 border-t border-zinc-200 pt-2">
                        "{data.marketingText}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold leading-snug text-zinc-800">
                      {data.marketingText}
                    </p>
                  </div>
                )}

                <p className="text-[10px] text-zinc-400 mt-3">
                  Scan for {hasPolicy ? "return" : "details"}
                </p>
              </div>
              {/* QR Code — only rendered when authenticated and a real URL exists */}
              {showQr ? (
                <div className="p-2 border border-zinc-200 rounded-lg bg-white shrink-0">
                  <QRCodeSVG
                    value={data.qrUrl || "https://getsafereceipts.com"}
                    size={80}
                    level="M"
                    fgColor="#18181b"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 shrink-0 w-[96px] h-[96px] gap-1.5">
                  <div className="grid grid-cols-3 gap-0.5 opacity-20">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-[2px] bg-zinc-400 ${[0, 2, 6, 8].includes(i) ? "opacity-100" : "opacity-40"}`}
                      />
                    ))}
                  </div>
                  <p className="text-[8px] text-zinc-400 text-center leading-tight font-medium tracking-wide uppercase">
                    QR on
                    <br />
                    sign in
                  </p>
                </div>
              )}
            </div>

            {/* Legal/Bottom */}
            <div className="flex justify-between items-end text-[9px] text-zinc-400 uppercase tracking-wide border-t border-zinc-100 pt-4 mt-auto">
              <div>
                <p>{data.companyName}</p>
                {/* <p>TIN: {data.tin}</p> */}
              </div>
              <div className="text-right">
                <p>Check receipt</p>
                <p className="text-blue-500 lowercase tracking-normal">
                  {data.website}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SafeReceipt Branding */}
        <div className="mt-4 text-[10px] text-zinc-500/50 text-center font-medium uppercase tracking-widest">
          Generated with{" "}
          <span className="font-bold text-zinc-400">SafeReceipt</span>
        </div>
      </div>
    </div>
  );
};
