import { verifyApi, mapToReceiptForReturn, ApiRequestError } from "@/lib/api";
import ReturnRequestClient from "@/components/returns/return-request-client";
import { Package } from "lucide-react";
import Link from "next/link";

export default async function ReturnRequestServerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;
  const token = unwrappedParams.id;

  // Fetch receipt from the real backend via QR token
  let receipt;
  try {
    const { receipt: verified } = await verifyApi.getByToken(token);
    receipt = mapToReceiptForReturn(verified, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      receipt = null;
    } else {
      throw error;
    }
  }

  if (!receipt) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Package size={28} className="text-slate-400 dark:text-white/40" />
        <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Receipt Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-white/50">
          We couldn't find this receipt.
        </p>
        <Link
          href={`/receipt/${token}`}
          className="mt-4 text-sm font-medium text-primary hover:underline dark:text-blue-400"
        >
          Back to Receipt
        </Link>
      </div>
    );
  }

  return <ReturnRequestClient receipt={receipt} receiptId={token} />;
}
