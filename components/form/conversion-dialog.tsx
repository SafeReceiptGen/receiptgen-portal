"use client";

import * as React from "react";
import {
  Share2,
  Download,
  Check,
  Copy,
  ArrowRight,
  Save,
  Loader2,
} from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ReceiptData } from "@/types";
import { fetchReceiptLogoForPdf } from "@/lib/receipt-logo-pdf";
import { Checkbox } from "@/components/ui/checkbox";
import { Store, storesApi, SavedProduct } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pdf } from "@react-pdf/renderer";
import { ReceiptPDF } from "./receipt-pdf";
import { QRCodeCanvas } from "qrcode.react";

export default function ConversionDialog({
  onClose,
  imgUrl,
  qrCodeToken,
  receiptData,
  storeCatalog = [],
}: {
  onClose: () => void;
  imgUrl: string;
  qrCodeToken?: string;
  receiptData?: ReceiptData;
  storeCatalog?: Store["storeCatalog"];
}) {
  const [copied, setCopied] = React.useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const savableItems = React.useMemo(() => {
    if (!receiptData) return [];
    return receiptData.items.filter((item) => {
      if (!item.name && !item.price) return false;
      return !storeCatalog.some((catalogItem) => {
        const nameMatches = catalogItem.name === item.name;
        const descMatches =
          (catalogItem.description || "") === (item.detail || "");
        const priceMatches =
          Number(catalogItem.defaultPrice || 0) === Number(item.price);
        return nameMatches && descMatches && priceMatches;
      });
    });
  }, [receiptData, storeCatalog]);

  // States for saving line items
  const [selectedItems, setSelectedItems] = React.useState<string[]>(() =>
    savableItems.map((i) => i.id),
  );
  const [itemsSaved, setItemsSaved] = React.useState(false);

  const saveItemsMutation = useMutation({
    mutationFn: (
      productsToSave: Pick<
        SavedProduct,
        "name" | "description" | "defaultPrice"
      >[],
    ) => {
      if (!receiptData?.storeId) throw new Error("Missing storeId");
      return storesApi.addToCatalog(receiptData.storeId, productsToSave);
    },
    onMutate: async (productsToSave) => {
      await queryClient.cancelQueries({ queryKey: ["stores"] });
      const previousStores = queryClient.getQueryData<Store[]>(["stores"]);

      queryClient.setQueryData<Store[]>(["stores"], (old) => {
        if (!old) return old;
        return old.map((store) => {
          if (store.id === receiptData?.storeId) {
            const tempProducts: SavedProduct[] = productsToSave.map((p, i) => ({
              id: `temp-${Date.now()}-${i}`,
              name: p.name,
              description: p.description,
              defaultPrice: p.defaultPrice,
              createdAt: new Date(),
              updatedAt: new Date(),
              storeId: store.id,
            }));
            return {
              ...store,
              storeCatalog: [...store.storeCatalog, ...tempProducts],
            };
          }
          return store;
        });
      });

      return { previousStores };
    },
    onError: (err, newProducts, context) => {
      if (context?.previousStores) {
        queryClient.setQueryData(["stores"], context.previousStores);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
    onSuccess: () => {
      setItemsSaved(true);
    },
  });

  function copyLink() {
    if (!receiptData?.qrUrl) return;
    navigator.clipboard.writeText(receiptData.qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        if (receiptData) {
          // Share the URL if it was provided
          await navigator.share({
            title: "Your SafeReceipt",
            text: "Here is your digital receipt",
            // url: `${process.env.NEXT_PUBLIC_URL}/receipt/${qrCodeToken}`, --gotta pass the qrCodeToken well to component to use this
            url: receiptData.qrUrl,
          });
        } else {
          // Fallback to sharing the image if no URL is provided
          const blob = await (await fetch(imgUrl)).blob();
          const file = new File([blob], "receipt.png", { type: blob.type });
          await navigator.share({ title: "Receipt", files: [file] });
        }
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      // Fallback for browsers that don't support native share
      if (receiptData) {
        navigator.clipboard.writeText(receiptData.qrUrl).then(() => {
          alert("Sharing not supported. Link copied to clipboard instead!");
        });
      } else {
        alert("Sharing is not supported on this device/browser.");
      }
    }
  };

  const handleDownloadImage = () => {
    const link = document.createElement("a");
    link.download = `SafeReceipt-${Date.now()}.png`;
    link.href = imgUrl;
    link.click();
  };

  const qrCanvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleDownloadPDF = async () => {
    if (!receiptData) return;

    // Get QR Code data URL if canvas is rendered
    let qrDataUrl = undefined;
    if (qrCanvasRef.current) {
      qrDataUrl = qrCanvasRef.current.toDataURL("image/png");
    }

    let logoDataUrl: string | undefined;
    let logoWidthPt: number | undefined;
    let logoHeightPt: number | undefined;
    const logoTrim = receiptData.logoUrl?.trim();
    if (logoTrim) {
      const logoAsset = await fetchReceiptLogoForPdf(logoTrim);
      if (logoAsset) {
        logoDataUrl = logoAsset.dataUrl;
        logoWidthPt = logoAsset.width;
        logoHeightPt = logoAsset.height;
      }
    }

    try {
      const blob = await pdf(
        <ReceiptPDF
          data={receiptData}
          showQr={!!qrCodeToken}
          qrDataUrl={qrDataUrl}
          logoDataUrl={logoDataUrl}
          logoNaturalWidth={logoWidthPt}
          logoNaturalHeight={logoHeightPt}
        />,
      ).toBlob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `SafeReceipt-${Date.now()}.pdf`;
      link.click();
    } catch (e) {
      console.error("Failed to generate PDF", e);
    }
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleSaveItems = () => {
    if (!receiptData || selectedItems.length === 0) return;

    const itemsToSave = receiptData.items
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => ({
        name: item.name,
        description: item.detail || null,
        defaultPrice: String(item.price),
      }));

    saveItemsMutation.mutate(itemsToSave);
  };

  const dynamicQrUrl = qrCodeToken
    ? `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/receipt/${qrCodeToken}`
    : "";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-900 shadow-2xl sm:max-w-sm dark:border-white/10 dark:bg-[#071427] dark:text-white">
        {/* Render QRCodeCanvas hidden to extract its dataUrl for PDF generation */}
        {qrCodeToken && (
          <div style={{ display: "none" }}>
            <QRCodeCanvas
              value={dynamicQrUrl}
              size={160}
              level="M"
              fgColor="#18181b"
              ref={qrCanvasRef}
            />
          </div>
        )}

        {/* Top accent line */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-green-400/60 to-transparent dark:via-green-400/40" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/20">
              <Check
                className="size-4 text-green-500 dark:text-green-400"
                strokeWidth={2.5}
              />
            </span>
            <div>
              <p className="text-[15px] font-semibold leading-tight text-slate-900 dark:text-white">
                Receipt ready
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500 dark:text-white/50">
                What would you like to do?
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 px-6 pb-5">
          <ActionButton
            icon={<Share2 className="size-4" />}
            label="Share"
            onClick={handleShare}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-white/8 dark:bg-white/4 dark:text-white/60 dark:hover:border-white/15 dark:hover:bg-white/8 dark:hover:text-white">
                <Download className="size-4" />
                <span className="text-[12px] font-medium">Download</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40 rounded-xl">
              <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
                Download as:
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDownloadImage}
                className="cursor-pointer font-medium py-2"
              >
                Image
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownloadPDF}
                className="cursor-pointer font-medium py-2"
              >
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ActionButton
            icon={
              copied ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )
            }
            label={copied ? "Copied!" : "Copy Link"}
            onClick={copyLink}
          />
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-slate-100 dark:bg-white/8" />

        {/* Dynamic section based on authentication */}
        {!session ? (
          <div className="px-6 py-5">
            <p className="text-[13px] font-medium text-slate-700 dark:text-white/80">
              Keep your receipts organized
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-400 dark:text-white/40">
              Create a free account to save receipts, track returns, and access
              them from any device.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-[13px] text-slate-400 transition-colors hover:text-slate-600 dark:text-white/40 dark:hover:text-white/70"
              >
                Maybe later
              </button>
              <Button
                size="sm"
                onClick={() => router.push("/signup")}
                className="h-8 cursor-pointer rounded-full bg-blue-700 px-4 text-[13px] font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
              >
                Create free account
                <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            </div>
          </div>
        ) : receiptData && savableItems.length > 0 ? (
          <div className="px-6 py-5">
            <p className="text-[13px] font-medium text-slate-700 dark:text-white/80">
              Save reusable products
            </p>
            <p className="mt-1 mb-3 text-[12px] leading-relaxed text-slate-400 dark:text-white/40">
              Select product names to save to your store for quick receipt
              generation next time.
            </p>

            <div className="max-h-32 overflow-y-auto mb-4 space-y-2 pr-2">
              {savableItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleToggleItem(item.id)}
                    className="mt-0.5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-slate-600"
                  />
                  <label
                    htmlFor={`item-${item.id}`}
                    className="text-[13px] leading-tight text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200 block">
                      {item.name || "Unnamed Item"}
                    </span>
                    {item.detail && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {item.detail}
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>

            {saveItemsMutation.error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                <span className="font-semibold block mb-0.5">Save failed</span>
                <span className="opacity-90 leading-tight block">
                  {saveItemsMutation.error instanceof Error
                    ? saveItemsMutation.error.message
                    : "Failed to save products. Please try again."}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="h-8 rounded-full px-4 text-[13px] font-medium border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
              >
                Dashboard
              </Button>
              <Button
                size="sm"
                onClick={handleSaveItems}
                disabled={
                  saveItemsMutation.isPending ||
                  itemsSaved ||
                  selectedItems.length === 0
                }
                className="h-8 flex-1 cursor-pointer rounded-full bg-blue-700 px-4 text-[13px] font-medium text-white hover:bg-slate-700 disabled:bg-blue-700/60 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
              >
                {saveItemsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Saving...
                  </>
                ) : itemsSaved ? (
                  <>
                    <Check className="mr-1.5 size-3.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 size-3.5" />
                    Save Products
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 flex justify-end">
            <Button
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="h-8 cursor-pointer rounded-full bg-blue-700 px-4 text-[13px] font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
            >
              Go to dashboard
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-white/8 dark:bg-white/4 dark:text-white/60 dark:hover:border-white/15 dark:hover:bg-white/8 dark:hover:text-white"
    >
      {icon}
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  );
}
