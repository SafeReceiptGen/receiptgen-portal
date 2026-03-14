import { getReturnById } from "@/lib/mock-data";
import ReturnStatusClient from "@/components/returns/return-status-client";

export default async function ReturnStatusServerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = await params;
  const returnId = unwrappedParams.id;
  const returnData = getReturnById(returnId);

  return <ReturnStatusClient returnData={returnData} returnId={returnId} />;
}
