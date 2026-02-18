"use client";
import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
} from "@/components/ui/expandable-screen";
import { Download, LayoutDashboard, Share2, Sparkles } from "lucide-react";
import { ReceiptPreview } from "./receipt-preview";
import { INITIAL_RECEIPT_DATA, ReceiptData } from "@/types";
import { useRef, useState } from "react";
import { ReceiptForm } from "./receipt-form";
import html2canvas from "html2canvas-pro";
import ConversionDialog from "./conversion-dialog";
import { MobileWizard } from "./form-mobile";
import Image from "next/image";

export default function ReceiptFormScreen() {
  const [data, setData] = useState<ReceiptData>(INITIAL_RECEIPT_DATA);
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!receiptRef.current || !html2canvas) {
      console.error("Capture target or library not found");
      return;
    }

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      setGeneratedImageUrl(imgData);
      setShowConversionDialog(true);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Could not generate image. Please try again.");
    }
  };
  return (
    <ExpandableScreen
      layoutId="cta-card"
      triggerRadius="100px"
      contentRadius="24px"
      animationDuration={0.3}
    >
      <ExpandableScreenTrigger>
        <button className="rounded-full bg-[#0B2A4A] px-6 py-3 font-semibold text-white shadow-[0_18px_45px_rgba(11,42,74,0.35)] ring-1 ring-black/10 transition-colors hover:bg-[#10365F]">
          Create a Receipt
        </button>
      </ExpandableScreenTrigger>

      <ExpandableScreenContent
        className="bg-[#050B16] text-white shadow-2xl ring-1 ring-white/10"
        closeButtonClassName="text-white bg-white/5 hover:bg-white/10 ring-1 ring-white/10 backdrop-blur"
      >
        <>
          <MobileWizard
            data={data}
            ref={receiptRef}
            onChange={setData}
            onGenerate={handleGenerate}
          />
          <div className="relative hidden h-full w-full overflow-hidden md:flex">
            {/* Background atmosphere */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(59,130,246,0.18),transparent_50%),radial-gradient(900px_circle_at_80%_10%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(800px_circle_at_50%_100%,rgba(255,255,255,0.04),transparent_55%)]" />
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative z-10 flex h-full w-full min-w-0 gap-6 p-6 lg:p-8">
              {/* Left Panel: Configuration */}
              <div className="flex h-full w-[520px] max-w-[46%] min-w-0 flex-col overflow-hidden rounded-3xl bg-white/4 ring-1 ring-white/10 backdrop-blur">
                {/* Header */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src="/logo.jpg"
                      alt="SafeReceipt Logo"
                      width={24}
                      height={24}
                    />

                    <div className="leading-tight">
                      <div className="text-sm font-semibold tracking-tight text-white">
                        SafeReceipt
                      </div>
                      <div className="text-[11px] text-white/60">
                        Receipt builder
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-white/60 ring-1 ring-white/10">
                    v0.1.0
                  </div>
                </header>

                {/* Form */}
                <div className="min-h-0 flex-1">
                  <ReceiptForm data={data} onChange={setData} />
                </div>

                {/* Action Bar */}
                <div className="shrink-0 border-t border-white/10 p-4">
                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerate}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-b from-blue-500 to-blue-700 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(37,99,235,0.28)] ring-1 ring-white/10 transition-all hover:from-blue-400 hover:to-blue-700 active:scale-[0.99]"
                    >
                      <Sparkles size={16} className="opacity-95" />
                      Generate Receipt
                    </button>
                    <button className="flex items-center justify-center rounded-xl bg-white/5 px-4 text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/10">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel: Preview */}
              <div className="relative flex h-full min-w-0 flex-1 overflow-hidden rounded-3xl bg-linear-to-b from-white/6 to-white/2 ring-1 ring-white/10">
                {/* Ambient Light Effect */}
                <div className="pointer-events-none absolute top-[-18%] right-[-10%] h-[620px] w-[620px] rounded-full bg-blue-500/10 blur-[120px]" />
                <div className="pointer-events-none absolute bottom-[-12%] left-[8%] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-[110px]" />

                <div className="relative h-full w-full min-w-0">
                  <ReceiptPreview data={data} ref={receiptRef} />
                </div>
              </div>
            </div>
          </div>
          {showConversionDialog && (
            <ConversionDialog
              onClose={() => setShowConversionDialog(false)}
              imgUrl={generatedImageUrl}
            />
          )}
        </>
      </ExpandableScreenContent>
    </ExpandableScreen>
  );
}
