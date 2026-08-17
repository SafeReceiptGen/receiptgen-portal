import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ReceiptData } from "@/types";
import { ReceiptCard } from "@/components/receipt/receipt-card";
import { receiptDataToCardModel } from "@/lib/receipt-card-model";
import { portalPublicOrigin } from "@/lib/portal-public-url";

interface ReceiptPreviewProps {
  data: ReceiptData;
  ref: React.Ref<HTMLDivElement>;
  /** Only show QR when the user is authenticated and a real qrUrl exists from the server */
  showQr?: boolean;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  data,
  ref,
  showQr = false,
}) => {
  const model = useMemo(() => receiptDataToCardModel(data), [data]);

  const dynamicQrUrl = useMemo(() => {
    if (data.qrUrl?.trim()) return data.qrUrl.trim();
    if (data.qrCodeToken?.trim()) {
      return `${portalPublicOrigin()}/receipt/${data.qrCodeToken.trim()}`;
    }
    return "";
  }, [data.qrUrl, data.qrCodeToken]);

  const footerSlot = (
    <div className="w-full">
      {showQr && dynamicQrUrl ? (
        <div className="flex flex-col items-end gap-2">
          <p className="text-[10px] font-medium text-slate-500">
            Scan to view receipt or start a return
          </p>
          <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-2">
            <QRCodeSVG
              value={dynamicQrUrl}
              size={80}
              level="M"
              fgColor="#18181b"
            />
          </div>
        </div>
      ) : (
        <div className="ml-auto flex h-[96px] w-[96px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-2">
          <div className="grid grid-cols-3 gap-0.5 opacity-20">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-[2px] bg-slate-400 ${[0, 2, 6, 8].includes(i) ? "opacity-100" : "opacity-40"}`}
              />
            ))}
          </div>
          <p className="text-center text-[8px] font-medium uppercase leading-tight tracking-wide text-slate-400">
            QR on
            <br />
            sign in
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="custom-scrollbar flex h-full w-full items-start justify-center overflow-auto overscroll-contain p-8">
      {/*
          Wrapper for Screenshot Capture.
          We use id="receipt-capture-target" to identify this specific DOM node.
          The padding ensures the shadow is captured.
      */}
      <div id="receipt-capture-target" ref={ref} className="rounded-[24px] p-4">
        <div className="relative my-auto flex w-full min-w-[320px] max-w-[380px] flex-col filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.25)] transition-all duration-300">
          <ReceiptCard model={model} footerSlot={footerSlot} />
        </div>
      </div>
    </div>
  );
};
