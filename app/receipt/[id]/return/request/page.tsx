import { getReceiptById } from "@/lib/mock-data";
import ReturnRequestClient from "@/components/returns/return-request-client";

export default async function ReturnRequestServerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;
  const receiptId = unwrappedParams.id;
  const receipt = getReceiptById(receiptId);

  return <ReturnRequestClient receipt={receipt} receiptId={receiptId} />;
}
